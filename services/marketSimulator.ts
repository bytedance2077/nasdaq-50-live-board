import { Stock, Candle, NewsItem } from '../types';
import { NASDAQ_50_DATA } from '../constants';

const BASE_PRICES: Record<string, number> = {
  AAPL: 175.50, MSFT: 402.10, NVDA: 850.30, GOOGL: 168.20, AMZN: 180.15,
  META: 485.90, TSLA: 170.80, AVGO: 1300.50, ASML: 950.20, COST: 750.10
};

function getRandomBasePrice() {
  return Math.random() * 200 + 50;
}

export class MarketSimulator {
  private stocks: Stock[] = [];
  private news: NewsItem[] = [];
  private lastUpdate: number = Date.now();

  constructor() {
    this.initializeMarket();
    this.generateInitialNews();
  }

  private generateCandles(basePrice: number, count: number): Candle[] {
    const candles: Candle[] = [];
    let currentPrice = basePrice;
    const now = Date.now();
    
    for (let i = count; i > 0; i--) {
      const time = now - i * 60000; // 1 minute intervals
      const volatility = currentPrice * 0.005;
      const open = currentPrice;
      const close = open + (Math.random() - 0.5) * volatility;
      const high = Math.max(open, close) + Math.random() * volatility * 0.5;
      const low = Math.min(open, close) - Math.random() * volatility * 0.5;
      
      candles.push({
        time,
        open,
        high,
        low,
        close,
        volume: Math.floor(Math.random() * 50000) + 1000
      });
      currentPrice = close;
    }
    return candles;
  }

  private initializeMarket() {
    this.stocks = NASDAQ_50_DATA.map(data => {
      const startPrice = BASE_PRICES[data.symbol] || getRandomBasePrice();
      const candles = this.generateCandles(startPrice, 60); // 60 minutes of history
      const lastCandle = candles[candles.length - 1];
      const prevClose = candles[0].open; // Simplify prev close for demo

      return {
        ...data,
        price: lastCandle.close,
        prevClose,
        change: lastCandle.close - prevClose,
        changePercent: ((lastCandle.close - prevClose) / prevClose) * 100,
        volume: candles.reduce((acc, c) => acc + c.volume, 0),
        high: Math.max(...candles.map(c => c.high)),
        low: Math.min(...candles.map(c => c.low)),
        candles
      };
    });
  }

  private generateInitialNews() {
    const sources = ['Bloomberg', 'Yahoo Finance', 'Reuters', 'CNBC'];
    this.news = this.stocks.slice(0, 5).map(stock => ({
      id: Math.random().toString(36),
      headline: `${stock.name} volume spikes as trading session begins.`,
      source: sources[Math.floor(Math.random() * sources.length)],
      timestamp: Date.now() - Math.random() * 3600000,
      relatedSymbol: stock.symbol,
      sentiment: 'NEUTRAL'
    }));
  }

  public getStocks(): Stock[] {
    return [...this.stocks];
  }

  public getNews(): NewsItem[] {
    return [...this.news].sort((a, b) => b.timestamp - a.timestamp);
  }

  public tick(): { stocks: Stock[], newNews: NewsItem | null } {
    const now = Date.now();
    this.lastUpdate = now;
    let generatedNews: NewsItem | null = null;

    this.stocks = this.stocks.map(stock => {
      const volatility = stock.sector === 'Technology' ? 0.002 : 0.001;
      const move = (Math.random() - 0.5) * volatility * stock.price;
      const newPrice = stock.price + move;
      
      // Update current candle (last one) or create new one
      const lastCandle = stock.candles[stock.candles.length - 1];
      const candleDuration = 60000; // 1 min candles
      
      let newCandles = [...stock.candles];
      if (now - lastCandle.time > candleDuration) {
        // Close old candle, start new
        newCandles.push({
          time: now,
          open: newPrice,
          high: newPrice,
          low: newPrice,
          close: newPrice,
          volume: Math.floor(Math.random() * 1000)
        });
        if (newCandles.length > 100) newCandles.shift();
      } else {
        // Update existing candle
        newCandles[newCandles.length - 1] = {
          ...lastCandle,
          high: Math.max(lastCandle.high, newPrice),
          low: Math.min(lastCandle.low, newPrice),
          close: newPrice,
          volume: lastCandle.volume + Math.floor(Math.random() * 500)
        };
      }

      // Randomly generate news based on big moves
      if (!generatedNews && Math.abs(move) > stock.price * 0.0015 && Math.random() > 0.95) {
        const sentiment = move > 0 ? 'POSITIVE' : 'NEGATIVE';
        const sources = ['Dow Jones', 'Yahoo Finance', 'MarketWatch'];
        generatedNews = {
          id: Math.random().toString(36),
          headline: move > 0 
            ? `${stock.symbol} rallies breaking key intraday resistance.` 
            : `${stock.symbol} slips as selling pressure mounts.`,
          source: sources[Math.floor(Math.random() * sources.length)],
          timestamp: now,
          relatedSymbol: stock.symbol,
          sentiment
        };
        this.news.unshift(generatedNews);
        if (this.news.length > 20) this.news.pop();
      }

      return {
        ...stock,
        price: newPrice,
        change: newPrice - stock.prevClose,
        changePercent: ((newPrice - stock.prevClose) / stock.prevClose) * 100,
        volume: stock.volume + Math.floor(Math.random() * 1000),
        candles: newCandles,
        high: Math.max(stock.high, newPrice),
        low: Math.min(stock.low, newPrice)
      };
    });

    return { stocks: [...this.stocks], newNews: generatedNews };
  }
}

export const marketSimulator = new MarketSimulator();
