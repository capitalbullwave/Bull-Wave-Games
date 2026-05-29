"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, LayoutGrid, Dices, Tv, Trophy, MonitorPlay, Fish, CheckCircle2, HandCoins } from 'lucide-react';
import { apiRequest } from '@/lib/api';

interface CategoryStats {
  name: string;
  code: string;
  turnover: number;
  rebate: number;
  available_rebate: number;
}

interface DashboardData {
  availableRebate: number;
  todayRebate: number;
  totalRebate: number;
  vipLevel: number;
  categories: CategoryStats[];
}

export default function RebatePage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('All');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/rebate/dashboard');
      if (res.success) {
        setData(res.data);
      }
    } catch (error) {
      console.error('Failed to load rebate dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleClaim = async () => {
    if (!data || currentAvailable <= 0) return;
    try {
      setClaiming(true);
      const res = await apiRequest('/rebate/claim', { method: 'POST' });
      if (res.success) {
        alert(`Successfully claimed ₹${res.data.claimed_amount.toFixed(2)}`);
        fetchDashboard();
      }
    } catch (error: any) {
      alert(error.message || 'Failed to claim rebate');
    } finally {
      setClaiming(false);
    }
  };

  // Tab Icon Mapping
  const getIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'lottery': return <Dices size={24} />;
      case 'casino': return <Tv size={24} />;
      case 'sports': return <Trophy size={24} />;
      case 'slots': return <MonitorPlay size={24} />;
      case 'fishing': return <Fish size={24} />;
      default: return <LayoutGrid size={24} />;
    }
  };

  // Extract categories and add "All" to the beginning
  const tabs = [{ name: 'All', code: 'all' }, ...(data?.categories || [])];

  // Calculate Display Data based on Active Tab
  let currentAvailable = 0;
  let currentToday = 0;
  let currentTotal = 0;

  if (activeTab === 'All' && data) {
    currentAvailable = data.availableRebate;
    currentToday = data.todayRebate;
    currentTotal = data.totalRebate;
  } else if (data) {
    const cat = data.categories.find(c => c.name === activeTab);
    if (cat) {
      currentAvailable = cat.available_rebate;
      currentToday = cat.rebate; // Assuming rebate is today's generated
      // Backend doesn't send lifetime total per category in the current schema, so we fallback to 0 or total if needed. 
      // For now, let's just show available for that category.
      currentTotal = cat.rebate; 
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f7fa] pb-20 font-sans">
      {/* Header */}
      <div className="bg-white text-gray-800 px-4 py-3 flex items-center shadow-sm sticky top-0 z-50">
        <button onClick={() => router.back()} className="mr-4 active:scale-90 transition-transform">
          <ChevronLeft size={24} className="text-gray-600" />
        </button>
        <h1 className="text-[17px] font-medium flex-1 text-center">Rebate</h1>
        <div className="w-6" /> {/* Spacer */}
      </div>

      {/* Tabs Menu */}
      <div className="bg-white pt-3 pb-2 px-3 shadow-sm mb-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {tabs.map((tab, idx) => {
            const isActive = activeTab === tab.name;
            return (
              <div 
                key={idx}
                onClick={(e) => {
                  setActiveTab(tab.name);
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                }}
                className={`flex-shrink-0 flex flex-col items-center justify-center w-[88px] h-[64px] rounded-xl transition-all cursor-pointer shadow-sm
                  ${isActive 
                    ? 'bg-gradient-to-r from-[#b30000] to-[#800000] text-white shadow-md' 
                    : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
              >
                <div className="mb-1">{getIcon(tab.name)}</div>
                <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-500'}`}>{tab.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white mx-3 rounded-2xl p-3 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex flex-col">
            <h2 className="text-[15px] font-medium text-gray-700">{activeTab}-Total betting rebate</h2>
          </div>
        </div>

        {/* Real-time count badge */}
        <div className="inline-flex items-center gap-1 text-[#800000] border border-[#800000]/30 bg-[#800000]/10 px-2 py-0.5 rounded text-[11px] mb-3 font-bold">
          <CheckCircle2 size={12} />
          Real-time count
        </div>

        {/* Big Amount */}
        <div className="flex items-center gap-2 mb-3">
          <HandCoins size={28} className="text-[#D4AF37]" />
          <span className="text-3xl font-black text-gray-800">{currentAvailable.toFixed(2)}</span>
        </div>

        {/* VIP Text */}
        <div className="bg-gray-50 rounded-lg p-2.5 mb-3">
          <p className="text-xs text-gray-500">Upgrade VIP level to increase rebate rate</p>
        </div>

        {/* Today and Total Grid */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-gray-50 rounded-xl p-2.5 flex flex-col justify-center border border-gray-100 shadow-sm">
             <span className="text-xs text-gray-500 mb-1">Today rebate</span>
             <span className="text-[#D4AF37] font-bold text-lg">{currentToday.toFixed(2)}</span>
          </div>
          <div className="bg-gray-50 rounded-xl p-2.5 flex flex-col justify-center border border-gray-100 shadow-sm">
             <span className="text-xs text-gray-500 mb-1">Total rebate</span>
             <span className="text-[#D4AF37] font-bold text-lg">{currentTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Muted instruction */}
        <p className="text-xs text-gray-400 mb-3">Automatic code washing at 01:00:00 every morning</p>

        {/* Claim Button */}
        <button 
          onClick={handleClaim}
          disabled={currentAvailable <= 0 || claiming}
          className={`w-full py-3.5 rounded-full font-medium text-[15px] transition-all
            ${currentAvailable > 0 && !claiming 
              ? 'bg-gradient-to-r from-[#d9d9db] to-[#c5c6c8] text-gray-800 active:scale-[0.98]' 
              : 'bg-gray-200 text-gray-400'}`}
        >
          {claiming ? (
            <div className="flex justify-center"><div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div></div>
          ) : (
            'One-Click Rebate'
          )}
        </button>
      </div>

      {/* Rebate History Title */}
      <div className="px-4 mt-6 mb-3 flex items-center gap-2">
         <div className="w-1 h-4 bg-[#800000] rounded-full"></div>
         <h2 className="text-lg font-bold text-gray-800">Rebate history</h2>
      </div>

      {/* Rebate History Button */}
      <div className="px-4">
        <button 
          onClick={() => router.push('/rebate/history')}
          className="w-full py-3 rounded-full border border-[#800000] text-[#800000] font-bold bg-white active:bg-[#800000]/10 transition-colors shadow-sm"
        >
          All history
        </button>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
