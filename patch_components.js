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
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${file}, not found.`);
    continue;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Add context import if not present
  if (!content.includes('useOrderContext')) {
    content = content.replace(
      'import { useState } from "react";',
      'import { useState } from "react";\nimport { useOrderContext } from "../context/OrderContext.jsx";'
    );
  }

  // 2. Add useOrderContext hook if not present
  if (!content.includes('const { updateOrderData }')) {
    content = content.replace(
      'const Navigate = useNavigate();',
      'const Navigate = useNavigate();\n  const { updateOrderData } = useOrderContext();'
    );
  }

  // 3. Ensure "Next" button exists and updates context
  const nextBtnRegex = /{selection\.capacity && \([\s\S]*?<button className="next-btn"[\s\S]*?<\/div>\s*\)}/;
  
  const newNextBtnCode = `{selection.capacity && (
            <div className="next-step-container">
              <button className="next-btn" onClick={() => {
                updateOrderData({
                  truckType: selection.type,
                  truckModel: selection.subType,
                  weight: selection.capacity
                });
                Navigate('/time');
              }}>
                Next
              </button>
            </div>
          )}`;

  if (nextBtnRegex.test(content)) {
    content = content.replace(nextBtnRegex, newNextBtnCode);
  } else {
    // If it's missing entirely (like housemoving.jsx)
    // We append it right before the last closing divs of sub-category
    const endOfSubCatRegex = /<\/div>\s*}\s*<\/div>\s*\);\s*}\s*export default/g;
    
    // Actually, looking at housemoving.jsx:
    //         )}
    //       </div>
    //     </div>
    //   );
    // }
    // export default HouseMoving;
    
    // Better to just insert it after the capacity mapping.
    // Let's replace the last </div>\n    </div>\n  );\n}
    // and inject the next button inside the sub-category if it's there.
    // Wait, the safest is to find the capacity map block:
    // {selection.subType && ( <div className="da-grid"> ... </div> )}
    // and append the next button block after it.
    
    // Regex for the capacity block
    const capBlockMatch = content.match(/{\s*selection\.subType\s*&&\s*\([\s\S]*?<\/div>\s*\)\s*}/);
    if (capBlockMatch) {
      content = content.replace(capBlockMatch[0], capBlockMatch[0] + '\n\n          ' + newNextBtnCode);
    }
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Patched ${file}`);
}
