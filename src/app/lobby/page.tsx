"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Volume2, Trophy, Gift, ArrowRight, Gamepad2, Compass,
  Globe, Headphones, BookOpen, Info, Download, ChevronRight
} from "lucide-react";
import { MOCK_GAMES, MOCK_WINNERS, MOCK_LEADERBOARD } from "@/constants/mockData";
import Link from "next/link";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { FirstDepositPopup } from "@/components/FirstDepositPopup";

export default function LobbyPage() {
  const { isAuthenticated, user, language } = useAuthStore();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showDepositPopup, setShowDepositPopup] = useState(false);

  const banners = [
    "/banner1.jpg",
    "/banner2.jpg",
    "/banner3.jpg",
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 4000); // Rotate banners every 4 seconds
    return () => clearInterval(slideTimer);
  }, [mounted, banners.length]);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      toast.error("Please log in to access the gaming lobby.");
      router.push("/auth/login");
    } else if (mounted && isAuthenticated && user) {
      // Check if wallet balance is 0 and popup hasn't been suppressed today
      if (user.walletBalance === 0) {
        const suppressDate = localStorage.getItem("suppressFirstDepositDate");
        const today = new Date().toDateString();
        if (suppressDate !== today) {
          setShowDepositPopup(true);
        }
      }
    }
  }, [mounted, isAuthenticated, user, router]);

  const handleCloseDepositPopup = (dontShowToday: boolean) => {
    if (dontShowToday) {
      localStorage.setItem("suppressFirstDepositDate", new Date().toDateString());
    }
    setShowDepositPopup(false);
  };

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#800000] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }



  // Translations
  const t = {
    popular: language === "hi" ? "लोकप्रिय" : "Popular",
    lottery: language === "hi" ? "लॉटरी" : "Lottery",
    casino: language === "hi" ? "कैसीनो" : "Casino",
    slots: language === "hi" ? "स्लॉट्स" : "Slots",
    sports: language === "hi" ? "खेल" : "Sports",
    rummy: language === "hi" ? "रम्मी" : "Rummy",
    fishing: language === "hi" ? "मछली पकड़ना" : "Fishing",
    original: language === "hi" ? "मूल" : "Original",
    dailyTask: language === "hi" ? "दैनिक कार्य" : "Daily Task",
    activity: language === "hi" ? "गतिविधि" : "Activity",
    invitation: language === "hi" ? "आमंत्रण" : "Invitation",
    seeAll: language === "hi" ? "सभी देखें" : "See All",
    highestBonus: language === "hi" ? "इतिहास में सबसे बड़ा बोनस" : "The highest bonus in history",
    allGames: language === "hi" ? "सभी खेल" : "All Games",
    winningInfo: language === "hi" ? "विजेता जानकारी" : "Winning Information",
    received: language === "hi" ? "प्राप्त हुआ" : "Received",
    earningsChart: language === "hi" ? "आज की कमाई का चार्ट" : "Today's earnings chart",
    noticeText: language === "hi" ? "कृपया आधिकारिक बुल वेव गेम्स डोमेन नाम याद रखें। कभी भी अनधिकृत स्रोतों पर भरोसा न करें।" : "Please remember the official Bull Wave Games domain name. Never trust unauthorized sources.",
    detail: language === "hi" ? "विवरण" : "Detail",
    menu: {
      language: language === "hi" ? "भाषा" : "Language",
      announcement: language === "hi" ? "घोषणा" : "Announcement",
      customerService: language === "hi" ? "24/7 ग्राहक सेवा" : "24/7 Customer service",
      guide: language === "hi" ? "शुरुआती गाइड" : "Beginner's Guide",
      about: language === "hi" ? "हमारे बारे में" : "About us",
      downloadApp: language === "hi" ? "ऐप डाउनलोड करें" : "Download APP"
    },
    warning1: language === "hi" ? "मंच निष्पक्षता, न्याय और खुलेपन की वकालत करता है। हम मुख्य रूप से निष्पक्ष लॉटरी, ब्लॉकचेन गेम्स, लाइव कैसीनो और स्लॉट मशीन गेम संचालित करते हैं।" : "The platform advocates fairness, justice, and openness. We mainly operate fair lottery, blockchain games, live casinos, and slot machine games.",
    warning2: language === "hi" ? "बुल वेव गेम्स में आपका स्वागत है, जो 10,000 से अधिक ऑनलाइन लाइव गेम डीलरों और स्लॉट गेम्स के साथ काम करता है, जो सभी सत्यापित निष्पक्ष गेम हैं।" : "Welcome to Bull Wave Games works with more than 10,000 online live game dealers and slot games, all of which are verified fair games.",
    warning3: language === "hi" ? "बुल वेव गेम्स तेज जमा और निकासी का समर्थन करता है, और आपकी यात्रा की प्रतीक्षा कर रहा है।" : "Welcome to Bull Wave Games supports fast deposit and withdrawal, and looks forward to your visit.",
    warning4: language === "hi" ? "जुआ खेलने की लत लग सकती है, कृपया समझदारी से खेलें।" : "Gambling can be addictive, please play rationally.",
    warning5: language === "hi" ? "बुल वेव गेम्स केवल 18 वर्ष से अधिक आयु के ग्राहकों को स्वीकार करता है।" : "Welcome to Bull Wave Games only accepts customers above the age of 18."
  };

  const categories = [
    { id: "popular", name: t.popular, image: "/assets/categories/popular.png", span: "col-span-3 aspect-[2/1]" },
    { id: "lottery", name: t.lottery, image: "/assets/categories/lottery.png", span: "col-span-3 aspect-[2/1]" },
    { id: "casino", name: t.casino, image: "/assets/categories/casino.png", span: "col-span-2 aspect-[4/3]" },
    { id: "slots", name: t.slots, image: "/assets/categories/slots.png", span: "col-span-2 aspect-[4/3]" },
    { id: "sports", name: t.sports, image: "/assets/categories/sports.png", span: "col-span-2 aspect-[4/3]" },
    { id: "rummy", name: t.rummy, image: "/assets/categories/rummy.png", span: "col-span-2 aspect-[4/3]" },
    { id: "fishing", name: t.fishing, image: "/assets/categories/fishing.png", span: "col-span-2 aspect-[4/3]" },
    { id: "original", name: t.original, image: "/assets/categories/original.png", span: "col-span-2 aspect-[4/3]" },
  ];

  return (
    <div 
      className="space-y-4 animate-in fade-in duration-500 min-h-screen"
      style={{
        backgroundImage: "linear-gradient(to bottom, rgba(248, 250, 252, 0.95), rgba(240, 242, 245, 0.98))",
      }}
    >
      <FirstDepositPopup 
        isOpen={showDepositPopup} 
        onClose={handleCloseDepositPopup} 
      />

      {/* 1. Carousel Banner Slider */}
      <section className="relative w-full rounded-2xl overflow-hidden mx-auto px-4 mt-2 select-none">
        <div 
          className="relative w-full rounded-xl overflow-hidden shadow-sm border border-slate-200/40"
          style={{ aspectRatio: "1024 / 450" }}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={currentSlide}
              src={`${banners[currentSlide]}?v=5`}
              alt={`Promotional Banner ${currentSlide + 1}`}
              initial={{ opacity: 0.8, x: 200 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0.8, x: -200 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full object-fill"
            />
          </AnimatePresence>

          {/* Dots Indicator Overlay */}
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-black/25 px-2.5 py-1 rounded-full backdrop-blur-xs">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  currentSlide === index 
                    ? "bg-[#D4AF37] w-3" 
                    : "bg-white/60 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. Notice Board */}
      <section className="mx-4 bg-white rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm h-9 overflow-hidden">
        <Volume2 size={16} className="text-[#800000] shrink-0" />
        <div className="flex-1 h-full overflow-hidden relative flex items-center">
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: "-100%" }}
            transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
            className="text-[11px] font-semibold text-slate-700 whitespace-nowrap absolute"
          >
            {t.noticeText}
          </motion.div>
        </div>
        <button className="bg-[#800000] text-white text-[10px] font-bold px-3 py-1 rounded-full shrink-0 flex items-center gap-1">
          {t.detail}
        </button>
      </section>



      {/* 4. Category Grid Navigation */}
      <section className="mx-4 grid grid-cols-6 gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setActiveCategory(cat.id);
              // Wait for React to render the new category section, then scroll to it
              setTimeout(() => {
                const el = document.getElementById(`category-${cat.id}`);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }, 150);
            }}
            className={`relative overflow-hidden rounded-xl shadow-sm transition-transform active:scale-95 ${cat.span} ${activeCategory === cat.id ? 'ring-2 ring-slate-800 ring-offset-1' : ''}`}
          >
            <img src={cat.image} alt={cat.name} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <span className="absolute bottom-1 right-2 font-black text-white text-[11px] drop-shadow-md">{cat.name}</span>
          </button>
        ))}
      </section>



      {/* Category Sections Builder */}
      {categories.map(category => {
        const fetchId = category.id === "popular" ? "original" : category.id === "rummy" ? "rummy" : category.id;
        // Show all games if this is the active category, otherwise limit to 6
        const games = MOCK_GAMES.filter(g => g.category === fetchId).slice(0, activeCategory === category.id ? undefined : 6); 
        if (games.length === 0) return null;

        return (
          <section key={category.id} id={`category-${category.id}`} className="px-4 space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 border-l-4 border-[#800000] pl-2">
                <h3 className="text-sm font-black text-slate-800 capitalize">{category.name}</h3>
              </div>
              <button className="text-[10px] text-slate-500 font-bold flex items-center hover:text-[#800000]">
                {t.seeAll} <ArrowRight size={10} className="ml-0.5" />
              </button>
            </div>

            {/* Custom Grid Layouts based on Category */}
            {category.id === "lottery" && (
              <div className="flex flex-col gap-3 pb-4">
                {games.map(game => (
                  <Link href={`/games/${game.id}`} key={game.id} className="bg-white rounded-2xl p-3 shadow-sm flex gap-3 hover:scale-[1.01] transition-transform">
                    {/* Left Image Box */}
                    <div className="w-[100px] h-[120px] rounded-xl overflow-hidden shrink-0 relative bg-gradient-to-b from-[#ff6b6b] to-[#ff8787] flex flex-col items-center justify-center p-2 shadow-inner">
                      <span className="text-white font-black text-xs absolute top-2 text-center w-full">{game.title}</span>
                      <img src={game.image.includes('unsplash') ? `https://ui-avatars.com/api/?name=${encodeURIComponent(game.title)}&background=random&color=fff&size=512&bold=true&format=svg` : game.image} className="w-16 h-16 object-contain mt-3 drop-shadow-md rounded-full bg-white/20 p-1" alt={game.title} />
                    </div>

                    {/* Right Content */}
                    <div className="flex-1 py-1 flex flex-col justify-between">
                      {/* Title & Button */}
                      <div className="flex items-start justify-between">
                        <h4 className="font-black text-slate-800 text-[17px] leading-none tracking-tight">{game.title}</h4>
                        <button className="bg-gradient-to-r from-[#ff6b6b] to-[#ff4757] text-white text-[11px] font-black px-4 py-1.5 rounded-full shadow-sm flex items-center gap-1 active:scale-95">
                          GO <ArrowRight size={12} />
                        </button>
                      </div>

                      {/* Highest Bonus */}
                      <div className="bg-slate-50 rounded-md px-2 py-2 flex items-center justify-between mt-2 border border-slate-100">
                        <span className="text-[10px] text-slate-500 font-medium">{t.highestBonus}</span>
                        <div className="w-px h-3 bg-slate-200 mx-2" />
                        <span className="text-[11px] font-black text-[#ff8e3c]">
                          {(game as any).highestBonus || "₹0.00"}
                        </span>
                      </div>

                      {/* Description */}
                      <div className="flex items-start gap-1.5 mt-2">
                        <div className="w-0.5 h-2.5 bg-[#ff4757] rounded-full mt-0.5 shrink-0" />
                        <p className="text-[9px] text-slate-400 leading-tight">
                          {(game as any).description || "Game description"}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {(category.id === "popular" || category.id === "original" || category.id === "fishing") && (
              <div className="grid grid-cols-3 gap-2">
                {games.map(game => (
                  <Link href={`/games/${game.id}`} key={game.id} className="block bg-white rounded-xl shadow-sm hover:scale-[1.02] transition-transform overflow-hidden pb-1">
                    <div className="aspect-[4/3] w-full relative">
                      <img src={game.image} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[10px] font-bold text-slate-800 text-center mt-1 truncate px-1">{game.title}</p>
                  </Link>
                ))}
              </div>
            )}

            {category.id === "slots" && (
              <div className="flex flex-col gap-6 pb-4">
                {Array.from(new Set(games.map(g => (g as any).provider))).filter(Boolean).map(provider => (
                  <div key={provider as string} className="flex flex-col gap-3">
                    <div className="flex items-center gap-1.5 border-l-[3.5px] border-[#ff4757] pl-2 mb-1">
                      <h3 className="text-[16px] font-black text-slate-800 tracking-tight">{provider as string}</h3>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2.5">
                      {games.filter(g => (g as any).provider === provider).map(game => (
                        <Link href={`/games/${game.id}`} key={game.id} className="block bg-white rounded-xl shadow-sm hover:scale-[1.02] transition-transform overflow-hidden relative border border-slate-100">
                          <div className="aspect-[3/4] w-full relative">
                            <img src={game.image.includes('unsplash') ? `https://ui-avatars.com/api/?name=${encodeURIComponent(game.title)}&background=random&color=fff&size=512&bold=true&format=svg` : game.image} className="w-full h-full object-cover" />
                          </div>
                          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
                          <p className="text-[9px] font-black text-white uppercase text-center mt-0 px-1 absolute bottom-1.5 w-full drop-shadow-md z-10 leading-tight">{game.title}</p>
                          <span className="absolute top-1.5 right-1.5 text-[8px] font-black text-yellow-400 drop-shadow-md z-10">{provider as string}</span>
                        </Link>
                      ))}
                    </div>

                    <div className="flex justify-center mt-1">
                      <button className="bg-white border border-[#ff4757] text-[#ff4757] text-xs font-bold px-8 py-2 rounded-full shadow-sm hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 w-3/4 max-w-[250px]">
                        <Gamepad2 size={14} className="text-[#ff4757]" /> {t.allGames}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(category.id === "sports" || category.id === "casino" || category.id === "rummy") && (
              <div className="grid grid-cols-2 gap-2">
                {games.map(game => (
                  <Link href={`/games/${game.id}`} key={game.id} className="block relative aspect-[16/9] rounded-xl overflow-hidden shadow-sm hover:scale-[1.02] transition-transform">
                    <img src={game.image} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-2">
                      <p className="text-[11px] font-black text-white">{game.title}</p>
                      <p className="text-[9px] text-white/80">{game.tags[0]}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        );
      })}

      <div className="w-full h-px bg-slate-200 my-6" />

      {/* 6. Winning Information */}
      <section className="px-4 space-y-3">
        <div className="flex items-center gap-1.5 border-l-4 border-[#800000] pl-2">
          <h3 className="text-sm font-black text-slate-800">{t.winningInfo}</h3>
        </div>
        <div className="bg-white rounded-xl shadow-sm h-48 overflow-hidden relative">
          <motion.div 
            initial={{ y: 0 }}
            animate={{ y: "-50%" }}
            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            className="p-2 space-y-2 absolute w-full"
          >
            {[...MOCK_WINNERS, ...MOCK_WINNERS].map((winner, idx) => (
              <div key={idx} className="flex items-center justify-between px-2 py-1.5 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <img src={winner.avatar} className="w-8 h-8 rounded-full bg-amber-100" />
                  <div>
                    <p className="text-[10px] font-bold text-slate-700">{winner.name}</p>
                    <p className="text-[9px] text-slate-500">{t.received} ₹{winner.amount.toLocaleString()}</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white shrink-0">
                  <Gamepad2 size={14} />
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 7. Leaderboard / Today's earnings chart */}
      <section className="px-4 space-y-3 pt-4">
        <div className="flex items-center gap-1.5 border-l-4 border-[#800000] pl-2">
          <h3 className="text-sm font-black text-slate-800">{t.earningsChart}</h3>
        </div>
        
        {/* Podium */}
        <div className="flex justify-center items-end h-32 gap-2 mt-4 px-2">
          {/* Rank 2 */}
          <div className="flex flex-col items-center w-1/3">
            <div className="relative">
              <img src={MOCK_LEADERBOARD[1].avatar} className="w-10 h-10 rounded-full border-2 border-slate-300 bg-white" />
              <div className="absolute -bottom-2 -right-1 w-5 h-5 bg-slate-300 text-slate-700 font-black text-[9px] rounded-full flex items-center justify-center border border-white">2</div>
            </div>
            <p className="text-[9px] font-bold mt-2 truncate w-full text-center">{MOCK_LEADERBOARD[1].name}</p>
            <div className="w-full h-16 bg-gradient-to-t from-slate-200 to-slate-100 rounded-t-lg mt-1 border-t-2 border-slate-300 flex flex-col justify-end pb-1">
               <p className="text-[8px] font-black text-slate-600 text-center">₹{(MOCK_LEADERBOARD[1].amount/1000).toFixed(1)}k</p>
            </div>
          </div>
          
          {/* Rank 1 */}
          <div className="flex flex-col items-center w-1/3 relative -top-2">
            <div className="relative">
              <div className="absolute -top-3 inset-x-0 flex justify-center text-yellow-500"><Trophy size={16} fill="currentColor" /></div>
              <img src={MOCK_LEADERBOARD[0].avatar} className="w-12 h-12 rounded-full border-2 border-yellow-400 bg-white" />
              <div className="absolute -bottom-2 -right-1 w-5 h-5 bg-yellow-400 text-white font-black text-[9px] rounded-full flex items-center justify-center border border-white shadow-sm">1</div>
            </div>
            <p className="text-[10px] font-black text-[#800000] mt-2 truncate w-full text-center">{MOCK_LEADERBOARD[0].name}</p>
            <div className="w-full h-20 bg-gradient-to-t from-yellow-200 to-yellow-50 rounded-t-lg mt-1 border-t-2 border-yellow-400 flex flex-col justify-end pb-1">
               <p className="text-[9px] font-black text-yellow-700 text-center">₹{(MOCK_LEADERBOARD[0].amount/1000).toFixed(1)}k</p>
            </div>
          </div>

          {/* Rank 3 */}
          <div className="flex flex-col items-center w-1/3">
            <div className="relative">
              <img src={MOCK_LEADERBOARD[2].avatar} className="w-10 h-10 rounded-full border-2 border-amber-600 bg-white" />
              <div className="absolute -bottom-2 -right-1 w-5 h-5 bg-amber-600 text-white font-black text-[9px] rounded-full flex items-center justify-center border border-white">3</div>
            </div>
            <p className="text-[9px] font-bold mt-2 truncate w-full text-center">{MOCK_LEADERBOARD[2].name}</p>
            <div className="w-full h-14 bg-gradient-to-t from-amber-200/50 to-amber-50 rounded-t-lg mt-1 border-t-2 border-amber-600/50 flex flex-col justify-end pb-1">
               <p className="text-[8px] font-black text-amber-700 text-center">₹{(MOCK_LEADERBOARD[2].amount/1000).toFixed(1)}k</p>
            </div>
          </div>
        </div>

        {/* List 4-5 */}
        <div className="bg-white rounded-xl shadow-sm p-2 space-y-1 mt-2">
          {MOCK_LEADERBOARD.slice(3).map((user, idx) => (
            <div key={user.rank} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-400 w-3">{user.rank}</span>
                <img src={user.avatar} className="w-7 h-7 rounded-full bg-slate-100" />
                <span className="text-[11px] font-bold text-slate-700">{user.name}</span>
              </div>
              <span className="text-[11px] font-black text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">₹{user.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Footer Info - Daman Style Branded for Bull Wave Games */}
      <section className="px-4 py-6 mt-4 border-t border-slate-200/80 bg-slate-50/30">
        
        {/* Brand Header */}
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <img src="/logo.png" alt="Bull Wave Logo" className="w-16 h-16 rounded-2xl object-cover shadow-md" />
              <span className="font-black text-slate-800 text-2xl tracking-tight">
                <span className="text-[#800000]">Bull</span>{" "}
                <span className="text-[#ff4757]">Wave</span>
              </span>
            </div>
            <span className="border-2 border-rose-500 text-rose-500 font-black text-[10px] px-1.5 py-0.5 rounded-md leading-none">
              18+
            </span>
          </div>
          <button 
            onClick={() => router.push("/support")}
            className="w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform"
          >
            <Headphones size={16} />
          </button>
        </div>

        {/* Partner Logos Grid */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="bg-white border border-slate-100 rounded-xl p-2.5 flex items-center justify-center h-11 shadow-sm">
            <span className="font-black text-[#F29C38] tracking-widest text-sm italic">CQ9</span>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl p-2.5 flex items-center justify-center h-11 gap-1 shadow-sm">
            <span className="font-extrabold text-[#00A88F] text-[10px] tracking-tighter uppercase">Microgaming</span>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl p-2.5 flex items-center justify-center h-11 shadow-sm">
            <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-red-600 italic text-sm tracking-wider">JDB</span>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl p-2.5 flex items-center justify-center h-11 shadow-sm">
            <span className="font-black text-slate-800 text-[10px] tracking-tight">EVOLUTION</span>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl p-2.5 flex items-center justify-center h-11 shadow-sm">
            <span className="font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-400 to-amber-600 text-xs tracking-widest uppercase">JILI</span>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl p-2.5 flex items-center justify-center h-11 shadow-sm">
            <span className="font-extrabold text-[#3a5a9f] text-[10px] tracking-tighter uppercase">PG SOFT</span>
          </div>
        </div>

        {/* Warning Bullet Points */}
        <div className="space-y-2 mb-6">
          <div className="flex items-start gap-1.5">
            <span className="text-[#ff4757] text-[10px] mt-0.5 shrink-0">◆</span>
            <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
              {t.warning1}
            </p>
          </div>
          <div className="flex items-start gap-1.5">
            <span className="text-[#ff4757] text-[10px] mt-0.5 shrink-0">◆</span>
            <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
              {t.warning2}
            </p>
          </div>
          <div className="flex items-start gap-1.5">
            <span className="text-[#ff4757] text-[10px] mt-0.5 shrink-0">◆</span>
            <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">
              {t.warning3}
            </p>
          </div>
          
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 bg-rose-50/50 p-3 rounded-xl border-l-2 border-rose-500">
            <p className="text-[10px] text-rose-600 leading-relaxed font-bold">
              {t.warning4}
            </p>
            <p className="text-[10px] text-rose-600 leading-relaxed font-bold">
              {t.warning5}
            </p>
          </div>
        </div>



        {/* Menu List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden divide-y divide-slate-100 mb-6">
          {[
            { name: t.menu.language, icon: Globe, color: "text-blue-500", path: "/language" },
            { name: t.menu.announcement, icon: Volume2, color: "text-rose-500", path: "/announcement" },
            { name: t.menu.customerService, icon: Headphones, color: "text-emerald-500", path: "/support" },
            { name: t.menu.guide, icon: BookOpen, color: "text-amber-500", path: "/guide" },
            { name: t.menu.about, icon: Info, color: "text-indigo-500", path: "/about" },
            { name: t.menu.downloadApp, icon: Download, color: "text-purple-500", path: "/download" }
          ].map((item) => (
            <button
              key={item.name}
              onClick={() => {
                if (item.path === "/language") {
                  router.push(item.path);
                } else if (item.path === "/announcement") {
                  router.push(item.path);
                } else if (item.path === "/guide") {
                  router.push(item.path);
                } else if (item.path === "/about") {
                  router.push(item.path);
                } else if (item.path === "/support") {
                  router.push(item.path);
                } else {
                  toast.info(`Redirecting to ${item.name}...`);
                }
              }}
              className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50/50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <item.icon size={18} className={`${item.color} shrink-0`} />
                <span className="text-[11px] font-bold text-slate-700">{item.name}</span>
              </div>
              <ChevronRight size={14} className="text-slate-400" />
            </button>
          ))}
        </div>

        {/* Copyright */}
        <p className="text-[9px] text-slate-400 text-center font-medium">
          © 2026 Bull Wave Games. All rights reserved.
        </p>

      </section>

    </div>
  );
}
