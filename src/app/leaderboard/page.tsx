"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Award, Crown, ArrowUp, ArrowDown } from "lucide-react";

interface LeaderboardUser {
  rank: number;
  username: string;
  winnings: number;
  avatar: string;
  change: "up" | "down" | "same";
}

const MOCK_LEADERBOARD: Record<string, LeaderboardUser[]> = {
  daily: [
    { rank: 1, username: "BullWaveKing", winnings: 124500, avatar: "https://i.pravatar.cc/150?img=11", change: "same" },
    { rank: 2, username: "ProPredictor", winnings: 98200, avatar: "https://i.pravatar.cc/150?img=12", change: "up" },
    { rank: 3, username: "LuckyStrike", winnings: 84000, avatar: "https://i.pravatar.cc/150?img=13", change: "down" },
    { rank: 4, username: "Player_901", winnings: 62000, avatar: "https://i.pravatar.cc/150?img=14", change: "up" },
    { rank: 5, username: "VIP_Gamer", winnings: 45000, avatar: "https://i.pravatar.cc/150?img=15", change: "down" },
  ],
  weekly: [
    { rank: 1, username: "ProPredictor", winnings: 580000, avatar: "https://i.pravatar.cc/150?img=12", change: "up" },
    { rank: 2, username: "BullWaveKing", winnings: 540000, avatar: "https://i.pravatar.cc/150?img=11", change: "down" },
    { rank: 3, username: "AlphaWingo", winnings: 410000, avatar: "https://i.pravatar.cc/150?img=16", change: "same" },
    { rank: 4, username: "JackpotWinner", winnings: 320000, avatar: "https://i.pravatar.cc/150?img=17", change: "up" },
    { rank: 5, username: "LuckyStrike", winnings: 290000, avatar: "https://i.pravatar.cc/150?img=13", change: "down" },
  ],
  monthly: [
    { rank: 1, username: "BullWaveKing", winnings: 2150000, avatar: "https://i.pravatar.cc/150?img=11", change: "same" },
    { rank: 2, username: "ProPredictor", winnings: 1980000, avatar: "https://i.pravatar.cc/150?img=12", change: "same" },
    { rank: 3, username: "AlphaWingo", winnings: 1540000, avatar: "https://i.pravatar.cc/150?img=16", change: "up" },
    { rank: 4, username: "MasterTradin", winnings: 1200000, avatar: "https://i.pravatar.cc/150?img=18", change: "down" },
    { rank: 5, username: "JackpotWinner", winnings: 1050000, avatar: "https://i.pravatar.cc/150?img=17", change: "up" },
  ]
};

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState("daily");
  const leaders = MOCK_LEADERBOARD[timeframe];
  
  const podium = [leaders[1], leaders[0], leaders[2]]; // 2nd, 1st, 3rd configuration

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Trophy className="text-[#800000] animate-bounce" /> Leaderboard
        </h1>
        <p className="text-muted-foreground text-xs">Top earners and champion predictors of the platform</p>
      </div>

      <Tabs defaultValue="daily" className="w-full" onValueChange={setTimeframe}>
        <div className="flex justify-center mb-6">
          <TabsList className="bg-white/5 border border-glass-border rounded-xl p-1 w-full grid grid-cols-3 h-11">
            <TabsTrigger value="daily" className="rounded-lg data-[state=active]:bg-[#800000] text-xs py-1">Daily</TabsTrigger>
            <TabsTrigger value="weekly" className="rounded-lg data-[state=active]:bg-[#800000] text-xs py-1">Weekly</TabsTrigger>
            <TabsTrigger value="monthly" className="rounded-lg data-[state=active]:bg-[#800000] text-xs py-1">Monthly</TabsTrigger>
          </TabsList>
        </div>

        {/* Podium Display (Top 3) */}
        <section className="grid grid-cols-3 gap-4 max-w-3xl mx-auto items-end pt-12 pb-6">
          
          {/* 2nd Place */}
          {podium[0] && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-3">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-slate-400 overflow-hidden">
                  <img src={podium[0].avatar} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-slate-400 text-black w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm">
                  2
                </div>
              </div>
              <div className="w-full bg-slate-400/10 border border-slate-400/20 rounded-t-2xl p-4 text-center h-28 md:h-36 flex flex-col justify-between">
                <div>
                  <p className="font-bold text-xs md:text-sm truncate">{podium[0].username}</p>
                  <span className="text-[10px] text-muted-foreground">₹{(podium[0].winnings/1000).toFixed(1)}k</span>
                </div>
                <Award className="mx-auto text-slate-400" size={24} />
              </div>
            </motion.div>
          )}

          {/* 1st Place */}
          {podium[1] && (
            <motion.div
              initial={{ opacity: 0, y: 70 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-3">
                <Crown className="absolute -top-7 left-1/2 -translate-x-1/2 text-amber-400 w-8 h-8 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-amber-400 overflow-hidden shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                  <img src={podium[1].avatar} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-black w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm">
                  1
                </div>
              </div>
              <div className="w-full bg-amber-400/10 border border-amber-400/20 rounded-t-2xl p-4 text-center h-36 md:h-44 flex flex-col justify-between">
                <div>
                  <p className="font-bold text-sm md:text-base truncate">{podium[1].username}</p>
                  <span className="text-xs text-amber-400 font-bold">₹{(podium[1].winnings/1000).toFixed(1)}k</span>
                </div>
                <Crown className="mx-auto text-amber-400" size={28} />
              </div>
            </motion.div>
          )}

          {/* 3rd Place */}
          {podium[2] && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-3">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-amber-700 overflow-hidden">
                  <img src={podium[2].avatar} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-700 text-black w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm">
                  3
                </div>
              </div>
              <div className="w-full bg-amber-700/10 border border-amber-700/20 rounded-t-2xl p-4 text-center h-24 md:h-32 flex flex-col justify-between">
                <div>
                  <p className="font-bold text-xs md:text-sm truncate">{podium[2].username}</p>
                  <span className="text-[10px] text-muted-foreground">₹{(podium[2].winnings/1000).toFixed(1)}k</span>
                </div>
                <Award className="mx-auto text-amber-700" size={20} />
              </div>
            </motion.div>
          )}

        </section>

        {/* Remainder Listings Table */}
        <section className="max-w-3xl mx-auto">
          <Card className="glass border-glass-border">
            <CardContent className="p-0">
              <div className="divide-y divide-glass-border/30">
                {leaders.map((user, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="w-6 font-bold text-muted-foreground text-center">{user.rank}</span>
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-glass-border">
                        <img src={user.avatar} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{user.username}</p>
                        <span className="text-[10px] text-muted-foreground">Predictor Level 12</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold text-sm">₹{user.winnings.toLocaleString()}</p>
                        <span className="text-[10px] text-muted-foreground">Total Winnings</span>
                      </div>
                      
                      <div className="w-6">
                        {user.change === "up" && <ArrowUp size={16} className="text-neon-green" />}
                        {user.change === "down" && <ArrowDown size={16} className="text-neon-pink" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

      </Tabs>
    </div>
  );
}
