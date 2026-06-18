import { ITEM_DEFINITIONS, MATERIAL_DEFINITIONS } from '../core/constants';

export class ItemService {
  /**
   * Sinh toàn bộ cây dữ liệu Destiny Board từ định nghĩa
   */
  static generateDestinyBoard() {
    const tiers = [4, 5, 6];
    const enchants = [0, 1, 2, 3];

    return ITEM_DEFINITIONS.map(root => ({
      id: root.id,
      name: root.name,
      iconName: root.iconName,
      children: root.subCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        children: tiers.map(tier => ({
          id: `${cat.id}_t${tier}`,
          name: `Tier ${tier}`,
          children: cat.items.flatMap(item => {
            return enchants.map(enchant => {
              const uniqueName = `T${tier}_${item.base}${enchant > 0 ? '@' + enchant : ''}`;
              const displayName = `${item.name} T${tier}.${enchant}`;
              
              const mappedResources = item.resources.map(res => {
                const matEnchantSuffix = enchant > 0 ? `_LEVEL${enchant}@${enchant}` : '';
                return {
                  uniqueName: `T${tier}_${res.type}${matEnchantSuffix}`,
                  qty: res.qty
                };
              });

              return {
                id: uniqueName,
                name: displayName,
                uniqueName: uniqueName,
                resources: mappedResources
              };
            });
          })
        }))
      }))
    }));
  }

  /**
   * Sinh toàn bộ cây dữ liệu Nguyên liệu
   */
  static generateMaterialsTree() {
    const tiers = [4, 5, 6];
    const enchants = [0, 1, 2, 3];

    return MATERIAL_DEFINITIONS.map(mat => ({
      id: `mat_${mat.base}`,
      name: mat.name,
      iconName: `T4_${mat.base}`,
      children: tiers.map(tier => ({
        id: `mat_${mat.base}_t${tier}`,
        name: `Tier ${tier}`,
        children: enchants.map(enchant => {
          const uniqueName = `T${tier}_${mat.base}${enchant > 0 ? '_LEVEL' + enchant + '@' + enchant : ''}`;
          const displayName = `${mat.name.split(' ')[0]} T${tier}.${enchant}`;
          return {
            id: uniqueName,
            name: displayName,
            uniqueName: uniqueName
          };
        })
      }))
    }));
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
