const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');
const axios = require('axios');

async function check() {
  const url = 'https://raw.githubusercontent.com/broderickhyman/ao-bin-dumps/master/items.xml';
  const res = await axios.get(url, { maxContentLength: Infinity });
  
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    isArray: (name) => { 
      if (['weapon', 'armor', 'equipmentitem', 'consumableitem', 'consumablefrominventoryitem', 'simpleitem', 'mount', 'furnitureitem'].includes(name)) return true;
      return false;
    }
  });
  const parsed = parser.parse(res.data);
  const itemsNode = parsed.items || {};
  
  const tags = ['weapon', 'armor', 'equipmentitem', 'consumableitem', 'consumablefrominventoryitem', 'simpleitem', 'mount', 'furnitureitem'];
  const cats = new Set();
  
  tags.forEach(tag => {
    if (itemsNode[tag]) {
      itemsNode[tag].forEach(item => {
        cats.add(`${item.shopcategory} | ${item.shopsubcategory1}`);
      });
    }
  });
  
  console.log([...cats].sort().join('\n'));
}
check();
