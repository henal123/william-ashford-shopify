/**
 * Batch 2: Additional Fabric Glossary Terms (15 new)
 */
const { graphql, sleep } = require('./shopify-api');

const CREATE_METAOBJECT = `
mutation CreateMetaobject($metaobject: MetaobjectCreateInput!) {
  metaobjectCreate(metaobject: $metaobject) {
    metaobject { id handle }
    userErrors { field message }
  }
}`;

const terms = [
  {
    handle: 'corduroy-fabric',
    term_name: 'Corduroy',
    seo_title: 'What Is Corduroy Fabric? Guide | William Ashford',
    seo_description: 'Learn about corduroy fabric — its distinctive ridged texture, warmth, and why it is a timeless choice for autumn and winter trousers.',
    short_definition: 'Corduroy is a ridged fabric made from tufted cotton with vertical lines (called wales) running down its surface. The wales give corduroy its distinctive soft texture and make it warmer than flat-weave cotton.',
    full_definition: 'Corduroy gets its texture from extra sets of yarn woven into the base fabric and then cut to create the raised ridges (wales). The number of wales per inch determines the look — wide-wale corduroy (6-8 wales per inch) has a chunky retro feel, while fine-wale or pinwale (14-21 wales per inch) looks more refined and modern.\n\nCorduroy has been a menswear staple since the 18th century. It offers excellent warmth, a unique texture that adds visual interest to outfits, and surprising durability. The fabric softens beautifully with wear and washing.\n\nFor trousers, corduroy works best in autumn and winter. It pairs naturally with knitwear, flannel shirts, and leather boots. Corduroy cargo pants and chinos offer a textured alternative to standard cotton twill.',
    properties: 'Texture: Distinctive ridged surface (wales)\nWarmth: Excellent — traps air between wales\nDurability: Very good — the pile adds reinforcement\nWeight: Medium to heavy (250-380 GSM)\nVersatility: Best for autumn/winter; too warm for summer',
    care_tips: 'Turn inside out before washing to protect the wales. Wash cold on a gentle cycle. Avoid wringing — the wales can flatten. Hang dry or tumble on low. Use a soft brush to restore flattened wales after drying.',
    category: 'fabric-types',
  },
  {
    handle: 'denim-fabric',
    term_name: 'Denim',
    seo_title: 'What Is Denim Fabric? Complete Guide | William Ashford',
    seo_description: 'Everything about denim fabric — how it is made, types of denim, and how it differs from other cotton fabrics used in trousers.',
    short_definition: 'Denim is a sturdy cotton twill fabric where the weft passes under two or more warp threads. It is traditionally dyed with indigo, giving it the characteristic blue colour, though modern denim comes in all colours.',
    full_definition: 'Denim is essentially a type of cotton twill, but with a specific construction where only the warp (vertical) threads are dyed while the weft (horizontal) threads remain white. This is why the inside of raw denim appears lighter than the outside.\n\nThe twill weave gives denim its diagonal ribbing and makes it extremely durable. Originally developed for workwear in the 1800s, denim became mainstream through Levi Strauss jeans and is now the most popular trouser fabric worldwide.\n\nKey denim types include: Raw/dry denim (unwashed, stiff, develops personal fade patterns), Washed denim (pre-treated for softness), Stretch denim (with 1-3% elastane), and Selvedge denim (woven on traditional looms for premium quality).\n\nWhile William Ashford focuses on cargo pants and chinos rather than jeans, understanding denim helps you compare it against twill and canvas fabrics used in our collections.',
    properties: 'Durability: Exceptional — one of the strongest cotton fabrics\nWeight: Heavy (10-16 oz per yard typically)\nFading: Develops character with wear (especially raw denim)\nStructure: Very structured — holds shape well\nBreathability: Low to moderate — dense weave restricts airflow',
    care_tips: 'Wash infrequently (every 5-10 wears for raw denim). Cold wash always. Turn inside out. Never use bleach unless intentionally distressing. Hang dry to prevent shrinkage.',
    category: 'fabric-types',
  },
  {
    handle: 'nylon-fabric',
    term_name: 'Nylon',
    seo_title: 'What Is Nylon Fabric? Properties | William Ashford',
    seo_description: 'Learn about nylon fabric — a synthetic material known for strength, water resistance, and lightweight performance in outdoor and technical pants.',
    short_definition: 'Nylon is a synthetic polymer fabric known for exceptional strength-to-weight ratio, water resistance, and quick-drying properties. It is widely used in outdoor gear, technical trousers, and performance wear.',
    full_definition: 'Nylon was the first commercially successful synthetic fabric, developed by DuPont in the 1930s. It is made from petroleum-based polymers and can be woven or knitted into fabrics of varying weights and textures.\n\nFor trousers, nylon is prized for its durability (it is stronger than cotton at a fraction of the weight), water resistance, and quick-drying ability. Nylon cargo pants are popular for hiking, travel, and outdoor activities.\n\nHowever, pure nylon has drawbacks: it does not breathe well, can feel clammy against skin, and has a synthetic sheen that looks less refined than cotton. Many modern pants use nylon-cotton blends to combine nylon\'s durability with cotton\'s breathability.\n\nWilliam Ashford prioritises cotton and cotton-blend fabrics for everyday wear, but nylon-blend options are excellent for travel and adventure-specific use cases.',
    properties: 'Strength: Exceptional — strongest common clothing fibre\nWeight: Very light\nWater resistance: Good — dries very quickly\nBreathability: Poor — traps heat and moisture\nTexture: Smooth with a slight synthetic sheen',
    care_tips: 'Machine wash cold or warm. Dries extremely fast — often air-dry in under an hour. Avoid high heat in the dryer as nylon can melt. No ironing needed. Resistant to mould and mildew.',
    category: 'fabric-types',
  },
  {
    handle: 'linen-fabric',
    term_name: 'Linen',
    seo_title: 'What Is Linen Fabric? Summer Guide | William Ashford',
    seo_description: 'Learn about linen fabric — the most breathable natural textile, perfect for summer trousers. Properties, care, and styling tips.',
    short_definition: 'Linen is a natural fabric made from flax plant fibres. It is the most breathable natural textile, making it ideal for hot weather clothing. Linen is stronger than cotton but wrinkles easily, giving it a relaxed aesthetic.',
    full_definition: 'Linen has been worn for thousands of years — it is one of the oldest textiles in human history. Made from the fibres of the flax plant, linen has a distinctive crisp hand-feel and natural lustre.\n\nThe fabric excels in hot climates because its fibres are hollow, allowing exceptional airflow. Linen also absorbs moisture quickly and releases it fast, creating a natural cooling effect. It is up to 30% stronger than cotton and becomes softer with each wash.\n\nThe trade-off is wrinkles — linen creases easily and stays creased. While some view this as a drawback, modern fashion embraces linen\'s relaxed, slightly rumpled aesthetic as part of its charm.\n\nFor trousers, linen works best in summer. Linen-cotton blends offer a good compromise: more breathable than pure cotton but with less wrinkling than pure linen.',
    properties: 'Breathability: The best of any natural fabric\nCooling: Excellent — hollow fibres create airflow\nStrength: 30% stronger than cotton\nWrinkle resistance: Very low — wrinkles are a feature\nTexture: Crisp, with natural slubs and irregular texture',
    care_tips: 'Machine wash on a gentle cycle with cold water. Linen softens and improves with every wash. Hang dry for best results. Iron while slightly damp if you want a crisp look. Embrace the wrinkles — they are part of the aesthetic.',
    category: 'fabric-types',
  },
  {
    handle: 'polyester-fabric',
    term_name: 'Polyester',
    seo_title: 'What Is Polyester Fabric? Pros & Cons | William Ashford',
    seo_description: 'Learn about polyester fabric — its properties, pros and cons for trousers, and how it compares to cotton for everyday pants.',
    short_definition: 'Polyester is a synthetic fabric made from petroleum-based polymers. It is the most widely produced fabric in the world, valued for durability, wrinkle resistance, and colour retention.',
    full_definition: 'Polyester dominates the global textile market due to its low cost and versatile properties. The fabric is made by extruding melted polymer through spinnerets to create fibres, which are then woven or knitted into fabric.\n\nFor trousers, polyester offers clear advantages: it resists wrinkles, holds colour through many washes, dries quickly, and is very durable. This makes polyester popular in formal trousers, travel pants, and performance wear.\n\nHowever, polyester has significant drawbacks for everyday comfort: it does not breathe well, traps odours, can feel clammy against skin, and generates static. It also sheds microplastics during washing, raising environmental concerns.\n\nWilliam Ashford uses cotton-dominant blends (95-98% cotton) rather than polyester-dominant fabrics. When stretch is needed, we add 2-5% elastane rather than increasing polyester content, preserving the natural cotton feel.',
    properties: 'Wrinkle resistance: Excellent — stays smooth\nDurability: Very high — resists stretching and shrinking\nBreathability: Poor — traps heat and moisture\nColour retention: Excellent — resists fading\nEnvironmental impact: Petroleum-based, sheds microplastics',
    care_tips: 'Machine wash warm or cold. Tumble dry on low — polyester is sensitive to high heat and can pill or melt. Does not need ironing. Avoid fabric softener which coats fibres and reduces moisture-wicking.',
    category: 'fabric-types',
  },
  {
    handle: 'enzyme-wash',
    term_name: 'Enzyme Wash',
    seo_title: 'What Is Enzyme Wash? Fabric Finishing | William Ashford',
    seo_description: 'Learn about enzyme washing — a fabric finishing process that softens garments naturally. How it works and why it matters for premium pants.',
    short_definition: 'Enzyme wash is a garment finishing process that uses natural enzymes (cellulase) to break down surface fibres, producing a softer hand-feel, subtle fading, and a pre-worn appearance without harsh chemicals.',
    full_definition: 'Enzyme washing is one of the most popular garment finishing techniques in premium clothing. Instead of using harsh chemicals like bleach or stone washing with pumice, enzyme washing uses naturally occurring cellulase enzymes that gently digest the surface fibres of cotton.\n\nThe result is a garment that feels softer, has a slightly faded appearance, and looks naturally worn-in from day one. The process is gentler on the fabric than stone washing and produces less waste.\n\nDifferent enzymes produce different effects: neutral cellulase creates a smooth finish, acid cellulase creates more surface texture, and varying treatment times control the intensity of the effect.\n\nMany premium cargo pants and chinos use enzyme washing to achieve the perfect balance of softness and structured shape that customers expect from quality garments.',
    properties: 'Effect: Softens fabric and creates subtle fading\nChemistry: Natural enzymes — more eco-friendly than chemical washes\nDurability impact: Minimal — only surface fibres are affected\nAppearance: Slightly faded, pre-worn look\nFeel: Significantly softer than unwashed fabric',
    care_tips: 'Enzyme-washed garments are already pre-shrunk. Wash cold to maintain the finish. The softness is permanent and will continue to improve with wear. Enzyme-washed pieces require less break-in time than raw garments.',
    category: 'processes',
  },
  {
    handle: 'stone-wash',
    term_name: 'Stone Wash',
    seo_title: 'What Is Stone Wash? Fabric Guide | William Ashford',
    seo_description: 'Learn about stone washing — the garment finishing technique that creates a worn, vintage look in denim and cotton trousers.',
    short_definition: 'Stone washing is a garment finishing process where clothing is tumbled with pumice stones in industrial washing machines. This creates natural-looking fading, soft texture, and a vintage aesthetic.',
    full_definition: 'Stone washing became famous in the 1980s when it revolutionised the denim industry. The process involves placing garments in large industrial washers with pumice stones (volcanic rock). As the stones tumble against the fabric, they abrade the surface, removing dye unevenly and creating a natural faded pattern.\n\nThe result is a garment with unique character — high-wear areas like pocket edges, seams, and knees show more fading, mimicking years of natural wear.\n\nModern variations include: traditional stone wash (pumice stones only), acid stone wash (stones soaked in bleach solution for more dramatic fading), and enzyme stone wash (combining stones with enzymes for softer results).\n\nFor cargo pants, a light stone wash can create an attractive vintage military aesthetic without making the garment look too distressed.',
    properties: 'Appearance: Vintage fading with natural wear patterns\nSoftness: Significantly softer than untreated fabric\nDurability: Slightly reduced — surface abrasion removes fibre\nUniqueness: Each piece fades slightly differently\nWeight: May reduce fabric weight slightly',
    care_tips: 'Stone-washed garments have already undergone significant treatment. Wash cold to prevent further fading. The vintage look will deepen naturally with wear. Avoid bleach as the fabric is already more porous.',
    category: 'processes',
  },
  {
    handle: 'mercerized-cotton',
    term_name: 'Mercerized Cotton',
    seo_title: 'What Is Mercerized Cotton? | William Ashford',
    seo_description: 'Discover mercerized cotton — a treated cotton with enhanced lustre, strength, and dye uptake. Learn why it is used in premium clothing.',
    short_definition: 'Mercerized cotton is cotton that has been treated with sodium hydroxide (caustic soda) under tension to permanently change the fibre structure. This produces a smoother, lustrous surface with better dye absorption and increased strength.',
    full_definition: 'Mercerization was invented by John Mercer in 1844 and refined by Horace Lowe in 1890. The process involves immersing cotton yarn or fabric in a sodium hydroxide solution while under tension, then neutralising with acid.\n\nThis chemical treatment causes the cotton fibres to swell and straighten permanently. The round cross-section of untreated cotton becomes more circular, increasing the surface area that reflects light. The result is a noticeable sheen and lustre.\n\nMercerized cotton also absorbs dye more readily, producing deeper, more vibrant colours that resist fading. The treatment increases tensile strength by up to 25%, making the fabric more durable.\n\nIn trousers, mercerized cotton is used in dressier chinos and premium pants where a refined appearance is desired. The smoother surface resists pilling and holds its shape better than standard cotton.',
    properties: 'Lustre: High — distinctive sheen\nStrength: 25% stronger than untreated cotton\nDye uptake: Superior — deeper, more vibrant colours\nPilling resistance: Excellent\nCost: Higher than standard cotton due to processing',
    care_tips: 'Machine wash cold. The mercerized finish is permanent and does not wash out. Avoid chlorine bleach. Iron on cotton setting for a polished look. The lustre may dull slightly over time but remains superior to standard cotton.',
    category: 'processes',
  },
  {
    handle: 'brushed-twill',
    term_name: 'Brushed Twill',
    seo_title: 'What Is Brushed Twill? Soft Fabric Guide | William Ashford',
    seo_description: 'Learn about brushed twill — a mechanically softened cotton twill that offers a flannel-like feel. Perfect for cold weather trousers.',
    short_definition: 'Brushed twill is cotton twill fabric that has been mechanically brushed to raise the surface fibres, creating a soft, slightly fuzzy texture similar to flannel. This adds warmth and a luxurious hand-feel.',
    full_definition: 'Brushed twill starts as regular cotton twill fabric, which is then passed through rotating wire brushes in a process called napping or brushing. The brushes pull surface fibres out of the weave, creating a raised pile on one or both sides of the fabric.\n\nThe result is a fabric that looks like twill but feels like flannel — soft to the touch with a slight fuzziness. The raised fibres also trap air, adding insulation and making brushed twill warmer than standard twill.\n\nBrushed twill is particularly popular for autumn and winter chinos and trousers. It pairs the structured appearance of twill with the comfort and warmth of a flannel shirt fabric. The brushing can range from light (subtle softness) to heavy (almost fleece-like texture).',
    properties: 'Softness: Very soft — flannel-like hand-feel\nWarmth: Enhanced — raised fibres trap insulating air\nAppearance: Subtle matte finish, slightly fuzzy\nWeight: Slightly heavier than standard twill\nSeason: Best for autumn/winter wear',
    care_tips: 'Wash cold and inside out to protect the brushed surface. Tumble dry on low. Avoid harsh detergents that can flatten the raised fibres. The brushed texture may reduce slightly with washing but remains soft.',
    category: 'weave-types',
  },
  {
    handle: 'moisture-wicking-fabric',
    term_name: 'Moisture-Wicking Fabric',
    seo_title: 'What Is Moisture-Wicking Fabric? | William Ashford',
    seo_description: 'Learn about moisture-wicking fabrics — how they pull sweat away from skin and keep you dry. Essential for active and summer trousers.',
    short_definition: 'Moisture-wicking fabrics are engineered to pull sweat away from the skin surface and spread it across a larger area for faster evaporation. This keeps the wearer drier and more comfortable during physical activity or warm weather.',
    full_definition: 'Moisture-wicking works through capillary action — the fabric fibres are designed (or treated) to draw moisture from the skin side to the outer surface through tiny channels. Once spread across the outer surface, the moisture evaporates faster.\n\nSynthetic fibres like polyester and nylon are naturally better at wicking because they do not absorb water themselves — they channel it along their surface. Cotton absorbs water into the fibre itself, which is why a wet cotton shirt feels heavy and stays damp.\n\nHowever, treated cotton can wick moisture effectively. Chemical treatments or fibre engineering can enhance cotton\'s wicking ability while maintaining its natural breathability and comfort. Cotton-synthetic blends often offer the best combination.\n\nFor trousers, moisture-wicking properties are most important in summer wear, travel pants, and any garment worn during physical activity.',
    properties: 'Primary function: Moves sweat from skin to fabric surface\nBest materials: Polyester, nylon, treated cotton blends\nDrying speed: Significantly faster than standard fabrics\nComfort: Keeps skin drier during activity\nDurability: Treatment may reduce with repeated washing',
    care_tips: 'Avoid fabric softener — it coats fibres and blocks the wicking channels. Wash cold. Air dry when possible. If wicking performance decreases over time, a sport-specific detergent can help restore it.',
    category: 'terminology',
  },
  {
    handle: 'anti-pilling',
    term_name: 'Anti-Pilling',
    seo_title: 'What Is Anti-Pilling Fabric? | William Ashford',
    seo_description: 'Learn about anti-pilling fabric treatments and why they matter for keeping your trousers looking new longer.',
    short_definition: 'Anti-pilling refers to fabric treatments or fibre engineering that prevents the formation of small fabric balls (pills) on the surface of clothing caused by friction during wear and washing.',
    full_definition: 'Pilling occurs when short fibres on the fabric surface tangle together through friction, forming small balls that cling to the fabric. It is one of the most common complaints in clothing quality — even expensive garments can pill if the fabric is not properly engineered.\n\nAnti-pilling approaches include: selecting longer staple cotton fibres (which are less likely to loosen and tangle), tighter weave construction (which locks fibres in place), singeing (burning off surface fuzz), mercerization (which smooths fibres), and chemical treatments that strengthen fibre attachment.\n\nIn premium trousers, anti-pilling is achieved primarily through fabric quality — longer staple cotton, tighter weaves, and proper finishing. William Ashford selects fabrics that naturally resist pilling rather than relying on chemical treatments that may wash out.',
    properties: 'Problem: Small balls form on fabric surface from friction\nCauses: Short fibres, loose weave, friction during wear/washing\nSolutions: Long staple cotton, tight weave, mercerization, singeing\nFabric quality indicator: Low pilling = higher quality fabric\nAreas most affected: Inner thighs, seat, waistband — high-friction zones',
    care_tips: 'Turn garments inside out before washing to reduce surface friction. Use a gentle cycle. Avoid washing with rough fabrics like towels. If pills form, use a fabric shaver to remove them — do not pull them off by hand.',
    category: 'terminology',
  },
  {
    handle: 'od-dyeing',
    term_name: 'Overdyeing (OD)',
    seo_title: 'What Is Overdyeing? Fabric Colour Guide | William Ashford',
    seo_description: 'Learn about overdyeing (OD) — a technique of dyeing fabric over an existing colour to create unique, rich tones in premium garments.',
    short_definition: 'Overdyeing (OD) is a technique where fabric or a finished garment is dyed over an existing colour to create new, complex colour tones. This produces deeper, richer colours with subtle variations that single dyeing cannot achieve.',
    full_definition: 'Overdyeing involves applying a second (or third) dye colour on top of an existing base colour. Because the two colours interact, the resulting shade has more depth and complexity than a single-dye process can produce.\n\nFor example, overdyeing yellow cotton with blue dye creates a rich olive green that has more character than directly dyeing olive. The slight unevenness of the overdye creates subtle tonal variations that give the garment visual interest.\n\nThis technique is popular in military-inspired fashion because original military garments were often overdyed for camouflage purposes. Many premium cargo pant brands use overdyeing to achieve authentic-looking olive, khaki, and earth tones.\n\nOverdyeing can be done at the fabric stage (piece overdyeing) or after the garment is constructed (garment overdyeing). Garment overdyeing produces more variation as different parts of the construction absorb dye differently.',
    properties: 'Colour depth: Richer and more complex than single dyeing\nVariation: Subtle tonal differences across the garment\nAuthenticity: Mimics natural wear and military dyeing\nCost: Higher due to multiple dye stages\nUniqueness: Each batch may vary slightly in tone',
    care_tips: 'Wash cold and separately for the first few washes — some excess dye may release. The colour will develop a beautiful patina over time. Avoid bleach. Cold water preserves the complex colour tones.',
    category: 'processes',
  },
  {
    handle: 'twill-weave-vs-plain-weave',
    term_name: 'Twill Weave vs Plain Weave',
    seo_title: 'Twill vs Plain Weave — Fabric Comparison | William Ashford',
    seo_description: 'Understand the difference between twill weave and plain weave fabrics. Learn which is better for trousers, durability, and comfort.',
    short_definition: 'Twill weave creates a diagonal pattern by passing weft threads over multiple warp threads, producing a durable, drape-friendly fabric. Plain weave interlaces threads one-over-one, creating a lighter, more breathable but less durable fabric.',
    full_definition: 'The two most fundamental weave patterns in textile production are plain weave and twill weave. The weave pattern determines nearly everything about how a fabric looks, feels, and performs.\n\nPlain weave is the simplest pattern: each weft thread passes over one warp thread, then under the next, alternating throughout. This creates a balanced, symmetrical fabric. Examples include muslin, broadcloth, and oxford cloth.\n\nTwill weave offsets each row by one thread, creating the characteristic diagonal line. Each weft thread passes over two or more warp threads before going under one, and each subsequent row shifts by one position. Examples include denim, chino fabric, and gabardine.\n\nFor trousers, twill weave is almost universally preferred because it is more durable, drapes better, and resists wrinkles more effectively than plain weave. This is why chinos, cargo pants, and dress trousers are all made with twill-weave fabrics.',
    properties: 'Twill: Diagonal lines visible, more durable, better drape, wrinkle-resistant\nPlain: Flat texture, lighter weight, more breathable, wrinkles more easily\nDurability: Twill wins (threads are packed more tightly)\nBreathability: Plain weave wins (more open structure)\nCost: Similar — both are efficient to produce',
    care_tips: 'Both weave types are easy to care for in cotton form. Twill fabrics may take slightly longer to dry due to their denser construction. Plain weave may require more ironing as it wrinkles more readily.',
    category: 'weave-types',
  },
  {
    handle: 'sanforization',
    term_name: 'Sanforization (Pre-Shrinking)',
    seo_title: 'What Is Sanforization? Pre-Shrunk Fabric | William Ashford',
    seo_description: 'Learn about sanforization — the pre-shrinking process that ensures your pants fit the same after washing. Why it matters for quality.',
    short_definition: 'Sanforization is a controlled pre-shrinking process that limits residual shrinkage of cotton fabric to less than 1%. It ensures garments maintain their size and fit after washing.',
    full_definition: 'Sanforization was patented by Sanford Cluett in 1930 and solved one of cotton\'s biggest problems — shrinkage. Untreated cotton can shrink 8-10% after washing, meaning a pair of pants that fits perfectly in the store could be unwearably tight after the first wash.\n\nThe sanforization process works by mechanically compressing the fabric using a rubber belt, heat, and moisture. The fabric is compressed along its length and width, pre-empting the shrinkage that would otherwise occur during washing.\n\nAfter sanforization, the fabric has less than 1% residual shrinkage — meaning your waist 32 pants will still be waist 32 after washing.\n\nVirtually all quality trousers today are made from sanforized fabric. If a brand does not sanforize their cotton fabric, it is a red flag for quality. William Ashford uses sanforized cotton across all product lines.',
    properties: 'Residual shrinkage: Less than 1% (vs 8-10% unsanforized)\nFit consistency: Garments maintain size after washing\nProcess: Mechanical compression with heat and moisture\nCost: Minimal additional cost per metre\nStandard: Expected in all quality cotton garments',
    care_tips: 'Sanforized garments are already pre-shrunk, so you can wash them normally without worrying about size changes. Follow the standard care instructions for the base fabric type.',
    category: 'processes',
  },
  {
    handle: 'gabardine-fabric',
    term_name: 'Gabardine',
    seo_title: 'What Is Gabardine Fabric? | William Ashford',
    seo_description: 'Learn about gabardine — the tightly woven twill fabric famous for its smooth finish, water resistance, and use in premium trousers.',
    short_definition: 'Gabardine is a tightly woven twill fabric with a smooth face and a distinctive steep diagonal rib. Originally made from worsted wool by Thomas Burberry, gabardine is now produced in cotton and synthetic versions for trousers and outerwear.',
    full_definition: 'Gabardine was invented by Thomas Burberry in 1879, originally as a water-resistant outerwear fabric. The key to gabardine is its extremely tight twill weave with a higher thread count than standard twill, producing a smooth, almost polished face.\n\nThe steep diagonal rib (typically 63 degrees vs the standard 45 degrees of regular twill) gives gabardine its distinctive appearance. The tight weave naturally resists water penetration and wind.\n\nCotton gabardine is widely used in chinos and dress trousers. It has a smoother, more refined appearance than regular cotton twill, making it suitable for business and smart-casual settings. The fabric holds creases well and resists wrinkles.\n\nGabardine represents the dressier end of the twill family — if regular cotton twill is your everyday fabric, gabardine is the version you reach for when you need to look polished.',
    properties: 'Weave: Steep-angle twill (63°) — tighter than standard twill\nSurface: Smooth, almost polished face\nWater resistance: Naturally repels light rain\nStructure: Excellent — holds creases and shape\nDressiness: The most refined twill fabric',
    care_tips: 'Dry clean recommended for wool gabardine. Cotton gabardine can be machine washed cold on a gentle cycle. Iron on the reverse side to maintain the smooth face. Hang after wearing to release wrinkles naturally.',
    category: 'fabric-types',
  },
];

async function main() {
  console.log('=== Creating Glossary Terms Batch 2 (15 terms) ===\n');

  let created = 0;
  for (const term of terms) {
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
      metaobject: { type: 'fabric_glossary_term', handle: term.handle, fields },
    });

    const data = result.data?.metaobjectCreate;
    if (data?.userErrors?.length > 0) {
      console.log(`  ⚠`, data.userErrors.map(e => e.message).join(', '));
    } else if (data?.metaobject) {
      console.log(`  ✓ ${data.metaobject.handle}`);
      created++;
    }
    await sleep(400);
  }

  console.log(`\n=== Created ${created}/${terms.length} glossary terms ===`);
}

main().catch(console.error);
