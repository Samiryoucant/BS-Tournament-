import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdDate', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleRoleChange = async (id: string, role: string) => {
    try {
      await updateDoc(doc(db, 'users', id), { role });
      
      if (role === 'admin') {
        // According to new rules, we need an admin doc for the rules to allow admin access
        // We can't write to admins/{id} from client if it's not allowed, wait, the rules say:
        // match /admins/{uid} { allow read: if isSignedIn(); allow write: if false; }
        // Ah, the user's rules say `allow write: if false; // only set manually in console`
        // So we can't do it from the client. Let's just update the UI role then.
        toast.error('Role updated in UI, but true Admin access must be granted via Firebase Console (/admins collection).', { duration: 5000 });
      } else {
        toast.success('Role updated');
      }
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase()) || 
    u.username?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Manage Users</h2>
          <p className="text-slate-400">Total {users.length} registered users</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search users..." 
            className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 text-sm">
              <th className="pb-3 font-medium">User</th>
              <th className="pb-3 font-medium">Wallet</th>
              <th className="pb-3 font-medium">Matches</th>
              <th className="pb-3 font-medium">Status</th>
              <th className="pb-3 font-medium text-right">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">Loading users...</td>
              </tr>
            ) : filteredUsers.map(user => (
              <tr key={user.id} className="hover:bg-slate-800/20">
                <td className="py-4">
                  <div className="font-medium text-white">{user.username || 'User'}</div>
                  <div className="text-xs text-slate-500">{user.email}</div>
                </td>
                <td className="py-4">
                  <div className="font-medium">৳ {user.walletBalance || 0}</div>
                </td>
                <td className="py-4">
                  <div>{user.totalMatches || 0}</div>
                </td>
                <td className="py-4">
                  <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs rounded-full">
                    {user.accountStatus || 'Active'}
                  </span>
                </td>
                <td className="py-4 text-right">
                  <select 
                    className="bg-slate-800 border border-slate-700 text-sm rounded-lg px-2 py-1 outline-none"
                    value={user.role || 'user'}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
