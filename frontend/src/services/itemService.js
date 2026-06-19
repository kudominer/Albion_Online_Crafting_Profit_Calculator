import RECIPES from '../data/recipes.json';
import LOCALIZED_NAMES from '../data/localizedNames.json';

const formatTitle = (str) => {
  if (!str) return 'Other';
  return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

export class ItemService {
  /**
   * Sinh cây dữ liệu Marketplace: Category -> Subcategory -> Danh sách Items
   */
  static generateMarketplaceBoard() {
    const tree = [];
    const catMap = new Map();

    RECIPES.forEach(recipe => {
      // Bỏ qua resources (nguyên liệu thuần túy) khỏi danh sách Marketplace chính (sẽ có tab riêng)
      if (recipe.category === 'resources') return;

      const catId = recipe.category || 'other';
      const subCatId = recipe.subcategory || 'other';

      // Build Category
      if (!catMap.has(catId)) {
         catMap.set(catId, { id: catId, name: formatTitle(catId), children: [], subMap: new Map() });
         tree.push(catMap.get(catId));
      }
      const catObj = catMap.get(catId);

      // Build SubCategory
      if (!catObj.subMap.has(subCatId)) {
         const newSub = { id: `${catId}_${subCatId}`, name: formatTitle(subCatId), items: [] };
         catObj.subMap.set(subCatId, newSub);
         catObj.children.push(newSub);
      }
      const subCatObj = catObj.subMap.get(subCatId);

      // Add Item
      const resources = recipe.materials.map(mat => ({
        uniqueName: mat.id,
        qty: mat.count
      }));

      subCatObj.items.push({
        id: recipe.id,
        name: LOCALIZED_NAMES[recipe.id] || recipe.id,
        uniqueName: recipe.id,
        tier: recipe.tier || 4,
        enchantment: recipe.enchantmentLevel || 0,
        resources: resources
      });
    });

    // Sắp xếp
    tree.sort((a, b) => a.name.localeCompare(b.name));
    tree.forEach(cat => {
      cat.children.sort((a, b) => a.name.localeCompare(b.name));
      cat.children.forEach(subCat => {
        // Sort items by Tier then Enchantment
        subCat.items.sort((a, b) => {
          if (a.tier !== b.tier) return a.tier - b.tier;
          return a.enchantment - b.enchantment;
        });
      });
    });

    return tree;
  }

  /**
   * Sinh toàn bộ cây dữ liệu Nguyên liệu (resources) từ recipes.json
   */
  static generateMaterialsTree() {
    const tree = [];
    const subCatMap = new Map();

    RECIPES.forEach(recipe => {
      if (recipe.category !== 'resources') return;

      const subCatId = recipe.subcategory || 'other';
      const tierId = `Tier ${recipe.tier}`;

      // Build SubCategory (ví dụ: planks, metalbar)
      if (!subCatMap.has(subCatId)) {
         const newSub = { id: `mat_${subCatId}`, name: subCatId.toUpperCase(), children: [], tierMap: new Map() };
         subCatMap.set(subCatId, newSub);
         tree.push(newSub);
      }
      const subCatObj = subCatMap.get(subCatId);

      // Build Tier
      if (!subCatObj.tierMap.has(tierId)) {
         const newTier = { id: `mat_${subCatId}_t${recipe.tier}`, name: tierId, children: [] };
         subCatObj.tierMap.set(tierId, newTier);
         subCatObj.children.push(newTier);
      }
      const tierObj = subCatObj.tierMap.get(tierId);

      // Sắp xếp Tier
      subCatObj.children.sort((a, b) => a.name.localeCompare(b.name));

      // Add Item
      tierObj.children.push({
        id: recipe.id,
        name: LOCALIZED_NAMES[recipe.id] || recipe.id, // Đã đổi sang tiếng Anh chuẩn từ file JSON
        uniqueName: recipe.id
      });
    });

    return tree;
  }

  /**
   * Trích xuất toàn bộ uniqueName từ một danh sách nodes
   */
  static extractUniqueNames(nodes) {
    const itemsToFetch = [];
    const gatherLeaves = (n) => {
      if (!n.children || n.children.length === 0) {
        if (n.uniqueName) itemsToFetch.push(n.uniqueName);
        if (n.resources) {
          n.resources.forEach(res => itemsToFetch.push(res.uniqueName));
        }
      } else {
        n.children.forEach(gatherLeaves);
      }
    };
    nodes.forEach(gatherLeaves);
    return [...new Set(itemsToFetch)];
  }
}
