import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

const data = [
  { name: 'LU', uv: 20 },
  { name: 'MA', uv: 45 },
  { name: 'MI', uv: 30 },
  { name: 'JU', uv: 80 },
  { name: 'VI', uv: 60 },
  { name: 'SÁ', uv: 40 },
  { name: 'DO', uv: 90 },
];

export const StatsChart = ({ isDarkMode = true, labels }: { isDarkMode?: boolean, labels?: { target: string, process: string } }) => {
  return (
    <div className="w-full h-64 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke={isDarkMode ? '#333' : '#eee'} />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: isDarkMode ? '#6b7280' : '#4b5563', fontWeight: 'bold' }} 
            dy={10}
          />
          <YAxis hide />
          <Tooltip 
            cursor={{fill: isDarkMode ? 'rgba(163, 230, 53, 0.05)' : 'rgba(163, 230, 53, 0.1)'}}
            contentStyle={{ 
              backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.9)', 
              border: isDarkMode ? 'none' : '1px solid #eee', 
              borderRadius: '16px', 
              color: isDarkMode ? '#fff' : '#000',
              fontSize: '12px',
              padding: '12px',
              backdropFilter: 'blur(10px)'
            }}
          />
          <Bar dataKey="uv" radius={[10, 10, 10, 10]} barSize={12}>
             {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.uv > 60 ? '#a3e635' : (isDarkMode ? '#374151' : '#e5e7eb')} />
              ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-center items-center gap-6 mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand-lime shadow-[0_0_5px_#a3e635]"></div>
            <span className="dark:text-gray-400">{labels?.target || "Objetivo Cumplido"}</span>
         </div>
         <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`}></div>
            <span className="dark:text-gray-400">{labels?.process || "En Proceso"}</span>
         </div>
      </div>
    </div>
  );
};
