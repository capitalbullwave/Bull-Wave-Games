"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Mail, Trash2, Megaphone } from "lucide-react";
import { toast } from "sonner";

export default function AnnouncementPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"notification" | "information">("notification");

  // Mock Data
  const [notifications, setNotifications] = useState([
    { id: 1, title: "LOGIN NOTIFICATION", date: "2026-05-28 14:14:02", content: "Your account has been login at 2026-05-28 14:14:02" },
    { id: 2, title: "LOGIN NOTIFICATION", date: "2026-05-27 11:54:05", content: "Your account has been login at 2026-05-27 11:54:05" },
    { id: 3, title: "LOGIN NOTIFICATION", date: "2026-05-26 16:12:24", content: "Your account has been login at 2026-05-26 16:12:24" },
    { id: 4, title: "LOGIN NOTIFICATION", date: "2026-05-26 15:27:35", content: "Your account has been login at 2026-05-26 15:27:35" },
    { id: 5, title: "LOGIN NOTIFICATION", date: "2026-05-26 14:52:10", content: "Your account has been login at 2026-05-26 14:52:10" },
  ]);

  const informationList = [
    {
      id: 1,
      title: "ANNOUNCEMENT ! ! !",
      date: "2023-08-08 22:19:25",
      content: "The website upgrade is complete. Before logging in, clear the browser cache. Add member betting rewards and VIP level rewards"
    },
    {
      id: 2,
      title: "⭐ Official Website ⭐",
      date: "2023-01-27 13:33:00",
      content: "To visit our official website, be sure to use the link below, https://www.bullwavegames.com/ Please remember! Make sure not provide personal data and personal transactions in any form and for any reason to other parties on behalf of BullWaveGames. Our side does not make private chats or calls to all members. Please inform all Referrals/other Members about this to avoid fraud. Thank you for your attention and cooperation."
    },
    {
      id: 3,
      title: "Safe Recharge Tips",
      date: "2022-05-28 12:49:52",
      content: "All Recharge payment methods on the BullWaveGames site are only available in the Recharge menu on the official website. Make sure to make a Recharge only through our official website and don't trust any party on behalf of BullWaveGames. If you find any discrepancies or suspicious behavior, please contact our customer service immediately for confirmation. We urge all members not to believe or be tempted by other promotions outside our site, Thank You"
    }
  ];

  const handleDelete = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success("Notification deleted");
  };

  return (
    <div className="bg-[#f4f5f7] min-h-screen pb-10 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="h-14 bg-white border-b border-slate-100 flex items-center px-4 relative shrink-0">
        <button 
          onClick={() => router.back()} 
          className="p-1 hover:bg-slate-100 rounded-xl text-slate-650 active:scale-95 transition-all flex items-center justify-center"
        >
          <ChevronLeft size={22} className="stroke-[2.5]" />
        </button>
        <span className="text-[17px] font-semibold text-slate-800 absolute left-1/2 -translate-x-1/2">
          Notification
        </span>
      </div>

      {/* Tabs */}
      <div className="px-4 py-4 shrink-0">
        <div className="flex bg-white rounded-lg overflow-hidden shadow-sm p-1">
          <button
            onClick={() => setActiveTab("notification")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-colors ${
              activeTab === "notification" 
                ? "bg-[#800000] text-white" 
                : "bg-transparent text-slate-500 hover:bg-slate-50"
            }`}
          >
            Notification
          </button>
          <button
            onClick={() => setActiveTab("information")}
            className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-colors ${
              activeTab === "information" 
                ? "bg-[#800000] text-white" 
                : "bg-transparent text-slate-500 hover:bg-slate-50"
            }`}
          >
            Information
          </button>
        </div>
      </div>

      {/* List Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {activeTab === "notification" ? (
          <div className="space-y-3">
            {notifications.length === 0 && (
              <div className="text-center text-slate-400 text-sm py-10">No notifications</div>
            )}
            {notifications.map((notif) => (
              <div key={notif.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100/50">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-slate-200/50 flex items-center justify-center text-slate-500 shrink-0">
                      <Mail size={12} className="fill-slate-500 text-white" />
                    </div>
                    <span className="font-black text-[13px] text-slate-800">{notif.title}</span>
                  </div>
                  <button 
                    onClick={() => handleDelete(notif.id)}
                    className="p-1 text-red-400 hover:bg-red-50 rounded-lg active:scale-90 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="mt-1">
                  <p className="text-[11px] text-slate-400 font-medium mb-2">{notif.date}</p>
                  <p className="text-xs text-slate-500">{notif.content}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {informationList.map((info) => (
              <div key={info.id} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100/50">
                <div className="flex items-center gap-2 mb-3">
                  <Megaphone size={18} className="text-[#800000] fill-[#800000]/10" />
                  <span className="font-semibold text-slate-800 text-[15px]">{info.title}</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-3">
                  {info.content}
                </p>
                <p className="text-[11px] text-slate-400 font-medium">{info.date}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
