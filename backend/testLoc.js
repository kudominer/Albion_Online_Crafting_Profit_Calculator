const axios = require('axios');
const { XMLParser } = require('fast-xml-parser');

async function testLoc() {
  const url = 'https://raw.githubusercontent.com/broderickhyman/ao-bin-dumps/master/localization.xml';
  console.log('Downloading...');
  try {
    const res = await axios.get(url, { maxContentLength: Infinity });
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' });
    const parsedLoc = parser.parse(res.data);
    const tuArray = parsedLoc.tmx && parsedLoc.tmx.body && parsedLoc.tmx.body.tu ? parsedLoc.tmx.body.tu : [];
    
    const target = tuArray.find(tu => tu.tuid === '@ITEMS_T4_HEAD_PLATE_SET1@1');
    console.log("Enchanted Loc:", target);
    
    const base = tuArray.find(tu => tu.tuid === '@ITEMS_T4_HEAD_PLATE_SET1');
    console.log("Base Loc:", base);

  } catch (e) {
    console.error(e.message);
  }
}
testLoc();
