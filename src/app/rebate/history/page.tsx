"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, LayoutGrid, Dices, Tv, Trophy, MonitorPlay, Fish, Gamepad2, Calendar, CircleDollarSign } from 'lucide-react';
import { apiRequest } from '@/lib/api';

interface HistoryRecord {
  amount: number;
  category: string;
  date: string;
}

export default function RebateHistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('All');

  const tabs = [
    { name: 'All' },
    { name: 'Lottery' },
    { name: 'Casino' },
    { name: 'Rummy' },
    { name: 'Sports' },
    { name: 'Slots' },
    { name: 'Fishing' },
  ];

  const getIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'lottery': return <Dices size={24} />;
      case 'casino': return <Tv size={24} />;
      case 'sports': return <Trophy size={24} />;
      case 'slots': return <MonitorPlay size={24} />;
      case 'fishing': return <Fish size={24} />;
      case 'rummy': return <Gamepad2 size={24} />;
      default: return <LayoutGrid size={24} />;
    }
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/rebate/history');
      if (res.success) {
        setHistory(res.data);
      }
    } catch (error) {
      console.error('Failed to load history', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredHistory = activeTab === 'All' 
    ? history 
    : history.filter(item => item.category.toLowerCase() === activeTab.toLowerCase());

  return (
    <div className="min-h-screen bg-[#f5f7fa] pb-20 font-sans">
      {/* Header */}
      <div className="bg-white text-gray-800 px-4 py-3 flex items-center shadow-sm sticky top-0 z-50">
        <button onClick={() => router.back()} className="mr-4 active:scale-90 transition-transform">
          <ChevronLeft size={24} className="text-gray-600" />
        </button>
        <h1 className="text-[17px] font-medium flex-1 text-center">Rebate history</h1>
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
                    ? 'bg-[#f04c55] text-white' 
                    : 'bg-white border border-gray-100 text-gray-400 hover:bg-gray-50'}`}
              >
                <div className="mb-1">{getIcon(tab.name)}</div>
                <span className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-500'}`}>{tab.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-[#f04c55] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredHistory.length > 0 ? (
          <div className="space-y-3">
            {filteredHistory.map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                      <CircleDollarSign size={20} className="text-[#f04c55]" />
                   </div>
                   <div>
                     <h3 className="font-bold text-gray-800">{item.category} Rebate</h3>
                     <div className="flex items-center text-xs text-gray-500 mt-1 gap-1">
                       <Calendar size={12} />
                       {new Date(item.date).toLocaleString()}
                     </div>
                   </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600 text-lg">+₹{item.amount.toFixed(2)}</p>
                  <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-sm font-medium">Generated</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center mt-20">
             {/* Empty State Image */}
             <div className="relative w-48 h-32 mb-6 opacity-30 flex justify-center items-center">
               <svg viewBox="0 0 200 120" className="w-full h-full text-gray-400 fill-current">
                 <path d="M40 80h120v20H40z" opacity="0.5"/>
                 <path d="M70 20h60v70H70z" />
                 <path d="M130 90h20v10h-20z" opacity="0.7"/>
                 <path d="M50 70l10-20 10 20z" opacity="0.6"/>
                 <path d="M160 80l5-10 5 10z" opacity="0.6"/>
               </svg>
             </div>
             <p className="text-gray-400 font-medium">No data</p>
          </div>
        )}
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
