/**
 * Update hub pages with styled link grids to all child PSEO pages
 */
const { graphql, sleep } = require('./shopify-api');

// First, find the hub pages by handle
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

// === Define all child pages for each hub ===

const styleGuidePages = [
  { title: 'Can You Wear Cargo Pants to the Gym?', handle: 'cargo-pants-for-gym', desc: 'Pros, cons, and when it works.' },
  { title: 'Cargo Pants for Hiking', handle: 'cargo-pants-for-hiking', desc: 'Trail tips and outfit ideas.' },
  { title: 'What to Wear in Monsoon: Cargo Pants Guide', handle: 'cargo-pants-for-monsoon', desc: 'Monsoon season styling.' },
  { title: 'Chinos for Job Interviews', handle: 'chinos-for-interview', desc: 'Colours, fit, and pairings.' },
  { title: '7 Outfit Ideas for Olive Cargo Pants', handle: 'olive-cargo-outfits', desc: 'Casual to layered looks.' },
  { title: 'How to Style Khaki Cargo Pants', handle: 'khaki-cargo-outfits', desc: '6 ways to wear khaki cargos.' },
  { title: 'How to Wear Cargo Pants in Winter', handle: 'cargo-pants-winter-styling', desc: 'Boot pairings and cold weather outfits.' },
  { title: 'Festival Outfit Ideas With Cargo Pants', handle: 'festival-outfit-cargos', desc: 'Practical and stylish festival looks.' },
  { title: 'Best Cargo Pants Under ₹1,500', handle: 'best-cargo-pants-under-1500', desc: 'Quality picks at this price point.' },
  { title: 'Best Cargo Pants for Indian Summer', handle: 'best-cargo-pants-for-summer-india', desc: 'Lightweight and breathable picks.' },
  { title: 'How to Choose Cargo Pants: Buyer\'s Guide', handle: 'how-to-choose-cargo-pants', desc: 'Fabric, fit, pockets, and quality.' },
  { title: 'Cargo Pants Size Guide', handle: 'cargo-pants-size-guide', desc: 'Measuring tips and fit guide.' },
  { title: 'Cargo Pants Fabric Guide', handle: 'cargo-pants-fabric-guide', desc: 'Cotton twill, ripstop, canvas, and more.' },
];

const comparisonPages = [
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
];

const glossaryPages = [
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
];

function buildHubHTML(title, description, pages, hubType) {
  const iconSvg = hubType === 'glossary'
    ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>'
    : hubType === 'comparison'
    ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>'
    : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14,2 14,8 20,8"/></svg>';

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
      description: 'Outfit ideas, occasion guides, and styling tips for cargo pants, chinos, and trousers. From college to date night, we have got you covered.',
      pages: styleGuidePages,
      type: 'style',
    },
    {
      handle: 'style-comparisons',
      description: 'Side-by-side comparisons to help you pick the right style, fit, and fabric. Make confident wardrobe decisions with our detailed guides.',
      pages: comparisonPages,
      type: 'comparison',
    },
    {
      handle: 'fabric-glossary',
      description: 'Learn about the fabrics, weaves, and finishes used in premium trousers. From cotton twill to gabardine — understand what makes quality pants.',
      pages: glossaryPages,
      type: 'glossary',
    },
  ];

  for (const hub of hubs) {
    process.stdout.write(`Updating ${hub.handle}... `);

    // Find page ID
    const findResult = await graphql(FIND_PAGE, { query: `handle:${hub.handle}` });
    const page = findResult.data?.pages?.nodes?.[0];

    if (!page) {
      console.log('NOT FOUND — skipping');
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
}

main().catch(console.error);
