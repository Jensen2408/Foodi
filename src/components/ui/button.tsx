"use client";
import { forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default: "bg-gradient-brand text-white hover:opacity-90",
        secondary: "text-gray-600 hover:text-gray-900 hover:bg-gray-100 border border-gray-200",
        outline: "border border-gray-200 text-gray-500 hover:bg-gray-50",
        ghost: "hover:bg-gray-100 text-gray-500",
        destructive: "bg-red-50 text-red-500 border border-red-200 hover:bg-red-100",
        link: "text-purple-500 underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-lg",
        default: "h-10 px-5 py-2",
        lg: "h-12 px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, onMouseDown, onMouseUp, onMouseLeave, style, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      style={{ transition: "transform 0.1s ease, box-shadow 0.1s ease", ...style }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = "perspective(400px) translateZ(-6px) translateY(2px) scale(0.97)";
        e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.1)";
        onMouseDown?.(e);
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
        onMouseUp?.(e);
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
        onMouseLeave?.(e);
      }}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
