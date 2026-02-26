import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: LucideIcon;
  variant?: "default" | "danger" | "success" | "warning";
  className?: string;
}

export function MetricCard({ label, value, subValue, icon: Icon, variant = "default", className }: MetricCardProps) {
  const variantStyles = {
    default: "border-border text-foreground",
    danger: "border-destructive/50 text-destructive bg-destructive/5",
    success: "border-green-500/50 text-green-500 bg-green-500/5",
    warning: "border-yellow-500/50 text-yellow-500 bg-yellow-500/5",
  };

  return (
    <div className={cn(
      "p-4 rounded border bg-card/50 backdrop-blur-sm relative overflow-hidden group transition-all duration-300 hover:bg-card/80",
      variantStyles[variant],
      className
    )}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs uppercase tracking-widest opacity-70 font-display">{label}</span>
        {Icon && <Icon className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />}
      </div>
      
      <div className="font-mono text-2xl font-bold tracking-tight">
        {value}
      </div>
      
      {subValue && (
        <div className="text-xs mt-1 opacity-60 font-mono">
          {subValue}
        </div>
      )}

      {/* Decorative Corner */}
      <div className={cn(
        "absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 opacity-50",
        variant === "default" ? "border-primary" : "border-current"
      )} />
    </div>
  );
}
