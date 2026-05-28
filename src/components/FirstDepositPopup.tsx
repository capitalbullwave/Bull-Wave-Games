import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

interface FirstDepositPopupProps {
  isOpen: boolean;
  onClose: (dontShowToday: boolean) => void;
}

const PLANS = [
  { depositAmount: 1000000, bonus: 5888.00 },
  { depositAmount: 500000, bonus: 3888.00 },
  { depositAmount: 100000, bonus: 800.00 },
  { depositAmount: 50000, bonus: 400.00 },
  { depositAmount: 10000, bonus: 100.00 },
];

export function FirstDepositPopup({ isOpen, onClose }: FirstDepositPopupProps) {
  const [dontShowToday, setDontShowToday] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleDepositClick = () => {
    onClose(dontShowToday);
    router.push("/wallet/deposit");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/70 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-[85%] max-w-[320px] rounded-[16px] bg-white flex flex-col"
          style={{ maxHeight: '75vh' }}
        >
          {/* Header */}
          <div className="bg-[#fb4b4e] pt-5 pb-3 px-4 text-center shrink-0 rounded-t-[16px]">
            <h2 className="text-white text-[16px] font-black tracking-tight mb-1">
              Extra first deposit bonus
            </h2>
            <p className="text-white/90 text-[11px] font-medium">
              Each account can only receive rewards once
            </p>
          </div>

          {/* List of Plans */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 bg-[#f5f5f5] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {PLANS.map((plan, index) => (
              <div key={index} className="bg-white rounded-[12px] p-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-50">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-slate-800 text-[13px] font-medium">
                    First deposit<span className="text-[#fca016] ml-1">{plan.depositAmount}</span>
                  </h3>
                  <span className="text-[#fca016] text-[12px] font-semibold">
                    + ₹{plan.bonus.toFixed(2)}
                  </span>
                </div>
                <p className="text-[#9ea3b1] text-[10px] leading-snug mb-2.5">
                  Deposit {plan.depositAmount} for the first time and you will receive {plan.bonus} bonus
                </p>
                
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 bg-[#e0e5eb] rounded-full h-[16px] flex items-center justify-center">
                    <span className="text-[9px] font-bold text-[#6a7081]">
                      0/{plan.depositAmount}
                    </span>
                  </div>
                  <button 
                    onClick={handleDepositClick}
                    className="border border-[#fca016] text-[#fca016] px-4 py-0.5 rounded-full text-[12px] font-medium active:scale-95 transition-transform"
                  >
                    Deposit
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Actions */}
          <div className="bg-white px-3 py-2.5 shrink-0 flex items-center justify-between rounded-b-[16px]">
            <label className="flex items-center gap-1.5 cursor-pointer group">
              <div className="relative flex items-center justify-center w-4 h-4">
                <input 
                  type="checkbox" 
                  checked={dontShowToday}
                  onChange={(e) => setDontShowToday(e.target.checked)}
                  className="peer appearance-none w-4 h-4 border border-slate-300 rounded-full checked:bg-white checked:border-[#fb4b4e] transition-colors" 
                />
                <div className="absolute hidden peer-checked:block w-2.5 h-2.5 bg-[#fb4b4e] rounded-full" />
              </div>
              <span className="text-[#9ea3b1] text-[11px] font-medium">No more reminders today</span>
            </label>
            <button className="bg-[#fb4b4e] text-white px-5 py-1 rounded-full text-[13px] font-bold shadow-md active:scale-95 transition-transform">
              Activity
            </button>
          </div>
        </motion.div>

        {/* Close Button below the modal */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => onClose(dontShowToday)}
          className="mt-6 w-[38px] h-[38px] rounded-full border border-white/80 flex items-center justify-center text-white/90 hover:text-white hover:border-white transition-all bg-black/20"
        >
          <X size={20} strokeWidth={1.5} />
        </motion.button>
      </div>
    </AnimatePresence>
  );
}
