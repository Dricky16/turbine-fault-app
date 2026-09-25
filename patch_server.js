import fs from 'fs';
let content = fs.readFileSync('server/server.js', 'utf8');

const oldPrompt = "Analyze this image of a perfume bottle. What is the exact brand name and the perfume name? Respond ONLY with the name of the perfume. For example, if it is 'Chanel No 5', respond with exactly 'Chanel No 5'. Do not include the brand name unless it is part of the fragrance name. If you absolutely cannot identify it, respond with 'UNKNOWN'.";

const newPrompt = "Analyze this image of a perfume bottle. What is the core name of the perfume? Respond ONLY with the core name of the perfume. CRITICAL: Do NOT include concentration types like 'Eau de Parfum', 'EDP', 'Eau de Toilette', 'EDT', 'Parfum', 'Cologne', or 'Intense'. Do NOT include the brand name unless it is strictly part of the fragrance name. For example, if the bottle says 'Giorgio Armani Acqua di Gio Eau de Toilette', respond with exactly 'Acqua Di Gio'. If you absolutely cannot identify it, respond with 'UNKNOWN'.";

content = content.split(oldPrompt).join(newPrompt);

fs.writeFileSync('server/server.js', content);
