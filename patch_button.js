import fs from 'fs';
let code = fs.readFileSync('src/App.jsx', 'utf-8');

code = code.replace(
  "{original.affiliate_link && (",
  ""
);
code = code.replace(
  "Buy Original <ExternalLink size={16} />\n                    </a>\n                  )}",
  "Buy Original <ExternalLink size={16} />\n                    </a>"
);

fs.writeFileSync('src/App.jsx', code);
console.log("Button patched.");
