import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: string;
}

export default function StatsCard({ title, value, icon: Icon, trend, color = 'primary' }: StatsCardProps) {
  const colorClasses = {
    primary: 'bg-primary-100 text-primary-600',
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600',
  };
  
  return (
    <div className="card hover:shadow-lg transition-shadow p-3 sm:p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs sm:text-sm text-gray-600 mb-1">{title}</p>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{value}</h3>
          {trend && (
            <p className={`text-xs sm:text-sm mt-1 sm:mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
        <div className={`p-2 sm:p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses] || colorClasses.primary}`}>
          <Icon size={20} className="sm:w-6 sm:h-6" />
        </div>
      </div>
    </div>
  );
}

