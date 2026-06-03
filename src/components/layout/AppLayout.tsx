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
  ChevronLeft,
  Headset,
  Award,
  Users,
  Download
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

  // Hide layout for auth pages and public landing page, but render floating menu globally on the right side
  const isAuthPage = pathname?.startsWith("/auth");
  const isLandingPage = pathname === "/";

  // Only show the floating action buttons on the home page (/lobby)
  const showQuickActions = pathname === "/lobby";

  // Floating Quick Action Menu component on the Right (visible on desktop/tablet)
  const renderQuickActions = () => {
    if (!showQuickActions) return null;
    return (
      <div className="hidden md:flex fixed right-4 top-1/2 -translate-y-1/2 flex-col gap-3 z-50 animate-in slide-in-from-right duration-500">
      
      {/* 1. Mystery Gift Box */}
      <button
        onClick={() => {
          toast.success("Welcome to Bull Wave Rewards!");
          router.push("/rewards");
        }}
        className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-[#ff4757] text-white flex items-center justify-center shadow-[0_4px_15px_rgba(255,71,87,0.35)] hover:scale-110 active:scale-95 transition-all duration-300 border border-white/20 relative group cursor-pointer shrink-0"
      >
        <Gift size={20} className="animate-bounce text-yellow-100" />
        <span className="absolute right-14 bg-slate-900/95 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-md pointer-events-none border border-slate-700">
          Mystery Gift
        </span>
      </button>

      {/* 2. Invite Wheel */}
      <button
        onClick={() => {
          router.push("/activity/invite-wheel");
        }}
        className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 via-amber-500 to-orange-500 text-white flex items-center justify-center shadow-[0_4px_15px_rgba(245,158,11,0.35)] hover:scale-110 active:scale-95 transition-all duration-300 border border-white/20 relative group cursor-pointer shrink-0"
      >
        <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-inner p-0.5 border border-amber-300">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Stand / Support Base at the bottom */}
            <path d="M38,90 L62,90 L56,76 L44,76 Z" fill="#e25c27" stroke="#b33c15" strokeWidth="1" />
            <rect x="47" y="72" width="6" height="6" fill="#f0783c" stroke="#b33c15" strokeWidth="1" />
            <ellipse cx="50" cy="90" rx="14" ry="3" fill="#c2410c" />
            
            {/* Rotating Wheel Group */}
            <g className="animate-[spin_10s_linear_infinite] origin-center">
              {/* Outer Red Wheel Rim */}
              <circle cx="50" cy="46" r="36" fill="#ef4444" stroke="#d97706" strokeWidth="2" />
              
              {/* Wheel Segments */}
              {/* Green */}
              <path d="M50,46 L50,10 A36,36 0 0,1 81,28 Z" fill="#10b981" />
              {/* Orange */}
              <path d="M50,46 L81,28 A36,36 0 0,1 86,46 Z" fill="#f97316" />
              {/* Yellow */}
              <path d="M50,46 L86,46 A36,36 0 0,1 68,77 Z" fill="#fbbf24" />
              {/* Purple */}
              <path d="M50,46 L68,77 A36,36 0 0,1 32,77 Z" fill="#a855f7" />
              {/* Pink/Red */}
              <path d="M50,46 L32,77 A36,36 0 0,1 14,46 Z" fill="#f43f5e" />
              {/* Cyan */}
              <path d="M50,46 L14,46 A36,36 0 0,1 19,28 Z" fill="#06b6d4" />
              {/* Yellow-Green */}
              <path d="M50,46 L19,28 A36,36 0 0,1 50,10 Z" fill="#84cc16" />

              {/* Bulbs on Rim */}
              <circle cx="50" cy="13" r="1.5" fill="#fff" />
              <circle cx="80" cy="30" r="1.5" fill="#fff" />
              <circle cx="83" cy="46" r="1.5" fill="#fff" />
              <circle cx="66" cy="74" r="1.5" fill="#fff" />
              <circle cx="34" cy="74" r="1.5" fill="#fff" />
              <circle cx="17" cy="46" r="1.5" fill="#fff" />
              <circle cx="20" cy="30" r="1.5" fill="#fff" />

              {/* Central Gold Cap */}
              <circle cx="50" cy="46" r="9" fill="#facc15" stroke="#d97706" strokeWidth="1" />
              <circle cx="50" cy="46" r="4.5" fill="#fef08a" />
            </g>

            {/* Static Gold Pointer at the Top */}
            <path d="M50,4 L53,15 L47,15 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="0.8" />
            <circle cx="50" cy="15" r="2" fill="#ef4444" />
          </svg>
        </div>
        <span className="absolute right-14 bg-slate-900/95 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-md pointer-events-none border border-slate-700">
          Invite Wheel
        </span>
      </button>

      {/* 3. Wheel Spin */}
      <button
        onClick={() => {
          router.push("/games/o12");
        }}
        className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-600 text-white flex items-center justify-center shadow-[0_4px_15px_rgba(99,102,241,0.35)] hover:scale-110 active:scale-95 transition-all duration-300 border border-white/20 relative group cursor-pointer shrink-0"
      >
        <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center overflow-hidden shadow-inner p-0.5 border border-purple-300">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Thick 3D Outer Gold Ring */}
            <circle cx="50" cy="50" r="46" fill="#ca8a04" stroke="#fef08a" strokeWidth="2" />
            <circle cx="50" cy="50" r="42" fill="#eab308" />
            
            {/* Rotating Wheel Group */}
            <g className="animate-[spin_12s_linear_infinite] origin-center">
              <circle cx="50" cy="50" r="39" fill="#1e293b" />
              
              {/* 3D Wheel Segments */}
              {/* Red */}
              <path d="M50,50 L50,11 A39,39 0 0,1 77,22 Z" fill="#dc2626" />
              {/* Violet */}
              <path d="M50,50 L77,22 A39,39 0 0,1 89,50 Z" fill="#7c3aed" />
              {/* Indigo */}
              <path d="M50,50 L89,50 A39,39 0 0,1 77,78 Z" fill="#312e81" />
              {/* Cyan */}
              <path d="M50,50 L77,78 A39,39 0 0,1 50,89 Z" fill="#0891b2" />
              {/* Green */}
              <path d="M50,50 L50,89 A39,39 0 0,1 23,78 Z" fill="#16a34a" />
              {/* Lime */}
              <path d="M50,50 L23,78 A39,39 0 0,1 11,50 Z" fill="#65a30d" />
              {/* Yellow */}
              <path d="M50,50 L11,50 A39,39 0 0,1 23,22 Z" fill="#eab308" />
              {/* Orange */}
              <path d="M50,50 L23,22 A39,39 0 0,1 50,11 Z" fill="#ea580c" />

              {/* Gold spokes / segment dividers */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
                const rad = (angle * Math.PI) / 180;
                const x2 = 50 + 39 * Math.cos(rad);
                const y2 = 50 + 39 * Math.sin(rad);
                return <line key={i} x1="50" y1="50" x2={x2} y2={y2} stroke="#fef08a" strokeWidth="0.8" opacity="0.8" />;
              })}

              {/* Outer gold ring inside sectors */}
              <circle cx="50" cy="50" r="39" fill="none" stroke="#fef08a" strokeWidth="1" />
            </g>

            {/* Central Shiny 3D Gold Cap */}
            <circle cx="50" cy="50" r="10" fill="#ca8a04" stroke="#fef08a" strokeWidth="1" />
            <circle cx="50" cy="50" r="7" fill="#eab308" />
            <circle cx="48" cy="48" r="3" fill="#fef08a" opacity="0.9" />

            {/* Pointer Needle on Top Left edge */}
            <path d="M19,19 L28,25 L25,28 Z" fill="#ea580c" stroke="#ca8a04" strokeWidth="0.5" />
            <circle cx="21" cy="21" r="2" fill="#fef08a" />
          </svg>
        </div>
        <span className="absolute right-14 bg-slate-900/95 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-md pointer-events-none border border-slate-700">
          Wheel Spin
        </span>
      </button>

      {/* 4. Telegram Group Support */}
      <a
        href="https://t.me/bullwavecapital26"
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#229ED9] to-[#1d82b5] text-white flex items-center justify-center shadow-[0_4px_15px_rgba(34,158,217,0.35)] hover:scale-110 active:scale-95 transition-all duration-300 border border-white/20 relative group cursor-pointer shrink-0"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
          <path d="M9.78 18.65l.28-4.28 7.76-7.01c.34-.3-.07-.46-.52-.16L7.76 12.14l-4.14-1.3c-.9-.28-.92-.9.19-1.34L19.9 3.03c.75-.28 1.4.17 1.15 1.25L17.7 19.86c-.26 1.25-.99 1.56-2.03.98l-4.87-3.58-2.35 2.27c-.26.26-.48.48-.97.48z"/>
        </svg>
        <span className="absolute right-14 bg-slate-900/95 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-md pointer-events-none border border-slate-700">
          Telegram Support
        </span>
      </a>

      {/* 5. Dragon Assistant (Dragon Circle style) */}
      <button
        onClick={() => {
          router.push("/dragon-assistant");
        }}
        className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#800000] to-rose-700 text-white flex items-center justify-center shadow-[0_4px_15px_rgba(128,0,0,0.35)] hover:scale-110 active:scale-95 transition-all duration-300 border border-white/20 relative group cursor-pointer shrink-0"
      >
        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-amber-50 to-orange-50 flex items-center justify-center overflow-hidden border border-[#D4AF37]/50 shadow-inner p-1 shrink-0">
          <svg className="w-7 h-7 text-[#800000]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M 12 3 L 8.5 6.5 L 5 3.5 L 6 8 L 3 11 L 5 14 L 9 19 L 12 21 L 15 19 L 19 14 L 21 11 L 18 8 L 19 3.5 L 15.5 6.5 Z" fill="currentColor" fillOpacity="0.15" />
            <circle cx="8.5" cy="11.5" r="1.2" fill="currentColor" />
            <circle cx="15.5" cy="11.5" r="1.2" fill="currentColor" />
            <path d="M 10 16 L 12 14 L 14 16" />
            <path d="M 12 14 L 12 20" />
          </svg>
        </div>
        <span className="absolute right-14 bg-slate-900/95 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-md pointer-events-none border border-slate-700">
          Dragon Assistant
        </span>
      </button>

      {/* 6. Live Chat Customer Service */}
      <button
        onClick={() => {
          router.push("/support");
        }}
        className="w-12 h-12 rounded-full bg-gradient-to-tr from-pink-500 to-rose-500 text-white flex items-center justify-center shadow-[0_4px_15px_rgba(244,63,94,0.35)] hover:scale-110 active:scale-95 transition-all duration-300 border border-white/20 relative group cursor-pointer shrink-0"
      >
        <Headset size={20} className="text-white" />
        <span className="absolute right-14 bg-slate-900/95 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap shadow-md pointer-events-none border border-slate-700">
          Live Support
        </span>
      </button>

    </div>
  );
};

  if (isAuthPage || isLandingPage) {
    return (
      <>
        {children}
        {renderQuickActions()}
      </>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#8b919e] flex justify-center items-center gap-6 overflow-hidden font-sans">
      
      {/* Centered Phone Wrapper */}
      <div className="w-full sm:w-[400px] h-screen bg-[#fafafb] text-slate-800 flex flex-col relative shadow-[0_0_50px_rgba(0,0,0,0.25)] border-x border-slate-300/30 overflow-hidden">
        
        {/* Top Navbar */}
        {pathname !== "/about" && pathname !== "/tournaments" && pathname !== "/activity" && pathname !== "/dragon-assistant" && (
          <header className="h-14 bg-white flex items-center justify-between px-4 flex-shrink-0 z-30 border-b border-glass-border shadow-sm">
            <div className="flex items-center gap-1.5">
              {pathname !== "/lobby" && pathname !== "/" && (
                <button 
                  onClick={() => router.back()} 
                  className="text-slate-600 hover:text-[#800000] active:scale-90 transition-all p-1 rounded-full hover:bg-slate-100/50 cursor-pointer flex items-center justify-center shrink-0"
                >
                  <ChevronLeft size={22} className="stroke-[2.5]" />
                </button>
              )}
              <Link href="/lobby" className="flex items-center gap-2 cursor-pointer">
                <img src="/logo.png" alt="Bull Wave Logo" className="w-12 h-12 rounded-xl object-cover shadow-md" />
                <span className="text-xl font-black text-[#800000] tracking-wide">Bull Wave</span>
              </Link>
            </div>

          <div className="flex items-center gap-3">
            {/* Wallet balance */}
            <Link 
              href="/wallet"
              className="flex items-center gap-1.5 bg-[#800000]/10 border border-[#800000]/20 px-3 py-1 rounded-full cursor-pointer hover:bg-[#800000]/20 transition-all"
            >
              <Wallet size={14} className="text-[#800000]" />
              <span className="text-xs font-bold text-[#800000]">₹{(user?.walletBalance ?? 14500).toLocaleString()}</span>
            </Link>

            <button 
              onClick={() => {
                router.push("/announcement");
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
        <main className={`flex-1 overflow-y-auto scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${(pathname === "/about" || pathname === "/dragon-assistant") ? "pb-6" : "pb-24"}`}>
          <div className="w-full flex-1">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        {pathname !== "/about" && pathname !== "/dragon-assistant" && !pathname?.includes("/activity/") && !pathname?.includes("/games/") && (
          <nav className="absolute bottom-0 left-0 right-0 h-16 bg-white border-t border-glass-border z-40 px-2 flex items-center justify-between shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
            
            <Link
              href="/lobby"
              className={`flex flex-col items-center justify-center w-14 gap-0.5 transition-colors ${
                pathname === "/lobby" ? "text-[#800000]" : "text-muted-foreground hover:text-[#800000]"
              }`}
            >
              <Gamepad2 size={20} />
              <span className="text-[10px] font-bold">Home</span>
            </Link>

            <Link
              href="/activity"
              className={`flex flex-col items-center justify-center w-14 gap-0.5 transition-colors ${
                pathname === "/activity" ? "text-[#800000]" : "text-muted-foreground hover:text-[#800000]"
              }`}
            >
              <Award size={20} />
              <span className="text-[10px] font-bold">Activity</span>
            </Link>

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

            <Link
              href="/referrals"
              className={`flex flex-col items-center justify-center w-14 gap-0.5 transition-colors ${
                pathname === "/referrals" ? "text-[#800000]" : "text-muted-foreground hover:text-[#800000]"
              }`}
            >
              <Users size={20} />
              <span className="text-[10px] font-bold">Promotion</span>
            </Link>

            <Link
              href="/profile"
              className={`flex flex-col items-center justify-center w-14 gap-0.5 transition-colors ${
                pathname === "/profile" ? "text-[#800000]" : "text-muted-foreground hover:text-[#800000]"
              }`}
            >
              <UserCircle size={20} />
              <span className="text-[10px] font-bold">Account</span>
            </Link>

          </nav>
        )}

        {/* Floating Add to Desktop Button */}
        {pathname !== "/about" && pathname !== "/download" && pathname !== "/dragon-assistant" && !pathname?.includes("/activity/") && !pathname?.includes("/games/") && (
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

      {/* Premium Floating Quick Action Menu on the Right (Screenshot style) */}
      {renderQuickActions()}

    </div>
  );
}
