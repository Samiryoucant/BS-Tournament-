import React from 'react';
import { useAuthStore } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Wallet, Trophy, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Home() {
  const { userProfile } = useAuthStore();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <header className="flex justify-between items-center">
        <div>
          <p className="text-slate-400">Welcome back,</p>
          <h2 className="text-2xl font-bold">{userProfile?.username || 'Player'}</h2>
        </div>
        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-xl font-bold border border-slate-700">
          {userProfile?.username?.charAt(0).toUpperCase() || 'U'}
        </div>
      </header>

      {/* Wallet Summary */}
      <Card className="bg-gradient-to-br from-blue-900/40 to-slate-900 border-blue-500/20">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-slate-400 text-sm">Available Balance</p>
            <h3 className="text-3xl font-bold mt-1 text-white">৳ {userProfile?.walletBalance || 0}</h3>
          </div>
          <Link to="/wallet" className="p-3 bg-blue-600/20 text-blue-500 rounded-xl hover:bg-blue-600/30 transition-colors">
            <Wallet />
          </Link>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link to="/tournaments" className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-slate-800 transition-colors">
          <Trophy className="w-8 h-8 text-yellow-500 mb-2" />
          <span className="font-medium text-sm">Tournaments</span>
        </Link>
        <Link to="/profile" className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col items-center justify-center text-center hover:bg-slate-800 transition-colors">
          <Users className="w-8 h-8 text-green-500 mb-2" />
          <span className="font-medium text-sm">Leaderboard</span>
        </Link>
      </div>

      {/* Featured Tournaments Skeleton (since we don't have data fetching yet) */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Featured Tournaments</h3>
          <Link to="/tournaments" className="text-sm text-blue-500 hover:text-blue-400">View all</Link>
        </div>
        <div className="space-y-4">
          <Card className="p-0 overflow-hidden">
            <div className="h-32 bg-slate-800 relative">
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
              <div className="absolute bottom-4 left-4">
                <span className="px-2 py-1 bg-red-500 text-xs font-bold rounded text-white">LIVE NOW</span>
              </div>
            </div>
            <div className="p-4">
              <h4 className="font-bold text-lg mb-1">Free Fire Daily Scrims</h4>
              <div className="flex justify-between text-sm text-slate-400">
                <span>Prize: ৳ 500</span>
                <span>Entry: ৳ 10</span>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>
    </motion.div>
  );
}
