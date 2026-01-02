import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base: unified radius, font, spacing (Cinzel + uppercase)
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-base font-semibold uppercase tracking-wide ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Unified look across all non-link buttons
        default: "bg-[#374957] text-white hover:bg-[#374957]",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "bg-[#374957] text-white hover:bg-[#374957]",
        secondary:
          "bg-[#374957] text-white hover:bg-[#374957]",
        ghost: "bg-[#374957] text-white hover:bg-[#374957]",
        link: "text-[#374957] underline underline-offset-4",
      },
      size: {
        // Unified heights and paddings
        default: "h-11 px-5 py-2.5",
        sm: "h-10 rounded-lg px-4",
        lg: "h-12 rounded-lg px-6",
        icon: "h-11 w-11 rounded-lg",
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
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
