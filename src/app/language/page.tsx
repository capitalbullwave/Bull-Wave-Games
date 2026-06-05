"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function LanguagePage() {
  const { language, setLanguage } = useAuthStore();
  const router = useRouter();

  return (
    <div className="bg-[#f4f5f7] min-h-screen pb-10 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Centered navigation header bar */}
      <div className="h-14 bg-white border-b border-slate-100 flex items-center px-4 relative shrink-0">
        <button 
          onClick={() => router.back()} 
          className="p-1 hover:bg-slate-100 rounded-xl text-slate-650 active:scale-95 transition-all flex items-center justify-center"
        >
          <ChevronLeft size={22} className="stroke-[2.5]" />
        </button>
        <span className="text-sm font-black text-slate-800 absolute left-1/2 -translate-x-1/2">
          {language === "hi" ? "भाषा" : "Language"}
        </span>
      </div>

      {/* Page body content */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => {
              setLanguage("en");
              toast.success("Language changed to English");
              router.back();
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
              <div className="w-5 h-5 rounded-full bg-[#800000] flex items-center justify-center text-white shrink-0">
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
              toast.success("भाषा बदलकर हिंदी कर दी गई है");
              router.back();
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
              <div className="w-5 h-5 rounded-full bg-[#800000] flex items-center justify-center text-white shrink-0">
                <CheckCircle2 size={14} className="stroke-[3]" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full border border-slate-300 shrink-0" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
