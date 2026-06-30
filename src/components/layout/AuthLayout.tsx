import React from 'react';
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">BS Tournament</h1>
          <p className="text-slate-400 mt-2">Gaming Tournament Platform</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
