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

const universalCapacity = `const TRUCK_CAPACITY = {
    "fourgon-long": [{ id: "2t", label: "2T" }],
    "fourgon-medium": [{ id: "1.5t", label: "1.5T" }],
    "fourgon-short": [{ id: "1.2t", label: "1.2T" }],
    "harbina-large": [{ id: "1.5t", label: "1.5T" }],
    "harbina-small": [{ id: "1t", label: "1T" }],
    "camion-large": [
      { id: "10t", label: "10T" },
      { id: "15t", label: "15T" },
      { id: "20t", label: "20T" },
    ],
    "camion-small": [
      { id: "3.5t", label: "3.5T" },
      { id: "5t", label: "5T" },
    ],
    "commercial": [
      { id: "1t", label: "1T" },
      { id: "2t", label: "2T" },
    ],
    "camion-carburant": [
      { id: "18000l", label: "18000L" },
      { id: "240000l", label: "240000L" },
      { id: "270000l", label: "270000L" },
      { id: "300000l", label: "300000L" },
    ],
    "porte-long": [{ id: "2t", label: "2T" }],
  };`;

for (const file of filesToPatch) {
  const filePath = path.join(componentsDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file}, not found.`);
    continue;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace FOURGOUN_CAPACITY with TRUCK_CAPACITY
  if (content.includes('const FOURGOUN_CAPACITY = {')) {
    const regex = /const FOURGOUN_CAPACITY = {[\s\S]*?};\s*/;
    content = content.replace(regex, universalCapacity + '\n\n  ');
    content = content.replace(/FOURGOUN_CAPACITY/g, 'TRUCK_CAPACITY');
  } else if (content.includes('const TRUCK_CAPACITY = {')) {
    const regex = /const TRUCK_CAPACITY = {[\s\S]*?};\s*/;
    content = content.replace(regex, universalCapacity + '\n\n  ');
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Patched capacities for ${file}`);
}
