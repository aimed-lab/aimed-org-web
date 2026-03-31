import type { Metadata } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ChatWidget } from "@/components/chatbot/ChatWidget"
import "./globals.css"

const GA_ID = "G-S5JM02Y0GJ"

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: {
    default: "AI.MED Lab — Jake Y. Chen | AI Drug Discovery & Biomedical Informatics at UAB",
    template: "%s | AI.MED Lab — Jake Y. Chen",
  },
  description:
    "AI.MED Lab led by Prof. Jake Y. Chen at UAB. Pioneering AI-driven drug discovery, bioinformatics, systems pharmacology, precision medicine, and computational biology. 200+ publications in biomedical AI and network biology.",
  keywords: [
    "AI drug discovery", "bioinformatics", "Jake Chen", "Jake Y. Chen", "Chen Lab",
    "Chen Bioinformatics", "AI for medicine", "AI for science", "biomedical informatics",
    "systems pharmacology", "computational drug discovery", "precision medicine",
    "network biology", "AI.MED Lab", "UAB", "University of Alabama at Birmingham",
    "drug target discovery", "multi-omics AI", "digital twin", "knowledge networks",
    "PAGER", "BEERE", "HAPPI", "GeneTerrain", "SPARC",
  ],
  authors: [{ name: "Jake Y. Chen", url: "https://aimed-lab.org" }],
  creator: "AI.MED Lab",
  publisher: "University of Alabama at Birmingham",
  metadataBase: new URL("https://aimed-lab.org"),
  alternates: {
    canonical: "https://aimed-lab.org",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://aimed-lab.org",
    siteName: "AI.MED Lab",
    title: "AI.MED Lab — Jake Y. Chen | AI Drug Discovery & Biomedical Informatics",
    description:
      "Pioneering AI-driven drug discovery, bioinformatics, systems pharmacology, and precision medicine at the University of Alabama at Birmingham. Led by Prof. Jake Y. Chen.",
    images: [{ url: "/jake-chen-headshot.jpg", width: 800, height: 800, alt: "Prof. Jake Y. Chen" }],
  },
  twitter: {
    card: "summary",
    title: "AI.MED Lab — Jake Y. Chen",
    description: "AI-driven drug discovery, bioinformatics, and precision medicine at UAB",
    images: ["/jake-chen-headshot.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add Google Search Console verification code here when available
    // google: "YOUR_VERIFICATION_CODE",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <head>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ResearchOrganization",
              name: "AI.MED Lab",
              alternateName: ["Chen Lab", "Chen Bioinformatics Lab", "SPARC", "Systems Pharmacology AI Research Center"],
              url: "https://aimed-lab.org",
              logo: "https://aimed-lab.org/jake-chen-headshot.jpg",
              description: "AI-driven drug discovery, bioinformatics, systems pharmacology, and precision medicine research lab at the University of Alabama at Birmingham.",
              foundingDate: "2016",
              founder: {
                "@type": "Person",
                name: "Jake Y. Chen",
                givenName: "Jake",
                familyName: "Chen",
                jobTitle: "Triton Endowed Professor of Biomedical Informatics and Data Science",
                affiliation: {
                  "@type": "EducationalOrganization",
                  name: "University of Alabama at Birmingham",
                },
                url: "https://aimed-lab.org",
                sameAs: [
                  "https://scholar.google.com/citations?user=VM9ziaEAAAAJ",
                  "https://orcid.org/0000-0001-8829-7504",
                  "https://github.com/aimed-lab",
                ],
              },
              parentOrganization: {
                "@type": "EducationalOrganization",
                name: "University of Alabama at Birmingham",
                url: "https://www.uab.edu",
              },
              knowsAbout: [
                "Artificial Intelligence in Drug Discovery",
                "Bioinformatics",
                "Systems Pharmacology",
                "Precision Medicine",
                "Network Biology",
                "Computational Biology",
                "Multi-omics",
                "Knowledge Networks",
                "Digital Twin Simulations",
              ],
            }),
          }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-screen flex flex-col antialiased bg-white dark:bg-zinc-950 text-slate-900 dark:text-slate-100 font-sans">
        <ThemeProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <ChatWidget />
        </ThemeProvider>
      </body>
    </html>
  )
}
