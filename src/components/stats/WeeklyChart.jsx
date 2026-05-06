import React, { memo } from 'react';
import { AreaChart, Area, Tooltip, ResponsiveContainer } from 'recharts';

const WeeklyChart = memo(({ data }) => (
  <ResponsiveContainer width="100%" height={180}>
    <AreaChart data={data}>
      <defs>
        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
        </linearGradient>
      </defs>
      <Tooltip 
        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
        itemStyle={{ color: '#fff' }}
      />
      <Area 
        type="monotone" 
        dataKey="amount" 
        stroke="#6366f1" 
        fillOpacity={1} 
        fill="url(#colorAmount)" 
        strokeWidth={3}
      />
    </AreaChart>
  </ResponsiveContainer>
));

export default WeeklyChart;
