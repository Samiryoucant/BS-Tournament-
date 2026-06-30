import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDoc, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function AdminFinances() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'wallet_requests'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRequests(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleApprove = async (request: any) => {
    if (confirm(`Approve this ${request.type} of ৳${request.amount}?`)) {
      try {
        await runTransaction(db, async (transaction) => {
          const userRef = doc(db, 'users', request.userId);
          const userSnap = await transaction.get(userRef);
          
          if (!userSnap.exists()) throw new Error('User not found');
          
          let newBalance = userSnap.data().walletBalance || 0;
          if (request.type === 'deposit') {
            newBalance += request.amount;
          } else if (request.type === 'withdraw') {
            // Check if they have enough. They should, but check anyway.
            if (newBalance < request.amount) throw new Error('Insufficient funds');
            newBalance -= request.amount;
          }

          transaction.update(userRef, { walletBalance: newBalance });
          transaction.update(doc(db, 'wallet_requests', request.id), { status: 'approved' });
          
          // Log transaction
          transaction.set(doc(collection(db, 'transactions')), {
            userId: request.userId,
            type: request.type,
            amount: request.amount,
            status: 'completed',
            createdAt: new Date().toISOString()
          });
        });
        toast.success(`${request.type} approved`);
      } catch (error: any) {
        toast.error(error.message || 'Transaction failed');
      }
    }
  };

  const handleReject = async (requestId: string) => {
    if (confirm('Reject this request?')) {
      try {
        await updateDoc(doc(db, 'wallet_requests', requestId), { status: 'rejected' });
        toast.success('Request rejected');
      } catch (error) {
        toast.error('Failed to reject');
      }
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold">Finances & Requests</h2>
        <p className="text-slate-400">Manage deposits and withdrawals</p>
      </header>

      {loading ? (
        <div>Loading requests...</div>
      ) : (
        <div className="grid gap-4">
          {requests.map(req => (
            <Card key={req.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${req.type === 'deposit' ? 'bg-green-500/20 text-green-400' : 'bg-orange-500/20 text-orange-400'}`}>
                    {req.type}
                  </span>
                  <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded ${
                    req.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 
                    req.status === 'approved' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {req.status}
                  </span>
                </div>
                <p className="font-bold text-lg">৳ {req.amount}</p>
                <p className="text-xs text-slate-400">User ID: {req.userId}</p>
                {req.transactionId && <p className="text-xs text-slate-400">TrxID: {req.transactionId}</p>}
                {req.paymentMethod && <p className="text-xs text-slate-400">Method: {req.paymentMethod}</p>}
              </div>

              {req.status === 'pending' && (
                <div className="flex gap-2">
                  <Button variant="danger" size="sm" onClick={() => handleReject(req.id)}>Reject</Button>
                  <Button size="sm" onClick={() => handleApprove(req)}>Approve</Button>
                </div>
              )}
            </Card>
          ))}
          {requests.length === 0 && (
            <div className="text-center py-8 text-slate-500">No requests found</div>
          )}
        </div>
      )}
    </div>
  );
}
