const fs = require('fs');
const { XMLParser } = require('fast-xml-parser');
const axios = require('axios');

async function check() {
  const url = 'https://raw.githubusercontent.com/broderickhyman/ao-bin-dumps/master/items.xml';
  console.log('Downloading...');
  const res = await axios.get(url, { maxContentLength: Infinity });
  
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: ''
  });
  
  console.log('Parsing...');
  const parsed = parser.parse(res.data);
  const armors = Array.isArray(parsed.items.armor) ? parsed.items.armor : [parsed.items.armor];
  
  const equip = Array.isArray(parsed.items.equipmentitem) ? parsed.items.equipmentitem : [parsed.items.equipmentitem];
  const all = [...armors, ...equip];
  const target = all.filter(a => a && a.uniquename && a.uniquename.includes('T4_HEAD_PLATE_SET1'));
  console.log(JSON.stringify(target.slice(0, 5), null, 2));
}

check();
