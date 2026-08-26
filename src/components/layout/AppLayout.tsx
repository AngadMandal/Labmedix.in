import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ScreenLockModal } from './ScreenLockModal';
import { IdleSessionWarningModal } from '../common/IdleSessionWarningModal';
import { ToastContainer } from '../common/ToastContainer';
import { BackupReminderNotification } from '../common/BackupReminderNotification';

export const AppLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onCloseMobile={() => setSidebarOpen(false)} />

      {/* Main Content Area with Header */}
      <div className="lg:pl-64 flex flex-col flex-1 min-h-screen transition-all duration-200">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <ScreenLockModal />
      <IdleSessionWarningModal />
      <BackupReminderNotification />
      <ToastContainer />
    </div>
  );
};