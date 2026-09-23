import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const switchVariants = cva(
  "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "data-[state=checked]:bg-primary data-[state=unchecked]:bg-input hover:data-[state=unchecked]:bg-gray-300 dark:data-[state=checked]:bg-primary dark:data-[state=unchecked]:bg-gray-600 dark:hover:data-[state=unchecked]:bg-gray-500 dark:data-[state=checked]:hover:bg-blue-700",
        destructive:
          "data-[state=checked]:bg-destructive data-[state=unchecked]:bg-input hover:data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600 dark:hover:data-[state=unchecked]:bg-gray-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const switchThumbVariants = cva(
  "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-md ring-0 transition-transform dark:bg-gray-100 dark:shadow-black/30",
  {
    variants: {
      checked: {
        true: "translate-x-5",
        false: "translate-x-0",
      },
    },
    defaultVariants: {
      checked: false,
    },
  },
);

export interface SwitchProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof switchVariants> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, variant, checked = false, onCheckedChange, ...props }, ref) => {
    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        data-state={checked ? "checked" : "unchecked"}
        className={cn(switchVariants({ variant, className }))}
        ref={ref}
        onClick={() => onCheckedChange?.(!checked)}
        {...props}
      >
        <span className={cn(switchThumbVariants({ checked }))} />
      </button>
    );
  },
);
Switch.displayName = "Switch";

export { Switch };
