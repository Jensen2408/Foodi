"use client";
import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-2xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gradient-brand text-white shadow-lg shadow-pink-200 hover:shadow-xl hover:shadow-pink-300 hover:scale-[1.02] active:scale-[0.98]",
        secondary: "bg-pink-50 text-pink-700 border border-pink-200 hover:bg-pink-100",
        outline: "border-2 border-pink-400 text-pink-600 hover:bg-pink-50",
        ghost: "hover:bg-pink-50 text-pink-600",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        link: "text-pink-600 underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-11 px-6 py-2",
        lg: "h-13 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
