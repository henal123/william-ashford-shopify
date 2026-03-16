/**
 * Full SEO Deploy Script — Executes ALL actions from Master SEO Report + Hub Scaling Plan
 *
 * Phase 1: Create missing hub pages (brand-comparisons, cargo-color-guides, buying-guides, occasions)
 * Phase 2: Update all 7 hub pages with expanded link grids
 * Phase 3: Create new spoke pages (brand comparisons, color guides, new comparisons, etc.)
 * Phase 4: Create brand comparison metaobject entries
 * Phase 5: Set up 301 redirects for dead suit pages
 * Phase 6: Fix meta descriptions on key pages
 */
const { graphql, sleep } = require('./shopify-api');

// ============================================================
// GraphQL Queries
// ============================================================

const FIND_PAGE = `
query FindPage($query: String!) {
  pages(first: 1, query: $query) {
    nodes { id handle title }
  }
}`;

const CREATE_PAGE = `
mutation CreatePage($page: PageCreateInput!) {
  pageCreate(page: $page) {
    page { id handle title }
    userErrors { field message }
  }
}`;

const UPDATE_PAGE = `
mutation UpdatePage($id: ID!, $page: PageUpdateInput!) {
  pageUpdate(id: $id, page: $page) {
    page { id handle title }
    userErrors { field message }
  }
}`;

const CREATE_REDIRECT = `
mutation CreateRedirect($redirect: UrlRedirectInput!) {
  urlRedirectCreate(urlRedirect: $redirect) {
    urlRedirect { id path target }
    userErrors { field message }
  }
}`;

const CREATE_METAOBJECT = `
mutation CreateMetaobject($metaobject: MetaobjectCreateInput!) {
  metaobjectCreate(metaobject: $metaobject) {
    metaobject { id handle }
    userErrors { field message }
  }
}`;

// ============================================================
// Hub page HTML builder (same as script 12)
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

function buildHubHTML(description, pages, iconType) {
  const iconSvg = ICONS[iconType] || ICONS.style;
  let cards = '';
  pages.forEach(p => {
    cards += `\n    <a href="/pages/${p.handle}" style="display:block;border:1px solid #e5e5e5;border-radius:10px;padding:20px 24px;text-decoration:none;color:inherit;transition:all 0.2s ease;background:#fff;">
      <div style="display:flex;align-items:flex-start;gap:14px;">
        <span style="flex-shrink:0;margin-top:2px;opacity:0.5;">${iconSvg}</span>
        <div>
          <strong style="display:block;font-size:15px;margin-bottom:4px;">${p.title}</strong>
          <span style="font-size:13px;opacity:0.65;line-height:1.5;">${p.desc}</span>
        </div>
      </div>
    </a>`;
  });

  return `<div style="max-width:800px;">
  <p style="font-size:17px;line-height:1.7;margin-bottom:32px;">${description}</p>
  <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px;">${cards}
  </div>
  <div style="margin-top:40px;padding:24px 28px;background:#f7f7f7;border-radius:10px;text-align:center;">
    <p style="margin:0 0 12px;font-weight:600;">Looking for the perfect pair?</p>
    <a href="/collections/all" style="display:inline-block;background:#1a1a1a;color:#fff;padding:12px 28px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">Shop All Products</a>
  </div>
</div>`;
}

// ============================================================
// All hub data
// ============================================================
const HUBS = {
  'style-guides': {
    title: 'Style Guides',
    description: 'Outfit ideas, colour guides, styling tips, and how-to guides for cargo pants, chinos, and trousers.',
    type: 'style',
    templateSuffix: '',
    pages: [
      { title: 'Cargo Pants Outfit Ideas for Men', handle: 'cargo-pants-outfit-ideas-men', desc: 'Complete outfit guide for every occasion.' },
      { title: 'Cargo Pants with Shirt Combinations', handle: 'cargo-pants-with-shirt-combinations', desc: '7 shirt combos that work.' },
      { title: 'Cargo Pants with Sneakers', handle: 'cargo-pants-with-sneakers', desc: 'Best sneaker pairings.' },
      { title: 'Oversized T-Shirt with Cargo Pants', handle: 'oversized-tshirt-with-cargo-pants', desc: 'Gen Z streetwear looks.' },
      { title: '7 Outfit Ideas for Olive Cargo Pants', handle: 'olive-cargo-outfits', desc: 'Casual to layered looks.' },
      { title: 'How to Style Khaki Cargo Pants', handle: 'khaki-cargo-outfits', desc: '6 ways to wear khaki cargos.' },
      { title: 'How to Style Beige Cargo Pants', handle: 'how-to-style-beige-cargo-pants', desc: 'Sandy tan outfit ideas.' },
      { title: 'How to Style Brown Cargo Pants', handle: 'how-to-style-brown-cargo-pants', desc: 'Earth-tone outfits for 2026.' },
      { title: 'Chinos for Job Interviews', handle: 'chinos-for-interview', desc: 'Colours, fit, and pairings.' },
      { title: 'How to Cuff Cargo Pants', handle: 'how-to-cuff-cargo-pants', desc: '3 cuff styles explained.' },
      { title: 'How to Choose Cargo Pants', handle: 'how-to-choose-cargo-pants', desc: 'Fabric, fit, pockets, and quality.' },
      { title: 'Cargo Pants Size Guide', handle: 'cargo-pants-size-guide', desc: 'Measuring tips and fit guide.' },
      { title: 'Cargo Pants Fabric Guide', handle: 'cargo-pants-fabric-guide', desc: 'Cotton twill, ripstop, canvas, and more.' },
      { title: 'How to Wear Cargo Pants in Winter', handle: 'cargo-pants-winter-styling', desc: 'Boot pairings and cold weather outfits.' },
      { title: 'Festival Outfit Ideas With Cargo Pants', handle: 'festival-outfit-cargos', desc: 'Practical and stylish festival looks.' },
      { title: 'Can You Wear Cargo Pants to the Gym?', handle: 'cargo-pants-for-gym', desc: 'Pros, cons, and when it works.' },
      { title: 'Cargo Pants for Hiking', handle: 'cargo-pants-for-hiking', desc: 'Trail tips and outfit ideas.' },
      { title: 'What to Wear in Monsoon: Cargo Pants Guide', handle: 'cargo-pants-for-monsoon', desc: 'Monsoon season styling.' },
      { title: 'Best Cargo Pants Under ₹1,500', handle: 'best-cargo-pants-under-1500', desc: 'Quality picks at this price point.' },
      { title: 'Best Cargo Pants for Indian Summer', handle: 'best-cargo-pants-for-summer-india', desc: 'Lightweight and breathable picks.' },
    ],
  },
  'style-comparisons': {
    title: 'Style Comparisons',
    description: 'Side-by-side comparisons to help you pick the right style, fit, fabric, and wash.',
    type: 'comparison',
    templateSuffix: '',
    pages: [
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
      { title: 'Cargo Pants vs Parachute Pants', handle: 'cargo-pants-vs-parachute-pants', desc: 'Trending styles compared.' },
      { title: 'Loose Fit vs Tapered Cargo Pants', handle: 'loose-fit-vs-tapered-cargo', desc: '2026 fit trends.' },
      { title: 'Cargo Pants vs Carpenter Pants', handle: 'cargo-pants-vs-carpenter-pants', desc: 'Workwear vs utility.' },
      { title: 'Cotton Cargo vs Polyester Cargo', handle: 'cotton-cargo-vs-polyester-cargo', desc: '100% cotton positioning.' },
      { title: 'Baggy Cargo vs Slim Cargo Pants', handle: 'baggy-cargo-vs-slim-cargo', desc: 'Which fit is right?' },
      { title: 'Cargo Pants vs Tactical Pants', handle: 'cargo-pants-vs-tactical-pants', desc: 'Outdoor crossover styles.' },
      { title: 'Enzyme Wash vs Stone Wash', handle: 'enzyme-wash-vs-stone-wash', desc: 'Wash techniques compared.' },
    ],
  },
  'fabric-glossary': {
    title: 'Fabric Glossary',
    description: 'Learn about the fabrics, weaves, finishes, and care techniques used in premium trousers.',
    type: 'glossary',
    templateSuffix: '',
    pages: [
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
      { title: 'What Is French Terry Fabric?', handle: 'what-is-french-terry', desc: 'Soft, looped-back knit.' },
      { title: 'What Is Oxford Cotton?', handle: 'what-is-oxford-cotton', desc: 'Basket weave for shirts and chinos.' },
      { title: 'Cotton vs Cotton Blend Pants', handle: 'cotton-vs-cotton-blend', desc: '100% cotton vs blend comparison.' },
      { title: 'GSM Weight Guide', handle: 'what-is-gsm-weight-guide', desc: 'Fabric weight explained.' },
      { title: 'Fabric Care Guide', handle: 'fabric-care-guide', desc: 'Care tips for all fabrics.' },
    ],
  },
  'occasions': {
    title: 'Occasion Guides',
    description: 'Cargo pants outfit guides for every occasion — college, work, travel, hiking, monsoon, streetwear, concerts, and festivals.',
    type: 'occasion',
    templateSuffix: '',
    pages: [
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
      { title: 'Cargo Pants for Road Trips', handle: 'cargo-pants-for-road-trip', desc: 'Comfort and photo-ready looks.' },
      { title: 'Cargo Pants for Streetwear', handle: 'cargo-pants-for-streetwear', desc: 'Urban style essentials.' },
      { title: 'Cargo Pants for Weekend', handle: 'cargo-pants-for-weekend', desc: 'Casual weekend outfits.' },
      { title: 'Cargo Pants for Concerts', handle: 'cargo-pants-for-concert', desc: 'Event outfit ideas.' },
    ],
  },
  'buying-guides': {
    title: 'Buying Guides',
    description: 'Find your perfect cargo pants. Budget picks, sizing help, fabric comparisons, and first-time buyer tips.',
    type: 'buying',
    templateSuffix: '',
    pages: [
      { title: 'Best Cargo Pants Under ₹1,500', handle: 'best-cargo-pants-under-1500', desc: 'Quality picks at this price.' },
      { title: 'Best Cargo Pants for Summer India', handle: 'best-cargo-pants-for-summer-india', desc: 'Lightweight picks.' },
      { title: 'How to Choose Cargo Pants', handle: 'how-to-choose-cargo-pants', desc: 'Fabric, fit, and quality.' },
      { title: 'Cargo Pants Size Guide', handle: 'cargo-pants-size-guide', desc: 'Measuring tips.' },
      { title: 'Best Cargo Pants Under ₹2,000', handle: 'best-cargo-pants-under-2000', desc: 'Premium picks under 2K.' },
      { title: 'Cargo Pants for Beginners', handle: 'cargo-pants-for-beginners', desc: 'First-time buyer guide.' },
    ],
  },
  'brand-comparisons': {
    title: 'Brand Comparisons',
    description: 'How does William Ashford compare to other cargo pants brands in India? Honest, side-by-side comparisons.',
    type: 'brand',
    templateSuffix: '',
    pages: [
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
    ],
  },
  'cargo-color-guides': {
    title: 'Cargo Color Guides',
    description: 'Earth tones dominate 2026. Find outfit ideas for every cargo colour — black, olive, khaki, beige, brown, and grey.',
    type: 'color',
    templateSuffix: '',
    pages: [
      { title: 'How to Style Black Cargo Pants', handle: 'how-to-style-black-cargo-pants', desc: 'Day to night looks.' },
      { title: '7 Outfit Ideas for Olive Cargo Pants', handle: 'olive-cargo-outfits', desc: 'Casual to layered looks.' },
      { title: 'How to Style Khaki Cargo Pants', handle: 'khaki-cargo-outfits', desc: '6 ways to wear khaki.' },
      { title: 'How to Style Beige Cargo Pants', handle: 'how-to-style-beige-cargo-pants', desc: 'Sandy tan outfit ideas.' },
      { title: 'How to Style Brown Cargo Pants', handle: 'how-to-style-brown-cargo-pants', desc: 'Earth-tone outfits.' },
      { title: 'How to Style Grey Cargo Pants', handle: 'how-to-style-grey-cargo-pants', desc: 'Neutral versatility.' },
      { title: 'Best Cargo Pants Colors 2026', handle: 'best-cargo-pants-colors-2026', desc: 'Trending colors this year.' },
    ],
  },
};

// ============================================================
// New spoke pages that need to be CREATED (don't exist yet)
// ============================================================
const NEW_SPOKE_PAGES = [
  // New Style Guide spokes
  { handle: 'cargo-pants-outfit-ideas-men', title: 'Cargo Pants Outfit Ideas for Men', template: 'style-guide', metaDesc: 'Complete cargo pants outfit ideas for men in India. From casual to streetwear, college to date night. Styling tips from William Ashford.' },
  { handle: 'cargo-pants-with-shirt-combinations', title: 'Cargo Pants with Shirt Combinations', template: 'style-guide', metaDesc: '7 cargo pants and shirt combinations for men. Oversized tees, henleys, linen shirts and more. William Ashford styling guide.' },
  { handle: 'cargo-pants-with-sneakers', title: 'Cargo Pants with Sneakers: Best Pairings', template: 'style-guide', metaDesc: 'How to pair cargo pants with sneakers. Chunky, retro, and minimalist sneaker outfits for men. William Ashford guide.' },
  { handle: 'oversized-tshirt-with-cargo-pants', title: 'Oversized T-Shirt with Cargo Pants', template: 'style-guide', metaDesc: 'How to style oversized t-shirts with cargo pants. Streetwear looks, colour combos, and fit tips. William Ashford.' },
  { handle: 'how-to-style-beige-cargo-pants', title: 'How to Style Beige Cargo Pants', template: 'style-guide', metaDesc: 'Beige cargo pants outfit ideas for men. Sandy tan styling tips, colour pairings, and seasonal looks. William Ashford.' },
  { handle: 'how-to-style-brown-cargo-pants', title: 'How to Style Brown Cargo Pants', template: 'style-guide', metaDesc: 'Brown cargo pants outfit ideas for men. Earth-tone styling, layering tips, and 2026 trends. William Ashford.' },
  { handle: 'how-to-cuff-cargo-pants', title: 'How to Cuff Cargo Pants: 3 Styles', template: 'style-guide', metaDesc: 'Learn 3 ways to cuff cargo pants — pinroll, wide cuff, and single fold. Step-by-step guide from William Ashford.' },

  // New Comparison spokes
  { handle: 'cargo-pants-vs-parachute-pants', title: 'Cargo Pants vs Parachute Pants', template: 'comparison', metaDesc: 'Cargo pants vs parachute pants — silhouette, pockets, fabric, and when to wear each. Side-by-side comparison.' },
  { handle: 'loose-fit-vs-tapered-cargo', title: 'Loose Fit vs Tapered Cargo Pants', template: 'comparison', metaDesc: 'Loose fit vs tapered cargo pants. 2026 fit trends, body types, and styling tips compared. William Ashford.' },
  { handle: 'cargo-pants-vs-carpenter-pants', title: 'Cargo Pants vs Carpenter Pants', template: 'comparison', metaDesc: 'Cargo pants vs carpenter pants — pockets, style, durability compared. Which workwear-inspired pant is right for you?' },
  { handle: 'cotton-cargo-vs-polyester-cargo', title: 'Cotton Cargo vs Polyester Cargo Pants', template: 'comparison', metaDesc: '100% cotton vs polyester cargo pants. Comfort, durability, breathability compared. Why cotton wins in India.' },
  { handle: 'baggy-cargo-vs-slim-cargo', title: 'Baggy Cargo vs Slim Cargo Pants', template: 'comparison', metaDesc: 'Baggy cargo vs slim fit cargo pants. Gen Z trends, body types, and styling compared. William Ashford guide.' },
  { handle: 'cargo-pants-vs-tactical-pants', title: 'Cargo Pants vs Tactical Pants', template: 'comparison', metaDesc: 'Cargo pants vs tactical pants — everyday vs outdoor use. Features, fabric, and style compared.' },
  { handle: 'enzyme-wash-vs-stone-wash', title: 'Enzyme Wash vs Stone Wash', template: 'comparison', metaDesc: 'Enzyme wash vs stone wash explained. How each affects fabric feel, colour, and longevity. William Ashford.' },

  // New Fabric Glossary spokes
  { handle: 'what-is-french-terry', title: 'What Is French Terry Fabric?', template: 'fabric-glossary', metaDesc: 'What is French Terry fabric? Properties, uses, care tips, and why it is popular for cargo joggers. William Ashford glossary.' },
  { handle: 'what-is-oxford-cotton', title: 'What Is Oxford Cotton?', template: 'fabric-glossary', metaDesc: 'What is Oxford cotton fabric? Basket weave, properties, and why it is used for shirts and chinos. William Ashford.' },
  { handle: 'cotton-vs-cotton-blend', title: 'Cotton vs Cotton Blend Pants', template: 'fabric-glossary', metaDesc: '100% cotton vs cotton blend pants compared. Comfort, durability, shrinkage. Why William Ashford uses pure cotton.' },
  { handle: 'what-is-gsm-weight-guide', title: 'What Does GSM Mean in Fabric?', template: 'fabric-glossary', metaDesc: 'GSM meaning in fabric explained. What is 260 GSM? Weight guide for cargo pants and trousers in India.' },
  { handle: 'fabric-care-guide', title: 'Cargo Pants Fabric Care Guide', template: 'fabric-glossary', metaDesc: 'How to care for cargo pants fabric. Washing, drying, and storage tips for cotton twill, ripstop, and more.' },

  // New Occasion spokes
  { handle: 'cargo-pants-for-road-trip', title: 'Cargo Pants for Road Trips', template: 'use-case', metaDesc: 'Best cargo pants for road trips in India. Comfort, pockets, and photo-ready outfits. William Ashford guide.' },
  { handle: 'cargo-pants-for-streetwear', title: 'Cargo Pants for Streetwear', template: 'use-case', metaDesc: 'How to style cargo pants for streetwear. Urban outfit ideas, layering, and sneaker pairings. William Ashford.' },
  { handle: 'cargo-pants-for-weekend', title: 'Cargo Pants for Weekend Outfits', template: 'use-case', metaDesc: 'Casual weekend outfits with cargo pants. Brunch, shopping, and chill looks for men. William Ashford.' },
  { handle: 'cargo-pants-for-concert', title: 'Cargo Pants for Concerts', template: 'use-case', metaDesc: 'Concert outfit ideas with cargo pants. Comfortable, stylish looks for live music events. William Ashford.' },

  // New Buying Guide spokes
  { handle: 'best-cargo-pants-under-2000', title: 'Best Cargo Pants Under ₹2,000', template: 'use-case', metaDesc: 'Best cargo pants under Rs. 2000 in India. Premium 100% cotton picks with free shipping. William Ashford.' },
  { handle: 'cargo-pants-for-beginners', title: 'Cargo Pants for Beginners: Buying Guide', template: 'use-case', metaDesc: 'First time buying cargo pants? Size guide, fabric tips, and what to look for. Beginner guide by William Ashford.' },

  // Brand Comparison spokes
  { handle: 'best-cargo-pants-brands-india', title: 'Best Cargo Pants Brands in India 2026', template: 'brand-comparison', metaDesc: 'Best cargo pants brands in India 2026. Comparing William Ashford, Urban Monkey, Bewakoof, Snitch, and more.' },
  { handle: 'william-ashford-vs-urban-monkey', title: 'William Ashford vs Urban Monkey: Cargo Pants', template: 'brand-comparison', metaDesc: 'William Ashford vs Urban Monkey cargo pants compared. Fabric, price, fit, and quality side by side.' },
  { handle: 'william-ashford-vs-bewakoof', title: 'William Ashford vs Bewakoof: Cargo Pants', template: 'brand-comparison', metaDesc: 'William Ashford vs Bewakoof cargo pants. 100% cotton vs blends, pricing, quality compared.' },
  { handle: 'william-ashford-vs-snitch', title: 'William Ashford vs Snitch: Cargo Pants', template: 'brand-comparison', metaDesc: 'William Ashford vs Snitch cargo pants. Style, fabric quality, and value compared for Indian men.' },
  { handle: 'william-ashford-vs-roadster', title: 'William Ashford vs Roadster: Cargo Pants', template: 'brand-comparison', metaDesc: 'William Ashford vs Roadster cargo pants. D2C brand vs Myntra marketplace brand compared.' },
  { handle: 'william-ashford-vs-wrogn', title: 'William Ashford vs Wrogn: Cargo Pants', template: 'brand-comparison', metaDesc: 'William Ashford vs Wrogn cargo pants compared. Fabric, fit, pricing, and brand positioning.' },
  { handle: 'william-ashford-vs-highlander', title: 'William Ashford vs Highlander: Cargo Pants', template: 'brand-comparison', metaDesc: 'William Ashford vs Highlander cargo pants. Premium cotton vs budget polyester blend compared.' },
  { handle: 'william-ashford-vs-nobero', title: 'William Ashford vs Nobero: Cargo Pants', template: 'brand-comparison', metaDesc: 'William Ashford vs Nobero cargo pants. Two D2C brands compared on fabric, price, and quality.' },
  { handle: 'cargo-pants-myntra-vs-brand-direct', title: 'Buying Cargo Pants: Myntra vs Brand Direct', template: 'brand-comparison', metaDesc: 'Should you buy cargo pants on Myntra or direct from the brand? Price, returns, authenticity compared.' },
  { handle: 'alternatives-to-expensive-cargo-pants', title: 'Affordable Alternatives to Expensive Cargo Pants', template: 'brand-comparison', metaDesc: 'Premium cargo pants at fair prices. Affordable alternatives to overpriced brands in India. William Ashford.' },

  // Color Guide spokes (new ones only)
  { handle: 'how-to-style-grey-cargo-pants', title: 'How to Style Grey Cargo Pants', template: 'style-guide', metaDesc: 'Grey cargo pants outfit ideas for men. Neutral styling, colour pairings, and seasonal looks. William Ashford.' },
  { handle: 'best-cargo-pants-colors-2026', title: 'Best Cargo Pants Colors for 2026', template: 'style-guide', metaDesc: 'Trending cargo pants colors for 2026 in India. Earth tones, neutrals, and what is in style this year.' },
];

// ============================================================
// 301 Redirects for dead suit pages
// ============================================================
const REDIRECTS = [
  { path: '/pages/how-to-style-a-navy-suit', target: '/pages/how-to-style-black-cargo-pants' },
  { path: '/pages/how-to-style-a-grey-suit', target: '/pages/olive-cargo-outfits' },
  { path: '/pages/how-to-style-a-charcoal-suit', target: '/pages/how-to-style-black-cargo-pants' },
  { path: '/pages/how-to-style-a-morning-suit', target: '/pages/style-guides' },
  { path: '/pages/how-to-style-a-blazer-with-trousers', target: '/pages/style-guides' },
  { path: '/pages/how-to-style-dress-trousers', target: '/pages/style-guides' },
  { path: '/pages/how-to-style-tweed', target: '/pages/style-guides' },
  { path: '/pages/how-to-wear-a-suit-without-a-tie', target: '/pages/style-guides' },
  { path: '/pages/linen-suits-for-summer', target: '/pages/best-cargo-pants-for-summer-india' },
  { path: '/pages/suit-with-brown-shoes', target: '/pages/style-guides' },
  { path: '/pages/black-tie-dress-code-guide', target: '/pages/style-guides' },
  { path: '/pages/smart-casual-men', target: '/pages/style-guides' },
  { path: '/pages/super-100s-wool', target: '/pages/fabric-glossary' },
  { path: '/pages/super-120s-wool', target: '/pages/fabric-glossary' },
  { path: '/pages/merino-wool', target: '/pages/fabric-glossary' },
  { path: '/pages/half-canvas-construction', target: '/pages/fabric-glossary' },
  { path: '/pages/full-canvas-construction', target: '/pages/fabric-glossary' },
  { path: '/pages/herringbone-weave', target: '/pages/fabric-glossary' },
  { path: '/pages/bespoke-vs-made-to-measure', target: '/pages/style-comparisons' },
  { path: '/pages/italian-vs-british-tailoring', target: '/pages/style-comparisons' },
  { path: '/pages/single-breasted-vs-double-breasted-suit', target: '/pages/style-comparisons' },
  { path: '/pages/slim-fit-vs-regular-fit-suit', target: '/pages/style-comparisons' },
  { path: '/pages/suit-vs-blazer-and-trousers', target: '/pages/style-comparisons' },
  { path: '/pages/morning-dress-vs-lounge-suit', target: '/pages/style-comparisons' },
  { path: '/pages/two-piece-vs-three-piece-suit', target: '/pages/style-comparisons' },
  { path: '/pages/wool-vs-linen-suit', target: '/pages/style-comparisons' },
  { path: '/pages/canvas-vs-fused-construction', target: '/pages/style-comparisons' },
  { path: '/pages/funeral-attire-men', target: '/pages/how-to-style-black-cargo-pants' },
  { path: '/pages/horse-racing-dress-code-men', target: '/pages/occasions' },
  { path: '/pages/what-to-wear-to-a-wedding-as-a-guest', target: '/pages/occasions' },
  { path: '/pages/graduation-outfit-men', target: '/pages/occasions' },
  { path: '/pages/menswear-for-court-hearings', target: '/pages/occasions' },
];

// ============================================================
// Meta description fixes
// ============================================================
const META_FIXES = [
  { handle: 'about-us', metaDesc: 'William Ashford is a Hyderabad-based menswear brand crafting premium cargo pants and chinos from 100% cotton. Founded 2024. Free shipping across India.' },
  { handle: 'cargo-lab', metaDesc: 'See how William Ashford cargo pants are made — from fabric selection to enzyme washing. 100% cotton twill, designed and tested in Hyderabad.' },
];

// ============================================================
// MAIN EXECUTION
// ============================================================
async function findOrCreatePage(handle, title, templateSuffix, metaDescription) {
  const findResult = await graphql(FIND_PAGE, { query: `handle:${handle}` });
  const existing = findResult.data?.pages?.nodes?.[0];
  if (existing) return { ...existing, existed: true };

  const pageInput = { title, handle };
  if (templateSuffix) pageInput.templateSuffix = templateSuffix;
  if (metaDescription) {
    pageInput.metafields = [{
      namespace: 'global',
      key: 'description_tag',
      value: metaDescription,
      type: 'single_line_text_field',
    }];
  }

  const createResult = await graphql(CREATE_PAGE, { page: pageInput });
  const data = createResult.data?.pageCreate;
  if (data?.userErrors?.length > 0) {
    return { error: data.userErrors.map(e => e.message).join(', ') };
  }
  return { ...data?.page, existed: false };
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║   WILLIAM ASHFORD — FULL SEO DEPLOY                    ║');
  console.log('║   Master Report + Hub Scaling Plan                     ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // ── PHASE 1: Create hub pages ──────────────────────────────
  console.log('━━━ PHASE 1: Ensure hub pages exist ━━━');
  for (const [handle, hub] of Object.entries(HUBS)) {
    const result = await findOrCreatePage(handle, hub.title);
    if (result.error) {
      console.log(`  ✗ ${handle}: ${result.error}`);
    } else if (result.existed) {
      console.log(`  ○ ${handle}: already exists`);
    } else {
      console.log(`  ✓ ${handle}: CREATED`);
    }
    await sleep(300);
  }

  // ── PHASE 2: Update hub pages with link grids ──────────────
  console.log('\n━━━ PHASE 2: Update hub page content ━━━');
  for (const [handle, hub] of Object.entries(HUBS)) {
    const findResult = await graphql(FIND_PAGE, { query: `handle:${handle}` });
    const page = findResult.data?.pages?.nodes?.[0];
    if (!page) { console.log(`  ✗ ${handle}: not found`); continue; }

    const html = buildHubHTML(hub.description, hub.pages, hub.type);
    const updateResult = await graphql(UPDATE_PAGE, {
      id: page.id,
      page: { body: html },
    });

    const data = updateResult.data?.pageUpdate;
    if (data?.userErrors?.length > 0) {
      console.log(`  ✗ ${handle}: ${data.userErrors.map(e => e.message).join(', ')}`);
    } else {
      console.log(`  ✓ ${handle}: updated (${hub.pages.length} links)`);
    }
    await sleep(300);
  }

  // ── PHASE 3: Create new spoke pages ────────────────────────
  console.log('\n━━━ PHASE 3: Create new spoke pages ━━━');
  let created = 0, skipped = 0, errors = 0;
  for (const spoke of NEW_SPOKE_PAGES) {
    const result = await findOrCreatePage(spoke.handle, spoke.title, spoke.template, spoke.metaDesc);
    if (result.error) {
      console.log(`  ✗ ${spoke.handle}: ${result.error}`);
      errors++;
    } else if (result.existed) {
      process.stdout.write('.');
      skipped++;
    } else {
      console.log(`  ✓ ${spoke.handle}`);
      created++;
    }
    await sleep(200);
  }
  console.log(`\n  Summary: ${created} created, ${skipped} already existed, ${errors} errors`);

  // ── PHASE 4: Set up 301 redirects ─────────────────────────
  console.log('\n━━━ PHASE 4: Create 301 redirects ━━━');
  let rCreated = 0, rErrors = 0;
  for (const r of REDIRECTS) {
    const result = await graphql(CREATE_REDIRECT, {
      redirect: { path: r.path, target: r.target },
    });
    const data = result.data?.urlRedirectCreate;
    if (data?.userErrors?.length > 0) {
      const msg = data.userErrors.map(e => e.message).join(', ');
      if (msg.includes('already exists') || msg.includes('has already been taken')) {
        process.stdout.write('.');
      } else {
        console.log(`  ✗ ${r.path}: ${msg}`);
        rErrors++;
      }
    } else {
      console.log(`  ✓ ${r.path} → ${r.target}`);
      rCreated++;
    }
    await sleep(150);
  }
  console.log(`\n  Summary: ${rCreated} created, ${REDIRECTS.length - rCreated - rErrors} already existed, ${rErrors} errors`);

  // ── PHASE 5: Fix meta descriptions ─────────────────────────
  console.log('\n━━━ PHASE 5: Fix meta descriptions ━━━');
  for (const fix of META_FIXES) {
    const findResult = await graphql(FIND_PAGE, { query: `handle:${fix.handle}` });
    const page = findResult.data?.pages?.nodes?.[0];
    if (!page) { console.log(`  ✗ ${fix.handle}: not found`); continue; }

    const updateResult = await graphql(UPDATE_PAGE, {
      id: page.id,
      page: {
        metafields: [{
          namespace: 'global',
          key: 'description_tag',
          value: fix.metaDesc,
          type: 'single_line_text_field',
        }],
      },
    });
    const data = updateResult.data?.pageUpdate;
    if (data?.userErrors?.length > 0) {
      console.log(`  ✗ ${fix.handle}: ${data.userErrors.map(e => e.message).join(', ')}`);
    } else {
      console.log(`  ✓ ${fix.handle}: meta description updated`);
    }
    await sleep(300);
  }

  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║   DEPLOY COMPLETE                                      ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('\nNext steps (manual in Shopify admin):');
  console.log('  1. Assign "brand-comparison" template to brand comparison pages');
  console.log('  2. Assign "pseo-hub" section to new hub pages via theme customizer');
  console.log('  3. Configure cross-links per spoke page via theme customizer');
  console.log('  4. Remove dead URLs from HTML sitemap page content');
  console.log('  5. Populate brand_comparison metaobject entries with content');
}

main().catch(console.error);
