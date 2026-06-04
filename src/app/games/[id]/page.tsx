"use client";

import { use, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Users, Trophy, DollarSign, Award, Star, BookOpen, Play } from "lucide-react";
import Link from "next/link";
import { MOCK_GAMES } from "@/constants/mockData";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import { useAuthStore } from "@/store/useAuthStore";

export default function GameDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { deductEntryFee } = useAuthStore();
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const game = MOCK_GAMES.find((g) => g.id === id) || MOCK_GAMES[0];
  
  const [selectedPool, setSelectedPool] = useState("mega");
  const [entryFee, setEntryFee] = useState(100);

  const handleJoinGame = async () => {
    const totalPayable = entryFee * 1.05;
    const success = await deductEntryFee(totalPayable);
    if (success) {
      toast.success(`Successfully joined "${game.title}"! ₹${totalPayable.toFixed(2)} deducted. Connecting to gaming cluster...`);
      setTimeout(() => {
        router.push("/games/wingo");
      }, 1000);
    } else {
      toast.error("Insufficient balance to join this game lobby. Please deposit cash in your Wallet.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Back Button */}
      <Link href="/lobby" className="inline-flex items-center gap-2 text-slate-600 hover:text-[#800000] transition-colors">
        <ArrowLeft size={20} />
        <span>Back to Lobby</span>
      </Link>

      {/* Banner */}
      <section className="relative w-full h-64 md:h-80 rounded-3xl overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-t from-gaming-bg via-gaming-bg/60 to-transparent z-10" />
        <img 
          src={game.image} 
          alt={game.title} 
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-6 md:p-8">
          <div className="flex flex-wrap gap-2 mb-2">
            {game.tags.map((t) => (
              <span key={t} className="px-2 py-0.5 rounded bg-primary/80 text-[10px] font-bold text-white uppercase">
                {t}
              </span>
            ))}
            {game.isLive && (
              <span className="px-2 py-0.5 rounded bg-red-500 text-[10px] font-bold text-white uppercase animate-pulse">
                Live Server
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white">{game.title}</h1>
        </div>
      </section>

      {/* Lobby Options & Specifications */}
      <div className="flex flex-col gap-6 w-full">
        
        {/* Game Info, Rules & Reviews */}
        <div className="w-full space-y-6">
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-200/50 rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="text-base font-bold flex items-center gap-2 text-blue-950">
              <BookOpen size={18} className="text-[#800000]" />
              Game Description & Rules
            </h3>
            <p className="text-blue-900 text-xs leading-relaxed">
              Place your entry, make accurate predictions or master your skills, and multiply your entries in a matter of seconds. Designed with real-time provably fair algorithms for extreme transparency.
            </p>
            <div className="space-y-2 border-t border-blue-200/30 pt-4 text-xs text-blue-850">
              <p className="flex gap-2"><span className="text-[#800000] font-bold">1.</span> Select your entry amount and submit your bet.</p>
              <p className="flex gap-2"><span className="text-[#800000] font-bold">2.</span> Watch countdown timers. Multipliers rise dynamically.</p>
              <p className="flex gap-2"><span className="text-[#800000] font-bold">3.</span> Cashout before the crash or make predictions on colors.</p>
            </div>
          </div>

          {/* Prize breakdown */}
          <div className="bg-gradient-to-r from-violet-50 to-purple-50/50 border border-purple-200/50 rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="text-base font-bold flex items-center gap-2 text-purple-950">
              <Trophy size={18} className="text-[#800000]" />
              Prize Breakdown
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { rank: "1st Place", prize: "₹ 5,000", bg: "bg-amber-100 text-amber-900 border-amber-300" },
                { rank: "2nd Place", prize: "₹ 2,500", bg: "bg-slate-100 text-slate-900 border-slate-300" },
                { rank: "3rd Place", prize: "₹ 1,000", bg: "bg-amber-200/40 text-amber-800 border-amber-300/40" },
              ].map((p, idx) => (
                <div key={idx} className={`p-3 rounded-xl border text-center shadow-sm ${p.bg}`}>
                  <span className="text-[9px] uppercase font-bold">{p.rank}</span>
                  <p className="text-sm font-black mt-1">{p.prize}</p>
                </div>
              ))}
            </div>
          </div>

          {/* User Reviews */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-200/50 rounded-2xl p-5 space-y-4 shadow-sm">
            <h3 className="text-base font-bold flex items-center gap-2 text-amber-950">
              <Star size={18} className="text-yellow-600" />
              Player Reviews
            </h3>
            <div className="space-y-4">
              {[
                { user: "Player_119", review: "Provably fair and incredibly fast cashouts!", rating: 5 },
                { user: "WingoMaster", review: "Best game model on Bull Wave Club, highly recommended.", rating: 4 },
              ].map((r, idx) => (
                <div key={idx} className="border-b border-amber-200/30 pb-3 last:border-b-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-xs text-slate-800">{r.user}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: r.rating }).map((_, i) => (
                        <Star key={i} size={10} className="fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-600">{r.review}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Join Entry Form */}
        <div className="w-full">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50/50 border border-emerald-200/50 rounded-2xl p-5 space-y-6 shadow-sm">
            <h3 className="text-base font-bold text-emerald-950">Select Entry & Join</h3>
            
            <div className="space-y-3">
              <label className="text-xs font-semibold text-emerald-900">Select Pool</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "mega", label: "Mega Pool", details: "₹10,000 max prize" },
                  { id: "classic", label: "Classic", details: "₹2,000 max prize" },
                ].map((pool) => (
                  <button
                    key={pool.id}
                    onClick={() => setSelectedPool(pool.id)}
                    className={`p-3 rounded-xl border text-left transition-all shadow-sm ${
                      selectedPool === pool.id 
                        ? "border-[#800000] bg-[#800000] text-white" 
                        : "border-emerald-200/60 bg-white text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <p className={`font-bold text-xs ${selectedPool === pool.id ? "text-white" : "text-slate-800"}`}>{pool.label}</p>
                    <span className="text-[9px] opacity-80 block mt-0.5">{pool.details}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-emerald-900">Entry Fee (₹)</label>
              <div className="grid grid-cols-4 gap-1.5">
                {[10, 50, 100, 500].map((fee) => (
                  <button
                    key={fee}
                    onClick={() => setEntryFee(fee)}
                    className={`py-2.5 rounded-xl font-black text-xs border transition-all shadow-sm ${
                      entryFee === fee 
                        ? "bg-[#800000] border-[#800000] text-white" 
                        : "bg-white border-emerald-200/60 text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    ₹{fee}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 border-t border-emerald-200/30 pt-4 text-xs">
              <div className="flex justify-between">
                <span className="text-emerald-800">Entry Fee:</span>
                <span className="font-bold text-slate-800">₹{entryFee}.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-emerald-800">Platform Fee (5%):</span>
                <span className="font-bold text-slate-800">₹{(entryFee * 0.05).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-black border-t border-emerald-200/30 pt-2">
                <span className="text-emerald-950">Total Payable:</span>
                <span className="text-[#800000]">₹{(entryFee * 1.05).toFixed(2)}</span>
              </div>
            </div>

            <Button
              onClick={handleJoinGame}
              className="w-full bg-[#800000] hover:bg-[#800000]/90 text-white font-bold py-6 rounded-xl shadow-sm flex items-center justify-center gap-2"
            >
              <Play size={16} fill="white" /> Join Lobby
            </Button>
          </div>
        </div>

      </div>

    </div>
  );
}
