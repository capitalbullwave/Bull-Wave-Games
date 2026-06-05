"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Target, Loader2, Sparkles } from 'lucide-react';
import { apiRequest } from '@/lib/api';
import toast from 'react-hot-toast';

export default function InviteWheelPage() {
  const router = useRouter();
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [wonAmount, setWonAmount] = useState(0);

  const prizes = [0, 5, 10, 20, 50, 100, 500];
  const sliceAngle = 360 / prizes.length;
  
  // Vibrant colors for the wheel slices
  const colors = [
    '#f05151', // red
    '#ff9f43', // orange
    '#0abde3', // blue
    '#1dd1a1', // green
    '#5f27cd', // purple
    '#e15f41', // dark orange
    '#ff9ff3', // pink
  ];

  const handleSpin = async () => {
    if (isSpinning) return;
    
    try {
      setIsSpinning(true);
      setShowModal(false);

      // Call API to get random prize
      const response = await apiRequest<{prize: number, detail: string}>('/rewards/spin-wheel', {
        method: 'POST'
      });

      const winningPrize = response.prize;
      const prizeIndex = prizes.indexOf(winningPrize);
      
      // Calculate rotation
      // Center of the winning slice
      const centerOfSlice = (prizeIndex * sliceAngle) + (sliceAngle / 2);
      // We want to rotate clockwise so that the centerOfSlice lands at the top (pointer position).
      // Top is 0 degrees. So we rotate by (360 - centerOfSlice).
      // Add 5 full rotations for effect.
      const targetRotation = rotation + (360 * 5) + (360 - centerOfSlice) - (rotation % 360);

      setRotation(targetRotation);
      setWonAmount(winningPrize);

      // Wait for animation to finish (5 seconds)
      setTimeout(() => {
        setIsSpinning(false);
        setShowModal(true);
      }, 5000);

    } catch (error: any) {
      toast.error(error.message || 'Failed to spin the wheel');
      setIsSpinning(false);
    }
  };

  // Generate conic gradient string
  const conicGradient = prizes.map((_, i) => {
    const startAngle = i * sliceAngle;
    const endAngle = (i + 1) * sliceAngle;
    return `${colors[i]} ${startAngle}deg ${endAngle}deg`;
  }).join(', ');

  return (
    <div className="min-h-screen bg-[#f0f3f7] pb-24 font-sans text-gray-800">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center sticky top-0 z-50 shadow-sm">
        <button onClick={() => router.back()} className="mr-4 active:scale-90 transition-transform">
          <ChevronLeft size={24} className="text-[#800000]" />
        </button>
        <h1 className="text-[20px] flex-1 text-center text-[#800000] font-medium pr-8">Invite Wheel</h1>
      </div>

      <div className="p-4 flex flex-col items-center pt-8">
        <div className="bg-gradient-to-r from-[#D4AF37] to-[#F1C40F] text-[#800000] px-6 py-1.5 rounded-full font-black uppercase text-[14px] shadow-md border-2 border-white mb-8 flex items-center gap-2">
          <Sparkles size={16} />
          Spin & Win Big!
          <Sparkles size={16} />
        </div>

        {/* Wheel Container */}
        <div className="relative w-[300px] h-[300px] mb-12">
          
          {/* Pointer */}
          <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 z-20 drop-shadow-md">
            <div className="w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[30px] border-t-red-600" />
            <div className="w-8 h-8 bg-red-600 rounded-full absolute -top-3 left-1/2 -translate-x-1/2 border-4 border-white shadow-sm" />
          </div>

          {/* The Wheel */}
          <div 
            className="w-full h-full rounded-full border-[8px] border-white shadow-[0_0_20px_rgba(0,0,0,0.15)] overflow-hidden relative transition-transform duration-[5000ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
            style={{ 
              background: `conic-gradient(${conicGradient})`,
              transform: `rotate(${rotation}deg)` 
            }}
          >
            {/* Prize Labels */}
            {prizes.map((prize, i) => {
              const rotate = (i * sliceAngle) + (sliceAngle / 2);
              
              return (
                <div 
                  key={i}
                  className="absolute left-[142px] top-[132px] w-[142px] h-[20px] origin-left flex items-center justify-end pr-6"
                  style={{ transform: `rotate(${rotate - 90}deg)` }}
                >
                  <span className="text-white font-black text-[16px] drop-shadow-md">
                    ₹{prize}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Center Button */}
          <button 
            onClick={handleSpin}
            disabled={isSpinning}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl border-[6px] border-[#800000] z-10 active:scale-95 transition-transform"
          >
            <div className="bg-gradient-to-b from-[#800000] to-[#600000] w-full h-full rounded-full flex flex-col items-center justify-center">
              <span className="text-[#D4AF37] font-black text-[18px]">SPIN</span>
            </div>
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-white rounded-2xl shadow-sm p-4 w-full border border-gray-100 mt-4">
          <h3 className="font-bold text-[#800000] text-[15px] mb-2 text-center border-b pb-2">Rules & Regulations</h3>
          <ul className="text-[12px] text-gray-600 space-y-2 list-disc pl-4">
            <li>Cost per spin is ₹20 from your main or bonus wallet.</li>
            <li>You can win up to ₹500 in a single spin!</li>
            <li>All winnings are directly credited to your bonus wallet.</li>
            <li>Prizes are subject to change during special events.</li>
          </ul>
        </div>
      </div>

      {/* Win Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 flex flex-col items-center shadow-2xl transform animate-in zoom-in duration-300">
            <div className="w-20 h-20 rounded-full bg-gradient-to-b from-[#D4AF37] to-[#F1C40F] flex items-center justify-center mb-4 shadow-lg border-4 border-white">
              {wonAmount > 0 ? <Sparkles size={36} className="text-white" /> : <Target size={36} className="text-white" />}
            </div>
            
            <h2 className="text-[24px] font-black text-[#800000] mb-2">
              {wonAmount > 0 ? 'Congratulations!' : 'Better Luck Next Time!'}
            </h2>
            
            <p className="text-[15px] text-gray-600 text-center mb-6">
              {wonAmount > 0 
                ? `You have won a massive ₹${wonAmount.toFixed(2)} bonus. It has been credited to your wallet.`
                : 'You did not win anything this time. Try again for a chance to win up to ₹500!'}
            </p>
            
            <button 
              onClick={() => setShowModal(false)}
              className="w-full bg-gradient-to-r from-[#800000] to-[#600000] text-white font-bold py-3.5 rounded-xl shadow-md active:scale-95 transition-transform"
            >
              OK, Thanks!
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
