"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Award, Gift, CheckCircle2, Loader2, Sparkles, AlertCircle, History } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";

interface Activity {
  id: number;
  title: string;
  targetAmount: number;
  currentAmount: number;
  rewardAmount: number;
  completed: boolean;
  claimed: boolean;
  activity_type: string;
  is_active: boolean;
}

interface ActivityResponse {
  todayBonus: number;
  totalBonus: number;
  activities: Activity[];
}

export default function ActivityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ActivityResponse | null>(null);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"activity" | "history">("activity");

  const fetchActivities = async () => {
    try {
      const response = await apiRequest("/activity/list");
      if (response && response.data) {
        setData(response.data);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load activities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const handleClaim = async (taskId: number) => {
    if (claimingId) return;
    setClaimingId(taskId);
    try {
      await apiRequest(`/activity/claim/${taskId}`, { method: "POST" });
      toast.success("Reward claimed successfully! 🎉");
      // Update local state to reflect claimed status without reloading fully
      setData((prev) => {
        if (!prev) return prev;
        const updatedActivities = prev.activities.map(a => 
          a.id === taskId ? { ...a, claimed: true } : a
        );
        const task = prev.activities.find(a => a.id === taskId);
        return {
          ...prev,
          todayBonus: prev.todayBonus + (task?.rewardAmount || 0),
          totalBonus: prev.totalBonus + (task?.rewardAmount || 0),
          activities: updatedActivities
        };
      });
    } catch (err: any) {
      toast.error(err.message || "Failed to claim reward");
    } finally {
      setClaimingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5f8] pb-24 text-slate-800 font-sans selection:bg-[#D4AF37]/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white text-[#800000] shadow-sm border-b border-gray-100">
        <div className="flex items-center justify-between px-4 h-14">
          <button 
            onClick={() => router.back()} 
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-black tracking-wide uppercase flex items-center gap-2">
            <Award className="text-[#D4AF37]" size={20} />
            Activity Award
          </h1>
          <button 
            onClick={() => setActiveTab(activeTab === "activity" ? "history" : "activity")}
            className="p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            {activeTab === "activity" ? <History size={20} /> : <Award size={20} />}
          </button>
        </div>
      </header>

      {/* Hero Banner Area */}
      <div className="bg-gradient-to-b from-[#b30000] to-[#800000] px-4 pt-6 pb-12 text-white relative overflow-hidden rounded-[16px] shadow-sm mx-3 mt-3">
        {/* Subtle background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#D4AF37]/10 rounded-full blur-2xl translate-y-1/4 -translate-x-1/4 pointer-events-none" />

        <div className="relative z-10 grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-3xl flex flex-col items-center justify-center text-center shadow-inner">
            <span className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">Today's Bonus</span>
            <div className="text-2xl font-black text-[#F1D279] tracking-tight">
              ₹{data ? data.todayBonus.toLocaleString() : "0"}
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-3xl flex flex-col items-center justify-center text-center shadow-inner">
            <span className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">Total Bonus</span>
            <div className="text-2xl font-black text-white tracking-tight">
              ₹{data ? data.totalBonus.toLocaleString() : "0"}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="px-4 -mt-6 relative z-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="w-10 h-10 text-[#800000] animate-spin" />
            <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">Loading Rewards...</p>
          </div>
        ) : activeTab === "history" ? (
          <ActivityHistoryView />
        ) : data && data.activities.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence>
              {data.activities.map((activity, index) => {
                const progressPercentage = Math.min((activity.currentAmount / activity.targetAmount) * 100, 100);
                const isCompleted = activity.completed;
                const isClaimed = activity.claimed;

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    key={activity.id}
                    className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100/50">
                          <Gift className="text-amber-500" size={24} />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-800 text-sm leading-tight mb-1">{activity.title}</h3>
                          <p className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 uppercase">
                            <span className="px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600">{activity.activity_type}</span>
                            Task
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[#800000] font-black text-lg">₹{activity.rewardAmount}</div>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Reward</div>
                      </div>
                    </div>

                    {/* Progress Area */}
                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100/60">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Progress</span>
                        <span className="text-xs font-black text-slate-700">
                          {activity.currentAmount.toLocaleString()} / {activity.targetAmount.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progressPercentage}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full rounded-full transition-all ${
                            isCompleted 
                              ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                              : "bg-gradient-to-r from-[#D4AF37] to-amber-500"
                          }`}
                        />
                      </div>
                    </div>

                    {/* Action Area */}
                    <div className="pt-1">
                      {isClaimed ? (
                        <div className="w-full py-3 rounded-xl bg-slate-100 text-slate-400 font-extrabold text-xs uppercase flex items-center justify-center gap-2 border border-slate-200/60">
                          <CheckCircle2 size={16} />
                          Claimed Successfully
                        </div>
                      ) : isCompleted ? (
                        <button
                          onClick={() => handleClaim(activity.id)}
                          disabled={claimingId === activity.id}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-[#800000] to-[#b30000] text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-rose-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 relative overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent opacity-50" />
                          {claimingId === activity.id ? (
                            <Loader2 className="animate-spin" size={16} />
                          ) : (
                            <>
                              <Sparkles size={16} className="text-[#F1D279]" />
                              Claim Reward
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="w-full py-3 rounded-xl bg-amber-50 text-amber-700/60 font-extrabold text-xs uppercase flex items-center justify-center gap-2 border border-amber-200/50">
                          <Loader2 size={14} className="animate-spin" />
                          In Progress
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-sm border border-slate-100 mt-4">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
              <AlertCircle size={32} />
            </div>
            <h3 className="text-lg font-black text-slate-700 mb-2">No Active Tasks</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              There are currently no active reward tasks available. Please check back later!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

// Sub-component for History view
function ActivityHistoryView() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await apiRequest("/activity/history");
        if (response && response.data) {
          setHistory(response.data);
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to load history");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-8 h-8 text-[#800000] animate-spin" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-sm border border-slate-100 mt-4">
        <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 mb-4">
          <History size={32} />
        </div>
        <h3 className="text-lg font-black text-slate-700 mb-2">No History Yet</h3>
        <p className="text-sm text-slate-500 font-medium leading-relaxed">
          You haven't claimed any activity rewards. Start playing to complete tasks!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mt-4">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
        <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">Reward Ledger</h3>
      </div>
      <div className="divide-y divide-slate-100">
        {history.map((record) => (
          <div key={record.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <CheckCircle2 className="text-emerald-500" size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{record.title}</p>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                  {new Date(record.claimed_at).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-sm font-black text-[#800000]">+₹{record.reward_amount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
