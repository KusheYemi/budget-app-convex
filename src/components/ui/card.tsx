import * as React from "react";

import { cn } from "@/lib/utils";

function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-2xl border border-border/50 py-6 shadow-sm transition-all duration-300 hover:shadow-md",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-4 sm:px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  );
}

type CardTitleProps = React.ComponentProps<"h2"> & {
  as?: "h1" | "h2" | "h3" | "h4" | "div";
};

function CardTitle({ className, as: Comp = "h2", ...props }: CardTitleProps) {
  return (
    <Comp
      data-slot="card-title"
      className={cn(
        "text-lg font-serif font-normal leading-none tracking-tight",
        className
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-4 sm:px-6", className)}
      {...props}
    />
  );
}

function CardHeaderIcon({
  className,
  children,
  tone = "primary",
  ...props
}: React.ComponentProps<"div"> & {
  tone?: "primary" | "savings" | "warning" | "muted" | "planning";
}) {
  const toneClasses = {
    primary: "bg-primary/10 text-primary",
    savings: "bg-savings/15 text-savings",
    warning: "bg-warning/15 text-warning",
    planning: "bg-[var(--planning)]/15 text-[var(--planning)]",
    muted: "bg-muted text-muted-foreground",
  } as const;
  return (
    <div
      data-slot="card-header-icon"
      className={cn("p-2 rounded-xl flex items-center justify-center", toneClasses[tone], className)}
      {...props}
    >
      {children}
    </div>
  );
}

export {
  Card,
  CardHeader,
  CardHeaderIcon,
  CardTitle,
  CardDescription,
  CardContent,
};
