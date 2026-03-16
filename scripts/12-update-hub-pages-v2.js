/**
 * Update hub pages with styled link grids — V2 (Expanded)
 * Covers all 7 hubs: style-guides, style-comparisons, fabric-glossary,
 * occasions, buying-guides, brand-comparisons, cargo-color-guides
 */
const { graphql, sleep } = require('./shopify-api');

const FIND_PAGE = `
query FindPage($query: String!) {
  pages(first: 1, query: $query) {
    nodes { id handle title }
  }
}`;

const UPDATE_PAGE = `
mutation UpdatePage($id: ID!, $page: PageUpdateInput!) {
  pageUpdate(id: $id, page: $page) {
    page { id handle title }
    userErrors { field message }
  }
}`;

// ============================================================
// STYLE GUIDES (20 pages)
// ============================================================
const styleGuidePages = [
  // Outfit Ideas
  { title: 'Cargo Pants Outfit Ideas for Men', handle: 'cargo-pants-outfit-ideas-men', desc: 'Complete outfit guide for every occasion.' },
  { title: 'Cargo Pants with Shirt Combinations', handle: 'cargo-pants-with-shirt-combinations', desc: '7 shirt combos that work.' },
  { title: 'Cargo Pants with Sneakers', handle: 'cargo-pants-with-sneakers', desc: 'Best sneaker pairings.' },
  { title: 'Oversized T-Shirt with Cargo Pants', handle: 'oversized-tshirt-with-cargo-pants', desc: 'Gen Z streetwear looks.' },
  // Color Guides (also in cargo-color-guides hub)
  { title: '7 Outfit Ideas for Olive Cargo Pants', handle: 'olive-cargo-outfits', desc: 'Casual to layered looks.' },
  { title: 'How to Style Khaki Cargo Pants', handle: 'khaki-cargo-outfits', desc: '6 ways to wear khaki cargos.' },
  { title: 'How to Style Beige Cargo Pants', handle: 'how-to-style-beige-cargo-pants', desc: 'Sandy tan outfit ideas.' },
  { title: 'How to Style Brown Cargo Pants', handle: 'how-to-style-brown-cargo-pants', desc: 'Earth-tone outfits for 2026.' },
  // Chino Styling
  { title: 'Chinos for Job Interviews', handle: 'chinos-for-interview', desc: 'Colours, fit, and pairings.' },
  // How-To
  { title: 'How to Cuff Cargo Pants', handle: 'how-to-cuff-cargo-pants', desc: '3 cuff styles explained.' },
  { title: 'How to Choose Cargo Pants: Buyer\'s Guide', handle: 'how-to-choose-cargo-pants', desc: 'Fabric, fit, pockets, and quality.' },
  { title: 'Cargo Pants Size Guide', handle: 'cargo-pants-size-guide', desc: 'Measuring tips and fit guide.' },
  { title: 'Cargo Pants Fabric Guide', handle: 'cargo-pants-fabric-guide', desc: 'Cotton twill, ripstop, canvas, and more.' },
  // Seasonal
  { title: 'How to Wear Cargo Pants in Winter', handle: 'cargo-pants-winter-styling', desc: 'Boot pairings and cold weather outfits.' },
  { title: 'Festival Outfit Ideas With Cargo Pants', handle: 'festival-outfit-cargos', desc: 'Practical and stylish festival looks.' },
  // Occasion crossovers
  { title: 'Can You Wear Cargo Pants to the Gym?', handle: 'cargo-pants-for-gym', desc: 'Pros, cons, and when it works.' },
  { title: 'Cargo Pants for Hiking', handle: 'cargo-pants-for-hiking', desc: 'Trail tips and outfit ideas.' },
  { title: 'What to Wear in Monsoon: Cargo Pants Guide', handle: 'cargo-pants-for-monsoon', desc: 'Monsoon season styling.' },
  { title: 'Best Cargo Pants Under ₹1,500', handle: 'best-cargo-pants-under-1500', desc: 'Quality picks at this price point.' },
  { title: 'Best Cargo Pants for Indian Summer', handle: 'best-cargo-pants-for-summer-india', desc: 'Lightweight and breathable picks.' },
];

// ============================================================
// STYLE COMPARISONS (19 pages)
// ============================================================
const comparisonPages = [
  // Existing
  { title: 'Cargo Pants vs Track Pants', handle: 'cargo-pants-vs-track-pants', desc: 'Style, comfort, and durability.' },
  { title: 'Chinos vs Jeans', handle: 'chinos-vs-jeans', desc: 'Comfort, versatility, and style.' },
  { title: 'Cotton vs Linen Pants for Summer', handle: 'cotton-vs-linen-pants', desc: 'Breathability, comfort, and style.' },
  { title: '6-Pocket vs 4-Pocket Cargo Pants', handle: '6-pocket-vs-4-pocket-cargo', desc: 'How many pockets do you need?' },
  { title: 'Ankle-Length vs Full-Length Pants', handle: 'ankle-length-vs-full-length-pants', desc: 'Compare both lengths.' },
  { title: 'Cargo Pants vs Cargo Shorts', handle: 'cargo-pants-vs-shorts', desc: 'Style, occasions, and practicality.' },
  { title: 'Zip Cargo Pockets vs Flap Pockets', handle: 'zipper-cargo-vs-flap-cargo', desc: 'Security, style, and function.' },
  { title: 'Mid-Rise vs High-Rise Pants', handle: 'mid-rise-vs-high-rise-pants', desc: 'Which rise suits you best?' },
  { title: 'Branded vs Unbranded Cargo Pants', handle: 'branded-vs-unbranded-cargo-pants', desc: 'Quality and value compared.' },
  { title: 'Olive vs Black Cargo Pants', handle: 'olive-vs-black-cargo-pants', desc: 'Versatility and styling options.' },
  { title: 'Cargo Pants vs Utility Pants', handle: 'cargo-pants-vs-utility-pants', desc: 'Design and style differences.' },
  { title: 'Cuffed vs Uncuffed Pants', handle: 'cuffed-vs-uncuffed-pants', desc: 'When to roll and when to keep clean.' },
  // New — Trending Comparisons
  { title: 'Cargo Pants vs Parachute Pants', handle: 'cargo-pants-vs-parachute-pants', desc: 'Trending styles compared.' },
  { title: 'Loose Fit vs Tapered Cargo Pants', handle: 'loose-fit-vs-tapered-cargo', desc: '2026 fit trends.' },
  { title: 'Cargo Pants vs Carpenter Pants', handle: 'cargo-pants-vs-carpenter-pants', desc: 'Workwear vs utility.' },
  { title: 'Cotton Cargo vs Polyester Cargo', handle: 'cotton-cargo-vs-polyester-cargo', desc: '100% cotton positioning.' },
  { title: 'Baggy Cargo vs Slim Cargo Pants', handle: 'baggy-cargo-vs-slim-cargo', desc: 'Which fit is right?' },
  { title: 'Cargo Pants vs Tactical Pants', handle: 'cargo-pants-vs-tactical-pants', desc: 'Outdoor crossover styles.' },
  { title: 'Enzyme Wash vs Stone Wash', handle: 'enzyme-wash-vs-stone-wash', desc: 'Wash techniques compared.' },
];

// ============================================================
// FABRIC GLOSSARY (20 pages)
// ============================================================
const glossaryPages = [
  // Existing
  { title: 'What Is Corduroy Fabric?', handle: 'what-is-corduroy', desc: 'Ridged texture, warmth, and timeless appeal.' },
  { title: 'What Is Denim Fabric?', handle: 'what-is-denim', desc: 'How it\'s made, types, and care.' },
  { title: 'What Is Nylon Fabric?', handle: 'what-is-nylon', desc: 'Strength and water resistance.' },
  { title: 'What Is Linen Fabric?', handle: 'what-is-linen', desc: 'The most breathable natural textile.' },
  { title: 'What Is Polyester Fabric?', handle: 'what-is-polyester', desc: 'Properties, pros, and cons.' },
  { title: 'What Is Enzyme Wash?', handle: 'what-is-enzyme-wash', desc: 'Natural softening process.' },
  { title: 'What Is Stone Wash?', handle: 'what-is-stone-wash', desc: 'Vintage looks in denim and cotton.' },
  { title: 'What Is Mercerized Cotton?', handle: 'what-is-mercerized-cotton', desc: 'Lustre, strength, and colour retention.' },
  { title: 'What Is Brushed Twill?', handle: 'what-is-brushed-twill', desc: 'Soft, flannel-like cotton twill.' },
  { title: 'What Is Moisture-Wicking Fabric?', handle: 'what-is-moisture-wicking', desc: 'Stay dry and comfortable.' },
  { title: 'What Is Anti-Pilling?', handle: 'what-is-anti-pilling', desc: 'Keep trousers looking new.' },
  { title: 'What Is Overdyeing (OD)?', handle: 'what-is-overdyeing', desc: 'Rich, complex colour layers.' },
  { title: 'Twill Weave vs Plain Weave', handle: 'twill-weave-vs-plain-weave', desc: 'Which is better for trousers?' },
  { title: 'What Is Sanforization?', handle: 'what-is-sanforization', desc: 'Pre-shrinking for consistent fit.' },
  { title: 'What Is Gabardine Fabric?', handle: 'what-is-gabardine', desc: 'Smooth finish and water resistance.' },
  // New
  { title: 'What Is French Terry Fabric?', handle: 'what-is-french-terry', desc: 'Soft, looped-back knit.' },
  { title: 'What Is Oxford Cotton?', handle: 'what-is-oxford-cotton', desc: 'Basket weave for shirts and chinos.' },
  { title: 'Cotton vs Cotton Blend Pants', handle: 'cotton-vs-cotton-blend', desc: '100% cotton vs blend comparison.' },
  { title: 'GSM Weight Guide', handle: 'what-is-gsm-weight-guide', desc: 'Fabric weight explained.' },
  { title: 'Fabric Care Guide', handle: 'fabric-care-guide', desc: 'Care tips for all fabrics.' },
];

// ============================================================
// OCCASIONS (14 pages)
// ============================================================
const occasionPages = [
  { title: 'Cargo Pants for College', handle: 'cargo-pants-for-college', desc: 'Campus-ready looks.' },
  { title: 'Cargo Pants for Travel', handle: 'cargo-pants-for-travel', desc: 'Comfort meets style on the road.' },
  { title: 'Cargo Pants for Hiking', handle: 'cargo-pants-for-hiking', desc: 'Trail tips and outfit ideas.' },
  { title: 'Can You Wear Cargo Pants to the Gym?', handle: 'cargo-pants-for-gym', desc: 'Pros, cons, and when it works.' },
  { title: 'Cargo Pants for Monsoon', handle: 'cargo-pants-for-monsoon', desc: 'Monsoon season styling.' },
  { title: 'How to Style Black Cargo Pants', handle: 'how-to-style-black-cargo-pants', desc: 'Day to night looks.' },
  { title: 'Cargo Pants Winter Styling', handle: 'cargo-pants-winter-styling', desc: 'Cold weather outfits.' },
  { title: 'Festival Outfit Ideas With Cargo Pants', handle: 'festival-outfit-cargos', desc: 'Stylish festival looks.' },
  { title: 'Chinos for Job Interviews', handle: 'chinos-for-interview', desc: 'Colours, fit, and pairings.' },
  { title: 'Best Cargo Pants for Summer India', handle: 'best-cargo-pants-for-summer-india', desc: 'Lightweight picks.' },
  // New
  { title: 'Cargo Pants for Road Trips', handle: 'cargo-pants-for-road-trip', desc: 'Comfort and photo-ready looks.' },
  { title: 'Cargo Pants for Streetwear', handle: 'cargo-pants-for-streetwear', desc: 'Urban style essentials.' },
  { title: 'Cargo Pants for Weekend', handle: 'cargo-pants-for-weekend', desc: 'Casual weekend outfits.' },
  { title: 'Cargo Pants for Concerts', handle: 'cargo-pants-for-concert', desc: 'Event outfit ideas.' },
];

// ============================================================
// BUYING GUIDES (6 pages)
// ============================================================
const buyingGuidePages = [
  { title: 'Best Cargo Pants Under ₹1,500', handle: 'best-cargo-pants-under-1500', desc: 'Quality picks at this price.' },
  { title: 'Best Cargo Pants for Summer India', handle: 'best-cargo-pants-for-summer-india', desc: 'Lightweight picks.' },
  { title: 'How to Choose Cargo Pants', handle: 'how-to-choose-cargo-pants', desc: 'Fabric, fit, and quality.' },
  { title: 'Cargo Pants Size Guide', handle: 'cargo-pants-size-guide', desc: 'Measuring tips.' },
  // New
  { title: 'Best Cargo Pants Under ₹2,000', handle: 'best-cargo-pants-under-2000', desc: 'Premium picks under 2K.' },
  { title: 'Cargo Pants for Beginners', handle: 'cargo-pants-for-beginners', desc: 'First-time buyer guide.' },
];

// ============================================================
// BRAND COMPARISONS (10 pages) — NEW HUB
// ============================================================
const brandComparisonPages = [
  { title: 'Best Cargo Pants Brands in India', handle: 'best-cargo-pants-brands-india', desc: 'Top brands compared.' },
  { title: 'William Ashford vs Urban Monkey', handle: 'william-ashford-vs-urban-monkey', desc: 'Premium cargo comparison.' },
  { title: 'William Ashford vs Bewakoof', handle: 'william-ashford-vs-bewakoof', desc: 'Value vs quality.' },
  { title: 'William Ashford vs Snitch', handle: 'william-ashford-vs-snitch', desc: 'Style and fabric compared.' },
  { title: 'William Ashford vs Roadster', handle: 'william-ashford-vs-roadster', desc: 'Marketplace vs brand.' },
  { title: 'William Ashford vs Wrogn', handle: 'william-ashford-vs-wrogn', desc: 'Trendy vs timeless.' },
  { title: 'William Ashford vs Highlander', handle: 'william-ashford-vs-highlander', desc: 'Budget comparison.' },
  { title: 'William Ashford vs Nobero', handle: 'william-ashford-vs-nobero', desc: 'D2C brands compared.' },
  { title: 'Myntra vs Brand Direct', handle: 'cargo-pants-myntra-vs-brand-direct', desc: 'Where to buy cargos.' },
  { title: 'Affordable Cargo Pants Alternatives', handle: 'alternatives-to-expensive-cargo-pants', desc: 'Premium quality, fair price.' },
];

// ============================================================
// CARGO COLOR GUIDES (7 pages) — NEW HUB
// ============================================================
const colorGuidePages = [
  // Existing (dual-listed from style-guides)
  { title: 'How to Style Black Cargo Pants', handle: 'how-to-style-black-cargo-pants', desc: 'Day to night looks.' },
  { title: '7 Outfit Ideas for Olive Cargo Pants', handle: 'olive-cargo-outfits', desc: 'Casual to layered looks.' },
  { title: 'How to Style Khaki Cargo Pants', handle: 'khaki-cargo-outfits', desc: '6 ways to wear khaki.' },
  // New
  { title: 'How to Style Beige Cargo Pants', handle: 'how-to-style-beige-cargo-pants', desc: 'Sandy tan outfit ideas.' },
  { title: 'How to Style Brown Cargo Pants', handle: 'how-to-style-brown-cargo-pants', desc: 'Earth-tone outfits.' },
  { title: 'How to Style Grey Cargo Pants', handle: 'how-to-style-grey-cargo-pants', desc: 'Neutral versatility.' },
  { title: 'Best Cargo Pants Colors 2026', handle: 'best-cargo-pants-colors-2026', desc: 'Trending colors this year.' },
];

// ============================================================
// Icons per hub type
// ============================================================
const ICONS = {
  style: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14,2 14,8 20,8"/></svg>',
  comparison: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
  glossary: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
  occasion: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  buying: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
  brand: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18"/><path d="M8 7l-5 5 5 5"/><path d="M16 7l5 5-5 5"/></svg>',
  color: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="5.5"/><circle cx="17.5" cy="14.5" r="5.5"/><circle cx="8.5" cy="14.5" r="5.5"/></svg>',
};

function buildHubHTML(title, description, pages, iconType) {
  const iconSvg = ICONS[iconType] || ICONS.style;

  let cards = '';
  pages.forEach(page => {
    cards += `
    <a href="/pages/${page.handle}" style="display:block;border:1px solid #e5e5e5;border-radius:10px;padding:20px 24px;text-decoration:none;color:inherit;transition:all 0.2s ease;background:#fff;">
      <div style="display:flex;align-items:flex-start;gap:14px;">
        <span style="flex-shrink:0;margin-top:2px;opacity:0.5;">${iconSvg}</span>
        <div>
          <strong style="display:block;font-size:15px;margin-bottom:4px;">${page.title}</strong>
          <span style="font-size:13px;opacity:0.65;line-height:1.5;">${page.desc}</span>
        </div>
      </div>
    </a>`;
  });

  return `<div style="max-width:800px;">
  <p style="font-size:17px;line-height:1.7;margin-bottom:32px;">${description}</p>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px;">
    ${cards}
  </div>
  <div style="margin-top:40px;padding:24px 28px;background:#f7f7f7;border-radius:10px;text-align:center;">
    <p style="margin:0 0 12px;font-weight:600;">Looking for the perfect pair?</p>
    <a href="/collections/all" style="display:inline-block;background:#1a1a1a;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">Shop All Products</a>
  </div>
</div>`;
}

async function main() {
  const hubs = [
    {
      handle: 'style-guides',
      description: 'Outfit ideas, colour guides, styling tips, and how-to guides for cargo pants, chinos, and trousers. From college to date night, sneakers to oversized tees — we have you covered.',
      pages: styleGuidePages,
      type: 'style',
    },
    {
      handle: 'style-comparisons',
      description: 'Side-by-side comparisons to help you pick the right style, fit, fabric, and wash. From cargo vs parachute pants to baggy vs slim — make confident wardrobe decisions.',
      pages: comparisonPages,
      type: 'comparison',
    },
    {
      handle: 'fabric-glossary',
      description: 'Learn about the fabrics, weaves, finishes, and care techniques used in premium trousers. From cotton twill and ripstop to GSM weight and enzyme washing — understand what makes quality pants.',
      pages: glossaryPages,
      type: 'glossary',
    },
    {
      handle: 'occasions',
      description: 'Cargo pants outfit guides for every occasion. College, work, travel, hiking, monsoon, streetwear, concerts, and festivals — find the right look for your day.',
      pages: occasionPages,
      type: 'occasion',
    },
    {
      handle: 'buying-guides',
      description: 'Find your perfect cargo pants. Budget picks, sizing help, fabric comparisons, and first-time buyer tips to make your next purchase the right one.',
      pages: buyingGuidePages,
      type: 'buying',
    },
    {
      handle: 'brand-comparisons',
      description: 'How does William Ashford compare to other cargo pants brands in India? Honest, side-by-side comparisons covering fabric, fit, price, and quality.',
      pages: brandComparisonPages,
      type: 'brand',
    },
    {
      handle: 'cargo-color-guides',
      description: 'Earth tones dominate 2026. Find outfit ideas for every cargo colour — from classic black and olive to trending beige, brown, and grey.',
      pages: colorGuidePages,
      type: 'color',
    },
  ];

  for (const hub of hubs) {
    process.stdout.write(`Updating ${hub.handle}... `);

    const findResult = await graphql(FIND_PAGE, { query: `handle:${hub.handle}` });
    const page = findResult.data?.pages?.nodes?.[0];

    if (!page) {
      console.log('NOT FOUND — skipping (create page in Shopify admin first)');
      continue;
    }

    const html = buildHubHTML(hub.handle, hub.description, hub.pages, hub.type);

    const updateResult = await graphql(UPDATE_PAGE, {
      id: page.id,
      page: {
        body: html,
      },
    });

    const data = updateResult.data?.pageUpdate;
    if (data?.userErrors?.length > 0) {
      console.log(`ERROR: ${data.userErrors.map(e => e.message).join(', ')}`);
    } else if (data?.page) {
      console.log(`✓ (${hub.pages.length} links)`);
    } else {
      console.log('unexpected response');
    }

    await sleep(500);
  }

  console.log('\nDone! All hub pages updated.');
  console.log('Note: brand-comparisons and cargo-color-guides must be created as pages in Shopify admin first.');
}

main().catch(console.error);
