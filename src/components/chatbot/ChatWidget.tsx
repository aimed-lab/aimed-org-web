"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Mic,
  MicOff,
  Loader2,
  Bot,
  User,
  Paperclip,
  ImageIcon,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string; // data URL for uploaded image
}

const GREETING: Message = {
  id: "greeting",
  role: "assistant",
  content:
    "Hi! I'm the AI.MED Lab assistant. I can help you find publications, learn about our research, or answer questions about the lab. What would you like to know?",
};

function renderMarkdown(text: string) {
  return text.split("\n").map((line, i) => {
    let html = line
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-emerald-600 dark:text-emerald-400 underline">$1</a>'
      );
    if (line.startsWith("• ")) {
      html = `<li class="ml-4 list-disc">${html.slice(2)}</li>`;
    }
    return (
      <span key={i} dangerouslySetInnerHTML={{ __html: html + (i < text.split("\n").length - 1 ? "<br/>" : "") }} />
    );
  });
}

/* Custom AI chat icon — brain/circuit style */
function AiChatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Outer ring */}
      <circle cx="24" cy="24" r="22" stroke="currentColor" strokeWidth="2" opacity="0.3" />
      {/* Brain/neural paths */}
      <path d="M16 18c0-3 2-5 5-5s5 2 5 5c0 2-1 3-2 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 35c3 0 5-2 5-5s-2-5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M26 18c3 0 6 2 6 5s-3 5-6 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* AI text */}
      <text x="14" y="29" fontFamily="Inter, system-ui, sans-serif" fontSize="12" fontWeight="700" fill="currentColor" letterSpacing="1">AI</text>
      {/* Neural dots */}
      <circle cx="14" cy="16" r="1.5" fill="currentColor" opacity="0.6" />
      <circle cx="34" cy="16" r="1.5" fill="currentColor" opacity="0.6" />
      <circle cx="34" cy="32" r="1.5" fill="currentColor" opacity="0.6" />
      <circle cx="14" cy="32" r="1.5" fill="currentColor" opacity="0.6" />
      {/* Connecting lines */}
      <line x1="14" y1="16" x2="18" y2="18" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <line x1="34" y1="16" x2="30" y2="18" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <line x1="34" y1="32" x2="30" y2="28" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      <line x1="14" y1="32" x2="18" y2="28" stroke="currentColor" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [pastedImage, setPastedImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  }, []);

  useEffect(scrollToBottom, [messages, scrollToBottom]);

  const sendMessage = useCallback(
    async (text: string, image?: string) => {
      if (!text.trim() && !image) return;
      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: text.trim() || (image ? "[Image]" : ""),
        image,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setPastedImage(null);
      setLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              ...messages.filter((m) => m.id !== "greeting"),
              { role: "user", content: text.trim() + (image ? " [image attached]" : "") },
            ],
          }),
        });
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { id: (Date.now() + 1).toString(), role: "assistant", content: data.reply ?? "Sorry, I couldn't process that." },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { id: (Date.now() + 1).toString(), role: "assistant", content: "Sorry, something went wrong. Please try again." },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [messages]
  );

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        sendMessage(input || `[Uploaded image: ${file.name}]`, dataUrl);
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    [input, sendMessage]
  );

  // Handle paste events for images/screenshots
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (!file) continue;
          const reader = new FileReader();
          reader.onload = () => {
            const dataUrl = reader.result as string;
            setPastedImage(dataUrl);
          };
          reader.readAsDataURL(file);
          return;
        }
      }
    },
    []
  );

  // Handle drag & drop images
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer?.files?.[0];
      if (!file || !file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setPastedImage(dataUrl);
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const toggleVoice = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + (prev ? " " : "") + transcript);
      setListening(false);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }, [listening]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input, pastedImage ?? undefined);
    }
  };

  const handleSend = () => {
    sendMessage(input, pastedImage ?? undefined);
  };

  return (
    <>
      {/* Floating button — AI icon with pulse ring */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl hover:shadow-2xl hover:from-emerald-600 hover:to-teal-700 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 group"
            aria-label="Open AI chat assistant"
          >
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-0 group-hover:opacity-20 animate-ping" />
            <AiChatIcon className="h-9 w-9 relative z-10" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 flex flex-col w-[400px] max-w-[calc(100vw-48px)] h-[560px] max-h-[calc(100vh-100px)] rounded-2xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                <AiChatIcon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold">AI.MED Lab Assistant</h3>
                <p className="text-[10px] text-emerald-100">Powered by AI &middot; Public info only</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 mt-0.5">
                      <Bot className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-emerald-600 text-white rounded-br-sm"
                        : "bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-slate-200 rounded-bl-sm"
                    }`}
                  >
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="Uploaded"
                        className="mb-2 max-h-32 rounded-lg object-cover"
                      />
                    )}
                    <div className="whitespace-pre-wrap">{renderMarkdown(msg.content)}</div>
                  </div>
                  {msg.role === "user" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 mt-0.5">
                      <User className="h-3.5 w-3.5 text-white" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-2 items-center">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                    <Bot className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
                  </div>
                  <div className="rounded-xl bg-slate-100 dark:bg-zinc-800 px-3 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                  </div>
                </div>
              )}
            </div>

            {/* Pasted image preview */}
            {pastedImage && (
              <div className="shrink-0 border-t border-slate-200 dark:border-zinc-700 px-3 py-2 bg-slate-50 dark:bg-zinc-800/50">
                <div className="flex items-center gap-2">
                  <img src={pastedImage} alt="Pasted" className="h-12 w-12 rounded-lg object-cover border border-slate-200 dark:border-zinc-600" />
                  <div className="flex-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <ImageIcon className="h-3 w-3" />
                    Image attached
                  </div>
                  <button
                    onClick={() => setPastedImage(null)}
                    className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    aria-label="Remove image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Input */}
            <div className="shrink-0 border-t border-slate-200 dark:border-zinc-700 p-3">
              <div className="flex items-end gap-2">
                {/* Attachment buttons */}
                <div className="flex gap-1 shrink-0">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                    title="Upload image"
                    aria-label="Upload image"
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <button
                    onClick={toggleVoice}
                    className={`p-1.5 rounded-lg transition-colors ${
                      listening
                        ? "text-red-500 bg-red-50 dark:bg-red-900/20 animate-pulse"
                        : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                    }`}
                    title={listening ? "Stop recording" : "Voice input"}
                    aria-label={listening ? "Stop recording" : "Voice input"}
                  >
                    {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>
                </div>

                {/* Text input */}
                <div className="flex-1 relative">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    placeholder="Ask anything, or paste an image..."
                    rows={1}
                    className="w-full resize-none rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 px-3 py-2 pr-10 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    style={{ maxHeight: 80 }}
                  />
                </div>

                {/* Send */}
                <button
                  onClick={handleSend}
                  disabled={(!input.trim() && !pastedImage) || loading}
                  className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
