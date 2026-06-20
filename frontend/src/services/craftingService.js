export class CraftingService {
  // ── Craft profit calculation ────────────────────────────
  static calculateProfit({ rrr = 15.2, tax = 6.5, craftFee = 0, sellPrice = 0, materials = [] }) {
    const rrrVal = Number(rrr) / 100;
    const taxVal = Number(tax) / 100;
    const feeVal = Number(craftFee) || 0;

    let totalMaterialCost = 0;
    materials.forEach(mat => { totalMaterialCost += (mat.quantity * mat.unitPrice); });

    const trueMaterialCost = totalMaterialCost * (1 - rrrVal);
    const totalCost = trueMaterialCost + feeVal;
    const revenue = sellPrice * (1 - taxVal);
    const profit = revenue - totalCost;
    const profitPercent = totalCost > 0 ? (profit / totalCost) * 100 : 0;

    return {
      totalMaterialCost: Math.round(totalMaterialCost),
      trueCostPerItem: Math.round(totalCost),
      revenue: Math.round(revenue),
      profit: Math.round(profit),
      profitPercent
    };
  }

  // ── Refine profit (flat, no chain) ──────────────────────
  static calculateRefineProfit({ refinedPrice = 0, rawCost = 0, rrr = 15.2 }) {
    const rrrVal = Number(rrr) / 100;
    const effectiveCost = rawCost * (1 - rrrVal);
    const profit = refinedPrice - effectiveCost;
    const profitPercent = effectiveCost > 0 ? (profit / effectiveCost) * 100 : 0;
    return {
      effectiveCost: Math.round(effectiveCost),
      rawCost: Math.round(rawCost),
      profit: Math.round(profit),
      profitPercent
    };
  }

  // ── Transport profit ────────────────────────────────────
  static calculateTransportProfit({ buyPrice = 0, sellPrice = 0, tax = 6.5 }) {
    const taxVal = Number(tax) / 100;
    const revenue = sellPrice * (1 - taxVal);
    const profit = revenue - buyPrice;
    const profitPercent = buyPrice > 0 ? (profit / buyPrice) * 100 : 0;
    return { revenue: Math.round(revenue), profit: Math.round(profit), profitPercent };
  }

  // ── Flip profit (spread) ────────────────────────────────
  static calculateFlipProfit({ sellPriceMin = 0, buyPriceMax = 0, tax = 6.5 }) {
    const taxVal = Number(tax) / 100;
    const revenue = sellPriceMin * (1 - taxVal);
    const profit = revenue - buyPriceMax;
    const spreadPercent = buyPriceMax > 0 ? ((sellPriceMin - buyPriceMax) / buyPriceMax) * 100 : 0;
    const profitPercent = buyPriceMax > 0 ? (profit / buyPriceMax) * 100 : 0;
    return { revenue: Math.round(revenue), profit: Math.round(profit), profitPercent, spreadPercent };
  }

  // ── Focus simulation ────────────────────────────────────
  // With focus, effective RRR increases (common rates: base 15.2%, focus ~47.9%)
  static getFocusRrr(baseRrr) {
    const base = parseFloat(baseRrr);
    // Focus roughly triples the return rate, capped at ~53%
    return Math.min(base * 3.15, 53).toFixed(1);
  }

  // ── Format helpers ──────────────────────────────────────
  static formatSilver(amount) {
    if (!amount || amount === 0) return '--';
    if (Math.abs(amount) >= 1_000_000) return (amount / 1_000_000).toFixed(1) + 'M';
    if (Math.abs(amount) >= 1_000) return (amount / 1_000).toFixed(1) + 'k';
    return amount.toString();
  }

  static formatSilverFull(amount) {
    if (!amount || amount === 0) return '--';
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  static profitColor(profit) {
    if (profit > 0) return 'text-trading-up';
    if (profit < 0) return 'text-trading-down';
    return 'text-body';
  }

  static profitBgColor(profit) {
    if (profit > 0) return 'bg-trading-up/10 text-trading-up';
    if (profit < 0) return 'bg-trading-down/10 text-trading-down';
    return 'bg-body/10 text-body';
  }
}
