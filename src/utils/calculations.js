export const calculateProfit = (item) => {
  // 1. Calculate Total Material Cost
  const totalMaterialCost = item.materials.reduce(
    (sum, mat) => sum + (Number(mat.quantity) || 0) * (Number(mat.unitPrice) || 0),
    0
  );

  // 2. Calculate Effective Production Multiplier based on RRR
  // Multiplier = 1 / (1 - RRR)
  // RRR is stored as a percentage (e.g., 47.9), so we convert to decimal.
  const rrrDecimal = (Number(item.rrr) || 0) / 100;
  
  // Guard against 100% RRR (infinite multiplier) which is impossible in Albion anyway
  const safeRrrDecimal = Math.min(rrrDecimal, 0.999);
  const multiplier = 1 / (1 - safeRrrDecimal);

  // 3. True Cost Per Item
  const trueCostPerItem = totalMaterialCost / multiplier;

  // 4. Net Sell Price
  const sellPrice = Number(item.sellPrice) || 0;
  const taxDecimal = (Number(item.tax) || 0) / 100;
  const netSellPrice = sellPrice * (1 - taxDecimal);

  // 5. Profit and Profit %
  const craftFee = Number(item.craftFee) || 0;
  const profit = netSellPrice - trueCostPerItem - craftFee;
  
  // If trueCost is 0, avoid division by zero
  const profitPercent = trueCostPerItem > 0 ? (profit / trueCostPerItem) * 100 : 0;

  return {
    totalMaterialCost,
    multiplier,
    trueCostPerItem,
    netSellPrice,
    profit,
    profitPercent
  };
};

// Utility to format currency nicely
export const formatSilver = (amount) => {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
};
