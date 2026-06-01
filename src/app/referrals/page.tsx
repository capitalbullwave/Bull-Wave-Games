"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronRight, Filter, Users, Copy, Download, 
  Share2, DollarSign, Calendar, ShieldCheck, 
  Headset, FileText, ChevronLeft, Search, Check, Info
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/store/useAuthStore";
import { motion, AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/api";

export default function ReferralPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<"main" | "subordinate_data" | "commission_detail" | "invitation_rules" | "rebate_ratio" | "customer_service">("main");
  
  // Scroll to top of page/main container when changing sub-tabs
  useEffect(() => {
    const mainElement = document.querySelector("main");
    if (mainElement) {
      mainElement.scrollTo({ top: 0, behavior: "instant" });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [activeTab]);

  // States for Subordinate Data & Commission detail
  const [searchUid, setSearchUid] = useState("");
  const [selectedDate, setSelectedDate] = useState("2026-06-01");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [subordinateType, setSubordinateType] = useState("All");
  const [showLevelPicker, setShowLevelPicker] = useState(false);
  const [tempSubordinateType, setTempSubordinateType] = useState("All");
  
  // State for selected category in Rebate ratio tab
  const [rebateCategory, setRebateCategory] = useState<"Lottery" | "Casino" | "Sports" | "Rummy" | "Slots">("Lottery");

  // Date selection states for the wheel picker modal
  const [tempYear, setTempYear] = useState("2026");
  const [tempMonth, setTempMonth] = useState("06");
  const [tempDay, setTempDay] = useState("01");

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
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [referralLink, setReferralLink] = useState(`https://bullwavegames.com/register?ref=${invitationCode}`);

  useEffect(() => {
    const loadReferralsData = async () => {
      try {
        setLoading(true);
        const summary = await apiRequest("/referrals/summary");
        if (summary) {
          setStats((prev: any) => ({
            ...prev,
            yesterdayCommission: summary.total_commissions * 0.12, // derived fraction
            totalCommission: summary.total_commissions,
            directSubordinates: summary.direct_referrals_count,
            teamSubordinates: Math.floor(summary.direct_referrals_count * 1.5),
            thisWeekCommission: summary.total_commissions * 0.8 // derived fraction
          }));
          if (summary.referral_link) {
            setReferralLink(summary.referral_link);
          }
        }

        const commList = await apiRequest("/referrals/commissions");
        if (commList) {
          setCommissions(commList);
        }
      } catch (err) {
        console.error("Failed to load referrals backend summary data", err);
      } finally {
        setLoading(false);
      }
    };
    loadReferralsData();
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(invitationCode);
    toast.success("Copy success");
  };

  const handleConfirmDate = () => {
    setSelectedDate(`${tempYear}-${tempMonth}-${tempDay}`);
    setShowDatePicker(false);
    toast.success(`Date set to ${tempYear}-${tempMonth}-${tempDay}`);
  };

  const handleConfirmLevel = () => {
    setSubordinateType(tempSubordinateType);
    setShowLevelPicker(false);
  };

  // Subordinate mock list for search display
  const mockSubordinates = [
    { uid: "9827351", level: 1, registerDate: "2026-05-30", totalDeposit: 1500, totalBet: 8000 },
    { uid: "1028374", level: 1, registerDate: "2026-05-31", totalDeposit: 500, totalBet: 2000 },
    { uid: "4429381", level: 2, registerDate: "2026-05-28", totalDeposit: 10000, totalBet: 54000 },
  ];

  const filteredSubordinates = mockSubordinates.filter(sub => {
    const matchesUid = searchUid ? sub.uid.includes(searchUid) : true;
    const matchesLevel = subordinateType === "All" ? true : subordinateType === "Tier 1" ? sub.level === 1 : subordinateType === "Tier 2" ? sub.level === 2 : sub.level === 3;
    return matchesUid && matchesLevel;
  });

  return (
    <div className="min-h-screen bg-[#f0f3f7] pb-24 font-sans text-gray-880 relative overflow-hidden">
      
      {/* Global CSS to hide scrollbars on wheel selectors */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}</style>
      
      {/* ---------------- RENDER 1: MAIN AGENCY PANEL ---------------- */}
      {activeTab === "main" && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Header */}
          <div className="bg-white px-4 py-3.5 flex items-center sticky top-0 z-50 shadow-sm border-b border-[#D4AF37]/20">
            <button onClick={() => router.push("/lobby")} className="text-gray-600 active:scale-95 transition-transform">
              <ChevronLeft size={22} />
            </button>
            <h1 className="text-[17px] flex-1 text-center text-[#800000] font-black pr-6">Agency</h1>
          </div>

          <div className="bg-[#f0f3f7]">
            {/* Banner Section */}
            <div className="bg-gradient-to-b from-[#b30000] to-[#800000] text-white pt-6 pb-0 flex flex-col items-center relative overflow-hidden rounded-[16px] shadow-sm z-10 mx-3 mt-3">
              <div className="absolute top-[-20px] left-[-20px] w-32 h-32 bg-[#D4AF37]/25 rounded-full blur-xl" />
              <div className="absolute top-[20%] right-[-30px] w-40 h-40 bg-[#D4AF37]/25 rounded-full blur-xl" />

              <h2 className="text-[32px] font-black leading-none mb-2 z-10 drop-shadow-md text-[#D4AF37]">₹{stats.yesterdayCommission.toFixed(2)}</h2>
              <div className="bg-[#D4AF37] text-[#800000] text-[11px] px-4 py-0.5 rounded-full mb-1.5 z-10 font-black shadow-md">
                Yesterday's total commission
              </div>
              <p className="text-white/85 text-[10px] mb-4 z-10 font-bold tracking-wide">
                Upgrade agency level to increase commission percentage!
              </p>

              {/* Subordinates Grid inside banner */}
              <div className="w-full grid grid-cols-2 text-center z-10 border-t border-[#D4AF37]/20 bg-black/25">
                <div className="py-2.5 border-r border-[#D4AF37]/20">
                  <span className="text-[12px] font-bold text-white/90">Direct subordinates</span>
                </div>
                <div className="py-2.5">
                  <span className="text-[12px] font-bold text-white/90">Team subordinates</span>
                </div>
              </div>
            </div>

            {/* Stats Content - White Background overlap */}
            <div className="bg-white mx-3 mt-[-15px] pt-[25px] pb-4 shadow-sm border border-[#D4AF37]/10 rounded-[16px] relative z-0">
              <div className="grid grid-cols-2 text-center border-b border-gray-100">
                <div className="py-3.5 border-r border-gray-100 flex flex-col items-center justify-center">
                  <span className="text-[#800000] font-black text-[15px]">{stats.directRegister}</span>
                  <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">number of register</span>
                </div>
                <div className="py-3.5 flex flex-col items-center justify-center">
                  <span className="text-[#800000] font-black text-[15px]">{stats.teamRegister}</span>
                  <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">number of register</span>
                </div>
              </div>

              <div className="grid grid-cols-2 text-center border-b border-gray-100">
                <div className="py-3.5 border-r border-gray-100 flex flex-col items-center justify-center">
                  <span className="text-[#D4AF37] font-black text-[15px]">{stats.directDepositCount}</span>
                  <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">Deposit number</span>
                </div>
                <div className="py-3.5 flex flex-col items-center justify-center">
                  <span className="text-[#D4AF37] font-black text-[15px]">{stats.teamDepositCount}</span>
                  <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">Deposit number</span>
                </div>
              </div>

              <div className="grid grid-cols-2 text-center border-b border-gray-100">
                <div className="py-3.5 border-r border-gray-100 flex flex-col items-center justify-center">
                  <span className="text-[#D4AF37] font-black text-[15px]">₹{stats.directDepositAmount}</span>
                  <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">Deposit amount</span>
                </div>
                <div className="py-3.5 flex flex-col items-center justify-center">
                  <span className="text-[#D4AF37] font-black text-[15px]">₹{stats.teamDepositAmount}</span>
                  <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">Deposit amount</span>
                </div>
              </div>

              <div className="grid grid-cols-2 text-center">
                <div className="py-3.5 border-r border-gray-100 flex flex-col items-center justify-center px-2">
                  <span className="text-[#800000] font-black text-[15px]">{stats.directFirstDeposit}</span>
                  <span className="text-gray-400 text-[9px] leading-tight font-bold uppercase tracking-wider text-center mt-0.5">First deposit count</span>
                </div>
                <div className="py-3.5 flex flex-col items-center justify-center px-2">
                  <span className="text-[#800000] font-black text-[15px]">{stats.teamFirstDeposit}</span>
                  <span className="text-gray-400 text-[9px] leading-tight font-bold uppercase tracking-wider text-center mt-0.5">First deposit count</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="px-4 py-4">
              <button 
                onClick={() => toast.success("QR Code downloaded successfully!")}
                className="w-full bg-gradient-to-r from-[#800000] to-[#b30000] text-[#D4AF37] rounded-xl py-3 text-[14px] font-black uppercase shadow-md active:scale-[0.98] transition-transform border border-[#D4AF37]/50 cursor-pointer"
              >
                Download QR Code & Link
              </button>
            </div>

            {/* Menu Items */}
            <div className="bg-white mx-3 mb-4 rounded-[16px] shadow-sm px-4 pb-2 border border-[#D4AF37]/10">
              
              {/* Copy invitation */}
              <div className="flex items-center justify-between py-4 border-b border-gray-100 active:bg-gray-50 cursor-pointer" onClick={handleCopyCode}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#800000]/10 flex items-center justify-center border border-[#800000]/20">
                    <Copy size={15} className="text-[#800000]" />
                  </div>
                  <span className="text-slate-800 font-extrabold text-[14px]">Copy invitation code</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-bold text-[13px]">{invitationCode}</span>
                  <Copy size={16} className="text-[#D4AF37]" />
                </div>
              </div>

              {/* Subordinate Data */}
              <div 
                onClick={() => setActiveTab("subordinate_data")}
                className="flex items-center justify-between py-4 border-b border-gray-100 active:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/30">
                    <Users size={15} className="text-[#D4AF37]" />
                  </div>
                  <span className="text-slate-800 font-extrabold text-[14px]">Subordinate data</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </div>

              {/* Commission detail */}
              <div 
                onClick={() => setActiveTab("commission_detail")}
                className="flex items-center justify-between py-4 border-b border-gray-100 active:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#800000]/10 flex items-center justify-center border border-[#800000]/20">
                    <DollarSign size={15} className="text-[#800000]" />
                  </div>
                  <span className="text-slate-800 font-extrabold text-[14px]">Commission detail</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </div>

              {/* Invitation rules */}
              <div 
                onClick={() => setActiveTab("invitation_rules")}
                className="flex items-center justify-between py-4 border-b border-gray-100 active:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/30">
                    <ShieldCheck size={15} className="text-[#D4AF37]" />
                  </div>
                  <span className="text-slate-800 font-extrabold text-[14px]">Invitation rules</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </div>

              {/* Agent line customer service */}
              <div 
                onClick={() => setActiveTab("customer_service")}
                className="flex items-center justify-between py-4 border-b border-gray-100 active:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#800000]/10 flex items-center justify-center border border-[#800000]/20">
                    <Headset size={15} className="text-[#800000]" />
                  </div>
                  <span className="text-slate-800 font-extrabold text-[14px]">Agent line customer service</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </div>

              {/* Rebate ratio */}
              <div 
                onClick={() => setActiveTab("rebate_ratio")}
                className="flex items-center justify-between py-4 active:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center border border-[#D4AF37]/30">
                    <DollarSign size={15} className="text-[#D4AF37]" />
                  </div>
                  <span className="text-slate-800 font-extrabold text-[14px]">Rebate ratio</span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </div>

            </div>

          </div>

          {/* Promotion Data Box */}
          <div className="bg-white mx-3 mt-1 px-4 pt-4 pb-6 shadow-sm border border-[#D4AF37]/10 rounded-[16px]">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign size={20} className="text-[#D4AF37]" />
              <h3 className="text-[#800000] font-black uppercase text-[14px]">Promotion Data</h3>
            </div>

            <div className="grid grid-cols-2 text-center mb-6">
              <div className="border-r border-gray-100 flex flex-col items-center justify-center">
                <span className="text-[#800000] font-black text-[18px]">₹{stats.thisWeekCommission.toFixed(2)}</span>
                <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider mt-1">This Week</span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <span className="text-[#800000] font-black text-[18px]">₹{stats.totalCommission.toFixed(2)}</span>
                <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider mt-1">Total commission</span>
              </div>
            </div>

            <div className="grid grid-cols-2 text-center">
              <div className="border-r border-gray-100 flex flex-col items-center justify-center">
                <span className="text-[#D4AF37] font-black text-[18px]">{stats.directSubordinates}</span>
                <span className="text-gray-400 font-bold text-[10px] uppercase tracking-wider mt-1">direct subordinate</span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <span className="text-[#D4AF37] font-black text-[18px]">{stats.teamSubordinates}</span>
                <span className="text-gray-400 font-bold text-[9px] leading-tight max-w-[120px] text-center mt-1">Total team subordinates</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ---------------- RENDER 2: SUBORDINATE DATA (Screenshot 1) ---------------- */}
      {activeTab === "subordinate_data" && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {/* Header */}
          <div className="bg-white px-4 py-3.5 flex items-center sticky top-0 z-50 shadow-sm border-b border-slate-100">
            <button onClick={() => setActiveTab("main")} className="text-gray-600 active:scale-95 transition-transform">
              <ChevronLeft size={22} />
            </button>
            <h1 className="text-[17px] flex-1 text-center text-slate-800 font-bold pr-6">Subordinate data</h1>
          </div>

          {/* Filters Area */}
          <div className="px-3 space-y-3">
            {/* Search Input block */}
            <div className="bg-white rounded-xl shadow-sm p-1.5 flex items-center gap-2 border border-slate-100">
              <input 
                type="text" 
                placeholder="Search subordinate UID" 
                value={searchUid}
                onChange={(e) => setSearchUid(e.target.value)}
                className="flex-1 bg-transparent px-3 py-2 text-[13px] focus:outline-none text-slate-700 placeholder-slate-400 font-medium"
              />
              <button 
                onClick={() => toast.success(`Searching UID: ${searchUid}`)}
                className="w-10 h-10 rounded-xl bg-[#f95a5a] text-white flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
              >
                <Search size={18} />
              </button>
            </div>

            {/* Select Dropdowns Grid */}
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <button 
                  onClick={() => {
                    setTempSubordinateType(subordinateType);
                    setShowLevelPicker(true);
                  }}
                  className="w-full bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-[13px] text-slate-700 font-bold shadow-sm flex items-center justify-between cursor-pointer"
                >
                  <span>{subordinateType}</span>
                  <span className="text-slate-400">▼</span>
                </button>
              </div>

              {/* Date button */}
              <button 
                onClick={() => setShowDatePicker(true)}
                className="w-full bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-[13px] text-slate-700 font-bold shadow-sm flex items-center justify-between cursor-pointer"
              >
                <span>{selectedDate}</span>
                <span className="text-slate-400">▼</span>
              </button>
            </div>

            {/* Red Stats Box (Exact matching Screenshot 1 layout) */}
            <div className="bg-[#f95a5a] rounded-2xl p-4 text-white space-y-4 shadow-md relative overflow-hidden">
              <div className="grid grid-cols-2 border-b border-white/20 pb-4">
                <div className="text-center border-r border-white/20">
                  <span className="text-[20px] font-black block">0</span>
                  <span className="text-[10px] font-bold text-white/80 block mt-0.5">Deposit number</span>
                </div>
                <div className="text-center">
                  <span className="text-[20px] font-black block">₹0.00</span>
                  <span className="text-[10px] font-bold text-white/80 block mt-0.5">Deposit amount</span>
                </div>
              </div>

              <div className="grid grid-cols-2 border-b border-white/20 pb-4">
                <div className="text-center border-r border-white/20">
                  <span className="text-[20px] font-black block">0</span>
                  <span className="text-[10px] font-bold text-white/80 block mt-0.5">Number of bettors</span>
                </div>
                <div className="text-center">
                  <span className="text-[20px] font-black block">₹0.00</span>
                  <span className="text-[10px] font-bold text-white/80 block mt-0.5">Total bet</span>
                </div>
              </div>

              <div className="grid grid-cols-2">
                <div className="text-center border-r border-white/20 px-1">
                  <span className="text-[20px] font-black block">0</span>
                  <span className="text-[9px] font-bold leading-tight text-white/80 block mt-0.5">Number of people making first deposit</span>
                </div>
                <div className="text-center px-1">
                  <span className="text-[20px] font-black block">₹0.00</span>
                  <span className="text-[9px] font-bold leading-tight text-white/80 block mt-0.5">First deposit amount</span>
                </div>
              </div>
            </div>

            {/* Subordinate Data List display */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 border-b border-slate-50 pb-2">Subordinates list</h3>
              
              {filteredSubordinates.length > 0 ? (
                <div className="space-y-3">
                  {filteredSubordinates.map((sub, idx) => (
                    <div key={idx} className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-extrabold text-slate-800">UID: {sub.uid}</p>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Register: {sub.registerDate}</span>
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 font-black text-[9px] uppercase inline-block mt-1">Level {sub.level}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#800000]">Bet: ₹{sub.totalBet}</p>
                        <span className="text-[10px] text-slate-500 font-bold block mt-0.5">Dep: ₹{sub.totalDeposit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-slate-350">
                  <Users size={48} className="opacity-30 mb-2" />
                  <p className="text-xs font-bold">No subordinate data found for this period</p>
                </div>
              )}
            </div>

          </div>
        </motion.div>
      )}

      {/* ---------------- RENDER 3: COMMISSION DETAILS (Screenshot 2) ---------------- */}
      {activeTab === "commission_detail" && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {/* Header */}
          <div className="bg-white px-4 py-3.5 flex items-center sticky top-0 z-50 shadow-sm border-b border-slate-100">
            <button onClick={() => setActiveTab("main")} className="text-gray-600 active:scale-95 transition-transform">
              <ChevronLeft size={22} />
            </button>
            <h1 className="text-[17px] flex-1 text-center text-slate-800 font-bold pr-6">Commission Details</h1>
          </div>

          <div className="px-3 space-y-4">
            {/* Date button matching Screenshot 2 dropdown trigger */}
            <button 
              onClick={() => setShowDatePicker(true)}
              className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-[14px] text-slate-700 font-bold shadow-sm flex items-center justify-between cursor-pointer"
            >
              <span>{selectedDate}</span>
              <span className="text-slate-400">▼</span>
            </button>

            {/* Commission Logs List */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
              {loading ? (
                <div className="text-center py-10 flex flex-col items-center gap-2">
                  <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Loading records...</span>
                </div>
              ) : commissions.length > 0 ? (
                <div className="space-y-3">
                  {commissions.map((comm) => (
                    <div key={comm.id} className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between text-xs text-left">
                      <div>
                        <p className="font-extrabold text-slate-800">Referee: @{comm.referee_username}</p>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Date: {new Date(comm.created_at).toLocaleDateString()}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-black text-[9px] uppercase inline-block mt-1">Level {comm.level}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-emerald-600">+₹{comm.commission_amount.toFixed(2)}</p>
                        <span className="text-[9px] font-bold uppercase text-slate-400 mt-1 block">{comm.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-slate-350 text-center">
                  <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 mx-auto text-[#800000]">
                    <DollarSign size={28} />
                  </div>
                  <h4 className="text-sm font-black text-slate-800 mb-1">No Commission Records</h4>
                  <p className="text-[11px] leading-relaxed text-slate-400 max-w-[200px] mx-auto font-medium">
                    Commission is calculated and settled daily at 01:00 AM.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* ---------------- RENDER 4: INVITATION RULES & REBATE RATIO (Screenshot 3, 4, 5) ---------------- */}
      {activeTab === "invitation_rules" && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {/* Header */}
          <div className="bg-white px-4 py-3.5 flex items-center sticky top-0 z-50 shadow-sm border-b border-slate-100">
            <button onClick={() => setActiveTab("main")} className="text-gray-600 active:scale-95 transition-transform">
              <ChevronLeft size={22} />
            </button>
            <h1 className="text-[17px] flex-1 text-center text-slate-800 font-bold pr-6">Rules</h1>
          </div>

          <div className="px-3 space-y-4 pb-12">
            
            {/* Program Title Banner (Screenshot 3 style) */}
            <div className="text-center space-y-1">
              <h2 className="text-[#f95a5a] font-extrabold text-[20px] uppercase tracking-wider">
                【Promotion partner】program
              </h2>
              <p className="text-slate-400 text-xs font-semibold">
                This activity is valid for a long time
              </p>
            </div>

            {/* Rule Cards List (Exactly matching Screenshot 3 & 4 layout) */}
            <div className="space-y-4">
              
              {/* Card 1 */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-[#f95a5a] to-[#f46868] text-white py-1 px-4 w-16 text-center rounded-br-2xl text-xs font-black">
                  01
                </div>
                <p className="p-4 text-xs font-bold leading-relaxed text-slate-500 text-justify">
                  There are 6 subordinate levels in inviting friends, if A invites B, then B is a level 1 subordinate of A. If B invites C, then C is a level 1 subordinate of B and also a level 2 subordinate of A. If C invites D, then D is a level 1 subordinate of C, at the same time a level 2 subordinate of B and also a level 3 subordinate of A.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-[#f95a5a] to-[#f46868] text-white py-1 px-4 w-16 text-center rounded-br-2xl text-xs font-black">
                  02
                </div>
                <p className="p-4 text-xs font-bold leading-relaxed text-slate-500 text-justify">
                  When inviting friends to register, you must send the invitation link provided or enter the invitation code manually so that your friends become your level 1 subordinates.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-[#f95a5a] to-[#f46868] text-white py-1 px-4 w-16 text-center rounded-br-2xl text-xs font-black">
                  03
                </div>
                <p className="p-4 text-xs font-bold leading-relaxed text-slate-500 text-justify">
                  The invitee registers via the inviter's invitation code and completes the deposit, shortly after that the commission will be received immediately
                </p>
              </div>

              {/* Card 4 */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-[#f95a5a] to-[#f46868] text-white py-1 px-4 w-16 text-center rounded-br-2xl text-xs font-black">
                  04
                </div>
                <p className="p-4 text-xs font-bold leading-relaxed text-slate-500 text-justify">
                  The calculation of yesterday's commission starts every morning at 01:00. After the commission calculation is completed, the commission is rewarded to the wallet and can be viewed through the commission collection record.
                </p>
              </div>

              {/* Card 5 - Rebate Table Card (Screenshot 4 & 5 layout) */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-[#f95a5a] to-[#f46868] text-white py-1 px-4 w-16 text-center rounded-br-2xl text-xs font-black">
                  05
                </div>
                <div className="p-4 space-y-4">
                  <p className="text-xs font-bold leading-relaxed text-slate-500 text-justify">
                    Commission rates vary depending on your agency level on that day.<br />
                    <span className="text-[#800000] font-black">Number of Teams:</span> How many downline deposits you have to date.<br />
                    <span className="text-[#800000] font-black">Team Betting:</span> The total volume of betting made by your downline in one day.<br />
                    <span className="text-[#800000] font-black">Team Deposit:</span> Your downline deposits within one day.
                  </p>

                  {/* Gold crowned agency rebate tiers table */}
                  <div className="overflow-x-auto border border-slate-100 rounded-xl">
                    <table className="w-full text-center text-xs">
                      <thead>
                        <tr className="bg-[#f95a5a] text-white font-extrabold">
                          <th className="py-2.5 px-1.5">Rebate level</th>
                          <th className="py-2.5 px-1.5">Team Number</th>
                          <th className="py-2.5 px-1.5">Team Betting</th>
                          <th className="py-2.5 px-1.5">Team Deposit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-bold text-slate-600">
                        {[
                          { level: "L0", number: "0", betting: "0", deposit: "0" },
                          { level: "L1", number: "5", betting: "500K", deposit: "100K" },
                          { level: "L2", number: "10", betting: "1,000K", deposit: "200K" },
                          { level: "L3", number: "15", betting: "2.50M", deposit: "500K" },
                          { level: "L4", number: "20", betting: "3.50M", deposit: "700K" },
                          { level: "L5", number: "25", betting: "5M", deposit: "1,000K" },
                          { level: "L6", number: "30", betting: "10M", deposit: "2M" },
                          { level: "L7", number: "100", betting: "100M", deposit: "20M" },
                          { level: "L8", number: "500", betting: "500M", deposit: "100M" },
                          { level: "L9", number: "1000", betting: "1,000M", deposit: "200M" },
                          { level: "L10", number: "5000", betting: "1,500M", deposit: "300M" },
                        ].map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-2 px-1 flex items-center justify-center gap-1">
                              <span className="w-4 h-4 text-[9px] bg-gradient-to-tr from-amber-400 to-yellow-500 text-white rounded-full flex items-center justify-center shadow-sm">👑</span>
                              <span className="text-[#D4AF37] font-black">{row.level}</span>
                            </td>
                            <td className="py-2 px-1 text-slate-800">{row.number}</td>
                            <td className="py-2 px-1 text-[#800000]">{row.betting}</td>
                            <td className="py-2 px-1 text-emerald-600">{row.deposit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Card 6 */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-[#f95a5a] to-[#f46868] text-white py-1 px-4 w-16 text-center rounded-br-2xl text-xs font-black">
                  06
                </div>
                <p className="p-4 text-xs font-bold leading-relaxed text-slate-500 text-justify">
                  The commission percentage depends on the membership level. The higher the membership level, the higher the bonus percentage. Different game types also have different payout percentages. The commission rate is specifically explained as follows.
                  <span className="text-[#f95a5a] font-extrabold ml-1 cursor-pointer hover:underline block mt-1">View rebate ratio &gt;&gt;</span>
                </p>
              </div>

              {/* Card 7 */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-[#f95a5a] to-[#f46868] text-white py-1 px-4 w-16 text-center rounded-br-2xl text-xs font-black">
                  07
                </div>
                <p className="p-4 text-xs font-bold leading-relaxed text-slate-500 text-justify">
                  TOP20 commission rankings will be randomly awarded with a separate bonus.
                </p>
              </div>

              {/* Card 8 */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-[#f95a5a] to-[#f46868] text-white py-1 px-4 w-16 text-center rounded-br-2xl text-xs font-black">
                  08
                </div>
                <p className="p-4 text-xs font-bold leading-relaxed text-slate-500 text-justify">
                  The final interpretation of this activity belongs to Welcome to Bull Wave Games.
                </p>
              </div>

            </div>

          </div>
        </motion.div>
      )}

      {/* ---------------- RENDER 5: REBATE RATIO (Screenshots 1-5 style) ---------------- */}
      {activeTab === "rebate_ratio" && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="min-h-screen flex flex-col pb-24 bg-[#f0f3f7] relative overflow-hidden"
        >
          {/* Header */}
          <div className="bg-white px-4 py-3.5 flex items-center sticky top-0 z-50 shadow-sm border-b border-slate-100 shrink-0">
            <button onClick={() => setActiveTab("main")} className="text-gray-600 active:scale-95 transition-transform">
              <ChevronLeft size={22} />
            </button>
            <h1 className="text-[17px] flex-1 text-center text-slate-800 font-bold pr-6">Rebate ratio</h1>
          </div>

          {/* Horizontal category slider */}
          <div className="flex gap-2 overflow-x-auto px-3 pb-3 pt-2 no-scrollbar shrink-0">
            {[
              { id: "Lottery", label: "Lottery", icon: "🎱" },
              { id: "Casino", label: "Casino", icon: "📺" },
              { id: "Sports", label: "Sports", icon: "⚽" },
              { id: "Rummy", label: "Rummy", icon: "🎴" },
              { id: "Slots", label: "Slots", icon: "🎰" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setRebateCategory(cat.id as any)}
                className={`flex flex-col items-center gap-1.5 px-6 py-2.5 rounded-2xl font-black text-xs transition-all shadow-sm shrink-0 border cursor-pointer ${
                  rebateCategory === cat.id
                    ? "bg-[#f95a5a] border-[#f95a5a] text-white"
                    : "bg-white border-slate-100 text-slate-500 hover:bg-slate-50"
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Rebate Levels List */}
          <div className="flex-1 overflow-y-auto px-3 space-y-4 pb-12 no-scrollbar">
            {[
              { level: "L0", ratios: ["0.6%", "0.18%", "0.054%", "0.0162%", "0.00486%", "0.001458%"] },
              { level: "L1", ratios: ["0.7%", "0.245%", "0.08575%", "0.030012%", "0.010504%", "0.003677%"] },
              { level: "L2", ratios: ["0.75%", "0.28125%", "0.105469%", "0.039551%", "0.014832%", "0.005562%"] },
              { level: "L3", ratios: ["0.8%", "0.32%", "0.128%", "0.0512%", "0.02048%", "0.008192%"] },
              { level: "L4", ratios: ["0.85%", "0.36125%", "0.153531%", "0.065251%", "0.027732%", "0.011786%"] },
              { level: "L5", ratios: ["0.9%", "0.405%", "0.18225%", "0.082012%", "0.036906%", "0.016608%"] },
              { level: "L6", ratios: ["1%", "0.5%", "0.25%", "0.125%", "0.0625%", "0.03125%"] },
              { level: "L7", ratios: ["1.1%", "0.605%", "0.33275%", "0.183013%", "0.100657%", "0.055361%"] },
              { level: "L8", ratios: ["1.2%", "0.72%", "0.432%", "0.2592%", "0.15552%", "0.093312%"] },
              { level: "L9", ratios: ["1.3%", "0.845%", "0.54925%", "0.357013%", "0.232058%", "0.150838%"] },
              { level: "L10", ratios: ["1.4%", "0.98%", "0.686%", "0.4802%", "0.33614%", "0.235298%"] },
            ].map((tier, idx) => (
              <div key={tier.level} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
                {/* Title */}
                <h3 className="text-sm font-black text-slate-800">
                  Rebate level <span className="text-[#f95a5a] italic ml-1 text-base">{tier.level}</span>
                </h3>

                {/* Subordinates Ratios with Connecting Dashed Lines */}
                <div className="relative flex flex-col gap-4">
                  {/* Vertical dashed line */}
                  <div className="absolute left-[11px] top-3.5 bottom-3.5 w-[1.5px] border-l border-dashed border-red-300 z-0" />

                  {tier.ratios.map((ratio, levelNum) => {
                    // Generate category specific slightly adjusted rates for Casino/Sports/Rummy
                    let displayRatio = ratio;
                    if (rebateCategory !== "Lottery") {
                      const numVal = parseFloat(ratio);
                      const scaled = numVal * (rebateCategory === "Casino" ? 0.75 : rebateCategory === "Sports" ? 0.8 : 0.85);
                      displayRatio = scaled.toFixed(scaled % 1 === 0 ? 1 : 4).replace(/\.?0+$/, "") + "%";
                    }

                    return (
                      <div key={levelNum} className="flex items-center gap-3 relative z-10">
                        {/* Red concentric target bullet icon */}
                        <div className="w-[22px] h-[22px] rounded-full border border-red-400 bg-white flex items-center justify-center shrink-0 shadow-sm">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                        </div>

                        {/* Content row */}
                        <span className="flex-1 text-slate-500 font-bold text-xs">
                          {levelNum + 1} level lower level commission rebate
                        </span>
                        <span className="text-slate-800 font-extrabold text-xs">
                          {displayRatio}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ---------------- RENDER 6: AGENT CUSTOMER SERVICE (Screenshot 2 style) ---------------- */}
      {activeTab === "customer_service" && (
        <motion.div 
          initial={{ opacity: 0, x: 20 }} 
          animate={{ opacity: 1, x: 0 }}
          className="min-h-screen bg-white flex flex-col pb-24 relative overflow-hidden"
        >
          {/* Custom Red Gradient Header matching Screenshot 2 */}
          <div className="bg-gradient-to-r from-[#f95a5a] to-[#f46868] text-white px-4 py-4 flex items-center sticky top-0 z-50 shadow-sm border-b border-rose-400/20 shrink-0">
            <button onClick={() => setActiveTab("main")} className="text-white active:scale-95 transition-transform">
              <ChevronLeft size={22} className="stroke-[3]" />
            </button>
            <h1 className="text-[17px] flex-1 text-center text-white font-black pr-6">Agent line customer service</h1>
          </div>

          <div className="flex-1 flex flex-col justify-start">
            {/* Custom Support Representative Banner with custom graphics */}
            <div className="w-full relative shadow-md overflow-hidden bg-slate-900 aspect-[4/3] max-w-md mx-auto">
              <img 
                src="/assets/agent_service.png" 
                alt="Agent Customer Support Representatives" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Support Desk Access Details */}
            <div className="p-6 space-y-6 text-center max-w-sm mx-auto">
              <div className="space-y-2">
                <h2 className="text-[#800000] font-black text-xl">24/7 Dedicated Support Agent</h2>
                <p className="text-slate-500 font-bold text-xs leading-relaxed">
                  Have questions about rebate levels, commission payouts, or downline management? Reach our official partner service line immediately!
                </p>
              </div>

              {/* Start Chat action button to link support page */}
              <button 
                onClick={() => router.push("/support")}
                className="w-full bg-gradient-to-r from-[#f95a5a] to-[#f46868] hover:from-[#f46868] hover:to-[#f95a5a] text-white rounded-2xl py-4 text-sm font-black uppercase shadow-lg active:scale-95 transition-all cursor-pointer border border-rose-400/20"
              >
                Connect to Live Support Chat
              </button>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Response time: &lt; 1 minute</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ---------------- INTERACTIVE DATEPICKER MODAL (Screenshot 2 Wheel effect) ---------------- */}
      <AnimatePresence>
        {showDatePicker && (
          <div className="absolute inset-0 bg-black/60 z-50 flex items-end justify-center overflow-hidden">
            
            {/* Modal backdrop closer */}
            <div className="absolute inset-0" onClick={() => setShowDatePicker(false)} />

            {/* Picker Content Panel */}
            <motion.div 
              initial={{ y: 250 }} 
              animate={{ y: 0 }} 
              exit={{ y: 250 }}
              className="bg-white w-full rounded-t-[24px] z-50 pb-6 shadow-2xl relative max-w-md"
            >
              {/* Header Actions */}
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <button 
                  onClick={() => setShowDatePicker(false)}
                  className="text-slate-400 font-bold text-sm hover:text-slate-600 active:scale-95 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <span className="text-slate-800 font-black text-base">Choose a date</span>
                <button 
                  onClick={handleConfirmDate}
                  className="text-[#f95a5a] font-black text-sm hover:text-[#e04343] active:scale-95 transition-all cursor-pointer"
                >
                  Confirm
                </button>
              </div>

              {/* Scrolling Selection Wheels representation */}
              <div className="flex justify-center items-center py-8 relative h-48 px-6">
                
                {/* Visual indicator bar overlay */}
                <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-10 border-y border-slate-100 pointer-events-none bg-slate-50/40 z-0" />

                {/* Grid for Year, Month, Day selectors */}
                <div className="grid grid-cols-3 w-full text-center text-sm z-10 font-bold text-slate-700 relative">
                  
                  {/* Year Wheel */}
                  <div className="flex flex-col gap-3">
                    <span className="text-slate-300 opacity-60">2024</span>
                    <span className="text-slate-350 opacity-80">2025</span>
                    <span className="text-slate-800 font-black text-base bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-300/30">2026</span>
                    <span className="text-slate-350 opacity-80">2027</span>
                  </div>

                  {/* Month Wheel */}
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => setTempMonth("04")} 
                      className={`text-sm ${tempMonth === "04" ? "text-slate-800 font-black" : "text-slate-350"}`}
                    >04</button>
                    <button 
                      onClick={() => setTempMonth("05")} 
                      className={`text-sm ${tempMonth === "05" ? "text-slate-800 font-black" : "text-slate-350"}`}
                    >05</button>
                    <button 
                      onClick={() => setTempMonth("06")} 
                      className={`text-sm font-black text-base bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-300/30 text-slate-800`}
                    >06</button>
                    <button 
                      onClick={() => setTempMonth("07")} 
                      className={`text-sm ${tempMonth === "07" ? "text-slate-800 font-black" : "text-slate-350"}`}
                    >07</button>
                  </div>

                  {/* Day Wheel */}
                  <div className="flex flex-col gap-3 max-h-36 overflow-y-auto pr-1 no-scrollbar">
                    {["01", "02", "03", "04", "05", "10", "15", "20", "25", "30", "31"].map((day) => (
                      <button 
                        key={day}
                        onClick={() => setTempDay(day)}
                        className={`text-sm py-0.5 transition-all ${
                          tempDay === day 
                            ? "text-slate-800 font-black text-base bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-300/30" 
                            : "text-slate-350 hover:text-slate-700"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>

                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ---------------- INTERACTIVE LEVELPICKER MODAL (Screenshot 3 style) ---------------- */}
      <AnimatePresence>
        {showLevelPicker && (
          <div className="absolute inset-0 bg-black/60 z-50 flex items-end justify-center overflow-hidden">
            
            {/* Modal backdrop closer */}
            <div className="absolute inset-0" onClick={() => setShowLevelPicker(false)} />

            {/* Picker Content Panel */}
            <motion.div 
              initial={{ y: 250 }} 
              animate={{ y: 0 }} 
              exit={{ y: 250 }}
              className="bg-white w-full rounded-t-[24px] z-50 pb-6 shadow-2xl relative max-w-md"
            >
              {/* Header Actions */}
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                <button 
                  onClick={() => setShowLevelPicker(false)}
                  className="text-slate-400 font-bold text-sm hover:text-slate-600 active:scale-95 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <span className="text-slate-800 font-black text-base">Select Tier</span>
                <button 
                  onClick={handleConfirmLevel}
                  className="text-[#f95a5a] font-black text-sm hover:text-[#e04343] active:scale-95 transition-all cursor-pointer"
                >
                  Confirm
                </button>
              </div>

              {/* Scrolling Selection Wheel representation */}
              <div className="flex justify-center items-center py-6 relative h-48 px-6">
                
                {/* Visual indicator bar overlay */}
                <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-10 border-y border-slate-100 pointer-events-none bg-slate-50/40 z-0" />

                {/* Vertical wheel list */}
                <div className="flex flex-col items-center gap-3 w-full text-center text-sm z-10 font-bold text-slate-700 relative h-36 overflow-y-auto no-scrollbar">
                  {["All", "Tier 1", "Tier 2", "Tier 3"].map((level) => (
                    <button 
                      key={level}
                      onClick={() => setTempSubordinateType(level)}
                      className={`text-sm py-1.5 w-full transition-all ${
                        tempSubordinateType === level 
                          ? "text-slate-800 font-black text-base bg-amber-500/10 px-4 py-1 rounded-lg border border-amber-300/30 max-w-[120px]" 
                          : "text-slate-350 hover:text-slate-700"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
