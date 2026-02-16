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

export const StatsChart = () => {
  return (
    <div className="w-full h-64 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.1} />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 'bold' }} 
            dy={10}
          />
          <YAxis hide />
          <Tooltip 
            cursor={{fill: 'rgba(211, 255, 153, 0.05)'}}
            contentStyle={{ 
              backgroundColor: 'rgba(0,0,0,0.8)', 
              border: 'none', 
              borderRadius: '16px', 
              color: '#fff',
              fontSize: '12px',
              padding: '12px',
              backdropFilter: 'blur(10px)'
            }}
          />
          <Bar dataKey="uv" radius={[10, 10, 10, 10]} barSize={12}>
             {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.uv > 60 ? '#D3FF99' : '#374151'} />
              ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-center items-center gap-6 mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand-lime shadow-[0_0_5px_#D3FF99]"></div>
            <span>Objetivo Cumplido</span>
         </div>
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-600"></div>
            <span>En Proceso</span>
         </div>
      </div>
    </div>
  );
};