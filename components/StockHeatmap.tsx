import React from 'react';
import { Stock } from '../types';

interface StockHeatmapProps {
  stocks: Stock[];
  onSelectStock: (stock: Stock) => void;
  selectedSymbol: string | null;
}

export const StockHeatmap: React.FC<StockHeatmapProps> = ({ stocks, onSelectStock, selectedSymbol }) => {
  return (
    <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {stocks.map((stock) => {
          const isPositive = stock.change >= 0;
          // Calculate intensity but keep it subtle for the glass look
          const intensity = Math.min(Math.abs(stock.changePercent) / 4, 1); 
          
          // Dynamic liquid background color
          const baseColor = isPositive ? '16, 185, 129' : '239, 68, 68'; // Tailwind emerald-500 / red-500 rgb
          
          return (
            <div
              key={stock.symbol}
              onClick={() => onSelectStock(stock)}
              style={{
                background: `linear-gradient(145deg, rgba(${baseColor}, ${0.1 + intensity * 0.2}), rgba(${baseColor}, ${0.05}))`,
                borderColor: `rgba(${baseColor}, ${0.3})`
              }}
              className={`
                relative p-4 rounded-xl border cursor-pointer transition-all duration-300
                hover:scale-105 hover:z-20 hover:shadow-[0_0_20px_rgba(${baseColor},0.3)]
                group overflow-hidden backdrop-blur-md
                ${selectedSymbol === stock.symbol ? 'ring-1 ring-white/50 scale-[1.02] z-10 shadow-lg' : 'border-opacity-30'}
              `}
            >
              {/* Glossy overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

              <div className="flex justify-between items-start mb-2 relative z-10">
                <span className="font-bold text-sm tracking-wide text-white group-hover:text-white transition-colors">{stock.symbol}</span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full backdrop-blur-sm bg-black/20 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                </span>
              </div>
              <div className="text-xl font-mono font-medium text-white/90 relative z-10">
                {stock.price.toFixed(2)}
              </div>
              <div className="text-[10px] text-white/40 truncate mt-2 font-medium tracking-wide relative z-10 group-hover:text-white/60">
                {stock.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
