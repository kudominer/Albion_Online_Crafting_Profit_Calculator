const axios = require('axios');

async function testLoc() {
  const url = 'https://raw.githubusercontent.com/broderickhyman/ao-bin-dumps/master/localization.xml';
  console.log('Downloading...');
  try {
    const res = await axios.get(url, { responseType: 'stream' });
    let data = '';
    res.data.on('data', chunk => {
      data += chunk.toString();
      if (data.length > 50000) {
        console.log(data.substring(0, 5000));
        process.exit(0);
      }
    });
  } catch (e) {
    console.error(e.message);
  }
}
testLoc();
