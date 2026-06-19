import RECIPES from '../data/recipes.json';

export class ItemService {
  /**
   * Sinh toàn bộ cây dữ liệu Destiny Board từ recipes.json
   * Lọc bỏ những category là resources
   */
  static generateDestinyBoard() {
    const tree = [];
    const catMap = new Map();

    RECIPES.forEach(recipe => {
      // Bỏ qua category resources vì sẽ cho vào hàm generateMaterialsTree
      if (recipe.category === 'resources') return;

      const catId = recipe.category || 'other';
      const subCatId = recipe.subcategory || 'other';
      const tierId = `Tier ${recipe.tier}`;

      // Build Category
      if (!catMap.has(catId)) {
         catMap.set(catId, { id: catId, name: catId.toUpperCase(), children: [], subMap: new Map() });
         tree.push(catMap.get(catId));
      }
      const catObj = catMap.get(catId);

      // Build SubCategory
      if (!catObj.subMap.has(subCatId)) {
         const newSub = { id: `${catId}_${subCatId}`, name: subCatId.toUpperCase(), children: [], tierMap: new Map() };
         catObj.subMap.set(subCatId, newSub);
         catObj.children.push(newSub);
      }
      const subCatObj = catObj.subMap.get(subCatId);

      // Build Tier
      if (!subCatObj.tierMap.has(tierId)) {
         const newTier = { id: `${catId}_${subCatId}_t${recipe.tier}`, name: tierId, children: [] };
         subCatObj.tierMap.set(tierId, newTier);
         subCatObj.children.push(newTier);
      }
      const tierObj = subCatObj.tierMap.get(tierId);

      // Sắp xếp Tier
      subCatObj.children.sort((a, b) => a.name.localeCompare(b.name));

      // Add Item
      const resources = recipe.materials.map(mat => ({
        uniqueName: mat.id,
        qty: mat.count
      }));

      tierObj.children.push({
        id: recipe.id,
        name: recipe.id, // Hiển thị tạm ID, sau có thể add LocalizedName
        uniqueName: recipe.id,
        resources: resources
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
        name: recipe.id,
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
