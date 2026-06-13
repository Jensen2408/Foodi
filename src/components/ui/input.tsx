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
        <label className="block text-xs font-semibold text-white/40 uppercase tracking-wide mb-1.5">{label}</label>
      )}
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl px-4 py-2 text-sm text-white",
          "transition-all placeholder:text-white/20",
          "focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50",
          "border border-white/10 bg-[#0f1520]/[0.05]",
          error && "border-red-500/50 focus:ring-red-500/30",
          className
        )}
        ref={ref}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";

export { Input };
