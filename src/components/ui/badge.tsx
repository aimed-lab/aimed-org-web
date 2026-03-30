import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-emerald-700 text-white shadow hover:bg-emerald-800",
        secondary:
          "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-zinc-800 dark:text-slate-100 dark:hover:bg-zinc-700",
        outline:
          "border-slate-200 text-slate-900 dark:border-zinc-800 dark:text-slate-100",
        destructive:
          "border-transparent bg-red-500 text-white shadow hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant }), className)}
        {...props}
      />
    )
  }
)
Badge.displayName = "Badge"

export { Badge, badgeVariants }
