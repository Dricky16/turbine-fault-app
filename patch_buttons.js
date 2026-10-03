import fs from 'fs';

let content = fs.readFileSync('src/App.jsx', 'utf8');

// Replace Buy Original button
const origSearch = `<a 
                      href={(region === 'UK' ? original.uk_affiliate_link : original.affiliate_link) || original.affiliate_link || getFallbackUrl(original.brand, original.name, region)}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-white border-2 border-luxury-900 text-luxury-900 hover:bg-luxury-50 px-6 py-3 rounded-xl font-medium transition-colors whitespace-nowrap mb-3"
                    >
                      Buy Original <ExternalLink size={16} />
                    </a>`;

const origReplace = `{((region === 'UK' ? original.uk_affiliate_link : original.affiliate_link) || original.affiliate_link || getFallbackUrl(original.brand, original.name, region)) ? (
                      <a 
                        href={(region === 'UK' ? original.uk_affiliate_link : original.affiliate_link) || original.affiliate_link || getFallbackUrl(original.brand, original.name, region)}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-white border-2 border-luxury-900 text-luxury-900 hover:bg-luxury-50 px-6 py-3 rounded-xl font-medium transition-colors whitespace-nowrap mb-3"
                      >
                        Buy Original <ExternalLink size={16} />
                      </a>
                    ) : (
                      <button disabled className="w-full flex items-center justify-center gap-2 bg-gray-50 text-gray-400 border-2 border-gray-200 px-6 py-3 rounded-xl font-medium cursor-not-allowed mb-3">
                        Out of Stock Online
                      </button>
                    )}`;

content = content.replace(origSearch, origReplace);


// Replace Buy Dupe button
const dupeSearch = `<a 
                            href={(region === 'UK' ? dupe.uk_affiliate_link : dupe.affiliate_link) || dupe.affiliate_link || getFallbackUrl(dupe.brand, dupe.name, region)}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full flex items-center justify-center gap-2 bg-luxury-900 hover:bg-gold text-white px-6 py-3 rounded-xl font-medium transition-colors whitespace-nowrap"
                          >
                            Buy Dupe <ExternalLink size={16} />
                          </a>`;

const dupeReplace = `{((region === 'UK' ? dupe.uk_affiliate_link : dupe.affiliate_link) || dupe.affiliate_link || getFallbackUrl(dupe.brand, dupe.name, region)) ? (
                          <a 
                            href={(region === 'UK' ? dupe.uk_affiliate_link : dupe.affiliate_link) || dupe.affiliate_link || getFallbackUrl(dupe.brand, dupe.name, region)}
                            target="_blank"
                            rel="noreferrer"
                            className="w-full flex items-center justify-center gap-2 bg-luxury-900 hover:bg-gold text-white px-6 py-3 rounded-xl font-medium transition-colors whitespace-nowrap"
                          >
                            Buy Dupe <ExternalLink size={16} />
                          </a>
                        ) : (
                          <button disabled className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-400 px-6 py-3 rounded-xl font-medium cursor-not-allowed whitespace-nowrap">
                            Out of Stock Online
                          </button>
                        )}`;

content = content.replace(dupeSearch, dupeReplace);

fs.writeFileSync('src/App.jsx', content);
console.log('Patched buttons.');
