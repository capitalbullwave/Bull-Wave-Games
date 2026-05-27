"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Gamepad2, 
  Wallet, 
  Trophy, 
  UserCircle, 
  Menu, 
  X, 
  Bell, 
  Gift, 
  LogOut,
  ChevronRight,
  Headset,
  Award,
  Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const SIDEBAR_ITEMS = [
  { name: "Lobby", href: "/", icon: Gamepad2 },
  { name: "Tournaments", href: "/tournaments", icon: Award },
  { name: "Wallet", href: "/wallet", icon: Wallet },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Affiliate", href: "/referrals", icon: Users },
  { name: "Rewards", href: "/rewards", icon: Gift },
  { name: "Profile", href: "/profile", icon: UserCircle },
  { name: "Support", href: "/support", icon: Headset },
];
export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  const [mounted, setMounted] = useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success("Successfully logged out!");
    router.push("/");
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#800000] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Hide layout for auth pages
  if (pathname?.startsWith("/auth")) {
    return <>{children}</>;
  }

  // Hide mobile layout for public widescreen landing page
  if (pathname === "/") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen w-full bg-white flex justify-center items-center overflow-hidden font-sans">
      
      {/* Centered Phone Wrapper */}
      <div className="w-full max-w-[450px] h-screen bg-[#fafafb] text-slate-800 flex flex-col relative shadow-[0_0_50px_rgba(0,0,0,0.15)] border-x border-glass-border overflow-hidden">
        
        {/* Top Navbar */}
        {pathname !== "/about" && (
          <header className="h-14 bg-white flex items-center justify-between px-4 flex-shrink-0 z-30 border-b border-glass-border shadow-sm">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push("/lobby")}>
            <img src="/logo.png" alt="Bull Wave Logo" className="w-12 h-12 rounded-xl object-cover shadow-md" />
            <span className="text-xl font-black text-[#800000] tracking-wide">Bull Wave</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Wallet balance */}
            <div 
              onClick={() => router.push("/wallet")}
              className="flex items-center gap-1.5 bg-[#800000]/10 border border-[#800000]/20 px-3 py-1 rounded-full cursor-pointer hover:bg-[#800000]/20 transition-all"
            >
              <Wallet size={14} className="text-[#800000]" />
              <span className="text-xs font-bold text-[#800000]">₹{(user?.walletBalance ?? 14500).toLocaleString()}</span>
            </div>

            <button 
              onClick={() => {
                toast.info("No new announcements in your mailbox.");
                router.push("/support");
              }}
              className="p-1.5 rounded-full hover:bg-black/5 text-[#800000] transition-colors relative"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
            </button>
          </div>
        </header>
        )}

        {/* Dynamic Page Content */}
        <main className={`flex-1 overflow-y-auto scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${pathname === "/about" ? "pb-6" : "pb-24"}`}>
          <div className="p-4 space-y-6">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        {pathname !== "/about" && (
          <nav className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-glass-border z-40 px-2 flex items-center justify-between shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
            
            <button
              onClick={() => router.push("/lobby")}
              className={`flex flex-col items-center justify-center w-14 gap-0.5 transition-colors ${
                pathname === "/lobby" ? "text-[#800000]" : "text-muted-foreground hover:text-[#800000]"
              }`}
            >
              <Gamepad2 size={20} />
              <span className="text-[10px] font-bold">Home</span>
            </button>

            <button
              onClick={() => router.push("/tournaments")}
              className={`flex flex-col items-center justify-center w-14 gap-0.5 transition-colors ${
                pathname === "/tournaments" ? "text-[#800000]" : "text-muted-foreground hover:text-[#800000]"
              }`}
            >
              <Trophy size={20} />
              <span className="text-[10px] font-bold">Activity</span>
            </button>

            {/* Central Popping Get ₹500 Action */}
            <div className="relative -top-5 flex flex-col items-center">
              <button
                onClick={() => {
                  toast.success("Welcome to Bull Wave Wingo rewards!");
                  router.push("/rewards");
                }}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#ff6b6b] to-[#ff4757] p-0.5 shadow-[0_0_15px_rgba(255,71,87,0.5)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
              >
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden relative">
                  {/* Custom Rotating Spin Wheel SVG */}
                  <svg className="w-full h-full animate-[spin_25s_linear_infinite]" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="50" fill="#f8a5c2" />
                    {/* Sectors */}
                    <path d="M50,50 L50,0 A50,50 0 0,1 100,50 Z" fill="#ff7f50" />
                    <path d="M50,50 L100,50 A50,50 0 0,1 50,100 Z" fill="#ff4757" />
                    <path d="M50,50 L50,100 A50,50 0 0,1 0,50 Z" fill="#ffb8b8" />
                    <path d="M50,50 L0,50 A50,50 0 0,1 50,0 Z" fill="#ffa502" />
                    {/* Center Pin and GO Text */}
                    <circle cx="50" cy="50" r="16" fill="#D4AF37" stroke="#fff" strokeWidth="1.5" />
                    <text x="50" y="54" fill="#800000" fontSize="11" fontWeight="900" textAnchor="middle">GO</text>
                  </svg>
                </div>
              </button>
              <span className="text-[10px] font-black text-rose-600 mt-1 text-center bg-white border border-rose-200 px-2 py-0.5 rounded-full shadow-sm relative z-10 whitespace-nowrap">
                Get ₹500
              </span>
            </div>

            <button
              onClick={() => router.push("/referrals")}
              className={`flex flex-col items-center justify-center w-14 gap-0.5 transition-colors ${
                pathname === "/referrals" ? "text-[#800000]" : "text-muted-foreground hover:text-[#800000]"
              }`}
            >
              <Users size={20} />
              <span className="text-[10px] font-bold">Promotion</span>
            </button>

            <button
              onClick={() => router.push("/profile")}
              className={`flex flex-col items-center justify-center w-14 gap-0.5 transition-colors ${
                pathname === "/profile" ? "text-[#800000]" : "text-muted-foreground hover:text-[#800000]"
              }`}
            >
              <UserCircle size={20} />
              <span className="text-[10px] font-bold">Account</span>
            </button>

          </nav>
        )}

        {/* Floating Add to Desktop Button */}
        {pathname !== "/about" && pathname !== "/download" && (
          <div className="absolute bottom-[76px] left-1/2 -translate-x-1/2 z-40">
            <button 
              onClick={() => router.push("/download")}
              className="bg-gradient-to-r from-[#ff6b6b] to-[#ff4757] text-white font-black text-xs py-2 px-5 rounded-full shadow-[0_4px_15px_rgba(255,71,87,0.35)] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-transform whitespace-nowrap border border-white/20"
            >
              <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0 shadow-inner">
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15 9H22L17 14L19 21L12 17L5 21L7 14L2 9H9L12 2Z" fill="url(#starGrad3)" />
                  <defs>
                    <linearGradient id="starGrad3" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ff9f43" />
                      <stop offset="50%" stopColor="#ff4757" />
                      <stop offset="100%" stopColor="#2e86de" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              Add to Desktop
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
