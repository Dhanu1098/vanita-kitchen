'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';

export default function DatabaseCheck() {
  const [dbStatus, setDbStatus] = useState<'checking' | 'connected' | 'error' | 'no-tables'>('checking');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    checkDatabase();
  }, []);

  const checkDatabase = async () => {
    try {
      // Check if we can connect to database
      const { data, error: menuError } = await supabase
        .from('menu_items')
        .select('count');
      
      if (menuError) {
        if (menuError.message.includes('relation') || menuError.message.includes('does not exist')) {
          setDbStatus('no-tables');
          setError('Database tables not found. Please run the setup SQL.');
        } else {
          setDbStatus('error');
          setError(menuError.message);
        }
      } else {
        setDbStatus('connected');
      }
    } catch (err: any) {
      setDbStatus('error');
      setError(err.message);
    }
  };

  if (dbStatus === 'checking') {
    return null; // Don't show anything while checking
  }

  if (dbStatus === 'connected') {
    return null; // Everything is good, don't show anything
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md animate-in slide-in-from-top">
      <div className={`rounded-lg p-4 shadow-lg ${
        dbStatus === 'no-tables' ? 'bg-yellow-50 border-2 border-yellow-400' : 'bg-red-50 border-2 border-red-400'
      }`}>
        <div className="flex items-start gap-3">
          {dbStatus === 'no-tables' ? (
            <AlertTriangle size={24} className="text-yellow-600 flex-shrink-0" />
          ) : (
            <AlertTriangle size={24} className="text-red-600 flex-shrink-0" />
          )}
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">
              {dbStatus === 'no-tables' ? 'Database Setup Required' : 'Database Connection Error'}
            </h3>
            {dbStatus === 'no-tables' ? (
              <>
                <p className="text-sm text-gray-700 mb-3">
                  Database tables are not created yet. Please follow these steps:
                </p>
                <ol className="text-sm text-gray-700 space-y-2 mb-3 list-decimal list-inside">
                  <li>Open Supabase Dashboard</li>
                  <li>Go to SQL Editor</li>
                  <li>Run the <code className="bg-yellow-100 px-1">DATABASE_SETUP.sql</code> file</li>
                </ol>
                <a 
                  href="https://supabase.com/dashboard" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium"
                >
                  Open Supabase Dashboard
                  <ExternalLink size={16} />
                </a>
              </>
            ) : (
              <>
                <p className="text-sm text-red-700 mb-2">{error}</p>
                <p className="text-xs text-red-600">
                  Check your .env.local file and Supabase credentials.
                </p>
              </>
            )}
          </div>
          <button 
            onClick={() => setDbStatus('connected')}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

