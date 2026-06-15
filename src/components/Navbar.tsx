"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";
import { useCarbon } from "@/context/CarbonContext";
import Button from "./ui/Button";
import { Leaf, Sun, Moon, Menu, X, BarChart3, LayoutDashboard, Info, User } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { isOnboarded } = useCarbon();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Overview", href: "/", icon: Info },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, requiresOnboard: true },
    { name: "Carbon Tracker", href: "/tracker", icon: BarChart3, requiresOnboard: true },
  ];

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-8 py-4 no-print">
      <nav aria-label="Main Navigation" className="mx-auto max-w-7xl glass rounded-2xl px-6 py-3 flex items-center justify-between shadow-md">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group focus:outline-none" aria-label="CarbonWise AI Home">
          <div className="bg-emerald-500/10 p-2 rounded-xl group-hover:scale-110 transition-transform duration-200">
            <Leaf className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
            CarbonWise AI
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            if (link.requiresOnboard && !isOnboarded) return null;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                    : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                }`}
              >
                <link.icon className="h-4 w-4" />
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="hidden md:flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all duration-200"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          {/* CTA */}
          {isOnboarded ? (
            <Link href="/dashboard">
              <Button size="sm" variant="secondary" className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                My Account
              </Button>
            </Link>
          ) : (
            <Link href="/tracker">
              <Button size="sm">Get Started</Button>
            </Link>
          )}
        </div>

        {/* Mobile Controls */}
        <div className="flex md:hidden items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-zinc-600 dark:text-zinc-400"
            aria-label="Toggle Theme"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          {/* Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-zinc-600 dark:text-zinc-400"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 mx-auto max-w-7xl glass rounded-2xl px-6 py-4 flex flex-col gap-4 shadow-lg border border-white/20 dark:border-zinc-800/20">
          <div className="flex flex-col gap-1.5">
            {navLinks.map((link) => {
              if (link.requiresOnboard && !isOnboarded) return null;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                      : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.name}
                </Link>
              );
            })}
          </div>

          <hr className="border-zinc-200 dark:border-zinc-800" />

          {/* Mobile CTA */}
          <div className="flex flex-col gap-2">
            {isOnboarded ? (
              <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                <Button fullWidth variant="secondary" className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  My Account
                </Button>
              </Link>
            ) : (
              <Link href="/tracker" onClick={() => setMobileMenuOpen(false)}>
                <Button fullWidth>Get Started</Button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
