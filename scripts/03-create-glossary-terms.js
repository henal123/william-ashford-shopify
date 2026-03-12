/**
 * Step 3: Create Fabric Glossary Term metaobjects
 * These power the /pages/[fabric-term] PSEO pages
 */
const { graphql, sleep } = require('./shopify-api');

const CREATE_METAOBJECT = `
mutation CreateMetaobject($metaobject: MetaobjectCreateInput!) {
  metaobjectCreate(metaobject: $metaobject) {
    metaobject {
      id
      handle
    }
    userErrors {
      field
      message
    }
  }
}`;

const glossaryTerms = [
  {
    handle: 'cotton-twill',
    term_name: 'Cotton Twill',
    seo_title: 'What Is Cotton Twill Fabric? | William Ashford',
    seo_description: 'Learn about cotton twill fabric — its diagonal weave, durability, and why it is the go-to fabric for premium cargo pants and chinos.',
    short_definition: 'Cotton twill is a durable woven fabric with a distinctive diagonal rib pattern. It is the foundation fabric for cargo pants, chinos, and workwear.',
    full_definition: 'Cotton twill is created using a twill weave pattern where the weft thread passes over one or more warp threads and then under two or more warp threads, creating a characteristic diagonal pattern on the fabric surface.\n\nThis weaving technique produces a fabric that is notably stronger and more durable than plain-weave cotton. The diagonal lines also give twill its signature drape and texture, making it ideal for structured garments like trousers.\n\nAt William Ashford, we source premium-grade cotton twill for our cargo pants and chinos, ensuring each pair has the right balance of structure, comfort, and longevity. The weight of our twill ranges from mid-weight (for chinos) to heavier constructions (for rugged cargo pants).',
    properties: 'Durability: Excellent — resists wear and tear\nBreathe-ability: Good — natural cotton fibre allows airflow\nWrinkle resistance: Moderate — better than plain weave\nDrape: Structured yet comfortable\nWeight: Medium to heavy (240–340 GSM typical)',
    care_tips: 'Machine wash cold, inside out. Tumble dry low or hang dry. Iron on medium heat. Avoid bleach. The fabric softens with each wash while maintaining its structure.',
    category: 'weave-types',
  },
  {
    handle: 'ripstop-fabric',
    term_name: 'Ripstop Fabric',
    seo_title: 'What Is Ripstop Fabric? Properties & Uses | William Ashford',
    seo_description: 'Discover ripstop fabric — the tear-resistant material used in military gear and premium cargo pants. Learn its properties, pros, and care tips.',
    short_definition: 'Ripstop is a reinforced fabric with a grid pattern woven in at regular intervals that prevents small tears from spreading. It is widely used in military gear, outdoor apparel, and tactical cargo pants.',
    full_definition: 'Ripstop fabric features a distinctive crosshatch reinforcement pattern — typically using thicker threads woven into the base fabric at regular intervals (usually 5-8mm apart). This grid creates small squares across the fabric surface.\n\nWhen a tear occurs, it stops at the nearest reinforcement thread rather than spreading across the entire garment. This makes ripstop one of the most durable fabrics available for everyday clothing.\n\nRipstop can be made from cotton, nylon, polyester, or blends. Cotton ripstop offers the best combination of durability and comfort for fashion garments. Many William Ashford cargo styles use cotton ripstop for the pocket reinforcement areas.',
    properties: 'Tear resistance: Exceptional — the defining feature\nWeight: Typically lightweight despite high strength\nDurability: Excellent — military-grade construction\nTexture: Slightly textured grid visible up close\nBreathability: Varies by base fibre (cotton ripstop breathes well)',
    care_tips: 'Machine wash warm or cold. Tumble dry low. Highly resistant to damage during washing. Minimal ironing needed — the grid texture hides minor wrinkles.',
    category: 'weave-types',
  },
  {
    handle: 'cotton-canvas',
    term_name: 'Cotton Canvas',
    seo_title: 'What Is Cotton Canvas Fabric? | William Ashford',
    seo_description: 'Learn about cotton canvas — a heavy-duty plain-weave fabric used for bags, workwear, and heavy-duty cargo pants.',
    short_definition: 'Cotton canvas is a heavy, tightly woven plain-weave fabric known for its exceptional strength and stiffness. It is heavier than twill and is used in heavy-duty workwear and structured garments.',
    full_definition: 'Canvas is one of the oldest and most durable woven fabrics. Made from tightly woven cotton yarns in a plain weave, it produces a stiff, heavy fabric that softens beautifully with wear.\n\nCanvas was historically used for sails, tents, and painter surfaces. In fashion, it has become a staple for durable casual trousers, jackets, and bags. The fabric weight typically ranges from 280 to 500+ GSM.\n\nHeavy canvas (duck canvas) is used for the most rugged applications, while lighter canvas weights work well for structured trousers that need to hold their shape.',
    properties: 'Weight: Heavy (280–500+ GSM)\nDurability: Exceptional — the strongest common cotton fabric\nTexture: Smooth but stiff when new, softens with age\nBreathability: Moderate — the tight weave restricts airflow\nStructure: Very structured — holds creases and shape well',
    care_tips: 'Machine wash cold for longevity. Canvas softens over time — this is a feature, not a flaw. Avoid fabric softener which can break down fibres. Line dry preferred; tumble dry low if needed.',
    category: 'weave-types',
  },
  {
    handle: 'stretch-cotton',
    term_name: 'Stretch Cotton',
    seo_title: 'What Is Stretch Cotton? Comfort & Fit | William Ashford',
    seo_description: 'Discover stretch cotton fabric — cotton blended with elastane for flexibility. Learn why it is ideal for modern slim-fit trousers and chinos.',
    short_definition: 'Stretch cotton is a fabric blend combining cotton with a small percentage (2-5%) of elastane or spandex, giving the fabric flexibility and shape recovery while maintaining cotton\'s natural breathability.',
    full_definition: 'Stretch cotton revolutionised modern menswear by solving the age-old problem of fitted trousers being restrictive. By adding just 2-5% elastane to cotton yarn, the resulting fabric stretches and recovers, allowing for slimmer cuts without sacrificing comfort.\n\nThis fabric is essential for modern tapered and slim-fit trousers. Without stretch, a slim silhouette would restrict movement at the knee, thigh, and waist. The stretch component allows the fabric to move with your body.\n\nWilliam Ashford uses stretch cotton in our Refined Everyday Chinos and several cargo styles, ensuring all-day comfort whether you are commuting, working, or out for the evening.',
    properties: 'Stretch: 2-way or 4-way depending on weave\nComfort: Excellent — moves with the body\nShape retention: Very good — elastane helps recover shape\nBreathability: Good — cotton base maintains airflow\nFit: Enables slim and tapered fits without restriction',
    care_tips: 'Wash cold to preserve elastane. Never use high heat in the dryer — heat degrades elastane fibres. Hang dry when possible. Avoid ironing directly on stretch areas at high heat.',
    category: 'fabric-types',
  },
  {
    handle: 'cotton-lycra',
    term_name: 'Cotton Lycra',
    seo_title: 'Cotton Lycra Fabric Explained | William Ashford',
    seo_description: 'What is cotton lycra? Learn how this cotton-spandex blend combines comfort with stretch for modern trousers, chinos, and everyday pants.',
    short_definition: 'Cotton Lycra is a blend of cotton fibres and Lycra (a brand name for elastane/spandex), typically in a 95-98% cotton and 2-5% Lycra ratio. It provides natural cotton feel with added stretch and recovery.',
    full_definition: 'Lycra is the branded name for elastane fibre made by the company Invista. When blended with cotton, it creates a fabric that stretches comfortably and snaps back to its original shape.\n\nThe term "Cotton Lycra" and "Stretch Cotton" are often used interchangeably, though Cotton Lycra specifically refers to blends using genuine Lycra-branded elastane, which is known for superior recovery and longevity compared to generic elastane.\n\nIn premium trousers, Cotton Lycra blends offer the best of both worlds: the natural breathability and soft hand-feel of cotton with the flexibility and shape retention of Lycra.',
    properties: 'Stretch recovery: Superior — Lycra brand offers best-in-class elasticity\nSoftness: Very soft — cotton base with smooth stretch\nDurability: Good — Lycra maintains stretch through many washes\nAppearance: Clean, smooth finish\nWeight: Light to medium',
    care_tips: 'Cold wash recommended. Avoid chlorine bleach. Tumble dry on low or lay flat to dry. Store folded, not hung, to prevent stretching on hangers over time.',
    category: 'fabric-types',
  },
  {
    handle: 'garment-dyeing',
    term_name: 'Garment Dyeing',
    seo_title: 'What Is Garment Dyeing? Process & Benefits | William Ashford',
    seo_description: 'Learn about garment dyeing — the process of dyeing finished clothing for rich colour and unique vintage character in every piece.',
    short_definition: 'Garment dyeing is the process of dyeing a garment after it has been fully constructed, rather than dyeing the fabric before cutting and sewing. This produces rich, unique colour variations and a softer hand-feel.',
    full_definition: 'Unlike piece dyeing (where fabric is dyed in bolts before cutting), garment dyeing immerses the finished garment in a dye bath. Because different parts of the garment absorb dye differently — seams, pockets, and edges take colour slightly differently — each piece develops a unique character.\n\nGarment-dyed pieces have a softer, more lived-in feel from day one. The colour is slightly less uniform than piece-dyed garments, which is considered desirable for casual and streetwear aesthetics.\n\nThis technique is popular for cargo pants, chinos, and casual trousers where a relaxed, slightly vintage appearance adds to the garment\'s appeal.',
    properties: 'Colour depth: Rich and slightly varied across the garment\nSoftness: Enhanced — the dyeing process softens fibres\nUniqueness: Each piece has subtle colour variations\nFading: Develops attractive patina over time\nProcess: More labour-intensive than piece dyeing',
    care_tips: 'Wash separately for the first 2-3 washes as some dye may release. Cold water preserves colour longer. Expect and embrace gradual fading — it is part of the garment-dyed character.',
    category: 'processes',
  },
  {
    handle: 'gsm-fabric-weight',
    term_name: 'GSM (Fabric Weight)',
    seo_title: 'What Is GSM in Fabric? Weight Guide | William Ashford',
    seo_description: 'Understand GSM (grams per square metre) — the standard measurement for fabric weight. Learn what GSM means for cargo pants, chinos, and trousers.',
    short_definition: 'GSM stands for Grams per Square Metre and is the standard unit for measuring fabric weight. Higher GSM means heavier, thicker fabric. Typical trouser fabrics range from 200 GSM (lightweight) to 400+ GSM (heavy duty).',
    full_definition: 'GSM is the universal measurement that tells you how heavy a fabric is per square metre. It directly affects how a garment looks, feels, drapes, and performs.\n\nFor trousers and pants:\n- Lightweight (180-220 GSM): Summer chinos, linen-blend trousers. Breathable but may show wear faster.\n- Mid-weight (220-300 GSM): The sweet spot for most cargo pants and chinos. Good balance of durability, drape, and comfort.\n- Heavyweight (300-400+ GSM): Heavy-duty cargo pants, canvas trousers, workwear. Very durable but warmer and stiffer.\n\nWilliam Ashford cargo pants typically use 260-320 GSM cotton twill, giving them a substantial feel without being heavy. Our chinos use 220-260 GSM for a lighter, more refined drape.',
    properties: 'Measurement: Weight in grams of a 1m x 1m piece of fabric\nLight: Under 200 GSM (summer shirts, linings)\nMedium: 200-300 GSM (trousers, most apparel)\nHeavy: 300+ GSM (denim, canvas, outerwear)\nImpact: Affects drape, durability, warmth, and structure',
    care_tips: 'Heavier GSM fabrics are generally more durable but take longer to dry. Adjust washing temperature and dryer time based on weight. Heavier fabrics may benefit from line drying to prevent shrinkage.',
    category: 'terminology',
  },
  {
    handle: 'selvedge-vs-non-selvedge',
    term_name: 'Selvedge vs Non-Selvedge',
    seo_title: 'Selvedge vs Non-Selvedge Fabric | William Ashford',
    seo_description: 'What is selvedge fabric? Learn the difference between selvedge and non-selvedge weaving and why it matters for premium trousers.',
    short_definition: 'Selvedge (self-edge) fabric is woven on traditional shuttle looms that create a clean, finished edge on both sides of the fabric. Non-selvedge fabric is woven on modern projectile looms that are faster but leave raw, unfinished edges.',
    full_definition: 'Selvedge fabric gets its name from the "self-edge" — the tightly woven band along both edges of the fabric that prevents unravelling. This is produced on older, narrower shuttle looms that weave continuously back and forth.\n\nModern non-selvedge fabric is woven on wide, high-speed projectile looms. These are more efficient and produce wider fabric (60+ inches vs 30 inches for selvedge), but the edges are raw and must be serged or finished.\n\nSelvedge is prized in premium denim and trousers for its tighter weave, unique character, and the visible clean edge when cuffs are rolled up. It is more expensive due to slower production speeds and narrower fabric width.',
    properties: 'Weave density: Selvedge is typically tighter and denser\nEdge finish: Self-finished (selvedge) vs raw serged edge\nWidth: 28-32 inches (selvedge) vs 60+ inches (non-selvedge)\nCost: Selvedge is 2-3x more expensive to produce\nCharacter: Selvedge develops unique fading patterns over time',
    care_tips: 'Selvedge fabrics benefit from less frequent washing and cold water when washed. The tighter weave means they are naturally more durable. Turn inside out to preserve surface character.',
    category: 'weave-types',
  },
];

async function main() {
  console.log('=== Creating Fabric Glossary Terms ===\n');

  for (const term of glossaryTerms) {
    console.log(`Creating: ${term.term_name}...`);

    const fields = [
      { key: 'term_name', value: term.term_name },
      { key: 'seo_title', value: term.seo_title },
      { key: 'seo_description', value: term.seo_description },
      { key: 'short_definition', value: term.short_definition },
      { key: 'full_definition', value: term.full_definition },
      { key: 'properties', value: term.properties },
      { key: 'care_tips', value: term.care_tips },
      { key: 'category', value: term.category },
      { key: 'last_updated', value: '2026-03-12' },
    ];

    const result = await graphql(CREATE_METAOBJECT, {
      metaobject: {
        type: 'fabric_glossary_term',
        handle: term.handle,
        fields,
      },
    });

    const data = result.data?.metaobjectCreate;
    if (data?.userErrors?.length > 0) {
      console.log(`  ⚠`, data.userErrors.map(e => e.message).join(', '));
    } else if (data?.metaobject) {
      console.log(`  ✓ ${data.metaobject.handle}`);
    }

    await sleep(500);
  }

  console.log(`\n=== Created ${glossaryTerms.length} glossary terms ===`);
}

main().catch(console.error);
