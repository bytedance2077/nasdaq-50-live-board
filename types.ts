export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Stock {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  prevClose: number;
  candles: Candle[]; // Replaces simple history
}

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  timestamp: number;
  relatedSymbol: string;
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: 'ABOVE' | 'BELOW';
  active: boolean;
}
