import React from 'react';
import { Card } from '@/components/ui/Card';
import { Users, Wallet, Trophy } from 'lucide-react';
import { ActivityLogs } from '@/components/admin/ActivityLogs';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <header>
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <p className="text-slate-400">System statistics and quick actions</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center p-6">
          <div className="p-4 bg-blue-500/20 text-blue-500 rounded-xl mr-4">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Total Users</p>
            <p className="text-2xl font-bold">--</p>
          </div>
        </Card>
        
        <Card className="flex items-center p-6">
          <div className="p-4 bg-green-500/20 text-green-500 rounded-xl mr-4">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Total Revenue</p>
            <p className="text-2xl font-bold">৳ --</p>
          </div>
        </Card>

        <Card className="flex items-center p-6">
          <div className="p-4 bg-yellow-500/20 text-yellow-500 rounded-xl mr-4">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Active Tournaments</p>
            <p className="text-2xl font-bold">--</p>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <ActivityLogs />
        <Card>
          <h3 className="text-lg font-bold mb-4">Pending Deposits</h3>
          <div className="text-center text-slate-500 py-8">No pending deposits</div>
        </Card>
      </div>
    </motion.div>
  );
}
