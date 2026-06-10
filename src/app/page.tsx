"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gamepad2, Star, Download, Flame, Volume2,
  Shield, Gem, Lock, TrendingUp, ChevronRight, ChevronDown, CheckCircle2, HelpCircle, Heart, Coins, ArrowRight,
  Users, Headphones, Gift, BookOpen, AlertCircle, Copy, Check, Menu, X, Award, Globe
} from "lucide-react";
import { MOCK_GAMES } from "@/constants/mockData";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

// FAQ Constant Data
const FAQ_DATA = [
  {
    question: "What is Bull Wave Club?",
    answer: "Bull Wave Club is India's premier high-end gaming destination. We offer a secure, licensed environment featuring slots, live casino dealer rooms, sports betting, rummy, and color prediction games built with top-tier technology and fair play verification."
  },
  {
    question: "How do I claim the ₹500 welcome bonus?",
    answer: "To claim your bonus, register an account using a verified referral code (e.g., '382757617365') and make your first deposit. The promotional balance will be credited to your wallet instantly."
  },
  {
    question: "How does the 6-Tier Agent Referral Program work?",
    answer: "Our affiliate model pays out commissions up to 6 levels down. When players register with your code, they become Tier 1 downlines. If they refer others, those become Tier 2, and so on. Yesterday's settlements are credited daily to your wallet at 01:00 AM."
  },
  {
    question: "Are the games fair and certified?",
    answer: "Absolutely. All slots, color prediction models, and card tables operate on verified Random Number Generators (RNG) and blockchain-hash seeds, guaranteeing completely unbiased outcomes."
  },
  {
    question: "How secure are deposits and withdrawals?",
    answer: "We employ enterprise-grade SSL encryption and collaborate with India's most secure UPI and banking networks. Withdrawals are processed instantly, typically hitting your verified account within minutes."
  }
];

export default function Dashboard() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const navItems = [
    { name: "About Us", hash: "#about", path: "/about" },
    { name: "Lobby", hash: "#games", path: "/lobby" },
    { name: "Referrals", hash: "#partnership", path: "/referrals" },
    { name: "Support", hash: "#support", path: "/support" }
  ];

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // State for Landing Page
  const [scrolled, setScrolled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [activeCategory, setActiveCategory] = useState("all");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // States for interactive King's Riches Slots game mockup
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState(["🎰", "💎", "👑"]);
  const [hasWon, setHasWon] = useState(false);
  const [balance, setBalance] = useState(1500);
  const [bet, setBet] = useState(50);
  const [lastWin, setLastWin] = useState(0);

  const handleSpin = () => {
    if (spinning) return;
    if (balance < bet) {
      toast.error("Insufficient mock balance! Depositing free chips... +₹1,500");
      setBalance(1500);
      return;
    }

    setBalance(prev => prev - bet);
    setSpinning(true);
    setHasWon(false);
    setLastWin(0);
    toast.info("Spinning King's Riches Slot...");

    const symbols = ["🎰", "💎", "👑", "🍒", "🔔", "💰", "7️⃣"];
    let count = 0;
    const interval = setInterval(() => {
      setReels([
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
      ]);
      count++;
      if (count > 10) {
        clearInterval(interval);

        // Randomly select outcome: 35% chance of Jackpot, 40% chance of standard match, 25% chance of lose
        const rand = Math.random();
        if (rand < 0.35) {
          const jackpotWin = bet * 50;
          setReels(["👑", "👑", "👑"]);
          setBalance(prev => prev + jackpotWin);
          setLastWin(jackpotWin);
          setSpinning(false);
          setHasWon(true);
          toast.success(`🏆 GRAND JACKPOT! +₹${jackpotWin} won!`, {
            duration: 4000,
            description: "3x Royal Crowns matched in King's Riches!"
          });
        } else if (rand < 0.75) {
          const matchWin = bet * 5;
          const matchSymbol = symbols[Math.floor(Math.random() * (symbols.length - 1))]; // Non-crown match
          setReels([matchSymbol, matchSymbol, "💎"]);
          setBalance(prev => prev + matchWin);
          setLastWin(matchWin);
          setSpinning(false);
          setHasWon(true);
          toast.success(`🎉 BIG WIN! +₹${matchWin} won!`, {
            duration: 3000,
            description: "Nice match! Keep spinning!"
          });
        } else {
          // Lose
          setReels([
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)],
            symbols[Math.floor(Math.random() * symbols.length)]
          ]);
          setSpinning(false);
          setHasWon(false);
          toast.error("No match. Spin again to win!");
        }
      }
    }, 150);
  };

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

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-[#D4AF37]/30 overflow-x-hidden scroll-smooth">
      <style>{`
        html::-webkit-scrollbar {
          display: none !important;
        }
        html {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}</style>

      {/* Widescreen Floating Header */}
      <header className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md py-3 shadow-md border-b border-amber-200/20" : "bg-transparent py-5"
        }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Bull Wave Logo" className="w-12 h-12 rounded-xl object-cover shadow-md border border-[#D4AF37]/25" />
            <span className={`text-xl font-black uppercase tracking-wider transition-colors duration-300 ${scrolled ? "text-[#800000]" : "text-white"
              }`}>Bull Wave Club</span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.hash}
                className={`text-sm font-bold tracking-wide transition-colors ${scrolled ? "text-slate-700 hover:text-[#800000]" : "text-white/90 hover:text-[#D4AF37]"
                  }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <button
                onClick={() => router.push("/lobby")}
                className="bg-gradient-to-r from-[#800000] to-[#b30000] text-white hover:from-[#b30000] hover:to-[#800000] text-xs font-black uppercase tracking-widest px-6 py-3 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                Go to Lobby
              </button>
            ) : (
              <>
                <button
                  onClick={() => router.push("/auth/login")}
                  className={`text-sm font-black uppercase tracking-wider transition-colors cursor-pointer ${scrolled ? "text-slate-700 hover:text-[#800000]" : "text-white/90 hover:text-[#D4AF37]"
                    }`}
                >
                  Log In
                </button>
                <button
                  onClick={() => router.push("/auth/signup")}
                  className="bg-gradient-to-r from-[#800000] to-[#b30000] text-white hover:from-[#b30000] hover:to-[#800000] text-xs font-black uppercase tracking-widest px-6 py-3 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-pointer"
                >
                  Join Now
                </button>
              </>
            )}
          </div>

          {/* Mobile Nav Button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-1.5 rounded-lg focus:outline-none"
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
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.hash}
                  onClick={() => setMenuOpen(false)}
                  className="text-base font-extrabold text-slate-800 hover:text-[#800000]"
                >
                  {item.name}
                </Link>
              ))}
              <hr className="border-slate-100" />
              <div className="flex gap-4">
                {isAuthenticated ? (
                  <button
                    onClick={() => { setMenuOpen(false); router.push("/lobby"); }}
                    className="flex-1 bg-gradient-to-r from-[#800000] to-[#b30000] text-white font-extrabold py-3 rounded-xl shadow-md cursor-pointer text-center"
                  >
                    Go to Lobby
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => { setMenuOpen(false); router.push("/auth/login"); }}
                      className="flex-1 border border-slate-200 text-slate-850 font-extrabold py-3 rounded-xl cursor-pointer"
                    >
                      Log In
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); router.push("/auth/signup"); }}
                      className="flex-1 bg-gradient-to-r from-[#800000] to-[#b30000] text-white font-extrabold py-3 rounded-xl shadow-md cursor-pointer"
                    >
                      Join Now
                    </button>
                  </>
                )}
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
            <h1 className="text-4xl md:text-7xl font-black leading-tight tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-slate-355">
              Elevated Gaming.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F1D279]">Real Rewards.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-350 leading-relaxed max-w-xl font-medium">
              Welcome to India's most trusted elite gaming destination. We provide a sophisticated environment for strategic gaming, high-stakes color prediction, and premium rewards.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {isAuthenticated ? (
                <button
                  onClick={() => router.push("/lobby")}
                  className="bg-gradient-to-r from-[#800000] to-[#b30000] text-white hover:from-[#b30000] hover:to-[#800000] px-8 py-4 rounded-xl text-sm font-extrabold uppercase tracking-widest shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all text-center cursor-pointer"
                >
                  Go to Lobby
                </button>
              ) : (
                <>
                  <button
                    onClick={() => router.push("/auth/signup")}
                    className="bg-gradient-to-r from-[#800000] to-[#b30000] text-white hover:from-[#b30000] hover:to-[#800000] px-8 py-4 rounded-xl text-sm font-extrabold uppercase tracking-widest shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all text-center cursor-pointer"
                  >
                    Create Account
                  </button>
                  <button
                    onClick={() => router.push("/auth/login")}
                    className="bg-white/10 hover:bg-white/15 border border-white/20 px-8 py-4 rounded-xl text-sm font-extrabold uppercase tracking-widest hover:-translate-y-0.5 active:translate-y-0 transition-all text-center cursor-pointer"
                  >
                    Member Login
                  </button>
                </>
              )}
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
                <div className="my-auto space-y-2.5 w-full text-center relative">

                  {/* Floating explodes/gold coins on jackpot win */}
                  {hasWon && (
                    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <motion.span
                          key={i}
                          initial={{
                            opacity: 0,
                            scale: 0.5,
                            x: 100 + Math.random() * 40,
                            y: 120
                          }}
                          animate={{
                            opacity: [0, 1, 1, 0],
                            scale: [0.5, 1.2, 1.2, 0.8],
                            x: Math.random() * 220,
                            y: Math.random() * 180 - 40,
                            rotate: Math.random() * 360
                          }}
                          transition={{
                            duration: 2 + Math.random() * 1.5,
                            repeat: Infinity,
                            ease: "easeOut"
                          }}
                          className="absolute text-base"
                        >
                          💰
                        </motion.span>
                      ))}
                    </div>
                  )}

                  {/* Logo/Badge */}
                  <div className="w-16 h-16 rounded-2xl border-2 border-[#D4AF37]/80 overflow-hidden shadow-lg mx-auto bg-black relative group transition-transform duration-300 hover:scale-105">
                    <img
                      src="/assets/games/kings_riches.png"
                      alt="King's Riches Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="text-xs font-black text-white uppercase tracking-widest leading-tight">
                    King's Riches
                  </h3>

                  {/* Game HUD */}
                  <div className="w-full grid grid-cols-2 gap-2 text-center text-[10px] bg-black/60 p-2 rounded-xl border border-amber-500/20 mb-2">
                    <div className="flex flex-col justify-center">
                      <span className="text-slate-400 block text-[7px] font-bold uppercase tracking-wider">MOCK BALANCE</span>
                      <span className="text-[#D4AF37] font-extrabold text-[11px]">₹{balance}</span>
                    </div>
                    <div className="flex flex-col justify-center items-center border-l border-amber-500/20">
                      <span className="text-slate-400 block text-[7px] font-bold uppercase tracking-wider">BET AMOUNT</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (bet > 10) setBet(b => b - 10);
                          }}
                          disabled={spinning}
                          className="w-3.5 h-3.5 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37] flex items-center justify-center font-bold text-[9px] hover:bg-[#D4AF37]/45 active:scale-90 transition-all shrink-0 cursor-pointer disabled:opacity-50"
                        >
                          -
                        </button>
                        <span className="text-white font-extrabold text-[10px] w-8">₹{bet}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (bet < 500) setBet(b => b + 10);
                          }}
                          disabled={spinning}
                          className="w-3.5 h-3.5 rounded bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#D4AF37] flex items-center justify-center font-bold text-[9px] hover:bg-[#D4AF37]/45 active:scale-90 transition-all shrink-0 cursor-pointer disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Flashing Gold LED Reels Frame */}
                  <div className="relative p-2.5 rounded-2xl bg-black/85 border border-amber-500/40 shadow-inner overflow-hidden">

                    {/* LED Top border */}
                    <div className="absolute top-1 left-0 right-0 flex justify-between px-2.5 z-15">
                      {[1, 2, 3, 4, 5].map((led) => (
                        <span
                          key={led}
                          className={`w-1 h-1 rounded-full ${spinning
                            ? (led % 2 === 0 ? 'bg-red-500 shadow-[0_0_4px_#ef4444]' : 'bg-yellow-400 shadow-[0_0_4px_#facc15]')
                            : hasWon
                              ? 'bg-[#D4AF37] shadow-[0_0_6px_#D4AF37]'
                              : 'bg-amber-500/40'
                            } transition-all duration-150`}
                        />
                      ))}
                    </div>

                    {/* Simulating slot reels */}
                    <div className={`grid grid-cols-3 gap-1.5 bg-black/80 p-1.5 rounded-xl border transition-all duration-300 ${hasWon ? "border-amber-400 shadow-[0_0_12px_rgba(212,175,55,0.5)]" : "border-amber-500/10"}`}>
                      {reels.map((emoji, idx) => (
                        <motion.div
                          key={idx}
                          animate={spinning ? {
                            y: [0, -20, 20, 0],
                            scale: [1, 0.95, 1.05, 1],
                          } : {}}
                          transition={{
                            repeat: spinning ? Infinity : 0,
                            duration: 0.15,
                            ease: "easeInOut"
                          }}
                          className={`h-12 rounded-xl bg-gradient-to-b from-slate-900 to-black flex items-center justify-center text-lg border border-amber-500/10 shadow-inner ${hasWon ? "border-amber-400" : ""}`}
                        >
                          {emoji}
                        </motion.div>
                      ))}
                    </div>

                    {/* LED Bottom border */}
                    <div className="absolute bottom-1 left-0 right-0 flex justify-between px-2.5 z-15">
                      {[1, 2, 3, 4, 5].map((led) => (
                        <span
                          key={led}
                          className={`w-1 h-1 rounded-full ${spinning
                            ? (led % 2 !== 0 ? 'bg-red-500 shadow-[0_0_4px_#ef4444]' : 'bg-yellow-400 shadow-[0_0_4px_#facc15]')
                            : hasWon
                              ? 'bg-[#D4AF37] shadow-[0_0_6px_#D4AF37]'
                              : 'bg-amber-500/40'
                            } transition-all duration-150`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Win Status HUD */}
                  {lastWin > 0 && (
                    <motion.div
                      initial={{ scale: 0.85, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/50 p-1.5 rounded-xl text-center shadow-lg"
                    >
                      <span className="text-[7px] text-amber-300 font-extrabold uppercase tracking-widest block">WINNER!</span>
                      <span className="text-white text-xs font-black tracking-wider animate-pulse block mt-0.5">
                        +₹{lastWin}
                      </span>
                    </motion.div>
                  )}

                </div>

                {/* Spin Button */}
                <div className="w-full shrink-0">
                  <button
                    type="button"
                    onClick={handleSpin}
                    disabled={spinning}
                    className={`w-full py-2.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F1D279] text-[#800000] font-black text-[10px] uppercase tracking-widest shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer ${spinning ? 'opacity-80 cursor-not-allowed' : ''}`}
                  >
                    {spinning ? "SPINNING..." : "SPIN NOW"}
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
      <section id="about" className="py-24 bg-[#fafafb] relative overflow-hidden border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <div className="max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-[#800000] text-xs font-black uppercase tracking-widest">WHY BULL WAVE?</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-850">The Bull Wave Standard</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#800000] to-[#D4AF37] mx-auto rounded-full" />
            <p className="text-base text-slate-500 font-medium">We redefine online gaming by combining cutting-edge technology with unmatched transparency and security.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Gem,
                title: "Elite Experience",
                desc: "Access a curated selection of premium games designed for players who value quality and precision in every play.",
                metric: "150+ Games"
              },
              {
                icon: Shield,
                title: "Secure Infrastructure",
                desc: "Our platform uses enterprise-grade encryption to ensure your assets and personal data remain protected at all times.",
                metric: "99.9% Uptime"
              },
              {
                icon: TrendingUp,
                title: "High Yields",
                desc: "Benefit from one of the industry's most competitive reward structures and a robust multi-tier referral ecosystem.",
                metric: "₹120M+ Paid Out"
              }
            ].map((card, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-md hover:shadow-xl hover:border-[#D4AF37]/50 hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center text-center group">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-[#D4AF37] mb-6 border border-amber-200/20 group-hover:scale-110 group-hover:bg-[#D4AF37] group-hover:text-black transition-all duration-300">
                  <card.icon size={30} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{card.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500 mb-6">{card.desc}</p>
                <span className="mt-auto px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-black tracking-wider">
                  {card.metric}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section: Partnership */}
      <section id="partnership" className="py-24 bg-white relative overflow-hidden border-t border-slate-100">
        {/* Subtle luxury light-gold and deep-red background glow orbs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#800000]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          {/* The outer box: upgraded with ultra-clean gold/rose shadow, thin gold/maroon border lines, and perfect symmetry */}
          <div className="bg-gradient-to-b from-[#ffffff] via-[#fdfdfd] to-[#f7f8f9] border border-amber-200/40 p-8 md:p-16 rounded-[48px] shadow-[0_25px_60px_rgba(128,0,0,0.04)] relative overflow-hidden text-center space-y-10 group">

            {/* Gold light reflection lines */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-50/5 via-transparent to-transparent pointer-events-none" />

            <div className="space-y-4">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#800000]/10 to-[#D4AF37]/10 border border-[#D4AF37]/35 text-[#800000] text-xs font-black uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                EXCLUSIVE AFFILIATE CLUB
              </span>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight">
                Unlock <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#800000] to-[#b30000]">6-Tier</span> Premium Rewards
              </h2>
              <p className="text-base text-slate-500 font-semibold max-w-xl mx-auto leading-relaxed">
                Join the Bull Wave Club VIP partner community. Earn high commissions up to 6 downline levels with automated settlements credited daily at 01:00 AM.
              </p>
            </div>

            {/* Verified invitation code copy layout - VIP Member Card Style */}
            <div className="py-6 max-w-md mx-auto relative group/card">
              {/* Glowing light behind the card */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#800000]/30 to-[#D4AF37]/20 blur-2xl rounded-3xl opacity-60 group-hover/card:opacity-80 transition-opacity duration-500 -z-10" />

              {/* The credit card body */}
              <div className="relative bg-gradient-to-br from-[#1e1e1e] via-[#2c2c2c] to-[#0a0a0a] border-[1.5px] border-[#D4AF37] rounded-3xl p-6 shadow-[0_20px_40px_rgba(0,0,0,0.3)] flex flex-col justify-between overflow-hidden aspect-[1.62/1] transition-transform duration-500 hover:scale-[1.02] hover:shadow-[0_25px_50px_rgba(0,0,0,0.4)]">
                {/* Glossy card reflections */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 transform -translate-x-full group-hover/card:translate-x-full transition-transform duration-1000 ease-out" />

                {/* Top card row: Branding & Hologram / gold chip */}
                <div className="flex justify-between items-start mb-4">
                  <div className="text-left space-y-1">
                    <span className="text-[10px] font-black text-[#D4AF37] tracking-widest block uppercase">BULL WAVE CLUB</span>
                    <span className="text-[7px] text-white/50 tracking-wider block uppercase">ELITE MEMBERSHIP</span>
                  </div>
                  {/* VIP gold tag */}
                  <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] via-[#f1d279] to-[#D4AF37] border border-amber-300 text-black text-[9px] font-black tracking-widest shadow-sm flex items-center justify-center uppercase">
                    VIP GOLD
                  </div>
                </div>

                {/* Smart chip illustration (SVG) */}
                <div className="w-10 h-8 rounded-md bg-gradient-to-br from-[#E2B755] via-[#FCE38A] to-[#D5A738] p-1 shadow-inner relative flex flex-col justify-between overflow-hidden border border-[#B68C2D] shrink-0 self-start">
                  <div className="flex justify-between">
                    <div className="w-1.5 h-1.5 border-r border-b border-black/30" />
                    <div className="w-1.5 h-1.5 border-l border-b border-black/30" />
                  </div>
                  <div className="w-full h-px bg-black/25 my-auto" />
                  <div className="flex justify-between">
                    <div className="w-1.5 h-1.5 border-r border-t border-black/30" />
                    <div className="w-1.5 h-1.5 border-l border-t border-black/30" />
                  </div>
                  {/* Chip line markings */}
                  <div className="absolute inset-y-0 left-1/3 w-px bg-black/25" />
                  <div className="absolute inset-y-0 right-1/3 w-px bg-black/25" />
                </div>

                {/* Middle row: Invitation Code */}
                <div className="space-y-1.5 text-center my-auto">
                  <span className="text-white/40 text-[8px] font-black uppercase tracking-widest">OFFICIAL REFERRAL CODE</span>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl md:text-3.5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#FCE38A] to-[#D4AF37] tracking-widest font-mono drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                      382757617365
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="w-9 h-9 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#FCE38A] text-[#800000] hover:scale-110 active:scale-95 flex items-center justify-center shadow-[0_4px_12px_rgba(212,175,55,0.4)] hover:shadow-[0_6px_16px_rgba(212,175,55,0.6)] transition-all cursor-pointer shrink-0"
                      title="Copy Invitation Code"
                    >
                      {copied ? <CheckCircle2 size={16} className="stroke-[2.5]" /> : <Copy size={16} className="stroke-[2.5]" />}
                    </button>
                  </div>
                </div>

                {/* Bottom row: Cardholder/Validity stats */}
                <div className="flex justify-between items-center text-[9px] font-bold text-white/60 border-t border-white/10 pt-4 mt-2">
                  <div className="text-left">
                    <span className="text-[7px] text-white/30 block uppercase tracking-wider">DAILY SETTLEMENT</span>
                    <span className="text-[#D4AF37] font-black uppercase">01:00 AM DAILY</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[7px] text-white/30 block uppercase tracking-wider">MEMBERSHIP NETWORK</span>
                    <span className="text-[#D4AF37] font-black uppercase">6-TIERS ACTIVE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3 Step Flowchart - Upgraded to beautiful glass cards with Lucide icons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 relative">
              {[
                {
                  step: "01",
                  title: "Share Invitation",
                  desc: "Send your invite code or link to friends to register.",
                  icon: Users,
                  color: "bg-[#800000]/10 border-[#800000]/20 text-[#800000]"
                },
                {
                  step: "02",
                  title: "Friends Play",
                  desc: "They participate in lottery, slots, casino or rummy.",
                  icon: Gamepad2,
                  color: "bg-amber-500/10 border-amber-500/20 text-[#D4AF37]"
                },
                {
                  step: "03",
                  title: "Earn 6-Tier Cash",
                  desc: "Receive automated payouts credited daily.",
                  icon: Coins,
                  color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                }
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="flex flex-col items-center p-6 bg-white/70 backdrop-blur-md rounded-[28px] border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:border-[#D4AF37]/30 hover:-translate-y-1 transition-all duration-300 relative group/step">

                    {/* Step Badge */}
                    <span className="absolute top-4 right-5 text-[28px] font-black text-slate-150 group-hover/step:text-[#D4AF37]/20 font-mono select-none transition-colors">
                      {item.step}
                    </span>

                    {/* Premium Circle Icon wrapper */}
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 border shadow-sm ${item.color} group-hover/step:scale-110 transition-transform`}>
                      <Icon size={22} className="stroke-[2.2]" />
                    </div>

                    <h4 className="text-base font-black text-slate-800 mb-1.5">{item.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">{item.desc}</p>

                    {/* Modern flowing line connector with pulsing gold dot */}
                    {idx < 2 && (
                      <div className="hidden md:flex items-center absolute right-[-24px] top-1/2 -translate-y-1/2 z-10 w-12 justify-center">
                        <div className="w-full h-[1.5px] bg-gradient-to-r from-slate-200 to-slate-100 relative">
                          <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#D4AF37] animate-ping" />
                          <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Action Button - Upgraded to wide golden gradient text on high-end red base */}
            <div className="pt-6">
              <button
                type="button"
                onClick={() => router.push(isAuthenticated ? "/referrals" : "/auth/signup?invite=382757617365")}
                className="group bg-gradient-to-r from-[#800000] via-[#a30000] to-[#800000] text-[#FCE38A] hover:text-white font-black px-12 py-4.5 rounded-2xl text-xs uppercase tracking-widest shadow-[0_8px_30px_rgba(128,0,0,0.15)] hover:shadow-[0_12px_40px_rgba(128,0,0,0.25)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer border border-[#D4AF37]/40 flex items-center gap-2 mx-auto"
              >
                <span>Redeem Invitation Link</span>
                <ChevronRight size={14} className="stroke-[2.5] transform group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section: Games Portfolio */}
      <section id="games" className="py-24 bg-[#fafafb] border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-[#800000] text-xs font-black uppercase tracking-widest">OUR PORTFOLIO</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-850">Explore Premium Games</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#800000] to-[#D4AF37] mx-auto rounded-full" />
            <p className="text-lg text-slate-500 font-medium">Explore a sophisticated suite of games tailored for diverse strategic preferences.</p>
          </div>

          {/* Category Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {[
              { id: "all", name: "All Categories", icon: Gamepad2 },
              { id: "lottery", name: "Lottery", icon: Flame },
              { id: "slots", name: "Slots", icon: Star },
              { id: "casino", name: "Live Casino", icon: Globe },
              { id: "rummy", name: "Rummy", icon: Award },
              { id: "sports", name: "Sports", icon: TrendingUp }
            ].map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs font-black uppercase tracking-wider border transition-all cursor-pointer ${activeCategory === cat.id
                    ? "bg-gradient-to-r from-[#800000] to-[#b30000] text-white border-transparent shadow-lg"
                    : "bg-white text-slate-500 border-slate-200 hover:text-[#800000] hover:border-[#800000]"
                    }`}
                >
                  <Icon size={14} />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <AnimatePresence mode="popLayout">
              {MOCK_GAMES.filter(game => {
                if (activeCategory === "all") return ["lottery", "slots", "casino", "rummy", "sports"].includes(game.category);
                return game.category === activeCategory;
              }).slice(0, 6).map((game) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  key={game.id}
                  className="group bg-white border border-slate-100 rounded-[24px] overflow-hidden shadow-md hover:shadow-xl hover:border-[#D4AF37]/50 transition-all duration-300 flex flex-col relative"
                >
                  {/* Thumbnail */}
                  <div className="aspect-[4/3] w-full relative overflow-hidden bg-slate-950">
                    <img
                      src={game.image}
                      alt={game.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" />

                    {/* Live Badge */}
                    {game.isLive && (
                      <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600/90 text-white text-[9px] font-black tracking-widest shadow-md">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        LIVE
                      </div>
                    )}

                    {/* Provider Badge */}
                    {(game as any).provider && (
                      <div className="absolute top-4 right-4 px-2.5 py-1 rounded bg-black/70 border border-[#D4AF37]/30 text-[#D4AF37] text-[9px] font-black tracking-wider">
                        {(game as any).provider}
                      </div>
                    )}

                    {/* Hover Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/60 transition-opacity duration-300">
                      <button
                        onClick={() => router.push(isAuthenticated ? `/games/${game.id}` : "/auth/signup")}
                        className="bg-[#D4AF37] text-black font-black text-xs px-5 py-3 rounded-xl shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 uppercase tracking-widest cursor-pointer"
                      >
                        Play Now
                      </button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-black text-slate-800">{game.title}</h3>
                        <div className="flex gap-0.5 text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={11} fill="currentColor" />
                          ))}
                        </div>
                      </div>
                      {game.tags && (
                        <div className="flex flex-wrap gap-1">
                          {game.tags.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4 border-t border-slate-100 pt-4 text-[11px] font-bold text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users size={12} className="text-[#D4AF37]" />
                        {(game.players / 1000).toFixed(1)}k Playing
                      </span>
                      <button
                        onClick={() => router.push(isAuthenticated ? `/games/${game.id}` : "/auth/signup")}
                        className="text-[#800000] hover:text-[#b30000] flex items-center gap-0.5 text-[10px] uppercase font-black tracking-wider transition-colors cursor-pointer"
                      >
                        Play <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center space-y-4 mb-16">
            <span className="text-[#800000] text-xs font-black uppercase tracking-widest">HELP CENTER</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-850">Frequently Asked Questions</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#800000] to-[#D4AF37] mx-auto rounded-full" />
          </div>

          <div className="space-y-4">
            {FAQ_DATA.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200/80 rounded-2xl bg-[#fafafb] overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex justify-between items-center p-6 text-left text-slate-850 font-extrabold text-sm md:text-base hover:bg-slate-100/40 transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      size={18}
                      className={`text-[#D4AF37] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                      >
                        <div className="p-6 pt-0 text-slate-500 text-xs md:text-sm font-medium leading-relaxed border-t border-slate-200/60 bg-white">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="support" className="bg-[#0c0c0e] text-white pt-20 pb-10 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-12 pb-16">

            <div className="md:col-span-2 space-y-6">
              <Link href="/" className="flex items-center gap-2">
                <img src="/logo.png" alt="Bull Wave Logo" className="w-16 h-16 rounded-2xl object-cover shadow-md border border-[#D4AF37]/35" />
                <span className="text-3xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-[#D4AF37] to-white">Bull Wave Club</span>
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
                India's premier destination for strategic online gaming. We provide a secure, transparent, and high-reward environment for players who demand the absolute best in entertainment excellence.
              </p>
              <div className="flex gap-4">
                {[
                  {
                    name: "Telegram",
                    icon: (
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.98 1.25-5.59 3.69-.53.36-1 .54-1.42.52-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.36-.49.99-.75 3.88-1.69 6.46-2.8 7.74-3.32 3.68-1.5 4.44-1.76 4.94-1.77.11 0 .36.03.52.16.14.12.18.28.2.45.02.1.03.28.01.46z" />
                      </svg>
                    )
                  },
                  {
                    name: "Instagram",
                    icon: (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                    )
                  },
                  {
                    name: "Twitter/X",
                    icon: (
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    )
                  },
                  {
                    name: "YouTube",
                    icon: (
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                      </svg>
                    )
                  }
                ].map((social) => (
                  <button
                    key={social.name}
                    onClick={() => toast.info(`Connecting to our official ${social.name} channel...`)}
                    className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 hover:border-[#D4AF37] hover:text-[#D4AF37] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center text-slate-300 cursor-pointer"
                    title={social.name}
                  >
                    {social.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Platform links */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#D4AF37]">Platform</h4>
              <ul className="space-y-2 text-sm text-slate-400 font-semibold">
                {[
                  { name: "About Us", hash: "#about" },
                  { name: "Lobby", hash: "#games" },
                  { name: "Referrals", hash: "#partnership" },
                  { name: isAuthenticated ? "Go to Lobby" : "Create Account", hash: isAuthenticated ? "/lobby" : "/auth/signup" }
                ].map((link) => {
                  return (
                    <li key={link.name}>
                      <Link href={link.hash} className="text-slate-400 hover:text-[#D4AF37] transition-colors">
                        {link.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Resources links */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#D4AF37]">Resources</h4>
              <ul className="space-y-2 text-sm text-slate-400 font-semibold">
                {["Privacy Policy", "Terms of Service", "Responsible Gaming", "Security"].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-slate-400 hover:text-[#D4AF37] transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support links */}
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#D4AF37]">Support</h4>
              <ul className="space-y-2 text-sm text-slate-400 font-semibold">
                {[
                  { name: "Help Center", hash: "#support" },
                  { name: "Contact Us", hash: "#support" },
                  { name: "FAQs", hash: "#support" },
                  { name: "Live Chat", hash: "#support" }
                ].map((link) => {
                  return (
                    <li key={link.name}>
                      <Link href={link.hash} className="text-slate-400 hover:text-[#D4AF37] transition-colors">
                        {link.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

          </div>


          {/* Bottom Footer block */}
          <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-semibold">
            <p>&copy; 2026 Bull Wave Club International. All rights reserved. Professional standards for elite gaming.</p>
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
        onClick={() => {
          const el = document.getElementById("support");
          if (el) {
            el.scrollIntoView({ behavior: "smooth" });
          } else {
            router.push("/support");
          }
        }}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-tr from-[#800000] to-[#b30000] hover:scale-105 active:scale-95 text-white rounded-full flex items-center justify-center shadow-2xl z-50 transition-all border border-amber-200/20 cursor-pointer"
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
