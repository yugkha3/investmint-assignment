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

const fetchStockData = async (
  symbol: string
): Promise<{ previousClose: number; regularMarketPrice: number }> => {
  const apiUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?close=adjusted`;

  try {
    const response = await axios.get(apiUrl);
    const { chart } = response.data;

    return {
      previousClose: chart.result[0].meta.previousClose,
      regularMarketPrice: chart.result[0].meta.regularMarketPrice,
    };
  } catch (error: any) {
    console.error(`Error fetching data for ${symbol}:`, error.message);
    return { previousClose: 0.0, regularMarketPrice: 0.0 };
  }
};

const updatePrices = async (stocks: StockData): Promise<void> => {
  await Promise.all(
    Object.entries(stocks).map(async ([symbol]) => {
      const { previousClose, regularMarketPrice } = await fetchStockData(
        symbol
      );

      stocks[symbol].previousClose = previousClose;
      stocks[symbol].regularMarketPrice = regularMarketPrice;
    })
  );
};

enum PriceType {
  RegularMarketPrice = "regularMarketPrice",
  PreviousClose = "previousClose",
}

const calculateTotalPortfolio = (priceType: PriceType): number => {
  let totalPortfolio = 0;

  Object.entries(stocks).forEach(([symbol, stock]) => {
    const { quantity, regularMarketPrice, previousClose } = stock;
    const price =
      priceType === PriceType.RegularMarketPrice
        ? regularMarketPrice
        : previousClose;
    totalPortfolio += quantity * price;
  });

  return totalPortfolio;
};

const generatePortfolioMessage = async (stocks: StockData): Promise<string> => {
  let message = `📊Today's Portfolio Digest📊\nHere's a snapshot of your holdings and movements for today:\n\n`;

  const formatChange = (change: number): string => {
    const prefix = change >= 0 ? "+" : "-";
    return `${prefix}${Math.abs(change).toFixed(2)}`;
  };

  const getEmoji = (change: number): string => {
    if (change > 0) return "🔼";
    if (change < 0) return "🔽";
    return "";
  };

  await updatePrices(stocks);
  const currentPortfolio = calculateTotalPortfolio(
    PriceType.RegularMarketPrice
  );
  const yesterdayPortfolio = calculateTotalPortfolio(PriceType.PreviousClose);
  const totalChange = currentPortfolio - yesterdayPortfolio;

  Object.entries(stocks).forEach(([symbol, stock]) => {
    const { quantity, regularMarketPrice, previousClose } = stock;
    const priceChange = regularMarketPrice - previousClose;
    const percentageChange = (priceChange / previousClose) * 100;
    const stockChange = priceChange * quantity;

    message += `${symbol} (${quantity}) | ${regularMarketPrice.toFixed(2)}\n`;
    message += `💹 Price: ${previousClose.toFixed(
      2
    )} → ${regularMarketPrice.toFixed(2)}\n`;
    message += `${getEmoji(priceChange)} Stock Portfolio Change: ${formatChange(
      stockChange
    )} | ${formatChange(percentageChange)}%\n\n`;
  });

  const totalChangeEmoji = getEmoji(totalChange);
  message += `Overall, your portfolio value is ${formatChange(
    currentPortfolio
  )}. It changed by ${totalChangeEmoji} ${formatChange(
    totalChange
  )} | ${formatChange((totalChange / yesterdayPortfolio) * 100)}% today.\n`;
  message += `It's been an eventful day in the market. Let's keep an eye on the trends and make strategic moves!\n\n`;
  message += `💪📈 #Investmint #MarketDigest`;

  return message;
};

(async () => {
  const portfolioMessage = await generatePortfolioMessage(stocks);
  console.log(portfolioMessage);
})();
