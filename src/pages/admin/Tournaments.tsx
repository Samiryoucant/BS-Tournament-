import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit } from 'lucide-react';

export default function AdminTournaments() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [gameName, setGameName] = useState('Free Fire');
  const [entryFee, setEntryFee] = useState('10');
  const [prizePool, setPrizePool] = useState('500');
  const [maxPlayers, setMaxPlayers] = useState('100');

  useEffect(() => {
    const q = query(collection(db, 'tournaments'), orderBy('matchDate', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTournaments(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return toast.error('Title required');

    try {
      await addDoc(collection(db, 'tournaments'), {
        title,
        gameName,
        entryFee: Number(entryFee),
        prizePool: Number(prizePool),
        maxPlayers: Number(maxPlayers),
        joinedPlayers: 0,
        status: 'Upcoming',
        matchDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      });
      toast.success('Tournament created');
      setIsCreating(false);
      setTitle('');
    } catch (error: any) {
      toast.error('Failed to create');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) {
      try {
        await deleteDoc(doc(db, 'tournaments', id));
        toast.success('Deleted');
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'tournaments', id), { status });
      toast.success(`Status updated to ${status}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Manage Tournaments</h2>
          <p className="text-slate-400">Create and monitor tournaments</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)}>
          <Plus className="w-5 h-5 mr-2" />
          New Tournament
        </Button>
      </div>

      {isCreating && (
        <Card className="mb-8 border-blue-500/50">
          <h3 className="text-lg font-bold mb-4">Create New Tournament</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <Input placeholder="Tournament Title" value={title} onChange={e => setTitle(e.target.value)} required />
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Game Name (e.g. Free Fire)" value={gameName} onChange={e => setGameName(e.target.value)} required />
              <Input placeholder="Entry Fee" type="number" value={entryFee} onChange={e => setEntryFee(e.target.value)} required />
              <Input placeholder="Prize Pool" type="number" value={prizePool} onChange={e => setPrizePool(e.target.value)} required />
              <Input placeholder="Max Players" type="number" value={maxPlayers} onChange={e => setMaxPlayers(e.target.value)} required />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button type="submit">Create</Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div>Loading tournaments...</div>
      ) : (
        <div className="grid gap-4">
          {tournaments.map((t) => (
            <Card key={t.id} className="flex justify-between items-center p-4">
              <div>
                <h4 className="font-bold">{t.title}</h4>
                <p className="text-sm text-slate-400">{t.gameName} | ৳{t.prizePool} | {t.joinedPlayers}/{t.maxPlayers} Joined</p>
                <div className="mt-2 space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${t.status === 'Live' ? 'bg-red-500/20 text-red-400' : t.status === 'Upcoming' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-300'}`}>
                    {t.status}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <select 
                  className="bg-slate-800 border border-slate-700 text-sm rounded-lg px-2 py-1"
                  value={t.status}
                  onChange={(e) => handleStatusChange(t.id, e.target.value)}
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Live">Live</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <Button variant="danger" size="sm" onClick={() => handleDelete(t.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
