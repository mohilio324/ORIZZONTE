const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'new', 'components');
const filesToPatch = [
  'appliances.jsx',
  'carbon-chemicals.jsx',
  'commercial_merchandise.jsx',
  'construction-materials.jsx',
  'housemoving.jsx',
  'HeavyEquipment.jsx',
  'towing.jsx',
  'water.jsx'
];

for (const file of filesToPatch) {
  const filePath = path.join(componentsDir, file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace bad import
  content = content.replace(
    /from "\.\.\/context\/OrderContext\.jsx";/g,
    'from "../src/context/OrderContext.jsx";'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed import in ${file}`);
}
