"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Headset, HelpCircle, MessageSquare, Send, Paperclip, CheckCircle, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

const FAQS = [
  { q: "How long do withdrawals take?", a: "Withdrawals are typically settled within 2 to 4 hours. Bank transfers might take up to 24 hours during banking holidays." },
  { q: "Is this platform legal and secure?", a: "Yes, our gaming systems are provably fair and built with encrypted smart contracts ensuring legal compliance." },
  { q: "What is the minimum deposit amount?", a: "The minimum deposit on the Bull Wave Club gaming portal is ₹100 via Instant UPI methods." },
];

export default function SupportPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [tickets, setTickets] = useState<any[]>([]);
  const [activeTicket, setActiveTicket] = useState<any | null>(null);
  const [loadingTickets, setLoadingTickets] = useState(true);
  
  const [inputText, setInputText] = useState("");
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");

  const fetchTickets = async () => {
    try {
      setLoadingTickets(true);
      const resp = await apiRequest("/support/tickets");
      if (resp) {
        setTickets(resp);
        // Automatically load latest ticket messages if any exist and none is selected
        if (resp.length > 0 && !activeTicket) {
          const detail = await apiRequest(`/support/tickets/${resp[0].id}`);
          setActiveTicket(detail);
        }
      }
    } catch (error) {
      console.error("Failed to load tickets", error);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSelectTicket = async (ticketId: number) => {
    try {
      const detail = await apiRequest(`/support/tickets/${ticketId}`);
      setActiveTicket(detail);
    } catch (error) {
      toast.error("Failed to load ticket details.");
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    if (!activeTicket) {
      toast.error("Please raise a ticket or select a ticket first.");
      return;
    }
    try {
      const newMsg = await apiRequest(`/support/tickets/${activeTicket.id}/messages`, {
        method: "POST",
        body: JSON.stringify({ message: inputText })
      });
      if (newMsg) {
        setActiveTicket((prev: any) => ({
          ...prev,
          messages: [...(prev?.messages || []), newMsg]
        }));
        setInputText("");
        // Reload list to sync last active statuses
        const listResp = await apiRequest("/support/tickets");
        if (listResp) setTickets(listResp);
      }
    } catch (error) {
      toast.error("Failed to send message.");
    }
  };

  const handleCreateTicket = async () => {
    if (!ticketSubject || !ticketDescription) {
      toast.error("Please fill in all ticket details.");
      return;
    }
    try {
      const newTicket = await apiRequest("/support/tickets", {
        method: "POST",
        body: JSON.stringify({
          subject: ticketSubject,
          message: ticketDescription,
          priority: "medium"
        })
      });
      if (newTicket) {
        toast.success(`Ticket #${newTicket.id} successfully raised!`);
        setTicketSubject("");
        setTicketDescription("");
        await fetchTickets();
        // Set new ticket active
        const detail = await apiRequest(`/support/tickets/${newTicket.id}`);
        setActiveTicket(detail);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit ticket");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10 relative px-4 pt-4">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => router.back()} 
          className="text-gray-600 hover:text-[#800000] active:scale-95 transition-all p-1 rounded-lg hover:bg-slate-100/50 cursor-pointer"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2">
            <Headset className="text-[#800000]" size={24} /> Support Desk
          </h1>
          <p className="text-muted-foreground text-xs font-semibold">Raise tickets, chat with our agents, or browse popular FAQs</p>
        </div>
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
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-200/50 rounded-2xl flex flex-col h-[500px] shadow-sm animate-in fade-in">
                <CardHeader className="border-b border-blue-100 pb-3">
                  <CardTitle className="text-base text-blue-950">
                    {activeTicket ? `Chat: ${activeTicket.subject}` : "Live Support Chat"}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 text-xs text-blue-800">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Online - Avg response time 1 min
                  </CardDescription>
                </CardHeader>
                
                {/* Chat Message Box */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[300px] no-scrollbar">
                  {activeTicket && activeTicket.messages && activeTicket.messages.length > 0 ? (
                    activeTicket.messages.map((msg: any) => {
                      const isMe = msg.sender_id === user?.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs shadow-sm ${
                              isMe
                                ? "bg-[#800000] text-white rounded-tr-none"
                                : "bg-white border border-blue-200/50 text-slate-800 rounded-tl-none"
                            }`}
                          >
                            <p>{msg.message}</p>
                            <span className={`text-[8px] block text-right mt-1 ${
                              isMe ? "text-amber-200/80" : "text-slate-500"
                            }`}>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 py-16 text-center px-4">
                      <MessageSquare className="opacity-20 mb-2" size={36} />
                      <p className="text-xs font-bold leading-relaxed">No messages in active chat.</p>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-1">Please select or raise a ticket above to start!</span>
                    </div>
                  )}
                </CardContent>

                {/* Message input bar */}
                <div className="p-4 border-t border-blue-100 flex gap-2 items-center bg-white rounded-b-2xl">
                  <button className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-[#800000] hover:bg-slate-50 transition-all shadow-sm">
                    <Paperclip size={16} />
                  </button>
                  <Input
                    placeholder={activeTicket ? "Type your message..." : "Raise a ticket to start chat..."}
                    disabled={!activeTicket}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 bg-white border-slate-200 rounded-xl text-slate-850 shadow-sm"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!activeTicket}
                    className="bg-[#800000] hover:bg-[#800000]/90 text-white rounded-xl py-5 shadow-sm"
                  >
                    <Send size={14} />
                  </Button>
                </div>
              </Card>
            </TabsContent>

            {/* Raise Ticket Panel */}
            <TabsContent value="ticket" className="mt-4">
              <Card className="bg-gradient-to-r from-rose-50 to-pink-50/50 border border-rose-200/50 shadow-sm rounded-2xl animate-in fade-in">
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
                  <Card key={idx} className="bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-200/50 shadow-sm rounded-2xl animate-in fade-in">
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
              {loadingTickets ? (
                <div className="text-center py-10 flex flex-col items-center gap-2">
                  <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Loading history...</span>
                </div>
              ) : tickets.length > 0 ? (
                tickets.map((t) => {
                  const isActive = activeTicket?.id === t.id;
                  return (
                    <div 
                      key={t.id} 
                      onClick={() => handleSelectTicket(t.id)}
                      className={`p-3 rounded-xl bg-white/80 border border-purple-250/30 flex justify-between items-center shadow-sm cursor-pointer hover:bg-purple-100/40 transition-all ${
                        isActive ? "ring-2 ring-[#800000]" : ""
                      }`}
                    >
                      <div>
                        <span className="text-[9px] text-slate-500 font-bold uppercase">Ticket #{t.id}</span>
                        <p className="text-xs font-black text-slate-800 truncate max-w-[180px]">{t.subject}</p>
                        <span className="text-[9px] text-slate-400 block mt-0.5">
                          {new Date(t.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold flex items-center gap-1 ${
                        t.status === "resolved" ? "bg-emerald-500/10 text-emerald-600" :
                        t.status === "closed" ? "bg-slate-500/10 text-slate-600" :
                        "bg-orange-500/10 text-orange-600"
                      }`}>
                        <CheckCircle size={10} /> {t.status}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-xs font-bold">No tickets filed yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
