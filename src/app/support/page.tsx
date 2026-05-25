"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Headset, HelpCircle, MessageSquare, Send, Paperclip, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface Message {
  sender: "user" | "support";
  text: string;
  time: string;
}

const FAQS = [
  { q: "How long do withdrawals take?", a: "Withdrawals are typically settled within 2 to 4 hours. Bank transfers might take up to 24 hours during banking holidays." },
  { q: "Is this platform legal and secure?", a: "Yes, our gaming systems are provably fair and built with encrypted smart contracts ensuring legal compliance." },
  { q: "What is the minimum deposit amount?", a: "The minimum deposit on the Bull Wave gaming portal is ₹100 via Instant UPI methods." },
];

export default function SupportPage() {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "support", text: "Hello! Welcome to Bull Wave Support. How can we help you today?", time: "10:00 AM" },
  ]);
  const [inputText, setInputText] = useState("");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const newMsg: Message = { sender: "user", text: inputText, time: "Just now" };
    setMessages((prev) => [...prev, newMsg]);
    setInputText("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "support", text: "Thank you for reaching out. We have logged your request.", time: "Just now" },
      ]);
    }, 1000);
  };

  const handleCreateTicket = () => {
    if (!ticketSubject || !ticketDescription) {
      toast.error("Please fill in all ticket details.");
      return;
    }
    toast.success(`Ticket #${Math.floor(Math.random() * 90000 + 10000)} successfully raised!`);
    setTicketSubject("");
    setTicketDescription("");
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <Headset className="text-[#800000]" /> Support Desk
        </h1>
        <p className="text-muted-foreground text-xs">Raise tickets, chat with our agents, or browse popular FAQs</p>
      </div>

      <div className="flex flex-col gap-6 w-full">
        
        {/* Support Configurations Tabs */}
        <div className="w-full">
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-100 border border-slate-200 rounded-xl h-11 p-1">
              <TabsTrigger value="chat" className="rounded-lg data-[state=active]:bg-[#800000] data-[state=active]:text-white text-[10px] font-bold py-1 text-slate-700">
                Live Chat
              </TabsTrigger>
              <TabsTrigger value="ticket" className="rounded-lg data-[state=active]:bg-[#800000] data-[state=active]:text-white text-[10px] font-bold py-1 text-slate-700">
                Raise Ticket
              </TabsTrigger>
              <TabsTrigger value="faq" className="rounded-lg data-[state=active]:bg-[#800000] data-[state=active]:text-white text-[10px] font-bold py-1 text-slate-700">
                FAQs
              </TabsTrigger>
            </TabsList>

            {/* Live Chat Panel */}
            <TabsContent value="chat" className="mt-4">
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-200/50 rounded-2xl flex flex-col h-[500px] shadow-sm">
                <CardHeader className="border-b border-blue-100 pb-3">
                  <CardTitle className="text-base text-blue-950">Live Support Representative</CardTitle>
                  <CardDescription className="flex items-center gap-2 text-xs text-blue-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Online - Avg response time 1 min
                  </CardDescription>
                </CardHeader>
                
                {/* Chat Message Box */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[300px]">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-sm ${
                          msg.sender === "user"
                            ? "bg-[#800000] text-white rounded-tr-none"
                            : "bg-white border border-blue-200/50 text-slate-800 rounded-tl-none"
                        }`}
                      >
                        <p>{msg.text}</p>
                        <span className={`text-[8px] block text-right mt-1 ${
                          msg.sender === "user" ? "text-amber-200/80" : "text-slate-500"
                        }`}>{msg.time}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>

                {/* Message input bar */}
                <div className="p-4 border-t border-blue-100 flex gap-2 items-center">
                  <button className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#800000] hover:bg-slate-50 transition-all shadow-sm">
                    <Paperclip size={16} />
                  </button>
                  <Input
                    placeholder="Type your message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 bg-white border-slate-200 rounded-xl text-slate-800 shadow-sm"
                  />
                  <Button onClick={handleSendMessage} className="bg-[#800000] hover:bg-[#800000]/90 text-white rounded-xl py-5 shadow-sm">
                    <Send size={14} />
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* Raise Ticket Panel */}
            <TabsContent value="ticket" className="mt-4">
              <Card className="bg-gradient-to-r from-rose-50 to-pink-50/50 border border-rose-200/50 shadow-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-rose-950 text-base">Create Support Ticket</CardTitle>
                  <CardDescription className="text-xs text-rose-800">File a formal ticket if your query requires extensive audit checks.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="ticket-subject" className="text-rose-900 text-xs font-semibold">Subject</Label>
                    <Input
                      id="ticket-subject"
                      placeholder="e.g. Deposit amount not credited"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      className="bg-white border-rose-200/80 rounded-xl text-slate-800 shadow-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="ticket-desc" className="text-rose-900 text-xs font-semibold">Description</Label>
                    <textarea
                      id="ticket-desc"
                      placeholder="Please specify transaction references, dates, and clear details..."
                      rows={5}
                      value={ticketDescription}
                      onChange={(e) => setTicketDescription(e.target.value)}
                      className="w-full p-3 rounded-xl bg-white border border-rose-200/80 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-rose-200 shadow-sm"
                    />
                  </div>

                  <Button
                    onClick={handleCreateTicket}
                    className="w-full bg-[#800000] hover:bg-[#800000]/90 text-white font-bold py-6 rounded-xl shadow-sm"
                  >
                    Submit Support Ticket
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* FAQs Panel */}
            <TabsContent value="faq" className="mt-4">
              <div className="space-y-4">
                {FAQS.map((faq, idx) => (
                  <Card key={idx} className="bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-200/50 shadow-sm rounded-2xl">
                    <CardHeader className="py-4">
                      <CardTitle className="text-xs font-black flex items-center gap-2 text-amber-950">
                        <HelpCircle size={16} className="text-[#800000]" />
                        {faq.q}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <p className="text-[11px] text-slate-700 leading-relaxed font-medium">{faq.a}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Support Stats / Operations */}
        <div>
          <Card className="bg-gradient-to-r from-violet-50 to-purple-50/50 border border-purple-200/50 shadow-sm rounded-2xl">
            <CardHeader className="py-4">
              <CardTitle className="text-base text-purple-950">Ticket Audit History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pb-4">
              {[
                { id: "T-4491", topic: "UPI Ref Deposit Audit", date: "2 days ago", status: "resolved" },
                { id: "T-2210", topic: "KYC Aadhaar Re-Verify", date: "1 week ago", status: "resolved" },
              ].map((t) => (
                <div key={t.id} className="p-3 rounded-xl bg-white/80 border border-purple-200/30 flex justify-between items-center shadow-sm">
                  <div>
                    <span className="text-[9px] text-slate-500 font-bold">{t.id}</span>
                    <p className="text-xs font-black text-slate-800">{t.topic}</p>
                    <span className="text-[9px] text-slate-400 block mt-0.5">{t.date}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 text-[10px] uppercase font-bold flex items-center gap-1">
                    <CheckCircle size={10} /> {t.status}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
