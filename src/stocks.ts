import axios from "axios";

interface StockData {
  [symbol: string]: {
    quantity: number;
    previousClose: number;
    regularMarketPrice: number;
  };
}

const stocks: StockData = {
  "BANKBARODA.NS": { quantity: 5, previousClose: 0.0, regularMarketPrice: 0.0 },
  "JINDALSTEL.NS": { quantity: 9, previousClose: 0.0, regularMarketPrice: 0.0 },
  "HDFCBANK.NS": { quantity: 8, previousClose: 0.0, regularMarketPrice: 0.0 },
  "JPPOWER.NS": { quantity: 13, previousClose: 0.0, regularMarketPrice: 0.0 },
  "AJANTSOY.BO": { quantity: 21, previousClose: 0.0, regularMarketPrice: 0.0 },
  "RTNPOWER.NS": { quantity: 7, previousClose: 0.0, regularMarketPrice: 0.0 },
  "TATASTEEL.NS": { quantity: 10, previousClose: 0.0, regularMarketPrice: 0.0 },
  "INDIGO.NS": { quantity: 14, previousClose: 0.0, regularMarketPrice: 0.0 },
  "BAJFINANCE.NS": { quantity: 3, previousClose: 0.0, regularMarketPrice: 0.0 },
  "ITC.NS": { quantity: 10, previousClose: 0.0, regularMarketPrice: 0.0 },
};

console.log(stocks, '\n\n');
const fetchStockData = async (symbol: string): Promise<{ previousClose: number; regularMarketPrice: number }> => {
    const apiUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?close=adjusted`;

    try {
        const response = await axios.get(apiUrl);
        const { chart } = response.data;

        return {
            previousClose: chart.result[0].meta.previousClose,
            regularMarketPrice: chart.result[0].meta.regularMarketPrice
        };
    } catch (error: any) {
        console.error(`Error fetching data for ${symbol}:`, error.message);
        return {previousClose: 0.0, regularMarketPrice: 0.0}
    }
};

const updatePrices = async (stocks: StockData): Promise<void> => {
    await Promise.all(
        Object.entries(stocks).map(async ([symbol]) => {
            const { previousClose, regularMarketPrice } = await fetchStockData(symbol);

            stocks[symbol].previousClose = previousClose;
            stocks[symbol].regularMarketPrice = regularMarketPrice;
        })
    )
}