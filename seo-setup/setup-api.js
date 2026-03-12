/**
 * William Ashford - Shopify SEO Setup Script
 *
 * Creates all metaobject definitions, metafield definitions,
 * hub pages, and PSEO content pages via the Shopify Admin GraphQL API.
 *
 * Usage:
 *   node seo-setup/setup-api.js --token shpat_xxxxx
 *
 * Or set environment variable:
 *   SHOPIFY_ADMIN_TOKEN=shpat_xxxxx node seo-setup/setup-api.js
 */

const https = require('https');

// --- Configuration ---
const STORE = 'william-ashford-apex.myshopify.com';
const API_VERSION = '2024-10';
const TOKEN = process.argv.find(a => a.startsWith('--token='))?.split('=')[1]
  || process.argv[process.argv.indexOf('--token') + 1]
  || process.env.SHOPIFY_ADMIN_TOKEN;

if (!TOKEN) {
  console.error('ERROR: Provide token via --token shpat_xxxxx or SHOPIFY_ADMIN_TOKEN env var');
  process.exit(1);
}

// --- GraphQL Helper ---
function graphql(query, variables = {}) {
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
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.errors) {
            reject(new Error(JSON.stringify(parsed.errors, null, 2)));
          } else {
            resolve(parsed.data);
          }
        } catch (e) {
          reject(new Error(`Failed to parse response: ${data.substring(0, 500)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// --- Step 1: Create Metaobject Definitions ---
async function createMetaobjectDefinitions() {
  console.log('\n=== STEP 1: Creating Metaobject Definitions ===\n');

  const definitions = [
    {
      name: 'Style Guide Entry',
      type: 'style_guide_entry',
      fieldDefinitions: [
        { key: 'heading', name: 'H1 Heading', type: 'single_line_text_field' },
        { key: 'seo_title', name: 'SEO Title (max 60)', type: 'single_line_text_field' },
        { key: 'seo_description', name: 'SEO Description (max 160)', type: 'multi_line_text_field' },
        { key: 'body_content', name: 'Main Body Content', type: 'rich_text_field' },
        { key: 'category', name: 'Category Tag', type: 'single_line_text_field' },
        { key: 'faq_data', name: 'FAQ Data (JSON)', type: 'json' },
        { key: 'last_updated', name: 'Last Updated', type: 'date' },
      ],
    },
    {
      name: 'Fabric Glossary Entry',
      type: 'fabric_glossary_entry',
      fieldDefinitions: [
        { key: 'term_name', name: 'Fabric Name', type: 'single_line_text_field' },
        { key: 'seo_title', name: 'SEO Title', type: 'single_line_text_field' },
        { key: 'seo_description', name: 'SEO Description', type: 'multi_line_text_field' },
        { key: 'short_definition', name: 'Short Definition', type: 'single_line_text_field' },
        { key: 'full_definition', name: 'Full Definition', type: 'rich_text_field' },
        { key: 'properties', name: 'Properties (JSON)', type: 'json' },
        { key: 'care_instructions', name: 'Care Instructions', type: 'rich_text_field' },
        { key: 'faq_data', name: 'FAQ Data (JSON)', type: 'json' },
      ],
    },
    {
      name: 'Comparison Page',
      type: 'comparison_page',
      fieldDefinitions: [
        { key: 'heading', name: 'H1 Heading', type: 'single_line_text_field' },
        { key: 'seo_title', name: 'SEO Title', type: 'single_line_text_field' },
        { key: 'seo_description', name: 'SEO Description', type: 'multi_line_text_field' },
        { key: 'item_a_name', name: 'Item A Name', type: 'single_line_text_field' },
        { key: 'item_b_name', name: 'Item B Name', type: 'single_line_text_field' },
        { key: 'intro', name: 'Introduction', type: 'rich_text_field' },
        { key: 'comparison_data', name: 'Comparison Table (JSON)', type: 'json' },
        { key: 'verdict', name: 'Verdict', type: 'rich_text_field' },
        { key: 'faq_data', name: 'FAQ Data (JSON)', type: 'json' },
      ],
    },
    {
      name: 'Use Case Page',
      type: 'use_case_page',
      fieldDefinitions: [
        { key: 'use_case', name: 'Use Case Title', type: 'single_line_text_field' },
        { key: 'seo_title', name: 'SEO Title', type: 'single_line_text_field' },
        { key: 'seo_description', name: 'SEO Description', type: 'multi_line_text_field' },
        { key: 'body_content', name: 'Body Content', type: 'rich_text_field' },
        { key: 'tips', name: 'Tips & Recommendations', type: 'rich_text_field' },
        { key: 'faq_data', name: 'FAQ Data (JSON)', type: 'json' },
      ],
    },
  ];

  for (const def of definitions) {
    console.log(`  Creating metaobject: ${def.name}...`);
    try {
      const result = await graphql(`
        mutation CreateMetaobjectDefinition($definition: MetaobjectDefinitionCreateInput!) {
          metaobjectDefinitionCreate(definition: $definition) {
            metaobjectDefinition {
              id
              type
              name
            }
            userErrors {
              field
              message
            }
          }
        }
      `, {
        definition: {
          name: def.name,
          type: def.type,
          access: { storefront: 'PUBLIC_READ' },
          fieldDefinitions: def.fieldDefinitions.map(f => ({
            key: f.key,
            name: f.name,
            type: f.type,
          })),
        },
      });

      const res = result.metaobjectDefinitionCreate;
      if (res.userErrors?.length > 0) {
        console.log(`    WARNING: ${res.userErrors.map(e => e.message).join(', ')}`);
      } else {
        console.log(`    OK: ${res.metaobjectDefinition.type} (${res.metaobjectDefinition.id})`);
      }
    } catch (err) {
      console.log(`    ERROR: ${err.message.substring(0, 200)}`);
    }
    await sleep(500);
  }
}

// --- Step 2: Create Metafield Definitions for Products ---
async function createMetafieldDefinitions() {
  console.log('\n=== STEP 2: Creating Product Metafield Definitions ===\n');

  const metafields = [
    { namespace: 'custom', key: 'seo_title', name: 'SEO Title Override', type: 'single_line_text_field', ownerType: 'PRODUCT', description: 'Custom title tag for SEO (max 60 chars)' },
    { namespace: 'custom', key: 'material', name: 'Material', type: 'single_line_text_field', ownerType: 'PRODUCT', description: 'Product material for Product schema markup' },
    { namespace: 'custom', key: 'features', name: 'Features', type: 'json', ownerType: 'PRODUCT', description: 'Structured feature list [{name, value}] for schema additionalProperty' },
    { namespace: 'seo', key: 'noindex', name: 'Noindex', type: 'boolean', ownerType: 'PAGE', description: 'Set to true to noindex this page' },
  ];

  for (const mf of metafields) {
    console.log(`  Creating metafield: ${mf.ownerType}.${mf.namespace}.${mf.key}...`);
    try {
      const result = await graphql(`
        mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
          metafieldDefinitionCreate(definition: $definition) {
            createdDefinition {
              id
              namespace
              key
            }
            userErrors {
              field
              message
            }
          }
        }
      `, {
        definition: {
          namespace: mf.namespace,
          key: mf.key,
          name: mf.name,
          type: mf.type,
          ownerType: mf.ownerType,
          description: mf.description,
          pin: true,
        },
      });

      const res = result.metafieldDefinitionCreate;
      if (res.userErrors?.length > 0) {
        console.log(`    WARNING: ${res.userErrors.map(e => e.message).join(', ')}`);
      } else {
        console.log(`    OK: ${res.createdDefinition.namespace}.${res.createdDefinition.key}`);
      }
    } catch (err) {
      console.log(`    ERROR: ${err.message.substring(0, 200)}`);
    }
    await sleep(500);
  }
}

// --- Step 3: Create Hub Pages ---
async function createHubPages() {
  console.log('\n=== STEP 3: Creating Hub Pages ===\n');

  const hubPages = [
    {
      handle: 'style-guides',
      title: 'Style Guides - How to Wear William Ashford',
      body_html: '<h1>Style Guides</h1><p>Discover how to style your William Ashford cargo pants and chinos for every occasion. From office wear to weekend adventures, our comprehensive style guides help you look and feel your best.</p><p>Browse our guides below to find styling tips, outfit ideas, and expert recommendations tailored to your lifestyle.</p>',
      template_suffix: '',
      seo_title: 'Cargo Pants & Chinos Style Guides | William Ashford',
      seo_description: 'Expert style guides for men\'s cargo pants and chinos. Learn how to wear William Ashford for every occasion, season, and body type.',
    },
    {
      handle: 'fabric-glossary',
      title: 'Fabric Glossary - Understanding Premium Materials',
      body_html: '<h1>Fabric Glossary</h1><p>Understanding the materials that make William Ashford cargo pants and chinos exceptional. Our fabric glossary explains fabric weight (GSM), weave types, cotton blends, and care instructions so you can make informed choices.</p>',
      template_suffix: '',
      seo_title: 'Fabric Glossary: Cotton, Twill, GSM Guide | William Ashford',
      seo_description: 'Learn about premium fabrics used in William Ashford cargo pants. Understand GSM, cotton twill, stretch blends, and fabric care.',
    },
    {
      handle: 'compare',
      title: 'Comparisons - Find the Right Pants for You',
      body_html: '<h1>Comparisons</h1><p>Not sure which pants are right for you? Our detailed comparison guides break down the differences between cargo pants, chinos, joggers, jeans, and more. Compare fit, fabric, functionality, and style to find your perfect match.</p>',
      template_suffix: '',
      seo_title: 'Cargo Pants vs Chinos vs Joggers: Comparisons | William Ashford',
      seo_description: 'Detailed comparisons of cargo pants vs chinos, joggers, jeans and more. Find the right premium pants for your lifestyle.',
    },
    {
      handle: 'use-cases',
      title: 'Use Cases - Best Cargo Pants for Every Activity',
      body_html: '<h1>Best Cargo Pants for Every Activity</h1><p>Whether you\'re heading to the office, going on a hike, traveling internationally, or working on a job site, William Ashford has the perfect cargo pants. Explore our use case guides to find the best pants for your specific needs.</p>',
      template_suffix: '',
      seo_title: 'Best Cargo Pants for Work, Travel, Hiking & More | William Ashford',
      seo_description: 'Find the best cargo pants for your activity. Expert guides for office wear, travel, hiking, construction, and everyday use.',
    },
  ];

  for (const page of hubPages) {
    console.log(`  Creating hub page: /pages/${page.handle}...`);
    try {
      const result = await graphql(`
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
        }
      `, {
        page: {
          handle: page.handle,
          title: page.title,
          body: page.body_html,
          isPublished: true,
          seo: {
            title: page.seo_title,
            description: page.seo_description,
          },
        },
      });

      const res = result.pageCreate;
      if (res.userErrors?.length > 0) {
        console.log(`    WARNING: ${res.userErrors.map(e => e.message).join(', ')}`);
      } else {
        console.log(`    OK: /pages/${res.page.handle} (${res.page.id})`);
      }
    } catch (err) {
      console.log(`    ERROR: ${err.message.substring(0, 200)}`);
    }
    await sleep(500);
  }
}

// --- Step 4: Create PSEO Content Pages ---
async function createPSEOPages() {
  console.log('\n=== STEP 4: Creating PSEO Content Pages ===\n');

  // Style Guide Pages
  const styleGuides = [
    { handle: 'how-to-style-black-cargo-pants', title: 'How to Style Black Cargo Pants', seo_title: 'How to Style Black Cargo Pants for Men | William Ashford', seo_desc: 'Complete guide to styling black cargo pants for men. Outfit ideas for work, casual, and night out. Tips from William Ashford.', template: 'style-guide' },
    { handle: 'how-to-style-olive-cargo-pants', title: 'How to Style Olive Cargo Pants', seo_title: 'How to Style Olive Cargo Pants for Men | William Ashford', seo_desc: 'Style olive green cargo pants like a pro. Outfit ideas, color pairings, and seasonal looks from William Ashford.', template: 'style-guide' },
    { handle: 'how-to-style-khaki-cargo-pants', title: 'How to Style Khaki Cargo Pants', seo_title: 'How to Style Khaki Cargo Pants for Men | William Ashford', seo_desc: 'Master khaki cargo pants styling. Versatile outfit combinations for office, weekend, and travel from William Ashford.', template: 'style-guide' },
    { handle: 'how-to-style-navy-cargo-pants', title: 'How to Style Navy Cargo Pants', seo_title: 'How to Style Navy Cargo Pants for Men | William Ashford', seo_desc: 'Navy cargo pants outfit ideas for men. Polished and casual looks with William Ashford premium cargo pants.', template: 'style-guide' },
    { handle: 'how-to-style-grey-cargo-pants', title: 'How to Style Grey Cargo Pants', seo_title: 'How to Style Grey Cargo Pants for Men | William Ashford', seo_desc: 'Grey cargo pants styling guide. Modern outfits, layering tips, and color combinations from William Ashford.', template: 'style-guide' },
    { handle: 'how-to-style-brown-cargo-pants', title: 'How to Style Brown Cargo Pants', seo_title: 'How to Style Brown Cargo Pants for Men | William Ashford', seo_desc: 'Earth-tone styling guide for brown cargo pants. Pair with boots, jackets, and more. William Ashford tips.', template: 'style-guide' },
    { handle: 'cargo-pants-for-summer', title: 'Cargo Pants for Summer: Stay Cool & Stylish', seo_title: 'Best Cargo Pants for Summer 2026 | William Ashford', seo_desc: 'Lightweight cargo pants for summer. Breathable fabrics, styling tips, and outfit ideas to stay cool and look great.', template: 'style-guide' },
    { handle: 'cargo-pants-for-winter', title: 'Cargo Pants for Winter: Warm & Functional', seo_title: 'Best Cargo Pants for Winter | William Ashford', seo_desc: 'How to wear cargo pants in winter. Layering guide, boot pairings, and warmth tips from William Ashford.', template: 'style-guide' },
    { handle: 'cargo-pants-for-monsoon', title: 'Cargo Pants for Monsoon Season', seo_title: 'Best Cargo Pants for Monsoon & Rainy Season | William Ashford', seo_desc: 'Monsoon-proof cargo pants guide. Quick-dry fabrics, styling for rain, and care tips from William Ashford.', template: 'style-guide' },
    { handle: 'cargo-pants-for-spring', title: 'Cargo Pants for Spring: Transition Outfits', seo_title: 'Spring Cargo Pants Outfits for Men | William Ashford', seo_desc: 'Spring cargo pants styling. Light layers, fresh colors, and transitional outfit ideas from William Ashford.', template: 'style-guide' },
    { handle: 'cargo-pants-for-slim-build', title: 'Best Cargo Pants for Slim Build Men', seo_title: 'Best Cargo Pants for Slim Build Men | William Ashford', seo_desc: 'Cargo pants fit guide for slim builds. Which cuts, sizes, and styles work best. William Ashford recommendations.', template: 'style-guide' },
    { handle: 'cargo-pants-for-athletic-build', title: 'Best Cargo Pants for Athletic Build', seo_title: 'Best Cargo Pants for Athletic Build Men | William Ashford', seo_desc: 'Cargo pants for muscular and athletic body types. Fit advice, stretch options, and sizing from William Ashford.', template: 'style-guide' },
    { handle: 'cargo-pants-for-larger-frame', title: 'Best Cargo Pants for Larger Frame', seo_title: 'Best Cargo Pants for Big & Tall Men | William Ashford', seo_desc: 'Cargo pants guide for larger builds. Comfortable fits, flattering cuts, and sizing tips from William Ashford.', template: 'style-guide' },
    { handle: 'cargo-pants-for-office', title: '5 Ways to Wear Cargo Pants to Work', seo_title: '5 Ways to Wear Cargo Pants to the Office | William Ashford', seo_desc: 'Can you wear cargo pants to work? Yes! 5 office-appropriate cargo pants outfits from William Ashford.', template: 'style-guide' },
    { handle: 'cargo-pants-street-style', title: 'Cargo Pants Street Style Guide', seo_title: 'Cargo Pants Street Style: Urban Outfit Guide | William Ashford', seo_desc: 'Street style cargo pants outfits for men. Sneaker pairings, oversized layers, and urban looks from William Ashford.', template: 'style-guide' },
    { handle: 'how-to-cuff-cargo-pants', title: 'How to Cuff Cargo Pants: 4 Methods', seo_title: 'How to Cuff & Roll Cargo Pants | William Ashford', seo_desc: 'Learn 4 ways to cuff cargo pants. Pin roll, single fold, stacked, and military cuff techniques.', template: 'style-guide' },
    { handle: 'cargo-pants-with-boots', title: 'Cargo Pants with Boots: Complete Guide', seo_title: 'Cargo Pants with Boots: Best Combinations | William Ashford', seo_desc: 'How to pair cargo pants with boots. Chelsea, combat, hiking, and desert boot outfit ideas from William Ashford.', template: 'style-guide' },
    { handle: 'best-cargo-pants-for-travel', title: 'Best Cargo Pants for Travel', seo_title: 'Best Travel Cargo Pants for Men | William Ashford', seo_desc: 'Why cargo pants are perfect for travel. Pocket security, comfort, versatility, and packing tips.', template: 'style-guide' },
    { handle: 'cargo-pants-for-college', title: 'Cargo Pants for College Students', seo_title: 'Cargo Pants Outfits for College Students | William Ashford', seo_desc: 'Affordable style guide for college men. Cargo pants outfits for class, campus, and weekend from William Ashford.', template: 'style-guide' },
    { handle: 'cargo-pants-wedding-guest', title: 'Cargo Pants as a Wedding Guest: Can You Pull It Off?', seo_title: 'Can You Wear Cargo Pants to a Wedding? | William Ashford', seo_desc: 'When and how to wear cargo pants as a wedding guest. Smart-casual options from William Ashford premium collection.', template: 'style-guide' },
  ];

  // Fabric Glossary Pages
  const fabricPages = [
    { handle: '260-gsm-cotton-twill', title: '260 GSM Cotton Twill: What Makes It Premium', seo_title: '260 GSM Cotton Twill Fabric Guide | William Ashford', seo_desc: 'Everything about 260 GSM cotton twill fabric. Weight, durability, feel, and why it makes premium cargo pants.', template: 'fabric-glossary' },
    { handle: 'understanding-fabric-gsm', title: 'Understanding Fabric Weight (GSM) in Pants', seo_title: 'What is GSM in Fabric? Weight Guide for Pants | William Ashford', seo_desc: 'Learn what GSM means in clothing. How fabric weight affects comfort, durability, and style in cargo pants and chinos.', template: 'fabric-glossary' },
    { handle: 'cotton-vs-polyester-blend', title: 'Cotton vs Polyester Blend: Which is Better for Pants?', seo_title: 'Cotton vs Polyester Blend Pants: Pros & Cons | William Ashford', seo_desc: 'Cotton vs polyester blend for pants. Compare breathability, durability, comfort, and care for cargo pants.', template: 'fabric-glossary' },
    { handle: 'what-is-twill-weave', title: 'What is Twill Weave? Properties & Benefits', seo_title: 'Twill Weave Fabric: Properties & Benefits | William Ashford', seo_desc: 'Learn about twill weave fabric. How diagonal ribbing creates durable, wrinkle-resistant pants. William Ashford guide.', template: 'fabric-glossary' },
    { handle: 'stretch-cotton-explained', title: 'Stretch Cotton Explained: Comfort Meets Durability', seo_title: 'Stretch Cotton Fabric: Benefits for Pants | William Ashford', seo_desc: 'What is stretch cotton? How elastane blends improve comfort and mobility in cargo pants without losing durability.', template: 'fabric-glossary' },
    { handle: 'pre-washed-vs-raw-fabric', title: 'Pre-Washed vs Raw Fabric: What\'s the Difference?', seo_title: 'Pre-Washed vs Raw Fabric in Pants | William Ashford', seo_desc: 'Pre-washed vs raw denim and cotton. Understand shrinkage, break-in periods, and vintage finishes in cargo pants.', template: 'fabric-glossary' },
  ];

  // Comparison Pages
  const comparisonPages = [
    { handle: 'cargo-pants-vs-chinos', title: 'Cargo Pants vs Chinos: Complete Comparison', seo_title: 'Cargo Pants vs Chinos: Which is Better? | William Ashford', seo_desc: 'Detailed comparison of cargo pants vs chinos. Style, comfort, functionality, and when to wear each. William Ashford guide.', template: 'comparison' },
    { handle: 'cargo-pants-vs-joggers', title: 'Cargo Pants vs Joggers: Which Should You Choose?', seo_title: 'Cargo Pants vs Joggers: Full Comparison | William Ashford', seo_desc: 'Cargo pants vs joggers compared. Comfort, style, versatility, and best use cases for each pant type.', template: 'comparison' },
    { handle: 'slim-fit-vs-regular-fit-cargo', title: 'Slim Fit vs Regular Fit Cargo Pants', seo_title: 'Slim Fit vs Regular Fit Cargo Pants | William Ashford', seo_desc: 'Choose between slim and regular fit cargo pants. Body type guide, comfort comparison, and styling differences.', template: 'comparison' },
    { handle: 'cargo-pants-vs-jeans', title: 'Cargo Pants vs Jeans: Comfort, Style & Durability', seo_title: 'Cargo Pants vs Jeans: Complete Comparison | William Ashford', seo_desc: 'Cargo pants vs jeans compared across comfort, functionality, style, and durability. Which is right for you?', template: 'comparison' },
    { handle: 'cotton-vs-cotton-blend-cargos', title: 'Cotton vs Cotton-Blend Cargo Pants', seo_title: '100% Cotton vs Cotton Blend Cargo Pants | William Ashford', seo_desc: 'Pure cotton vs cotton-blend cargo pants. Breathability, stretch, durability, and care compared.', template: 'comparison' },
    { handle: 'cargo-pants-vs-track-pants', title: 'Cargo Pants vs Track Pants for Everyday Wear', seo_title: 'Cargo Pants vs Track Pants: Daily Wear Guide | William Ashford', seo_desc: 'Cargo pants or track pants for everyday use? Compare comfort, style versatility, and functionality.', template: 'comparison' },
    { handle: 'premium-vs-fast-fashion-cargos', title: 'Premium vs Fast Fashion Cargo Pants: Worth the Price?', seo_title: 'Premium vs Cheap Cargo Pants: Are They Worth It? | William Ashford', seo_desc: 'Is investing in premium cargo pants worth it? Compare fabric quality, durability, fit, and cost per wear.', template: 'comparison' },
    { handle: '6-pocket-vs-4-pocket-cargos', title: '6-Pocket vs 4-Pocket Cargo Pants', seo_title: '6-Pocket vs 4-Pocket Cargo Pants: Which is Better? | William Ashford', seo_desc: 'Compare 6-pocket and 4-pocket cargo pants. Functionality, aesthetics, and when each design works best.', template: 'comparison' },
  ];

  // Use Case Pages
  const useCasePages = [
    { handle: 'cargo-pants-for-office-wear', title: 'Best Cargo Pants for Office Wear', seo_title: 'Best Cargo Pants for Office & Work | William Ashford', seo_desc: 'Can you wear cargo pants to the office? Professional cargo pants styling, dress codes, and recommendations.', template: 'use-case' },
    { handle: 'cargo-pants-for-hiking', title: 'Cargo Pants for Hiking & Outdoor Adventures', seo_title: 'Best Cargo Pants for Hiking & Outdoors | William Ashford', seo_desc: 'Why cargo pants are ideal for hiking. Durability, pocket utility, and comfort on the trail. William Ashford picks.', template: 'use-case' },
    { handle: 'cargo-pants-for-travel-guide', title: 'Cargo Pants for Travel: Why They\'re Perfect', seo_title: 'Best Cargo Pants for Travel & Flights | William Ashford', seo_desc: 'Travel cargo pants guide. Security pockets, comfort on flights, versatile styling, and packing tips.', template: 'use-case' },
    { handle: 'cargo-pants-for-construction', title: 'Best Cargo Pants for Construction & Trades', seo_title: 'Best Work Cargo Pants for Construction | William Ashford', seo_desc: 'Heavy-duty cargo pants for construction and trade workers. Tool pockets, durability, and comfort all day.', template: 'use-case' },
    { handle: 'cargo-pants-for-gym', title: 'Cargo Pants for Gym & Active Lifestyle', seo_title: 'Cargo Pants for Gym & Workouts | William Ashford', seo_desc: 'Stretch cargo pants for the gym and active lifestyle. Flexibility, breathability, and style from William Ashford.', template: 'use-case' },
    { handle: 'cargo-pants-for-motorcycle', title: 'Cargo Pants for Motorcycle Riding', seo_title: 'Best Cargo Pants for Motorcycle Riders | William Ashford', seo_desc: 'Cargo pants for bikers and motorcycle riders. Protection, storage, and style on two wheels.', template: 'use-case' },
    { handle: 'cargo-pants-for-photography', title: 'Best Cargo Pants for Photography', seo_title: 'Best Cargo Pants for Photographers | William Ashford', seo_desc: 'Why photographers love cargo pants. Gear storage, comfort on shoots, and professional looks from William Ashford.', template: 'use-case' },
    { handle: 'cargo-pants-for-camping', title: 'Cargo Pants for Camping & Festivals', seo_title: 'Best Cargo Pants for Camping & Music Festivals | William Ashford', seo_desc: 'Cargo pants for camping, festivals, and outdoor events. Durability, storage, and comfort from William Ashford.', template: 'use-case' },
    { handle: 'everyday-cargo-pants', title: 'Everyday Cargo Pants: From Morning to Night', seo_title: 'Everyday Cargo Pants: Versatile Daily Wear | William Ashford', seo_desc: 'One pair, all day. How to wear cargo pants from morning coffee to dinner. William Ashford everyday guide.', template: 'use-case' },
    { handle: 'cargo-pants-for-dads', title: 'Cargo Pants for Dads: Functional & Stylish', seo_title: 'Best Cargo Pants for Dads | William Ashford', seo_desc: 'Dad-approved cargo pants that are functional AND stylish. Pocket utility meets modern design from William Ashford.', template: 'use-case' },
  ];

  const allPages = [...styleGuides, ...fabricPages, ...comparisonPages, ...useCasePages];

  console.log(`  Creating ${allPages.length} PSEO pages...\n`);

  let created = 0;
  let errors = 0;

  for (const page of allPages) {
    process.stdout.write(`  [${created + errors + 1}/${allPages.length}] /pages/${page.handle}...`);
    try {
      const result = await graphql(`
        mutation CreatePage($page: PageCreateInput!) {
          pageCreate(page: $page) {
            page {
              id
              handle
            }
            userErrors {
              field
              message
            }
          }
        }
      `, {
        page: {
          handle: page.handle,
          title: page.title,
          body: `<p>Content coming soon. This page is being set up with structured data for: ${page.title}</p>`,
          isPublished: true,
          templateSuffix: page.template,
          seo: {
            title: page.seo_title,
            description: page.seo_desc,
          },
        },
      });

      const res = result.pageCreate;
      if (res.userErrors?.length > 0) {
        console.log(` WARNING: ${res.userErrors.map(e => e.message).join(', ')}`);
        errors++;
      } else {
        console.log(` OK`);
        created++;
      }
    } catch (err) {
      console.log(` ERROR: ${err.message.substring(0, 100)}`);
      errors++;
    }
    await sleep(300); // Rate limiting
  }

  console.log(`\n  Done: ${created} created, ${errors} errors`);
}

// --- Main ---
async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  William Ashford - Shopify SEO Setup                    ║');
  console.log('║  Store: william-ashford-apex.myshopify.com              ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`\nUsing API version: ${API_VERSION}`);

  // Verify connection
  console.log('\nVerifying API connection...');
  try {
    const shop = await graphql('{ shop { name url myshopifyDomain } }');
    console.log(`Connected to: ${shop.shop.name} (${shop.shop.myshopifyDomain})`);
  } catch (err) {
    console.error(`FAILED to connect: ${err.message}`);
    console.error('Check your access token and try again.');
    process.exit(1);
  }

  // Run all steps
  const steps = process.argv.includes('--step');
  const stepNum = steps ? parseInt(process.argv[process.argv.indexOf('--step') + 1]) : 0;

  if (!steps || stepNum === 1) await createMetaobjectDefinitions();
  if (!steps || stepNum === 2) await createMetafieldDefinitions();
  if (!steps || stepNum === 3) await createHubPages();
  if (!steps || stepNum === 4) await createPSEOPages();

  console.log('\n══════════════════════════════════════════════════════════');
  console.log('  SETUP COMPLETE');
  console.log('══════════════════════════════════════════════════════════');
  console.log('\nNext steps:');
  console.log('  1. Go to Shopify Admin > Pages and verify all pages are created');
  console.log('  2. Add rich content to each PSEO page via metaobject data');
  console.log('  3. Update footer navigation to link to hub pages');
  console.log('  4. Push theme with: shopify theme push');
  console.log('  5. Verify schema at https://search.google.com/test/rich-results');
  console.log('  6. Submit sitemap in Google Search Console\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
