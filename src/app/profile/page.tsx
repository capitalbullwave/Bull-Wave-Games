"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, CheckCircle2, AlertCircle, Upload, LogOut, ChevronRight, ChevronLeft,
  Bell, Gift, BarChart3, Globe, Settings, MessageSquare, Megaphone, 
  Headphones, BookOpen, Box, Power, X, Calendar, ClipboardList, Wallet
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { apiRequest } from "@/lib/api";

export default function ProfilePage() {
  const { user, updateProfile, logout, language, setLanguage } = useAuthStore();
  const router = useRouter();
  
  // Profile Form States
  const [fullName, setFullName] = useState(user?.fullName || "Rohit Kumar");
  const [address, setAddress] = useState(user?.address || "Sector 62, Noida, India");
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [dob, setDob] = useState(user?.dob || "1998-05-15");
  const [gender, setGender] = useState(user?.gender || "male");
  const [upiId, setUpiId] = useState("rohit@ybl");
  const [bankAcc, setBankAcc] = useState("987654321012");
  const [bankIfsc, setBankIfsc] = useState("SBIN0001234");
  const [kycDoc, setKycDoc] = useState<File | null>(null);
  const [giftCode, setGiftCode] = useState("");
  
  // History State
  const [depositHistory, setDepositHistory] = useState<any[]>([]);
  const [withdrawHistory, setWithdrawHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Fetch History Effect
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      try {
        if (activeModal === "depositHistory") {
          const resp = await apiRequest("/wallet/deposit/history?page=1&size=20");
          setDepositHistory(resp.data?.items || []);
        } else if (activeModal === "withdrawHistory") {
          const resp = await apiRequest("/wallet/withdraw/history?page=1&size=20");
          setWithdrawHistory(resp.data?.items || []);
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to load history");
      } finally {
        setIsLoadingHistory(false);
      }
    };
    
    if (activeModal === "depositHistory" || activeModal === "withdrawHistory") {
      fetchHistory();
    }
  }, [activeModal]);

  // Dynamic Scroll-to-Top hook on modal subpage transition
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    const scrollableDivs = document.querySelectorAll(".overflow-y-auto, [class*='overflow-y'], html, body, main, section, #__next");
    scrollableDivs.forEach((el) => {
      el.scrollTop = 0;
    });
  }, [activeModal]);

  // Avatar Upload Ref and base64 reader handler
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const mainAvatarInputRef = useRef<HTMLInputElement>(null);
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file.");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        useAuthStore.setState((state) => {
          if (state.user) {
            return {
              user: {
                ...state.user,
                avatarUrl: base64String,
              }
            };
          }
          return {};
        });
        toast.success("Avatar updated successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  // Image Preview Zoom State and Helper Component
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const renderImagePreview = () => (
    <AnimatePresence>
      {isPreviewOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[200] flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setIsPreviewOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-[280px] xs:max-w-xs rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-white p-2.5 animate-in fade-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-900/60 hover:bg-slate-900/80 text-white transition-all shadow-md z-10"
            >
              <X size={18} />
            </button>
            
            <div className="rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center aspect-square shadow-inner">
              <img 
                src={user?.avatarUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80"} 
                className="w-full h-full object-cover"
                alt="Avatar Preview" 
              />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const handleSaveProfile = () => {
    updateProfile({ fullName, address, dob, gender });
    toast.success("Profile details updated successfully!");
    setActiveModal(null);
  };

  const handleSaveBank = () => {
    toast.success("Bank & UPI details successfully updated.");
    setActiveModal(null);
  };

  const handleKycUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setKycDoc(e.target.files[0]);
      toast.success(`Document ${e.target.files[0].name} uploaded successfully! Verification pending.`);
    }
  };

  const handleClaimGift = () => {
    if (!giftCode.trim()) {
      toast.error("Please enter a valid gift promo code!");
      return;
    }
    toast.success(`Congratulation! Code "${giftCode}" claimed. ₹100 added to your bonus balance!`);
    setGiftCode("");
    setActiveModal(null);
  };

  const handleLogout = () => {
    logout();
    toast.success("Successfully logged out from your account.");
    router.push("/");
  };

  // 1. DYNAMIC FULL-PAGE ROUTER FOR SERVICE CENTER PAGES (Matching user screenshot)
  if (activeModal) {
    if (activeModal === "settings") {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col -mx-4 -mt-4 animate-in slide-in-from-right duration-300 pb-10">
          {/* Hidden File Input for Avatar Customization */}
          <input 
            type="file" 
            ref={avatarInputRef} 
            onChange={handleAvatarChange} 
            accept="image/*" 
            className="hidden" 
          />
          {/* Coral header with back button */}
          <div className="h-28 bg-gradient-to-b from-[#ff6b5a] to-[#ff4d4d] flex flex-col justify-start px-4 pt-4 relative shrink-0">
            <div className="flex items-center justify-between text-white">
              <button 
                onClick={() => setActiveModal(null)} 
                className="p-1 hover:opacity-80 transition-opacity flex items-center justify-center"
              >
                <ChevronLeft size={24} className="stroke-[2.5]" />
              </button>
              <span className="text-base font-extrabold absolute left-1/2 -translate-x-1/2">Settings Center</span>
              <div className="w-8" />
            </div>
          </div>

          {/* Floating User Details Card */}
          <div className="px-4 -mt-10 z-10 space-y-5">
            <div className="bg-white rounded-3xl p-5 shadow-md border border-slate-100/50 space-y-4">
              
              {/* Avatar block */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div 
                  onClick={() => setIsPreviewOpen(true)}
                  className="w-16 h-16 rounded-full overflow-hidden border border-slate-200/85 shadow-sm shrink-0 cursor-zoom-in hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  <img 
                    src={user?.avatarUrl || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80"} 
                    className="w-full h-full object-cover" 
                    alt="Avatar" 
                  />
                </div>
                <button 
                  onClick={() => avatarInputRef.current?.click()}
                  className="text-xs text-slate-500 font-bold hover:text-slate-800 flex items-center gap-1"
                >
                  Change avatar <ChevronRight size={14} className="stroke-[2.5]" />
                </button>
              </div>

              {/* Nickname block */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <span className="text-xs text-slate-500 font-bold">Nickname</span>
                <button 
                  onClick={() => toast.info("Change nickname pending...")}
                  className="text-xs text-slate-800 font-black flex items-center gap-1"
                >
                  {user?.fullName || "MemberNNGFNDFO"} <ChevronRight size={14} className="stroke-[2.5] text-slate-400" />
                </button>
              </div>

              {/* UID block */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold">UID</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-850 font-black tracking-wide">21378110</span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText("21378110");
                      toast.success("UID copied successfully!");
                    }}
                    className="p-1 rounded hover:bg-slate-100 text-rose-500 active:scale-90 transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Security Information Title */}
            <div className="flex items-center gap-2 pt-2">
              <div className="w-1 h-4 bg-[#ff4d4d] rounded-full shrink-0" />
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                Security information
              </h4>
            </div>

            {/* Security details grid */}
            <div className="space-y-3">
              
              {/* Login password */}
              <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-500 shadow-sm shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lock"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                  <span className="text-xs font-black text-slate-800">Login password</span>
                </div>
                <button 
                  onClick={() => toast.info("Redirecting to password edit...")}
                  className="text-[11px] font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1"
                >
                  Edit <ChevronRight size={14} className="stroke-[2.5]" />
                </button>
              </div>

              {/* Bind mailbox */}
              <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 shadow-sm shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                  </div>
                  <span className="text-xs font-black text-slate-800">Bind mailbox</span>
                </div>
                <button 
                  onClick={() => toast.info("Mailbox link pending...")}
                  className="text-[11px] font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1"
                >
                  to bind <ChevronRight size={14} className="stroke-[2.5]" />
                </button>
              </div>

              {/* Google Verification */}
              <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500 shadow-sm shrink-0">
                    <span className="text-sm font-black tracking-tighter">G</span>
                  </div>
                  <span className="text-xs font-black text-slate-800">Google Verification</span>
                </div>
                <button 
                  onClick={() => toast.info("Google Verification setting up...")}
                  className="text-[11px] font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1"
                >
                  Unopened <ChevronRight size={14} className="stroke-[2.5]" />
                </button>
              </div>

              {/* Updated version */}
              <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-500 shadow-sm shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                  </div>
                  <span className="text-xs font-black text-slate-800">Updated version</span>
                </div>
                <button 
                  onClick={() => toast.success("You are running the absolute latest version!")}
                  className="text-[11px] font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1"
                >
                  1.0.9 <ChevronRight size={14} className="stroke-[2.5]" />
                </button>
              </div>

            </div>

          </div>
          {renderImagePreview()}
        </div>
      );
    } else {
      let pageTitle = "";
      let bodyContent = null;
      let bgStyle = "bg-[#f4f5f7] min-h-screen pb-10 flex flex-col -mx-4 -mt-4 animate-in slide-in-from-right duration-300";

      if (activeModal === "feedback") {
        pageTitle = "Feedback";
        bodyContent = (
          <div className="px-4 py-5 flex-1 flex flex-col justify-between">
            <div className="space-y-5">
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100/80 space-y-4">
                <p className="text-[11px] text-slate-400 font-bold leading-relaxed">
                  Welcome to feedback, please give feedback-please describe the problem in detail when providing feedback, preferably attach a screenshot of the problem you encountered, we will immediately process your feedback!
                </p>
                <textarea 
                  placeholder="Write your feedback or bug report here..." 
                  rows={6}
                  className="w-full p-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#ff6b5a]/40 text-xs text-slate-800 bg-slate-50/50 transition-all placeholder:text-slate-350"
                />
              </div>
              
              <div className="text-center space-y-1">
                <h4 className="text-xs font-black text-slate-800">Send helpful feedback</h4>
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Chance to win Mystery Rewards</p>
              </div>

              {/* Premium Interactive SVG Astronaut illustration matching user mockup */}
              <div className="flex items-center justify-center py-2">
                <svg width="220" height="150" viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
                  {/* Moon Crest */}
                  <path d="M40 140C90 155 170 150 200 120" stroke="#ff8577" strokeWidth="6" strokeLinecap="round" strokeDasharray="3 6" />
                  <path d="M25 155C80 170 175 160 215 110" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" />
                  
                  {/* Small stars */}
                  <path d="M30 40 L33 46 L39 47 L34 52 L36 58 L30 55 L24 58 L26 52 L21 47 L27 46 Z" fill="#ffd43f" className="animate-pulse" />
                  <circle cx="190" cy="50" r="3" fill="#38bdf8" />
                  <circle cx="210" cy="90" r="2.5" fill="#f43f5e" />
                  <circle cx="70" cy="110" r="2" fill="#ffd43f" />

                  {/* Flying Space Envelope */}
                  <g transform="translate(120, 20) rotate(-15)">
                    <rect width="36" height="24" rx="4" fill="#06b6d4" />
                    <path d="M0 4 L18 14 L36 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 20 L12 13" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    <path d="M32 20 L24 13" stroke="white" strokeWidth="2" strokeLinecap="round" />
                  </g>

                  {/* Astronaut */}
                  <g transform="translate(75, 45)">
                    {/* Suit Body */}
                    <rect x="25" y="45" width="40" height="45" rx="16" fill="white" stroke="#e2e8f0" strokeWidth="2" />
                    <rect x="33" y="55" width="24" height="20" rx="4" fill="#e2e8f0" />
                    <circle cx="45" cy="65" r="5" fill="#06b6d4" />

                    {/* Boots */}
                    <rect x="23" y="88" width="16" height="10" rx="4" fill="#0f172a" />
                    <rect x="51" y="88" width="16" height="10" rx="4" fill="#0f172a" />

                    {/* Arms */}
                    <path d="M26 55 C10 52 5 75 18 78" stroke="white" strokeWidth="10" strokeLinecap="round" />
                    <path d="M64 55 C80 50 85 70 76 78" stroke="white" strokeWidth="10" strokeLinecap="round" />

                    {/* Helmet */}
                    <circle cx="45" cy="30" r="24" fill="white" stroke="#cbd5e1" strokeWidth="2" />
                    <rect x="29" y="16" width="32" height="22" rx="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                    <path d="M33 22 A 6 6 0 0 1 45 22" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    
                    {/* Helmet Antenna */}
                    <line x1="45" y1="6" x2="45" y2="2" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />
                    <circle cx="45" cy="1" r="2.5" fill="#f43f5e" />
                  </g>

                  {/* Yellow Gift/Reward Sign */}
                  <g transform="translate(45, 100) rotate(5)">
                    <rect width="34" height="24" rx="4" fill="#ffb800" stroke="#d97706" strokeWidth="1.5" />
                    <rect x="6" y="5" width="22" height="14" rx="2" fill="white" opacity="0.15" />
                    <circle cx="17" cy="12" r="4" fill="#ffffff" />
                    <path d="M17 9 L17 15 M14 12 L20 12" stroke="#ffb800" strokeWidth="2" strokeLinecap="round" />
                  </g>
                </svg>
              </div>
            </div>

            <div className="px-2 mt-4">
              <Button 
                onClick={() => {
                  toast.success("Feedback submitted successfully! Thank you.");
                  setActiveModal(null);
                }}
                className="w-full bg-[#ff6b5a] hover:bg-[#ff6b5a]/90 text-white font-extrabold py-5 rounded-full shadow-md text-xs transition-transform active:scale-[0.99]"
              >
                Submit
              </Button>
            </div>
          </div>
        );
      } else if (activeModal === "announcement") {
        pageTitle = "Announcements";
        bodyContent = (
          <div className="px-4 py-5 space-y-4">
            <div className="text-center text-slate-400 py-10">Loading announcements...</div>
          </div>
        );
      } else if (activeModal === "notifications") {
        pageTitle = "Notification";
        bodyContent = (
          <div className="px-4 py-5 space-y-3">
            <div className="text-center text-slate-400 py-10">Loading notifications...</div>
          </div>
        );

      } else if (activeModal === "language") {
        pageTitle = language === "hi" ? "भाषा" : "Language";
        bodyContent = (
          <div className="px-4 py-5">
            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
              <button
                type="button"
                onClick={() => {
                  setLanguage("en");
                  toast.success(`Language changed to English`);
                }}
                className="w-full px-4 py-4 flex justify-between items-center bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 shadow-sm border border-slate-200">
                    <img src="https://flagcdn.com/w40/us.png" alt="USA" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm text-slate-800">English</span>
                </div>
                {language === "en" ? (
                  <div className="w-5 h-5 rounded-full bg-[#ff4d4d] flex items-center justify-center text-white shrink-0">
                    <CheckCircle2 size={14} className="stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border border-slate-300 shrink-0" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setLanguage("hi");
                  toast.success(`भाषा बदलकर हिंदी कर दी गई है`);
                }}
                className="w-full px-4 py-4 flex justify-between items-center bg-white hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 shadow-sm border border-slate-200">
                    <img src="https://flagcdn.com/w40/in.png" alt="India" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm text-slate-800">हिंदी</span>
                </div>
                {language === "hi" ? (
                  <div className="w-5 h-5 rounded-full bg-[#ff4d4d] flex items-center justify-center text-white shrink-0">
                    <CheckCircle2 size={14} className="stroke-[3]" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-full border border-slate-300 shrink-0" />
                )}
              </button>
            </div>
          </div>
        );
      } else if (activeModal === "gifts") {
        pageTitle = "Gifts";
        bodyContent = (
          <div className="px-4 py-5 space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm text-center space-y-5">
              <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center text-pink-500 mx-auto">
                <Gift size={32} />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-slate-800">Gift Promos & Rewards</h4>
                <p className="text-[10px] text-slate-400 font-bold">Enter your coupon/gift code to claim bonus balance</p>
              </div>
              
              <Input 
                placeholder="e.g. BULLWAVE500K" 
                value={giftCode} 
                onChange={(e) => setGiftCode(e.target.value)} 
                className="bg-slate-50 border-slate-200 rounded-2xl text-slate-850 shadow-sm text-center font-black uppercase text-xs h-12" 
              />
              <Button 
                onClick={handleClaimGift} 
                className="w-full bg-[#ff6b5a] hover:bg-[#ff6b5a]/90 text-white font-extrabold py-5 rounded-full shadow-sm text-xs transition-all active:scale-[0.99]"
              >
                Claim Code
              </Button>
            </div>
          </div>
        );
      } else if (activeModal === "statistics") {
        pageTitle = "Game Statistics";
        bodyContent = (
          <div className="px-4 py-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total Matches Played", val: "148" },
                { label: "Matches Won", val: "92" },
                { label: "Total Profit (Wingo)", val: "₹15,400" },
                { label: "Win Ratio (%)", val: "62.1%" },
              ].map((s, idx) => (
                <div key={idx} className="p-4 bg-white border border-slate-100 rounded-3xl text-center shadow-sm space-y-1">
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase">{s.label}</span>
                  <p className="text-sm font-black text-slate-800 mt-1">{s.val}</p>
                </div>
              ))}
            </div>
          </div>
        );
      } else if (activeModal === "depositHistory") {
        pageTitle = "Deposit Transactions";
        bodyContent = (
          <div className="px-4 py-5 space-y-3">
            {isLoadingHistory ? (
              <div className="text-center text-slate-400 py-10 flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-bold uppercase tracking-wider">Loading...</span>
              </div>
            ) : depositHistory.length === 0 ? (
              <div className="text-center text-slate-400 py-10 text-xs font-bold uppercase tracking-wider">No deposits found</div>
            ) : depositHistory.map((txn) => (
              <div key={txn.id} className="p-4 bg-white border border-slate-100 rounded-3xl flex justify-between items-center shadow-sm">
                <div className="space-y-0.5">
                  <p className="text-xs font-black text-slate-800">₹{txn.amount?.toFixed(2)}</p>
                  <span className="text-[9px] text-slate-400 font-bold block">
                    {new Date(txn.created_at || Date.now()).toLocaleString("en-IN", {
                      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
                    })} 
                    {txn.gateway_tx_id ? ` | Ref: ${txn.gateway_tx_id}` : ""}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide ${
                  txn.status?.toLowerCase() === "pending" ? "bg-orange-500/10 text-orange-600" :
                  txn.status?.toLowerCase() === "failed" ? "bg-red-500/10 text-red-600" :
                  "bg-emerald-500/10 text-emerald-600"
                }`}>{txn.status}</span>
              </div>
            ))}
          </div>
        );
      } else if (activeModal === "withdrawHistory") {
        pageTitle = "Withdrawal Settlements";
        bodyContent = (
          <div className="px-4 py-5 space-y-3">
            {isLoadingHistory ? (
              <div className="text-center text-slate-400 py-10 flex flex-col items-center gap-2">
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xs font-bold uppercase tracking-wider">Loading...</span>
              </div>
            ) : withdrawHistory.length === 0 ? (
              <div className="text-center text-slate-400 py-10 text-xs font-bold uppercase tracking-wider">No withdrawals found</div>
            ) : withdrawHistory.map((txn) => (
              <div key={txn.id} className="p-4 bg-white border border-slate-100 rounded-3xl flex justify-between items-center shadow-sm">
                <div className="space-y-0.5">
                  <p className="text-xs font-black text-slate-800">₹{txn.amount?.toFixed(2)}</p>
                  <span className="text-[9px] text-slate-400 font-bold block">
                    {new Date(txn.created_at || Date.now()).toLocaleString("en-IN", {
                      month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
                    })} 
                    {txn.rejection_reason ? ` | Reason: ${txn.rejection_reason}` : ""}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide ${
                  txn.status?.toLowerCase() === "processing" || txn.status?.toLowerCase() === "pending" ? "bg-orange-500/10 text-orange-600" :
                  txn.status?.toLowerCase() === "rejected" || txn.status?.toLowerCase() === "failed" ? "bg-red-500/10 text-red-600" :
                  "bg-emerald-500/10 text-emerald-600"
                }`}>{txn.status}</span>
              </div>
            ))}
          </div>
        );
      }

      return (
        <div className={bgStyle}>
          {/* Centered navigation header bar matching Third Image */}
          <div className="h-14 bg-white border-b border-slate-100 flex items-center px-4 relative shrink-0">
            <button 
              onClick={() => setActiveModal(null)} 
              className="p-1 hover:bg-slate-100 rounded-xl text-slate-650 active:scale-95 transition-all flex items-center justify-center"
            >
              <ChevronLeft size={22} className="stroke-[2.5]" />
            </button>
            <span className="text-sm font-black text-slate-800 absolute left-1/2 -translate-x-1/2">
              {pageTitle}
            </span>
          </div>

          {/* Page body content */}
          <div className="flex-1 overflow-y-auto">
            {bodyContent}
          </div>
          {renderImagePreview()}
        </div>
      );
    }
  }



  // Translations Dictionary
  const t = {
    accountCenter: language === "hi" ? "खाता केंद्र" : "Account Center",
    accountDesc: language === "hi" ? "अपनी प्रोफ़ाइल, सुरक्षा विवरण और बैंक क्रेडेंशियल प्रबंधित करें" : "Manage your profile, security details, and bank credentials",
    mobile: language === "hi" ? "मोबाइल:" : "Mobile:",
    email: language === "hi" ? "ईमेल:" : "Email:",
    kycStatus: language === "hi" ? "केवाईसी स्थिति:" : "KYC Status:",
    deposit: language === "hi" ? "जमा करें" : "Deposit",
    withdraw: language === "hi" ? "निकासी" : "Withdraw",
    myHistory: language === "hi" ? "मेरा इतिहास" : "My History",
    notification: language === "hi" ? "अधिसूचना" : "Notification",
    gifts: language === "hi" ? "उपहार" : "Gifts",
    gameStatistics: language === "hi" ? "खेल के आँकड़े" : "Game statistics",
    languageStr: language === "hi" ? "भाषा (Language)" : "Language",
    serviceCenter: language === "hi" ? "सेवा केंद्र" : "Service center",
    settings: language === "hi" ? "समायोजन" : "Settings",
    feedback: language === "hi" ? "प्रतिक्रिया" : "Feedback",
    announcement: language === "hi" ? "घोषणा" : "Announcement",
    customerService: language === "hi" ? "24/7 ग्राहक सेवा" : "24/7 Customer service",
    beginnersGuide: language === "hi" ? "शुरुआती गाइड" : "Beginner's Guide",
    aboutUs: language === "hi" ? "हमारे बारे में" : "About us",
    downloadApp: language === "hi" ? "ऐप डाउनलोड करें" : "Download APP",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-16 bg-white">
      {/* Hidden File Input for Avatar Customization directly on the profile card */}
      <input 
        type="file" 
        ref={mainAvatarInputRef} 
        onChange={handleAvatarChange} 
        accept="image/*" 
        className="hidden" 
      />
      
      {/* Account Center Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800">{t.accountCenter}</h1>
        <p className="text-slate-500 text-xs font-semibold">{t.accountDesc}</p>
      </div>

      {/* Main Container */}
      <div className="flex flex-col gap-5 w-full">
        
        {/* Profile Card & Avatar */}
        <div className="w-full">
          <Card className="bg-gradient-to-tr from-amber-50 via-orange-50/60 to-rose-50/50 border border-amber-200/60 overflow-hidden relative shadow-sm rounded-2xl">
            <div className="h-16 bg-gradient-to-r from-primary to-[#b30000]" />
            <CardContent className="pt-0 flex flex-col items-center -mt-10 relative z-10 pb-5 px-4">
              <div className="relative group cursor-pointer mb-2">
                <div 
                  onClick={() => setIsPreviewOpen(true)}
                  className="w-20 h-20 rounded-full border-4 border-white overflow-hidden relative shadow-md cursor-zoom-in hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  <img src={user?.avatarUrl || "https://i.pravatar.cc/150?u=a042581f4e29026704d"} alt="Profile Avatar" className="w-full h-full object-cover" />
                </div>
                {/* Floating edit pencil button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    mainAvatarInputRef.current?.click();
                  }}
                  className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#800000] border-2 border-white text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-90 transition-all cursor-pointer z-20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                </button>
              </div>

              <h2 className="text-base font-black text-slate-800">{user?.fullName || "Rohit Kumar"}</h2>
              <span className="text-[10px] text-slate-500 font-bold">@{user?.username || "Player_7721"}</span>

              <div className="w-full mt-4 space-y-2 border-t border-amber-200/30 pt-3 text-xs">
                <div className="flex justify-between text-slate-700">
                  <span className="font-semibold text-slate-500">{t.mobile}</span>
                  <span className="font-bold">{user?.mobile || "9876543210"}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span className="font-semibold text-slate-500">{t.email}</span>
                  <span className="font-bold truncate max-w-[180px]">{user?.email || "muskanmobiloitte@gmail.com"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-500">{t.kycStatus}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase flex items-center gap-1 ${
                    user?.kycStatus === "verified" ? "bg-emerald-500/10 text-emerald-600" : "bg-orange-500/10 text-orange-600"
                  }`}>
                    {user?.kycStatus === "verified" ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                    {user?.kycStatus || "unverified"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deposit & Withdraw History Quick Cards */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <button 
            type="button"
            onClick={() => setActiveModal("depositHistory")}
            className="flex items-center gap-3 p-3.5 bg-gradient-to-r from-rose-100/70 via-rose-50/50 to-pink-100/30 border border-rose-200/80 rounded-2xl hover:from-rose-200/50 hover:to-pink-200/30 transition-all text-left shadow-sm group"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-750">
              <ClipboardList size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-rose-900 font-bold uppercase tracking-wider truncate">{t.deposit}</p>
              <span className="text-xs font-black text-slate-800 block truncate">{t.myHistory}</span>
            </div>
            <ChevronRight size={14} className="text-rose-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button 
            type="button"
            onClick={() => setActiveModal("withdrawHistory")}
            className="flex items-center gap-3 p-3.5 bg-gradient-to-r from-orange-100/70 via-orange-50/50 to-amber-100/30 border border-orange-200/80 rounded-2xl hover:from-orange-200/50 hover:to-amber-200/30 transition-all text-left shadow-sm group"
          >
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-750">
              <Wallet size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-orange-900 font-bold uppercase tracking-wider truncate">{t.withdraw}</p>
              <span className="text-xs font-black text-slate-800 block truncate">{t.myHistory}</span>
            </div>
            <ChevronRight size={14} className="text-orange-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Vertical List Menus (Notification, Gifts, Statistics, Language) */}
        <div className="space-y-2.5 w-full">
          
          {/* Notification */}
          <div 
            onClick={() => router.push("/announcement")}
            className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-rose-100/30 border border-red-200/60 rounded-2xl cursor-pointer hover:from-red-100/50 hover:to-rose-100/20 transition-all shadow-sm group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-red-200/70 flex items-center justify-center text-rose-700">
                <Bell size={18} />
              </div>
              <span className="text-xs font-black text-slate-800">{t.notification}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center animate-pulse">2</span>
              <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

          {/* Gifts */}
          <div 
            onClick={() => setActiveModal("gifts")}
            className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-fuchsia-100/30 border border-pink-200/60 rounded-2xl cursor-pointer hover:from-pink-100/50 hover:to-fuchsia-100/20 transition-all shadow-sm group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-pink-200/70 flex items-center justify-center text-pink-700">
                <Gift size={18} />
              </div>
              <span className="text-xs font-black text-slate-800">{t.gifts}</span>
            </div>
            <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Game Statistics */}
          <div 
            onClick={() => setActiveModal("statistics")}
            className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-yellow-100/30 border border-amber-200/60 rounded-2xl cursor-pointer hover:from-amber-100/50 hover:to-yellow-100/20 transition-all shadow-sm group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-amber-200/70 flex items-center justify-center text-amber-700">
                <BarChart3 size={18} />
              </div>
              <span className="text-xs font-black text-slate-800">{t.gameStatistics}</span>
            </div>
            <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Language */}
          <div 
            onClick={() => setActiveModal("language")}
            className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-rose-100/30 border border-indigo-200/60 rounded-2xl cursor-pointer hover:from-indigo-100/50 hover:to-rose-100/20 transition-all shadow-sm group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-200/70 flex items-center justify-center text-indigo-700">
                <Globe size={18} />
              </div>
              <span className="text-xs font-black text-slate-800">{t.languageStr}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500 font-bold">{language === "hi" ? "हिंदी" : "English"}</span>
              <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>

        </div>

        {/* Service Center Card Block */}
        <div className="w-full">
          <Card className="bg-gradient-to-r from-amber-50/80 via-orange-50/40 to-rose-50/70 border border-amber-200/60 rounded-2xl shadow-sm overflow-hidden">
            <CardHeader className="py-3 px-4 border-b border-amber-200/30 bg-amber-100/10">
              <h3 className="text-xs font-black text-amber-950 uppercase tracking-wider">Service center</h3>
            </CardHeader>
            <CardContent className="p-5">
              <div className="grid grid-cols-3 gap-y-6 gap-x-2">
                
                {/* Settings */}
                <button 
                  type="button"
                  onClick={() => setActiveModal("settings")}
                  className="flex flex-col items-center gap-2 focus:outline-none group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-rose-500/20 flex items-center justify-center text-rose-700 group-hover:scale-105 transition-transform duration-300 shadow-sm border border-rose-200/30">
                    <Settings size={20} />
                  </div>
                  <span className="text-[10px] font-black text-slate-700">Settings</span>
                </button>

                {/* Feedback */}
                <button 
                  type="button"
                  onClick={() => setActiveModal("feedback")}
                  className="flex flex-col items-center gap-2 focus:outline-none group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-teal-500/20 flex items-center justify-center text-teal-700 group-hover:scale-105 transition-transform duration-300 shadow-sm border border-teal-200/30">
                    <MessageSquare size={20} />
                  </div>
                  <span className="text-[10px] font-black text-slate-700">Feedback</span>
                </button>

                {/* Announcement */}
                <button 
                  type="button"
                  onClick={() => router.push("/announcement")}
                  className="flex flex-col items-center gap-2 focus:outline-none group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-700 group-hover:scale-105 transition-transform duration-300 shadow-sm border border-amber-200/30">
                    <Megaphone size={20} />
                  </div>
                  <span className="text-[10px] font-black text-slate-700">Announcement</span>
                </button>

                {/* Customer Service */}
                <button 
                  type="button"
                  onClick={() => router.push("/support")}
                  className="flex flex-col items-center gap-2 focus:outline-none group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-700 group-hover:scale-105 transition-transform duration-300 shadow-sm border border-blue-200/30">
                    <Headphones size={20} />
                  </div>
                  <span className="text-[10px] font-black text-slate-700">Customer Service</span>
                </button>

                {/* Beginner's Guide */}
                <button 
                  type="button"
                  onClick={() => router.push("/guide")}
                  className="flex flex-col items-center gap-2 focus:outline-none group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-700 group-hover:scale-105 transition-transform duration-300 shadow-sm border border-indigo-200/30">
                    <BookOpen size={20} />
                  </div>
                  <span className="text-[10px] font-black text-slate-700 text-center leading-tight">Beginner's Guide</span>
                </button>

                {/* About us */}
                <button 
                  type="button"
                  onClick={() => router.push("/about")}
                  className="flex flex-col items-center gap-2 focus:outline-none group"
                >
                  <div className="w-10 h-10 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-700 group-hover:scale-105 transition-transform duration-300 shadow-sm border border-purple-200/30">
                    <Box size={20} />
                  </div>
                  <span className="text-[10px] font-black text-slate-700">About us</span>
                </button>

              </div>
            </CardContent>
          </Card>
        </div>

        {/* Custom Red Pill Logout Button */}
        <div className="w-full mt-4">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full border border-red-500/80 text-red-500 hover:bg-red-50/50 py-4 font-black rounded-full flex items-center justify-center gap-2 text-xs transition-colors shadow-sm"
          >
            <Power size={14} className="stroke-[3]" /> Log out
          </button>
        </div>

      </div>

      {/* Dynamic Modals View Overlay */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-end justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-white rounded-t-3xl rounded-b-xl w-full max-w-md max-h-[85vh] overflow-y-auto p-6 shadow-xl border border-slate-100 relative"
            >
              {/* Modal Close Button */}
              <button 
                type="button"
                onClick={() => setActiveModal(null)}
                className="absolute right-4 top-4 p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>

              {/* Settings Configuration Modal */}
              {activeModal === "settings" && (
                <div className="space-y-4">
                  <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                    <Settings className="text-[#800000]" size={18} /> Settings / Configuration
                  </h3>
                  <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-slate-100 border border-slate-200 rounded-xl h-11 p-1">
                      <TabsTrigger value="profile" className="rounded-lg data-[state=active]:bg-[#800000] data-[state=active]:text-white text-[10px] font-bold py-1">Profile</TabsTrigger>
                      <TabsTrigger value="bank" className="rounded-lg data-[state=active]:bg-[#800000] data-[state=active]:text-white text-[10px] font-bold py-1">Bank / UPI</TabsTrigger>
                      <TabsTrigger value="kyc" className="rounded-lg data-[state=active]:bg-[#800000] data-[state=active]:text-white text-[10px] font-bold py-1">KYC</TabsTrigger>
                    </TabsList>

                    <TabsContent value="profile" className="mt-4 space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-slate-600 text-xs font-semibold">Full Name</Label>
                        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-white border-slate-200 rounded-xl text-slate-800 shadow-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-slate-600 text-xs font-semibold">Date of Birth</Label>
                        <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="bg-white border-slate-200 rounded-xl text-slate-800 shadow-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-slate-600 text-xs font-semibold">Gender</Label>
                        <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm">
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-slate-600 text-xs font-semibold">Address</Label>
                        <Input value={address} onChange={(e) => setAddress(e.target.value)} className="bg-white border-slate-200 rounded-xl text-slate-800 shadow-sm" />
                      </div>
                      <Button onClick={handleSaveProfile} className="w-full bg-[#800000] hover:bg-[#800000]/90 text-white font-bold py-6 rounded-xl mt-3 shadow-sm">Save Changes</Button>
                    </TabsContent>

                    <TabsContent value="bank" className="mt-4 space-y-3">
                      <div className="space-y-1.5">
                        <Label className="text-slate-600 text-xs font-semibold">UPI Address</Label>
                        <Input value={upiId} onChange={(e) => setUpiId(e.target.value)} className="bg-white border-slate-200 rounded-xl text-slate-800 shadow-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-slate-600 text-xs font-semibold">Bank Account Number</Label>
                        <Input value={bankAcc} onChange={(e) => setBankAcc(e.target.value)} className="bg-white border-slate-200 rounded-xl text-slate-800 shadow-sm" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-slate-600 text-xs font-semibold">IFSC Code</Label>
                        <Input value={bankIfsc} onChange={(e) => setBankIfsc(e.target.value)} className="bg-white border-slate-200 rounded-xl text-slate-800 shadow-sm" />
                      </div>
                      <Button onClick={handleSaveBank} className="w-full bg-[#800000] hover:bg-[#800000]/90 text-white font-bold py-6 rounded-xl mt-3 shadow-sm">Update Bank Info</Button>
                    </TabsContent>

                    <TabsContent value="kyc" className="mt-4 space-y-4">
                      <div className="border border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center relative bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group shadow-sm">
                        <input type="file" id="kyc-doc-file" onChange={handleKycUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <Upload className="text-slate-500 group-hover:text-primary mb-3 transition-colors" size={32} />
                        <p className="font-bold text-center text-slate-800 text-xs">Upload Aadhaar / PAN card</p>
                        <span className="text-[10px] text-slate-500 mt-1">PNG, JPG up to 5MB</span>
                      </div>
                      {kycDoc && <div className="p-3 bg-emerald-500/10 border border-emerald-200 rounded-xl text-emerald-600 text-xs font-bold text-center">Submitted: {kycDoc.name}</div>}
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* Gifts Claim Modal */}
              {activeModal === "gifts" && (
                <div className="space-y-4 text-center">
                  <Gift className="mx-auto text-rose-500" size={48} />
                  <div>
                    <h3 className="text-base font-black text-slate-800">Gift Promos & Rewards</h3>
                    <p className="text-xs text-slate-500 mt-1">Enter your coupon/gift code to claim bonus balance</p>
                  </div>
                  <div className="space-y-3">
                    <Input 
                      placeholder="e.g. BULLWAVE500K" 
                      value={giftCode} 
                      onChange={(e) => setGiftCode(e.target.value)} 
                      className="bg-white border-slate-200 rounded-xl text-slate-800 shadow-sm text-center font-bold" 
                    />
                    <Button onClick={handleClaimGift} className="w-full bg-[#800000] hover:bg-[#800000]/90 text-white font-bold py-5 rounded-xl shadow-sm text-xs">Claim Code</Button>
                  </div>
                </div>
              )}

              {/* Notifications Inbox Modal */}
              {activeModal === "notifications" && (
                <div className="space-y-4">
                  <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                    <Bell className="text-[#800000]" size={18} /> Notifications Inbox
                  </h3>
                  <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                    {[
                      { id: 1, title: "Welcome Reward!", desc: "₹100 has been credited as signup bonus. Play live clusters now!", time: "2 hrs ago", new: true },
                      { id: 2, title: "KYC Verified Successfully", desc: "Congratulations! Your identity has been verified. VIP withdrawals are active.", time: "1 day ago", new: true },
                      { id: 3, title: "Maintenance Alert Done", desc: "Platform nodes successfully upgraded. Lower platform fees applied.", time: "3 days ago", new: false },
                    ].map((n) => (
                      <div key={n.id} className={`p-4 rounded-2xl border transition-all ${n.new ? "bg-red-500/5 border-red-200/50" : "bg-slate-50/50 border-slate-100"}`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-xs text-slate-800 flex items-center gap-2">
                            {n.new && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                            {n.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">{n.time}</span>
                        </div>
                        <p className="text-[10px] text-slate-600 leading-relaxed">{n.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Game Statistics Modal */}
              {activeModal === "statistics" && (
                <div className="space-y-4">
                  <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                    <BarChart3 className="text-amber-600" size={18} /> Game Statistics
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Total Matches Played", val: "148" },
                      { label: "Matches Won", val: "92" },
                      { label: "Total Profit (Wingo)", val: "₹15,400" },
                      { label: "Win Ratio (%)", val: "62.1%" },
                    ].map((s, idx) => (
                      <div key={idx} className="p-3 bg-amber-50/40 border border-amber-100 rounded-xl text-center shadow-sm">
                        <span className="text-[10px] text-slate-500 uppercase font-bold">{s.label}</span>
                        <p className="text-sm font-black text-amber-950 mt-1">{s.val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Language Selector Modal */}
              {activeModal === "language" && (
                <div className="space-y-4">
                  <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                    <Globe className="text-[#800000]" size={18} /> Select Language
                  </h3>
                  <div className="space-y-2">
                    {[
                      { code: "en", name: "English (US)", active: true },
                      { code: "hi", name: "हिन्दी (Hindi)", active: false },
                      { code: "te", name: "తెలుగు (Telugu)", active: false },
                      { code: "ta", name: "தமிழ் (Tamil)", active: false },
                    ].map((lang) => (
                      <button
                        type="button"
                        key={lang.code}
                        onClick={() => {
                          toast.success(`Language changed to ${lang.name}`);
                          setActiveModal(null);
                        }}
                        className={`w-full p-4 rounded-2xl border text-left flex justify-between items-center transition-all ${
                          lang.active ? "border-[#800000] bg-red-500/5 text-[#800000] font-black" : "border-slate-100 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <span className="text-xs font-bold">{lang.name}</span>
                        {lang.active && <CheckCircle2 size={16} />}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback Form Modal */}
              {activeModal === "feedback" && (
                <div className="space-y-4">
                  <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                    <MessageSquare className="text-[#800000]" size={18} /> Submit Feedback
                  </h3>
                  <div className="space-y-3">
                    <textarea 
                      placeholder="Write your feedback or bug report here..." 
                      rows={4}
                      className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none text-xs text-slate-800 bg-white"
                    />
                    <Button 
                      onClick={() => {
                        toast.success("Feedback submitted successfully! Thank you.");
                        setActiveModal(null);
                      }} 
                      className="w-full bg-[#800000] hover:bg-[#800000]/90 text-white font-bold py-5 rounded-xl shadow-sm text-xs"
                    >
                      Submit Feedback
                    </Button>
                  </div>
                </div>
              )}

              {/* Announcements Modal */}
              {activeModal === "announcement" && (
                <div className="space-y-4">
                  <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                    <Megaphone className="text-[#800000]" size={18} /> Announcements
                  </h3>
                  <div className="space-y-3">
                    {[
                      { id: 1, title: "Super Win Bonus", desc: "Double payouts on all classic color predictions during our weekly tournament weekend! Check brackets under tournaments tab.", date: "May 18, 2026" },
                      { id: 2, title: "Instant Withdrawals Active", desc: "Fast-track cashouts are now processing dynamically within 2 minutes via automated banking partners.", date: "May 15, 2026" }
                    ].map((a) => (
                      <div key={a.id} className="p-4 bg-amber-50/40 border border-amber-100 rounded-2xl">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-xs text-amber-950">{a.title}</span>
                          <span className="text-[9px] text-slate-400 font-bold">{a.date}</span>
                        </div>
                        <p className="text-[10px] text-slate-600 leading-relaxed">{a.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Beginner's Guide Modal */}
              {activeModal === "guide" && (
                <div className="space-y-4">
                  <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                    <BookOpen className="text-[#800000]" size={18} /> Beginner's Guide
                  </h3>
                  <div className="space-y-3 text-xs text-slate-600 leading-relaxed max-h-[50vh] overflow-y-auto pr-1">
                    <p className="font-bold text-slate-800">Welcome to Bull Wave Games!</p>
                    <p>Bull Wave is a premium gaming prediction cluster where players multiply their entries. Here is how to play:</p>
                    <div className="space-y-2 border-t border-slate-100 pt-3">
                      <p className="flex gap-2"><span className="font-black text-[#800000]">1. Choose a Game:</span> Pick games like Wingo, Aviator, or Color Prediction from the main Lobby.</p>
                      <p className="flex gap-2"><span className="font-black text-[#800000]">2. Select Entry:</span> Submit your preferred fee and choose color, size or number groups.</p>
                      <p className="flex gap-2"><span className="font-black text-[#800000]">3. Watch Countdown:</span> Results are calculated in real-time. Winners receive instant, automated cashout multipliers!</p>
                    </div>
                  </div>
                </div>
              )}

              {/* About Us Modal */}
              {activeModal === "about" && (
                <div className="space-y-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#800000] to-[#b30000] flex items-center justify-center text-white mx-auto">
                    <Box size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-800">Bull Wave Premium Hub</h3>
                    <span className="text-[10px] text-slate-400 font-bold">Version 2.0.4 (Stable Release)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed px-2">
                    Bull Wave Games is the leading provably fair interactive gaming destination, optimized for high-performance and instant liquidity settlements. Underwritten by secure cluster technology.
                  </p>
                  <div className="text-[10px] text-slate-400 font-bold border-t border-slate-100 pt-4">
                    © 2026 Bull Wave interactive nodes. All rights reserved.
                  </div>
                </div>
              )}

              {/* Deposit History Modal */}
              {activeModal === "depositHistory" && (
                <div className="space-y-4">
                  <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                    <ClipboardList className="text-rose-600" size={18} /> Deposit Transactions
                  </h3>
                  <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                    {[
                      { id: 101, amount: "₹5,000.00", status: "Success", ref: "TXN5819", date: "Today, 11:20 AM" },
                      { id: 102, amount: "₹1,000.00", status: "Success", ref: "TXN4910", date: "May 16, 2026" },
                    ].map((txn) => (
                      <div key={txn.id} className="p-3 bg-white border border-slate-100 rounded-xl flex justify-between items-center shadow-sm">
                        <div>
                          <p className="text-xs font-black text-slate-800">{txn.amount}</p>
                          <span className="text-[9px] text-slate-400 font-bold">{txn.date} | Ref: {txn.ref}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 uppercase">{txn.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Withdraw History Modal */}
              {activeModal === "withdrawHistory" && (
                <div className="space-y-4">
                  <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                    <Wallet className="text-orange-600" size={18} /> Withdrawal Settlements
                  </h3>
                  <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                    {[
                      { id: 201, amount: "₹2,500.00", status: "Processing", ref: "WD9218", date: "Today, 02:45 PM" },
                      { id: 202, amount: "₹4,000.00", status: "Completed", ref: "WD8192", date: "May 14, 2026" },
                    ].map((txn) => (
                      <div key={txn.id} className="p-3 bg-white border border-slate-100 rounded-xl flex justify-between items-center shadow-sm">
                        <div>
                          <p className="text-xs font-black text-slate-800">{txn.amount}</p>
                          <span className="text-[9px] text-slate-400 font-bold">{txn.date} | Ref: {txn.ref}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          txn.status === "Processing" ? "bg-orange-500/10 text-orange-600" : "bg-emerald-500/10 text-emerald-600"
                        }`}>{txn.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {renderImagePreview()}
    </div>
  );
}
