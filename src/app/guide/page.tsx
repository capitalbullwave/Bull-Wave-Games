"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronDown, HelpCircle } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function GuidePage() {
  const router = useRouter();
  const { language } = useAuthStore();
  const [openSection, setOpenSection] = useState<number | null>(1);

  // Translations
  const t = {
    title: language === "hi" ? "शुरुआती गाइड" : "Beginner's Guide",
    guides: [
      {
        id: 1,
        title: language === "hi" ? "साइन अप (रजिस्टर) कैसे करें?" : "How to Sign Up (Register)?",
        content: language === "hi" ? 
          "1. ऐप खोलें और 'रजिस्टर' या 'साइन अप' बटन पर क्लिक करें।\n2. अपना मोबाइल नंबर दर्ज करें।\n3. अपने मोबाइल पर प्राप्त OTP दर्ज करें।\n4. एक मजबूत पासवर्ड सेट करें।\n5. 'सबमिट' पर क्लिक करें और आपका अकाउंट बन जाएगा।" : 
          "1. Open the app and click on the 'Register' or 'Sign Up' button.\n2. Enter your mobile number.\n3. Enter the OTP received on your mobile.\n4. Set a strong password.\n5. Click 'Submit' and your account will be created."
      },
      {
        id: 2,
        title: language === "hi" ? "लॉगिन कैसे करें?" : "How to Login?",
        content: language === "hi" ? 
          "1. लॉगिन पेज पर जाएं।\n2. अपना पंजीकृत मोबाइल नंबर और पासवर्ड दर्ज करें।\n3. 'लॉगिन' बटन पर क्लिक करें और आप अपने डैशबोर्ड पर पहुंच जाएंगे।" : 
          "1. Go to the login page.\n2. Enter your registered mobile number and password.\n3. Click the 'Login' button and you will access your dashboard."
      },
      {
        id: 3,
        title: language === "hi" ? "पैसे कैसे जोड़ें (डिपॉजिट)?" : "How to Add Money (Deposit)?",
        content: language === "hi" ? 
          "1. 'वॉलेट' या 'डिपॉजिट' सेक्शन में जाएं।\n2. वह राशि दर्ज करें जो आप जोड़ना चाहते हैं।\n3. अपना पसंदीदा भुगतान तरीका (UPI, Paytm, PhonePe, Bank Transfer) चुनें।\n4. स्क्रीन पर दिए गए निर्देशों का पालन करते हुए भुगतान पूरा करें।\n5. भुगतान सफल होने के कुछ ही मिनटों में राशि आपके वॉलेट में आ जाएगी।" : 
          "1. Go to the 'Wallet' or 'Deposit' section.\n2. Enter the amount you want to add.\n3. Choose your preferred payment method (UPI, Paytm, PhonePe, Bank Transfer).\n4. Complete the payment following the on-screen instructions.\n5. Upon success, the amount will reflect in your wallet within minutes."
      },
      {
        id: 4,
        title: language === "hi" ? "गेम कैसे खेलें?" : "How to Play Games?",
        content: language === "hi" ? 
          "1. लॉबी में अपने पसंदीदा गेम (जैसे Color Prediction, Wingo, Aviator) का चयन करें।\n2. अपनी भविष्यवाणी (रंग या संख्या) चुनें।\n3. अपनी दांव राशि का चयन करें और पुष्टि करें।\n4. टाइमर खत्म होने का इंतजार करें। यदि आपकी भविष्यवाणी सही है, तो आप जीत जाएंगे!" : 
          "1. Select your favorite game from the lobby (e.g. Color Prediction, Wingo, Aviator).\n2. Choose your prediction (color or number).\n3. Select your bet amount and confirm.\n4. Wait for the countdown. If your prediction is correct, you win!"
      },
      {
        id: 5,
        title: language === "hi" ? "पैसे कैसे निकालें (विथड्रॉ)?" : "How to Withdraw Money?",
        content: language === "hi" ? 
          "1. 'वॉलेट' सेक्शन में 'विथड्रॉ' पर क्लिक करें।\n2. निकासी राशि दर्ज करें (न्यूनतम सीमा का ध्यान रखें)।\n3. अपना बैंक अकाउंट विवरण या UPI ID जोड़ें/चुनें।\n4. अपना विथड्रॉल पासवर्ड दर्ज करें और सबमिट करें।\n5. राशि जल्द ही आपके बैंक खाते में जमा कर दी जाएगी।" : 
          "1. Click on 'Withdraw' in the 'Wallet' section.\n2. Enter the withdrawal amount (note the minimum limit).\n3. Add/select your Bank Account details or UPI ID.\n4. Enter your withdrawal password and submit.\n5. The amount will be credited to your bank account shortly."
      },
      {
        id: 6,
        title: language === "hi" ? "लॉगआउट कैसे करें?" : "How to Logout?",
        content: language === "hi" ? 
          "1. 'प्रोफाइल' या 'अकाउंट' सेक्शन में जाएं।\n2. नीचे स्क्रॉल करें और 'लॉगआउट' या 'सुरक्षित रूप से बाहर निकलें' बटन पर क्लिक करें।\n3. पुष्टि करें, और आप सफलतापूर्वक लॉगआउट हो जाएंगे।" : 
          "1. Go to the 'Profile' or 'Account' section.\n2. Scroll to the bottom and click the 'Logout' or 'Secure Exit' button.\n3. Confirm, and you will be successfully logged out."
      }
    ]
  };

  const toggleSection = (id: number) => {
    setOpenSection(openSection === id ? null : id);
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
          {t.title}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        
        {/* Banner Card */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-5 shadow-sm text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-black mb-1">{language === "hi" ? "शुरुआत कैसे करें?" : "How to get started?"}</h2>
            <p className="text-xs font-medium text-amber-100">
              {language === "hi" ? "बुल वेव गेम्स में आपका स्वागत है। यहां आपके सभी सवालों के जवाब हैं।" : "Welcome to Bull Wave Games. Here are the answers to all your questions."}
            </p>
          </div>
          <HelpCircle size={80} className="absolute -right-4 -bottom-4 text-white opacity-20 rotate-12" />
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {t.guides.map((guide) => (
            <div 
              key={guide.id} 
              className={`bg-white rounded-xl shadow-sm border transition-all duration-300 overflow-hidden ${openSection === guide.id ? 'border-amber-200' : 'border-slate-100/50'}`}
            >
              <button
                onClick={() => toggleSection(guide.id)}
                className="w-full px-4 py-4 flex items-center justify-between text-left focus:outline-none"
              >
                <span className="font-bold text-slate-800 text-sm pr-4">
                  {guide.title}
                </span>
                <ChevronDown 
                  size={18} 
                  className={`text-slate-400 shrink-0 transition-transform duration-300 ${openSection === guide.id ? 'rotate-180 text-amber-500' : ''}`} 
                />
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out ${
                  openSection === guide.id ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="px-4 pb-4 pt-0 border-t border-slate-50">
                  <div className="text-xs text-slate-500 leading-relaxed font-medium whitespace-pre-line mt-3">
                    {guide.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
