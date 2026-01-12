"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface BentoCardProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
  children?: React.ReactNode;
  gradient?: string;
  href?: string;
}

export function BentoCard({
  title,
  description,
  icon: Icon,
  className,
  children,
  gradient,
  href,
}: BentoCardProps) {
  const CardWrapper = href ? motion.a : motion.div;

  return (
    <CardWrapper
      href={href}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card p-6",
        "transition-all duration-300",
        "hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10",
        "group cursor-pointer",
        className
      )}
    >
      {/* Gradient overlay */}
      {gradient && (
        <div
          className={cn(
            "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            gradient
          )}
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          {Icon && (
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
              <Icon size={20} />
            </div>
          )}
          <h3 className="font-semibold text-foreground">{title}</h3>
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
        )}

        {/* Custom content */}
        {children}
      </div>

      {/* Corner glow effect */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </CardWrapper>
  );
}
