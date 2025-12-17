import React, { useState, useEffect, useRef } from 'react';
import { marketSimulator } from './services/marketSimulator';
import { Stock, NewsItem, PriceAlert } from './types';
import { TickerTape } from './components/TickerTape';
import { StockHeatmap } from './components/StockHeatmap';
import { DetailChart } from './components/DetailChart';
import { MarketIntelligence } from './components/MarketIntelligence';
import { AlertsPanel } from './components/AlertsPanel';
import { LayoutDashboard, Bell, X, Search } from 'lucide-react';

const App: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  
  // Alerts State
  const [showAlertsPanel, setShowAlertsPanel] = useState(false);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [triggeredAlert, setTriggeredAlert] = useState<string | null>(null);

  const intervalRef = useRef<number | null>(null);

  // Add Alert Logic
  const handleAddAlert = (symbol: string, targetPrice: number, condition: 'ABOVE' | 'BELOW') => {
    const newAlert: PriceAlert = {
      id: Math.random().toString(36),
      symbol,
      targetPrice,
      condition,
      active: true
    };
    setAlerts(prev => [...prev, newAlert]);
  };

  const handleRemoveAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  // Check alerts against live data
  const checkAlerts = (currentStocks: Stock[]) => {
    currentStocks.forEach(stock => {
      alerts.forEach(alert => {
        if (alert.symbol === stock.symbol && alert.active) {
          let triggered = false;
          if (alert.condition === 'ABOVE' && stock.price >= alert.targetPrice) triggered = true;
          if (alert.condition === 'BELOW' && stock.price <= alert.targetPrice) triggered = true;

          if (triggered) {
            setTriggeredAlert(`PRICE ALERT: ${stock.symbol} reached ${stock.price.toFixed(2)} (${alert.condition} ${alert.targetPrice})`);
            handleRemoveAlert(alert.id);
            setTimeout(() => setTriggeredAlert(null), 5000);
          }
        }
      });
    });
  };

  useEffect(() => {
    setStocks(marketSimulator.getStocks());
    setNews(marketSimulator.getNews());

    intervalRef.current = window.setInterval(() => {
      const { stocks: updatedStocks, newNews } = marketSimulator.tick();
      setStocks(updatedStocks);
      
      if (newNews) {
        setNews(prev => [newNews, ...prev].slice(0, 50));
      }
      
      checkAlerts(updatedStocks);
      
      setSelectedStock(prev => {
        if (!prev) return null;
        return updatedStocks.find(s => s.symbol === prev.symbol) || prev;
      });
    }, 1500);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [alerts]);

  return (
    <div className="flex flex-col h-screen text-market-text overflow-hidden selection:bg-market-accent selection:text-white font-sans">
      {/* Toast Notification */}
      {triggeredAlert && (
        <div className="fixed top-24 right-6 z-50 glass-panel border-l-4 border-l-red-500 text-white px-6 py-4 rounded-r-xl shadow-glass flex items-center gap-4 animate-fade-in">
           <div className="bg-red-500/20 p-2 rounded-full">
             <Bell size={18} className="text-red-400 animate-pulse" />
           </div>
           <div>
             <div className="text-[10px] uppercase tracking-wider text-red-300 font-semibold">Alert Triggered</div>
             <span className="font-medium text-sm">{triggeredAlert}</span>
           </div>
           <button onClick={() => setTriggeredAlert(null)} className="opacity-50 hover:opacity-100 transition-opacity"><X size={16} /></button>
        </div>
      )}

      {/* Glass Header */}
      <header className="h-16 px-6 z-30 flex items-center justify-between glass-panel mx-4 mt-4 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center shadow-neon-blue">
            <LayoutDashboard size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-none text-white">NASDAQ<span className="text-blue-400 font-light">50</span></h1>
            <div className="text-[10px] text-blue-200/60 uppercase tracking-widest font-semibold">Liquid Terminal</div>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="hidden md:flex items-center gap-2 bg-black/20 rounded-full px-4 py-2 border border-white/5">
              <Search size={14} className="text-market-muted" />
              <input type="text" placeholder="Search ticker..." className="bg-transparent text-sm focus:outline-none text-white placeholder-market-muted w-32" />
           </div>

           <button 
             onClick={() => setShowAlertsPanel(true)}
             className="relative p-2.5 bg-white/5 hover:bg-white/10 rounded-full transition-all border border-white/5 group hover:shadow-neon-blue"
           >
             <Bell size={18} className={alerts.length > 0 ? "text-blue-400" : "text-market-muted group-hover:text-white"} />
             {alerts.length > 0 && (
               <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full shadow-neon-red border-2 border-[#121217]"></span>
             )}
           </button>

           <div className="flex items-center gap-2 text-xs font-mono font-bold text-market-up bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 shadow-neon-green">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              MARKET OPEN
           </div>
        </div>
      </header>

      {/* Floating Ticker */}
      <div className="px-4 mt-4">
        <TickerTape stocks={stocks} />
      </div>

      {/* Main Content Grid */}
      <main className="flex-1 p-4 grid grid-cols-12 gap-4 overflow-hidden">
        
        {/* Left Col: Heatmap */}
        <section className="col-span-12 lg:col-span-7 flex flex-col min-h-0 glass-panel rounded-3xl p-1 overflow-hidden transition-all hover:shadow-glass">
          <div className="px-5 py-4 flex justify-between items-center border-b border-white/5 bg-white/[0.02]">
             <h2 className="text-sm font-semibold text-white/90 flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-neon-blue"></span>
               Market Overview
             </h2>
             <div className="text-[10px] text-market-muted uppercase tracking-wider">Top 50 Constituents</div>
          </div>
          <div className="flex-1 p-4 overflow-hidden">
            <StockHeatmap 
              stocks={stocks} 
              selectedSymbol={selectedStock?.symbol || null}
              onSelectStock={setSelectedStock}
            />
          </div>
        </section>

        {/* Right Col: Detail + Intelligence */}
        <section className="col-span-12 lg:col-span-5 flex flex-col gap-4 min-h-0">
          
          {/* Detail Chart */}
          <div className="flex-[3] min-h-0 glass-panel rounded-3xl overflow-hidden shadow-glass relative">
             <DetailChart stock={selectedStock || (stocks.length > 0 ? stocks[0] : null)} />
          </div>

          {/* Market Intelligence */}
          <div className="flex-[2] min-h-0 glass-panel rounded-3xl overflow-hidden shadow-glass relative">
            <MarketIntelligence stocks={stocks} news={news} />
          </div>

        </section>

      </main>

      {/* Alerts Modal */}
      {showAlertsPanel && (
        <AlertsPanel 
          stocks={stocks} 
          alerts={alerts}
          onAddAlert={handleAddAlert}
          onRemoveAlert={handleRemoveAlert}
          onClose={() => setShowAlertsPanel(false)} 
        />
      )}
    </div>
  );
};

export default App;
