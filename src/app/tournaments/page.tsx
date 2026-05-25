"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Users, Timer, ShieldAlert, Award } from "lucide-react";
import { toast } from "sonner";

interface Tournament {
  id: string;
  title: string;
  game: string;
  prizePool: string;
  entryFee: number;
  playersJoined: number;
  maxPlayers: number;
  timeLeft: string;
  status: "live" | "upcoming" | "ended";
}

const MOCK_TOURNAMENTS: Tournament[] = [
  { id: "t1", title: "Wingo Super Championship", game: "Color Prediction", prizePool: "₹50,000", entryFee: 200, playersJoined: 342, maxPlayers: 500, timeLeft: "10 mins left", status: "live" },
  { id: "t2", title: "Aviator High-Flyers Club", game: "Aviator X", prizePool: "₹1,00,000", entryFee: 500, playersJoined: 89, maxPlayers: 200, timeLeft: "2 hours left", status: "upcoming" },
  { id: "t3", title: "Teen Patti Ultimate Cup", game: "Teen Patti", prizePool: "₹25,000", entryFee: 100, playersJoined: 150, maxPlayers: 150, timeLeft: "Ended", status: "ended" },
];

export default function TournamentsPage() {
  const [filter, setFilter] = useState<"all" | "live" | "upcoming">("all");

  const handleJoin = (t: Tournament) => {
    toast.success(`Successfully registered for "${t.title}"! Entry fee ₹${t.entryFee} deducted.`);
  };

  const filteredTournaments = MOCK_TOURNAMENTS.filter((t) => {
    if (filter === "all") return true;
    return t.status === filter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Trophy className="text-[#800000] animate-pulse" /> Tournaments Arena
        </h1>
        <p className="text-muted-foreground text-xs">Compete in scheduled events and climb brackets for mega cash pools</p>
      </div>

      <div className="flex gap-2 border-b border-glass-border pb-3">
        {["all", "live", "upcoming"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black capitalize transition-all shadow-sm ${
              filter === s
                ? "bg-[#800000] text-white shadow-sm"
                : "bg-white border border-[#D4AF37]/35 text-slate-800 hover:text-[#800000] hover:bg-slate-50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4 w-full">
        {filteredTournaments.map((t) => {
          const progress = (t.playersJoined / t.maxPlayers) * 100;
          
          // Get beautiful custom pastel gradient based on status
          const cardBg = 
            t.status === "live" 
              ? "from-red-50 to-orange-50/50 border-red-200/50" 
              : t.status === "upcoming"
              ? "from-blue-50 to-sky-50/50 border-blue-200/50"
              : "from-slate-50 to-slate-100/50 border-slate-200/50";

          const headerTitleColor = "text-slate-800";
          const infoTextColor = "text-slate-700";

          return (
            <Card key={t.id} className={`bg-gradient-to-r ${cardBg} border shadow-sm overflow-hidden relative flex flex-col justify-between rounded-2xl`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px]" />
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-500">{t.game}</span>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                    t.status === "live" ? "bg-red-500/10 text-red-600 border border-red-500/20" : "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                  }`}>
                    {t.status}
                  </span>
                </div>
                <CardTitle className={`text-base font-black ${headerTitleColor} leading-tight`}>{t.title}</CardTitle>
                <CardDescription className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                  <Timer size={14} className="text-[#800000]" />
                  <span>{t.timeLeft}</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 flex-1 flex flex-col justify-between">
                
                {/* Stats & Progress */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm border-t border-b border-slate-200/50 py-3">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Prize Pool</span>
                      <strong className="text-emerald-600 text-base font-black">{t.prizePool}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block">Entry Fee</span>
                      <strong className="text-slate-800 text-sm font-black">₹{t.entryFee}</strong>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500">
                      <span>Joined: {t.playersJoined}/{t.maxPlayers}</span>
                      <span>{progress.toFixed(0)}% Filled</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#800000] to-[#b30000] transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <Button
                  disabled={t.status === "ended" || t.playersJoined >= t.maxPlayers}
                  onClick={() => handleJoin(t)}
                  className="w-full bg-[#800000] hover:bg-[#800000]/90 text-white font-bold py-5 rounded-xl shadow-sm text-xs"
                >
                  {t.status === "ended" ? "Tournament Ended" : `Register & Join`}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
