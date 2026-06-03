"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, BrainCircuit, History, Award, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface PredictionItem {
  id: string;
  gameId: string;
  gameName: string;
  period: string;
  secondsRemaining: number;
  tags: { text: string; type: "grey" | "red" | "orange" }[];
  options: { label: string; color: string; routePath: string }[];
}

export default function DragonAssistantPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"pedestal" | "mybet">("pedestal");

  // Timers state
  const [timers, setTimers] = useState<{ [key: string]: number }>({
    "5d": 135,   // 2 min 15s
    "k3": 435,   // 7 min 15s
    "wingo": 15  // 0 min 15s
  });

  // Mock bets placed
  const [myBets, setMyBets] = useState<any[]>([
    { id: "b1", gameName: "WinGo 1 Min", period: "20260603100010672", prediction: "Red", amount: 100, status: "won", winAmount: 196 },
    { id: "b2", gameName: "5D 5 Min", period: "20260603102030134", prediction: "Even", amount: 50, status: "pending" }
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(key => {
          if (next[key] > 0) {
            next[key] -= 1;
          } else {
            // Reset to a new mock interval when timer reaches 0
            next[key] = key === "wingo" ? 59 : key === "5d" ? 299 : 599;
            toast.info(`New prediction period active for ${key.toUpperCase()}!`);
          }
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleActionClick = (gameId: string, label: string) => {
    toast.success(`Opening ${label} prediction window!`);
    router.push(`/games/${gameId}`);
  };

  return (
    <div className="min-h-screen bg-[#f4f5f8] flex flex-col font-sans text-slate-800">
      
      {/* Red Header Row */}
      <header className="bg-[#ff5656] text-white h-12 flex items-center px-3 relative flex-shrink-0 shadow-md">
        <button 
          onClick={() => router.push("/lobby")}
          className="p-1 rounded-full hover:bg-white/10 active:scale-95 transition-all text-white flex items-center justify-center cursor-pointer"
        >
          <ChevronLeft size={24} className="stroke-[2.5]" />
        </button>
        <span className="absolute left-1/2 -translate-x-1/2 font-black tracking-wide text-[16px]">
          Dragon assistant
        </span>
      </header>

      {/* Tab Switcher */}
      <nav className="bg-white flex justify-between border-b border-slate-200 flex-shrink-0 shadow-xs">
        <button 
          onClick={() => setActiveTab("pedestal")}
          className={`flex-1 text-center py-3 text-xs font-black transition-all relative ${
            activeTab === "pedestal" ? "text-[#ff5656]" : "text-slate-500 hover:text-[#ff5656]/80"
          }`}
        >
          Latest pedestal
          {activeTab === "pedestal" && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-[2.5px] bg-[#ff5656] rounded-full" />
          )}
        </button>
        <button 
          onClick={() => setActiveTab("mybet")}
          className={`flex-1 text-center py-3 text-xs font-black transition-all relative ${
            activeTab === "mybet" ? "text-[#ff5656]" : "text-slate-500 hover:text-[#ff5656]/80"
          }`}
        >
          My bet
          {activeTab === "mybet" && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-[2.5px] bg-[#ff5656] rounded-full" />
          )}
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-3 overflow-y-auto space-y-3">
        {activeTab === "pedestal" ? (
          <>
            {/* Card 1: 5D 5 Min */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3.5 relative overflow-hidden transition-all hover:shadow-md">
              <div className="flex flex-col gap-1">
                <h3 className="font-black text-slate-800 text-[14px]">5D 5 Min</h3>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span>20260603102030135</span>
                  <span className="text-[#ff5656] font-black tracking-wide text-xs">
                    {formatTime(timers["5d"])}
                  </span>
                </div>
              </div>

              {/* Tags Section */}
              <div className="flex flex-wrap gap-1.5">
                <span className="bg-slate-150 text-slate-600 font-extrabold text-[9px] px-2.5 py-1 rounded-md">
                  E_Even,Odd
                </span>
                <span className="bg-[#ff5656] text-white font-extrabold text-[9px] px-2.5 py-1 rounded-md">
                  Odd
                </span>
                <span className="bg-[#ff5656] text-white font-extrabold text-[9px] px-2.5 py-1 rounded-md">
                  5Period
                </span>
              </div>

              {/* Prediction Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-1.5">
                <button 
                  onClick={() => handleActionClick("g4", "Even")}
                  className="bg-[#00b973] hover:bg-[#00a868] text-white font-black py-2.5 rounded-xl text-xs shadow-sm hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
                >
                  Even
                </button>
                <button 
                  onClick={() => handleActionClick("g4", "Odd")}
                  className="bg-[#ff5656] hover:bg-[#eb4c4c] text-white font-black py-2.5 rounded-xl text-xs shadow-sm hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
                >
                  Odd
                </button>
              </div>
            </div>

            {/* Card 2: K3 10 Min */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3.5 relative overflow-hidden transition-all hover:shadow-md">
              <div className="flex flex-col gap-1">
                <h3 className="font-black text-slate-800 text-[14px]">K3 10 Min</h3>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span>20260603101040068</span>
                  <span className="text-[#ff5656] font-black tracking-wide text-xs">
                    {formatTime(timers["k3"])}
                  </span>
                </div>
              </div>

              {/* Tags Section */}
              <div className="flex flex-wrap gap-1.5">
                <span className="bg-slate-150 text-slate-600 font-extrabold text-[9px] px-2.5 py-1 rounded-md">
                  Sum_Big,Small
                </span>
                <span className="bg-[#ffa337] text-white font-extrabold text-[9px] px-2.5 py-1 rounded-md">
                  Big
                </span>
                <span className="bg-[#ff5656] text-white font-extrabold text-[9px] px-2.5 py-1 rounded-md">
                  5Period
                </span>
              </div>

              {/* Prediction Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-1.5">
                <button 
                  onClick={() => handleActionClick("g3", "Big")}
                  className="bg-[#ffa337] hover:bg-[#e6912c] text-white font-black py-2.5 rounded-xl text-xs shadow-sm hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
                >
                  Big
                </button>
                <button 
                  onClick={() => handleActionClick("g3", "Small")}
                  className="bg-[#4895ef] hover:bg-[#3b82d6] text-white font-black py-2.5 rounded-xl text-xs shadow-sm hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
                >
                  Small
                </button>
              </div>
            </div>

            {/* Card 3: WinGo 1 Min */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3.5 relative overflow-hidden transition-all hover:shadow-md">
              <div className="flex flex-col gap-1">
                <h3 className="font-black text-slate-800 text-[14px]">WinGo 1 Min</h3>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span>20260603100010673</span>
                  <span className="text-[#ff5656] font-black tracking-wide text-xs">
                    {formatTime(timers["wingo"])}
                  </span>
                </div>
              </div>

              {/* Tags Section */}
              <div className="flex flex-wrap gap-1.5">
                <span className="bg-slate-150 text-slate-600 font-extrabold text-[9px] px-2.5 py-1 rounded-md">
                  Color
                </span>
                <span className="bg-[#ff5656] text-white font-extrabold text-[9px] px-2.5 py-1 rounded-md">
                  Red
                </span>
                <span className="bg-[#ff5656] text-white font-extrabold text-[9px] px-2.5 py-1 rounded-md">
                  5Period
                </span>
              </div>

              {/* Prediction Buttons */}
              <div className="grid grid-cols-3 gap-2 mt-1.5">
                <button 
                  onClick={() => handleActionClick("g1", "Green")}
                  className="bg-[#00b973] hover:bg-[#00a868] text-white font-black py-2.5 rounded-xl text-[11px] shadow-sm hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
                >
                  Green
                </button>
                <button 
                  onClick={() => handleActionClick("g1", "Red")}
                  className="bg-[#ff5656] hover:bg-[#eb4c4c] text-white font-black py-2.5 rounded-xl text-[11px] shadow-sm hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
                >
                  Red
                </button>
                <button 
                  onClick={() => handleActionClick("g1", "Violet")}
                  className="bg-[#b05cff] hover:bg-[#9d44eb] text-white font-black py-2.5 rounded-xl text-[11px] shadow-sm hover:scale-[1.01] active:scale-95 transition-all cursor-pointer"
                >
                  Violet
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-3">
            {myBets.map(bet => (
              <div key={bet.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-2 relative">
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-800 text-[13px]">{bet.gameName}</span>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase ${
                    bet.status === "won" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {bet.status}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-bold flex flex-col gap-0.5">
                  <span>Period: {bet.period}</span>
                  <span>Bet: <strong className="text-slate-700">₹{bet.amount}</strong> on <strong className="text-slate-700">{bet.prediction}</strong></span>
                </div>
                {bet.status === "won" && (
                  <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                      <CheckCircle size={12} className="text-green-600" /> Reward
                    </span>
                    <span className="text-xs font-black text-green-600">+₹{bet.winAmount}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
