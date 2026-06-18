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
          { base: 'HEAD_CLOTH_SET1', name: 'Scholar Cowl' },
          { base: 'HEAD_CLOTH_SET2', name: 'Cleric Cowl' },
          { base: 'HEAD_CLOTH_SET3', name: 'Mage Cowl' }
        ]
      },
      {
        id: 'head_leather',
        name: 'Nón da',
        items: [
          { base: 'HEAD_LEATHER_SET1', name: 'Mercenary Hood' },
          { base: 'HEAD_LEATHER_SET2', name: 'Hunter Hood' },
          { base: 'HEAD_LEATHER_SET3', name: 'Assassin Hood' }
        ]
      },
      {
        id: 'head_plate',
        name: 'Nón sắt',
        items: [
          { base: 'HEAD_PLATE_SET1', name: 'Soldier Helmet' },
          { base: 'HEAD_PLATE_SET2', name: 'Knight Helmet' },
          { base: 'HEAD_PLATE_SET3', name: 'Guardian Helmet' }
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
          { base: 'ARMOR_CLOTH_SET1', name: 'Scholar Robe' },
          { base: 'ARMOR_CLOTH_SET2', name: 'Cleric Robe' },
          { base: 'ARMOR_CLOTH_SET3', name: 'Mage Robe' }
        ]
      },
      {
        id: 'armor_leather',
        name: 'Áo da',
        items: [
          { base: 'ARMOR_LEATHER_SET1', name: 'Mercenary Jacket' },
          { base: 'ARMOR_LEATHER_SET2', name: 'Hunter Jacket' },
          { base: 'ARMOR_LEATHER_SET3', name: 'Assassin Jacket' }
        ]
      },
      {
        id: 'armor_plate',
        name: 'Áo giáp',
        items: [
          { base: 'ARMOR_PLATE_SET1', name: 'Soldier Armor' },
          { base: 'ARMOR_PLATE_SET2', name: 'Knight Armor' },
          { base: 'ARMOR_PLATE_SET3', name: 'Guardian Armor' }
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
          { base: 'SHOES_CLOTH_SET1', name: 'Scholar Sandals' },
          { base: 'SHOES_CLOTH_SET2', name: 'Cleric Sandals' },
          { base: 'SHOES_CLOTH_SET3', name: 'Mage Sandals' }
        ]
      },
      {
        id: 'shoes_leather',
        name: 'Giày da',
        items: [
          { base: 'SHOES_LEATHER_SET1', name: 'Mercenary Shoes' },
          { base: 'SHOES_LEATHER_SET2', name: 'Hunter Shoes' },
          { base: 'SHOES_LEATHER_SET3', name: 'Assassin Shoes' }
        ]
      },
      {
        id: 'shoes_plate',
        name: 'Giày giáp',
        items: [
          { base: 'SHOES_PLATE_SET1', name: 'Soldier Boots' },
          { base: 'SHOES_PLATE_SET2', name: 'Knight Boots' },
          { base: 'SHOES_PLATE_SET3', name: 'Guardian Boots' }
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
          { base: 'MAIN_SWORD', name: 'Broadsword' },
          { base: '2H_CLAYMORE', name: 'Claymore' },
          { base: '2H_DUALSWORD', name: 'Dual Swords' }
        ]
      },
      {
        id: 'wp_axe',
        name: 'Axe',
        items: [
          { base: 'MAIN_AXE', name: 'Battleaxe' },
          { base: '2H_HALBERD', name: 'Halberd' },
          { base: '2H_AXE', name: 'Greataxe' }
        ]
      },
      {
        id: 'wp_mace',
        name: 'Mace',
        items: [
          { base: 'MAIN_MACE', name: 'Mace' },
          { base: '2H_MACE', name: 'Heavy Mace' },
          { base: 'MAIN_ROCKMACE', name: 'Morning Star' }
        ]
      },
      {
        id: 'wp_hammer',
        name: 'Hammer',
        items: [
          { base: 'MAIN_HAMMER', name: 'Hammer' },
          { base: '2H_POLEHAMMER', name: 'Polehammer' },
          { base: '2H_HAMMER', name: 'Great Hammer' }
        ]
      },
      {
        id: 'wp_bow',
        name: 'Bow',
        items: [
          { base: '2H_BOW', name: 'Bow' },
          { base: '2H_WARBOW', name: 'Warbow' },
          { base: '2H_LONGBOW', name: 'Longbow' }
        ]
      },
      {
        id: 'wp_crossbow',
        name: 'Crossbow',
        items: [
          { base: 'MAIN_CROSSBOW', name: 'Light Crossbow' },
          { base: '2H_CROSSBOW', name: 'Crossbow' },
          { base: '2H_CROSSBOWLARGE', name: 'Heavy Crossbow' }
        ]
      },
      {
        id: 'wp_dagger',
        name: 'Dagger',
        items: [
          { base: 'MAIN_DAGGER', name: 'Dagger' },
          { base: '2H_DAGGERPAIR', name: 'Dagger Pair' },
          { base: '2H_CLAWPAIR', name: 'Claws' }
        ]
      },
      {
        id: 'wp_spear',
        name: 'Spear',
        items: [
          { base: 'MAIN_SPEAR', name: 'Spear' },
          { base: '2H_SPEAR', name: 'Pike' },
          { base: '2H_GLAIVE', name: 'Glaive' }
        ]
      },
      {
        id: 'wp_staff_fire',
        name: 'Fire Staff',
        items: [
          { base: 'MAIN_FIRESTAFF', name: 'Fire Staff' },
          { base: '2H_FIRESTAFF', name: 'Great Fire Staff' },
          { base: '2H_INFERNOSTAFF', name: 'Infernal Staff' }
        ]
      },
      {
        id: 'wp_staff_frost',
        name: 'Frost Staff',
        items: [
          { base: 'MAIN_FROSTSTAFF', name: 'Frost Staff' },
          { base: '2H_FROSTSTAFF', name: 'Great Frost Staff' },
          { base: '2H_GLACIALSTAFF', name: 'Glacial Staff' }
        ]
      },
      {
        id: 'wp_staff_arcane',
        name: 'Arcane Staff',
        items: [
          { base: 'MAIN_ARCANE', name: 'Arcane Staff' },
          { base: '2H_ARCANE', name: 'Great Arcane Staff' },
          { base: '2H_ENIGMATICSTAFF', name: 'Enigmatic Staff' }
        ]
      },
      {
        id: 'wp_staff_holy',
        name: 'Holy Staff',
        items: [
          { base: 'MAIN_HOLY', name: 'Holy Staff' },
          { base: '2H_HOLY', name: 'Great Holy Staff' },
          { base: '2H_DIVINESTAFF', name: 'Divine Staff' }
        ]
      },
      {
        id: 'wp_staff_nature',
        name: 'Nature Staff',
        items: [
          { base: 'MAIN_NATURESTAFF', name: 'Nature Staff' },
          { base: '2H_NATURESTAFF', name: 'Great Nature Staff' },
          { base: '2H_WILDSTAFF', name: 'Wild Staff' }
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
            return {
              id: uniqueName,
              name: displayName,
              uniqueName: uniqueName
            };
          });
        })
      }))
    }))
  }));
}

export const destinyBoardData = generateDestinyBoard();
export const rawCategories = itemDefinitions; // Để lấy iconName và name cho Tab Cha
