import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function StatCard({ title, value, icon, trend, trendUp, className }: StatCardProps) {
  return (
    <div className={cn(
      "bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-all duration-300",
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-2 font-display">{value}</h3>
        </div>
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-xs font-medium">
          <span className={cn(
            "px-2 py-0.5 rounded-full",
            trendUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          )}>
            {trend}
          </span>
          <span className="ml-2 text-muted-foreground">vs last month</span>
        </div>
      )}
    </div>
  );
}
