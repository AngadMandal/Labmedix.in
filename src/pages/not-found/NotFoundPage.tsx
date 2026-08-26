import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-white">
      <div className="w-20 h-20 rounded-3xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-6 text-3xl font-black">
        404
      </div>
      <h2 className="text-2xl font-black">Page Not Found</h2>
      <p className="text-xs text-slate-400 max-w-sm mt-2 mb-6">
        The requested healthcare portal page or record does not exist or has been moved.
      </p>
      <Button variant="primary" leftIcon={<Home className="w-4 h-4" />} onClick={() => navigate('/dashboard')}>
        Return to Dashboard
      </Button>
    </div>
  );
};