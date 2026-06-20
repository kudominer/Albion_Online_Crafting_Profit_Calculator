const fs = require('fs');
const recipes = require('../frontend/src/data/recipes.json');

const combos = new Set();
recipes.forEach(r => {
  combos.add(`${r.category} | ${r.subcategory}`);
});
console.log([...combos].sort().join('\n'));
