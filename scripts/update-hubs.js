'use strict';
const https = require('https');
const TOKEN = process.argv.find(a => a.startsWith('--token='))?.split('=')[1] || process.env.SHOPIFY_ADMIN_TOKEN;
if (!TOKEN) { console.error('Provide --token=shpat_xxxxx'); process.exit(1); }

function gql(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query, variables });
    const req = https.request({
      hostname: 'william-ashford-apex.myshopify.com',
      path: '/admin/api/2024-10/graphql.json',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': TOKEN, 'Content-Length': Buffer.byteLength(body) }
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
  const r = await gql('{ pages(first:1, query: "handle:' + handle + '") { edges { node { id } } } }');
  return r.data?.pages?.edges?.[0]?.node?.id;
}

const hubs = [
  {
    handle: 'style-guides',
    title: 'Style Guides | William Ashford',
    body: '<h1>Style Guides</h1><p>How to wear William Ashford — from choosing the right suit colour for an interview to pairing dress trousers with the right shoe. Our style guides give you the specific answers, not the generic advice.</p><h2>Suit Styling</h2><ul><li><a href="/pages/how-to-style-a-navy-suit">How to Style a Navy Suit</a></li><li><a href="/pages/how-to-style-a-grey-suit">How to Style a Grey Suit</a></li><li><a href="/pages/how-to-style-a-charcoal-suit">How to Style a Charcoal Suit</a></li><li><a href="/pages/suit-with-brown-shoes">Suit with Brown Shoes</a></li><li><a href="/pages/how-to-wear-a-suit-without-a-tie">How to Wear a Suit Without a Tie</a></li><li><a href="/pages/how-to-style-a-morning-suit">How to Style a Morning Suit</a></li></ul><h2>Smart Casual &amp; Separates</h2><ul><li><a href="/pages/how-to-style-a-blazer-with-trousers">How to Style a Blazer with Trousers</a></li><li><a href="/pages/smart-casual-men">Smart Casual for Men</a></li><li><a href="/pages/business-casual-dress-code-men">Business Casual Dress Code</a></li><li><a href="/pages/how-to-style-dress-trousers">How to Style Dress Trousers</a></li><li><a href="/pages/how-to-style-tweed">How to Style Tweed</a></li></ul><h2>Seasonal Dressing</h2><ul><li><a href="/pages/linen-suits-for-summer">Linen Suits for Summer</a></li></ul>',
    seo_title: 'Style Guides for Men | William Ashford',
    seo_desc: 'How to style suits, blazers, and trousers from William Ashford. Specific, practical guides for every occasion and season.',
  },
  {
    handle: 'occasions',
    title: 'Occasion Dressing Guides | William Ashford',
    body: '<h1>Occasion Dressing Guides</h1><p>What to wear and what to avoid for every occasion that calls for considered menswear. From black tie to business interviews, get the dress code right the first time.</p><h2>Professional Occasions</h2><ul><li><a href="/pages/what-to-wear-to-a-job-interview">What to Wear to a Job Interview</a></li><li><a href="/pages/menswear-for-court-hearings">Menswear for Court Hearings</a></li><li><a href="/pages/graduation-outfit-men">Graduation Outfit Guide</a></li></ul><h2>Social &amp; Formal Occasions</h2><ul><li><a href="/pages/black-tie-dress-code-guide">Black Tie Dress Code Guide</a></li><li><a href="/pages/what-to-wear-to-a-wedding-as-a-guest">What to Wear to a Wedding as a Guest</a></li><li><a href="/pages/garden-party-outfit-men">Garden Party Outfit Guide</a></li><li><a href="/pages/horse-racing-dress-code-men">Horse Racing Dress Code</a></li><li><a href="/pages/christmas-party-outfit-men">Christmas Party Outfit Guide</a></li><li><a href="/pages/funeral-attire-men">Funeral Attire for Men</a></li><li><a href="/pages/first-date-outfit-men">First Date Outfit Guide</a></li></ul>',
    seo_title: 'Occasion Dressing Guides for Men | William Ashford',
    seo_desc: 'Dress code guides for every occasion — weddings, interviews, black tie, and more. Get it right with William Ashford.',
  },
  {
    handle: 'style-comparisons',
    title: 'Style Comparisons | William Ashford',
    body: '<h1>Style Comparisons</h1><p>Not sure which to choose? Our detailed comparisons break down the differences between suit styles, trouser cuts, fabric types, and construction methods — so you can make a confident decision.</p><h2>Suit Comparisons</h2><ul><li><a href="/pages/single-breasted-vs-double-breasted-suit">Single-Breasted vs Double-Breasted Suit</a></li><li><a href="/pages/slim-fit-vs-regular-fit-suit">Slim Fit vs Regular Fit Suit</a></li><li><a href="/pages/suit-vs-blazer-and-trousers">Suit vs Blazer and Trousers</a></li><li><a href="/pages/morning-dress-vs-lounge-suit">Morning Dress vs Lounge Suit</a></li><li><a href="/pages/two-piece-vs-three-piece-suit">Two-Piece vs Three-Piece Suit</a></li><li><a href="/pages/italian-vs-british-tailoring">Italian vs British Tailoring</a></li><li><a href="/pages/bespoke-vs-made-to-measure">Bespoke vs Made-to-Measure</a></li></ul><h2>Trouser &amp; Fabric Comparisons</h2><ul><li><a href="/pages/flat-front-vs-pleated-trousers">Flat-Front vs Pleated Trousers</a></li><li><a href="/pages/wool-vs-linen-suit">Wool vs Linen Suit</a></li><li><a href="/pages/canvas-vs-fused-construction">Canvas vs Fused Construction</a></li></ul>',
    seo_title: 'Suit & Style Comparisons | William Ashford',
    seo_desc: 'Compare suit styles, trouser cuts, and fabrics side by side. Make the right choice with William Ashford comparison guides.',
  },
  {
    handle: 'fabric-glossary',
    title: 'Fabric Glossary | William Ashford',
    body: '<h1>Fabric Glossary</h1><p>The materials behind William Ashford garments, explained clearly. Understanding what your clothes are made of and why it matters is the first step to buying better and wearing longer.</p><h2>Wool &amp; Natural Fibres</h2><ul><li><a href="/pages/what-is-super-100s-wool">What is Super 100s Wool?</a></li><li><a href="/pages/what-is-super-120s-wool">What is Super 120s Wool?</a></li><li><a href="/pages/what-is-merino-wool">What is Merino Wool?</a></li><li><a href="/pages/what-is-linen">What is Linen?</a></li></ul><h2>Construction &amp; Weave</h2><ul><li><a href="/pages/what-is-half-canvas-construction">What is Half-Canvas Construction?</a></li><li><a href="/pages/what-is-full-canvas-construction">What is Full-Canvas Construction?</a></li><li><a href="/pages/what-is-herringbone-weave">What is Herringbone Weave?</a></li><li><a href="/pages/what-is-twill-weave">What is Twill Weave?</a></li></ul>',
    seo_title: 'Fabric Glossary: Wool, Linen & Tailoring Terms | William Ashford',
    seo_desc: 'Understand the fabrics and construction methods behind premium menswear. William Ashford fabric glossary.',
  },
];

async function main() {
  for (const hub of hubs) {
    process.stdout.write('Updating ' + hub.handle + '...');
    const id = await getPageId(hub.handle);
    if (!id) { console.log(' NOT FOUND'); continue; }
    const r = await gql(
      'mutation UpdatePage($id: ID!, $page: PageUpdateInput!) { pageUpdate(id: $id, page: $page) { page { handle } userErrors { field message } } }',
      {
        id,
        page: {
          title: hub.title,
          body: hub.body,
          isPublished: true,
          metafields: [
            { namespace: 'global', key: 'title_tag', type: 'single_line_text_field', value: hub.seo_title },
            { namespace: 'global', key: 'description_tag', type: 'multi_line_text_field', value: hub.seo_desc },
          ]
        }
      }
    );
    const res = r.data?.pageUpdate;
    if (res?.userErrors?.length > 0) console.log(' ERRORS: ' + res.userErrors.map(e => e.message).join(', '));
    else console.log(' OK');
    await sleep(400);
  }
  console.log('All hubs updated.');
}
main().catch(console.error);
