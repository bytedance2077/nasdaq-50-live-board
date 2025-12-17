import React, { useState } from 'react';
import { PriceAlert, Stock } from '../types';
import { Bell, Trash2, Plus, X } from 'lucide-react';

interface AlertsPanelProps {
  alerts: PriceAlert[];
  stocks: Stock[];
  onAddAlert: (symbol: string, price: number, condition: 'ABOVE' | 'BELOW') => void;
  onRemoveAlert: (id: string) => void;
  onClose: () => void;
}

export const AlertsPanel: React.FC<AlertsPanelProps> = ({ alerts, stocks, onAddAlert, onRemoveAlert, onClose }) => {
  const [symbol, setSymbol] = useState(stocks[0]?.symbol || 'AAPL');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (price && !isNaN(parseFloat(price))) {
      onAddAlert(symbol, parseFloat(price), condition);
      setPrice('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in bg-black/60 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md rounded-2xl shadow-2xl border border-white/10 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
          <h3 className="text-lg font-bold flex items-center gap-2 text-white">
            <div className="p-1.5 bg-blue-500/20 rounded-lg">
                <Bell size={18} className="text-blue-400" />
            </div>
            Price Alerts
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Add Alert Form */}
          <form onSubmit={handleSubmit} className="space-y-4 bg-black/20 p-4 rounded-xl border border-white/5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase text-white/40 font-bold block mb-1.5">Symbol</label>
                <div className="relative">
                    <select 
                    value={symbol} 
                    onChange={(e) => setSymbol(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 appearance-none"
                    >
                    {stocks.map(s => <option key={s.symbol} value={s.symbol} className="bg-[#13151c]">{s.symbol}</option>)}
                    </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase text-white/40 font-bold block mb-1.5">Condition</label>
                <select 
                  value={condition} 
                  onChange={(e) => setCondition(e.target.value as any)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 appearance-none"
                >
                  <option value="ABOVE" className="bg-[#13151c]">Above (&ge;)</option>
                  <option value="BELOW" className="bg-[#13151c]">Below (&le;)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase text-white/40 font-bold block mb-1.5">Target Price</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                    <span className="absolute left-3 top-2 text-white/30">$</span>
                    <input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg pl-6 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50"
                    />
                </div>
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 rounded-lg text-sm font-medium transition-colors shadow-neon-blue"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>
          </form>

          {/* Active Alerts List */}
          <div>
            <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3">Active Monitors</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
              {alerts.length === 0 ? (
                <div className="text-center py-6 text-sm text-white/20 italic bg-white/[0.02] rounded-xl border border-white/5 border-dashed">
                    No active alerts configured.
                </div>
              ) : (
                alerts.map(alert => (
                  <div key={alert.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5 group hover:border-white/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="font-bold text-sm w-14 text-white bg-black/20 text-center py-1 rounded">{alert.symbol}</div>
                      <span className="text-xs text-white/60">
                        {alert.condition === 'ABOVE' ? 'Target >=' : 'Target <='} 
                        <span className="text-white ml-1 font-mono text-emerald-400">${alert.targetPrice}</span>
                      </span>
                    </div>
                    <button 
                      onClick={() => onRemoveAlert(alert.id)}
                      className="text-white/30 hover:text-red-400 transition-colors p-1.5 rounded-md hover:bg-white/5"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
