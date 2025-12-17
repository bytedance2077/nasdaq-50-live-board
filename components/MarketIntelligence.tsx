import React, { useState, useEffect } from 'react';
import { Stock, NewsItem } from '../types';
import { getMarketAnalysis } from '../services/geminiService';
import { RefreshCw, Sparkles, Newspaper, TrendingUp, TrendingDown } from 'lucide-react';

interface MarketIntelligenceProps {
  stocks: Stock[];
  news: NewsItem[];
}

export const MarketIntelligence: React.FC<MarketIntelligenceProps> = ({ stocks, news }) => {
  const [activeTab, setActiveTab] = useState<'ANALYSIS' | 'NEWS'>('NEWS');
  const [analysis, setAnalysis] = useState<string>("Initializing Gemini AI market surveillance...");
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchAnalysis = async () => {
    if (loading) return;
    setLoading(true);
    const result = await getMarketAnalysis(stocks);
    setAnalysis(result);
    setLastUpdated(new Date());
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchAnalysis(), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Floating Segmented Control */}
      <div className="p-4 pb-2">
        <div className="flex p-1 bg-black/40 backdrop-blur-md rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('NEWS')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
              activeTab === 'NEWS' 
                ? 'bg-white/10 text-white shadow-lg shadow-black/20 border border-white/10' 
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            <Newspaper size={14} /> News Wire
          </button>
          <button
            onClick={() => setActiveTab('ANALYSIS')}
            className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
              activeTab === 'ANALYSIS' 
                ? 'bg-white/10 text-white shadow-lg shadow-black/20 border border-white/10' 
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            <Sparkles size={14} className={activeTab === 'ANALYSIS' ? "text-purple-400" : ""} /> AI Intel
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative">
        {activeTab === 'NEWS' ? (
          <div className="space-y-3">
            {news.map((item) => (
              <div key={item.id} className="group relative p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all cursor-default">
                <div className="absolute left-0 top-3 bottom-3 w-1 bg-white/10 rounded-r-full group-hover:bg-blue-500/50 transition-colors"></div>
                <div className="pl-3">
                    <div className="flex justify-between items-start mb-1.5">
                    <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider">{item.source}</span>
                    <span className="text-[10px] text-white/30">{new Date(item.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <h4 className="text-sm text-white/90 font-medium leading-snug group-hover:text-white transition-colors">
                    {item.headline}
                    </h4>
                    <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-md text-blue-300/80 font-mono border border-white/5">{item.relatedSymbol}</span>
                    {item.sentiment === 'POSITIVE' && <TrendingUp size={12} className="text-emerald-500" />}
                    {item.sentiment === 'NEGATIVE' && <TrendingDown size={12} className="text-red-500" />}
                    </div>
                </div>
              </div>
            ))}
            {news.length === 0 && <div className="text-center text-white/30 text-xs mt-10">Initializing wire feed...</div>}
          </div>
        ) : (
          <div className="h-full flex flex-col p-2">
             <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
              <span className="text-xs text-white/40 font-bold uppercase tracking-widest">Real-time Analysis</span>
              <button onClick={fetchAnalysis} disabled={loading} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white">
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              </button>
             </div>
             <div className="flex-1 bg-black/20 rounded-xl p-4 border border-white/5 shadow-inner">
                {loading ? (
                    <div className="space-y-4 animate-pulse opacity-50">
                    <div className="h-2 bg-white/20 rounded w-3/4"></div>
                    <div className="h-2 bg-white/20 rounded w-full"></div>
                    <div className="h-2 bg-white/20 rounded w-5/6"></div>
                    </div>
                ) : (
                <p className="text-sm text-white/80 leading-relaxed font-light tracking-wide">{analysis}</p>
                )}
             </div>
             <div className="mt-4 flex items-center justify-between text-[10px] text-white/30">
                <div className="flex items-center gap-1.5">
                    <Sparkles size={10} className="text-purple-500" />
                    <span>Gemini 2.5 Flash</span>
                </div>
                <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
