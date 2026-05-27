"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, ArrowDownLeft, ArrowUpRight, CheckCircle2, XCircle, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { apiRequest } from "@/lib/api";

interface Transaction {
  id: string;
  type: "deposit" | "withdraw";
  amount: number;
  status: string;
  date: string;
  ref: string;
}

interface QuickStats {
  totalDeposit: number;
  totalWithdrawal: number;
  pendingWithdrawals: number;
}

export default function WalletPage() {
  const { user, depositFunds, withdrawFunds } = useAuthStore();
  const [activeTab, setActiveTab] = useState("deposit");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [txFilter, setTxFilter] = useState("all");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(true);
  const [stats, setStats] = useState<QuickStats>({
    totalDeposit: 0,
    totalWithdrawal: 0,
    pendingWithdrawals: 0,
  });

  const quickAmounts = ["500", "1000", "2000", "5000", "10000"];

  const fetchTransactions = async () => {
    setTxLoading(true);
    try {
      const data = await apiRequest("/wallet/transactions");
      if (Array.isArray(data)) {
        const mapped: Transaction[] = data.map((tx: any) => ({
          id: String(tx.id),
          type: tx.amount > 0 ? "deposit" : "withdraw",
          amount: Math.abs(tx.amount),
          status: tx.transaction_type === "deposit" ? "success" : "success",
          date: tx.created_at,
          ref: tx.reference_id || tx.description || "",
        }));
        setTransactions(mapped);

        // Compute Quick Stats from real transaction data
        const totalDeposit = mapped
          .filter((t) => t.type === "deposit")
          .reduce((sum, t) => sum + t.amount, 0);
        const totalWithdrawal = mapped
          .filter((t) => t.type === "withdraw")
          .reduce((sum, t) => sum + t.amount, 0);

        setStats({ totalDeposit, totalWithdrawal, pendingWithdrawals: 0 });
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.error("Failed to load transactions:", err);
      setTransactions([]);
    } finally {
      setTxLoading(false);
    }
  };

  // Also fetch pending withdrawals from dedicated endpoint
  const fetchPendingWithdrawals = async () => {
    try {
      const data = await apiRequest("/wallet/withdrawals");
      if (Array.isArray(data)) {
        const pending = data
          .filter((w: any) => w.status === "pending")
          .reduce((sum: number, w: any) => sum + Number(w.amount), 0);
        setStats((prev) => ({ ...prev, pendingWithdrawals: pending }));
      }
    } catch {
      // endpoint may not exist yet — silently ignore
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchPendingWithdrawals();
  }, []);

  const handleDeposit = async () => {
    if (!depositAmount || isNaN(Number(depositAmount))) {
      toast.error("Please enter a valid amount.");
      return;
    }
    const amt = Number(depositAmount);
    if (amt < 100) {
      toast.error("Minimum deposit is ₹100.");
      return;
    }
    const toastId = toast.loading("Initiating payment checkout...");
    try {
      await depositFunds(amt);
      toast.success(`₹${amt} successfully deposited into your wallet!`, { id: toastId });
      setDepositAmount("");
      // Refresh both transactions and stats
      fetchTransactions();
      fetchPendingWithdrawals();
    } catch (err: any) {
      if (err.message && err.message.toLowerCase().includes("closed")) {
        toast.dismiss(toastId);
        toast.info("Payment window was closed.");
      } else {
        toast.error(err.message || "Deposit transaction failed.", { id: toastId });
      }
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || isNaN(Number(withdrawAmount))) {
      toast.error("Please enter a valid withdrawal amount.");
      return;
    }
    const amt = Number(withdrawAmount);
    if (amt <= 0) {
      toast.error("Invalid withdrawal amount.");
      return;
    }
    const success = await withdrawFunds(amt);
    if (success) {
      toast.success(`Withdrawal request of ₹${amt} successfully processed!`);
      setWithdrawAmount("");
      fetchTransactions();
      fetchPendingWithdrawals();
    } else {
      toast.error("Insufficient winning balance.");
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (txFilter === "all") return true;
    return tx.type === txFilter;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">My Wallet</h1>
          <p className="text-muted-foreground text-xs">Deposit, Withdraw, and track your transactions</p>
        </div>
      </div>

      {/* Main Balance Card */}
      <section className="flex flex-col gap-4 w-full">
        <Card className="bg-gradient-to-r from-[#800000] to-[#b30000] text-white shadow-lg rounded-2xl relative overflow-hidden border-none">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-[80px] pointer-events-none" />
          <CardContent className="p-5 flex flex-col justify-between min-h-[160px]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0">
                <Wallet size={20} />
              </div>
              <div>
                <span className="text-[10px] text-amber-200/90 block font-bold uppercase tracking-wider">Total Balance</span>
                <h2 className="text-2xl font-black text-white">₹ {(user?.walletBalance ?? 0).toLocaleString()}.00</h2>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-4 mt-4">
              <div>
                <span className="text-[10px] text-amber-200/90 block font-bold uppercase tracking-wider">Winnings</span>
                <p className="text-sm font-bold text-white">₹ {(user?.winningsBalance ?? 0).toLocaleString()}.00</p>
              </div>
              <div>
                <span className="text-[10px] text-amber-200/90 block font-bold uppercase tracking-wider">Bonus</span>
                <p className="text-sm font-bold text-white">₹ {(user?.bonusBalance ?? 0).toLocaleString()}.00</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats — computed from real transactions */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-200/50 shadow-sm rounded-2xl">
          <CardHeader className="py-4">
            <CardTitle className="text-sm text-amber-950">Quick Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pb-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 font-medium">Total Deposit</span>
              <span className="font-semibold text-emerald-600">
                ₹ {stats.totalDeposit.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 font-medium">Total Withdrawal</span>
              <span className="font-semibold text-rose-600">
                ₹ {stats.totalWithdrawal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 font-medium">Pending Withdrawals</span>
              <span className="font-semibold text-orange-600">
                ₹ {stats.pendingWithdrawals.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Transaction Control Area */}
      <section className="flex flex-col gap-6 w-full">
        <div className="w-full">
          <Tabs defaultValue="deposit" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 bg-slate-100 border border-slate-200 rounded-xl h-11 p-1">
              <TabsTrigger value="deposit" className="rounded-lg data-[state=active]:bg-[#800000] data-[state=active]:text-white text-xs py-1">Deposit Money</TabsTrigger>
              <TabsTrigger value="withdraw" className="rounded-lg data-[state=active]:bg-[#800000] data-[state=active]:text-white text-xs py-1">Withdrawal</TabsTrigger>
            </TabsList>

            <TabsContent value="deposit" className="mt-4">
              <Card className="bg-gradient-to-r from-rose-50 to-pink-50/50 border border-rose-200/50 shadow-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-rose-950">Deposit Money</CardTitle>
                  <CardDescription className="text-xs text-rose-800">Instant Deposit. Funds will reflect immediately in your account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Quick Select Amounts */}
                  <div className="space-y-2">
                    <Label className="text-xs text-rose-900 font-semibold">Select Deposit Amount</Label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {quickAmounts.map((amt) => (
                        <button
                          key={amt}
                          onClick={() => setDepositAmount(amt)}
                          className={`py-2 px-1 rounded-lg text-center border text-[10px] font-black transition-all shadow-sm ${
                            depositAmount === amt
                              ? "bg-[#800000] border-[#800000] text-white shadow-sm"
                              : "bg-white border-rose-200/80 text-slate-800 hover:text-[#800000] hover:bg-slate-50"
                          }`}
                        >
                          ₹{amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="custom-deposit" className="text-xs text-rose-900 font-semibold">Or Enter Custom Amount</Label>
                    <Input
                      id="custom-deposit"
                      placeholder="Enter amount (Min ₹100)"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="bg-white border-rose-200/80 rounded-xl text-slate-800 py-4 text-sm shadow-sm focus:ring-rose-200"
                    />
                  </div>

                  <Button
                    onClick={handleDeposit}
                    className="w-full bg-[#800000] hover:bg-[#800000]/90 text-white font-bold py-5 rounded-xl text-xs shadow-sm"
                  >
                    Deposit Funds
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="withdraw" className="mt-4">
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-200/50 shadow-sm rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-blue-950">Withdraw Winnings</CardTitle>
                  <CardDescription className="text-xs text-blue-800">Withdrawals are processed within 2-4 hours.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="withdraw-amount" className="text-blue-900 text-xs font-semibold">Amount to Withdraw</Label>
                    <Input
                      id="withdraw-amount"
                      placeholder={`Max: ₹${user?.winningsBalance ?? 0}`}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="bg-white border-blue-200/80 rounded-xl text-slate-800 py-6 shadow-sm"
                    />
                  </div>

                  <div className="space-y-4">
                    <Label className="text-blue-900 text-xs font-semibold">Withdraw to</Label>
                    <Tabs defaultValue="upi" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 bg-slate-100 border border-slate-200 rounded-xl mb-4 p-1">
                        <TabsTrigger value="upi" className="rounded-lg data-[state=active]:bg-[#800000] data-[state=active]:text-white text-xs">UPI Address</TabsTrigger>
                        <TabsTrigger value="bank" className="rounded-lg data-[state=active]:bg-[#800000] data-[state=active]:text-white text-xs">Bank Account</TabsTrigger>
                      </TabsList>
                      <TabsContent value="upi" className="space-y-2">
                        <Label htmlFor="upi-id" className="text-blue-900 text-xs">UPI ID</Label>
                        <Input
                          id="upi-id"
                          placeholder="e.g. user@ybl"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="bg-white border-blue-200/80 rounded-xl text-slate-800 shadow-sm"
                        />
                      </TabsContent>
                      <TabsContent value="bank" className="space-y-2">
                        <Label htmlFor="bank-acc" className="text-blue-900 text-xs">Account Number / IFSC</Label>
                        <Input
                          id="bank-acc"
                          placeholder="Bank details"
                          value={bankAccount}
                          onChange={(e) => setBankAccount(e.target.value)}
                          className="bg-white border-blue-200/80 rounded-xl text-slate-800 shadow-sm"
                        />
                      </TabsContent>
                    </Tabs>
                  </div>

                  <Button
                    onClick={handleWithdraw}
                    className="w-full bg-[#800000] hover:bg-[#800000]/90 text-white font-bold py-6 rounded-xl shadow-sm"
                  >
                    Submit Withdrawal
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Transaction History */}
        <div className="w-full">
          <Card className="bg-gradient-to-r from-violet-50 to-purple-50/50 border border-purple-200/50 shadow-sm rounded-2xl">
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <CardTitle className="text-base text-purple-950">Recent History</CardTitle>
              <button className="text-purple-800 hover:text-[#800000] p-1" onClick={fetchTransactions}>
                <Download size={16} />
              </button>
            </CardHeader>
            <CardContent className="space-y-4 pb-4">
              <div className="flex gap-2">
                {["all", "deposit", "withdraw"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setTxFilter(filter)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all shadow-sm ${
                      txFilter === filter
                        ? "bg-[#800000] border-[#800000] text-white"
                        : "bg-white border-purple-200 text-purple-900 hover:bg-purple-100/50"
                    }`}
                  >
                    {filter.toUpperCase()}
                  </button>
                ))}
              </div>

              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {txLoading ? (
                  <div className="flex items-center justify-center py-10 text-purple-400">
                    <Loader2 size={20} className="animate-spin mr-2" />
                    <span className="text-xs">Loading transactions...</span>
                  </div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-xs">
                    No transactions found.
                  </div>
                ) : (
                  filteredTransactions.map((tx) => (
                    <div key={tx.id} className="flex justify-between items-center p-3 rounded-xl bg-white/80 border border-purple-200/30 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          tx.type === "deposit" ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"
                        }`}>
                          {tx.type === "deposit" ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 capitalize">{tx.type}</p>
                          <span className="text-[10px] text-slate-500">{new Date(tx.date).toLocaleDateString("en-IN")}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-slate-800">₹{tx.amount.toLocaleString()}</p>
                        <span className={`text-[9px] font-bold uppercase flex items-center gap-1 justify-end ${
                          tx.status === "success" ? "text-emerald-600" : "text-rose-600"
                        }`}>
                          {tx.status === "success" ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
