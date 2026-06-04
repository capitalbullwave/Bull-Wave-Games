"use client";

import { Award, UserPlus, Coins, Trophy, Gift, Target, CalendarDays, Play, Rocket, Gem, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ActivityPage() {
  const router = useRouter();

  return (
    <div className="w-full flex flex-col bg-slate-50 min-h-screen pb-10 font-sans">
      {/* Top Banner section */}
      <div className="bg-gradient-to-b from-[#b30000] to-[#800000] pt-4 pb-4 px-4 flex flex-col items-center">
        {/* Title */}
        <div className="flex items-center gap-2 mb-4 mt-2">
          <img src="/logo.png" alt="Logo" className="w-6 h-6 rounded-sm object-cover bg-white" />
          <h1 className="text-white text-[18px] font-bold tracking-wide">Bull Wave Club</h1>
        </div>

        {/* Bonus stats */}
        <div className="flex w-full items-center justify-center gap-8 mb-4">
          <div className="flex flex-col items-center w-[100px]">
            <span className="text-white/90 text-[12px] mb-0.5 font-normal">Today's bonus</span>
            <span className="text-white text-[16px] font-bold tracking-wide">₹0.00</span>
          </div>
          <div className="w-px h-8 bg-white/40" />
          <div className="flex flex-col items-center w-[100px]">
            <span className="text-white/90 text-[12px] mb-0.5 font-normal">Total bonus</span>
            <span className="text-white text-[16px] font-bold tracking-wide">₹0.00</span>
          </div>
        </div>

        {/* Bonus Details Button */}
        <button className="bg-[#D4AF37] text-[#800000] w-[180px] py-1.5 rounded-full text-[13px] font-bold active:scale-95 transition-transform shadow-md">
          Bonus details
        </button>
      </div>

      {/* Grid Menu */}
      <div className="bg-white pt-6 pb-2 px-2 grid grid-cols-4 gap-y-6">
        <div className="flex flex-col items-center gap-2 cursor-pointer">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-[#D4AF37] to-[#B8860B] flex items-center justify-center shadow-sm">
            <Award className="text-white" size={24} />
          </div>
          <span className="text-[11px] text-slate-700 text-center leading-tight font-medium">Activity<br/>Award</span>
        </div>
        <div className="flex flex-col items-center gap-2 cursor-pointer">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-[#800000] to-[#600000] flex items-center justify-center shadow-sm">
            <UserPlus className="text-white" size={24} />
          </div>
          <span className="text-[11px] text-slate-700 text-center leading-tight font-medium">Invitation<br/>bonus</span>
        </div>
        <div className="flex flex-col items-center gap-2 cursor-pointer">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-[#D4AF37] to-[#B8860B] flex items-center justify-center shadow-sm">
            <Coins className="text-white" size={24} />
          </div>
          <span className="text-[11px] text-slate-700 text-center leading-tight font-medium">Betting<br/>rebate</span>
        </div>
        <div className="flex flex-col items-center gap-2 cursor-pointer">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-[#800000] to-[#600000] flex items-center justify-center shadow-sm">
            <Trophy className="text-white" size={24} />
          </div>
          <span className="text-[11px] text-slate-700 text-center leading-tight font-medium">Super<br/>Jackpot</span>
        </div>
        <div className="flex flex-col items-center gap-2 cursor-pointer">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-[#D4AF37] to-[#B8860B] flex items-center justify-center shadow-sm">
            <Gift className="text-white" size={24} />
          </div>
          <span className="text-[11px] text-slate-700 text-center leading-tight font-medium">First<br/>gift</span>
        </div>
        <div className="flex flex-col items-center gap-2 cursor-pointer">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-[#800000] to-[#600000] flex items-center justify-center shadow-sm">
            <Target className="text-white" size={24} />
          </div>
          <span className="text-[11px] text-slate-700 text-center leading-tight font-medium">Invite<br/>Wheel</span>
        </div>
      </div>

      {/* Promotional Banners Container */}
      <div className="bg-white px-3 mt-3 pb-6 space-y-3 pt-3">
        
        {/* 2-Column Gifts and Attendance */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#800000]/10 flex flex-col cursor-pointer active:scale-95 transition-transform">
            <div className="h-[90px] bg-gradient-to-br from-[#800000] to-[#4d0000] flex items-center justify-center relative">
              <Gift size={40} className="text-[#D4AF37] drop-shadow-md" />
              <div className="absolute top-2 right-2 flex gap-1">
                 <div className="w-1 h-1 rounded-full bg-[#D4AF37]" />
                 <div className="w-1 h-1 rounded-full bg-[#D4AF37]" />
              </div>
            </div>
            <div className="p-2.5">
              <h3 className="font-bold text-slate-800 text-[13px] mb-1">Gifts</h3>
              <p className="text-slate-500 text-[10px] leading-[1.2]">Enter the redemption code to receive gift rewards</p>
            </div>
          </div>

          <div className="bg-white rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#800000]/10 flex flex-col cursor-pointer active:scale-95 transition-transform">
            <div className="h-[90px] bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center relative">
              <CalendarDays size={40} className="text-white drop-shadow-md" />
              <div className="absolute top-2 right-2 flex gap-1">
                 <div className="w-1 h-1 rounded-full bg-[#800000]" />
                 <div className="w-1 h-1 rounded-full bg-[#800000]" />
              </div>
            </div>
            <div className="p-2.5">
              <h3 className="font-bold text-slate-800 text-[13px] mb-1">Attendance bonus</h3>
              <p className="text-slate-500 text-[10px] leading-[1.2]">The more consecutive days you sign in, the higher the reward will be.</p>
            </div>
          </div>
        </div>

        {/* Full-width banners */}
        
        {/* Become Agent Banner */}
        <div className="bg-white rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#800000]/10 flex flex-col cursor-pointer active:scale-[0.98] transition-transform">
          <div className="h-[120px] bg-black flex flex-row items-center p-4 relative overflow-hidden border-b-2 border-[#D4AF37]">
            <div className="absolute right-[-10px] bottom-[-10px] opacity-20 text-[#D4AF37]">
              <Gem size={100} />
            </div>
            <div className="z-10 w-full relative">
              <div className="flex items-center gap-1 mb-1">
                 <div className="w-3 h-3 rounded-full bg-gradient-to-r from-[#D4AF37] to-white" />
                 <span className="text-[#D4AF37] font-black text-[9px] uppercase tracking-wider">Bull Wave Club</span>
              </div>
              <h2 className="text-white text-[22px] font-black leading-[1.1] mb-1">BECOME<br/>AGENT</h2>
              <p className="text-[#D4AF37] text-[10px] font-bold">ENJOY LUXURY REWARDS</p>
            </div>
          </div>
          <div className="p-3">
            <h3 className="font-bold text-slate-800 text-[14px]">Become Agent Enjoy Luxury Rewards</h3>
          </div>
        </div>

        {/* Member Activities Banner */}
        <div className="bg-white rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#800000]/10 flex flex-col cursor-pointer active:scale-[0.98] transition-transform">
          <div className="h-[120px] bg-gradient-to-r from-[#800000] to-[#4d0000] flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
             <h2 className="text-transparent bg-clip-text bg-gradient-to-b from-[#D4AF37] to-[#F1C40F] text-[28px] font-black text-center leading-tight z-10" style={{ WebkitTextStroke: '0.5px #fff' }}>
                Member<br/>Activities
             </h2>
             <div className="bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#800000] font-bold px-4 py-0.5 rounded-full text-[12px] mt-1 shadow-lg z-10 border border-white uppercase">
               winning streak
             </div>
          </div>
          <div className="p-3 bg-white text-center">
            <h3 className="font-bold text-slate-800 text-[14px] flex items-center justify-center gap-1">
               <span className="text-[#D4AF37] text-sm">⭐</span> Member Activities Winning Streak <span className="text-[#D4AF37] text-sm">⭐</span>
            </h3>
          </div>
        </div>

        {/* Aviator Banner */}
        <div className="bg-white rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#800000]/10 flex flex-col cursor-pointer active:scale-[0.98] transition-transform">
          <div className="h-[120px] bg-gradient-to-r from-[#1a1a2e] to-[#16213e] flex flex-row items-center p-3 relative border-b-2 border-[#D4AF37]">
             <div className="w-[60%] border border-[#D4AF37]/50 rounded-lg p-2 bg-black/40 backdrop-blur-sm z-10">
               <p className="text-white/90 text-[8px] font-medium leading-[1.3]">The new exciting game is popular all over India. Aviator is now in Bull Wave Club. The higher you fly, the higher the multiple. Additional high-multiplier rewards available once a day!</p>
             </div>
             <div className="w-[40%] flex items-center justify-center absolute right-2">
               <Rocket size={70} className="text-[#D4AF37] drop-shadow-[0_0_15px_rgba(212,175,55,0.5)] animate-pulse" />
             </div>
          </div>
          <div className="p-3 bg-white text-center">
            <h3 className="font-bold text-slate-800 text-[14px] flex items-center justify-center gap-1">
               <span className="text-[#D4AF37] text-sm">🚀</span> Aviator High Betting Award <span className="text-[#D4AF37] text-sm">🚀</span>
            </h3>
          </div>
        </div>

        {/* Lucky 10 Days Banner */}
        <div className="bg-white rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#800000]/10 flex flex-col cursor-pointer active:scale-[0.98] transition-transform">
          <div className="h-[120px] bg-gradient-to-r from-[#4d0000] to-black flex flex-col items-center justify-center relative overflow-hidden">
             {/* Background dots/pattern simulation */}
             <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #D4AF37 1px, transparent 1px)', backgroundSize: '10px 10px' }} />
             <h2 className="text-transparent bg-clip-text bg-gradient-to-b from-[#D4AF37] to-[#F1C40F] text-[32px] font-black uppercase italic tracking-tight leading-[1] z-10" style={{ WebkitTextStroke: '0.5px #800000' }}>
                Lucky 10 Days
             </h2>
             <h2 className="text-transparent bg-clip-text bg-gradient-to-b from-[#D4AF37] to-[#F1C40F] text-[26px] font-black uppercase italic tracking-tight leading-[1] z-10" style={{ WebkitTextStroke: '0.5px #800000' }}>
                of INTEREST
             </h2>
          </div>
          <div className="p-3 bg-white">
            <h3 className="font-bold text-slate-800 text-[14px]">Lucky "10" Days Of Interest</h3>
          </div>
        </div>

        {/* Youtube Banner */}
        <div className="bg-white rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#800000]/10 flex flex-col cursor-pointer active:scale-[0.98] transition-transform">
          <div className="h-[120px] bg-[#111] flex flex-col items-center justify-center relative overflow-hidden border-b-2 border-red-600">
             <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-20"><Play size={80} className="text-red-600 fill-red-600"/></div>
             <h2 className="text-white text-[26px] font-black uppercase text-center leading-[1.1] z-10 drop-shadow-md">
                BULL WAVE CLUB<br/><span className="text-red-600">YOUTUBE</span>
             </h2>
             <div className="mt-2 border-y border-[#D4AF37]/50 py-0.5 px-4 z-10">
                <p className="text-[#D4AF37] text-[9px] font-bold uppercase tracking-wider">Make a video content about BULL WAVE CLUB</p>
             </div>
          </div>
          <div className="p-3 bg-white flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-600 shadow-sm" />
            <h3 className="font-bold text-slate-800 text-[14px]">Youtube Creative Video</h3>
            <div className="w-3 h-3 rounded-full bg-red-600 shadow-sm" />
          </div>
        </div>

        {/* Mysterious Gift Banner */}
        <div className="bg-white rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-[#800000]/10 flex flex-col cursor-pointer active:scale-[0.98] transition-transform">
          <div className="h-[120px] bg-gradient-to-r from-[#600000] to-[#800000] flex flex-col justify-center px-4 relative overflow-hidden">
             <div className="absolute right-2 top-1/2 -translate-y-1/2"><Gift size={90} className="text-[#D4AF37] drop-shadow-xl" /></div>
             <h2 className="text-[#D4AF37] font-serif italic text-[24px] font-black z-10 text-shadow-sm">Joy from Heaven</h2>
             <div className="bg-gradient-to-r from-[#D4AF37] to-[#F1C40F] border-2 border-white rounded-[10px] px-3 py-1 inline-block w-max mt-1 shadow-lg z-10">
                <span className="text-[#800000] font-black text-[12px] leading-tight block text-center">Mysterious Bonus<br/>Random Gift</span>
             </div>
          </div>
          <div className="p-3 bg-white text-center">
            <h3 className="font-bold text-[#800000] text-[14px] flex items-center justify-center gap-1">
               ❗ Mysterious Gift ❗
            </h3>
          </div>
        </div>

      </div>
    </div>
  );
}
