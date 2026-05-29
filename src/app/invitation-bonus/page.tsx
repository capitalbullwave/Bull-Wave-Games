"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Gift, Link as LinkIcon, CheckCircle2, Lock, Unlock, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { apiRequest } from '@/lib/api';

interface BonusLevel {
  id: number;
  level: number;
  required_invites: number;
  required_deposit_amount: number;
  reward_amount: number;
  is_active: boolean;
}

interface UserProgress {
  id: number;
  level_id: number;
  completed_invites: number;
  completed_deposits: number;
  reward_unlocked: boolean;
  reward_claimed: boolean;
  level: BonusLevel;
}

interface RewardHistory {
  id: number;
  amount: number;
  claimed_at: string;
  level: BonusLevel;
}

export default function InvitationBonusPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'rules' | 'record'>('rules');
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [history, setHistory] = useState<RewardHistory[]>([]);
  const [referralData, setReferralData] = useState({ referralCode: '', referralLink: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [progRes, histRes, refRes] = await Promise.all([
        apiRequest('/invitation/progress'),
        apiRequest('/invitation/history'),
        apiRequest('/invitation/referral-link')
      ]);
      
      setProgress(progRes.data);
      setHistory(histRes.data);
      setReferralData(refRes.data);
    } catch (error) {
      console.error('Failed to fetch invitation data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (levelId: number) => {
    try {
      const res = await apiRequest(`/invitation/claim/${levelId}`, { method: 'POST' });
      if (res.success) {
        alert(`Successfully claimed ₹${res.data.amount}`);
        fetchData(); // Refresh progress
      }
    } catch (error: any) {
      alert(error.message || 'Failed to claim reward');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      {/* Header */}
      <div className="bg-[#f04c55] text-white px-4 py-3 flex items-center sticky top-0 z-50 shadow-md">
        <button onClick={() => router.back()} className="mr-4">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-medium flex-1 text-center">Invitation Bonus</h1>
        <div className="w-6" />
      </div>

      {/* Top Banner Area */}
      <div className="bg-gradient-to-b from-[#f04c55] to-red-400 p-6 text-white flex flex-col items-center shadow-lg rounded-b-3xl">
        <Gift size={64} className="mb-4 opacity-90 drop-shadow-md" />
        <h2 className="text-2xl font-bold mb-2 drop-shadow">Invite Friends & Earn</h2>
        <p className="text-sm opacity-90 text-center mb-6">
          Invite friends to register and recharge to get huge rewards!
        </p>
        
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 w-full flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Referral Code</span>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-wider">{referralData.referralCode}</span>
              <button onClick={() => copyToClipboard(referralData.referralCode)} className="p-1 bg-white/30 rounded">
                <LinkIcon size={14} />
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Referral Link</span>
            <button onClick={() => copyToClipboard(referralData.referralLink)} className="px-4 py-1.5 bg-white text-red-500 rounded-full text-sm font-semibold shadow-sm hover:bg-gray-50 transition-colors">
              Copy Link
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white mt-4 mx-4 rounded-xl shadow-sm overflow-hidden">
        <button 
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'rules' ? 'bg-[#f04c55] text-white' : 'text-gray-600'}`}
          onClick={() => setActiveTab('rules')}
        >
          Bonus Rules
        </button>
        <button 
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'record' ? 'bg-[#f04c55] text-white' : 'text-gray-600'}`}
          onClick={() => setActiveTab('record')}
        >
          Invitation Record
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f04c55]"></div>
          </div>
        ) : activeTab === 'rules' ? (
          <div className="space-y-4">
            {progress.map((prog) => {
              const isCompleted = prog.reward_unlocked;
              const isClaimed = prog.reward_claimed;
              const inviteRatio = Math.min(prog.completed_invites, prog.level.required_invites) / prog.level.required_invites;
              const percentage = Math.round(inviteRatio * 100);
              
              return (
                <div key={prog.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">Level {prog.level.level}</h3>
                      <p className="text-xs text-gray-500 mt-1">Invites required: {prog.level.required_invites}</p>
                      <p className="text-xs text-gray-500">Min. Deposit: ₹{prog.level.required_deposit_amount}</p>
                    </div>
                    <div className="bg-red-50 text-red-600 px-3 py-1.5 rounded-full font-bold text-lg shadow-sm">
                      ₹{prog.level.reward_amount}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4 mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-600 font-medium">Progress</span>
                      <span className="text-[#f04c55] font-bold">{prog.completed_invites} / {prog.level.required_invites}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-red-400 to-[#f04c55] h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-5 flex justify-end">
                    {isClaimed ? (
                      <div className="flex items-center text-green-500 font-medium text-sm bg-green-50 px-4 py-2 rounded-full">
                        <CheckCircle2 size={16} className="mr-1.5" /> Claimed
                      </div>
                    ) : isCompleted ? (
                      <button 
                        onClick={() => handleClaim(prog.level_id)}
                        className="bg-[#f04c55] text-white px-6 py-2 rounded-full font-medium text-sm shadow-md hover:bg-red-600 transition-colors animate-pulse"
                      >
                        Claim Reward
                      </button>
                    ) : (
                      <div className="flex items-center text-gray-400 font-medium text-sm bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                        <Lock size={16} className="mr-1.5" /> Unfinished
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {history.length > 0 ? (
              history.map((record) => (
                <div key={record.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 text-green-600 p-2 rounded-full">
                      <Gift size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">Bonus Level {record.level?.level}</p>
                      <p className="text-xs text-gray-500">{new Date(record.claimed_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-500 text-lg">+₹{record.amount}</p>
                    <p className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded inline-block mt-1">Claimed</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 text-gray-500 flex flex-col items-center">
                <Gift size={48} className="text-gray-300 mb-3" />
                <p>No invitation records yet.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
