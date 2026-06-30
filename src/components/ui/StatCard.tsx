import { type ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  color: 'purple' | 'emerald' | 'amber' | 'blue' | 'red';
  subtitle?: string;
}

const colorStyles = {
  purple: 'from-purple-500 to-indigo-600 shadow-purple-500/20',
  emerald: 'from-emerald-500 to-teal-600 shadow-emerald-500/20',
  amber: 'from-amber-500 to-orange-600 shadow-amber-500/20',
  blue: 'from-blue-500 to-cyan-600 shadow-blue-500/20',
  red: 'from-red-500 to-rose-600 shadow-red-500/20',
};

export function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colorStyles[color]} shadow-lg flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
