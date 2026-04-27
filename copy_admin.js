const fs = require('fs');
const path = require('path');

const srcPath = path.join('C:', 'Users', 'pcplaz', 'Downloads', 'newdash-main', 'newdash-main', 'src', 'App.jsx');
const destPath = path.join(__dirname, 'new', 'components', 'AdminDashboard.jsx');

let content = fs.readFileSync(srcPath, 'utf8');

// Replace the logo import with a constant pointing to the existing public logo
content = content.replace(
  "import logo from './assets/cargo-truck-6.svg'",
  "const logo = '/images/logo.svg';"
);

// Rename the component to AdminDashboard
content = content.replace(
  "export default function App() {",
  "export default function AdminDashboard() {"
);

fs.writeFileSync(destPath, content, 'utf8');
console.log('Successfully copied and patched AdminDashboard.jsx');
