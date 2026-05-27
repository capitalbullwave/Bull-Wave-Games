"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, FileText, Bookmark, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  const router = useRouter();
  const [agreementType, setAgreementType] = useState<"confidentiality" | "risk" | null>(null);

  // 1. FULL PAGE CONFIDENTIALITY AGREEMENT VIEW (Matching user screenshot)
  if (agreementType === "confidentiality") {
    return (
      <div className="min-h-screen bg-white flex flex-col -mx-4 -mt-4 animate-in slide-in-from-right duration-300 pb-10">

        {/* White header with sticky shadow */}
        <div className="h-14 bg-white border-b border-slate-200/60 flex items-center justify-between px-4 sticky top-0 z-35 shrink-0">
          <button
            onClick={() => setAgreementType(null)}
            className="p-1 text-slate-700 hover:opacity-80 transition-opacity flex items-center justify-center"
          >
            <ChevronLeft size={24} className="stroke-[2.5]" />
          </button>
          <span className="text-base font-extrabold text-slate-800 absolute left-1/2 -translate-x-1/2">Confidentiality Agreement</span>
          <div className="w-8" />
        </div>

        {/* Scrollable text container */}
        <div className="flex-1 overflow-y-auto px-5 py-6 text-slate-600 text-xs leading-relaxed space-y-5 text-left bg-white">
          <h1 className="text-lg font-black text-slate-855 tracking-wide text-center">Confidentiality Agreement</h1>
          <h2 className="text-sm font-bold text-slate-700 tracking-wide text-center">Privacy Policy</h2>

          <p>This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.</p>

          <div className="space-y-2">
            <h3 className="font-extrabold text-slate-900 border-b border-slate-100 pb-1">Interpretation and Definitions</h3>
            <p className="font-bold text-slate-800">For the purposes of this Privacy Policy:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              <li><strong>You</strong> means the individual accessing or using the Service.</li>
              <li><strong>Company</strong> (referred to as either &quot;the Company&quot;, &quot;We&quot;, &quot;Us&quot; or &quot;Our&quot;) refers to Bull Wave Games.</li>
              <li><strong>Affiliate</strong> means an entity that controls, is controlled by or is under common control with a party.</li>
              <li><strong>Account</strong> means a unique account created for You to access our Service.</li>
              <li><strong>Website</strong> refers to Bull Wave Games.</li>
              <li><strong>Country</strong> refers to India.</li>
              <li><strong>Service Provider</strong> means any natural or legal person who processes the data on behalf of the Company.</li>
              <li><strong>Third-party Social Media Service</strong> refers to any website or social network website through which a User can log in or create an account.</li>
              <li><strong>Personal Data</strong> means any information that relates to an identified or identifiable individual.</li>
              <li><strong>Cookies</strong> are small files placed on Your device.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-extrabold text-slate-900 border-b border-slate-100 pb-1">Collecting and Using Your Personal Data</h3>
            <p className="font-bold text-slate-800">Types of Personal Data Collected:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Email address</li>
              <li>First name and last name</li>
              <li>Phone number</li>
              <li>Address, State, Province, ZIP/Postal code, City</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-extrabold text-slate-800">Usage Data</h3>
            <p>Usage Data is collected automatically when using the Service including IP address, browser type, browser version, pages visited, time/date of visit, time spent, device identifiers, and diagnostic data.</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-extrabold text-slate-800">Tracking Technologies and Cookies</h3>
            <p>We use Cookies and similar tracking technologies to track activity on Our Service and store certain information. Cookies may be persistent or session cookies.</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-extrabold text-slate-900 border-b border-slate-100 pb-1">Use of Your Personal Data</h3>
            <p className="font-bold text-slate-800">The Company may use Personal Data:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide and maintain our Service</li>
              <li>To manage Your Account</li>
              <li>For performance of a contract</li>
              <li>To contact You</li>
              <li>To provide news, offers and updates</li>
              <li>To manage Your requests</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-extrabold text-slate-800">Sharing of Personal Data</h3>
            <p>We may share Your personal information with Service Providers, affiliates, business partners, other users where applicable, or in business transfers.</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-extrabold text-slate-800">Security</h3>
            <p>The security of Your Personal Data is important to Us, but no method of transmission over the Internet is 100% secure.</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-extrabold text-slate-800">Children&apos;s Privacy</h3>
            <p>Our Service does not address anyone under the age of 13.</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-extrabold text-slate-850">Links to Other Websites</h3>
            <p>Our Service may contain links to other websites not operated by Us.</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-extrabold text-slate-855">Changes to this Privacy Policy</h3>
            <p>We may update Our Privacy Policy from time to time.</p>
          </div>

          <div className="space-y-3 border-t border-slate-100 pt-4">
            <h3 className="font-extrabold text-slate-900">Contact Us</h3>
            <p>If you have any questions, contact:</p>
            <p className="font-medium text-slate-800">Email: <span className="text-blue-600 underline">capitalbullwave@gmail.com</span></p>
            <p className="font-medium text-slate-800">Phone: 9616212526</p>
          </div>

          <div className="text-center pt-6 text-slate-400 border-t border-slate-100 text-[10px] font-medium leading-loose">
            By visiting this page on our website: <br />
            <span className="text-blue-500 underline font-bold">https://bullwavegames.in/</span>
          </div>

        </div>
      </div>
    );
  }

  // 2. FULL PAGE RISK DISCLOSURE VIEW
  if (agreementType === "risk") {
    return (
      <div className="min-h-screen bg-white flex flex-col -mx-4 -mt-4 animate-in slide-in-from-right duration-300 pb-10">

        {/* Header */}
        <div className="h-14 bg-white border-b border-slate-200/60 flex items-center justify-between px-4 sticky top-0 z-35 shrink-0">
          <button
            onClick={() => setAgreementType(null)}
            className="p-1 text-slate-700 hover:opacity-80 transition-opacity flex items-center justify-center"
          >
            <ChevronLeft size={24} className="stroke-[2.5]" />
          </button>
          <span className="text-base font-extrabold text-slate-800 absolute left-1/2 -translate-x-1/2">Risk Disclosure</span>
          <div className="w-8" />
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-6 text-slate-650 text-xs leading-relaxed space-y-5 text-left bg-white">
          <h1 className="text-lg font-black text-slate-800 tracking-wide text-center">Risk Disclosure Agreement</h1>
          <h2 className="text-sm font-bold text-slate-500 tracking-wide text-center">Bull Wave Games Safety Node</h2>

          <p>Please read this Risk Disclosure Agreement carefully before participating in any predictions or gaming events on the Service.</p>

          <div className="space-y-2">
            <h3 className="font-extrabold text-slate-900 border-b border-slate-100 pb-1">1. Nature of Interactive Predictions</h3>
            <p>Interactive color, Wingo, and cluster predictions involve real-time system counts and probability models. Participating in predictions involves financial entry parameters, which can result in both gain and loss elements.</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-extrabold text-slate-900 border-b border-slate-100 pb-1">2. Client Responsibility</h3>
            <p>Users must evaluate their personal budget models and maintain full self-control. Bull Wave Game provides custom safety balance buffers to encourage clean, healthy interactive habits.</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-extrabold text-slate-900 border-b border-slate-100 pb-1">3. Hardware and Network Interactivity</h3>
            <p>Platform counts rely on real-time internet connectivity. Bull Wave Game utilizes redundant fail-safe APIs, but network variations can impact live updates. Decisions based on historical predictions are carried out at user discretion.</p>
          </div>

          <div className="text-center pt-6 text-slate-400 border-t border-slate-100 text-[10px] font-medium leading-loose">
            By visiting this page on our website: <br />
            <span className="text-blue-500 underline font-bold">https://bullwavegames.in/</span>
          </div>

        </div>
      </div>
    );
  }

  // 3. MAIN ABOUT US SECTIONS
  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col -mx-4 -mt-4 animate-in fade-in duration-300">

      {/* Premium Red-Orange Coral Gradient Header */}
      <div className="h-14 bg-gradient-to-r from-[#ff6b5a] to-[#ff4d4d] flex items-center justify-between px-4 z-30 shadow-sm relative shrink-0">
        <button
          onClick={() => router.push("/profile")}
          className="p-1 text-white hover:opacity-80 transition-opacity flex items-center justify-center"
        >
          <ChevronLeft size={24} />
        </button>
        <span className="text-base font-black text-white absolute left-1/2 -translate-x-1/2">About us</span>
        <div className="w-8" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 space-y-6">

        {/* Futuristic Glassmorphism Tech Workspace Illustration */}
        <div className="w-full bg-white rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-[#ff6b5a]/10 p-4">
          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-gradient-to-tr from-sky-50 to-blue-50/30 flex items-center justify-center">
            <img
              src="/about_us_workspace.png"
              alt="About Us Illustration"
              className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        {/* Menu Agreements List */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 divide-y divide-slate-100 overflow-hidden">

          {/* Confidentiality Agreement Row */}
          <button
            onClick={() => setAgreementType("confidentiality")}
            className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors focus:outline-none text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-[#ff6b5a]/15 flex items-center justify-center text-[#ff6b5a] shrink-0 shadow-sm">
                <FileText size={18} className="stroke-[2.5]" />
              </div>
              <span className="text-[13px] font-black text-slate-800 tracking-wide">Confidentiality Agreement</span>
            </div>
            <ChevronRight size={18} className="text-slate-400" />
          </button>

          {/* Risk Disclosure Agreement Row */}
          <button
            onClick={() => setAgreementType("risk")}
            className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition-colors focus:outline-none text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-9 h-9 rounded-xl bg-[#ff6b5a]/15 flex items-center justify-center text-[#ff6b5a] shrink-0 shadow-sm">
                <Bookmark size={18} className="fill-[#ff6b5a] stroke-[2.5]" />
              </div>
              <span className="text-[13px] font-black text-slate-800 tracking-wide">Risk Disclosure Agreement</span>
            </div>
            <ChevronRight size={18} className="text-slate-400" />
          </button>

        </div>

      </div>

    </div>
  );
}
