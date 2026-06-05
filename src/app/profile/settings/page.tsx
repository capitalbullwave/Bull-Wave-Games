"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  Lock, 
  Mail, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  AlertCircle, 
  X,
  Info,
  ExternalLink,
  ShieldAlert,
  Wallet,
  Bell
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type SettingsView = "menu" | "password" | "mailbox" | "google";

export default function SettingsPage() {
  const router = useRouter();
  const { user, updateProfile, setPassword } = useAuthStore();
  const [activeView, setActiveView] = useState<SettingsView>("menu");
  const [copied, setCopied] = useState(false);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  // States for Nickname Edit Modal
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");

  // States for Change Password View
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // States for Bind Mailbox View
  const [emailInput, setEmailInput] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [timer, setTimer] = useState(0);
  const [sentCode, setSentCode] = useState<string | null>(null);

  // States for Google Authenticator View
  const [googleAuthEnabled, setGoogleAuthEnabled] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [validationPassword, setValidationPassword] = useState("");
  const [showValidationPass, setShowValidationPass] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Sync nickname input when modal opens
  useEffect(() => {
    if (user) {
      setNicknameInput(user.fullName || "Rohit Kumar");
      setEmailInput(user.email || "");
    }
  }, [user, showNicknameModal]);

  // Timer countdown for Bind Mailbox OTP
  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    }
  }, [timer]);

  // Copy UID function
  const handleCopyUid = () => {
    const uid = user?.id || "21378110";
    navigator.clipboard.writeText(uid);
    setCopied(true);
    toast.success("UID copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  // Nickname Update Handler
  const handleUpdateNickname = async () => {
    if (!nicknameInput.trim()) {
      toast.error("Nickname cannot be empty!");
      return;
    }
    try {
      await updateProfile({ fullName: nicknameInput.trim() });
      toast.success("Nickname updated successfully!");
      setShowNicknameModal(false);
    } catch (error) {
      toast.error("Failed to update nickname.");
    }
  };

  // Avatar Update Handler
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

  // Change Password Handler
  const handleSavePasswordChanges = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    try {
      const success = await setPassword(newPassword);
      if (success) {
        toast.success("Password changed successfully!");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setActiveView("menu");
      } else {
        toast.error("Failed to set new password.");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update password.");
    }
  };

  // Send Verification Code Handler
  const handleSendVerificationCode = () => {
    if (!emailInput.trim()) {
      toast.error("Please enter a valid email address.");
      return;
    }
    // Simple email regex check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.trim())) {
      toast.error("Invalid email format.");
      return;
    }

    // Simulate OTP generation
    const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
    setSentCode(mockCode);
    setTimer(60);
    
    // Log code for developers
    console.log(`[Email OTP Sandbox Hint]: Verification code sent -> ${mockCode}`);
    toast.success(`Verification code sent to ${emailInput}! Check logs.`);
  };

  // Bind Mailbox Handler
  const handleBindMailbox = async () => {
    if (!emailInput.trim() || !verificationCode) {
      toast.error("Please fill in all email verification fields.");
      return;
    }
    if (verificationCode !== sentCode) {
      toast.error("Invalid verification code!");
      return;
    }

    try {
      await updateProfile({ email: emailInput.trim() });
      toast.success("Mailbox bound successfully!");
      setEmailInput("");
      setVerificationCode("");
      setSentCode(null);
      setActiveView("menu");
    } catch (error) {
      toast.error("Failed to bind mailbox.");
    }
  };

  // Turn On Google Verification - Password Validation Handler
  const handleConfirmPasswordValidation = () => {
    if (!validationPassword) {
      toast.error("Please enter your login password.");
      return;
    }
    // Simulate validation check
    toast.success("Password verified successfully!");
    setGoogleAuthEnabled(true);
    setShowPasswordModal(false);
    setValidationPassword("");
    toast.success("Google Authenticator verification turned on!");
  };

  // Image Preview Zoom Helper
  const renderImagePreview = () => (
    <AnimatePresence>
      {isPreviewOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-[200] flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setIsPreviewOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-[280px] xs:max-w-xs rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-white p-2.5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-900/60 hover:bg-slate-900/80 text-white transition-all shadow-md z-10 cursor-pointer"
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

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col animate-in fade-in duration-300">
      
      {/* -------------------- VIEW 1: SETTINGS MENU (Settings Center matching user's new screenshot) -------------------- */}
      {activeView === "menu" && (
        <div className="flex flex-col flex-1 pb-16">
          {/* Hidden File Input for Avatar Customization */}
          <input 
            type="file" 
            ref={avatarInputRef} 
            onChange={handleAvatarChange} 
            accept="image/*" 
            className="hidden" 
          />

          {/* Maroon & Gold header with back button */}
          <div className="h-28 bg-gradient-to-b from-[#800000] to-[#b30000] flex flex-col justify-start px-4 pt-4 relative shrink-0">
            <div className="flex items-center justify-between text-white">
              <button 
                onClick={() => router.push("/profile")} 
                className="p-1 hover:opacity-80 transition-opacity flex items-center justify-center cursor-pointer"
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
                  className="text-xs text-slate-500 font-bold hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                >
                  Change avatar <ChevronRight size={14} className="stroke-[2.5] text-slate-400" />
                </button>
              </div>

              {/* Nickname block */}
              <div 
                onClick={() => setShowNicknameModal(true)}
                className="flex items-center justify-between border-b border-slate-100 pb-4 cursor-pointer hover:bg-slate-50/50 rounded-xl p-1 transition-all"
              >
                <span className="text-xs text-slate-500 font-bold">Nickname</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-slate-800 font-black">{user?.fullName || "MemberNNGFNDFO"}</span>
                  <ChevronRight size={14} className="stroke-[2.5] text-slate-400" />
                </div>
              </div>

              {/* UID block */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-bold">UID</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-850 font-black tracking-wide">{user?.id || "21378110"}</span>
                  <button 
                    onClick={handleCopyUid}
                    className="p-1 rounded hover:bg-slate-100 text-rose-500 active:scale-90 transition-all cursor-pointer"
                  >
                    {copied ? <Check size={14} className="text-emerald-500" /> : (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Security Information Section */}
          <div className="px-4 mt-6 space-y-3">
            {/* Header */}
            <div className="flex items-center gap-2 pl-1.5 py-1">
              <div className="w-1 h-4 bg-[#800000] rounded-full shrink-0" />
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">
                Security information
              </h4>
            </div>

            {/* Menu List Options */}
            <div className="bg-white rounded-3xl border border-slate-100/50 shadow-sm overflow-hidden divide-y divide-slate-50">
              
              {/* Login Password Option */}
              <button
                onClick={() => setActiveView("password")}
                className="w-full flex items-center justify-between p-4.5 hover:bg-slate-50 transition-colors text-left focus:outline-none cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-[#800000] shadow-sm shrink-0 border border-amber-200/40">
                    <Lock size={18} className="stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-black text-slate-800">Login password</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold text-slate-400">Edit</span>
                  <ChevronRight size={14} className="stroke-[2.5] text-slate-400" />
                </div>
              </button>

              {/* Bind Mailbox Option */}
              <button
                onClick={() => setActiveView("mailbox")}
                className="w-full flex items-center justify-between p-4.5 hover:bg-slate-50 transition-colors text-left focus:outline-none cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-[#800000] shadow-sm shrink-0 border border-amber-200/40">
                    <Mail size={18} className="stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-black text-slate-800">Bind mailbox</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold text-slate-400">
                    {user?.email ? "Bound" : "to bind"}
                  </span>
                  <ChevronRight size={14} className="stroke-[2.5] text-slate-400" />
                </div>
              </button>

              {/* Google Verification Option */}
              <button
                onClick={() => setActiveView("google")}
                className="w-full flex items-center justify-between p-4.5 hover:bg-slate-50 transition-colors text-left focus:outline-none cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-[#800000] shadow-sm shrink-0 border border-amber-200/40">
                    <span className="text-base font-black tracking-tighter text-[#800000]">G</span>
                  </div>
                  <span className="text-xs font-black text-slate-800">Google Verification</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold text-slate-400">
                    {googleAuthEnabled ? "Opened" : "Unopened"}
                  </span>
                  <ChevronRight size={14} className="stroke-[2.5] text-slate-400" />
                </div>
              </button>

              {/* Updated Version Option */}
              <div className="w-full flex items-center justify-between p-4.5 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-[#800000] shadow-sm shrink-0 border border-amber-200/40">
                    <Info size={18} className="stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-black text-slate-800">Updated version</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold text-slate-400">1.0.9</span>
                  <ChevronRight size={14} className="stroke-[2.5] text-slate-400" />
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* -------------------- VIEW 2: CHANGE LOGIN PASSWORD (Screenshot 1) -------------------- */}
      {activeView === "password" && (
        <div className="flex flex-col flex-1 pb-16">
          {/* Header */}
          <div className="h-14 bg-white border-b border-slate-100 flex items-center px-4 sticky top-0 z-35 shrink-0">
            <button
              onClick={() => setActiveView("menu")}
              className="p-1 text-slate-700 hover:bg-slate-100 rounded-xl transition-all active:scale-95 flex items-center justify-center"
            >
              <ChevronLeft size={22} className="stroke-[2.5]" />
            </button>
            <span className="text-sm font-black text-slate-800 absolute left-1/2 -translate-x-1/2">
              Change login password
            </span>
          </div>

          <div className="p-5 flex-1 flex flex-col justify-between">
            {/* Input Form Fields */}
            <div className="space-y-5">
              
              {/* Old Login Password */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-700">
                  <div className="w-5 h-5 rounded-md bg-amber-100 text-[#800000] flex items-center justify-center shrink-0">
                    <Lock size={12} className="stroke-[2.5]" />
                  </div>
                  <Label className="text-xs font-black text-slate-700">Login password</Label>
                </div>
                <div className="relative">
                  <Input 
                    type={showOldPass ? "text" : "password"}
                    placeholder="Login password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="bg-white border-slate-100 rounded-2xl text-slate-800 pr-10 shadow-sm py-5 text-xs focus:ring-rose-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPass(!showOldPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 active:scale-90 transition-all cursor-pointer"
                  >
                    {showOldPass ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
              </div>

              {/* New Login Password */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-700">
                  <div className="w-5 h-5 rounded-md bg-amber-100 text-[#800000] flex items-center justify-center shrink-0">
                    <Lock size={12} className="stroke-[2.5]" />
                  </div>
                  <Label className="text-xs font-black text-slate-700">New login password</Label>
                </div>
                <div className="relative">
                  <Input 
                    type={showNewPass ? "text" : "password"}
                    placeholder="New login password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-white border-slate-100 rounded-2xl text-slate-800 pr-10 shadow-sm py-5 text-xs focus:ring-rose-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 active:scale-90 transition-all cursor-pointer"
                  >
                    {showNewPass ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-700">
                  <div className="w-5 h-5 rounded-md bg-amber-100 text-[#800000] flex items-center justify-center shrink-0">
                    <Lock size={12} className="stroke-[2.5]" />
                  </div>
                  <Label className="text-xs font-black text-slate-700">Confirm new password</Label>
                </div>
                <div className="relative">
                  <Input 
                    type={showConfirmPass ? "text" : "password"}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-white border-slate-100 rounded-2xl text-slate-800 pr-10 shadow-sm py-5 text-xs focus:ring-rose-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 active:scale-90 transition-all cursor-pointer"
                  >
                    {showConfirmPass ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                </div>
              </div>

              {/* Link */}
              <div className="text-right">
                <button 
                  onClick={() => router.push("/auth/forgot-password")}
                  className="text-[11px] text-slate-500 hover:text-[#800000] font-bold inline-flex items-center gap-0.5"
                >
                  Forgot original login password <ChevronRight size={12} />
                </button>
              </div>

            </div>

            {/* Bottom Save Changes Button */}
            <div className="mt-8">
              <Button
                onClick={handleSavePasswordChanges}
                className="w-full bg-gradient-to-r from-[#800000] to-[#b30000] hover:from-[#b30000] hover:to-[#800000] text-white font-extrabold py-5 rounded-full shadow-md text-xs transition-all active:scale-[0.98]"
              >
                Save changes
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* -------------------- VIEW 3: BIND MAILBOX (Screenshot 2) -------------------- */}
      {activeView === "mailbox" && (
        <div className="flex flex-col flex-1 pb-16">
          {/* Header */}
          <div className="h-14 bg-white border-b border-slate-100 flex items-center px-4 sticky top-0 z-35 shrink-0">
            <button
              onClick={() => setActiveView("menu")}
              className="p-1 text-slate-700 hover:bg-slate-100 rounded-xl transition-all active:scale-95 flex items-center justify-center"
            >
              <ChevronLeft size={22} className="stroke-[2.5]" />
            </button>
            <span className="text-sm font-black text-slate-800 absolute left-1/2 -translate-x-1/2">
              Bind mailbox
            </span>
          </div>

          <div className="p-5 flex-1 flex flex-col justify-between">
            {/* Input Form Fields */}
            <div className="space-y-5">
              
              {/* Mail Address */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-700">
                  <div className="w-5 h-5 rounded-md bg-amber-100 text-[#800000] flex items-center justify-center shrink-0">
                    <Mail size={12} className="stroke-[2.5]" />
                  </div>
                  <Label className="text-xs font-black text-slate-700">Mail</Label>
                </div>
                <Input 
                  type="email"
                  placeholder="please input your email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="bg-white border-slate-100 rounded-2xl text-slate-800 shadow-sm py-5 text-xs focus:ring-rose-200"
                />
              </div>

              {/* Verification Code */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-700">
                  <div className="w-5 h-5 rounded-md bg-amber-100 text-[#800000] flex items-center justify-center shrink-0">
                    <ShieldCheck size={12} className="stroke-[2.5]" />
                  </div>
                  <Label className="text-xs font-black text-slate-700">Verification Code</Label>
                </div>
                <div className="relative flex items-center bg-white border border-slate-100 rounded-2xl shadow-sm pr-2 overflow-hidden">
                  <Input 
                    type="text"
                    placeholder="Please enter the confirmation code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="border-none shadow-none focus-visible:ring-0 text-slate-800 py-5 text-xs flex-1 bg-transparent"
                  />
                  <button
                    type="button"
                    disabled={timer > 0}
                    onClick={handleSendVerificationCode}
                    className="bg-[#800000] hover:bg-[#800000]/90 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold px-5 py-2.5 rounded-xl text-[10px] uppercase tracking-wide transition-all active:scale-95 shrink-0 cursor-pointer"
                  >
                    {timer > 0 ? `${timer}s` : "Send"}
                  </button>
                </div>
              </div>

            </div>

            {/* Bottom Bind Button */}
            <div className="mt-8">
              <Button
                onClick={handleBindMailbox}
                className="w-full bg-gradient-to-r from-[#800000] to-[#b30000] hover:from-[#b30000] hover:to-[#800000] text-white font-extrabold py-5 rounded-full shadow-md text-xs transition-all active:scale-[0.98]"
              >
                Bind
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* -------------------- VIEW 4: GOOGLE AUTHENTICATOR (Screenshot 3 & 4) -------------------- */}
      {activeView === "google" && (
        <div className="flex flex-col flex-1 pb-16">
          {/* Custom Maroon Header to match project brand */}
          <div className="h-14 bg-[#800000] text-white flex items-center px-4 sticky top-0 z-35 shrink-0">
            <button
              onClick={() => setActiveView("menu")}
              className="p-1 text-white hover:bg-white/10 rounded-xl transition-all active:scale-95 flex items-center justify-center"
            >
              <ChevronLeft size={22} className="stroke-[3]" />
            </button>
            <span className="text-sm font-black text-white absolute left-1/2 -translate-x-1/2">
              Google Authenticator
            </span>
          </div>

          <div className="flex-1 flex flex-col justify-between">
            <div>
              {/* Graphic Banner */}
              <div className="bg-gradient-to-b from-[#800000] to-[#800000]/40 py-10 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/35 z-10 shadow-lg relative">
                  <div className="absolute inset-2 bg-gradient-to-tr from-sky-400 via-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    {/* SVG Shield Check */}
                    <svg className="w-10 h-10 text-white drop-shadow-md" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" fillOpacity="0.1" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </div>
                  {/* Outer Orbiting Dots */}
                  <div className="absolute w-28 h-28 border border-white/20 rounded-full animate-[spin_10s_linear_infinite]" />
                </div>
                <div className="absolute -left-10 bottom-[-10px] w-24 h-24 bg-white/10 rounded-full blur-xl" />
                <div className="absolute -right-10 top-[-10px] w-32 h-32 bg-white/10 rounded-full blur-xl" />
              </div>

              {/* Instructions Box */}
              <div className="p-4 space-y-4">
                <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
                  {/* Warning Title */}
                  <div className="flex items-center gap-2.5 text-slate-800 pb-2 border-b border-slate-50">
                    <ShieldAlert size={20} className="text-red-500 shrink-0" />
                    <h3 className="text-[13px] font-black text-slate-850">
                      Google Authenticator Instructions
                    </h3>
                  </div>

                  {/* Bullets with Maroon play arrow icons */}
                  <div className="space-y-4 text-slate-500 text-xs leading-relaxed font-semibold">
                    <div className="flex items-start gap-2">
                      <span className="text-[#800000] text-xs mt-0.5 shrink-0">▶</span>
                      <p className="text-justify">
                        Google Authenticator is a TOTP and HOTP two-step verification software token for Google's authentication service.
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[#800000] text-xs mt-0.5 shrink-0">▶</span>
                      <p className="text-justify">
                        After binding, a dynamic verification code is generated every 30 seconds, and the verification code can be used for security verification of operations such as login, withdrawal, and modification of security settings.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Turn On Button */}
            <div className="p-4 mb-4">
              <Button
                onClick={() => setShowPasswordModal(true)}
                className="w-full bg-gradient-to-r from-[#800000] to-[#b30000] hover:from-[#b30000] hover:to-[#800000] text-white font-extrabold py-5 rounded-full shadow-md text-xs transition-all active:scale-[0.98]"
              >
                Turn on Google Verification
              </Button>
            </div>

          </div>

          {/* -------------------- PASSWORD VALIDATION MODAL (Screenshot 4) -------------------- */}
          <AnimatePresence>
            {showPasswordModal && (
              <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex flex-col items-center justify-center p-6 overflow-hidden">
                {/* Backdrop Click Closer */}
                <div className="absolute inset-0" onClick={() => setShowPasswordModal(false)} />
                
                {/* Modal Card Panel */}
                <div className="w-full max-w-sm flex flex-col gap-6 relative z-10">
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-2xl flex flex-col"
                  >
                    {/* Header Bar */}
                    <div className="bg-[#800000] text-white py-3.5 text-center font-black tracking-wider text-base select-none">
                      Password Validation
                    </div>

                    {/* Body */}
                    <div className="p-5 space-y-4">
                      
                      {/* Password input field */}
                      <div className="space-y-1.5 text-left">
                        <div className="flex items-center gap-2 text-slate-700">
                          <div className="w-4 h-4 rounded bg-amber-100 text-[#800000] flex items-center justify-center shrink-0">
                            <Lock size={10} className="stroke-[2.5]" />
                          </div>
                          <Label className="text-[11px] font-black text-slate-700">Login password</Label>
                        </div>
                        <div className="relative">
                          <Input 
                            type={showValidationPass ? "text" : "password"}
                            placeholder="Please enter your login password"
                            value={validationPassword}
                            onChange={(e) => setValidationPassword(e.target.value)}
                            className="bg-slate-50/50 border-slate-100 rounded-2xl text-slate-800 pr-10 shadow-inner py-5 text-xs focus:ring-rose-200"
                          />
                          <button
                            type="button"
                            onClick={() => setShowValidationPass(!showValidationPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 active:scale-90 transition-all cursor-pointer"
                          >
                            {showValidationPass ? <Eye size={14} /> : <EyeOff size={14} />}
                          </button>
                        </div>
                      </div>

                      {/* Warning notice */}
                      <div className="flex items-start gap-1.5 bg-amber-50/50 border-l-2 border-[#800000] p-2.5 rounded-xl">
                        <AlertCircle size={14} className="text-[#800000] shrink-0 mt-0.5" />
                        <p className="text-[10px] text-[#800000] leading-tight font-bold text-left">
                          To secure your balance, please enter your password
                        </p>
                      </div>

                      {/* Help Links row */}
                      <div className="flex justify-between items-center text-[10px] font-bold pt-1">
                        <button 
                          onClick={() => {
                            setShowPasswordModal(false);
                            router.push("/auth/forgot-password");
                          }}
                          className="text-slate-400 hover:text-[#800000] cursor-pointer"
                        >
                          Forgot password?
                        </button>
                        <button 
                          onClick={() => {
                            setShowPasswordModal(false);
                            router.push("/support");
                          }}
                          className="text-slate-400 hover:text-[#800000] cursor-pointer border border-slate-200 rounded-lg px-2.5 py-1 hover:bg-slate-50 transition-colors"
                        >
                          Contact customer service
                        </button>
                      </div>

                      {/* Confirm submit button */}
                      <div className="pt-2">
                        <Button
                          onClick={handleConfirmPasswordValidation}
                          className="w-full bg-gradient-to-r from-[#800000] to-[#b30000] hover:from-[#b30000] hover:to-[#800000] text-white font-extrabold py-5 rounded-full shadow-md text-xs transition-all active:scale-[0.98]"
                        >
                          Confirm
                        </Button>
                      </div>

                    </div>
                  </motion.div>

                  {/* Close Icon underneath modal card panel */}
                  <button 
                    onClick={() => setShowPasswordModal(false)}
                    className="w-10 h-10 rounded-full border border-white/60 bg-black/10 hover:bg-black/20 text-white flex items-center justify-center mx-auto active:scale-90 transition-transform cursor-pointer shadow-md"
                  >
                    <X size={20} className="stroke-[2.5]" />
                  </button>
                </div>

              </div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* -------------------- EDIT NICKNAME MODAL -------------------- */}
      <AnimatePresence>
        {showNicknameModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-6">
            <div className="absolute inset-0" onClick={() => setShowNicknameModal(false)} />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-5 max-w-sm w-full text-center space-y-4 border border-slate-100 shadow-2xl relative z-10"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-black text-sm text-slate-800">Edit Nickname</span>
                <button 
                  onClick={() => setShowNicknameModal(false)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 pt-2 text-left">
                <Label className="text-xs font-bold text-slate-500">New Nickname</Label>
                <Input 
                  placeholder="Enter your nickname"
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  className="bg-slate-50/50 border-slate-100 rounded-2xl text-slate-800 shadow-inner py-5 text-xs focus:ring-rose-200"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <Button 
                  onClick={() => setShowNicknameModal(false)} 
                  variant="outline"
                  className="flex-1 rounded-full text-xs font-bold py-5 border-slate-200 text-slate-500"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdateNickname}
                  className="flex-1 bg-gradient-to-r from-[#800000] to-[#b30000] hover:from-[#b30000] hover:to-[#800000] text-white font-extrabold py-5 rounded-full text-xs"
                >
                  Save Nickname
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {renderImagePreview()}

    </div>
  );
}
