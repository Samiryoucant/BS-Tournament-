import React from 'react';
import { useAuthStore } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { LogOut, Settings, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { userProfile, isAdmin } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center space-x-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-2xl font-bold border border-blue-400">
          {userProfile?.username?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div>
          <h2 className="text-2xl font-bold">{userProfile?.username || 'User'}</h2>
          <p className="text-slate-400">{userProfile?.email}</p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 bg-slate-800/50 text-center">
          <p className="text-2xl font-bold">{userProfile?.totalMatches || 0}</p>
          <p className="text-sm text-slate-400 mt-1">Matches</p>
        </Card>
        <Card className="p-4 bg-slate-800/50 text-center">
          <p className="text-2xl font-bold text-green-400">{userProfile?.wins || 0}</p>
          <p className="text-sm text-slate-400 mt-1">Wins</p>
        </Card>
      </div>

      <div className="space-y-2 mt-8">
        <Button variant="ghost" className="w-full justify-start text-left h-14">
          <User className="w-5 h-5 mr-3" />
          Edit Profile
        </Button>
        <Button variant="ghost" className="w-full justify-start text-left h-14">
          <Settings className="w-5 h-5 mr-3" />
          Account Settings
        </Button>
        
        {isAdmin && (
          <Button 
            variant="ghost" 
            className="w-full justify-start text-left h-14 text-amber-500 hover:text-amber-400 hover:bg-amber-500/10"
            onClick={() => navigate('/admin')}
          >
            <Settings className="w-5 h-5 mr-3" />
            Admin Panel
          </Button>
        )}

        <Button 
          variant="ghost" 
          className="w-full justify-start text-left h-14 text-red-500 hover:text-red-400 hover:bg-red-500/10"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
}
