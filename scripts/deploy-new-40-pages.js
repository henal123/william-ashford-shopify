'use strict';
/**
 * Deploy 40 new pSEO pages to William Ashford Shopify store.
 * Creates Shopify pages + metaobject entries + updates hub pages.
 *
 * Usage: node scripts/deploy-new-40-pages.js
 */

const https = require('https');
const { styleGuides }      = require('../seo-setup/new-style-guides.js');
const { occasionGuides }   = require('../seo-setup/new-occasion-guides.js');
const { newComparisons }   = require('../seo-setup/new-comparisons.js');
const { newFabricGlossary }= require('../seo-setup/new-fabric-glossary.js');

const STORE       = 'william-ashford-apex.myshopify.com';
const API_VERSION = '2024-10';
const TOKEN       = process.argv.find(a => a.startsWith('--token='))?.split('=')[1]
  || process.env.SHOPIFY_ADMIN_TOKEN
  || '<SHOPIFY_ACCESS_TOKEN>';

function gql(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query, variables });
    const req = https.request({
      hostname: STORE,
      path: `/admin/api/${API_VERSION}/graphql.json`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': TOKEN,
        'Content-Length': Buffer.byteLength(body),
      },
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { resolve(JSON.parse(d)); } catch (e) { reject(new Error(d.substring(0, 300))); } });
    });
    req.on('error', reject); req.write(body); req.end();
  });
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function getPageId(handle) {
  const r = await gql('{ pages(first:1, query:"handle:' + handle + '") { edges { node { id } } } }');
  return r.data?.pages?.edges?.[0]?.node?.id || null;
}

// ── Create a Shopify page (or update if handle exists) ──────────────────────
async function upsertPage(handle, title, template, seoTitle, seoDesc) {
  const fields = {
    title,
    body: '<p>Loading guide...</p>',
    isPublished: true,
    templateSuffix: template,
    metafields: [
      { namespace: 'global', key: 'title_tag',       type: 'single_line_text_field', value: seoTitle },
      { namespace: 'global', key: 'description_tag', type: 'multi_line_text_field',  value: seoDesc  },
    ],
  };

  const cr = await gql(
    'mutation C($p:PageCreateInput!){pageCreate(page:$p){page{id handle}userErrors{field message}}}',
    { p: { handle, ...fields } }
  );
  const ce = cr.data?.pageCreate;
  const taken = ce?.userErrors?.some(e => e.message.toLowerCase().includes('handle'));

  if (taken) {
    const id = await getPageId(handle);
    if (!id) return 'ERR:notfound';
    const ur = await gql(
      'mutation U($id:ID!,$p:PageUpdateInput!){pageUpdate(id:$id,page:$p){page{handle}userErrors{field message}}}',
      { id, p: fields }
    );
    const ue = ur.data?.pageUpdate;
    return ue?.userErrors?.length ? 'ERR:' + ue.userErrors[0].message : 'UPDATED';
  }
  return ce?.userErrors?.length ? 'ERR:' + ce.userErrors[0].message : 'CREATED';
}

// ── Create a metaobject entry (skip if handle exists) ───────────────────────
async function createMetaobject(type, handle, fieldMap) {
  const fields = Object.entries(fieldMap).map(([key, value]) => ({
    key,
    value: typeof value === 'object' ? JSON.stringify(value) : String(value),
  }));
  const r = await gql(
    'mutation M($m:MetaobjectCreateInput!){metaobjectCreate(metaobject:$m){metaobject{handle}userErrors{field message}}}',
    { m: { type, handle, fields } }
  );
  const res = r.data?.metaobjectCreate;
  if (res?.userErrors?.length) {
    const exists = res.userErrors.some(e => e.message.toLowerCase().includes('handle') || e.message.toLowerCase().includes('taken'));
    return exists ? 'EXISTS' : 'ERR:' + res.userErrors[0].message;
  }
  return 'CREATED';
}

// ── Run a batch with progress logging ───────────────────────────────────────
async function runBatch(label, items, pageFn, metaFn) {
  console.log(`\n=== ${label} (${items.length}) ===`);
  let cp = 0, cm = 0, skip = 0, err = 0;
  for (const item of items) {
    const h = item.handle;
    process.stdout.write(`  ${h}...`);
    const ps = await pageFn(item);
    await sleep(200);
    const ms = await metaFn(item);
    await sleep(300);
    if (ps.startsWith('ERR') || ms.startsWith('ERR')) {
      console.log(` PAGE:${ps} META:${ms}`); err++;
    } else {
      console.log(` page:${ps} meta:${ms}`);
      if (ps === 'CREATED') cp++; if (ms === 'CREATED') cm++;
      if (ms === 'EXISTS') skip++;
    }
  }
  console.log(`  → pages: ${cp} created / meta: ${cm} created, ${skip} skipped, ${err} errors`);
}

// ── Update a hub page body to append new links ───────────────────────────────
async function appendHubLinks(hubHandle, h2heading, links) {
  const id = await getPageId(hubHandle);
  if (!id) { console.log(`  hub ${hubHandle}: NOT FOUND`); return; }

  const r = await gql('{ pages(first:1,query:"handle:' + hubHandle + '"){edges{node{body}}}}');
  const current = r.data?.pages?.edges?.[0]?.node?.body || '';

  const newSection = `<h2>${h2heading}</h2><ul>${links.map(l => `<li><a href="/pages/${l.handle}">${l.title}</a></li>`).join('')}</ul>`;
  const updated = current + '\n' + newSection;

  await gql(
    'mutation U($id:ID!,$p:PageUpdateInput!){pageUpdate(id:$id,page:$p){page{handle}userErrors{field message}}}',
    { id, p: { body: updated } }
  );
  console.log(`  hub ${hubHandle}: appended ${links.length} links`);
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  William Ashford — Deploy 40 New pSEO Pages             ║');
  console.log('╚══════════════════════════════════════════════════════════╝');

  const shop = await gql('{ shop { name } }');
  console.log('Connected to:', shop.data?.shop?.name);

  // 1. Style Guides
  await runBatch('Style Guides', styleGuides,
    item => upsertPage(item.handle, item.heading, 'style-guide', item.seo_title, item.seo_description),
    item => createMetaobject('use_case_guide', item.handle, {
      heading: item.heading, occasion: item.heading,
      seo_title: item.seo_title, seo_description: item.seo_description,
      intro_text: item.intro_text, style_tips: item.style_tips,
      recommended_pieces: item.recommended_pieces, dos_and_donts: item.dos_and_donts,
      collection_link: item.collection_link, faq_data: item.faq_data,
    })
  );

  // 2. Occasion Guides
  await runBatch('Occasion Guides', occasionGuides,
    item => upsertPage(item.handle, item.heading, 'use-case', item.seo_title, item.seo_description),
    item => createMetaobject('use_case_guide', item.handle, {
      heading: item.heading, occasion: item.heading,
      seo_title: item.seo_title, seo_description: item.seo_description,
      intro_text: item.intro_text, style_tips: item.style_tips,
      recommended_pieces: item.recommended_pieces, dos_and_donts: item.dos_and_donts,
      collection_link: item.collection_link, faq_data: item.faq_data,
    })
  );

  // 3. Comparisons
  await runBatch('Style Comparisons', newComparisons,
    item => upsertPage(item.handle, item.heading, 'comparison', item.seo_title, item.seo_description),
    item => createMetaobject('style_comparison', item.handle, {
      heading: item.heading,
      seo_title: item.seo_title, seo_description: item.seo_description,
      intro_text: item.intro_text,
      item_a_name: item.item_a_name, item_a_pros: item.item_a_pros, item_a_cons: item.item_a_cons,
      item_b_name: item.item_b_name, item_b_pros: item.item_b_pros, item_b_cons: item.item_b_cons,
      verdict: item.verdict,
      item_a_collection: item.item_a_collection, item_b_collection: item.item_b_collection,
      faq_data: item.faq_data,
    })
  );

  // 4. Fabric Glossary — page handle is `what-is-{handle}`, metaobject handle is `{handle}`
  await runBatch('Fabric Glossary', newFabricGlossary,
    item => upsertPage('what-is-' + item.handle, 'What is ' + item.term_name + '?', 'fabric-glossary', item.seo_title, item.seo_description),
    item => createMetaobject('fabric_glossary_term', item.handle, {
      term_name: item.term_name,
      seo_title: item.seo_title, seo_description: item.seo_description,
      short_definition: item.short_definition, full_definition: item.full_definition,
      properties: item.properties, care_tips: item.care_tips,
      collection_link: item.collection_link, faq_data: item.faq_data,
    })
  );

  // 5. Update hub pages with new links
  console.log('\n=== Updating Hub Pages ===');

  await appendHubLinks('style-guides', 'Fit, Accessories &amp; More', [
    { handle: 'pinstripe-suit-guide',        title: 'How to Wear a Pinstripe Suit' },
    { handle: 'how-to-style-a-waistcoat',    title: 'How to Style a Waistcoat' },
    { handle: 'how-to-fold-a-pocket-square', title: 'How to Fold a Pocket Square' },
    { handle: 'tie-knot-guide-men',          title: 'Tie Knot Guide for Men' },
    { handle: 'suit-jacket-fit-guide',       title: 'How to Tell If a Suit Jacket Fits' },
    { handle: 'shirt-collar-guide-men',      title: 'Shirt Collar Guide for Men' },
    { handle: 'how-to-wear-cufflinks',       title: 'How to Wear Cufflinks' },
    { handle: 'how-to-style-a-black-suit',   title: 'How to Style a Black Suit' },
    { handle: 'how-to-style-a-brown-suit',   title: 'How to Style a Brown Suit' },
    { handle: 'autumn-winter-suiting',       title: 'Autumn &amp; Winter Suiting Guide' },
  ]);

  await appendHubLinks('occasions', 'More Occasions', [
    { handle: 'summer-wedding-guest-outfit-men',    title: 'Summer Wedding Guest Outfit' },
    { handle: 'winter-wedding-guest-outfit-men',    title: 'Winter Wedding Guest Outfit' },
    { handle: 'cocktail-party-outfit-men',          title: 'Cocktail Party Outfit Guide' },
    { handle: 'formal-dinner-outfit-men',           title: 'Formal Dinner Outfit Guide' },
    { handle: 'theatre-opera-dress-code-men',       title: 'Theatre &amp; Opera Dress Code' },
    { handle: 'christening-outfit-men',             title: 'Christening Outfit Guide' },
    { handle: 'anniversary-dinner-outfit-men',      title: 'Anniversary Dinner Outfit Guide' },
    { handle: 'award-ceremony-outfit-men',          title: 'Award Ceremony Outfit Guide' },
    { handle: 'country-weekend-outfit-men',         title: 'Country Weekend Outfit Guide' },
    { handle: 'black-tie-optional-dress-code-men',  title: 'Black Tie Optional Dress Code' },
  ]);

  await appendHubLinks('style-comparisons', 'Lapels, Shoes &amp; Details', [
    { handle: 'notch-lapel-vs-peak-lapel',               title: 'Notch Lapel vs Peak Lapel' },
    { handle: 'one-button-vs-two-button-suit',           title: 'One Button vs Two Button Suit' },
    { handle: 'oxford-shoes-vs-derby-shoes',             title: 'Oxford Shoes vs Derby Shoes' },
    { handle: 'monk-strap-vs-oxford-shoes',              title: 'Monk Strap vs Oxford Shoes' },
    { handle: 'wool-vs-cashmere-suit',                   title: 'Wool vs Cashmere Suit' },
    { handle: 'slim-tie-vs-regular-tie',                 title: 'Slim Tie vs Regular Tie' },
    { handle: 'peak-lapel-vs-shawl-lapel-dinner-jacket', title: 'Peak Lapel vs Shawl Lapel Dinner Jacket' },
    { handle: 'turn-up-vs-plain-trouser-hem',            title: 'Turn-Up vs Plain Trouser Hem' },
    { handle: 'suspenders-vs-belt',                      title: 'Suspenders vs Belt' },
    { handle: 'wool-flannel-vs-worsted-wool',            title: 'Wool Flannel vs Worsted Wool' },
  ]);

  await appendHubLinks('fabric-glossary', 'More Fabrics &amp; Fibres', [
    { handle: 'what-is-cashmere',        title: 'What is Cashmere?' },
    { handle: 'what-is-flannel',         title: 'What is Flannel?' },
    { handle: 'what-is-tweed',           title: 'What is Tweed?' },
    { handle: 'what-is-hopsack',         title: 'What is Hopsack?' },
    { handle: 'what-is-cavalry-twill',   title: 'What is Cavalry Twill?' },
    { handle: 'what-is-mohair',          title: 'What is Mohair?' },
    { handle: 'what-is-worsted-wool',    title: 'What is Worsted Wool?' },
    { handle: 'what-is-gabardine',       title: 'What is Gabardine?' },
    { handle: 'what-is-velvet',          title: 'What is Velvet?' },
    { handle: 'what-is-seersucker',      title: 'What is Seersucker?' },
  ]);

  console.log('\n══════════════════════════════════════════════════════════');
  console.log('  DONE — 40 new pages deployed, hub pages updated.');
  console.log('══════════════════════════════════════════════════════════\n');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
