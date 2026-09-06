import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 font-lemonada",
  {
    variants: {
      variant: {
        default:     "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:   "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline:     "text-foreground",
        success:     "border-transparent bg-emerald-500 text-white shadow",
        warning:     "border-transparent bg-orange-500 text-white shadow",
        next:        "border-transparent bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow",
        active:      "border-transparent bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
