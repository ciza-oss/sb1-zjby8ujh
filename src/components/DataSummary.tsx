import React from 'react';
import { FileText, TrendingUp } from 'lucide-react';

interface DataSummaryProps {
  stats: Record<string, { min: number; max: number; avg: number; count: number }>;
}

export function DataSummary({ stats }: DataSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(stats).map(([column, stat]) => (
        <div key={column} className="bg-white p-4 rounded-lg shadow-md border border-indigo-100">
          <h3 className="text-lg font-semibold text-indigo-900 mb-2 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            {column}
          </h3>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Minimum: <span className="font-medium">{stat.min.toFixed(2)}</span>
            </p>
            <p className="text-sm text-gray-600">
              Maximum: <span className="font-medium">{stat.max.toFixed(2)}</span>
            </p>
            <p className="text-sm text-gray-600">
              Moyenne: <span className="font-medium">{stat.avg.toFixed(2)}</span>
            </p>
            <p className="text-sm text-gray-600">
              Nombre: <span className="font-medium">{stat.count}</span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}