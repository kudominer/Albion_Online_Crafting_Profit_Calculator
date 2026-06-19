const axios = require('axios');
const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');
const path = require('path');

const ITEMS_XML_URL = 'https://raw.githubusercontent.com/broderickhyman/ao-bin-dumps/master/items.xml';
const LOC_XML_URL = 'https://raw.githubusercontent.com/broderickhyman/ao-bin-dumps/master/localization.xml';
const OUTPUT_RECIPES_FILE = path.join(__dirname, '../frontend/src/data/recipes.json');
const OUTPUT_LOC_FILE = path.join(__dirname, '../frontend/src/data/localizedNames.json');

async function generateRecipes() {
  try {
    // ---------------------------------------------------------
    // 1. TẢI VÀ PARSE ITEMS.XML
    // ---------------------------------------------------------
    console.log(`Downloading items.xml from ${ITEMS_XML_URL}...`);
    const resItems = await axios.get(ITEMS_XML_URL, { maxContentLength: Infinity, maxBodyLength: Infinity });
    const xmlItemsData = resItems.data;
    console.log(`Downloaded ${(xmlItemsData.length / 1024 / 1024).toFixed(2)} MB of Items XML data.`);

    console.log('Parsing Items XML...');
    const parserItems = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      isArray: (name) => { 
        if (name === 'weapon' || name === 'armor' || name === 'equipmentitem' || name === 'consumable' || name === 'simpleitem' || name === 'craftresource' || name === 'mount') return true;
        return false;
      }
    });

    const parsedItems = parserItems.parse(xmlItemsData);
    const itemsNode = parsedItems.items || {};

    const allItems = [];
    const validItemIds = new Set();

    const tagTypes = ['weapon', 'armor', 'equipmentitem', 'consumable', 'simpleitem', 'mount'];

    for (const tag of tagTypes) {
      if (!itemsNode[tag]) continue;
      const elements = Array.isArray(itemsNode[tag]) ? itemsNode[tag] : [itemsNode[tag]];
      
      elements.forEach(item => {
        const uniqueName = item.uniquename;
        if (!uniqueName || uniqueName.includes('TRASH')) return;
        
        validItemIds.add(uniqueName);

        let craftReqs = item.craftingrequirements;
        if (!craftReqs) return;

        if (Array.isArray(craftReqs)) {
          craftReqs = craftReqs[0];
        }

        let resources = craftReqs.craftresource;
        if (!resources) return;

        if (!Array.isArray(resources)) {
          resources = [resources];
        }

        const materials = resources.map(res => {
          validItemIds.add(res.uniquename);
          return {
            id: res.uniquename,
            count: parseInt(res.count, 10)
          };
        });

        const tierStr = item.tier ? parseInt(item.tier, 10) : (uniqueName.match(/T(\d)/) ? parseInt(uniqueName.match(/T(\d)/)[1], 10) : 1);

        allItems.push({
          id: uniqueName,
          category: item.shopcategory || tag,
          subcategory: item.shopsubcategory1 || item.shopcategory || 'other',
          tier: tierStr,
          weight: item.weight || 0,
          materials: materials
        });

        // Parse Enchantments
        if (item.enchantments && item.enchantments.enchantment) {
          let enchs = item.enchantments.enchantment;
          if (!Array.isArray(enchs)) enchs = [enchs];
          
          enchs.forEach(e => {
            const enchLevel = e.enchantmentlevel;
            if (!enchLevel) return;
            const enchUniqueName = `${uniqueName}@${enchLevel}`;
            
            let eReqs = e.craftingrequirements;
            if (!eReqs) return;
            if (Array.isArray(eReqs)) eReqs = eReqs[0];
            let eRes = eReqs.craftresource;
            if (!eRes) return;
            if (!Array.isArray(eRes)) eRes = [eRes];
            
            validItemIds.add(enchUniqueName);

            const eMaterials = eRes.map(res => {
              validItemIds.add(res.uniquename);
              return {
                id: res.uniquename,
                count: parseInt(res.count, 10)
              };
            });
            
            allItems.push({
              id: enchUniqueName,
              category: item.shopcategory || tag,
              subcategory: item.shopsubcategory1 || item.shopcategory || 'other',
              tier: tierStr,
              weight: item.weight || 0,
              materials: eMaterials,
              enchantmentLevel: parseInt(enchLevel, 10)
            });
          });
        }
      });
    }

    console.log(`Found ${allItems.length} craftable items.`);
    fs.writeFileSync(OUTPUT_RECIPES_FILE, JSON.stringify(allItems, null, 2), 'utf-8');
    console.log(`✅ Saved recipes successfully to: ${OUTPUT_RECIPES_FILE}`);

    // ---------------------------------------------------------
    // 2. TẢI VÀ PARSE LOCALIZATION.XML
    // ---------------------------------------------------------
    console.log(`\nDownloading localization.xml from ${LOC_XML_URL}...`);
    const resLoc = await axios.get(LOC_XML_URL, { maxContentLength: Infinity, maxBodyLength: Infinity });
    const xmlLocData = resLoc.data;
    console.log(`Downloaded ${(xmlLocData.length / 1024 / 1024).toFixed(2)} MB of Localization XML data.`);

    console.log('Parsing Localization XML...');
    const parserLoc = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      isArray: (name) => {
        if (name === 'tu' || name === 'tuv') return true;
        return false;
      }
    });

    const parsedLoc = parserLoc.parse(xmlLocData);
    const tuArray = parsedLoc.tmx && parsedLoc.tmx.body && parsedLoc.tmx.body.tu ? parsedLoc.tmx.body.tu : [];
    
    const localizedNames = {};

    tuArray.forEach(tu => {
      const tuid = tu.tuid; // e.g. "@ITEMS_T4_BAG" or "@ITEMS_T4_BAG_DESC"
      if (!tuid || !tuid.startsWith('@ITEMS_') || tuid.endsWith('_DESC')) return;

      const itemId = tuid.replace('@ITEMS_', '');
      
      // Chỉ lưu những tên của các Item có liên quan đến hệ thống craft của mình cho nhẹ file
      if (!validItemIds.has(itemId) && !itemId.match(/T\d_/)) return;

      let tuvArray = tu.tuv;
      if (!Array.isArray(tuvArray)) tuvArray = [tuvArray];

      const enUsNode = tuvArray.find(t => t['xml:lang'] === 'EN-US');
      if (enUsNode && enUsNode.seg) {
        const baseName = enUsNode.seg;
        const tMatch = itemId.match(/T(\d)/);
        const t = tMatch ? tMatch[1] : '';

        // Tên base có thêm .0
        if (t) {
          localizedNames[itemId] = `${baseName} ${t}.0`;
        } else {
          localizedNames[itemId] = baseName;
        }

        // Tự động generate tên cho các enchantments
        [1, 2, 3, 4].forEach(level => {
           const enchId = `${itemId}@${level}`;
           if (validItemIds.has(enchId)) {
             localizedNames[enchId] = t ? `${baseName} ${t}.${level}` : `${baseName} .${level}`;
           }
        });
      }
    });

    console.log(`Found ${Object.keys(localizedNames).length} localized names.`);
    fs.writeFileSync(OUTPUT_LOC_FILE, JSON.stringify(localizedNames, null, 2), 'utf-8');
    console.log(`✅ Saved localization dictionary to: ${OUTPUT_LOC_FILE}`);

  } catch (error) {
    console.error('Error generating recipes:', error.message);
  }
}

generateRecipes();
