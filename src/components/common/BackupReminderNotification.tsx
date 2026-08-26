import React, { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { BackupService } from '../../services/backupService';
import { StorageService } from '../../services/storage';

export const BackupReminderNotification: React.FC = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Only perform check once per session load, or if navigation changes and 12 hours have elapsed
    if (hasCheckedRef.current) return;

    // Do not trigger while the user is already actively on the /backup page
    if (location.pathname === '/backup') return;

    const checkAndNotify = () => {
      const health = BackupService.checkBackupHealth(7);

      if (!health.isOverdue) return;

      const lastPromptTs = StorageService.getLastBackupPromptTimestamp();
      const sessionDismissed = sessionStorage.getItem('labmedix_backup_prompt_dismissed');

      if (sessionDismissed === 'true') return;

      // Rate limit to once per 12 hours if previously prompted across sessions
      if (lastPromptTs) {
        const hoursSincePrompt = (Date.now() - new Date(lastPromptTs).getTime()) / (1000 * 60 * 60);
        if (hoursSincePrompt < 12) return;
      }

      hasCheckedRef.current = true;
      sessionStorage.setItem('labmedix_backup_prompt_dismissed', 'true');
      StorageService.setLastBackupPromptTimestamp(new Date().toISOString());

      const message = health.daysSince === null
        ? 'No full database backup has been performed yet. Protect patient & health card records against accidental loss.'
        : `It has been ${health.daysSince} days since your last database backup (${health.lastBackupFormatted}). Regular backups ensure complete disaster recovery.`;

      // Delay slightly for smooth page entry animation
      setTimeout(() => {
        showToast(
          'warning',
          'Database Backup Recommended (7+ Days)',
          message,
          10000,
          {
            label: 'Backup Database Now',
            onClick: () => {
              navigate('/backup');
            }
          }
        );
      }, 1500);
    };

    checkAndNotify();
  }, [location.pathname, navigate, showToast]);

  return null;
};
