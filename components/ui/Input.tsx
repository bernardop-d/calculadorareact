import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-zinc-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "w-full px-4 py-3.5 rounded-xl bg-white/5 border text-white placeholder-zinc-500 text-sm",
            "focus:outline-none focus:ring-2 focus:ring-[#F5C400]/50 focus:border-[#F5C400]/50",
            "transition-all duration-200",
            error ? "border-red-500/50" : "border-white/10",
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
