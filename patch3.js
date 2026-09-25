import fs from 'fs';
let content = fs.readFileSync('src/App.jsx', 'utf8');
content = content.replace("import { Search, Sparkles, ExternalLink, Camera, ArrowRight, ShieldCheck, Percent, Tag } from 'lucide-react';", "import { Search, Sparkles, ExternalLink, Camera, ArrowRight, ShieldCheck, Percent, Tag, User } from 'lucide-react';\nimport AuthModal from './AuthModal';");
fs.writeFileSync('src/App.jsx', content);
