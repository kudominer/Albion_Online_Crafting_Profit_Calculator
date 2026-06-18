const itemDefinitions = [
  {
    id: 'head',
    name: 'Nón (Head)',
    iconName: 'T4_HEAD_CLOTH_SET1',
    subCategories: [
      {
        id: 'head_cloth',
        name: 'Nón vải',
        items: [
          { base: 'HEAD_CLOTH_SET1', name: 'Scholar Cowl', resources: [{ type: 'CLOTH', qty: 8 }] },
          { base: 'HEAD_CLOTH_SET2', name: 'Cleric Cowl', resources: [{ type: 'CLOTH', qty: 8 }] },
          { base: 'HEAD_CLOTH_SET3', name: 'Mage Cowl', resources: [{ type: 'CLOTH', qty: 8 }] }
        ]
      },
      {
        id: 'head_leather',
        name: 'Nón da',
        items: [
          { base: 'HEAD_LEATHER_SET1', name: 'Mercenary Hood', resources: [{ type: 'LEATHER', qty: 8 }] },
          { base: 'HEAD_LEATHER_SET2', name: 'Hunter Hood', resources: [{ type: 'LEATHER', qty: 8 }] },
          { base: 'HEAD_LEATHER_SET3', name: 'Assassin Hood', resources: [{ type: 'LEATHER', qty: 8 }] }
        ]
      },
      {
        id: 'head_plate',
        name: 'Nón sắt',
        items: [
          { base: 'HEAD_PLATE_SET1', name: 'Soldier Helmet', resources: [{ type: 'METALBAR', qty: 8 }] },
          { base: 'HEAD_PLATE_SET2', name: 'Knight Helmet', resources: [{ type: 'METALBAR', qty: 8 }] },
          { base: 'HEAD_PLATE_SET3', name: 'Guardian Helmet', resources: [{ type: 'METALBAR', qty: 8 }] }
        ]
      }
    ]
  },
  {
    id: 'armor',
    name: 'Áo (Armor)',
    iconName: 'T4_ARMOR_CLOTH_SET1',
    subCategories: [
      {
        id: 'armor_cloth',
        name: 'Áo vải',
        items: [
          { base: 'ARMOR_CLOTH_SET1', name: 'Scholar Robe', resources: [{ type: 'CLOTH', qty: 16 }] },
          { base: 'ARMOR_CLOTH_SET2', name: 'Cleric Robe', resources: [{ type: 'CLOTH', qty: 16 }] },
          { base: 'ARMOR_CLOTH_SET3', name: 'Mage Robe', resources: [{ type: 'CLOTH', qty: 16 }] }
        ]
      },
      {
        id: 'armor_leather',
        name: 'Áo da',
        items: [
          { base: 'ARMOR_LEATHER_SET1', name: 'Mercenary Jacket', resources: [{ type: 'LEATHER', qty: 16 }] },
          { base: 'ARMOR_LEATHER_SET2', name: 'Hunter Jacket', resources: [{ type: 'LEATHER', qty: 16 }] },
          { base: 'ARMOR_LEATHER_SET3', name: 'Assassin Jacket', resources: [{ type: 'LEATHER', qty: 16 }] }
        ]
      },
      {
        id: 'armor_plate',
        name: 'Áo giáp',
        items: [
          { base: 'ARMOR_PLATE_SET1', name: 'Soldier Armor', resources: [{ type: 'METALBAR', qty: 16 }] },
          { base: 'ARMOR_PLATE_SET2', name: 'Knight Armor', resources: [{ type: 'METALBAR', qty: 16 }] },
          { base: 'ARMOR_PLATE_SET3', name: 'Guardian Armor', resources: [{ type: 'METALBAR', qty: 16 }] }
        ]
      }
    ]
  },
  {
    id: 'shoes',
    name: 'Giày (Shoes)',
    iconName: 'T4_SHOES_CLOTH_SET1',
    subCategories: [
      {
        id: 'shoes_cloth',
        name: 'Giày vải',
        items: [
          { base: 'SHOES_CLOTH_SET1', name: 'Scholar Sandals', resources: [{ type: 'CLOTH', qty: 8 }] },
          { base: 'SHOES_CLOTH_SET2', name: 'Cleric Sandals', resources: [{ type: 'CLOTH', qty: 8 }] },
          { base: 'SHOES_CLOTH_SET3', name: 'Mage Sandals', resources: [{ type: 'CLOTH', qty: 8 }] }
        ]
      },
      {
        id: 'shoes_leather',
        name: 'Giày da',
        items: [
          { base: 'SHOES_LEATHER_SET1', name: 'Mercenary Shoes', resources: [{ type: 'LEATHER', qty: 8 }] },
          { base: 'SHOES_LEATHER_SET2', name: 'Hunter Shoes', resources: [{ type: 'LEATHER', qty: 8 }] },
          { base: 'SHOES_LEATHER_SET3', name: 'Assassin Shoes', resources: [{ type: 'LEATHER', qty: 8 }] }
        ]
      },
      {
        id: 'shoes_plate',
        name: 'Giày giáp',
        items: [
          { base: 'SHOES_PLATE_SET1', name: 'Soldier Boots', resources: [{ type: 'METALBAR', qty: 8 }] },
          { base: 'SHOES_PLATE_SET2', name: 'Knight Boots', resources: [{ type: 'METALBAR', qty: 8 }] },
          { base: 'SHOES_PLATE_SET3', name: 'Guardian Boots', resources: [{ type: 'METALBAR', qty: 8 }] }
        ]
      }
    ]
  },
  {
    id: 'weapon',
    name: 'Vũ khí',
    iconName: 'T4_MAIN_SWORD',
    subCategories: [
      {
        id: 'wp_sword',
        name: 'Sword',
        items: [
          { base: 'MAIN_SWORD', name: 'Broadsword', resources: [{ type: 'METALBAR', qty: 16 }, { type: 'LEATHER', qty: 8 }] },
          { base: '2H_CLAYMORE', name: 'Claymore', resources: [{ type: 'METALBAR', qty: 20 }, { type: 'LEATHER', qty: 12 }] },
          { base: '2H_DUALSWORD', name: 'Dual Swords', resources: [{ type: 'METALBAR', qty: 20 }, { type: 'LEATHER', qty: 12 }] }
        ]
      },
      {
        id: 'wp_axe',
        name: 'Axe',
        items: [
          { base: 'MAIN_AXE', name: 'Battleaxe', resources: [{ type: 'WOOD', qty: 16 }, { type: 'METALBAR', qty: 8 }] },
          { base: '2H_HALBERD', name: 'Halberd', resources: [{ type: 'WOOD', qty: 20 }, { type: 'METALBAR', qty: 12 }] },
          { base: '2H_AXE', name: 'Greataxe', resources: [{ type: 'WOOD', qty: 20 }, { type: 'METALBAR', qty: 12 }] }
        ]
      },
      {
        id: 'wp_mace',
        name: 'Mace',
        items: [
          { base: 'MAIN_MACE', name: 'Mace', resources: [{ type: 'METALBAR', qty: 16 }, { type: 'CLOTH', qty: 8 }] },
          { base: '2H_MACE', name: 'Heavy Mace', resources: [{ type: 'METALBAR', qty: 20 }, { type: 'CLOTH', qty: 12 }] },
          { base: 'MAIN_ROCKMACE', name: 'Morning Star', resources: [{ type: 'METALBAR', qty: 20 }, { type: 'CLOTH', qty: 12 }] }
        ]
      },
      {
        id: 'wp_hammer',
        name: 'Hammer',
        items: [
          { base: 'MAIN_HAMMER', name: 'Hammer', resources: [{ type: 'METALBAR', qty: 16 }, { type: 'WOOD', qty: 8 }] },
          { base: '2H_POLEHAMMER', name: 'Polehammer', resources: [{ type: 'METALBAR', qty: 20 }, { type: 'WOOD', qty: 12 }] },
          { base: '2H_HAMMER', name: 'Great Hammer', resources: [{ type: 'METALBAR', qty: 20 }, { type: 'WOOD', qty: 12 }] }
        ]
      },
      {
        id: 'wp_bow',
        name: 'Bow',
        items: [
          { base: '2H_BOW', name: 'Bow', resources: [{ type: 'WOOD', qty: 32 }] },
          { base: '2H_WARBOW', name: 'Warbow', resources: [{ type: 'WOOD', qty: 32 }] },
          { base: '2H_LONGBOW', name: 'Longbow', resources: [{ type: 'WOOD', qty: 32 }] }
        ]
      },
      {
        id: 'wp_crossbow',
        name: 'Crossbow',
        items: [
          { base: 'MAIN_CROSSBOW', name: 'Light Crossbow', resources: [{ type: 'WOOD', qty: 16 }, { type: 'METALBAR', qty: 8 }] },
          { base: '2H_CROSSBOW', name: 'Crossbow', resources: [{ type: 'WOOD', qty: 24 }, { type: 'METALBAR', qty: 8 }] },
          { base: '2H_CROSSBOWLARGE', name: 'Heavy Crossbow', resources: [{ type: 'WOOD', qty: 24 }, { type: 'METALBAR', qty: 8 }] }
        ]
      },
      {
        id: 'wp_dagger',
        name: 'Dagger',
        items: [
          { base: 'MAIN_DAGGER', name: 'Dagger', resources: [{ type: 'METALBAR', qty: 16 }, { type: 'LEATHER', qty: 8 }] },
          { base: '2H_DAGGERPAIR', name: 'Dagger Pair', resources: [{ type: 'METALBAR', qty: 20 }, { type: 'LEATHER', qty: 12 }] },
          { base: '2H_CLAWPAIR', name: 'Claws', resources: [{ type: 'METALBAR', qty: 20 }, { type: 'LEATHER', qty: 12 }] }
        ]
      },
      {
        id: 'wp_spear',
        name: 'Spear',
        items: [
          { base: 'MAIN_SPEAR', name: 'Spear', resources: [{ type: 'WOOD', qty: 16 }, { type: 'METALBAR', qty: 8 }] },
          { base: '2H_SPEAR', name: 'Pike', resources: [{ type: 'WOOD', qty: 20 }, { type: 'METALBAR', qty: 12 }] },
          { base: '2H_GLAIVE', name: 'Glaive', resources: [{ type: 'WOOD', qty: 20 }, { type: 'METALBAR', qty: 12 }] }
        ]
      },
      {
        id: 'wp_staff_fire',
        name: 'Fire Staff',
        items: [
          { base: 'MAIN_FIRESTAFF', name: 'Fire Staff', resources: [{ type: 'WOOD', qty: 16 }, { type: 'METALBAR', qty: 8 }] },
          { base: '2H_FIRESTAFF', name: 'Great Fire Staff', resources: [{ type: 'WOOD', qty: 20 }, { type: 'METALBAR', qty: 12 }] },
          { base: '2H_INFERNOSTAFF', name: 'Infernal Staff', resources: [{ type: 'WOOD', qty: 20 }, { type: 'METALBAR', qty: 12 }] }
        ]
      },
      {
        id: 'wp_staff_frost',
        name: 'Frost Staff',
        items: [
          { base: 'MAIN_FROSTSTAFF', name: 'Frost Staff', resources: [{ type: 'WOOD', qty: 16 }, { type: 'METALBAR', qty: 8 }] },
          { base: '2H_FROSTSTAFF', name: 'Great Frost Staff', resources: [{ type: 'WOOD', qty: 20 }, { type: 'METALBAR', qty: 12 }] },
          { base: '2H_GLACIALSTAFF', name: 'Glacial Staff', resources: [{ type: 'WOOD', qty: 20 }, { type: 'METALBAR', qty: 12 }] }
        ]
      },
      {
        id: 'wp_staff_arcane',
        name: 'Arcane Staff',
        items: [
          { base: 'MAIN_ARCANE', name: 'Arcane Staff', resources: [{ type: 'WOOD', qty: 16 }, { type: 'METALBAR', qty: 8 }] },
          { base: '2H_ARCANE', name: 'Great Arcane Staff', resources: [{ type: 'WOOD', qty: 20 }, { type: 'METALBAR', qty: 12 }] },
          { base: '2H_ENIGMATICSTAFF', name: 'Enigmatic Staff', resources: [{ type: 'WOOD', qty: 20 }, { type: 'METALBAR', qty: 12 }] }
        ]
      },
      {
        id: 'wp_staff_holy',
        name: 'Holy Staff',
        items: [
          { base: 'MAIN_HOLY', name: 'Holy Staff', resources: [{ type: 'WOOD', qty: 16 }, { type: 'CLOTH', qty: 8 }] },
          { base: '2H_HOLY', name: 'Great Holy Staff', resources: [{ type: 'WOOD', qty: 20 }, { type: 'CLOTH', qty: 12 }] },
          { base: '2H_DIVINESTAFF', name: 'Divine Staff', resources: [{ type: 'WOOD', qty: 20 }, { type: 'CLOTH', qty: 12 }] }
        ]
      },
      {
        id: 'wp_staff_nature',
        name: 'Nature Staff',
        items: [
          { base: 'MAIN_NATURESTAFF', name: 'Nature Staff', resources: [{ type: 'WOOD', qty: 16 }, { type: 'CLOTH', qty: 8 }] },
          { base: '2H_NATURESTAFF', name: 'Great Nature Staff', resources: [{ type: 'WOOD', qty: 20 }, { type: 'CLOTH', qty: 12 }] },
          { base: '2H_WILDSTAFF', name: 'Wild Staff', resources: [{ type: 'WOOD', qty: 20 }, { type: 'CLOTH', qty: 12 }] }
        ]
      }
    ]
  }
];

function generateDestinyBoard() {
  const tiers = [4, 5, 6];
  const enchants = [0, 1, 2, 3];

  return itemDefinitions.map(root => ({
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
            
            // Build real recipe materials with tier/enchant mapping
            const mappedResources = item.resources.map(res => {
              // Examples:
              // T4_WOOD (enchant 0)
              // T4_WOOD_LEVEL1@1 (enchant 1)
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

export const destinyBoardData = generateDestinyBoard();
export const rawCategories = itemDefinitions; // Để lấy iconName và name cho Tab Cha
