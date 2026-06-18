const materialDefinitions = [
  { base: 'WOOD', name: 'Gỗ (Wood)' },
  { base: 'METALBAR', name: 'Thép (Metalbar)' },
  { base: 'CLOTH', name: 'Vải (Cloth)' },
  { base: 'LEATHER', name: 'Da (Leather)' }
];

function generateMaterialsTree() {
  const tiers = [4, 5, 6];
  const enchants = [0, 1, 2, 3];

  return materialDefinitions.map(mat => ({
    id: `mat_${mat.base}`,
    name: mat.name,
    iconName: `T4_${mat.base}`, // For root icon
    children: tiers.map(tier => ({
      id: `mat_${mat.base}_t${tier}`,
      name: `Tier ${tier}`,
      children: enchants.map(enchant => {
        // T4_WOOD_LEVEL1@1
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

export const materialsData = generateMaterialsTree();
