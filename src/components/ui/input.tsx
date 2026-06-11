import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-pink-800 mb-1.5">{label}</label>
      )}
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-2xl border border-pink-200 bg-pink-50/60 px-4 py-2 text-sm text-gray-900",
          "transition-all placeholder:text-pink-300",
          "focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent focus:bg-white",
          error && "border-red-400 focus:ring-red-400",
          className
        )}
        ref={ref}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";

export { Input };
