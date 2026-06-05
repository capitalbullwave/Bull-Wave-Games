"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Wallet, Clock, History, List, X } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const COLORS = {
  green: "#4caf50",
  violet: "#9c27b0",
  red: "#f44336",
};

const NUMBERS = [
  { num: 0, color: "violet_red" },
  { num: 1, color: "green" },
  { num: 2, color: "red" },
  { num: 3, color: "green" },
  { num: 4, color: "red" },
  { num: 5, color: "violet_green" },
  { num: 6, color: "red" },
  { num: 7, color: "green" },
  { num: 8, color: "red" },
  { num: 9, color: "green" },
];

let sharedAudioCtx: AudioContext | null = null;

const playBeep = () => {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!sharedAudioCtx) {
      sharedAudioCtx = new AudioContextClass();
    }

    if (sharedAudioCtx.state === "suspended") {
      sharedAudioCtx.resume().catch(() => {});
    }

    const now = sharedAudioCtx.currentTime;

    const osc = sharedAudioCtx.createOscillator();
    const gainNode = sharedAudioCtx.createGain();

    osc.type = "sine";
    // 1200Hz: crisp, high-pitched stopwatch beep
    osc.frequency.setValueAtTime(1200, now);

    // Fast volume envelope to make a short digital tick
    gainNode.gain.setValueAtTime(0, now);
    // 3ms soft attack to avoid clicking
    gainNode.gain.linearRampToValueAtTime(0.06, now + 0.003);
    // 65ms exponential decay to silence
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

    osc.connect(gainNode);
    gainNode.connect(sharedAudioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.075);
  } catch (error) {
    console.warn("AudioContext beep failed:", error);
  }
};

export default function WingoGamePage() {
  const { user, deductEntryFee } = useAuthStore();
  const [activeTab, setActiveTab] = useState("1min");
  const [timeLeft, setTimeLeft] = useState(60);
  const [period, setPeriod] = useState(202605271000);
  const [history, setHistory] = useState([
    { period: 202605270999, number: 4, size: "Small", color: "red" },
    { period: 202605270998, number: 7, size: "Big", color: "green" },
    { period: 202605270997, number: 0, size: "Small", color: "violet_red" },
    { period: 202605270996, number: 8, size: "Big", color: "red" },
    { period: 202605270995, number: 3, size: "Small", color: "green" },
  ]);

  // Betting Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBet, setSelectedBet] = useState<{ type: "color" | "number", value: string | number, colorCode: string } | null>(null);
  const [betAmount, setBetAmount] = useState(10);
  const [multiplier, setMultiplier] = useState(1);

  const generateResult = useCallback((targetPeriod: number) => {
    const randNum = Math.floor(Math.random() * 10);
    const numData = NUMBERS.find(n => n.num === randNum)!;
    const newResult = {
      period: targetPeriod,
      number: randNum,
      size: randNum >= 5 ? "Big" : "Small",
      color: numData.color
    };
    setHistory(prev => [newResult, ...prev].slice(0, 10));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Period Ends, generate new result
          let endedPeriod = 0;
          setPeriod((p) => {
            endedPeriod = p;
            return p + 1;
          });
          generateResult(endedPeriod);
          return activeTab === "1min" ? 60 : activeTab === "3min" ? 180 : 300;
        }
        
        // Play beep when timer is at 5 seconds or fewer
        const nextTime = prev - 1;
        if (nextTime <= 5 && nextTime >= 1) {
          playBeep();
        }
        
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeTab, generateResult]);

  const handleOpenBet = (type: "color" | "number", value: string | number, colorCode: string) => {
    if (timeLeft <= 5) {
      toast.error("Time is up for this period!");
      return;
    }
    setSelectedBet({ type, value, colorCode });
    setBetAmount(10);
    setMultiplier(1);
    setIsModalOpen(true);
  };

  const handleConfirmBet = async () => {
    const totalBet = betAmount * multiplier;
    if (user && user.walletBalance < totalBet) {
      toast.error("Insufficient balance!");
      return;
    }
    // Deduct balance
    const success = await deductEntryFee(totalBet);
    if (success) {
      toast.success(`Bet placed successfully! ₹${totalBet} deducted.`);
    } else {
      toast.error("Failed to place bet. Please try again.");
    }
    setIsModalOpen(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return { m, s };
  };

  const { m, s } = formatTime(timeLeft);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 animate-in fade-in duration-500 font-sans">
      
      {/* Header */}
      <header className="bg-[#800000] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-md">
        <Link href="/lobby" className="p-1 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-lg font-black uppercase tracking-wider">Wingo</h1>
        <div className="w-8" /> {/* Spacer */}
      </header>

      {/* Wallet Banner */}
      <div className="bg-[#800000] rounded-b-3xl px-6 pb-8 pt-4 text-center shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#800000] to-[#600000] opacity-30" />
        <div className="relative z-10">
          <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-1 flex items-center justify-center gap-1.5">
            <Wallet size={14} /> Available Balance
          </p>
          <h2 className="text-4xl font-black text-[#D4AF37] tracking-tight">
            ₹{user?.walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"}
          </h2>
          <div className="flex justify-center gap-4 mt-5">
            <button className="bg-[#D4AF37] text-[#800000] px-8 py-2.5 rounded-full font-black text-sm uppercase tracking-wider shadow-md active:scale-95 transition-transform">
              Deposit
            </button>
            <button className="bg-white/10 text-white border border-white/20 px-8 py-2.5 rounded-full font-black text-sm uppercase tracking-wider shadow-md active:scale-95 transition-transform">
              Withdraw
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 relative z-20">
        
        {/* Time Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex p-1.5 mb-4">
          {["1min", "3min", "5min", "10min"].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-xs font-black uppercase rounded-xl transition-all ${
                activeTab === tab 
                  ? "bg-gradient-to-r from-[#800000] to-[#b30000] text-white shadow-md" 
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              Wingo {tab}
            </button>
          ))}
        </div>

        {/* Timer Box */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-4 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-1.5 text-slate-500 mb-1">
              <History size={14} />
              <span className="text-xs font-bold uppercase">Period</span>
            </div>
            <p className="text-lg font-black text-slate-800 font-mono tracking-wider">{period}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-1.5 text-slate-500 mb-1">
              <Clock size={14} />
              <span className="text-xs font-bold uppercase">Time Left</span>
            </div>
            <div className="flex gap-1.5 text-2xl font-black font-mono text-[#800000]">
              <div className="bg-slate-100 px-2 py-1 rounded-md">{m[0]}</div>
              <div className="bg-slate-100 px-2 py-1 rounded-md">{m[1]}</div>
              <span className="animate-pulse text-slate-400">:</span>
              <div className="bg-slate-100 px-2 py-1 rounded-md">{s[0]}</div>
              <div className="bg-slate-100 px-2 py-1 rounded-md">{s[1]}</div>
            </div>
          </div>
        </div>

        {/* Betting Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 mb-4 relative overflow-hidden">
          {timeLeft <= 5 && (
            <div className="absolute inset-0 z-30 bg-black/60 backdrop-blur-sm flex items-center justify-center">
              <span className="text-6xl font-black text-white font-mono animate-ping">{timeLeft}</span>
            </div>
          )}

          {/* Color Buttons */}
          <div className="flex gap-2 mb-4">
            <button onClick={() => handleOpenBet("color", "Green", COLORS.green)} className="flex-1 bg-[#4caf50] text-white font-black text-sm py-4 rounded-xl shadow-sm active:scale-95 transition-transform uppercase tracking-wider">Join Green</button>
            <button onClick={() => handleOpenBet("color", "Violet", COLORS.violet)} className="flex-1 bg-[#9c27b0] text-white font-black text-sm py-4 rounded-xl shadow-sm active:scale-95 transition-transform uppercase tracking-wider">Join Violet</button>
            <button onClick={() => handleOpenBet("color", "Red", COLORS.red)} className="flex-1 bg-[#f44336] text-white font-black text-sm py-4 rounded-xl shadow-sm active:scale-95 transition-transform uppercase tracking-wider">Join Red</button>
          </div>

          {/* Number Grid */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <div className="grid grid-cols-5 gap-3">
              {NUMBERS.map((item) => (
                <button
                  key={item.num}
                  onClick={() => {
                    const c = item.color === "green" ? COLORS.green : item.color === "red" ? COLORS.red : COLORS.violet;
                    handleOpenBet("number", item.num, c);
                  }}
                  className={`aspect-square rounded-full flex items-center justify-center text-xl font-black text-white shadow-md active:scale-90 transition-transform ${
                    item.color === "green" ? "bg-[#4caf50]" :
                    item.color === "red" ? "bg-[#f44336]" :
                    item.color === "violet_red" ? "bg-gradient-to-br from-[#9c27b0] 50% to-[#f44336] 50%" :
                    "bg-gradient-to-br from-[#9c27b0] 50% to-[#4caf50] 50%"
                  }`}
                >
                  {item.num}
                </button>
              ))}
            </div>
          </div>

          {/* Big / Small */}
          <div className="flex gap-2 mt-4">
            <button onClick={() => handleOpenBet("color", "Big", "#eab308")} className="flex-1 border-2 border-yellow-500 text-yellow-600 font-black text-sm py-3 rounded-xl hover:bg-yellow-50 active:scale-95 transition-transform uppercase tracking-wider">Big</button>
            <button onClick={() => handleOpenBet("color", "Small", "#3b82f6")} className="flex-1 border-2 border-blue-500 text-blue-600 font-black text-sm py-3 rounded-xl hover:bg-blue-50 active:scale-95 transition-transform uppercase tracking-wider">Small</button>
          </div>
        </div>

        {/* Game History Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex border-b border-slate-100">
            <div className="flex-1 py-3 text-center border-b-2 border-[#800000] text-[#800000] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5">
              <History size={16} /> Game History
            </div>
            <div className="flex-1 py-3 text-center text-slate-400 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5">
              <List size={16} /> My Bets
            </div>
          </div>
          
          <div className="p-0">
            <table className="w-full text-center text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 font-bold">Period</th>
                  <th className="py-3 font-bold">Number</th>
                  <th className="py-3 font-bold">Size</th>
                  <th className="py-3 font-bold">Color</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {history.map((h, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="py-3 font-mono text-slate-600">{h.period}</td>
                    <td className="py-3 font-black text-lg" style={{ 
                      color: h.color.includes('green') ? COLORS.green : h.color.includes('red') ? COLORS.red : COLORS.violet 
                    }}>
                      {h.number}
                    </td>
                    <td className="py-3 font-bold text-slate-700">{h.size}</td>
                    <td className="py-3 flex justify-center items-center gap-1">
                      {h.color.split('_').map((c, idx) => (
                        <div key={idx} className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: c === 'green' ? COLORS.green : c === 'red' ? COLORS.red : COLORS.violet }} />
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Betting Modal */}
      <AnimatePresence>
        {isModalOpen && selectedBet && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div 
                className="px-6 py-4 flex items-center justify-between text-white" 
                style={{ backgroundColor: selectedBet.colorCode }}
              >
                <h3 className="font-black text-lg uppercase tracking-wider">
                  Select {selectedBet.value}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="p-1 bg-black/20 rounded-full hover:bg-black/30 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto">
                
                {/* Balance Info */}
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-500">Balance</span>
                  <span className="text-sm font-black text-slate-800">₹{user?.walletBalance.toFixed(2) || "0.00"}</span>
                </div>

                {/* Amount Selection */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contract Money</label>
                  <div className="flex gap-2">
                    {[10, 100, 1000, 10000].map(amt => (
                      <button
                        key={amt}
                        onClick={() => setBetAmount(amt)}
                        className={`flex-1 py-2.5 rounded-lg font-black text-sm border transition-all ${
                          betAmount === amt 
                            ? "border-transparent text-white shadow-md" 
                            : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                        style={betAmount === amt ? { backgroundColor: selectedBet.colorCode } : {}}
                      >
                        {amt}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Multiplier Selection */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between">
                    <span>Multiplier</span>
                    <span className="text-slate-800">x{multiplier}</span>
                  </label>
                  <div className="flex items-center gap-4">
                    <button onClick={() => setMultiplier(Math.max(1, multiplier - 1))} className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 font-black text-xl hover:bg-slate-200 active:scale-95 transition-all">-</button>
                    <div className="flex-1 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                      {[1, 5, 10, 20, 50, 100].map(m => (
                        <button
                          key={m}
                          onClick={() => setMultiplier(m)}
                          className={`shrink-0 px-4 py-2 rounded-lg font-black text-sm transition-colors ${
                            multiplier === m ? "bg-slate-800 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          x{m}
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setMultiplier(multiplier + 1)} className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 font-black text-xl hover:bg-slate-200 active:scale-95 transition-all">+</button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
                    <span>Total Contract Money</span>
                    <span className="text-slate-800">₹{betAmount * multiplier}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
                    <span>Platform Fee (2%)</span>
                    <span className="text-slate-800">₹{((betAmount * multiplier) * 0.02).toFixed(2)}</span>
                  </div>
                </div>
                
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-100 flex gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 rounded-xl font-black text-slate-500 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmBet}
                  className="flex-[2] py-4 rounded-xl font-black text-white shadow-lg active:scale-95 transition-all uppercase tracking-wider"
                  style={{ backgroundColor: selectedBet.colorCode }}
                >
                  Confirm (₹{betAmount * multiplier})
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
