import fs from 'fs';

let content = fs.readFileSync('src/App.jsx', 'utf8');

const targetIE = `🇮🇪 IE`;
const repIE = `€ EUR`;
content = content.replace(targetIE, repIE);

const targetUK = `🇬🇧 UK`;
const repUK = `£ GBP`;
content = content.replace(targetUK, repUK);

fs.writeFileSync('src/App.jsx', content);
