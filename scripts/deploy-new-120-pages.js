'use strict';
/**
 * Deploy 120 more pSEO pages (28 style guides, 30 occasions, 30 comparisons, 32 fabric glossary)
 * Usage: node scripts/deploy-new-120-pages.js
 */

const https = require('https');
const { styleGuidesB }       = require('../seo-setup/new-style-guides-b.js');
const { styleGuidesC }       = require('../seo-setup/new-style-guides-c.js');
const { occasionGuidesB }    = require('../seo-setup/new-occasion-guides-b.js');
const { occasionGuidesC }    = require('../seo-setup/new-occasion-guides-c.js');
const { newComparisonsB }    = require('../seo-setup/new-comparisons-b.js');
const { newComparisonsC }    = require('../seo-setup/new-comparisons-c.js');
const { newFabricGlossaryB } = require('../seo-setup/new-fabric-glossary-b.js');
const { newFabricGlossaryC } = require('../seo-setup/new-fabric-glossary-c.js');

const STORE       = 'william-ashford-apex.myshopify.com';
const API_VERSION = '2024-10';
const TOKEN       = process.argv.find(a => a.startsWith('--token='))?.split('=')[1]
  || process.env.SHOPIFY_ADMIN_TOKEN
  || 'SHOPIFY_ACCESS_TOKEN';

function gql(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query, variables });
    const req = https.request({
      hostname: STORE, path: `/admin/api/${API_VERSION}/graphql.json`, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': TOKEN, 'Content-Length': Buffer.byteLength(body) },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { reject(new Error(d.substring(0, 200))); } });
    });
    req.on('error', reject); req.write(body); req.end();
  });
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function getPageId(handle) {
  const r = await gql('{ pages(first:1,query:"handle:' + handle + '"){edges{node{id}}}}');
  return r.data?.pages?.edges?.[0]?.node?.id || null;
}

async function upsertPage(handle, title, template, seoTitle, seoDesc) {
  const fields = {
    title, body: '<p>Loading guide...</p>', isPublished: true, templateSuffix: template,
    metafields: [
      { namespace: 'global', key: 'title_tag',       type: 'single_line_text_field', value: seoTitle },
      { namespace: 'global', key: 'description_tag', type: 'multi_line_text_field',  value: seoDesc  },
    ],
  };
  const cr = await gql('mutation C($p:PageCreateInput!){pageCreate(page:$p){page{id handle}userErrors{field message}}}', { p: { handle, ...fields } });
  const ce = cr.data?.pageCreate;
  const taken = ce?.userErrors?.some(e => e.message.toLowerCase().includes('handle'));
  if (taken) {
    const id = await getPageId(handle);
    if (!id) return 'ERR:notfound';
    const ur = await gql('mutation U($id:ID!,$p:PageUpdateInput!){pageUpdate(id:$id,page:$p){page{handle}userErrors{field message}}}', { id, p: fields });
    const ue = ur.data?.pageUpdate;
    return ue?.userErrors?.length ? 'ERR:' + ue.userErrors[0].message : 'UPDATED';
  }
  return ce?.userErrors?.length ? 'ERR:' + ce.userErrors[0].message : 'CREATED';
}

async function createMeta(type, handle, fieldMap) {
  const fields = Object.entries(fieldMap).map(([key, value]) => ({ key, value: typeof value === 'object' ? JSON.stringify(value) : String(value) }));
  const r = await gql('mutation M($m:MetaobjectCreateInput!){metaobjectCreate(metaobject:$m){metaobject{handle}userErrors{field message}}}', { m: { type, handle, fields } });
  const res = r.data?.metaobjectCreate;
  if (res?.userErrors?.length) {
    const exists = res.userErrors.some(e => e.message.toLowerCase().includes('handle') || e.message.toLowerCase().includes('taken'));
    return exists ? 'EXISTS' : 'ERR:' + res.userErrors[0].message;
  }
  return 'CREATED';
}

async function runBatch(label, items, pageFn, metaFn) {
  console.log(`\n=== ${label} (${items.length}) ===`);
  let cp = 0, cm = 0, skip = 0, err = 0;
  for (const item of items) {
    process.stdout.write(`  ${item.handle}...`);
    const ps = await pageFn(item); await sleep(200);
    const ms = await metaFn(item); await sleep(300);
    if (ps.startsWith('ERR') || ms.startsWith('ERR')) { console.log(` PAGE:${ps} META:${ms}`); err++; }
    else { console.log(` page:${ps} meta:${ms}`); if (ps==='CREATED') cp++; if (ms==='CREATED') cm++; if (ms==='EXISTS') skip++; }
  }
  console.log(`  → pages: ${cp} created / meta: ${cm} created, ${skip} skipped, ${err} errors`);
}

async function appendHubLinks(hubHandle, h2heading, links) {
  const id = await getPageId(hubHandle);
  if (!id) { console.log(`  hub ${hubHandle}: NOT FOUND`); return; }
  const r = await gql('{ pages(first:1,query:"handle:' + hubHandle + '"){edges{node{body}}}}');
  const current = r.data?.pages?.edges?.[0]?.node?.body || '';
  const newSection = `<h2>${h2heading}</h2><ul>${links.map(l => `<li><a href="/pages/${l.handle}">${l.title}</a></li>`).join('')}</ul>`;
  await gql('mutation U($id:ID!,$p:PageUpdateInput!){pageUpdate(id:$id,page:$p){page{handle}userErrors{field message}}}', { id, p: { body: current + '\n' + newSection } });
  console.log(`  hub ${hubHandle}: appended ${links.length} links`);
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  William Ashford — Deploy 120 More pSEO Pages           ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  const shop = await gql('{ shop { name } }');
  console.log('Connected to:', shop.data?.shop?.name);

  const useCase = item => createMeta('use_case_guide', item.handle, {
    heading: item.heading, occasion: item.heading,
    seo_title: item.seo_title, seo_description: item.seo_description,
    intro_text: item.intro_text, style_tips: item.style_tips,
    recommended_pieces: item.recommended_pieces, dos_and_donts: item.dos_and_donts,
    collection_link: item.collection_link, faq_data: item.faq_data,
  });

  const comparison = item => createMeta('style_comparison', item.handle, {
    heading: item.heading, seo_title: item.seo_title, seo_description: item.seo_description,
    intro_text: item.intro_text,
    item_a_name: item.item_a_name, item_a_pros: item.item_a_pros, item_a_cons: item.item_a_cons,
    item_b_name: item.item_b_name, item_b_pros: item.item_b_pros, item_b_cons: item.item_b_cons,
    verdict: item.verdict, item_a_collection: item.item_a_collection, item_b_collection: item.item_b_collection,
    faq_data: item.faq_data,
  });

  const fabric = item => createMeta('fabric_glossary_term', item.handle, {
    term_name: item.term_name, seo_title: item.seo_title, seo_description: item.seo_description,
    short_definition: item.short_definition, full_definition: item.full_definition,
    properties: item.properties, care_tips: item.care_tips,
    collection_link: item.collection_link, faq_data: item.faq_data,
  });

  // Style Guides (28)
  await runBatch('Style Guides B', styleGuidesB,
    item => upsertPage(item.handle, item.heading, 'style-guide', item.seo_title, item.seo_description),
    useCase);
  await runBatch('Style Guides C', styleGuidesC,
    item => upsertPage(item.handle, item.heading, 'style-guide', item.seo_title, item.seo_description),
    useCase);

  // Occasions (30)
  await runBatch('Occasion Guides B', occasionGuidesB,
    item => upsertPage(item.handle, item.heading, 'use-case', item.seo_title, item.seo_description),
    useCase);
  await runBatch('Occasion Guides C', occasionGuidesC,
    item => upsertPage(item.handle, item.heading, 'use-case', item.seo_title, item.seo_description),
    useCase);

  // Comparisons (30)
  await runBatch('Comparisons B', newComparisonsB,
    item => upsertPage(item.handle, item.heading, 'comparison', item.seo_title, item.seo_description),
    comparison);
  await runBatch('Comparisons C', newComparisonsC,
    item => upsertPage(item.handle, item.heading, 'comparison', item.seo_title, item.seo_description),
    comparison);

  // Fabric Glossary (32)
  await runBatch('Fabric Glossary B', newFabricGlossaryB,
    item => upsertPage('what-is-' + item.handle, 'What is ' + item.term_name + '?', 'fabric-glossary', item.seo_title, item.seo_description),
    fabric);
  await runBatch('Fabric Glossary C', newFabricGlossaryC,
    item => upsertPage('what-is-' + item.handle, 'What is ' + item.term_name + '?', 'fabric-glossary', item.seo_title, item.seo_description),
    fabric);

  // Update hub pages
  console.log('\n=== Updating Hub Pages ===');
  await appendHubLinks('style-guides', 'Formalwear &amp; Evening', [
    { handle: 'how-to-style-a-dinner-suit',           title: 'How to Style a Dinner Suit' },
    { handle: 'how-to-wear-a-three-piece-suit',       title: 'How to Wear a Three-Piece Suit' },
    { handle: 'double-breasted-suit-styling-guide',   title: 'Double-Breasted Suit Styling Guide' },
    { handle: 'how-to-wear-a-shawl-collar-dinner-jacket', title: 'How to Wear a Shawl Collar Dinner Jacket' },
    { handle: 'how-to-style-a-velvet-jacket',         title: 'How to Style a Velvet Jacket' },
    { handle: 'velvet-blazer-styling-guide',          title: 'How to Style a Velvet Blazer' },
  ]);
  await appendHubLinks('style-guides', 'Patterns &amp; Colours', [
    { handle: 'how-to-style-a-checked-suit',          title: 'How to Style a Checked Suit' },
    { handle: 'how-to-style-a-herringbone-suit',      title: 'How to Style a Herringbone Suit' },
    { handle: 'how-to-style-a-windowpane-suit',       title: 'How to Style a Windowpane Check Suit' },
    { handle: 'how-to-style-a-glen-check-suit',       title: 'How to Style a Glen Check Suit' },
    { handle: 'how-to-style-a-houndstooth-jacket',    title: 'How to Style a Houndstooth Jacket' },
    { handle: 'how-to-style-a-cream-suit',            title: 'How to Style a Cream Suit' },
    { handle: 'how-to-style-a-tan-suit',              title: 'How to Style a Tan Suit' },
    { handle: 'how-to-style-a-pale-blue-suit',        title: 'How to Style a Pale Blue Suit' },
  ]);
  await appendHubLinks('style-guides', 'Shoes, Accessories &amp; Details', [
    { handle: 'how-to-style-chelsea-boots-with-suit', title: 'How to Style Chelsea Boots with a Suit' },
    { handle: 'loafers-with-suit',                    title: 'How to Wear Loafers with a Suit' },
    { handle: 'how-to-wear-brogues-with-a-suit',      title: 'How to Wear Brogues with a Suit' },
    { handle: 'how-to-wear-monk-strap-shoes',         title: 'How to Wear Monk Strap Shoes' },
    { handle: 'how-to-style-oxford-shoes-men',        title: 'Oxford Shoes Styling Guide' },
    { handle: 'roll-neck-with-suit',                  title: 'How to Wear a Roll-Neck with a Suit' },
    { handle: 'how-to-wear-an-overcoat-with-a-suit',  title: 'How to Wear an Overcoat with a Suit' },
    { handle: 'how-to-match-socks-to-suit',           title: 'How to Match Socks to a Suit' },
    { handle: 'how-to-style-dress-shirt-men',         title: 'Dress Shirt Styling Guide' },
    { handle: 'how-to-choose-suit-trousers',          title: 'How to Choose the Right Suit Trousers' },
    { handle: 'how-to-wear-suit-trousers-casually',   title: 'How to Wear Suit Trousers Casually' },
    { handle: 'how-to-style-summer-suiting',          title: 'How to Style a Summer Suit' },
    { handle: 'how-to-style-winter-suiting',          title: 'How to Style a Winter Suit' },
    { handle: 'three-piece-suit-styling-guide',       title: 'Three-Piece Suit Styling Guide' },
  ]);

  await appendHubLinks('occasions', 'British Social Calendar', [
    { handle: 'henley-regatta-outfit-men',            title: 'Henley Regatta Outfit Guide' },
    { handle: 'cheltenham-festival-dress-code-men',   title: 'Cheltenham Festival Dress Code' },
    { handle: 'glyndebourne-dress-code-men',          title: 'Glyndebourne Dress Code' },
    { handle: 'wimbledon-outfit-men',                 title: 'Wimbledon Outfit Guide' },
    { handle: 'polo-match-spectator-outfit-men',      title: 'Polo Match Outfit Guide' },
    { handle: 'shooting-party-outfit-men',            title: 'Shooting Party Outfit Guide' },
    { handle: 'polo-club-dress-code-men',             title: 'Polo Club Dress Code' },
    { handle: 'yacht-club-dress-code-men',            title: 'Yacht Club Dress Code' },
  ]);
  await appendHubLinks('occasions', 'Formal Dining &amp; Events', [
    { handle: 'charity-gala-outfit-men',              title: 'Charity Gala Outfit Guide' },
    { handle: 'gala-dinner-dress-code-men',           title: 'Gala Dinner Dress Code' },
    { handle: 'business-dinner-outfit-men',           title: 'Business Dinner Outfit Guide' },
    { handle: 'city-dinner-dress-code-men',           title: 'City Dinner Dress Code' },
    { handle: 'embassy-function-outfit-men',          title: 'Embassy Function Outfit Guide' },
    { handle: 'award-ceremony-outfit-men',            title: 'Award Ceremony Outfit Guide' }, // already in first 40, but including for completeness
    { handle: 'charity-auction-outfit-men',           title: 'Charity Auction Outfit Guide' },
    { handle: 'office-dinner-outfit-men',             title: 'Office Dinner Outfit Guide' },
  ]);
  await appendHubLinks('occasions', 'Seasonal &amp; Celebrations', [
    { handle: 'summer-ball-outfit-men',               title: 'Summer Ball Outfit Guide' },
    { handle: 'winter-ball-outfit-men',               title: 'Winter Ball Outfit Guide' },
    { handle: 'new-years-eve-outfit-men',             title: 'New Year\'s Eve Outfit Guide' },
    { handle: 'easter-sunday-outfit-men',             title: 'Easter Sunday Outfit Guide' },
    { handle: 'engagement-party-outfit-men',          title: 'Engagement Party Outfit Guide' },
    { handle: 'retirement-party-outfit-men',          title: 'Retirement Party Outfit Guide' },
    { handle: 'school-reunion-outfit-men',            title: 'School Reunion Outfit Guide' },
    { handle: 'house-party-weekend-outfit-men',       title: 'House Party Weekend Outfit Guide' },
    { handle: 'drinks-party-outfit-men',              title: 'Drinks Party Outfit Guide' },
    { handle: 'date-night-restaurant-outfit-men',     title: 'Date Night Restaurant Outfit Guide' },
    { handle: 'networking-event-outfit-men',          title: 'Networking Event Outfit Guide' },
    { handle: 'work-presentation-outfit-men',         title: 'Work Presentation Outfit Guide' },
    { handle: 'church-service-outfit-men',            title: 'Church Service Outfit Guide' },
    { handle: 'bar-mitzvah-outfit-men',               title: 'What to Wear to a Bar Mitzvah' },
    { handle: 'remembrance-day-outfit-men',           title: 'Remembrance Day Outfit Guide' },
  ]);

  await appendHubLinks('style-comparisons', 'Shirts, Ties &amp; Details', [
    { handle: 'spread-collar-vs-point-collar',         title: 'Spread Collar vs Point Collar' },
    { handle: 'single-cuff-vs-double-cuff',            title: 'Single Cuff vs Double Cuff' },
    { handle: 'silk-vs-wool-tie',                      title: 'Silk Tie vs Wool Tie' },
    { handle: 'slim-fit-vs-tailored-fit-shirt',        title: 'Slim Fit vs Tailored Fit Shirt' },
    { handle: 'wool-vs-cotton-shirt',                  title: 'Wool Flannel Shirt vs Cotton Shirt' },
    { handle: 'slim-trousers-vs-wide-leg-trousers',    title: 'Slim Trousers vs Wide-Leg Trousers' },
    { handle: 'full-break-vs-no-break-trousers',       title: 'Full Break vs No Break Trousers' },
    { handle: 'high-waist-vs-mid-rise-trousers',       title: 'High Waist vs Mid-Rise Trousers' },
    { handle: 'ticket-pocket-vs-no-ticket-pocket',     title: 'Ticket Pocket vs No Ticket Pocket' },
    { handle: 'surgeon-cuffs-vs-decorative-cuffs',     title: 'Surgeon Cuffs vs Decorative Cuffs' },
    { handle: 'side-vents-vs-centre-vent-vs-ventless', title: 'Side Vents vs Centre Vent vs Ventless' },
    { handle: 'woven-vs-knit-tie',                     title: 'Woven Tie vs Knit Tie' },
    { handle: 'slim-fit-vs-classic-fit-trousers',      title: 'Slim Fit vs Classic Fit Trousers' },
  ]);
  await appendHubLinks('style-comparisons', 'Shoes &amp; Accessories', [
    { handle: 'leather-vs-suede-shoes',                title: 'Leather vs Suede Shoes' },
    { handle: 'brogues-vs-plain-oxford',               title: 'Brogues vs Plain Oxford Shoes' },
    { handle: 'loafers-vs-monk-straps',                title: 'Loafers vs Monk Strap Shoes' },
    { handle: 'chelsea-boots-vs-oxford-shoes',         title: 'Chelsea Boots vs Oxford Shoes' },
    { handle: 'handmade-vs-machine-made-shoes',        title: 'Handmade vs Machine-Made Shoes' },
    { handle: 'overcoat-vs-topcoat',                   title: 'Overcoat vs Topcoat' },
  ]);
  await appendHubLinks('style-comparisons', 'Suits &amp; Fabrics', [
    { handle: 'navy-vs-black-suit',                    title: 'Navy Suit vs Black Suit' },
    { handle: 'charcoal-vs-navy-suit',                 title: 'Charcoal Suit vs Navy Suit' },
    { handle: 'natural-shoulder-vs-padded-shoulder',   title: 'Natural Shoulder vs Padded Shoulder' },
    { handle: 'super-100s-vs-super-150s-wool',         title: 'Super 100s vs Super 150s Wool' },
    { handle: 'peaked-vs-notch-lapel-blazer',          title: 'Peaked Lapel vs Notch Lapel Blazer' },
    { handle: 'wool-crepe-vs-worsted-wool',            title: 'Wool Crepe vs Worsted Wool' },
    { handle: 'black-tie-vs-white-tie',                title: 'Black Tie vs White Tie' },
    { handle: 'made-to-order-vs-off-the-rack',         title: 'Made-to-Order vs Off-the-Rack' },
    { handle: 'british-vs-american-suit-cut',          title: 'British vs American Suit Cut' },
    { handle: 'summer-vs-winter-weight-suit',          title: 'Summer vs Winter Weight Suit' },
    { handle: 'morning-coat-vs-frock-coat',            title: 'Morning Coat vs Frock Coat' },
  ]);

  await appendHubLinks('fabric-glossary', 'Patterns &amp; Checks', [
    { handle: 'what-is-barathea',        title: 'What is Barathea?' },
    { handle: 'what-is-glen-plaid',      title: 'What is Glen Plaid?' },
    { handle: 'what-is-houndstooth',     title: 'What is Houndstooth?' },
    { handle: 'what-is-chalk-stripe',    title: 'What is Chalk Stripe?' },
    { handle: 'what-is-pinstripe-fabric',title: 'What is Pinstripe Fabric?' },
    { handle: 'what-is-windowpane-check',title: 'What is Windowpane Check?' },
    { handle: 'what-is-tartan',          title: 'What is Tartan?' },
    { handle: 'what-is-madras',          title: 'What is Madras?' },
    { handle: 'what-is-jacquard',        title: 'What is Jacquard?' },
    { handle: 'what-is-boucle',          title: 'What is Bouclé?' },
  ]);
  await appendHubLinks('fabric-glossary', 'Specialist Suiting Cloths', [
    { handle: 'what-is-sharkskin',       title: 'What is Sharkskin?' },
    { handle: 'what-is-birdseye-weave',  title: 'What is Birdseye Weave?' },
    { handle: 'what-is-nailhead-weave',  title: 'What is Nailhead Weave?' },
    { handle: 'what-is-wool-crepe',      title: 'What is Wool Crepe?' },
    { handle: 'what-is-fresco-cloth',    title: 'What is Fresco Cloth?' },
    { handle: 'what-is-tropical-wool',   title: 'What is Tropical Wool?' },
    { handle: 'what-is-doeskin',         title: 'What is Doeskin?' },
    { handle: 'what-is-duchess-satin',   title: 'What is Duchess Satin?' },
    { handle: 'what-is-grosgrain',       title: 'What is Grosgrain?' },
  ]);
  await appendHubLinks('fabric-glossary', 'Premium Fibres', [
    { handle: 'what-is-alpaca',          title: 'What is Alpaca?' },
    { handle: 'what-is-silk-fabric',     title: 'What is Silk Fabric?' },
    { handle: 'what-is-vicuna',          title: 'What is Vicuña?' },
    { handle: 'what-is-super-150s-wool', title: 'What is Super 150s Wool?' },
    { handle: 'what-is-super-160s-wool', title: 'What is Super 160s Wool?' },
  ]);
  await appendHubLinks('fabric-glossary', 'Shirting &amp; Everyday Cloths', [
    { handle: 'what-is-cotton-poplin',   title: 'What is Cotton Poplin?' },
    { handle: 'what-is-oxford-cloth',    title: 'What is Oxford Cloth?' },
    { handle: 'what-is-pique',           title: 'What is Piqué?' },
    { handle: 'what-is-chambray',        title: 'What is Chambray?' },
    { handle: 'what-is-broadcloth',      title: 'What is Broadcloth?' },
    { handle: 'what-is-cotton-drill',    title: 'What is Cotton Drill?' },
    { handle: 'what-is-waxed-cotton',    title: 'What is Waxed Cotton?' },
    { handle: 'what-is-interlining',     title: 'What is Suit Interlining?' },
  ]);

  console.log('\n══════════════════════════════════════════════════════════');
  console.log('  DONE — 120 more pages deployed, hub pages updated.');
  console.log('══════════════════════════════════════════════════════════\n');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
