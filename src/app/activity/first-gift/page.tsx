"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, Gift, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import toast from 'react-hot-toast';

interface FirstGiftStatus {
  has_deposit: boolean;
  first_deposit_amount: number;
  potential_bonus: number;
  is_eligible: boolean;
  is_claimed: boolean;
  message: string;
}

export default function FirstGiftPage() {
  const router = useRouter();
  const [status, setStatus] = useState<FirstGiftStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<FirstGiftStatus>('/activity/first-gift/status');
      setStatus(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleClaim = async () => {
    if (!status || !status.is_eligible || status.is_claimed) return;
    
    try {
      setClaiming(true);
      const data = await apiRequest<any>('/activity/first-gift/claim', {
        method: 'POST'
      });
      toast.success(data.message || `Successfully claimed ₹${data.claimed_amount.toFixed(2)}!`);
      fetchStatus();
    } catch (error: any) {
      toast.error(error.message || 'Failed to claim bonus');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f3f7] pb-24 font-sans text-gray-800">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center sticky top-0 z-50">
        <button onClick={() => router.back()} className="mr-4">
          <ChevronLeft size={24} className="text-[#800000]" />
        </button>
        <h1 className="text-[20px] flex-1 text-center text-[#800000] font-medium pr-8">Activity details</h1>
      </div>

      {/* Banner */}
      <div className="relative bg-gradient-to-r from-[#b30000] to-[#800000] overflow-hidden p-6 text-white min-h-[220px] flex flex-col justify-center">
        
        <div className="relative z-10 w-[65%]">
          <h2 className="text-[26px] font-bold mb-3 drop-shadow-sm">First gift</h2>
          <p className="text-[14px] leading-tight mb-3">
            There are two types of new member gift package rewards::
          </p>
          <div className="space-y-2 text-[12px] mb-5">
            <div className="flex items-start gap-1.5">
              <span className="w-4 h-4 bg-white text-[#800000] rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
              <span className="leading-tight">Bonus for first deposit negative profit</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="w-4 h-4 bg-white text-[#800000] rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
              <span className="leading-tight">Play games and get bonuses only for new members</span>
            </div>
          </div>
          <button className="border border-white text-white text-[13px] px-5 py-1.5 rounded-full active:bg-white/20 transition-colors">
            Activity details
          </button>
        </div>
        
        {/* Decorative Gift Image Area */}
        <div className="absolute right-[-20px] bottom-[-20px] w-[180px] h-[180px] flex items-center justify-center pointer-events-none">
            {/* Fallback composition matching the screenshot's color tone */}
            <Gift size={120} strokeWidth={1} className="text-[#fce4aa] z-10 drop-shadow-xl" />
            <div className="absolute top-1/4 right-1/4 w-3 h-3 bg-red-400 rotate-45" />
            <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-yellow-300 rounded-full" />
            <div className="absolute top-1/3 right-1/2 w-4 h-1 bg-[#fc8f5c] -rotate-12" />
        </div>
      </div>

      {/* Content Container */}
      <div className="px-3 pt-4 space-y-4">
        
        {/* Event start time */}
        <div className="bg-white rounded-[16px] shadow-sm flex flex-col items-center">
            {/* The inverted border radius tab */}
            <div className="relative bg-[#800000] text-white text-[15px] font-medium px-10 py-1.5 rounded-b-[20px] shadow-sm">
                <div className="absolute top-0 left-[-16px] w-[16px] h-[16px] bg-transparent" style={{ boxShadow: '8px -8px 0 0 #800000', borderTopRightRadius: '16px' }}></div>
                <div className="absolute top-0 right-[-16px] w-[16px] h-[16px] bg-transparent" style={{ boxShadow: '-8px -8px 0 0 #800000', borderTopLeftRadius: '16px' }}></div>
                Event start time
            </div>
            <div className="py-4 text-[#800000] font-bold text-[18px]">
                2024-08-23 00:00:00
            </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[16px] shadow-sm overflow-hidden flex flex-col">
            {/* Headers */}
            <div className="grid grid-cols-[1.2fr_1.5fr_1fr] bg-[#800000] text-white text-[14px] text-center">
                <div className="py-3 px-2 flex flex-col items-center justify-center leading-tight">Conditions of<br/>participation</div>
                <div className="py-3 px-2 flex flex-col items-center justify-center leading-tight border-l border-white/20 border-r border-white/20">Get<br/>Compensation<br/>Bonus</div>
                <div className="py-3 px-2 flex items-center justify-center leading-tight">Bonus limit</div>
            </div>
            {/* Body */}
            <div className="grid grid-cols-[1.2fr_1.5fr_1fr] text-[14px] text-center text-slate-800 bg-white">
                <div className="py-6 px-2 border-r border-gray-100 flex items-center justify-center leading-tight">
                    First deposit<br/>for new users
                </div>
                <div className="py-6 px-2 border-r border-gray-100 flex flex-col items-center justify-center leading-tight">
                    <span>Total <span className="text-[#800000]">5%</span></span>
                    <span>compensation from</span>
                    <span>First Deposit Amount</span>
                </div>
                <div className="py-6 px-2 flex items-center justify-center text-[#800000]">
                    ₹200.00
                </div>
            </div>
        </div>

        {/* Info Box */}
        <div className="bg-white rounded-[20px] shadow-sm p-4 flex items-start gap-2">
            <AlertCircle size={20} className="text-[#800000] shrink-0 mt-0.5" strokeWidth={1.5} />
            <p className="text-[#800000] text-[13px] leading-[1.3] font-light">
                Qualified members can manually apply for bonuses on this page
            </p>
        </div>

      </div>

      {/* Fixed Bottom Action (For Claiming) */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full sm:w-[400px] p-4 bg-[#f0f3f7] pb-6">
        {loading ? (
            <button className="w-full bg-[#cbd0d9] text-white py-3.5 rounded-full font-medium flex items-center justify-center gap-2 cursor-not-allowed">
                <Loader2 size={18} className="animate-spin" />
                Checking eligibility...
            </button>
        ) : status?.is_claimed ? (
            <button className="w-full bg-[#cbd0d9] text-white py-3.5 rounded-full font-medium cursor-not-allowed shadow-inner">
                Already Claimed
            </button>
        ) : status?.is_eligible ? (
            <button 
                onClick={handleClaim}
                disabled={claiming}
                className="w-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-[#800000] font-black py-3.5 rounded-full font-medium shadow-md active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
            >
                {claiming && <Loader2 size={18} className="animate-spin" />}
                Apply for Bonus (₹{status.potential_bonus.toFixed(2)})
            </button>
        ) : (
            <button className="w-full bg-[#cbd0d9] text-white py-3.5 rounded-full font-medium cursor-not-allowed shadow-inner">
                Apply for Bonus
            </button>
        )}
      </div>

    </div>
  );
}
