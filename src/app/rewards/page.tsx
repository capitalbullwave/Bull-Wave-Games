"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Gift, Calendar, Sparkles, Trophy, 
  ChevronLeft, HelpCircle, FileText, Share2, Coins, ArrowRight 
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";

export default function RewardsPage() {
  const [dailyClaimed, setDailyClaimed] = useState(false);
  const [scratched, setScratched] = useState(false);
  
  // Invite Wheel States
  const [spinning, setSpinning] = useState(false);
  const [spinsLeft, setSpinsLeft] = useState(1);
  const [inviteBalance, setInviteBalance] = useState(479.53);
  const [rotation, setRotation] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(259169); // 71:59:29 in seconds
  const [spinRecords, setSpinRecords] = useState([
    { name: "MemberNNGFNDFO", amount: 0.13, time: "2026-05-18 16:17:59" },
    { name: "MemberNNGFNDFO", amount: 479.40, time: "2026-05-18 16:17:49" }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 259169));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const handleDailyClaim = () => {
    setDailyClaimed(true);
    toast.success("Successfully claimed daily reward: ₹20.00 added to bonus balance!");
  };

  const handleScratch = () => {
    setScratched(true);
    toast.success("Congratulations! You scratched and won ₹150.00!");
  };

  const handleSpinInviteWheel = () => {
    if (spinning) return;
    if (spinsLeft <= 0) {
      toast.error("Out of spins! Invite friends to get more spins.");
      return;
    }

    setSpinning(true);
    setSpinsLeft(0);

    // Let's decide a gorgeous target prize slice:
    // We want them to win ₹15.32 (placing them extremely close to the ₹500 mark)
    // Slice index 7 (representing ₹10) is located between 315° and 360°
    const targetSlice = 7; 
    const targetAngle = 360 - (targetSlice * 45) - 22.5; // Center of slice
    const totalSpins = 5; // Spin 5 times
    const finalRotation = rotation + (360 * totalSpins) + targetAngle - (rotation % 360);

    setRotation(finalRotation);

    setTimeout(() => {
      setSpinning(false);
      const wonAmt = 15.32;
      setWinAmount(wonAmt);
      setInviteBalance((prev) => parseFloat((prev + wonAmt).toFixed(2)));
      
      // Prepend dynamic user spin record!
      const newRecord = {
        name: "You (MemberROHIT)",
        amount: wonAmt,
        time: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      setSpinRecords((prev) => [newRecord, ...prev]);

      setShowCelebration(true);
      toast.success(`Congratulations! You won ₹15.32!`);
    }, 4000); // 4 seconds decelerating rotation
  };

  const handleInviteFriends = () => {
    navigator.clipboard.writeText("https://bullwaveclub.com/register?code=382757617365");
    toast.success("Referral invitation link copied! Share with friends to earn spins.");
    // Simulate awarding 1 free spin for sharing
    setSpinsLeft((prev) => prev + 1);
  };

  // Outer ring glowing bulb coordinates
  const bulbs = Array.from({ length: 16 }).map((_, i) => {
    const angle = (i * 360) / 16;
    const r = 90; // radius
    const x = 100 + r * Math.cos((angle * Math.PI) / 180);
    const y = 100 + r * Math.sin((angle * Math.PI) / 180);
    return { x, y };
  });

  const PRIZES = [
    { val: "₹500", text: "#A31D1D", isCash: true, angle: 0 },
    { val: "₹80", text: "#A31D1D", isCash: true, angle: 45 },
    { val: "₹20", text: "#4A4A4A", isCash: false, angle: 90 },
    { val: "₹30", text: "#4A4A4A", isCash: false, angle: 135 },
    { val: "₹50", text: "#A31D1D", isCash: true, angle: 180 },
    { val: "₹0-10", text: "#4A4A4A", isCash: false, angle: 225 },
    { val: "₹5", text: "#4A4A4A", isCash: false, angle: 270 },
    { val: "₹10", text: "#4A4A4A", isCash: false, angle: 315 },
  ];

  return (
    <div className="animate-in fade-in duration-500 pb-10 w-full">
      <div className="flex flex-col gap-6 w-full">
        
        {/* JAW-DROPPING INVITE SPIN WHEEL */}
        <div className="w-full">
          <div className="relative w-full rounded-3xl overflow-hidden border border-[#D4AF37]/35 shadow-xl bg-gradient-to-b from-[#ff3c1a] via-[#e61a00] to-[#b30000] text-white flex flex-col">
            
            {/* Invite Wheel Top Bar */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <button className="p-1 rounded-full hover:bg-white/10 transition-colors">
                <ChevronLeft size={18} />
              </button>
              <span className="text-sm font-black uppercase tracking-wider text-[#FFE680] drop-shadow-md">Invite Wheel</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toast.info("Invite friends! Get 1 spin token for every registered friend.")}
                  className="p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <HelpCircle size={16} />
                </button>
                <button 
                  onClick={() => toast.info("Opening Invite wheel spin records...")}
                  className="p-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  <FileText size={16} />
                </button>
              </div>
            </div>

            {/* Countdown and Balance */}
            <div className="text-center space-y-2 py-2">
              <p className="text-[10px] font-black text-white/90 bg-black/20 rounded-full px-3 py-1 w-max mx-auto border border-white/10">
                my amount({formatTime(timeLeft)})
              </p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl md:text-5xl font-black text-[#FFE680] drop-shadow-lg tracking-tight">
                  ₹{inviteBalance.toFixed(2)}
                </span>
              </div>
              <button 
                onClick={() => {
                  if (inviteBalance >= 500) {
                    toast.success("Withdraw request of ₹500 successfully submitted!");
                  } else {
                    toast.error(`Minimum payout is ₹500.00! You need ₹${(500 - inviteBalance).toFixed(2)} more.`);
                  }
                }}
                className="bg-gradient-to-r from-[#FFAA00] to-[#FFE680] text-[#800000] font-black text-[10px] uppercase tracking-widest px-8 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 border-b-2 border-[#b35a00]"
              >
                CASH OUT
              </button>
            </div>

            {/* THE PREMIUM WHEEL SECTION */}
            <div className="relative flex flex-col items-center justify-center pt-8 pb-12 overflow-hidden">
              
              {/* Floating gold coins background elements */}
              <div className="absolute top-2 left-6 text-xl animate-bounce">🟡</div>
              <div className="absolute top-8 right-6 text-sm animate-pulse opacity-60">🟡</div>
              <div className="absolute bottom-8 left-12 text-sm animate-pulse opacity-70">🟡</div>

              {/* Pedestal Platform Base in red/gold */}
              <div className="absolute bottom-2 w-48 h-10 bg-gradient-to-b from-[#800000] to-[#4D0000] rounded-t-3xl border-t border-[#D4AF37]/50 flex flex-col items-center justify-end pb-1.5 shadow-2xl z-0">
                <div className="w-40 h-2 bg-gradient-to-r from-transparent via-[#FFE680]/60 to-transparent rounded-full mb-0.5 animate-pulse" />
                <span className="text-[7px] text-[#FFE680]/80 font-black tracking-widest uppercase">Bull Wave Club Fortune</span>
              </div>

              {/* The Rotating Wheel Container */}
              <div className="relative w-64 h-64 flex items-center justify-center z-10">
                
                {/* Glowing Outer Ring border with glowing bulbs */}
                <div className="absolute inset-0 rounded-full border-[8px] border-[#FFE680] shadow-[0_0_25px_rgba(255,230,128,0.6)] bg-[#A31D1D] z-10" />

                {/* Bulbs on outer ring */}
                <svg className="absolute inset-0 w-full h-full z-20 pointer-events-none" viewBox="0 0 200 200">
                  {bulbs.map((bulb, i) => (
                    <circle 
                      key={i} 
                      cx={bulb.x} 
                      cy={bulb.y} 
                      r="2.5" 
                      fill={i % 2 === (spinning ? 1 : 0) ? "#FFFFFF" : "#FFE680"} 
                      className={spinning ? "animate-pulse" : ""}
                      style={{ filter: "drop-shadow(0 0 2px rgba(255,255,255,0.8))" }}
                    />
                  ))}
                </svg>

                {/* Inner Slices Sector Canvas */}
                <motion.div
                  animate={{ rotate: rotation }}
                  transition={{ duration: 4, ease: [0.1, 0.8, 0.1, 1] }}
                  className="absolute w-[94%] h-[94%] rounded-full overflow-hidden z-20 flex items-center justify-center bg-white"
                >
                  <svg viewBox="0 0 200 200" className="w-full h-full">
                    {PRIZES.map((prize, idx) => {
                      const startAng = idx * 45;
                      const endAng = startAng + 45;
                      const radStart = (startAng * Math.PI) / 180;
                      const radEnd = (endAng * Math.PI) / 180;
                      
                      // Outer points
                      const x1 = 100 + 100 * Math.cos(radStart);
                      const y1 = 100 + 100 * Math.sin(radStart);
                      const x2 = 100 + 100 * Math.cos(radEnd);
                      const y2 = 100 + 100 * Math.sin(radEnd);
                      
                      const pathData = `M 100 100 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`;
                      const sliceBg = idx % 2 === 0 ? "#FFE680" : "#FFF9E6";
                      
                      return (
                        <path 
                          key={idx} 
                          d={pathData} 
                          fill={sliceBg} 
                          stroke="#FFAA00" 
                          strokeWidth="0.5" 
                        />
                      );
                    })}
                  </svg>

                  {/* Absolute Pos Slices Prize Text and Mini Graphics */}
                  {PRIZES.map((prize, idx) => {
                    const midAngle = idx * 45 + 22.5;
                    return (
                      <div
                        key={idx}
                        style={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          width: "50%",
                          height: "30px",
                          transformOrigin: "left center",
                          transform: `translate(0, -50%) rotate(${midAngle}deg) translate(28px, 0)`,
                          display: "flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                        className="text-left font-black tracking-tight"
                      >
                        <span className="text-[10px] md:text-xs" style={{ color: prize.text }}>
                          {prize.val}
                        </span>
                        <span className="text-[9px]">
                          {prize.isCash ? "💵" : "🟡"}
                        </span>
                      </div>
                    );
                  })}
                </motion.div>

                {/* Center Spin Button Pointer */}
                <button
                  disabled={spinning}
                  onClick={handleSpinInviteWheel}
                  className="absolute w-14 h-14 rounded-full bg-gradient-to-b from-[#ff3c1a] to-[#800000] border-4 border-[#FFE680] shadow-[0_4px_12px_rgba(0,0,0,0.4)] z-30 flex flex-col items-center justify-center active:scale-95 transition-all text-white shrink-0 cursor-pointer"
                >
                  {/* Glowing Arrow Pointer on Top */}
                  <div className="absolute -top-3 w-4 h-4 bg-[#FFE680] rotate-45 border-l-4 border-t-4 border-[#FFE680] z-0" />
                  
                  <span className="text-xs font-black leading-none z-10 text-[#FFE680] shadow-sm">X{spinsLeft}</span>
                  <span className="text-[6px] font-bold uppercase tracking-widest text-[#FFE680] z-10 leading-none mt-0.5">SPIN</span>
                </button>
              </div>

            </div>

            {/* Bottom Invitation action panel */}
            <div className="px-5 pb-6 space-y-4 text-center z-10">
              <button 
                onClick={handleInviteFriends}
                className="w-full bg-gradient-to-r from-[#FFAA00] to-[#FFE680] hover:from-[#FFE680] hover:to-[#FFAA00] text-[#800000] font-black text-xs uppercase tracking-wider py-4 rounded-2xl shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99] border-b-4 border-[#b35a00] flex items-center justify-center gap-2"
              >
                <Share2 size={16} /> INVITE FRIENDS TO GET SPIN
              </button>
              <div className="space-y-1 pb-2">
                <p className="text-[10px] font-bold text-white/95">
                  Only ₹{(500 - inviteBalance).toFixed(2)} left to get prize ₹500.00
                </p>
                {/* Micro Progress Bar */}
                <div className="w-full h-2 bg-black/35 rounded-full overflow-hidden p-0.5 border border-white/10">
                  <div 
                    className="h-full bg-gradient-to-r from-[#FFAA00] to-[#FFE680] rounded-full transition-all duration-500 shadow-md"
                    style={{ width: `${(inviteBalance / 500) * 100}%` }}
                  />
                </div>
              </div>

              {/* High-Fidelity Record List Section */}
              <div className="text-left pt-4 border-t border-white/15 w-full space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#FFE680]">Record</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
                  {spinRecords.map((rec, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                      <div className="flex items-center gap-3">
                        <img 
                          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80" 
                          alt="Member Avatar" 
                          className="w-8 h-8 rounded-full object-cover border border-[#FFE680]/30 shadow-sm"
                        />
                        <span className="text-xs font-black text-white">{rec.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-[#FFE680]">₹{rec.amount.toFixed(2)}</p>
                        <span className="text-[8px] text-white/50 block mt-0.5">{rec.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* JAW-DROPPING CONGRATULATIONS CELEBRATION DRAWER MODAL */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white border-2 border-[#D4AF37] rounded-3xl p-6 max-w-sm w-full text-center space-y-6 shadow-2xl relative overflow-hidden"
            >
              {/* Sunburst glowing rays in bg */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

              <div className="w-16 h-16 rounded-full bg-[#FFE680]/20 border border-[#D4AF37] flex items-center justify-center mx-auto text-[#D4AF37] animate-bounce">
                <Trophy size={32} />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-[#D4AF37] tracking-widest block">MEGA WIN</span>
                <h3 className="text-2xl font-black text-[#800000] uppercase tracking-wider">Congratulations!</h3>
                <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                  You spun the Fortune Wheel and landed on the verified cash multiplier segment!
                </p>
              </div>

              <div className="bg-[#800000]/5 border border-[#800000]/10 p-4 rounded-2xl">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">CASH BONUS ADDED</span>
                <span className="text-3xl font-black text-[#800000]">₹{winAmount.toFixed(2)}</span>
              </div>

              <div className="pt-2">
                <button 
                  onClick={() => setShowCelebration(false)}
                  className="w-full bg-gradient-to-r from-[#800000] to-[#b30000] hover:from-[#b30000] hover:to-[#800000] text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all"
                >
                  Collect Cash Bonus
                </button>
              </div>

              {/* Progress update note */}
              <p className="text-[9px] text-slate-400 font-bold">
                You are now only ₹{(500 - inviteBalance).toFixed(2)} away from instant ₹500 Cash Out!
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
