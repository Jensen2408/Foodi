import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1.5">{label}</label>}
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900",
          "transition-all placeholder:text-gray-300 resize-none",
          "focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50",
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
Textarea.displayName = "Textarea";

export { Textarea };
