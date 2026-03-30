import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:focus-visible:ring-offset-zinc-950",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-700 text-white shadow hover:bg-emerald-800 dark:bg-emerald-700 dark:hover:bg-emerald-600",
        secondary:
          "bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-200 dark:bg-zinc-800 dark:text-slate-100 dark:hover:bg-zinc-700",
        outline:
          "border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-slate-100 dark:hover:bg-zinc-800",
        ghost:
          "text-slate-900 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-zinc-800",
        link: "text-emerald-700 underline-offset-4 hover:underline dark:text-emerald-400",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
