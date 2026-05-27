"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Copy, Share2, DollarSign, Gift, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

export default function ReferralPage() {
  const [copied, setCopied] = useState(false);
  const referralCode = "BULLWAVE7721";
  const referralLink = `https://bullwavegames.com/invite?code=${referralCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral invitation link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join Bull Wave Games",
        text: "Register on Bull Wave Games using my referral link and win instant bonuses!",
        url: referralLink,
      }).catch(console.error);
    } else {
      handleCopy();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Users className="text-[#800000] animate-pulse" /> Affiliate Program
        </h1>
        <p className="text-muted-foreground text-xs">Invite friends, earn lifetime commissions, and track referral networks</p>
      </div>

      {/* Main Referral Stats */}
      <section className="flex flex-col gap-3 w-full">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-200/50 shadow-sm rounded-2xl">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <Users size={20} />
            </div>
            <div>
              <span className="text-[10px] text-blue-800 font-bold block">Total Referrals</span>
              <h3 className="text-lg font-black text-blue-900">42 Players</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-emerald-50 to-teal-50/50 border border-emerald-200/50 shadow-sm rounded-2xl">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
              <DollarSign size={20} />
            </div>
            <div>
              <span className="text-[10px] text-emerald-800 font-bold block">Commission Earned</span>
              <h3 className="text-lg font-black text-emerald-900">₹ 12,450.00</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-rose-50 to-pink-50/50 border border-rose-200/50 shadow-sm rounded-2xl">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
              <Gift size={20} />
            </div>
            <div>
              <span className="text-[10px] text-rose-800 font-bold block">Active Tier Level</span>
              <h3 className="text-lg font-black text-rose-900">Bronze Agent</h3>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Referral Link & Share Controls */}
      <section className="flex flex-col gap-6 w-full">
        
        <div className="w-full space-y-6">
          <Card className="bg-gradient-to-br from-[#800000]/5 via-white to-[#D4AF37]/5 border border-[#D4AF37]/35 shadow-sm rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px]" />
            <CardHeader>
              <CardTitle className="text-base text-[#800000]">Share Invitation Link</CardTitle>
              <CardDescription className="text-xs text-slate-600">Get 10% commission on every friend's prediction and cash addition.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={referralLink}
                  className="bg-white border-[#D4AF37]/30 rounded-xl text-slate-800 py-4 text-xs shadow-sm"
                />
                <Button onClick={handleCopy} className="bg-[#800000] hover:bg-[#800000]/90 text-white rounded-xl px-4 py-4">
                  <Copy size={14} />
                </Button>
              </div>

              <div className="flex gap-4">
                <Button onClick={handleShare} className="w-full bg-white border border-[#D4AF37]/30 text-[#800000] hover:bg-slate-50 py-4 rounded-xl flex items-center justify-center gap-2 text-xs shadow-sm">
                  <Share2 size={14} /> Share via Socials
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Steps description */}
          <div className="bg-gradient-to-r from-slate-50 via-white to-slate-100/50 border border-slate-200/60 rounded-2xl p-5 space-y-4 shadow-sm">
            <h4 className="font-bold text-sm text-slate-800">How it works?</h4>
            <div className="flex flex-col gap-3 text-xs">
              <div className="space-y-1">
                <strong className="text-[#800000] text-sm">1. Invite</strong>
                <p className="text-slate-600 text-[10px] leading-relaxed">Share your unique affiliate link with friends and networks.</p>
              </div>
              <div className="space-y-1">
                <strong className="text-[#D4AF37] text-sm">2. Register</strong>
                <p className="text-slate-600 text-[10px] leading-relaxed">Your invitees join the Bull Wave gaming portal and place deposits.</p>
              </div>
              <div className="space-y-1">
                <strong className="text-blue-600 text-sm">3. Earn</strong>
                <p className="text-slate-600 text-[10px] leading-relaxed">Collect up to 10% commission settled directly to your wallet.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Affiliate network logs */}
        <div className="w-full">
          <Card className="bg-gradient-to-r from-violet-50 to-purple-50/50 border border-purple-200/50 shadow-sm rounded-2xl">
            <CardHeader className="py-4">
              <CardTitle className="text-sm text-purple-900">Recent Referrals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pb-4">
              {[
                { username: "Rohit_Inv", date: "Joined yesterday", comm: "₹150.00" },
                { username: "Player_1819", date: "Joined 3 days ago", comm: "₹450.00" },
                { username: "VipPredict", date: "Joined last week", comm: "₹1,200.00" },
              ].map((r, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-white/80 border border-purple-200/30 flex justify-between items-center shadow-sm">
                  <div>
                    <p className="text-xs font-bold text-slate-800">{r.username}</p>
                    <span className="text-[10px] text-slate-500">{r.date}</span>
                  </div>
                  <span className="text-xs font-black text-emerald-600 flex items-center gap-0.5">
                    +{r.comm} <ArrowUpRight size={12} />
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
