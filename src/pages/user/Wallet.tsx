import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card } from '@/components/ui/Card';
import { useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { ArrowDownLeft, ArrowUpRight, History, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

export default function Wallet() {
  const { userProfile, user } = useAuthStore();
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bkash');
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [transactions, setTransactions] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const trxQuery = query(collection(db, 'transactions'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsubsTrx = onSnapshot(trxQuery, (snap) => setTransactions(snap.docs.map(d => ({id: d.id, ...d.data()}))));

    const reqQuery = query(collection(db, 'wallet_requests'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsubsReq = onSnapshot(reqQuery, (snap) => {
      setRequests(snap.docs.map(d => ({id: d.id, ...d.data()})));
      setLoading(false);
    });

    return () => {
      unsubsTrx();
      unsubsReq();
    };
  }, [user]);

  const handleSubmitRequest = async (type: 'deposit' | 'withdraw') => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return toast.error('Enter a valid amount');
    if (type === 'deposit' && !transactionId) return toast.error('Enter transaction ID');
    if (type === 'withdraw' && Number(amount) > (userProfile?.walletBalance || 0)) return toast.error('Insufficient balance');

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'wallet_requests'), {
        userId: user?.uid,
        type,
        amount: Number(amount),
        paymentMethod,
        transactionId: type === 'deposit' ? transactionId : null,
        status: 'pending',
        createdAt: new Date().toISOString()
      });
      toast.success(`${type} request submitted!`);
      setShowDeposit(false);
      setShowWithdraw(false);
      setAmount('');
      setTransactionId('');
    } catch (error) {
      toast.error(`Failed to submit ${type} request`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 relative"
    >
      <header>
        <h2 className="text-2xl font-bold">My Wallet</h2>
        <p className="text-slate-400">Manage your balance and transactions</p>
      </header>

      <Card className="bg-gradient-to-br from-blue-900/40 to-slate-900 border-blue-500/20">
        <p className="text-slate-400 text-sm">Total Balance</p>
        <h3 className="text-4xl font-bold mt-2 text-white">৳ {userProfile?.walletBalance || 0}</h3>
        
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setShowDeposit(true)}>
            <ArrowDownLeft className="w-4 h-4 mr-2" />
            Deposit
          </Button>
          <Button variant="outline" className="w-full" onClick={() => setShowWithdraw(true)}>
            <ArrowUpRight className="w-4 h-4 mr-2" />
            Withdraw
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-slate-800/30">
          <p className="text-sm text-slate-400">Bonus Balance</p>
          <p className="text-xl font-semibold mt-1 text-green-400">৳ {userProfile?.bonusBalance || 0}</p>
        </Card>
        <Card className="p-4 bg-slate-800/30">
          <p className="text-sm text-slate-400">Locked Balance</p>
          <p className="text-xl font-semibold mt-1 text-amber-400">৳ {userProfile?.lockedBalance || 0}</p>
        </Card>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <History className="w-5 h-5 mr-2 text-slate-400" />
            Pending Requests
          </h3>
        </div>
        
        {loading ? (
          <div className="space-y-3 mb-6">
            {[1, 2].map(n => (
              <Card key={n} className="p-4 border-yellow-500/20 flex justify-between items-center bg-slate-800/30">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-5 w-16" />
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3 mb-6">
            {requests.filter(r => r.status === 'pending').map((req, i) => (
              <motion.div key={req.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-4 border-yellow-500/20 flex justify-between items-center bg-slate-800/30">
                  <div>
                    <p className="font-bold text-yellow-500 capitalize">{req.type} pending</p>
                    <p className="text-xs text-slate-400">{format(new Date(req.createdAt), 'MMM d, h:mm a')}</p>
                  </div>
                  <p className="font-bold text-white">৳ {req.amount}</p>
                </Card>
              </motion.div>
            ))}
            {requests.filter(r => r.status === 'pending').length === 0 && (
              <p className="text-sm text-slate-500">No pending requests.</p>
            )}
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <History className="w-5 h-5 mr-2 text-slate-400" />
            Recent Transactions
          </h3>
        </div>
        
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(n => (
              <Card key={n} className="p-4 flex justify-between items-center bg-slate-800/30">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-5 w-16" />
              </Card>
            ))}
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((trx, i) => (
              <motion.div key={trx.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="p-4 flex justify-between items-center bg-slate-800/30">
                  <div>
                    <p className="font-bold capitalize">{trx.type}</p>
                    <p className="text-xs text-slate-400">{format(new Date(trx.createdAt), 'MMM d, h:mm a')}</p>
                  </div>
                  <p className={`font-bold ${trx.type === 'deposit' || trx.type === 'prize' ? 'text-green-500' : 'text-red-500'}`}>
                    {trx.type === 'deposit' || trx.type === 'prize' ? '+' : '-'} ৳ {trx.amount}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="py-8 text-center text-slate-500">
            No transactions yet
          </Card>
        )}
      </div>

      {/* Modals */}
      {(showDeposit || showWithdraw) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
          <Card className="w-full bg-slate-900 border-slate-700 shadow-2xl relative">
            <button 
              onClick={() => { setShowDeposit(false); setShowWithdraw(false); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-6">{showDeposit ? 'Deposit Funds' : 'Withdraw Funds'}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 mb-1 block">Payment Method</label>
                <select 
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-blue-500 appearance-none text-white"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                  <option value="rocket">Rocket</option>
                  <option value="upay">Upay</option>
                </select>
              </div>

              {showDeposit && (
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-4">
                  <p className="text-sm text-blue-400 mb-2">Send money to this {paymentMethod} Personal number:</p>
                  <p className="font-mono text-xl font-bold tracking-wider text-white mb-1">01712345678</p>
                  <p className="text-xs text-slate-400">Minimum deposit: ৳ 50</p>
                </div>
              )}

              <Input 
                placeholder="Amount (৳)" 
                type="number" 
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />

              {showDeposit && (
                <Input 
                  placeholder="Transaction ID (TrxID)" 
                  value={transactionId}
                  onChange={e => setTransactionId(e.target.value)}
                />
              )}

              <Button 
                className="w-full mt-4" 
                isLoading={isSubmitting}
                onClick={() => handleSubmitRequest(showDeposit ? 'deposit' : 'withdraw')}
              >
                Submit {showDeposit ? 'Deposit' : 'Withdraw'} Request
              </Button>
            </div>
          </Card>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

