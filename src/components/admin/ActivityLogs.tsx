import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card } from '@/components/ui/Card';
import { Activity, ShieldAlert, CheckCircle2, Info } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/Skeleton';
import { motion } from 'framer-motion';

export function ActivityLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'audit_logs'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getIcon = (type: string) => {
    switch(type) {
      case 'security': return <ShieldAlert className="w-4 h-4 text-red-500" />;
      case 'success': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'info': return <Info className="w-4 h-4 text-blue-500" />;
      default: return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center">
          <Activity className="w-5 h-5 mr-2 text-blue-500" />
          Activity Logs
        </h3>
        <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300">Live</span>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[400px]">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))
        ) : logs.length > 0 ? (
          logs.map((log, i) => (
            <motion.div 
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-3 text-sm"
            >
              <div className="mt-0.5 bg-slate-800 p-2 rounded-full h-fit">
                {getIcon(log.type)}
              </div>
              <div>
                <p className="text-slate-200">
                  <span className="font-semibold text-white mr-1">{log.adminEmail || 'System'}</span>
                  {log.action}
                </p>
                <div className="flex gap-2 text-xs text-slate-500 mt-1">
                  <span>{log.timestamp ? format(new Date(log.timestamp), 'MMM d, HH:mm') : 'Just now'}</span>
                  {log.targetId && (
                    <>
                      <span>•</span>
                      <span className="font-mono bg-slate-800/50 px-1 rounded">{log.targetId}</span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center text-slate-500 py-8">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <p>No recent activity</p>
          </div>
        )}
      </div>
    </Card>
  );
}
