import RECIPES from '../data/recipes.json';
import LOCALIZED_NAMES from '../data/localizedNames.json';

const formatTitle = (str) => {
  if (!str) return 'Other';
  return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
};

const mapMarketplaceCategory = (recipe) => {
  const cat = recipe.category || 'other';
  const sub = recipe.subcategory || 'other';

  if (cat === 'melee' || cat === 'magic' || cat === 'ranged') {
    return { category: 'Weapons', subcategory: formatTitle(sub) };
  }
  if (cat === 'armor') {
    if (sub.includes('helmet')) return { category: 'Head Armor', subcategory: formatTitle(sub) };
    if (sub.includes('armor')) return { category: 'Chest Armor', subcategory: formatTitle(sub) };
    if (sub.includes('shoes')) return { category: 'Foot Armor', subcategory: formatTitle(sub) };
  }
  if (cat === 'offhand') {
    return { category: 'Off-Hands', subcategory: formatTitle(sub) };
  }
  if (cat === 'accessories') {
    if (sub === 'cape') return { category: 'Capes', subcategory: formatTitle(sub) };
    if (sub === 'bag') return { category: 'Bags', subcategory: formatTitle(sub) };
  }
  if (cat === 'mounts') return { category: 'Mount', subcategory: formatTitle(sub) };
  if (cat === 'products' && sub === 'cooked') return { category: 'Consumable', subcategory: formatTitle(sub) };
  if (cat === 'gatherergear') return { category: 'Gathering Equipment', subcategory: formatTitle(sub) };
  if (cat === 'materials') return { category: 'Crafting', subcategory: formatTitle(sub) };
  if (cat === 'artefacts') return { category: 'Artifact', subcategory: formatTitle(sub) };
  if (cat === 'products' && sub === 'farming') return { category: 'Farming', subcategory: formatTitle(sub) };
  
  return { category: 'Other', subcategory: formatTitle(sub) };
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

      const mapping = mapMarketplaceCategory(recipe);
      const catId = mapping.category;
      const subCatId = mapping.subcategory;

      // Build Category
      if (!catMap.has(catId)) {
         catMap.set(catId, { id: catId, name: catId, children: [], subMap: new Map() });
         tree.push(catMap.get(catId));
      }
      const catObj = catMap.get(catId);

      // Build SubCategory
      if (!catObj.subMap.has(subCatId)) {
         const newSub = { id: `${catId}_${subCatId}`, name: subCatId, items: [] };
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

    // Custom sort order based on Albion Marketplace
    const order = [
      'Weapons', 'Chest Armor', 'Head Armor', 'Foot Armor', 
      'Off-Hands', 'Capes', 'Bags', 'Mount', 'Consumable', 
      'Gathering Equipment', 'Crafting', 'Artifact', 
      'Farming', 'Furniture', 'Vanity', 'Other'
    ];

    tree.sort((a, b) => {
      const idxA = order.indexOf(a.id);
      const idxB = order.indexOf(b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.name.localeCompare(b.name);
    });

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
