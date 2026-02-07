"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import ThemeToggle from "@/components/theme-toggle";
import {
  LayoutDashboard,
  Map,
  FileSearch,
  Database,
  Siren,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Shield,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const navItems = [
  { name: "Map Analysis", href: "/analysis", icon: Map },
  { name: "Scan Result", href: "/scan-result", icon: FileSearch },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Data Logs", href: "/data-logs", icon: Database },
  { name: "Alerts Centre", href: "/alerts", icon: Siren },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [fontSize, setFontSize] = useState(100);

  // Hover pill state
  const [hoverStyle, setHoverStyle] = useState<{
    left: number;
    width: number;
    opacity: number;
  }>({ left: 0, width: 0, opacity: 0 });

  // Active underline state
  const [activeStyle, setActiveStyle] = useState<{
    left: number;
    width: number;
  }>({ left: 0, width: 0 });

  const navRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const isActive = useCallback(
    (href: string) => {
      return (
        pathname === href ||
        pathname.startsWith(href + "/") ||
        (href === "/dashboard" && pathname === "/")
      );
    },
    [pathname]
  );

  // Position the active underline on mount and route change
  useEffect(() => {
    const activeIndex = navItems.findIndex((item) => isActive(item.href));
    if (activeIndex !== -1 && navRef.current) {
      const el = itemRefs.current[activeIndex];
      if (el) {
        const navRect = navRef.current.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        setActiveStyle({
          left: elRect.left - navRect.left,
          width: elRect.width,
        });
      }
    }
  }, [pathname, isActive]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`;
  }, [fontSize]);

  const adjustFont = (type: "increase" | "decrease" | "reset") => {
    if (type === "increase" && fontSize < 120) setFontSize((p) => p + 5);
    if (type === "decrease" && fontSize > 85) setFontSize((p) => p - 5);
    if (type === "reset") setFontSize(100);
  };

  const handleMouseEnter = (index: number) => {
    const el = itemRefs.current[index];
    if (el && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      setHoverStyle({
        left: elRect.left - navRect.left,
        width: elRect.width,
        opacity: 1,
      });
    }
  };

  const handleMouseLeave = () => {
    setHoverStyle((prev) => ({ ...prev, opacity: 0 }));
  };

  // Don't show AppShell on landing page
  if (pathname === "/") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen font-sans bg-background text-foreground">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        {/* Top row: Logo + Controls */}
        <div className="flex items-center h-16 px-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <Image
                src="/logo.png"
                alt="Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-lg md:text-xl font-black tracking-[0.25em] text-primary">
              SENTINEL EYE
            </h1>
          </div>

          <div className="flex-1" />

          {/* Controls */}
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-muted/40">
              <button
                onClick={() => adjustFont("decrease")}
                className="px-1.5 py-0.5 rounded-md transition hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/30"
                aria-label="Decrease font size"
              >
                A-
              </button>
              <button
                onClick={() => adjustFont("reset")}
                className="px-1.5 py-0.5 rounded-md font-semibold transition hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/30"
                aria-label="Reset font size"
              >
                A
              </button>
              <button
                onClick={() => adjustFont("increase")}
                className="px-1.5 py-0.5 rounded-md transition hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/30"
                aria-label="Increase font size"
              >
                A+
              </button>
              <span className="mx-0.5 text-muted-foreground">|</span>
              <ThemeToggle />
            </div>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 h-9 px-2 rounded-lg hover:bg-accent"
                >
                  <div className="relative w-7 h-7 rounded-full overflow-hidden ring-2 ring-primary/20 shadow-sm flex-shrink-0">
                    <Image
                      src="/avatar.png"
                      alt="User Avatar"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium hidden md:inline">
                    researcher_01
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8} className="w-56">
                <DropdownMenuItem className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Shield className="w-4 h-4 mr-2" />
                  Security
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive cursor-pointer focus:text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Bottom row: Navigation tabs (Vercel-style) */}
        <div className="px-6">
          <nav
            ref={navRef}
            className="relative flex items-center gap-1"
            onMouseLeave={handleMouseLeave}
          >
            {/* Hover pill (animated background) */}
            <div
              className="absolute top-0 h-10 rounded-md bg-accent transition-all duration-200 ease-out pointer-events-none"
              style={{
                left: hoverStyle.left,
                width: hoverStyle.width,
                opacity: hoverStyle.opacity,
              }}
            />

            {navItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  ref={(el) => {
                    itemRefs.current[index] = el;
                  }}
                  onMouseEnter={() => handleMouseEnter(index)}
                  className={[
                    "relative flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors duration-150 rounded-md z-10",
                    "focus:outline-none focus:ring-2 focus:ring-primary/30",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  ].join(" ")}
                >
                  <Icon size={16} className="flex-shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            {/* Active underline indicator */}
            <div
              className="absolute bottom-0 h-[2px] bg-primary transition-all duration-300 ease-out pointer-events-none"
              style={{
                left: activeStyle.left,
                width: activeStyle.width,
              }}
            />
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="mt-[108px] min-h-[calc(100vh-108px)] p-6 bg-background">
        {children}
      </main>
    </div>
  );
}
