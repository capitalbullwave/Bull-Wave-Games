"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Filter, Users, Copy, Download, Share2, DollarSign, Calendar, ShieldCheck, Headset, FileText } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { apiRequest } from "@/lib/api";

export default function ReferralPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [stats, setStats] = useState<any>({
    yesterdayCommission: 0,
    directRegister: 0,
    teamRegister: 0,
    directDepositCount: 0,
    teamDepositCount: 0,
    directDepositAmount: 0,
    teamDepositAmount: 0,
    directFirstDeposit: 0,
    teamFirstDeposit: 0,
    thisWeekCommission: 0,
    totalCommission: 0,
    directSubordinates: 0,
    teamSubordinates: 0
  });

  const invitationCode = (user as any)?.referral_code || "4331521376110";

  const handleCopyCode = () => {
    navigator.clipboard.writeText(invitationCode);
    toast.success("Copy success");
  };

  return (
    <div className="min-h-screen bg-[#f0f3f7] pb-24 font-sans text-gray-800">
      
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center sticky top-0 z-50 shadow-sm border-b border-[#D4AF37]/20">
        <div className="w-8" /> {/* Spacer for centering */}
        <h1 className="text-[18px] flex-1 text-center text-[#800000] font-bold pr-2">Agency</h1>
        <button className="text-[#D4AF37]">
           <FileText size={20} />
        </button>
      </div>

      <div className="bg-[#f0f3f7]">
        {/* Banner Section */}
        <div className="bg-gradient-to-b from-[#b30000] to-[#800000] text-white pt-6 pb-0 flex flex-col items-center relative overflow-hidden rounded-[16px] shadow-sm z-10 mx-3 mt-3">
            {/* Background circles */}
            <div className="absolute top-[-20px] left-[-20px] w-32 h-32 bg-[#D4AF37]/20 rounded-full blur-xl" />
            <div className="absolute top-[20%] right-[-30px] w-40 h-40 bg-[#D4AF37]/20 rounded-full blur-xl" />

            <h2 className="text-[32px] font-medium leading-none mb-2 z-10 drop-shadow-md text-[#D4AF37]">{stats.yesterdayCommission}</h2>
            <div className="bg-[#D4AF37] text-[#800000] text-[12px] px-4 py-0.5 rounded-full mb-1 z-10 font-bold shadow-md">
                Yesterday's total commission
            </div>
            <p className="text-white/80 text-[11px] mb-4 z-10 font-medium">
                Upgrade the level to increase commission income
            </p>

            {/* Subordinates Grid inside banner */}
            <div className="w-full grid grid-cols-2 text-center z-10 border-t border-[#D4AF37]/30 bg-black/10">
                <div className="py-2 border-r border-[#D4AF37]/30">
                    <span className="text-[13px] font-medium text-white/90">Direct subordinates</span>
                </div>
                <div className="py-2">
                    <span className="text-[13px] font-medium text-white/90">Team subordinates</span>
                </div>
            </div>
        </div>

        {/* Stats Content - White Background overlap */}
        <div className="bg-white mx-3 mt-[-15px] pt-[20px] pb-4 shadow-sm border border-[#D4AF37]/10 rounded-[16px] relative z-0">
            <div className="grid grid-cols-2 text-center border-b border-gray-100">
                <div className="py-3 border-r border-gray-100 flex flex-col items-center justify-center">
                    <span className="text-[#800000] font-bold text-[15px]">{stats.directRegister}</span>
                    <span className="text-gray-500 text-[11px] font-medium">number of register</span>
                </div>
                <div className="py-3 flex flex-col items-center justify-center">
                    <span className="text-[#800000] font-bold text-[15px]">{stats.teamRegister}</span>
                    <span className="text-gray-500 text-[11px] font-medium">number of register</span>
                </div>
            </div>

            <div className="grid grid-cols-2 text-center border-b border-gray-100">
                <div className="py-3 border-r border-gray-100 flex flex-col items-center justify-center">
                    <span className="text-[#D4AF37] font-bold text-[15px]">{stats.directDepositCount}</span>
                    <span className="text-gray-500 text-[11px] font-medium">Deposit number</span>
                </div>
                <div className="py-3 flex flex-col items-center justify-center">
                    <span className="text-[#D4AF37] font-bold text-[15px]">{stats.teamDepositCount}</span>
                    <span className="text-gray-500 text-[11px] font-medium">Deposit number</span>
                </div>
            </div>

            <div className="grid grid-cols-2 text-center border-b border-gray-100">
                <div className="py-3 border-r border-gray-100 flex flex-col items-center justify-center">
                    <span className="text-[#D4AF37] font-bold text-[15px]">{stats.directDepositAmount}</span>
                    <span className="text-gray-500 text-[11px] font-medium">Deposit amount</span>
                </div>
                <div className="py-3 flex flex-col items-center justify-center">
                    <span className="text-[#D4AF37] font-bold text-[15px]">{stats.teamDepositAmount}</span>
                    <span className="text-gray-500 text-[11px] font-medium">Deposit amount</span>
                </div>
            </div>

            <div className="grid grid-cols-2 text-center border-b border-gray-100">
                <div className="py-3 border-r border-gray-100 flex flex-col items-center justify-center">
                    <span className="text-[#800000] font-bold text-[15px]">{stats.directFirstDeposit}</span>
                    <span className="text-gray-500 text-[10px] leading-tight max-w-[120px] font-medium">Number of people making first deposit</span>
                </div>
                <div className="py-3 flex flex-col items-center justify-center">
                    <span className="text-[#800000] font-bold text-[15px]">{stats.teamFirstDeposit}</span>
                    <span className="text-gray-500 text-[10px] leading-tight max-w-[120px] font-medium">Number of people making first deposit</span>
                </div>
            </div>
        </div>

        {/* Action Button */}
        <div className="px-4 py-5">
            <button className="w-full bg-gradient-to-r from-[#800000] to-[#600000] text-[#D4AF37] rounded-full py-3.5 text-[15px] font-black uppercase shadow-[0_4px_15px_rgba(128,0,0,0.3)] active:scale-[0.98] transition-transform border border-[#D4AF37]/50">
                Download QR Code
            </button>
        </div>

        {/* Menu Items */}
        <div className="bg-white mx-3 mb-4 rounded-[16px] shadow-sm px-4 pb-2 border border-[#D4AF37]/10">
            
            <div className="flex items-center justify-between py-4 border-b border-gray-100 active:bg-gray-50 cursor-pointer" onClick={handleCopyCode}>
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#800000]/10 flex items-center justify-center border border-[#800000]/20">
                        <Copy size={15} className="text-[#800000]" />
                    </div>
                    <span className="text-[#333] font-bold text-[14px]">Copy invitation code</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-gray-500 font-medium text-[13px]">{invitationCode}</span>
                    <Copy size={16} className="text-[#D4AF37]" />
                </div>
            </div>

            <div className="flex items-center justify-between py-4 border-b border-gray-100 active:bg-gray-50 cursor-pointer">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/30">
                        <Users size={15} className="text-[#D4AF37]" />
                    </div>
                    <span className="text-[#333] font-bold text-[14px]">Subordinate data</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
            </div>

            <div className="flex items-center justify-between py-4 border-b border-gray-100 active:bg-gray-50 cursor-pointer">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#800000]/10 flex items-center justify-center border border-[#800000]/20">
                        <DollarSign size={15} className="text-[#800000]" />
                    </div>
                    <span className="text-[#333] font-bold text-[14px]">Commission detail</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
            </div>

            <div className="flex items-center justify-between py-4 border-b border-gray-100 active:bg-gray-50 cursor-pointer">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/30">
                        <ShieldCheck size={15} className="text-[#D4AF37]" />
                    </div>
                    <span className="text-[#333] font-bold text-[14px]">Invitation rules</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
            </div>

            <div className="flex items-center justify-between py-4 border-b border-gray-100 active:bg-gray-50 cursor-pointer">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#800000]/10 flex items-center justify-center border border-[#800000]/20">
                        <Headset size={15} className="text-[#800000]" />
                    </div>
                    <span className="text-[#333] font-bold text-[14px]">Agent line customer service</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
            </div>

            <div className="flex items-center justify-between py-4 border-b border-gray-100 active:bg-gray-50 cursor-pointer">
                <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/30">
                        <DollarSign size={15} className="text-[#D4AF37]" />
                    </div>
                    <span className="text-[#333] font-bold text-[14px]">Rebate ratio</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
            </div>

        </div>

      </div>

      {/* Promotion Data Box */}
      <div className="bg-white mx-3 mt-1 px-4 pt-4 pb-6 shadow-sm border border-[#D4AF37]/10 rounded-[16px]">
        <div className="flex items-center gap-2 mb-4">
            <DollarSign size={20} className="text-[#D4AF37]" />
            <h3 className="text-[#800000] font-black uppercase text-[15px]">Promotion Data</h3>
        </div>

        <div className="grid grid-cols-2 text-center mb-6">
            <div className="border-r border-gray-100 flex flex-col items-center justify-center">
                <span className="text-[#800000] font-bold text-[18px]">{stats.thisWeekCommission}</span>
                <span className="text-gray-500 font-medium text-[11px] mt-1">This Week</span>
            </div>
            <div className="flex flex-col items-center justify-center">
                <span className="text-[#800000] font-bold text-[18px]">{stats.totalCommission}</span>
                <span className="text-gray-500 font-medium text-[11px] mt-1">Total commission</span>
            </div>
        </div>

        <div className="grid grid-cols-2 text-center">
            <div className="border-r border-gray-100 flex flex-col items-center justify-center">
                <span className="text-[#D4AF37] font-bold text-[18px]">{stats.directSubordinates}</span>
                <span className="text-gray-500 font-medium text-[11px] mt-1">direct subordinate</span>
            </div>
            <div className="flex flex-col items-center justify-center">
                <span className="text-[#D4AF37] font-bold text-[18px]">{stats.teamSubordinates}</span>
                <span className="text-gray-500 font-medium text-[10px] leading-tight max-w-[120px] mt-1">Total number of subordinates in the team</span>
            </div>
        </div>
      </div>

    </div>
  );
}
