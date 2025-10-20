'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';

export default function DataLoader({ children }: { children: React.ReactNode }) {
  const fetchAll = useStore((state) => state.fetchAll);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchAll();
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setInitialLoading(false);
      }
    };
    
    loadData();
  }, [fetchAll]);

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading data from database...</p>
          <p className="text-gray-500 text-sm mt-2">Please wait...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}





