"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Gamepad2, Star, Download, Flame, Volume2, 
  Shield, Gem, Lock, TrendingUp, ChevronRight, 
  Users, Headphones, Gift, BookOpen, AlertCircle, Copy, Check, Menu, X, Award
} from "lucide-react";
import { MOCK_GAMES } from "@/constants/mockData";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function Dashboard() {

  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // State for Landing Page
  const [scrolled, setScrolled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(0);

  const banners = ['/banner1.jpg', '/banner2.jpg', '/banner3.jpg'];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent hydration mismatches (Always place after all React Hooks declarations!)
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#800000] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText("382757617365");
    setCopied(true);
    toast.success("Referral code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // --- RENDER 1: PUBLIC PREMIUM LANDING PAGE ---
  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-[#D4AF37]/30 overflow-x-hidden scroll-smooth">
        
        {/* Widescreen Floating Header */}
        <header className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-md py-3 shadow-md border-b border-amber-200/20" : "bg-transparent py-5"
        }`}>
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#800000] to-[#D4AF37] flex items-center justify-center shadow-md">
                <Gamepad2 className="text-white" size={18} />
              </div>
              <span className={`text-xl font-black uppercase tracking-wider transition-colors duration-300 ${
                scrolled ? "text-[#800000]" : "text-white"
              }`}>Bull Wave Games</span>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-8">
              {["About", "Games", "Partnership", "Support"].map((item) => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase()}`}
                  className={`text-sm font-bold tracking-wide transition-colors ${
                    scrolled ? "text-slate-700 hover:text-[#800000]" : "text-white/90 hover:text-[#D4AF37]"
                  }`}
                >
                  {item}
                </a>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-4">
              <button 
                onClick={() => router.push("/auth/login")}
                className={`text-sm font-black uppercase tracking-wider transition-colors ${
                  scrolled ? "text-[#800000]" : "text-white/90 hover:text-[#D4AF37]"
                }`}
              >
                Log In
              </button>
              <button 
                onClick={() => router.push("/auth/signup")}
                className="bg-gradient-to-r from-[#800000] to-[#b30000] text-white hover:from-[#b30000] hover:to-[#800000] text-xs font-black uppercase tracking-widest px-6 py-3 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Join Now
              </button>
            </div>

            {/* Mobile Nav Button */}
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-1.5 rounded-lg text-slate-700 focus:outline-none"
            >
              {menuOpen ? (
                <X className={scrolled ? "text-slate-800" : "text-white"} size={24} />
              ) : (
                <Menu className={scrolled ? "text-slate-800" : "text-white"} size={24} />
              )}
            </button>
          </div>

          {/* Mobile Overlay Menu */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute top-full left-0 right-0 w-full bg-white border-b border-slate-100 shadow-2xl p-6 flex flex-col gap-4 md:hidden"
              >
                {["About", "Games", "Partnership", "Support"].map((item) => (
                  <a 
                    key={item} 
                    href={`#${item.toLowerCase()}`}
                    onClick={() => setMenuOpen(false)}
                    className="text-base font-extrabold text-slate-800 hover:text-[#800000]"
                  >
                    {item}
                  </a>
                ))}
                <hr className="border-slate-100" />
                <div className="flex gap-4">
                  <button 
                    onClick={() => { setMenuOpen(false); router.push("/auth/login"); }}
                    className="flex-1 border border-slate-200 text-slate-800 font-extrabold py-3 rounded-xl"
                  >
                    Log In
                  </button>
                  <button 
                    onClick={() => { setMenuOpen(false); router.push("/auth/signup"); }}
                    className="flex-1 bg-gradient-to-r from-[#800000] to-[#b30000] text-white font-extrabold py-3 rounded-xl shadow-md"
                  >
                    Join Now
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black text-white py-24">
          <AnimatePresence>
            <motion.div
              key={currentBanner}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105"
              style={{ backgroundImage: `url('${banners[currentBanner]}')` }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/75 to-transparent z-10" />

          {/* Luxury Floating Phone Mockup container */}
          <div className="max-w-7xl mx-auto px-6 w-full relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6 text-left animate-in fade-in slide-in-from-bottom duration-1000">
              <span className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-[#800000]/30 to-[#D4AF37]/30 border border-[#D4AF37]/40 text-[#F1D279] text-xs font-black uppercase tracking-wider mb-2">
                India's #1 Premium Club
              </span>
              <h1 className="text-4xl md:text-7xl font-black leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-slate-350">
                Elevated Gaming.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F1D279]">Real Rewards.</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-350 leading-relaxed max-w-xl font-medium">
                Welcome to India's most trusted elite gaming destination. We provide a sophisticated environment for strategic gaming, high-stakes color prediction, and premium rewards.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  onClick={() => router.push("/auth/signup")}
                  className="bg-gradient-to-r from-[#800000] to-[#b30000] text-white hover:from-[#b30000] hover:to-[#800000] px-8 py-4 rounded-xl text-sm font-extrabold uppercase tracking-widest shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all text-center"
                >
                  Create Account
                </button>
                <button 
                  onClick={() => router.push("/auth/login")}
                  className="bg-white/10 hover:bg-white/15 border border-white/20 px-8 py-4 rounded-xl text-sm font-extrabold uppercase tracking-widest hover:-translate-y-0.5 active:translate-y-0 transition-all text-center"
                >
                  Member Login
                </button>
              </div>
            </div>

            {/* Premium Gold Frame Phone Mockup in Widescreen */}
            <div className="lg:col-span-5 hidden lg:block relative justify-self-center animate-in fade-in slide-in-from-right duration-1000">
              <div className="absolute inset-0 bg-[#D4AF37]/20 blur-3xl rounded-full w-72 h-72 mx-auto" />
              <div className="w-[300px] h-[580px] rounded-[48px] border-[8px] border-[#D4AF37] bg-[#800000] p-3 shadow-2xl relative z-10 flex flex-col justify-between transition-transform hover:scale-[1.03] duration-500 overflow-hidden">
                {/* Notch / Speaker */}
                <div className="w-24 h-4 bg-[#D4AF37] rounded-full mx-auto mb-4 shrink-0 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-black/60" />
                </div>

                {/* Inner Screen Content - Static Gold/Maroon Luxury Slots simulator */}
                <div className="flex-1 rounded-[32px] bg-gradient-to-b from-[#1a1a1a] via-[#800000]/60 to-[#1a1a1a] p-4 flex flex-col justify-between items-center relative overflow-hidden border border-amber-500/20">
                  {/* Gold rays in background */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

                  {/* Header */}
                  <div className="w-full flex justify-between items-center shrink-0">
                    <span className="text-[9px] font-extrabold text-[#D4AF37]">AURUM CASINO</span>
                    <div className="px-2 py-0.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#D4AF37] text-[8px] font-black">
                      LIVE
                    </div>
                  </div>

                  {/* Slots Game Reels Teaser */}
                  <div className="my-auto space-y-3 w-full text-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#F1D279] flex items-center justify-center shadow-lg mx-auto">
                      <Gamepad2 className="text-[#800000]" size={22} />
                    </div>
                    <h3 className="text-sm font-black text-white uppercase tracking-widest leading-tight">
                      King's Riches
                    </h3>
                    <p className="text-[9px] text-[#D4AF37] font-bold">SPIN TO WIN GRAND JACKPOT</p>

                    {/* Simulating slot reels */}
                    <div className="grid grid-cols-3 gap-1.5 bg-black/50 p-2.5 rounded-2xl border border-amber-500/30">
                      {["🎰", "💎", "👑"].map((emoji, idx) => (
                        <div key={idx} className="h-12 rounded-xl bg-gradient-to-b from-slate-900 to-black flex items-center justify-center text-lg border border-amber-500/10 shadow-inner">
                          {emoji}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Spin Button */}
                  <div className="w-full shrink-0">
                    <button 
                      type="button"
                      className="w-full py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F1D279] text-[#800000] font-black text-[10px] uppercase tracking-widest shadow-md"
                    >
                      SPIN NOW
                    </button>
                  </div>
                </div>

                {/* Home Indicator */}
                <div className="w-28 h-1 bg-[#D4AF37]/60 rounded-full mx-auto mt-3 shrink-0" />
              </div>
            </div>
          </div>
        </section>

        {/* Section: The Bull Wave Standard */}
        <section id="about" className="py-24 bg-[#fafafb] relative">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="max-w-3xl mx-auto space-y-4 mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-slate-800">The Bull Wave Standard</h2>
              <div className="w-20 h-1.5 bg-[#800000] mx-auto rounded-full" />
              <p className="text-lg text-slate-500 font-medium">We redefine online gaming by combining cutting-edge technology with unmatched transparency and security.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  icon: Gem, 
                  title: "Elite Experience", 
                  desc: "Access a curated selection of premium games designed for players who value quality and precision in every play."
                },
                { 
                  icon: Shield, 
                  title: "Secure Infrastructure", 
                  desc: "Our platform uses enterprise-grade encryption to ensure your assets and personal data remain protected at all times."
                },
                { 
                  icon: TrendingUp, 
                  title: "High Yields", 
                  desc: "Benefit from one of the industry's most competitive reward structures and a robust multi-tier referral ecosystem."
                }
              ].map((card, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#D4AF37] hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-[#D4AF37] mb-6">
                    <card.icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">{card.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section: Partnership */}
        <section id="partnership" className="py-24 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <div className="bg-gradient-to-r from-amber-50/80 via-orange-50/40 to-rose-50/70 border border-amber-200/60 p-8 md:p-16 rounded-[40px] text-center shadow-lg space-y-6">
              <span className="inline-block px-3 py-1 rounded-full bg-[#800000]/10 border border-[#800000]/20 text-[#800000] text-xs font-black uppercase tracking-wider">
                Exclusive Partnership
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-slate-800">Unlock Premium Rewards</h2>
              <p className="text-base text-slate-500 font-medium max-w-xl mx-auto leading-relaxed">
                Join the Bull Wave Games community using our verified invitation code to unlock premium membership benefits, instant cashbacks, and VIP status.
              </p>

              {/* Verified invitation code copy layout */}
              <div className="py-4">
                <button 
                  onClick={handleCopyCode}
                  className="bg-white border-2 border-dashed border-[#D4AF37] rounded-3xl px-8 py-5 flex items-center gap-3 mx-auto shadow-sm hover:scale-105 active:scale-95 transition-all group relative"
                >
                  <span className="text-2xl md:text-4xl font-extrabold text-[#800000] tracking-widest">382757617365</span>
                  <div className="w-8 h-8 rounded-full bg-[#D4AF37]/15 flex items-center justify-center text-[#D4AF37] group-hover:bg-[#D4AF37] group-hover:text-white transition-all">
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </div>
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 font-semibold tracking-wider whitespace-nowrap">
                    Click to copy referral code
                  </span>
                </button>
              </div>

              <div className="pt-6">
                <button 
                  onClick={() => router.push("/auth/signup?invite=382757617365")}
                  className="bg-gradient-to-r from-[#800000] to-[#b30000] text-white font-extrabold px-8 py-4 rounded-xl text-sm uppercase tracking-wider shadow-md hover:shadow-lg active:scale-95 transition-all"
                >
                  Redeem Invitation
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Games Portfolio */}
        <section id="games" className="py-24 bg-[#fafafb]">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="max-w-3xl mx-auto space-y-4 mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-slate-800">Our Portfolio</h2>
              <div className="w-20 h-1.5 bg-[#800000] mx-auto rounded-full" />
              <p className="text-lg text-slate-500 font-medium">Explore a sophisticated suite of games tailored for diverse strategic preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { 
                  icon: Flame, 
                  title: "Strategic Prediction", 
                  desc: "Harness your analytical skills in our signature high-reward color prediction modules."
                },
                { 
                  icon: Award, 
                  title: "Classic Tables", 
                  desc: "Experience the thrill of Rummy and Poker in an environment built for professional standards."
                },
                { 
                  icon: Star, 
                  title: "Premium Slots", 
                  desc: "High-fidelity visuals and fair mechanics define our collection of modern slot experiences."
                }
              ].map((card, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-[#D4AF37] hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center text-center">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-[#D4AF37] mb-6">
                    <card.icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-3">{card.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer id="support" className="bg-[#1A1A1A] text-white pt-20 pb-10 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-12 pb-16">
              
              <div className="md:col-span-2 space-y-6">
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#800000] to-[#D4AF37] flex items-center justify-center shadow-md">
                    <Gamepad2 className="text-white" size={18} />
                  </div>
                  <span className="text-xl font-black uppercase tracking-wider text-white">Bull Wave Games</span>
                </Link>
                <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                  India's premier destination for strategic online gaming. We provide a secure, transparent, and high-reward environment for players who demand the absolute best in entertainment excellence.
                </p>
                <div className="flex gap-4">
                  {["Telegram", "Instagram", "Twitter", "YouTube"].map((social) => (
                    <button 
                      key={social}
                      onClick={() => toast.info(`Connecting to our official ${social} channel...`)}
                      className="w-10 h-10 rounded-full bg-white/5 border border-white/10 hover:bg-[#800000] hover:text-white transition-all duration-300 text-sm flex items-center justify-center font-bold text-slate-300"
                    >
                      {social[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Platform links */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">Platform</h4>
                <ul className="space-y-2 text-sm text-slate-400 font-semibold">
                  {["About Us", "Our Portfolio", "Partnership", "Create Account"].map((link) => (
                    <li key={link}>
                      <a href="#" className="hover:text-amber-400 transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Resources links */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">Resources</h4>
                <ul className="space-y-2 text-sm text-slate-400 font-semibold">
                  {["Privacy Policy", "Terms of Service", "Responsible Gaming", "Security"].map((link) => (
                    <li key={link}>
                      <a href="#" className="hover:text-amber-400 transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support links */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">Support</h4>
                <ul className="space-y-2 text-sm text-slate-400 font-semibold">
                  {["Help Center", "Contact Us", "FAQs", "Live Chat"].map((link) => (
                    <li key={link}>
                      <a href="#" className="hover:text-amber-400 transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Bottom Footer block */}
            <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-semibold">
              <p>&copy; 2026 Bull Wave Games International. All rights reserved. Professional standards for elite gaming.</p>
              <div className="flex gap-6">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Shield size={14} className="text-[#D4AF37]" /> SSL Secured
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <HeartIcon width={14} height={14} className="text-[#D4AF37]" /> Play Responsibly
                </span>
              </div>
            </div>

          </div>
        </footer>

        {/* Floating Support Button */}
        <button 
          onClick={() => router.push("/support")}
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-tr from-[#800000] to-[#b30000] hover:scale-105 active:scale-95 text-white rounded-full flex items-center justify-center shadow-2xl z-50 transition-all border border-amber-200/20"
        >
          <Headphones size={24} />
        </button>

      </div>
    );
}

// Small helper for Responsibly badge icon
function HeartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}
