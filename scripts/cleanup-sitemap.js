'use strict';
/**
 * Unpublish all old cargo/irrelevant pages so only the 200 WA menswear pages remain in sitemap.
 */
const https = require('https');
const TOKEN = process.argv.find(a => a.startsWith('--token='))?.split('=')[1]
  || process.env.SHOPIFY_ADMIN_TOKEN
  || 'SHOPIFY_ACCESS_TOKEN';

function gql(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query, variables });
    const req = https.request({
      hostname: 'william-ashford-apex.myshopify.com',
      path: '/admin/api/2024-10/graphql.json',
      method: 'POST',
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

// All 200 WA menswear pages + brand/hub pages to KEEP published
const KEEP = new Set([
  // Hub pages
  'style-guides', 'occasions', 'style-comparisons', 'fabric-glossary',
  // Brand pages
  'about-us', 'contact', 'cargo-lab', 'size-chart',
  // Style guides (50)
  'how-to-style-a-navy-suit', 'how-to-style-a-grey-suit', 'how-to-style-a-charcoal-suit',
  'suit-with-brown-shoes', 'how-to-wear-a-suit-without-a-tie', 'how-to-style-a-blazer-with-trousers',
  'linen-suits-for-summer', 'smart-casual-men', 'how-to-style-dress-trousers',
  'how-to-style-a-morning-suit', 'business-casual-dress-code-men', 'how-to-style-tweed',
  'pinstripe-suit-guide', 'how-to-style-a-waistcoat', 'how-to-fold-a-pocket-square',
  'tie-knot-guide-men', 'suit-jacket-fit-guide', 'shirt-collar-guide-men',
  'how-to-wear-cufflinks', 'how-to-style-a-black-suit', 'how-to-style-a-brown-suit', 'autumn-winter-suiting',
  'how-to-style-a-dinner-suit', 'how-to-wear-a-three-piece-suit', 'how-to-style-a-checked-suit',
  'velvet-blazer-styling-guide', 'how-to-style-a-cream-suit', 'how-to-style-a-tan-suit',
  'how-to-style-a-herringbone-suit', 'double-breasted-suit-styling-guide', 'how-to-style-a-windowpane-suit',
  'how-to-style-chelsea-boots-with-suit', 'loafers-with-suit', 'how-to-wear-brogues-with-a-suit',
  'how-to-wear-monk-strap-shoes', 'roll-neck-with-suit',
  'how-to-style-oxford-shoes-men', 'how-to-wear-an-overcoat-with-a-suit', 'how-to-match-socks-to-suit',
  'how-to-style-a-glen-check-suit', 'how-to-style-a-houndstooth-jacket', 'how-to-wear-suit-trousers-casually',
  'how-to-style-summer-suiting', 'how-to-style-winter-suiting', 'how-to-style-a-pale-blue-suit',
  'how-to-wear-a-shawl-collar-dinner-jacket', 'how-to-style-a-velvet-jacket',
  'how-to-choose-suit-trousers', 'how-to-style-dress-shirt-men', 'three-piece-suit-styling-guide',
  // Occasions (50)
  'what-to-wear-to-a-job-interview', 'black-tie-dress-code-guide', 'what-to-wear-to-a-wedding-as-a-guest',
  'menswear-for-court-hearings', 'garden-party-outfit-men', 'graduation-outfit-men',
  'christmas-party-outfit-men', 'horse-racing-dress-code-men', 'funeral-attire-men', 'first-date-outfit-men',
  'summer-wedding-guest-outfit-men', 'winter-wedding-guest-outfit-men', 'cocktail-party-outfit-men',
  'formal-dinner-outfit-men', 'theatre-opera-dress-code-men', 'christening-outfit-men',
  'anniversary-dinner-outfit-men', 'award-ceremony-outfit-men', 'country-weekend-outfit-men',
  'black-tie-optional-dress-code-men',
  'charity-gala-outfit-men', 'business-dinner-outfit-men', 'networking-event-outfit-men',
  'engagement-party-outfit-men', 'retirement-party-outfit-men', 'gala-dinner-dress-code-men',
  'shooting-party-outfit-men', 'henley-regatta-outfit-men', 'cheltenham-festival-dress-code-men',
  'glyndebourne-dress-code-men', 'wimbledon-outfit-men', 'new-years-eve-outfit-men',
  'summer-ball-outfit-men', 'drinks-party-outfit-men', 'date-night-restaurant-outfit-men',
  'polo-match-spectator-outfit-men', 'easter-sunday-outfit-men', 'church-service-outfit-men',
  'bar-mitzvah-outfit-men', 'house-party-weekend-outfit-men', 'school-reunion-outfit-men',
  'winter-ball-outfit-men', 'city-dinner-dress-code-men', 'embassy-function-outfit-men',
  'work-presentation-outfit-men', 'charity-auction-outfit-men', 'polo-club-dress-code-men',
  'yacht-club-dress-code-men', 'remembrance-day-outfit-men', 'office-dinner-outfit-men',
  // Comparisons (50)
  'single-breasted-vs-double-breasted-suit', 'flat-front-vs-pleated-trousers', 'wool-vs-linen-suit',
  'slim-fit-vs-regular-fit-suit', 'suit-vs-blazer-and-trousers', 'morning-dress-vs-lounge-suit',
  'canvas-vs-fused-construction', 'bespoke-vs-made-to-measure', 'italian-vs-british-tailoring',
  'two-piece-vs-three-piece-suit',
  'notch-lapel-vs-peak-lapel', 'one-button-vs-two-button-suit', 'oxford-shoes-vs-derby-shoes',
  'monk-strap-vs-oxford-shoes', 'wool-vs-cashmere-suit', 'slim-tie-vs-regular-tie',
  'peak-lapel-vs-shawl-lapel-dinner-jacket', 'turn-up-vs-plain-trouser-hem', 'suspenders-vs-belt',
  'wool-flannel-vs-worsted-wool',
  'spread-collar-vs-point-collar', 'single-cuff-vs-double-cuff', 'full-break-vs-no-break-trousers',
  'high-waist-vs-mid-rise-trousers', 'silk-vs-wool-tie', 'leather-vs-suede-shoes',
  'brogues-vs-plain-oxford', 'loafers-vs-monk-straps', 'navy-vs-black-suit', 'charcoal-vs-navy-suit',
  'slim-fit-vs-tailored-fit-shirt', 'overcoat-vs-topcoat', 'chelsea-boots-vs-oxford-shoes',
  'natural-shoulder-vs-padded-shoulder', 'super-100s-vs-super-150s-wool',
  'slim-trousers-vs-wide-leg-trousers', 'side-vents-vs-centre-vent-vs-ventless', 'black-tie-vs-white-tie',
  'made-to-order-vs-off-the-rack', 'british-vs-american-suit-cut', 'summer-vs-winter-weight-suit',
  'ticket-pocket-vs-no-ticket-pocket', 'surgeon-cuffs-vs-decorative-cuffs', 'morning-coat-vs-frock-coat',
  'wool-vs-cotton-shirt', 'peaked-vs-notch-lapel-blazer', 'wool-crepe-vs-worsted-wool',
  'handmade-vs-machine-made-shoes', 'slim-fit-vs-classic-fit-trousers', 'woven-vs-knit-tie',
  // Fabric glossary (50)
  'what-is-super-100s-wool', 'what-is-super-120s-wool', 'what-is-merino-wool',
  'what-is-half-canvas-construction', 'what-is-full-canvas-construction',
  'what-is-herringbone-weave', 'what-is-twill-weave', 'what-is-linen',
  'what-is-cashmere', 'what-is-flannel', 'what-is-tweed', 'what-is-hopsack',
  'what-is-cavalry-twill', 'what-is-mohair', 'what-is-worsted-wool', 'what-is-gabardine',
  'what-is-velvet', 'what-is-seersucker',
  'what-is-barathea', 'what-is-glen-plaid', 'what-is-houndstooth', 'what-is-chalk-stripe',
  'what-is-pinstripe-fabric', 'what-is-windowpane-check', 'what-is-sharkskin',
  'what-is-birdseye-weave', 'what-is-nailhead-weave', 'what-is-super-150s-wool',
  'what-is-alpaca', 'what-is-silk-fabric', 'what-is-cotton-poplin', 'what-is-oxford-cloth',
  'what-is-pique', 'what-is-wool-crepe',
  'what-is-doeskin', 'what-is-duchess-satin', 'what-is-grosgrain', 'what-is-tartan',
  'what-is-madras', 'what-is-jacquard', 'what-is-boucle', 'what-is-vicuna',
  'what-is-super-160s-wool', 'what-is-fresco-cloth', 'what-is-tropical-wool',
  'what-is-waxed-cotton', 'what-is-cotton-drill', 'what-is-chambray',
  'what-is-broadcloth', 'what-is-interlining',
]);

async function main() {
  console.log('Fetching all pages...');
  let cursor = null, allPages = [];
  do {
    const after = cursor ? `, after: "${cursor}"` : '';
    const r = await gql(`{ pages(first:250${after}) { edges { node { id handle isPublished } cursor } pageInfo { hasNextPage } } }`);
    const edges = r.data?.pages?.edges || [];
    allPages.push(...edges.map(e => e.node));
    cursor = edges[edges.length - 1]?.cursor;
    if (!r.data?.pages?.pageInfo?.hasNextPage) break;
  } while (cursor);

  const toUnpublish = allPages.filter(p => p.isPublished && !KEEP.has(p.handle));
  console.log(`\nTotal pages: ${allPages.length}`);
  console.log(`Keeping published: ${KEEP.size}`);
  console.log(`Unpublishing: ${toUnpublish.length}\n`);

  let done = 0, err = 0;
  for (const page of toUnpublish) {
    process.stdout.write(`  ${page.handle}...`);
    const r = await gql(`mutation { pageUpdate(id: "${page.id}", page: { isPublished: false }) { page { handle } userErrors { message } } }`);
    const res = r.data?.pageUpdate;
    if (res?.userErrors?.length) { console.log(` ERR: ${res.userErrors[0].message}`); err++; }
    else { console.log(' unpublished'); done++; }
    await sleep(200);
  }

  console.log(`\n✓ Done: ${done} unpublished, ${err} errors`);
  console.log(`\nSitemap will now contain ~${KEEP.size} pages (200 WA + brand pages).`);
}

main().catch(console.error);
