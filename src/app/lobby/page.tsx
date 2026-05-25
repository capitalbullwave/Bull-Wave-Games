"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Gamepad2, Star, Download, Flame, Volume2, 
  ChevronRight, Users, Gift, ArrowLeft, Trophy, Dices, Heart, Coins, Award, Compass
} from "lucide-react";
import { MOCK_GAMES } from "@/constants/mockData";
import Link from "next/link";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

export default function LobbyPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Protect the route client-side: if not logged in, redirect to login page
  useEffect(() => {
    if (mounted && !isAuthenticated) {
      toast.error("Please log in to access the gaming lobby.");
      router.push("/auth/login");
    }
  }, [mounted, isAuthenticated, router]);

  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Prevent hydration mismatches
  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#800000] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const categories = [
    { id: "popular", name: "Popular", bg: "from-blue-600 to-indigo-600", desc: "Top Rated", icon: Trophy },
    { id: "lottery", name: "Lottery", bg: "from-purple-600 to-pink-600", desc: "Provably Fair", icon: Dices },
    { id: "casino", name: "Casino", bg: "from-orange-500 to-red-500", desc: "Live Dealers", icon: Heart },
    { id: "slots", name: "Slots", bg: "from-violet-600 to-purple-800", desc: "Jackpots", icon: Coins },
    { id: "sports", name: "Sports", bg: "from-amber-500 to-yellow-600", desc: "Match Odds", icon: Award },
    { id: "rummy", name: "PVC", bg: "from-sky-500 to-blue-700", desc: "Classic Cards", icon: Compass },
    { id: "fishing", name: "Fishing", bg: "from-cyan-500 to-teal-600", desc: "Skill Shooter", icon: Gamepad2 },
    { id: "original", name: "Mini games", bg: "from-teal-500 to-emerald-600", desc: "Crash Formats", icon: Gamepad2 }
  ];

  const filteredGames = MOCK_GAMES.filter((game) => {
    const matchesCategory = activeCategory === "all" || activeCategory === "popular" || game.category === activeCategory;
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleBackToLobby = () => {
    setActiveCategory("all");
  };

  // If activeCategory is a specific selection, render the high-fidelity Sub-Page Category View!
  if (activeCategory !== "all") {
    const currentCategoryObj = categories.find(c => c.id === activeCategory) || categories[0];
    return (
      <div className="space-y-4 animate-in slide-in-from-right duration-300 pb-10 bg-slate-50 min-h-screen">
        
        {/* 1. Sub-page Brand Header */}
        <div className="flex items-center justify-between px-2 py-3 bg-white border-b border-slate-200/60 sticky top-0 z-40">
          <button 
            onClick={handleBackToLobby}
            className="p-1 rounded-full hover:bg-slate-100 text-slate-700 active:scale-95 transition-all shrink-0"
          >
            <ArrowLeft size={20} className="stroke-[3]" />
          </button>
          <h2 className="text-base font-black text-slate-800 uppercase tracking-wide">All</h2>
          <div className="w-8 shrink-0" />
        </div>

        {/* 2. Horizontal Category Tab Scrollbar (Mirroring Screenshots) */}
        <div className="w-full overflow-x-auto no-scrollbar py-1 bg-white border-b border-slate-200/40">
          <div className="flex items-center gap-3 px-3 w-max">
            {categories.map((cat) => {
              const IconComp = cat.icon;
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    toast.info(`Switched to "${cat.name}" category.`);
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl transition-all text-xs font-black shrink-0 shadow-sm ${
                    isSelected 
                      ? "bg-[#f96c6c] text-white" 
                      : "bg-slate-50 border border-slate-200/50 text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  <IconComp size={14} className={isSelected ? "text-white" : "text-slate-400"} />
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Category Game Content Layouts */}
        <div className="px-4 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              {currentCategoryObj.name} Selection
            </h3>
            <span className="text-[10px] text-slate-400 font-extrabold">{filteredGames.length} Games Active</span>
          </div>

          {/* RENDER A: LOTTERY PAGE LAYOUT (Screenshot 2) */}
          {activeCategory === "lottery" && (
            <div className="space-y-3.5">
              {filteredGames.map((game) => (
                <Link
                  key={game.id}
                  href={`/games/${game.id}`}
                  className="bg-gradient-to-r from-rose-500 to-rose-400 text-white rounded-3xl p-5 flex justify-between items-center relative overflow-hidden shadow-md hover:scale-[1.01] active:scale-95 transition-all block text-left"
                >
                  <div className="space-y-1 z-10">
                    <h4 className="text-lg font-black tracking-wide">{game.title}</h4>
                    <p className="text-[10px] text-white/90 font-bold tracking-wide uppercase">{game.tags[0]}</p>
                    <p className="text-[9px] text-white/80 font-semibold">{game.tags[1]}</p>
                  </div>
                  {/* Floating asset/image wrapper */}
                  <div className="relative z-10 shrink-0 w-20 h-20 bg-white/10 rounded-2xl overflow-hidden border border-white/20 shadow-md transform rotate-6 hover:rotate-0 transition-transform">
                    <img src={game.image} className="w-full h-full object-cover" alt="" />
                  </div>
                  <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-3 translate-y-3 shrink-0">
                    <Dices size={80} />
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* RENDER B: CASINO PAGE LAYOUT (Screenshot 3) */}
          {activeCategory === "casino" && (
            <div className="grid grid-cols-2 gap-3.5">
              {filteredGames.map((game) => (
                <Link
                  key={game.id}
                  href={`/games/${game.id}`}
                  className="bg-gradient-to-b from-rose-600 via-rose-700 to-rose-950 rounded-3xl overflow-hidden relative shadow-lg group block hover:scale-[1.02] active:scale-95 transition-all aspect-[3/4]"
                >
                  <img 
                    src={game.image} 
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay group-hover:scale-105 transition-transform duration-500" 
                    alt="" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex flex-col justify-end p-3 text-left">
                    <p className="text-[9px] text-white/70 font-bold uppercase">{game.tags[1]}</p>
                    <h4 className="text-sm font-extrabold text-white leading-tight">{game.title}</h4>
                    <span className="text-[8px] bg-white/20 backdrop-blur-md border border-white/30 text-white rounded px-1.5 py-0.5 w-max mt-1 font-bold">
                      {game.tags[0]}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* RENDER C: SLOTS PAGE LAYOUT (Screenshot 4) */}
          {activeCategory === "slots" && (
            <div className="space-y-6">
              
              {/* JILI Provider Slots */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-[#D4AF37]/20 pb-2">
                  <div className="w-2.5 h-4 bg-[#800000] rounded-sm shrink-0" />
                  <h4 className="text-xs font-black text-[#800000] uppercase tracking-wide flex items-center gap-1.5">
                    JILI Slots
                  </h4>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {filteredGames.filter(g => g.title.includes("JILI")).map((game) => (
                    <Link
                      key={game.id}
                      href={`/games/${game.id}`}
                      className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm block hover:scale-[1.02] active:scale-95 transition-all text-center p-1"
                    >
                      <div className="aspect-square rounded-xl overflow-hidden mb-1 relative">
                        <img src={game.image} className="w-full h-full object-cover" alt="" />
                        <span className="absolute top-1 right-1 bg-[#800000] text-white text-[7px] font-black px-1 rounded uppercase">JILI</span>
                      </div>
                      <p className="text-[9px] font-black text-slate-800 truncate px-0.5">{game.title.replace(" (JILI)", "")}</p>
                    </Link>
                  ))}
                </div>
                
                {/* Coral Slots Lobby Call-to-action */}
                <button 
                  onClick={() => toast.success("Initiating absolute provider matchmakers...")}
                  className="w-full bg-[#f96c6c] hover:bg-[#f96c6c]/90 text-white font-black text-[10px] py-3.5 rounded-full shadow-sm active:scale-95 transition-all"
                >
                  All Games
                </button>
              </div>

              {/* PG Provider Slots */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-[#D4AF37]/20 pb-2">
                  <div className="w-2.5 h-4 bg-[#800000] rounded-sm shrink-0" />
                  <h4 className="text-xs font-black text-[#800000] uppercase tracking-wide flex items-center gap-1.5">
                    PG Slots
                  </h4>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {filteredGames.filter(g => g.title.includes("PG")).map((game) => (
                    <Link
                      key={game.id}
                      href={`/games/${game.id}`}
                      className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm block hover:scale-[1.02] active:scale-95 transition-all text-center p-1"
                    >
                      <div className="aspect-square rounded-xl overflow-hidden mb-1 relative">
                        <img src={game.image} className="w-full h-full object-cover" alt="" />
                        <span className="absolute top-1 right-1 bg-amber-600 text-white text-[7px] font-black px-1 rounded uppercase">PG</span>
                      </div>
                      <p className="text-[9px] font-black text-slate-800 truncate px-0.5">{game.title.replace(" (PG)", "")}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* RENDER D: SPORTS PAGE LAYOUT (Screenshot 5) */}
          {activeCategory === "sports" && (
            <div className="grid grid-cols-2 gap-3.5">
              {filteredGames.map((game) => (
                <Link
                  key={game.id}
                  href={`/games/${game.id}`}
                  className="bg-gradient-to-b from-[#800000] via-[#9e0000]/95 to-slate-900 rounded-3xl overflow-hidden relative shadow-lg group block hover:scale-[1.02] active:scale-95 transition-all aspect-[3/4]"
                >
                  <img 
                    src={game.image} 
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay group-hover:scale-105 transition-transform duration-500" 
                    alt="" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent flex flex-col justify-end p-3 text-left">
                    <p className="text-[9px] text-[#D4AF37] font-black tracking-wider uppercase">{game.tags[1]}</p>
                    <h4 className="text-base font-extrabold text-white leading-tight mt-0.5">{game.title}</h4>
                    <span className="text-[8px] bg-white/20 backdrop-blur-md border border-white/30 text-white rounded px-1.5 py-0.5 w-max mt-2.5 font-bold uppercase">
                      {game.tags[0]}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* RENDER F: FISHING PAGE LAYOUT (Fishing Screenshot) */}
          {activeCategory === "fishing" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-[#D4AF37]/20 pb-2">
                <div className="w-2.5 h-4 bg-[#800000] rounded-sm shrink-0" />
                <h4 className="text-xs font-black text-[#800000] uppercase tracking-wide">
                  Fishing
                </h4>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {filteredGames.map((game) => (
                  <Link
                    key={game.id}
                    href={`/games/${game.id}`}
                    className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm block hover:scale-[1.02] active:scale-95 transition-all text-center p-1"
                  >
                    <div className="aspect-[3/4] rounded-xl overflow-hidden mb-1 relative">
                      <img src={game.image} className="w-full h-full object-cover" alt="" />
                      <span className="absolute top-1 right-1 bg-[#800000] text-white text-[7px] font-black px-1 rounded uppercase">JILI</span>
                    </div>
                    <p className="text-[9px] font-black text-slate-800 truncate px-0.5 uppercase leading-tight">{game.title}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* RENDER G: MINI GAMES / ORIGINAL LAYOUT (Mini Games Screenshot) */}
          {activeCategory === "original" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-[#D4AF37]/20 pb-2">
                <div className="w-2.5 h-4 bg-[#800000] rounded-sm shrink-0" />
                <h4 className="text-xs font-black text-[#800000] uppercase tracking-wide">
                  Mini games
                </h4>
              </div>
              <div className="grid grid-cols-3 gap-2.5">
                {filteredGames.map((game) => (
                  <Link
                    key={game.id}
                    href={`/games/${game.id}`}
                    className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm block hover:scale-[1.02] active:scale-95 transition-all text-center p-1"
                  >
                    <div className="aspect-[3/4] rounded-xl overflow-hidden mb-1 relative">
                      <img src={game.image} className="w-full h-full object-cover" alt="" />
                      {game.title.includes("Jili") && (
                        <span className="absolute top-1 right-1 bg-[#800000] text-white text-[7px] font-black px-1 rounded uppercase">JILI</span>
                      )}
                    </div>
                    <p className="text-[9px] font-black text-slate-800 truncate px-0.5 uppercase leading-tight">{game.title.replace(" Jili", "").replace(" Box", "").replace(" Dark", "")}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* RENDER E: GENERAL / FALLBACK CATEGORY VIEWS (Rummy) */}
          {activeCategory !== "lottery" && activeCategory !== "casino" && activeCategory !== "slots" && activeCategory !== "sports" && activeCategory !== "fishing" && activeCategory !== "original" && (
            <div className="space-y-3.5">
              {filteredGames.map((game) => (
                <Link
                  key={game.id}
                  href={`/games/${game.id}`}
                  className="bg-white border border-slate-200/50 text-slate-800 rounded-3xl p-4 flex justify-between items-center relative overflow-hidden shadow-sm hover:scale-[1.01] active:scale-95 transition-all block text-left"
                >
                  <div className="space-y-1.5 z-10">
                    <h4 className="text-sm font-black text-slate-800 leading-tight">{game.title}</h4>
                    <span className="inline-block text-[8px] font-black bg-emerald-500/10 text-emerald-600 rounded px-1.5 py-0.5 uppercase tracking-wide">
                      {game.tags[0]}
                    </span>
                    <p className="text-[9px] text-slate-400 font-bold">{game.tags[1] || "Automated payouts"}</p>
                  </div>
                  {/* Floating graphic */}
                  <div className="relative z-10 shrink-0 w-16 h-16 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                    <img src={game.image} className="w-full h-full object-cover" alt="" />
                  </div>
                </Link>
              ))}
            </div>
          )}

        </div>
      </div>
    );
  }

  // Otherwise, render the gorgeous Standard Main Dashboard Lobby page
  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      
      {/* 1. Hero Promo Banner Carousel */}
      <section className="relative w-full h-40 rounded-2xl overflow-hidden group shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#800000]/90 to-[#D4AF37]/80 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1518136247453-74e7b5265980?w=800&q=80" 
          alt="Promotional Banner" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-center p-5">
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[9px] font-black uppercase tracking-wider w-max mb-1">
            Model Brand • Reputation Guarantee
          </span>
          <h2 className="text-xl md:text-2xl font-black text-white leading-tight">
            Daman India's Largest Online <br/>
            <span className="text-[#D4AF37] neon-text-blue">Entertainment Platform</span>
          </h2>
          <p className="text-[10px] text-white/80 mt-1">First-class safety, instant withdrawals & VIP bonuses.</p>
        </div>
      </section>

      {/* 2. Text Ticker / Notice Board */}
      <section className="bg-white border border-[#D4AF37]/20 rounded-xl px-3 py-2 flex items-center justify-between gap-2 shadow-sm h-10 overflow-hidden">
        <div className="flex items-center gap-2 flex-1 overflow-hidden h-full relative">
          <Volume2 size={16} className="text-[#800000] animate-bounce shrink-0 z-10 bg-white pr-1" />
          <div className="flex-1 h-full overflow-hidden relative flex items-center">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: "-100%" }}
              transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
              className="text-xs font-semibold text-[#800000] whitespace-nowrap absolute"
            >
              Important Alert: All deposit channels on DamanGames are instant and zero-fee. Upgrade to VIP and enjoy 5% rebate bonus!
            </motion.div>
          </div>
        </div>
        <button 
          onClick={() => toast.success("Opening Notice details...")}
          className="bg-[#800000] text-white text-[10px] font-extrabold px-3 py-1 rounded-full shrink-0 shadow-sm active:scale-95 transition-all z-10"
        >
          Detail
        </button>
      </section>

      {/* 3. Category Selection Grid */}
      <section className="grid grid-cols-2 gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveCategory(cat.id);
              toast.info(`Opening "${cat.name}" category page...`);
            }}
            className={`p-3 rounded-xl bg-gradient-to-r ${cat.bg} text-white flex flex-col justify-between h-20 transition-all hover:scale-[1.02] active:scale-95 shadow-md relative overflow-hidden ${
              activeCategory === cat.id ? "ring-2 ring-white scale-[1.02]" : ""
            }`}
          >
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-2 translate-y-2">
              <Gamepad2 size={60} />
            </div>
            <div>
              <p className="font-extrabold text-sm text-left leading-none">{cat.name}</p>
              <span className="text-[9px] opacity-75 font-medium block text-left mt-0.5">{cat.desc}</span>
            </div>
          </button>
        ))}
      </section>

      {/* 4. Platform Recommendations */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Flame size={18} className="text-[#800000]" />
            <h3 className="text-sm font-black text-[#800000] uppercase tracking-wide">
              Recommended Games
            </h3>
          </div>
          <button 
            onClick={() => {
              setActiveCategory("lottery");
              toast.info("Opening all lottery games...");
            }}
            className="text-[10px] font-black text-[#800000] bg-white border border-[#D4AF37]/30 px-2.5 py-1 rounded-full shadow-sm active:scale-95 transition-all"
          >
            Show All
          </button>
        </div>

        {/* Lobby items layout */}
        <div className="grid grid-cols-2 gap-3">
          {filteredGames.slice(0, 4).map((game) => (
            <Link 
              key={game.id} 
              href={`/games/${game.id}`}
              className="bg-white border border-[#D4AF37]/15 rounded-xl overflow-hidden shadow-md block hover:scale-[1.02] transition-transform"
            >
              <div className="relative aspect-[4/3] w-full">
                <img 
                  src={game.image} 
                  alt={game.title} 
                  className="w-full h-full object-cover" 
                />
                {game.isLive && (
                  <span className="absolute top-1.5 left-1.5 bg-red-600 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded uppercase animate-pulse">
                    Live
                  </span>
                )}
              </div>
              <div className="p-2 space-y-1">
                <p className="text-xs font-extrabold text-slate-800 truncate">{game.title}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-[#800000] font-black">Entry: ₹10</span>
                  <div className="flex items-center gap-0.5 text-yellow-500">
                    <Star size={8} fill="currentColor" />
                    <span className="text-[8px] font-bold text-slate-500">4.9</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Add To Desktop Floating Banner */}
      <section className="bg-gradient-to-r from-[#800000] to-[#600000] border border-[#D4AF37]/20 p-3 rounded-2xl flex items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-md">
            <Gamepad2 size={16} className="text-[#800000]" />
          </div>
          <div>
            <p className="text-[10px] font-black text-white leading-none">Add Daman to Desktop</p>
            <span className="text-[8px] text-[#D4AF37] font-medium block mt-0.5">Fast access & double VIP points!</span>
          </div>
        </div>
        <button 
          onClick={() => toast.success("Daman App Shortcut added to your device!")}
          className="bg-gradient-to-r from-[#D4AF37] to-[#F1D279] text-[#800000] font-black text-[9px] px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1 shrink-0 active:scale-95 transition-all"
        >
          <Download size={10} /> Add to Desktop
        </button>
      </section>

    </div>
  );
}
