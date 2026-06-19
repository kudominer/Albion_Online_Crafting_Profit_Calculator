const fs = require('fs');
const path = require('path');

const locFilePath = path.join(__dirname, '../frontend/src/data/localizedNames.json');
const outputFilePath = path.join(__dirname, '../frontend/src/data/localizedNames_vi.json');

const rawData = fs.readFileSync(locFilePath, 'utf8');
const localizedNames = JSON.parse(rawData);

const prefixes = {
  "Beginner's": "Tân thủ",
  "Novice's": "Tập sự",
  "Journeyman's": "Lữ khách",
  "Adept's": "Thông thạo",
  "Expert's": "Chuyên gia",
  "Master's": "Bậc thầy",
  "Grandmaster's": "Đại sư",
  "Elder's": "Trưởng lão"
};

const resourceQualities = {
  "Uncommon": "Bất thường",
  "Rare": "Hiếm",
  "Exceptional": "Đặc biệt",
  "Pristine": "Nguyên sơ"
};

const baseNames = {
  // Swords
  "Broadsword": "Kiếm Bản To",
  "Claymore": "Kiếm Claymore",
  "Dual Swords": "Song Kiếm",
  "Clarent Blade": "Lưỡi Kiếm Clarent",
  "Carving Sword": "Kiếm Carving",
  "Galatine Pair": "Cặp Kiếm Galatine",
  "Kingmaker": "Kiếm Vương",
  // Bows
  "Bow": "Cung",
  "Warbow": "Cung Chiến",
  "Longbow": "Cung Dài",
  "Whispering Bow": "Cung Whispering",
  "Bow of Badon": "Cung Badon",
  "Mistpiercer": "Cung Mistpiercer",
  // Crossbows
  "Crossbow": "Nỏ",
  "Heavy Crossbow": "Nỏ Nặng",
  "Light Crossbow": "Nỏ Nhẹ",
  "Weeping Repeater": "Nỏ Weeping",
  "Boltcasters": "Song Nỏ Boltcasters",
  "Siegebow": "Nỏ Công Thành",
  "Energy Shaper": "Máy Định Hình Năng Lượng",
  // Spears
  "Spear": "Thương",
  "Pike": "Thương Pike",
  "Glaive": "Thương Glaive",
  "Heron Spear": "Thương Heron",
  "Trinity Spear": "Thương Trinity",
  "Daybreaker": "Thương Daybreaker",
  "Spirithunter": "Thương Spirithunter",
  // Axes
  "Axe": "Rìu",
  "Great Axe": "Rìu Lớn",
  "Greataxe": "Rìu Lớn",
  "Halberd": "Rìu Halberd",
  "Battleaxe": "Rìu Chiến",
  "Bear Paws": "Rìu Bear Paws",
  "Carrioncaller": "Rìu Carrioncaller",
  "Realmbreaker": "Rìu Realmbreaker",
  "Infernal Scythe": "Lưỡi Hái Infernal",
  // Daggers
  "Dagger": "Dao Găm",
  "Dagger Pair": "Cặp Dao Găm",
  "Claws": "Vuốt Claws",
  "Bloodletter": "Dao Bloodletter",
  "Demonfang": "Dao Demonfang",
  "Deathgivers": "Song Dao Deathgivers",
  "Bridled Fury": "Dao Bridled Fury",
  // Hammers
  "Hammer": "Búa",
  "Great Hammer": "Búa Lớn",
  "Polehammer": "Búa Polehammer",
  "Tombhammer": "Búa Mộ Tombhammer",
  "Forge Hammers": "Song Búa Forge Hammers",
  "Grovekeeper": "Búa Grovekeeper",
  "Hand of Justice": "Búa Bàn Tay Công Lý",
  // Maces
  "Mace": "Chùy",
  "Heavy Mace": "Chùy Nặng",
  "Morning Star": "Chùy Morning Star",
  "Flail": "Chùy Flail",
  "Bedrock Mace": "Chùy Bedrock",
  "Incubus Mace": "Chùy Incubus",
  "Camlann Mace": "Chùy Camlann",
  "Oathkeepers": "Song Chùy Oathkeepers",
  // Quarterstaffs
  "Quarterstaff": "Gậy Thiết Bảng",
  "Iron-clad Staff": "Gậy Bọc Sắt",
  "Double Bladed Staff": "Gậy Hai Đầu",
  "Black Monk Stave": "Gậy Black Monk",
  "Soulscythe": "Gậy Hồn Soulscythe",
  "Staff of Balance": "Gậy Thăng Bằng",
  "Grailseeker": "Gậy Grailseeker",
  // Fire Staffs
  "Fire Staff": "Trượng Lửa",
  "Great Fire Staff": "Trượng Lửa Lớn",
  "Infernal Staff": "Trượng Infernal",
  "Wildfire Staff": "Trượng Wildfire",
  "Brimstone Staff": "Trượng Brimstone",
  "Blazing Staff": "Trượng Blazing",
  "Dawnsong": "Trượng Dawnsong",
  // Holy Staffs
  "Holy Staff": "Trượng Thánh",
  "Great Holy Staff": "Trượng Thánh Lớn",
  "Divine Staff": "Trượng Divine",
  "Lifetouch Staff": "Trượng Lifetouch",
  "Fallen Staff": "Trượng Fallen",
  "Redemption Staff": "Trượng Redemption",
  "Hallowfall": "Trượng Hallowfall",
  // Arcane Staffs
  "Arcane Staff": "Trượng Bí Thuật",
  "Great Arcane Staff": "Trượng Bí Thuật Lớn",
  "Enigmatic Staff": "Trượng Enigmatic",
  "Witchwork Staff": "Trượng Witchwork",
  "Occult Staff": "Trượng Occult",
  "Evensong": "Trượng Evensong",
  "Locus": "Trượng Locus",
  // Cursed Staffs
  "Cursed Staff": "Trượng Nguyền Rủa",
  "Great Cursed Staff": "Trượng Nguyền Lớn",
  "Demonic Staff": "Trượng Demonic",
  "Lifecurse Staff": "Trượng Lifecurse",
  "Cursed Skull": "Sọ Nguyền Rủa",
  "Damnation Staff": "Trượng Damnation",
  "Shadowcaller": "Trượng Shadowcaller",
  // Frost Staffs
  "Frost Staff": "Trượng Băng",
  "Great Frost Staff": "Trượng Băng Lớn",
  "Glacial Staff": "Trượng Glacial",
  "Hoarfrost Staff": "Trượng Hoarfrost",
  "Permafrost Prism": "Lăng Kính Permafrost",
  "Icicle Staff": "Trượng Icicle",
  "Chillhowl": "Trượng Chillhowl",
  // Nature Staffs
  "Nature Staff": "Trượng Thiên Nhiên",
  "Great Nature Staff": "Trượng Thiên Nhiên Lớn",
  "Wild Staff": "Trượng Wild",
  "Druidic Staff": "Trượng Druid",
  "Blight Staff": "Trượng Blight",
  "Rampant Staff": "Trượng Rampant",
  "Ironroot Staff": "Trượng Ironroot",
  // Gauntlets / Gloves
  "Brawler Gloves": "Găng Đấu Sĩ",
  "Battle Bracers": "Găng Trận Chiến",
  "Spiked Gauntlets": "Găng Gai Spiked",
  "Ursine Maulers": "Găng Gấu Ursine",
  "Fists of Avalon": "Găng Vương Avalon",
  "Ravenstrike Cestus": "Găng Quạ Ravenstrike",
  "Falconers": "Găng Falconer",

  // Shields & Offhands
  "Shield": "Khiên",
  "Sarcophagus": "Khiên Sarcophagus",
  "Caitiff Shield": "Khiên Caitiff",
  "Facebreaker": "Khiên Facebreaker",
  "Astral Aegis": "Khiên Astral Aegis",
  "Torch": "Đuốc",
  "Eye of Secrets": "Mắt Bí Mật",
  "Muisak": "Muisak",
  "Leering Puppet": "Rối Leering",
  "Cryptcandle": "Nến Cryptcandle",
  "Sacred Scepter": "Vương Trượng Sacred",
  "Tome of Spells": "Sách Phép",
  "Taproot": "Taproot",

  // Armors
  "Mercenary Jacket": "Áo Da Mercenary",
  "Hunter Jacket": "Áo Da Thợ Săn",
  "Assassin Jacket": "Áo Da Sát Thủ",
  "Royal Jacket": "Áo Da Hoàng Gia",
  "Cleric Robe": "Áo Vải Tu Sĩ",
  "Mage Robe": "Áo Vải Pháp Sư",
  "Scholar Robe": "Áo Vải Học Giả",
  "Royal Robe": "Áo Vải Hoàng Gia",
  "Soldier Armor": "Áo Giáp Chiến Sĩ",
  "Knight Armor": "Áo Giáp Kị Sĩ",
  "Guardian Armor": "Áo Giáp Hộ Vệ",
  "Royal Armor": "Áo Giáp Hoàng Gia",
  "Druid Robe": "Áo Vải Druid",
  "Harvester Garb": "Áo Thu Hoạch Harvester",
  "Fisherman Garb": "Áo Câu Cá Fisherman",
  "Skinner Garb": "Áo Lột Da Skinner",
  "Miner Garb": "Áo Khai Thác Miner",
  "Quarrier Garb": "Áo Khai Đá Quarrier",
  "Lumberjack Garb": "Áo Tiều Phu Lumberjack",

  // Hoods/Helmets
  "Mercenary Hood": "Mũ Da Mercenary",
  "Hunter Hood": "Mũ Da Thợ Săn",
  "Assassin Hood": "Mũ Da Sát Thủ",
  "Royal Hood": "Mũ Da Hoàng Gia",
  "Cleric Cowl": "Mũ Vải Tu Sĩ",
  "Mage Cowl": "Mũ Vải Pháp Sư",
  "Scholar Cowl": "Mũ Vải Học Giả",
  "Royal Cowl": "Mũ Vải Hoàng Gia",
  "Soldier Helmet": "Mũ Sắt Chiến Sĩ",
  "Knight Helmet": "Mũ Sắt Kị Sĩ",
  "Guardian Helmet": "Mũ Sắt Hộ Vệ",
  "Royal Helmet": "Mũ Sắt Hoàng Gia",
  "Druid Cowl": "Mũ Vải Druid",
  "Harvester Cap": "Mũ Thu Hoạch Harvester",
  "Fisherman Cap": "Mũ Câu Cá Fisherman",
  "Skinner Cap": "Mũ Lột Da Skinner",
  "Miner Cap": "Mũ Khai Thác Miner",
  "Quarrier Cap": "Mũ Khai Đá Quarrier",
  "Lumberjack Cap": "Mũ Tiều Phu Lumberjack",

  // Shoes/Boots
  "Mercenary Shoes": "Giày Da Mercenary",
  "Hunter Shoes": "Giày Da Thợ Săn",
  "Assassin Shoes": "Giày Da Sát Thủ",
  "Royal Shoes": "Giày Da Hoàng Gia",
  "Cleric Sandals": "Giày Vải Tu Sĩ",
  "Mage Sandals": "Giày Vải Pháp Sư",
  "Scholar Sandals": "Giày Vải Học Giả",
  "Royal Sandals": "Giày Vải Hoàng Gia",
  "Soldier Boots": "Giày Sắt Chiến Sĩ",
  "Knight Boots": "Giày Sắt Kị Sĩ",
  "Guardian Boots": "Giày Sắt Hộ Vệ",
  "Royal Boots": "Giày Sắt Hoàng Gia",
  "Druid Sandals": "Giày Vải Druid",
  "Harvester Workboots": "Giày Lao Động Harvester",
  "Fisherman Workboots": "Giày Lao Động Fisherman",
  "Skinner Workboots": "Giày Lao Động Skinner",
  "Miner Workboots": "Giày Lao Động Miner",
  "Quarrier Workboots": "Giày Lao Động Quarrier",
  "Lumberjack Workboots": "Giày Lao Động Lumberjack",

  // Accessories
  "Bag": "Túi Xách",
  "Cape": "Áo Choàng",
  "Satchel of Insight": "Túi Sách Sáng Suốt",
  "Tome of Insight": "Sách Sáng Suốt",
  "Royal Sigil": "Ấn Hoàng Gia",
  "Bridgewatch Cape": "Áo Choàng Bridgewatch",
  "Caerleon Cape": "Áo Choàng Caerleon",
  "Fort Sterling Cape": "Áo Choàng Fort Sterling",
  "Lymhurst Cape": "Áo Choàng Lymhurst",
  "Martlock Cape": "Áo Choàng Martlock",
  "Thetford Cape": "Áo Choàng Thetford",
  "Heretic Cape": "Áo Choàng Heretic",
  "Keeper Cape": "Áo Choàng Keeper",
  "Morgana Cape": "Áo Choàng Morgana",
  "Undead Cape": "Áo Choàng Undead",
  "Demon Cape": "Áo Choàng Demon",

  // Gatherer Backpacks
  "Harvester Backpack": "Balo Thu Hoạch Harvester",
  "Fisherman Backpack": "Balo Câu Cá Fisherman",
  "Skinner Backpack": "Balo Lột Da Skinner",
  "Miner Backpack": "Balo Khai Thác Miner",
  "Quarrier Backpack": "Balo Khai Đá Quarrier",
  "Lumberjack Backpack": "Balo Tiều Phu Lumberjack",

  // Tools
  "Axe": "Rìu Đốn Củi",
  "Stone Hammer": "Búa Khai Thác Đá",
  "Skinning Knife": "Dao Lột Da",
  "Pickaxe": "Cuốc Khai Thác Quặng",
  "Sickle": "Liềm Gặt",
  "Demolition Hammer": "Búa Phá Thành",
  "Fishing Rod": "Cần Câu Cá",

  // Resources (Raw & Refined)
  "Iron Ore": "Quặng Sắt",
  "Titanium Ore": "Quặng Titan",
  "Runite Ore": "Quặng Runite",
  "Meteorite Ore": "Quặng Thiên Thạch",
  "Adamantium Ore": "Quặng Adamantium",
  "Steel Bar": "Thỏi Thép",
  "Titanium Steel Bar": "Thỏi Thép Titan",
  "Runite Steel Bar": "Thỏi Thép Runite",
  "Meteorite Steel Bar": "Thỏi Thép Thiên Thạch",
  "Adamantium Steel Bar": "Thỏi Thép Adamantium",
  
  "Birch Logs": "Gỗ Bạch Dương",
  "Chestnut Logs": "Gỗ Hạt Dẻ",
  "Pine Logs": "Gỗ Thông",
  "Cedar Logs": "Gỗ Tuyết Tùng",
  "Bloodoak Logs": "Gỗ Bloodoak",
  "Ashenbark Logs": "Gỗ Ashenbark",
  "Whitewood Logs": "Gỗ Whitewood",
  "Birch Planks": "Ván Gỗ Bạch Dương",
  "Chestnut Planks": "Ván Gỗ Hạt Dẻ",
  "Pine Planks": "Ván Gỗ Thông",
  "Cedar Planks": "Ván Gỗ Tuyết Tùng",
  "Bloodoak Planks": "Ván Gỗ Bloodoak",
  "Ashenbark Planks": "Ván Gỗ Ashenbark",
  "Whitewood Planks": "Ván Gỗ Whitewood",

  "Limestone": "Đá Vôi",
  "Sandstone": "Đá Sa Thạch",
  "Travertine": "Đá Travertine",
  "Granite": "Đá Hoa Cương",
  "Slate": "Đá Phiến",
  "Basalt": "Đá Basalt",
  "Marble": "Đá Cẩm Thạch",
  "Limestone Block": "Khối Đá Vôi",
  "Sandstone Block": "Khối Đá Sa Thạch",
  "Travertine Block": "Khối Đá Travertine",
  "Granite Block": "Khối Đá Hoa Cương",
  "Slate Block": "Khối Đá Phiến",
  "Basalt Block": "Khối Đá Basalt",
  "Marble Block": "Khối Đá Cẩm Thạch",

  "Hemp": "Sợi Gai Dầu",
  "Skyflower": "Sợi Skyflower",
  "Amberleaf Cotton": "Sợi Bông Hổ Phách",
  "Sunflax": "Sợi Sunflax",
  "Ghost Hemp": "Sợi Ghost Hemp",
  "Simple Cloth": "Vải Đơn Giản",
  "Neat Cloth": "Vải Gọn Gàng",
  "Fine Cloth": "Vải Tốt",
  "Ornate Cloth": "Vải Trang Trí",
  "Lavish Cloth": "Vải Xa Hoa",
  "Opulent Cloth": "Vải Sang Trọng",
  "Baroque Cloth": "Vải Baroque",

  "Medium Hide": "Da Trung Bình",
  "Heavy Hide": "Da Dày",
  "Robust Hide": "Da Khỏe",
  "Thick Hide": "Da Dày Cứng",
  "Resilient Hide": "Da Đàn Hồi",
  "Stiff Leather": "Da Thuộc Cứng",
  "Thick Leather": "Da Thuộc Dày",
  "Worked Leather": "Da Thuộc Đã Xử Lý",
  "Cured Leather": "Da Thuộc Khô",
  "Hardened Leather": "Da Thuộc Cứng",
  "Reinforced Leather": "Da Thuộc Gia Cố",
  "Fortified Leather": "Da Thuộc Kiên Cố",

  // Consumables & Food
  "Soup": "Súp",
  "Salad": "Sa-lát",
  "Pie": "Bánh Pie",
  "Omelette": "Trứng Cuộn Omelette",
  "Stew": "Thịt Hầm Stew",
  "Sandwich": "Bánh Mì Kẹp Sandwich",
  "Roast": "Thịt Quay Roast",
  "Greenmoor Clam Soup": "Súp Nghêu Greenmoor",
  "Murkwillow Eel Stew": "Thịt Hầm Lươn Murkwillow",
  "Dustwallow Basin Pie": "Bánh Pie Dustwallow",
  "Kraken Salad": "Sa-lát Bạch Tuộc Kraken",
  "Frostpeak Deershank": "Thịt Hươu Frostpeak",
  "Avalonian Beef Stew": "Thịt Hầm Bò Avalonian",
  
  "Healing Potion": "Thuốc Hồi Máu",
  "Energy Potion": "Thuốc Hồi Năng Lượng",
  "Gigantify Potion": "Thuốc Khổng Lồ",
  "Resistance Potion": "Thuốc Kháng Hiệu Ứng",
  "Sticky Potion": "Thuốc Làm Chậm Sticky",
  "Chilling Potion": "Thuốc Đóng Băng",
  "Poison Potion": "Thuốc Độc",
  "Acid Potion": "Thuốc Axit",
  "Tornado Potion": "Thuốc Lốc Xoáy",
  "Berserk Potion": "Thuốc Cuồng Nộ",
  "Hellfire Potion": "Thuốc Lửa Địa Ngục",
  "Cleanse Potion": "Thuốc Thanh Tẩy",
  "Avalonian Healing Potion": "Thuốc Hồi Máu Avalonian",
  "Avalonian Energy Potion": "Thuốc Hồi Năng Lượng Avalonian"
};

const vietnameseNames = {};

for (const itemId in localizedNames) {
  const engName = localizedNames[itemId];
  
  // Extract suffix like " 4.0", " 5.1", " .1"
  const suffixMatch = engName.match(/\s\d?\.\d+$/) || engName.match(/\s\.\d+$/);
  const suffix = suffixMatch ? suffixMatch[0] : '';
  let cleanName = engName.replace(/\s\d?\.\d+$/, '').replace(/\s\.\d+$/, '');
  
  // 1. Detect tier prefix
  let prefixVi = '';
  for (const [pEn, pVi] of Object.entries(prefixes)) {
    if (cleanName.startsWith(pEn + ' ')) {
      prefixVi = pVi;
      cleanName = cleanName.substring((pEn + ' ').length);
      break;
    }
  }
  
  // 2. Detect quality prefix (for resources)
  let qualityVi = '';
  for (const [qEn, qVi] of Object.entries(resourceQualities)) {
    if (cleanName.startsWith(qEn + ' ')) {
      qualityVi = qVi;
      cleanName = cleanName.substring((qEn + ' ').length);
      break;
    }
  }
  
  // 3. Map base name to Vietnamese
  let translatedBase = baseNames[cleanName] || cleanName;
  
  // 4. Combine parts in natural Vietnamese order
  let viName = translatedBase;
  if (prefixVi) {
    viName += ` ${prefixVi}`;
  }
  if (qualityVi) {
    viName += ` ${qualityVi}`;
  }
  if (suffix) {
    // If it's a T-dot format, e.g. " 5.1", let's translate to " .1" or keep it.
    // Standard Vietnamese in game usually writes " .1", but we can keep it as is, or replace the number.
    // Let's replace e.g. " 5.1" -> " .1" or keep " .1" if it doesn't have the tier number.
    // Actually, keeping the exact suffix from the English name is the safest and matches English T-level suffix perfectly.
    // But wait, "Broadsword 5.1" -> "Kiếm Bản To Chuyên Gia 5.1" (Wait, 5.1 has Tier 5 in it. Since "Chuyên gia" already means Tier 5, writing 5.1 is fine, but writing .1 is cleaner).
    // Let's see: in localizedNames.json, it was: "Beginner's Broadsword 1.0" -> "Kiếm Bản To Tân Thủ 1.0". Let's keep the suffix as is.
    viName += suffix;
  }
  
  vietnameseNames[itemId] = viName;
}

// Save to localizedNames_vi.json
fs.writeFileSync(outputFilePath, JSON.stringify(vietnameseNames, null, 2), 'utf8');
console.log(`Saved ${Object.keys(vietnameseNames).length} translated names to: ${outputFilePath}`);
