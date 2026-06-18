export class CraftingService {
  /**
   * Tính toán lợi nhuận và chi phí chế tạo cho một vật phẩm
   * @param {Object} item - Thông tin vật phẩm và giá
   * @param {number|string} item.rrr - Resource Return Rate (VD: 15.2)
   * @param {number|string} item.tax - Thuế sử dụng trạm (VD: 6.5)
   * @param {number|string} item.craftFee - Phí chế tạo base (VD: 1000)
   * @param {number} item.sellPrice - Giá bán ước tính
   * @param {Array} item.materials - Danh sách nguyên liệu [{ quantity, unitPrice }]
   * @returns {Object} Kết quả tính toán
   */
  static calculateProfit(item) {
    const {
      rrr = 15.2,
      tax = 6.5,
      craftFee = 0,
      sellPrice = 0,
      materials = []
    } = item;

    const rrrValue = Number(rrr) / 100;
    const taxValue = Number(tax) / 100;
    const feeValue = Number(craftFee);

    // Tính tổng chi phí nguyên liệu gốc
    let totalMaterialCost = 0;
    materials.forEach(mat => {
      totalMaterialCost += (mat.quantity * mat.unitPrice);
    });

    // Công thức tính chi phí thực tế với RRR:
    // Thực tế, RRR trả lại nguyên liệu chứ không phải giảm giá trực tiếp. 
    // Giả sử làm liên tục, chi phí sẽ xấp xỉ cost * (1 - rrr).
    // Ở đây ta dùng công thức cơ bản: TrueCost = Cost * (1 - RRR)
    const trueMaterialCost = totalMaterialCost * (1 - rrrValue);

    const totalCost = trueMaterialCost + feeValue;

    // Lợi nhuận = Doanh thu sau thuế - Tổng chi phí
    const revenue = sellPrice * (1 - taxValue);
    const profit = revenue - totalCost;

    let profitPercent = 0;
    if (totalCost > 0) {
      profitPercent = (profit / totalCost) * 100;
    }

    return {
      totalMaterialCost: Math.round(totalMaterialCost),
      trueCostPerItem: Math.round(totalCost),
      revenue: Math.round(revenue),
      profit: Math.round(profit),
      profitPercent: profitPercent
    };
  }

  static formatSilver(amount) {
    if (amount === undefined || amount === null || amount === 0) return '--';
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
}
