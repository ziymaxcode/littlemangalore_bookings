import * as React from "react"
import { cn } from "@/src/lib/utils"
import { ChevronDown } from "lucide-react"

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          className={cn(
            "flex h-12 w-full appearance-none rounded-xl border border-primary/20 bg-surface px-4 py-2 pr-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary/50 pointer-events-none" />
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
