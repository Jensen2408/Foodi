import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block text-sm font-semibold text-pink-800 mb-1.5">{label}</label>}
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-2xl border border-blue-200 bg-blue-50/60 px-4 py-3 text-sm text-gray-900",
          "transition-all placeholder:text-blue-400 resize-none",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white",
          error && "border-red-400",
          className
        )}
        ref={ref}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
