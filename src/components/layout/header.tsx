"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";
import { MonthPicker } from "./month-picker";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface HeaderProps {
  email?: string;
  year: number;
  month: number;
}

export function Header({ email, year, month }: HeaderProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "Budget", icon: "grid" },
    { href: "/insights", label: "Insights", icon: "chart" },
    { href: "/history", label: "History", icon: "clock" },
  ];

  const NavIcon = ({ type }: { type: string }) => {
    switch (type) {
      case "grid":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        );
      case "chart":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" />
            <path d="m19 9-5 5-4-4-3 3" />
          </svg>
        );
      case "clock":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Frosted glass effect with grain */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-b border-border/50" />

      <div className="container relative flex h-16 items-center gap-4">
        {/* Logo — Editorial style */}
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ rotate: -5, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-primary/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            <Image
              src="/budget-app.jpg"
              alt="Ledgerise Logo"
              width={36}
              height={36}
              className="rounded-xl relative shadow-sm"
            />
          </motion.div>
          <span className="hidden xs:flex items-baseline gap-0.5">
            <span className="text-xl font-serif text-foreground tracking-tight">Ledger</span>
            <span className="text-xl font-serif text-primary italic">ise</span>
          </span>
        </Link>

        {/* Desktop Navigation — Pill style */}
        <nav className="hidden md:flex items-center gap-1 ml-6 bg-muted/50 rounded-full p-1">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href === "/dashboard" && pathname.startsWith("/budget"));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200",
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-primary rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative flex items-center gap-2">
                  <NavIcon type={link.icon} />
                  {link.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Month Picker — Enhanced */}
        {(pathname === "/dashboard" || pathname.startsWith("/budget")) && (
          <div className="hidden md:block">
            <MonthPicker year={year} month={month} />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserMenu email={email} />
        </div>
      </div>

      {/* Mobile Navigation — Tab bar style */}
      <div className="md:hidden border-t border-border/50 bg-background/80 backdrop-blur-xl">
        {/* Mobile Nav Tabs */}
        <div className="flex">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href === "/dashboard" && pathname.startsWith("/budget"));

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-primary rounded-full"
                    transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
                  />
                )}
                <NavIcon type={link.icon} />
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile Month Picker */}
        {(pathname === "/dashboard" || pathname.startsWith("/budget")) && (
          <div className="px-4 py-2 border-t border-border/30">
            <MonthPicker year={year} month={month} />
          </div>
        )}
      </div>
    </header>
  );
}
