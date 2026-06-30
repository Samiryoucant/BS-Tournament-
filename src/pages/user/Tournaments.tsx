import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, doc, getDoc, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Users, Calendar, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function Tournaments() {
  const { user, userProfile } = useAuthStore();
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'tournaments'), orderBy('matchDate', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTournaments(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleJoin = async (tournament: any) => {
    if (!user) return toast.error('Please login to join');
    if (userProfile?.walletBalance < tournament.entryFee) {
      return toast.error('Insufficient balance. Please deposit funds.');
    }

    if (confirm(`Join ${tournament.title} for ৳${tournament.entryFee}?`)) {
      setJoiningId(tournament.id);
      try {
        await runTransaction(db, async (transaction) => {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await transaction.get(userRef);
          const tRef = doc(db, 'tournaments', tournament.id);
          const tSnap = await transaction.get(tRef);

          if (!userSnap.exists() || !tSnap.exists()) throw new Error('Data not found');
          
          const currentBalance = userSnap.data().walletBalance || 0;
          if (currentBalance < tournament.entryFee) throw new Error('Insufficient balance');
          
          const currentJoined = tSnap.data().joinedPlayers || 0;
          if (currentJoined >= (tSnap.data().maxPlayers || 100)) throw new Error('Tournament is full');

          // Check if already joined (simple check by querying subcollection or just logging for now)
          // In a real app we'd have a participants subcollection, for simplicity we'll just log it.
          const matchRef = doc(collection(db, 'my_matches'));
          transaction.set(matchRef, {
            userId: user.uid,
            tournamentId: tournament.id,
            joinedAt: new Date().toISOString()
          });

          // Deduct balance
          transaction.update(userRef, { 
            walletBalance: currentBalance - tournament.entryFee,
            totalMatches: (userSnap.data().totalMatches || 0) + 1
          });

          // Update tournament count
          transaction.update(tRef, { joinedPlayers: currentJoined + 1 });

          // Log transaction
          const trxRef = doc(collection(db, 'transactions'));
          transaction.set(trxRef, {
            userId: user.uid,
            type: 'entry_fee',
            amount: tournament.entryFee,
            createdAt: new Date().toISOString(),
            tournamentId: tournament.id
          });
        });
        toast.success('Successfully joined tournament!');
      } catch (error: any) {
        toast.error(error.message || 'Failed to join tournament');
      } finally {
        setJoiningId(null);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <header>
        <h2 className="text-2xl font-bold">Tournaments</h2>
        <p className="text-slate-400">Join and compete in live matches</p>
      </header>

      {/* Tabs / Filters (Placeholder) */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-medium whitespace-nowrap">All</button>
        <button className="px-4 py-2 rounded-full bg-slate-800 text-slate-300 text-sm font-medium whitespace-nowrap">Upcoming</button>
        <button className="px-4 py-2 rounded-full bg-slate-800 text-slate-300 text-sm font-medium whitespace-nowrap">Live</button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-48" />
                </div>
                <div className="space-y-2 items-end flex flex-col">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-5 w-12" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24 justify-self-end" />
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-5 w-12" />
                </div>
                <Skeleton className="h-9 w-28 rounded-xl" />
              </div>
            </Card>
          ))}
        </div>
      ) : tournaments.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="py-12 text-center text-slate-500">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-slate-700" />
            <p>No tournaments available at the moment.</p>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {tournaments.map((tournament, i) => (
            <motion.div
              key={tournament.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="p-0 overflow-hidden">
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="inline-block px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 mb-2">
                      {tournament.gameName}
                    </span>
                    <h3 className="font-bold text-lg">{tournament.title}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">Prize Pool</p>
                    <p className="font-bold text-green-400">৳ {tournament.prizePool}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm text-slate-400 mb-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{tournament.matchDate ? format(new Date(tournament.matchDate), 'MMM d, h:mm a') : 'TBA'}</span>
                  </div>
                  <div className="flex items-center justify-end">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{tournament.joinedPlayers || 0} / {tournament.maxPlayers || 100}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
                  <div>
                    <p className="text-xs text-slate-500">Entry Fee</p>
                    <p className="font-bold">৳ {tournament.entryFee}</p>
                  </div>
                  <Button 
                    size="sm" 
                    className="px-6" 
                    disabled={tournament.status === 'Completed' || (tournament.joinedPlayers >= tournament.maxPlayers) || joiningId === tournament.id}
                    isLoading={joiningId === tournament.id}
                    onClick={() => handleJoin(tournament)}
                  >
                    {tournament.status === 'Completed' ? 'Closed' : 'Join Match'}
                  </Button>
                </div>
              </div>
            </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
