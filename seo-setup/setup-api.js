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
// Type identifiers MUST match what pseo-*.liquid sections look up:
//   pseo-use-case.liquid + pseo-style-guide.liquid → shop.metaobjects.use_case_guide
//   pseo-comparison.liquid                         → shop.metaobjects.style_comparison
//   pseo-fabric-glossary.liquid                    → shop.metaobjects.fabric_glossary_term
async function createMetaobjectDefinitions() {
  console.log('\n=== STEP 1: Creating Metaobject Definitions ===\n');

  const definitions = [
    {
      name: 'Use Case Guide',
      type: 'use_case_guide',
      fieldDefinitions: [
        { key: 'heading', name: 'H1 Heading', type: 'single_line_text_field' },
        { key: 'intro_text', name: 'Introduction Text', type: 'single_line_text_field' },
        { key: 'style_tips', name: 'Style Tips (one per line)', type: 'multi_line_text_field' },
        { key: 'recommended_pieces', name: 'Recommended Pieces (one per line)', type: 'multi_line_text_field' },
        { key: 'dos_and_donts', name: "Do's and Don'ts (one per line — prefix don'ts with 'Don't', 'Avoid', or 'Never')", type: 'multi_line_text_field' },
        { key: 'faq_data', name: 'FAQ Data (JSON array of {question, answer})', type: 'json' },
      ],
    },
    {
      name: 'Fabric Glossary Term',
      type: 'fabric_glossary_term',
      fieldDefinitions: [
        { key: 'term_name', name: 'Term Name', type: 'single_line_text_field' },
        { key: 'short_definition', name: 'Short Definition (one sentence)', type: 'single_line_text_field' },
        { key: 'full_definition', name: 'Full Definition', type: 'multi_line_text_field' },
        { key: 'properties', name: 'Properties (one per line, format: Label: Value)', type: 'multi_line_text_field' },
        { key: 'care_tips', name: 'Care Tips (one per line)', type: 'multi_line_text_field' },
        { key: 'faq_data', name: 'FAQ Data (JSON array of {question, answer})', type: 'json' },
      ],
    },
    {
      name: 'Style Comparison',
      type: 'style_comparison',
      fieldDefinitions: [
        { key: 'heading', name: 'H1 Heading', type: 'single_line_text_field' },
        { key: 'intro_text', name: 'Introduction Text', type: 'single_line_text_field' },
        { key: 'item_a_name', name: 'Item A Name', type: 'single_line_text_field' },
        { key: 'item_a_pros', name: 'Item A Pros (one per line)', type: 'multi_line_text_field' },
        { key: 'item_a_cons', name: 'Item A Cons (one per line)', type: 'multi_line_text_field' },
        { key: 'item_b_name', name: 'Item B Name', type: 'single_line_text_field' },
        { key: 'item_b_pros', name: 'Item B Pros (one per line)', type: 'multi_line_text_field' },
        { key: 'item_b_cons', name: 'Item B Cons (one per line)', type: 'multi_line_text_field' },
        { key: 'verdict', name: 'Verdict (one sentence recommendation)', type: 'single_line_text_field' },
        { key: 'faq_data', name: 'FAQ Data (JSON array of {question, answer})', type: 'json' },
      ],
    },
  ];

  for (const def of definitions) {
    console.log(`  Creating metaobject: ${def.name} (type: ${def.type})...`);
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

// --- Step 2: Create Metafield Definitions ---
async function createMetafieldDefinitions() {
  console.log('\n=== STEP 2: Creating Metafield Definitions ===\n');

  const metafields = [
    { namespace: 'custom', key: 'material', name: 'Material', type: 'single_line_text_field', ownerType: 'PRODUCT', description: 'Product material for Product schema markup (e.g. "Super 110s Merino Wool")' },
    { namespace: 'custom', key: 'features', name: 'Features', type: 'json', ownerType: 'PRODUCT', description: 'Structured feature list [{name, value}] for schema additionalProperty' },
    { namespace: 'seo', key: 'noindex', name: 'Noindex', type: 'boolean', ownerType: 'PAGE', description: 'Set to true to noindex this page (use on shell pages before metaobject content is added)' },
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
      title: 'Style Guides | William Ashford',
      body_html: `<h1>Style Guides</h1>
<p>How to wear William Ashford — from choosing the right suit colour for an interview to pairing dress trousers with the right shoe. Our style guides give you the specific answers, not the generic advice.</p>
<h2>Suit Styling</h2>
<ul>
  <li><a href="/pages/how-to-style-a-navy-suit">How to Style a Navy Suit</a></li>
  <li><a href="/pages/how-to-style-a-grey-suit">How to Style a Grey Suit</a></li>
  <li><a href="/pages/how-to-style-a-charcoal-suit">How to Style a Charcoal Suit</a></li>
  <li><a href="/pages/suit-with-brown-shoes">Suit with Brown Shoes</a></li>
  <li><a href="/pages/how-to-wear-a-suit-without-a-tie">How to Wear a Suit Without a Tie</a></li>
  <li><a href="/pages/how-to-style-a-morning-suit">How to Style a Morning Suit</a></li>
</ul>
<h2>Smart Casual & Separates</h2>
<ul>
  <li><a href="/pages/how-to-style-a-blazer-with-trousers">How to Style a Blazer with Trousers</a></li>
  <li><a href="/pages/smart-casual-men">Smart Casual for Men</a></li>
  <li><a href="/pages/business-casual-dress-code-men">Business Casual Dress Code</a></li>
  <li><a href="/pages/how-to-style-dress-trousers">How to Style Dress Trousers</a></li>
  <li><a href="/pages/how-to-style-tweed">How to Style Tweed</a></li>
</ul>
<h2>Seasonal Dressing</h2>
<ul>
  <li><a href="/pages/linen-suits-for-summer">Linen Suits for Summer</a></li>
</ul>`,
      seo_title: 'Style Guides for Men | William Ashford',
      seo_description: 'How to style suits, blazers, and trousers from William Ashford. Specific, practical guides for every occasion and season.',
    },
    {
      handle: 'occasions',
      title: 'Occasion Dressing Guides | William Ashford',
      body_html: `<h1>Occasion Dressing Guides</h1>
<p>What to wear — and what to avoid — for every occasion that calls for considered menswear. From black tie to business interviews, get the dress code right the first time.</p>
<h2>Professional Occasions</h2>
<ul>
  <li><a href="/pages/what-to-wear-to-a-job-interview">What to Wear to a Job Interview</a></li>
  <li><a href="/pages/menswear-for-court-hearings">Menswear for Court Hearings</a></li>
  <li><a href="/pages/graduation-outfit-men">Graduation Outfit Guide</a></li>
</ul>
<h2>Social & Formal Occasions</h2>
<ul>
  <li><a href="/pages/black-tie-dress-code-guide">Black Tie Dress Code Guide</a></li>
  <li><a href="/pages/what-to-wear-to-a-wedding-as-a-guest">What to Wear to a Wedding as a Guest</a></li>
  <li><a href="/pages/garden-party-outfit-men">Garden Party Outfit Guide</a></li>
  <li><a href="/pages/horse-racing-dress-code-men">Horse Racing Dress Code</a></li>
  <li><a href="/pages/christmas-party-outfit-men">Christmas Party Outfit Guide</a></li>
  <li><a href="/pages/funeral-attire-men">Funeral Attire for Men</a></li>
  <li><a href="/pages/first-date-outfit-men">First Date Outfit Guide</a></li>
</ul>`,
      seo_title: 'Occasion Dressing Guides for Men | William Ashford',
      seo_description: 'Dress code guides for every occasion — weddings, interviews, black tie, and more. Get it right with William Ashford.',
    },
    {
      handle: 'style-comparisons',
      title: 'Style Comparisons | William Ashford',
      body_html: `<h1>Style Comparisons</h1>
<p>Not sure which to choose? Our detailed comparisons break down the differences between suit styles, trouser cuts, fabric types, and construction methods — so you can make a confident decision.</p>
<h2>Suit Comparisons</h2>
<ul>
  <li><a href="/pages/single-breasted-vs-double-breasted-suit">Single-Breasted vs Double-Breasted Suit</a></li>
  <li><a href="/pages/slim-fit-vs-regular-fit-suit">Slim Fit vs Regular Fit Suit</a></li>
  <li><a href="/pages/suit-vs-blazer-and-trousers">Suit vs Blazer and Trousers</a></li>
  <li><a href="/pages/morning-dress-vs-lounge-suit">Morning Dress vs Lounge Suit</a></li>
  <li><a href="/pages/two-piece-vs-three-piece-suit">Two-Piece vs Three-Piece Suit</a></li>
  <li><a href="/pages/italian-vs-british-tailoring">Italian vs British Tailoring</a></li>
  <li><a href="/pages/bespoke-vs-made-to-measure">Bespoke vs Made-to-Measure</a></li>
</ul>
<h2>Trouser & Fabric Comparisons</h2>
<ul>
  <li><a href="/pages/flat-front-vs-pleated-trousers">Flat-Front vs Pleated Trousers</a></li>
  <li><a href="/pages/wool-vs-linen-suit">Wool vs Linen Suit</a></li>
  <li><a href="/pages/canvas-vs-fused-construction">Canvas vs Fused Construction</a></li>
</ul>`,
      seo_title: 'Suit & Style Comparisons | William Ashford',
      seo_description: 'Compare suit styles, trouser cuts, and fabrics side by side. Make the right choice with William Ashford comparison guides.',
    },
    {
      handle: 'fabric-glossary',
      title: 'Fabric Glossary | William Ashford',
      body_html: `<h1>Fabric Glossary</h1>
<p>The materials behind William Ashford garments, explained clearly. Understanding what your clothes are made of — and why it matters — is the first step to buying better and wearing longer.</p>
<h2>Wool & Natural Fibres</h2>
<ul>
  <li><a href="/pages/what-is-super-100s-wool">What is Super 100s Wool?</a></li>
  <li><a href="/pages/what-is-super-120s-wool">What is Super 120s Wool?</a></li>
  <li><a href="/pages/what-is-merino-wool">What is Merino Wool?</a></li>
  <li><a href="/pages/what-is-linen">What is Linen?</a></li>
</ul>
<h2>Construction & Weave</h2>
<ul>
  <li><a href="/pages/what-is-half-canvas-construction">What is Half-Canvas Construction?</a></li>
  <li><a href="/pages/what-is-full-canvas-construction">What is Full-Canvas Construction?</a></li>
  <li><a href="/pages/what-is-herringbone-weave">What is Herringbone Weave?</a></li>
  <li><a href="/pages/what-is-twill-weave">What is Twill Weave?</a></li>
</ul>`,
      seo_title: 'Fabric Glossary: Wool, Linen & Tailoring Terms | William Ashford',
      seo_description: 'Understand the fabrics and construction methods behind premium menswear. William Ashford fabric glossary.',
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
          metafields: [
            { namespace: 'global', key: 'title_tag', type: 'single_line_text_field', value: page.seo_title },
            { namespace: 'global', key: 'description_tag', type: 'multi_line_text_field', value: page.seo_description },
          ],
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
// Pages are created as noindex shells — populate metaobject entries in Shopify Admin,
// then remove the seo.noindex metafield to make each page live.
async function createPSEOPages() {
  console.log('\n=== STEP 4: Creating PSEO Content Pages ===\n');

  // Style Guide Pages — template suffix: style-guide
  // Metaobject type: use_case_guide, handle = page handle
  const styleGuides = [
    { handle: 'how-to-style-a-navy-suit', title: 'How to Style a Navy Suit', seo_title: 'How to Style a Navy Suit | William Ashford', seo_desc: 'Complete guide to styling a navy suit for work, weddings, and smart occasions. Shirt, tie, and shoe pairings from William Ashford.', template: 'style-guide' },
    { handle: 'how-to-style-a-grey-suit', title: 'How to Style a Grey Suit', seo_title: 'How to Style a Grey Suit | William Ashford', seo_desc: 'Grey suit styling guide for men. Colour combinations, shirt choices, and occasion tips from William Ashford.', template: 'style-guide' },
    { handle: 'how-to-style-a-charcoal-suit', title: 'How to Style a Charcoal Suit', seo_title: 'How to Style a Charcoal Suit | William Ashford', seo_desc: 'Charcoal suit outfit ideas for men. The most versatile suit colour — worn right, from William Ashford.', template: 'style-guide' },
    { handle: 'suit-with-brown-shoes', title: 'Suit with Brown Shoes', seo_title: 'How to Wear a Suit with Brown Shoes | William Ashford', seo_desc: 'Which suit colours work with brown shoes? Shade matching, belt rules, and styling tips from William Ashford.', template: 'style-guide' },
    { handle: 'how-to-wear-a-suit-without-a-tie', title: 'How to Wear a Suit Without a Tie', seo_title: 'How to Wear a Suit Without a Tie | William Ashford', seo_desc: 'Pull off a tieless suit with confidence. Collar choices, shirt options, and occasions where it works. William Ashford.', template: 'style-guide' },
    { handle: 'how-to-style-a-blazer-with-trousers', title: 'How to Style a Blazer with Trousers', seo_title: 'How to Style a Blazer with Trousers | William Ashford', seo_desc: 'Mix blazer and trouser combinations that look considered, not mismatched. William Ashford styling guide.', template: 'style-guide' },
    { handle: 'linen-suits-for-summer', title: 'Linen Suits for Summer', seo_title: 'Linen Suits for Summer | William Ashford', seo_desc: 'How to wear a linen suit in summer. Fabric guide, styling tips, and why the creasing is the point.', template: 'style-guide' },
    { handle: 'smart-casual-men', title: 'Smart Casual for Men: The Definitive Guide', seo_title: 'Smart Casual Dress Code for Men | William Ashford', seo_desc: 'What smart casual actually means for men. Real outfit examples and what to avoid. William Ashford guide.', template: 'style-guide' },
    { handle: 'how-to-style-dress-trousers', title: 'How to Style Dress Trousers', seo_title: 'How to Style Dress Trousers | William Ashford', seo_desc: 'Dress trouser outfit ideas for men. Waistband, break, and pairing guide from William Ashford.', template: 'style-guide' },
    { handle: 'how-to-style-a-morning-suit', title: 'How to Style a Morning Suit', seo_title: 'How to Style a Morning Suit | William Ashford', seo_desc: 'Morning suit guide for weddings and formal occasions. What to wear and how to wear it from William Ashford.', template: 'style-guide' },
    { handle: 'business-casual-dress-code-men', title: 'Business Casual Dress Code for Men', seo_title: 'Business Casual Dress Code for Men | William Ashford', seo_desc: 'What business casual means in 2025. Specific outfit examples for every workplace. William Ashford guide.', template: 'style-guide' },
    { handle: 'how-to-style-tweed', title: 'How to Style Tweed', seo_title: 'How to Style Tweed for Men | William Ashford', seo_desc: 'Tweed styling beyond the countryside. Modern outfit ideas for tweed jackets and suits from William Ashford.', template: 'style-guide' },
  ];

  // Fabric Glossary Pages — template suffix: fabric-glossary
  // Metaobject type: fabric_glossary_term, handle = page handle MINUS 'what-is-' prefix
  // e.g. page handle 'what-is-merino-wool' → metaobject handle 'merino-wool'
  const fabricPages = [
    { handle: 'what-is-super-100s-wool', title: 'What is Super 100s Wool?', seo_title: 'What is Super 100s Wool? | William Ashford', seo_desc: 'Super 100s wool explained. Yarn fineness, what the Super number means, and why it matters for suits.', template: 'fabric-glossary' },
    { handle: 'what-is-super-120s-wool', title: 'What is Super 120s Wool?', seo_title: 'What is Super 120s Wool? | William Ashford', seo_desc: 'Super 120s wool guide. How it differs from Super 100s, where it excels, and what to expect from it.', template: 'fabric-glossary' },
    { handle: 'what-is-merino-wool', title: 'What is Merino Wool?', seo_title: 'What is Merino Wool? | William Ashford', seo_desc: 'Merino wool explained for menswear. Why it is used in premium suits and knitwear. William Ashford guide.', template: 'fabric-glossary' },
    { handle: 'what-is-half-canvas-construction', title: 'What is Half-Canvas Construction?', seo_title: 'What is Half-Canvas Suit Construction? | William Ashford', seo_desc: 'Half-canvas explained. How it differs from fused and full-canvas, and why it matters for the life of your suit.', template: 'fabric-glossary' },
    { handle: 'what-is-full-canvas-construction', title: 'What is Full-Canvas Construction?', seo_title: 'What is Full-Canvas Suit Construction? | William Ashford', seo_desc: 'Full-canvas construction guide. The benchmark of premium tailoring — what it is and what it delivers.', template: 'fabric-glossary' },
    { handle: 'what-is-herringbone-weave', title: 'What is Herringbone Weave?', seo_title: 'What is Herringbone Weave? | William Ashford', seo_desc: 'Herringbone weave explained. The V-pattern, its properties, and how it looks in suits and trousers.', template: 'fabric-glossary' },
    { handle: 'what-is-twill-weave', title: 'What is Twill Weave?', seo_title: 'What is Twill Weave? | William Ashford', seo_desc: 'Twill weave fabric guide. The diagonal structure that makes suiting fabrics drape and wear so well.', template: 'fabric-glossary' },
    { handle: 'what-is-linen', title: 'What is Linen?', seo_title: 'What is Linen Fabric? | William Ashford', seo_desc: 'Linen for menswear explained. Why it creases, why that is correct, and how to wear it well in summer.', template: 'fabric-glossary' },
  ];

  // Comparison Pages — template suffix: comparison
  // Metaobject type: style_comparison, handle = page handle
  const comparisonPages = [
    { handle: 'single-breasted-vs-double-breasted-suit', title: 'Single-Breasted vs Double-Breasted Suit', seo_title: 'Single vs Double-Breasted Suit | William Ashford', seo_desc: 'Single-breasted vs double-breasted suit compared. Body types, occasions, and the right choice for you.', template: 'comparison' },
    { handle: 'flat-front-vs-pleated-trousers', title: 'Flat-Front vs Pleated Trousers', seo_title: 'Flat-Front vs Pleated Trousers | William Ashford', seo_desc: 'Flat-front vs pleated trousers guide. Comfort, silhouette, occasion, and which suits which body type.', template: 'comparison' },
    { handle: 'wool-vs-linen-suit', title: 'Wool vs Linen Suit', seo_title: 'Wool vs Linen Suit: Which is Right for You? | William Ashford', seo_desc: 'Wool or linen suit? Breathability, structure, occasion suitability, and seasonal guidance from William Ashford.', template: 'comparison' },
    { handle: 'slim-fit-vs-regular-fit-suit', title: 'Slim Fit vs Regular Fit Suit', seo_title: 'Slim Fit vs Regular Fit Suit | William Ashford', seo_desc: 'Slim fit vs regular fit suit — which is right for your body type and occasion? William Ashford guide.', template: 'comparison' },
    { handle: 'suit-vs-blazer-and-trousers', title: 'Suit vs Blazer and Trousers', seo_title: 'Suit vs Blazer and Trousers | William Ashford', seo_desc: 'When to wear a suit versus a blazer with separate trousers. Formality, versatility, and value compared.', template: 'comparison' },
    { handle: 'morning-dress-vs-lounge-suit', title: 'Morning Dress vs Lounge Suit', seo_title: 'Morning Dress vs Lounge Suit | William Ashford', seo_desc: 'Morning dress or lounge suit for weddings and formal events? The dress code decision made clear.', template: 'comparison' },
    { handle: 'canvas-vs-fused-construction', title: 'Canvas vs Fused Suit Construction', seo_title: 'Canvas vs Fused Suit Construction | William Ashford', seo_desc: 'Canvas versus fused suit construction compared. Longevity, drape, and what the difference costs.', template: 'comparison' },
    { handle: 'bespoke-vs-made-to-measure', title: 'Bespoke vs Made-to-Measure', seo_title: 'Bespoke vs Made-to-Measure Suits | William Ashford', seo_desc: 'Bespoke vs made-to-measure — what the terms actually mean and which is worth the investment.', template: 'comparison' },
    { handle: 'italian-vs-british-tailoring', title: 'Italian vs British Tailoring', seo_title: 'Italian vs British Tailoring | William Ashford', seo_desc: 'The real differences between Italian and British tailoring traditions — cut, shoulder, and silhouette.', template: 'comparison' },
    { handle: 'two-piece-vs-three-piece-suit', title: 'Two-Piece vs Three-Piece Suit', seo_title: 'Two-Piece vs Three-Piece Suit | William Ashford', seo_desc: 'Two-piece or three-piece suit? When the waistcoat adds value and when it is too formal for the occasion.', template: 'comparison' },
  ];

  // Occasion Pages — template suffix: use-case
  // Metaobject type: use_case_guide, handle = page handle
  const occasionPages = [
    { handle: 'what-to-wear-to-a-job-interview', title: 'What to Wear to a Job Interview', seo_title: 'What to Wear to a Job Interview (Men) | William Ashford', seo_desc: 'Job interview outfit guide for men. What to wear for different industries, and what to avoid. William Ashford.', template: 'use-case' },
    { handle: 'black-tie-dress-code-guide', title: 'Black Tie Dress Code Guide for Men', seo_title: 'Black Tie Dress Code Guide for Men | William Ashford', seo_desc: 'What black tie means in practice. Dinner suit, shirt, shoes, and what is and is not acceptable.', template: 'use-case' },
    { handle: 'what-to-wear-to-a-wedding-as-a-guest', title: 'What to Wear to a Wedding as a Guest', seo_title: 'Wedding Guest Outfit Guide for Men | William Ashford', seo_desc: 'Wedding guest attire for men. Dress codes explained, outfit ideas, and what not to wear.', template: 'use-case' },
    { handle: 'menswear-for-court-hearings', title: 'Menswear for Court Hearings', seo_title: 'What to Wear to Court (Men) | William Ashford', seo_desc: 'Court appearance dress guide for men. What is expected, what helps, and what to avoid in a courtroom.', template: 'use-case' },
    { handle: 'garden-party-outfit-men', title: 'Garden Party Outfit Guide for Men', seo_title: 'Garden Party Outfit Guide for Men | William Ashford', seo_desc: 'What to wear to a garden party as a man. Dress codes, fabric choices, and occasion-appropriate looks.', template: 'use-case' },
    { handle: 'graduation-outfit-men', title: 'Graduation Outfit Guide for Men', seo_title: 'Graduation Outfit Guide for Men | William Ashford', seo_desc: 'What to wear to a graduation ceremony. Smart outfit options that work under a gown and at dinner after.', template: 'use-case' },
    { handle: 'christmas-party-outfit-men', title: 'Christmas Party Outfit Guide for Men', seo_title: 'Christmas Party Outfit for Men | William Ashford', seo_desc: 'Office Christmas party outfit ideas for men. Festive without being ridiculous. William Ashford guide.', template: 'use-case' },
    { handle: 'horse-racing-dress-code-men', title: 'Horse Racing Dress Code for Men', seo_title: 'Horse Racing Dress Code for Men | William Ashford', seo_desc: 'What to wear to Ascot, Goodwood, and other race meetings. Enclosure rules and outfit tips from William Ashford.', template: 'use-case' },
    { handle: 'funeral-attire-men', title: 'Funeral Attire for Men', seo_title: 'Funeral Attire Guide for Men | William Ashford', seo_desc: 'What to wear to a funeral as a man. What is appropriate, what to avoid, and how to show respect through dress.', template: 'use-case' },
    { handle: 'first-date-outfit-men', title: 'First Date Outfit Guide for Men', seo_title: 'First Date Outfit Ideas for Men | William Ashford', seo_desc: 'What to wear on a first date. Outfit ideas across different settings — dinner, casual, and smart-casual.', template: 'use-case' },
  ];

  const allPages = [...styleGuides, ...fabricPages, ...comparisonPages, ...occasionPages];

  console.log(`  Creating ${allPages.length} PSEO pages...\n`);
  console.log('  NOTE: All pages are created with seo.noindex=true (shell pages).');
  console.log('  Remove the noindex metafield in Shopify Admin once metaobject content is added.\n');

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
          body: `<p>This page is being prepared. Check back soon.</p>`,
          isPublished: false,
          templateSuffix: page.template,
          metafields: [
            { namespace: 'global', key: 'title_tag', type: 'single_line_text_field', value: page.seo_title },
            { namespace: 'global', key: 'description_tag', type: 'multi_line_text_field', value: page.seo_desc },
          ],
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

  // Run all steps (or a specific step with --step N)
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
  console.log('  1. Verify metaobject definitions in Shopify Admin > Content > Metaobjects');
  console.log('     Types must be: use_case_guide, style_comparison, fabric_glossary_term');
  console.log('  2. Add content to each pSEO page via its metaobject entry in Shopify Admin');
  console.log('  3. Once content is added, publish the page and remove seo.noindex metafield');
  console.log('  4. Update hub page body HTML to link to each new page as it goes live');
  console.log('  5. Add hub pages to footer nav under "Style & Knowledge" column');
  console.log('  6. Push theme with: shopify theme push');
  console.log('  7. Submit sitemap in Google Search Console: /sitemap.xml');
  console.log('  8. Test schema at: https://search.google.com/test/rich-results\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
