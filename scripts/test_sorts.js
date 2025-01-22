const GILDAN_64000 = require('../src/data/catalogs/gildan64000.js').default;
const { sortByName, sortByFamily, sortByPopularity } = require('../src/data/catalogs/sortMethods.js');

console.log('\n=== Default Order (1-63) ===');
console.log(GILDAN_64000.map(c => c.name).join('\n'));

console.log('\n=== Alphabetical Order ===');
console.log(sortByName(GILDAN_64000).map(c => c.name).join('\n'));

console.log('\n=== Color Family Order ===');
console.log(sortByFamily(GILDAN_64000).map(c => `${c.family}: ${c.name}`).join('\n'));

console.log('\n=== Popularity Order (Top 10 first) ===');
console.log(sortByPopularity(GILDAN_64000).map(c => c.name).join('\n'));
