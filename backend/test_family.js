const recipes = require('../frontend/src/data/recipes.json');
const loc = require('../frontend/src/data/localizedNames.json');

const prefixes = [
  "Beginner's ", "Novice's ", "Journeyman's ", "Adept's ", 
  "Expert's ", "Master's ", "Grandmaster's ", "Elder's "
];

const getFamilyName = (uniqueName) => {
  let name = loc[uniqueName] || uniqueName;
  // Remove tier number suffix if exists (e.g. " .1", " 4.1")
  name = name.replace(/\s\d?\.\d+$/, '');
  
  // Remove tier prefix
  for (const p of prefixes) {
    if (name.startsWith(p)) {
      return name.substring(p.length);
    }
  }
  return name;
};

const bows = recipes.filter(r => r.subcategory === 'bow');
const families = new Set();
bows.forEach(b => {
  if (b.enchantmentLevel > 0) return; // Only look at base items
  families.add(getFamilyName(b.id));
});

console.log('Bow Families:', [...families]);
