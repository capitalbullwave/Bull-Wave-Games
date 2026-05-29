"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, LayoutGrid, ClipboardList, Crown, Gift, Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import toast from 'react-hot-toast';

interface SuperJackpotStatus {
  unclaimed_count: number;
  total_unclaimed_amount: number;
  jackpots: any[];
}

export default function SuperJackpotPage() {
  const router = useRouter();
  const [status, setStatus] = useState<SuperJackpotStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<SuperJackpotStatus>('/activity/super-jackpot/status');
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
    if (!status || status.unclaimed_count === 0) return;
    
    try {
      setClaiming(true);
      const data = await apiRequest<any>('/activity/super-jackpot/claim', {
        method: 'POST'
      });
      toast.success(`Successfully claimed ₹${data.total_claimed_amount.toFixed(2)} from ${data.claimed_count} jackpots!`);
      fetchStatus(); // refresh
    } catch (error: any) {
      toast.error(error.message || 'Failed to claim jackpots');
    } finally {
      setClaiming(false);
    }
  };

  const hasJackpots = status && status.unclaimed_count > 0;

  return (
    <div className="min-h-screen bg-[#f5f7fa] pb-20 font-sans">
      {/* Header */}
      <div className="bg-white text-gray-800 px-4 py-3 flex items-center sticky top-0 z-50">
        <button onClick={() => router.back()} className="mr-4 active:scale-90 transition-transform">
          <ChevronLeft size={24} className="text-gray-600" />
        </button>
        <h1 className="text-[17px] font-medium flex-1 text-center">Super Jackpot</h1>
        <div className="w-6" /> {/* Spacer */}
      </div>

      {/* Banner */}
      <div className="relative bg-gradient-to-r from-[#fb6a60] to-[#fcab7f] overflow-hidden p-6 text-white min-h-[190px] flex flex-col justify-center">
        {/* Background Circles / Effects */}
        <div className="absolute -top-12 -right-8 w-40 h-40 border-[20px] border-white/10 rounded-full" />
        <div className="absolute -bottom-16 -left-12 w-56 h-56 border-[15px] border-white/10 rounded-full" />
        <div className="absolute top-1/4 left-1/2 w-32 h-32 border border-white/20 rounded-full opacity-50" />
        
        <div className="relative z-10 w-[65%]">
          <h2 className="text-[26px] font-bold mb-4 text-shadow-sm leading-tight">Super Jackpot</h2>
          <p className="text-[12px] font-medium mb-3 leading-tight opacity-100">
            When you get the Super Jackpot in 【Slots】 Can get 1 additional bonus
          </p>
          <p className="text-[11px] leading-tight opacity-90 font-medium">
            The reward is valid for 3 day, and you will not be able to claim it after it expires!
          </p>
        </div>
        
        {/* Floating Gift Box simulation */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[40%] flex justify-center">
          <div className="relative">
            {/* The main gift icon */}
            <Gift size={90} className="text-yellow-100 drop-shadow-xl z-10 relative" />
            <div className="absolute -top-3 -right-2 w-4 h-4 rounded-full bg-red-500 border-2 border-white shadow-sm z-20" />
            <div className="absolute -bottom-2 -left-2 w-8 h-6 rounded-sm bg-[#e8413a] -rotate-12 flex items-center justify-center shadow-lg border border-red-400 z-20">
               <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-inner" />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-4 space-y-3">
        {/* Receive in batches Button */}
        {loading ? (
           <button className="w-full bg-[#cbd0d9] text-white flex items-center justify-center gap-2 py-3.5 rounded-full font-medium shadow-inner opacity-90 cursor-not-allowed">
             <Loader2 size={16} className="animate-spin" />
             Loading...
           </button>
        ) : hasJackpots ? (
           <button 
             onClick={handleClaim}
             disabled={claiming}
             className="w-full bg-gradient-to-r from-[#fc6b6d] to-[#fdb08a] text-white flex items-center justify-center gap-2 py-3.5 rounded-full font-medium shadow-md active:scale-95 transition-transform"
           >
             {claiming ? (
               <Loader2 size={16} className="animate-spin" />
             ) : (
               <div className="bg-white/40 p-1 rounded-full"><LayoutGrid size={16} className="text-white" /></div>
             )}
             Receive in batches ({status?.unclaimed_count}) - ₹{status?.total_unclaimed_amount.toFixed(2)}
           </button>
        ) : (
           <button className="w-full bg-[#cbd0d9] text-white flex items-center justify-center gap-2 py-3.5 rounded-full font-medium shadow-inner opacity-90 cursor-not-allowed">
             <div className="bg-white/40 p-1 rounded-full"><LayoutGrid size={16} className="text-white" /></div>
             Receive in batches
           </button>
        )}

        {/* Action Buttons Row */}
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-white py-3.5 rounded-xl shadow-sm border border-gray-50 flex items-center justify-center gap-2 font-medium text-[15px] text-gray-800 active:scale-95 transition-transform">
            <div className="text-[#f14d4d]">
               <ClipboardList size={22} />
            </div>
            Rule
          </button>
          
          <button className="bg-white py-3.5 rounded-xl shadow-sm border border-gray-50 flex items-center justify-center gap-2 font-medium text-[15px] text-gray-800 active:scale-95 transition-transform">
            <div className="w-6 h-6 rounded-full bg-[#f14d4d] flex items-center justify-center text-white">
               <Crown size={14} />
            </div>
            Winning star
          </button>
        </div>
      </div>

      {/* Empty State */}
      <div className="px-4 mt-2">
        <div className="bg-white rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-sm border border-gray-50 py-12">
          {/* SVG Illustration matching the history page empty state */}
          <div className="relative w-48 h-32 mb-6 opacity-30 flex justify-center items-center">
            <svg viewBox="0 0 200 120" className="w-full h-full text-gray-400 fill-current">
              <path d="M40 80h120v20H40z" opacity="0.5"/>
              <path d="M70 20h60v70H70z" />
              <path d="M130 90h20v10h-20z" opacity="0.7"/>
              <path d="M50 70l10-20 10 20z" opacity="0.6"/>
              <path d="M160 80l5-10 5 10z" opacity="0.6"/>
            </svg>
          </div>
          {hasJackpots ? (
            <p className="text-green-600 font-bold text-[15px]">You have {status?.unclaimed_count} unclaimed jackpots!</p>
          ) : (
            <p className="text-gray-500 font-medium">You don't have a big jackpot yet, let's bet</p>
          )}
        </div>
        
        {/* Go Bet Button */}
        {!hasJackpots && (
          <button 
            onClick={() => router.push('/lobby')}
            className="w-full mt-6 bg-gradient-to-r from-[#fa6261] to-[#fc917e] text-white font-medium py-3.5 rounded-full shadow-md active:scale-[0.98] transition-transform text-[17px]"
          >
            Go bet
          </button>
        )}
      </div>

    </div>
  );
}
