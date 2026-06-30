import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold">App Settings</h2>
        <p className="text-slate-400">Configure global application variables</p>
      </header>

      <Card>
        <h3 className="text-lg font-bold mb-4">Maintenance Mode</h3>
        <p className="text-sm text-slate-400 mb-4">Enable this to temporarily disable access to the user app.</p>
        <Button variant="outline">Toggle Maintenance</Button>
      </Card>

      <Card>
        <h3 className="text-lg font-bold mb-4">Payment Gateways</h3>
        <p className="text-sm text-slate-400 mb-4">Configure available bKash, Nagad, etc numbers here.</p>
        <Button variant="outline">Manage Gateways</Button>
      </Card>
      
      <Card>
        <h3 className="text-lg font-bold mb-4">Rules & Privacy</h3>
        <p className="text-sm text-slate-400 mb-4">Update terms and conditions.</p>
        <Button variant="outline">Edit Documents</Button>
      </Card>
    </div>
  );
}
