/**
 * Step 6: Create Shopify Pages for all PSEO content
 * Creates pages and assigns custom templates
 */
const { graphql, sleep } = require('./shopify-api');

const CREATE_PAGE = `
mutation CreatePage($page: PageCreateInput!) {
  pageCreate(page: $page) {
    page {
      id
      handle
      title
    }
    userErrors {
      field
      message
    }
  }
}`;

// Hub pages
const hubPages = [
  {
    title: 'Fabric Glossary — Textile & Fabric Guide',
    handle: 'fabric-glossary',
    templateSuffix: 'fabric-glossary',
    body: '<h1>Fabric Glossary</h1><p>Your complete guide to fabrics, weaves, and textile terminology used in premium menswear. From cotton twill to ripstop, understand what makes quality trousers.</p>',
    seo_title: 'Fabric Glossary — Textile Guide | William Ashford',
    seo_description: 'Explore our fabric glossary. Learn about cotton twill, ripstop, canvas, stretch cotton, and more textiles used in premium cargo pants and chinos.',
  },
  {
    title: 'Style Comparisons — Pants & Fit Guides',
    handle: 'style-comparisons',
    templateSuffix: 'comparison',
    body: '<h1>Style Comparisons</h1><p>Head-to-head comparisons of popular trouser styles, fits, and fabrics. Make informed decisions about your next pair of pants.</p>',
    seo_title: 'Style Comparisons — Pants Guide | William Ashford',
    seo_description: 'Cargo pants vs chinos, slim vs relaxed fit, cotton vs polyester — detailed comparisons to help you choose the right pants.',
  },
  {
    title: 'Style Guides — How to Wear & What to Pair',
    handle: 'style-guides',
    templateSuffix: 'use-case',
    body: '<h1>Style Guides</h1><p>Outfit ideas, occasion guides, and styling tips for cargo pants, chinos, and trousers. From college to date night, we have got you covered.</p>',
    seo_title: 'Men\'s Style Guides | William Ashford',
    seo_description: 'Outfit ideas and style guides for cargo pants, chinos, and trousers. Learn how to dress for any occasion with William Ashford.',
  },
];

// PSEO content pages — Glossary terms
const glossaryPages = [
  { title: 'What Is Cotton Twill Fabric?', handle: 'what-is-cotton-twill', seo_title: 'What Is Cotton Twill Fabric? | William Ashford', seo_description: 'Learn about cotton twill fabric — its diagonal weave, durability, and why it is the go-to fabric for premium cargo pants and chinos.' },
  { title: 'What Is Ripstop Fabric?', handle: 'what-is-ripstop-fabric', seo_title: 'What Is Ripstop Fabric? | William Ashford', seo_description: 'Discover ripstop fabric — the tear-resistant material used in military gear and premium cargo pants.' },
  { title: 'What Is Cotton Canvas Fabric?', handle: 'what-is-cotton-canvas', seo_title: 'What Is Cotton Canvas? | William Ashford', seo_description: 'Learn about cotton canvas — a heavy-duty plain-weave fabric used for bags, workwear, and cargo pants.' },
  { title: 'What Is Stretch Cotton?', handle: 'what-is-stretch-cotton', seo_title: 'What Is Stretch Cotton? | William Ashford', seo_description: 'Discover stretch cotton fabric — cotton blended with elastane for flexibility in modern trousers.' },
  { title: 'What Is Cotton Lycra Fabric?', handle: 'what-is-cotton-lycra', seo_title: 'Cotton Lycra Fabric Explained | William Ashford', seo_description: 'What is cotton lycra? Learn how this cotton-spandex blend combines comfort with stretch for modern trousers.' },
  { title: 'What Is Garment Dyeing?', handle: 'what-is-garment-dyeing', seo_title: 'What Is Garment Dyeing? | William Ashford', seo_description: 'Learn about garment dyeing — the process of dyeing finished clothing for rich colour and vintage character.' },
  { title: 'What Is GSM in Fabric?', handle: 'what-is-gsm-fabric-weight', seo_title: 'What Is GSM in Fabric? Weight Guide | William Ashford', seo_description: 'Understand GSM (grams per square metre) — the standard measurement for fabric weight in pants and trousers.' },
  { title: 'Selvedge vs Non-Selvedge Fabric', handle: 'selvedge-vs-non-selvedge', seo_title: 'Selvedge vs Non-Selvedge Fabric | William Ashford', seo_description: 'What is selvedge fabric? Learn the difference between selvedge and non-selvedge weaving.' },
];

// PSEO content pages — Comparisons
const comparisonPages = [
  { title: 'Cargo Pants vs Chinos: Which Should You Choose?', handle: 'cargo-pants-vs-chinos', seo_title: 'Cargo Pants vs Chinos | William Ashford', seo_description: 'Cargo pants or chinos? Compare fit, versatility, and style to find the right pants for your wardrobe.' },
  { title: 'Slim-Fit vs Relaxed-Fit Cargo Pants', handle: 'slim-fit-vs-relaxed-fit-cargos', seo_title: 'Slim vs Relaxed Fit Cargos | William Ashford', seo_description: 'Slim-fit or relaxed-fit cargo pants? Compare silhouettes, comfort, and style.' },
  { title: 'Cotton vs Polyester Pants: Which Fabric Is Better?', handle: 'cotton-vs-polyester-pants', seo_title: 'Cotton vs Polyester Pants | William Ashford', seo_description: 'Compare cotton and polyester for trousers. Which fabric wins for comfort and durability?' },
  { title: 'Cargo Pants vs Joggers: Style & Comfort Compared', handle: 'cargo-pants-vs-joggers', seo_title: 'Cargo Pants vs Joggers | William Ashford', seo_description: 'Cargo pants or joggers? Compare style, comfort, and versatility for casual wear.' },
  { title: 'Tapered vs Straight Fit Trousers', handle: 'tapered-vs-straight-fit', seo_title: 'Tapered vs Straight Fit Trousers | William Ashford', seo_description: 'Compare tapered and straight-fit trousers. Which cut suits your body type and style?' },
];

// PSEO content pages — Use Cases / Style Guides
const useCasePages = [
  { title: 'How to Wear Cargo Pants to College', handle: 'cargo-pants-for-college', seo_title: 'Cargo Pants for College | William Ashford', seo_description: 'Style cargo pants for college with ease. Outfit ideas and tips for looking sharp on campus.' },
  { title: 'Why Cargo Pants Are the Best Travel Pants', handle: 'cargo-pants-for-travel', seo_title: 'Best Travel Pants: Cargo Pants | William Ashford', seo_description: 'Discover why cargo pants are ideal for travel. Functional pockets, comfort, and style.' },
  { title: 'How to Wear Cargo Pants on a Date Night', handle: 'cargo-pants-for-date-night', seo_title: 'Cargo Pants for Date Night | William Ashford', seo_description: 'Style cargo pants for a date night that is stylish, confident, and effortlessly cool.' },
  { title: 'What to Wear With Chinos: Complete Style Guide', handle: 'what-to-wear-with-chinos', seo_title: 'What to Wear With Chinos | William Ashford', seo_description: 'Complete guide to styling chinos for men. From casual to smart-casual outfit ideas.' },
  { title: 'How to Style Black Cargo Pants: 5 Outfit Ideas', handle: 'how-to-style-black-cargo-pants', seo_title: 'How to Style Black Cargo Pants | William Ashford', seo_description: '5 ways to style black cargo pants. From streetwear to smart-casual outfits.' },
  { title: 'Can You Wear Cargo Pants to Work?', handle: 'cargo-pants-for-work', seo_title: 'Cargo Pants for Work | William Ashford', seo_description: 'Can you wear cargo pants to work? Learn when and how to style cargos for the office.' },
];

async function createPages(pages, templateSuffix, label) {
  console.log(`\n--- Creating ${label} ---\n`);

  for (const page of pages) {
    console.log(`Creating: ${page.title.substring(0, 55)}...`);

    const metafields = [];
    if (page.seo_title) {
      metafields.push({ namespace: 'global', key: 'title_tag', value: page.seo_title, type: 'single_line_text_field' });
    }
    if (page.seo_description) {
      metafields.push({ namespace: 'global', key: 'description_tag', value: page.seo_description, type: 'single_line_text_field' });
    }

    const input = {
      title: page.title,
      handle: page.handle,
      templateSuffix: page.templateSuffix || templateSuffix,
      body: page.body || `<p>${page.seo_description || ''}</p>`,
      isPublished: true,
      metafields: metafields.length > 0 ? metafields : undefined,
    };

    const result = await graphql(CREATE_PAGE, { page: input });

    const data = result.data?.pageCreate;
    if (data?.userErrors?.length > 0) {
      const errors = data.userErrors.map(e => e.message).join(', ');
      if (errors.includes('has already been taken')) {
        console.log(`  → Already exists, skipping.`);
      } else {
        console.log(`  ⚠`, errors);
      }
    } else if (data?.page) {
      console.log(`  ✓ ${data.page.handle} (template: ${page.templateSuffix || templateSuffix})`);
    } else {
      console.log(`  ✗ Unexpected:`, JSON.stringify(result.errors || result, null, 2).substring(0, 200));
    }

    await sleep(400);
  }
}

async function main() {
  console.log('=== Creating All PSEO Pages ===\n');

  // Hub pages first
  await createPages(hubPages, null, 'Hub Pages');

  // Glossary pages
  await createPages(glossaryPages, 'fabric-glossary', 'Fabric Glossary Pages');

  // Comparison pages
  await createPages(comparisonPages, 'comparison', 'Comparison Pages');

  // Use case pages
  await createPages(useCasePages, 'use-case', 'Use Case / Style Guide Pages');

  const total = hubPages.length + glossaryPages.length + comparisonPages.length + useCasePages.length;
  console.log(`\n=== Done — ${total} pages processed ===`);
}

main().catch(console.error);
