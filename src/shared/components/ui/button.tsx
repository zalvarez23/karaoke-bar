import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center focus:outline-none focus:ring-0 justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors  disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        dark: "border-primary-600 bg-primary-600 text-white hover:border-primary-800 hover:bg-primary-800 active:border-primary-900 active:bg-primary-900 disabled:border-primary-800 disabled:bg-primary-800 disabled:text-primary-400",
        primary:
          "border-secondary-500 bg-secondary-500 text-white hover:border-secondary-600 hover:bg-secondary-600 active:border-secondary-600 active:bg-secondary-600 disabled:border-gray-50 disabled:bg-gray-50 disabled:text-gray-400",
        secondary:
          "border-secondary-500 bg-transparent text-secondary-500 hover:border-secondary-600 hover:bg-secondary-40 hover:text-secondary-500 active:border-secondary-600 active:bg-secondary-40 active:text-secondary-600 disabled:border-gray-100 disabled:bg-transparent disabled:text-gray-400",
        tertiary:
          "border-transparent bg-transparent text-secondary-500 hover:border-transparent hover:bg-transparent hover:text-secondary-600 hover:shadow-none active:border-transparent active:bg-transparent active:text-secondary-600 disabled:border-transparent disabled:bg-transparent disabled:text-gray-400",
        neutral:
          "border-gray-500 bg-white text-gray-500 hover:border-gray-700 hover:bg-white hover:text-gray-700 active:border-gray-700 active:bg-white active:text-gray-700 disabled:border-gray-100 disabled:bg-white disabled:text-gray-400",
        "new-primary":
          "rounded-full border-slate2-600 bg-slate2-600 text-white hover:border-slate2-500 hover:bg-slate2-500 active:border-slate2-700 active:bg-slate2-700 disabled:border-gray-50 disabled:bg-gray-50 disabled:text-gray-400",
        "new-secondary":
          "border-2 border-gray-900 bg-transparent text-gray-900 hover:border-gray-800 hover:bg-gray-50 hover:text-gray-800 focus:border-gray-800 focus:bg-transparent focus:text-gray-800  active:border-gray-700 active:bg-gray-100 active:text-gray-700 disabled:border-gray-100 disabled:bg-transparent disabled:text-gray-400",
        "new-tertiary":
          "border-0 border-gray-900 bg-transparent text-gray-900 hover:text-gray-800 hover:shadow-none focus:border-gray-800 focus:bg-transparent focus:text-gray-800  active:border-gray-700 active:bg-gray-100 active:text-gray-700 disabled:border-gray-100 disabled:bg-transparent disabled:text-gray-400",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        largeMobile: "h-[3.25rem] gap-2 px-3 ",
        smallMobile: "h-[2.5rem] gap-1 px-2 ",
        extraSmallMobile: "h-[2rem] gap-1 px-2 ",
        largeWeb: "h-[3.5rem] gap-2 px-4 ",
        smallWeb: "h-10 gap-1 px-3 lg:h-11 lg:gap-2 lg:px-4",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "largeWeb",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
