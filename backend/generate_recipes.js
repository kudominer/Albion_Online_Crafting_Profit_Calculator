const axios = require('axios');
const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');
const path = require('path');

const ITEMS_XML_URL = 'https://raw.githubusercontent.com/broderickhyman/ao-bin-dumps/master/items.xml';
const OUTPUT_FILE = path.join(__dirname, '../src/data/recipes.json');

async function generateRecipes() {
  try {
    console.log(`Downloading items.xml from ${ITEMS_XML_URL}...`);
    const res = await axios.get(ITEMS_XML_URL, { maxContentLength: Infinity, maxBodyLength: Infinity });
    const xmlData = res.data;
    console.log(`Downloaded ${(xmlData.length / 1024 / 1024).toFixed(2)} MB of XML data.`);

    console.log('Parsing XML...');
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '',
      isArray: (name, jpath, isLeafNode, isAttribute) => { 
        if (name === 'weapon' || name === 'armor' || name === 'equipmentitem' || name === 'consumable' || name === 'simpleitem' || name === 'craftresource') return true;
        return false;
      }
    });

    const parsed = parser.parse(xmlData);
    const itemsNode = parsed.items || {};

    const allItems = [];

    // Danh sách các loại thẻ XML chứa đồ có thể craft
    const tagTypes = ['weapon', 'armor', 'equipmentitem', 'consumable', 'simpleitem', 'mount'];

    for (const tag of tagTypes) {
      if (!itemsNode[tag]) continue;
      const elements = Array.isArray(itemsNode[tag]) ? itemsNode[tag] : [itemsNode[tag]];
      
      elements.forEach(item => {
        const uniqueName = item.uniquename;
        // Bỏ qua item rác
        if (!uniqueName || uniqueName.includes('TRASH')) return;
        
        // Lấy requirements
        let craftReqs = item.craftingrequirements;
        if (!craftReqs) return; // Không craft được

        // Đôi khi 1 item có nhiều cách craft (nhiều craftingrequirements), lấy cái đầu tiên cho đơn giản hoặc gộp
        if (Array.isArray(craftReqs)) {
          craftReqs = craftReqs[0];
        }

        let resources = craftReqs.craftresource;
        if (!resources) return; // Cần nguyên liệu đặc biệt mà hệ thống xml không có craftresource

        if (!Array.isArray(resources)) {
          resources = [resources];
        }

        const materials = resources.map(res => ({
          id: res.uniquename,
          count: parseInt(res.count, 10)
        }));

        allItems.push({
          id: uniqueName,
          category: item.shopcategory || tag,
          subcategory: item.shopsubcategory1 || item.shopcategory || 'other',
          tier: item.tier ? parseInt(item.tier, 10) : (uniqueName.match(/T(\d)/) ? parseInt(uniqueName.match(/T(\d)/)[1], 10) : 1),
          weight: item.weight || 0,
          materials: materials
        });
      });
    }

    console.log(`Found ${allItems.length} craftable items.`);

    // Ghi file JSON
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allItems, null, 2), 'utf-8');
    console.log(`✅ Saved recipes successfully to: ${OUTPUT_FILE}`);

  } catch (error) {
    console.error('Error generating recipes:', error.message);
  }
}

generateRecipes();
