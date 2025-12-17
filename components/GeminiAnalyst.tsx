import React, { useState, useEffect } from 'react';
import { Stock } from '../types';
import { getMarketAnalysis } from '../services/geminiService';
import { Bot, RefreshCw, Sparkles } from 'lucide-react';

interface GeminiAnalystProps {
  stocks: Stock[];
}

export const GeminiAnalyst: React.FC<GeminiAnalystProps> = ({ stocks }) => {
  const [analysis, setAnalysis] = useState<string>("Initializing market surveillance AI...");
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

  // Auto-fetch on mount once
  useEffect(() => {
    // Small delay to let stocks populate
    const timer = setTimeout(() => {
      fetchAnalysis();
    }, 2000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return (
    <div className="bg-market-card rounded-xl border border-market-border p-5 flex flex-col h-full relative overflow-hidden">
      {/* Decorative gradient */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -z-0"></div>

      <div className="flex justify-between items-center mb-4 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-purple-500/20 p-1.5 rounded-lg">
            <Sparkles size={18} className="text-purple-400" />
          </div>
          <h3 className="font-semibold text-white">Gemini Market Lens</h3>
        </div>
        <button 
          onClick={fetchAnalysis}
          disabled={loading}
          className={`p-2 rounded-lg bg-market-border hover:bg-slate-700 transition-colors ${loading ? 'animate-spin' : ''}`}
        >
          <RefreshCw size={16} className="text-market-text" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto relative z-10">
        {loading ? (
           <div className="space-y-3 animate-pulse">
             <div className="h-4 bg-slate-800 rounded w-3/4"></div>
             <div className="h-4 bg-slate-800 rounded w-full"></div>
             <div className="h-4 bg-slate-800 rounded w-5/6"></div>
           </div>
        ) : (
          <div className="prose prose-invert prose-sm">
            <p className="text-gray-300 leading-relaxed font-sans text-sm md:text-base">
              {analysis}
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-market-border flex justify-between items-center text-xs text-market-muted z-10">
        <span>Powered by Gemini 2.5 Flash</span>
        <span>Updated: {lastUpdated.toLocaleTimeString()}</span>
      </div>
    </div>
  );
};
