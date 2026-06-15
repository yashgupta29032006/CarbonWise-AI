import React from "react";
import Link from "next/link";
import { Leaf } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-zinc-100 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 py-12 px-6 sm:px-8 mt-auto no-print">
      <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand & Mission */}
        <div className="md:col-span-2 space-y-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-emerald-500/10 p-2 rounded-lg">
              <Leaf className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="font-bold text-md tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
              CarbonWise AI
            </span>
          </Link>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm max-w-sm leading-relaxed">
            Empowering individuals to understand, track, and optimize their carbon footprint for a sustainable global future.
          </p>
        </div>

        {/* Links Column 1 */}
        <div>
          <h4 className="font-semibold text-sm text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-4">
            Platform
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/" className="text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 transition-colors duration-150">
                Landing Page
              </Link>
            </li>
            <li>
              <Link href="/tracker" className="text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 transition-colors duration-150">
                Log Emissions
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 transition-colors duration-150">
                Dashboard
              </Link>
            </li>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div>
          <h4 className="font-semibold text-sm text-zinc-800 dark:text-zinc-200 uppercase tracking-wider mb-4">
            Legal & Support
          </h4>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="#" className="text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 transition-colors duration-150">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="#" className="text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 transition-colors duration-150">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="#" className="text-zinc-500 dark:text-zinc-400 hover:text-emerald-500 transition-colors duration-150">
                Contact Support
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto max-w-7xl border-t border-zinc-200 dark:border-zinc-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <p>&copy; {new Date().getFullYear()} CarbonWise AI. Built for the Sustainability Hackathon.</p>
        <p className="flex items-center gap-1.5 mt-2 sm:mt-0">
          Made with <Leaf className="h-3 w-3 text-emerald-500 animate-pulse" /> for the Planet.
        </p>
      </div>
    </footer>
  );
}
