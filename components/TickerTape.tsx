import React from 'react';
import { Stock } from '../types';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface TickerTapeProps {
  stocks: Stock[];
}

export const TickerTape: React.FC<TickerTapeProps> = ({ stocks }) => {
  return (
    <div className="w-full glass-panel rounded-xl h-10 overflow-hidden flex items-center relative z-20 shadow-glass-sm border border-white/5">
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#121217]/80 to-transparent z-10"></div>
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#121217]/80 to-transparent z-10"></div>
      
      <div className="animate-[scroll_60s_linear_infinite] whitespace-nowrap flex gap-8 items-center px-4 hover:[animation-play-state:paused] cursor-default">
        {[...stocks, ...stocks].map((stock, idx) => (
          <div key={`${stock.symbol}-${idx}`} className="flex items-center space-x-2 group">
            <span className="font-bold text-white/80 text-xs group-hover:text-white transition-colors">{stock.symbol}</span>
            <span className={`text-[10px] font-mono flex items-center font-medium ${stock.change >= 0 ? 'text-market-up drop-shadow-[0_0_5px_rgba(52,211,153,0.3)]' : 'text-market-down drop-shadow-[0_0_5px_rgba(248,113,113,0.3)]'}`}>
              {stock.change >= 0 ? <ArrowUp size={10} className="mr-0.5" /> : <ArrowDown size={10} className="mr-0.5" />}
              {Math.abs(stock.change).toFixed(2)}
            </span>
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};
