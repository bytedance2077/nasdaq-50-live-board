import React, { useMemo } from 'react';
import { Stock, Candle } from '../types';
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Area } from 'recharts';
import { TrendingUp, TrendingDown, Maximize2 } from 'lucide-react';

interface DetailChartProps {
  stock: Stock | null;
}

const calculateSMA = (data: Candle[], period: number) => {
  return data.map((item, index, arr) => {
    if (index < period - 1) return { ...item, [`sma${period}`]: null };
    const slice = arr.slice(index - period + 1, index + 1);
    const sum = slice.reduce((acc, curr) => acc + curr.close, 0);
    return { ...item, [`sma${period}`]: sum / period };
  });
};

export const DetailChart: React.FC<DetailChartProps> = ({ stock }) => {
  const dataWithSMA = useMemo(() => {
    if (!stock) return [];
    let d = calculateSMA(stock.candles, 5);
    d = calculateSMA(d, 20);
    return d;
  }, [stock]);

  if (!stock) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-market-muted/50">
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 animate-pulse">
           <Maximize2 size={24} className="opacity-50" />
        </div>
        <p className="text-sm tracking-wider uppercase font-medium">Select Asset to Initialize Stream</p>
      </div>
    );
  }

  const isUp = stock.change >= 0;
  const color = isUp ? '#34d399' : '#f87171'; // Emerald/Red

  return (
    <div className="h-full flex flex-col bg-transparent">
      {/* Header */}
      <div className="p-5 border-b border-white/5 flex justify-between items-start bg-white/[0.02]">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white tracking-tight drop-shadow-md">{stock.symbol}</h2>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white/60 border border-white/5">
              {stock.sector}
            </span>
          </div>
          <div className="text-white/40 text-xs mt-1 font-medium">{stock.name}</div>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-mono font-bold tracking-tighter ${isUp ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]' : 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.3)]'} transition-colors duration-300`}>
            {stock.price.toFixed(2)}
          </div>
          <div className={`flex items-center justify-end gap-1.5 text-xs font-semibold mt-1 ${isUp ? 'text-emerald-500' : 'text-red-500'}`}>
            {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 px-2 py-4 min-h-[250px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={dataWithSMA}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorVol" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fff" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#fff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" hide />
            <YAxis 
              yAxisId="price"
              domain={['auto', 'auto']} 
              orientation="right" 
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontFamily: 'JetBrains Mono' }} 
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <YAxis 
              yAxisId="vol"
              orientation="left"
              tick={false}
              axisLine={false}
              width={0}
              domain={[0, 'dataMax * 5']} 
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(18, 18, 23, 0.9)', 
                backdropFilter: 'blur(10px)',
                borderColor: 'rgba(255,255,255,0.1)', 
                color: '#f3f4f6',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
              }}
              cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
              labelFormatter={(ts) => new Date(ts).toLocaleTimeString()}
              itemStyle={{ fontSize: '12px' }}
            />
            <ReferenceLine y={stock.prevClose} yAxisId="price" stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
            
            {/* Volume */}
            <Bar dataKey="volume" yAxisId="vol" fill="url(#colorVol)" radius={[2, 2, 0, 0]} barSize={4} />

            {/* Price Area */}
            <Area
              yAxisId="price"
              type="monotone"
              dataKey="close"
              stroke={color}
              strokeWidth={2}
              fill="url(#colorPrice)"
            />
            
            {/* Moving Averages - thinner, cleaner */}
            <Line 
              yAxisId="price"
              type="monotone" 
              dataKey="sma5" 
              stroke="#fbbf24" // Amber
              strokeWidth={1} 
              dot={false}
              strokeOpacity={0.8}
            />
            <Line 
              yAxisId="price"
              type="monotone" 
              dataKey="sma20" 
              stroke="#a855f7" // Purple
              strokeWidth={1} 
              dot={false}
              strokeOpacity={0.8}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="flex gap-6 px-6 pb-4 text-[10px] text-white/40 justify-center font-medium uppercase tracking-widest">
        <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_5px_rgba(251,191,36,0.5)]"></div> MA(5)</span>
        <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_5px_rgba(168,85,247,0.5)]"></div> MA(20)</span>
      </div>
    </div>
  );
};
