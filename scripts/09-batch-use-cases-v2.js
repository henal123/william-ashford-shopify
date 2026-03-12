/**
 * Batch 2: Additional Use Case Guides (15 new)
 */
const { graphql, sleep } = require('./shopify-api');

const CREATE_METAOBJECT = `
mutation CreateMetaobject($metaobject: MetaobjectCreateInput!) {
  metaobjectCreate(metaobject: $metaobject) {
    metaobject { id handle }
    userErrors { field message }
  }
}`;

const useCases = [
  {
    handle: 'cargo-pants-for-gym',
    heading: 'Can You Wear Cargo Pants to the Gym?',
    seo_title: 'Cargo Pants for Gym — Worth It? | William Ashford',
    seo_description: 'Should you wear cargo pants to the gym? Pros, cons, and when cargos work for workouts vs when gym wear is better.',
    intro_text: 'Cargo pants at the gym is a growing trend — especially in street-gym culture. But is it practical? Here is an honest breakdown of when it works and when you should stick to proper gym wear.',
    occasion: 'Gym & Fitness',
    style_tips: 'Light cotton cargos work fine for strength training and low-intensity workouts\nAvoid heavy twill cargos for cardio — they trap heat\nChoose cargos with stretch fabric if training legs\nBlack cargos hide sweat stains best\nPair with a fitted tank or performance tee\nWear training shoes, not fashion sneakers',
    recommended_pieces: 'Lightweight cotton cargo pants in black\nMoisture-wicking performance t-shirt\nTraining shoes with flat soles for lifting\nCrossbody bag for phone and essentials',
    dos_and_donts: 'DO: Choose cargos with some stretch for mobility\nDO: Wear them for lifting, yoga, or casual gym sessions\nDON\'T: Run on the treadmill in heavy cotton cargos\nDON\'T: Wear cargos for HIIT or spinning classes\nDON\'T: Use cargo pockets during exercise — items will bounce',
    category: 'occasions',
  },
  {
    handle: 'cargo-pants-for-hiking',
    heading: 'Cargo Pants for Hiking: The Perfect Trail Companion',
    seo_title: 'Cargo Pants for Hiking | William Ashford',
    seo_description: 'Why cargo pants are great for hiking. Trail tips, what to carry in cargo pockets, and how to choose the right pair for outdoor adventures.',
    intro_text: 'Cargo pants were born for the outdoors. The combination of durable fabric, functional pockets, and full leg coverage makes them one of the best trouser choices for hiking and trekking.',
    occasion: 'Hiking & Trekking',
    style_tips: 'Choose cargo pants in earthy tones — olive, khaki, or dark brown\nRoll cuffs above ankle-height hiking boots\nUse cargo pockets strategically: phone in zip pocket, snacks in side pocket, map/compass accessible\nLayer with a moisture-wicking base and a windbreaker on top\nWear proper hiking socks — not fashion ankle socks',
    recommended_pieces: 'William Ashford Rugged Zip Cargo Pants in Olive\nMoisture-wicking tee or merino wool base layer\nLightweight windbreaker\nAnkle-height hiking boots\nWide-brim hat for sun protection',
    dos_and_donts: 'DO: Choose heavier weight cargos (280+ GSM) for trail durability\nDO: Use zip pockets for valuables on the trail\nDO: Cuff above boot height to prevent snagging\nDON\'T: Wear baggy cargos that catch on branches\nDON\'T: Choose white or light colours for trail use\nDON\'T: Overload one side — distribute weight between pockets evenly',
    category: 'occasions',
  },
  {
    handle: 'cargo-pants-for-monsoon',
    heading: 'What to Wear in Monsoon: Cargo Pants Rain Guide',
    seo_title: 'Monsoon Style — Cargo Pants Rain Guide | William Ashford',
    seo_description: 'How to wear cargo pants in Indian monsoon. Fabric choices, quick-dry tips, and rainy season outfit ideas for men.',
    intro_text: 'The Indian monsoon is brutal on clothing — constant rain, humidity, and muddy streets. The right cargo pants can handle it all if you know what to look for.',
    occasion: 'Monsoon Season',
    style_tips: 'Choose dark colours that hide water marks and mud splashes\nRoll cuffs above ankle height to avoid dragging through puddles\nPair with quick-dry sandals or waterproof shoes — not leather\nWear a light rain jacket or quick-dry windbreaker on top\nKeep phone and wallet in zip-closure cargo pockets — essential in rain',
    recommended_pieces: 'William Ashford Rugged Zip Cargo Pants in Black (darkest colour, hides stains)\nQuick-dry t-shirt in polyester blend\nPackable rain jacket\nWaterproof sandals or rubber-sole shoes\nSmall waterproof pouch for electronics',
    dos_and_donts: 'DO: Choose zip-pocket cargos — flap pockets let water in\nDO: Have a dedicated monsoon pair of cargos you do not mind getting muddy\nDO: Wash monsoon cargos after every 1-2 wears to prevent mildew\nDON\'T: Wear light-coloured cargos — they go transparent when wet\nDON\'T: Wear heavy canvas cargos — they take forever to dry\nDON\'T: Forget to check for mould/mildew if storing damp cargos',
    category: 'occasions',
  },
  {
    handle: 'chinos-for-interview',
    heading: 'What Chinos to Wear to a Job Interview',
    seo_title: 'Chinos for Job Interview — Style Guide | William Ashford',
    seo_description: 'Can you wear chinos to a job interview? Yes — learn which colours, fits, and pairings make chinos interview-appropriate.',
    intro_text: 'Chinos are one of the best interview trousers — more comfortable than dress pants but polished enough for most modern workplaces. Here is how to style them for that first impression.',
    occasion: 'Job Interview',
    style_tips: 'Navy or charcoal chinos are the safest interview colours — avoid khaki (too casual)\nPair with a well-fitted Oxford shirt in white or light blue\nAdd a structured blazer if the company has a business-casual or formal culture\nLeather belt that matches shoe colour (brown or black)\nClean, polished leather shoes — derbies, loafers, or minimalist leather sneakers\nEnsure chinos are freshly pressed with a clean crease',
    recommended_pieces: 'William Ashford Refined Everyday Chinos in Navy\nWhite or light blue Oxford button-down shirt\nNavy or grey unstructured blazer\nBrown leather derbies or clean loafers\nLeather belt in matching shade\nMinimalist watch',
    dos_and_donts: 'DO: Iron or steam chinos the night before — wrinkles signal carelessness\nDO: Check for lint and pet hair before leaving\nDO: Ensure the fit is clean — no bunching at the ankles, no excess at the waist\nDON\'T: Wear chinos with graphic tees or hoodies to an interview\nDON\'T: Choose bold colours like red, green, or mustard\nDON\'T: Wear cargo pants to a formal interview — save cargos for casual offices',
    category: 'occasions',
  },
  {
    handle: 'olive-cargo-outfits',
    heading: '7 Outfit Ideas for Olive Cargo Pants',
    seo_title: 'Olive Cargo Pants Outfits — 7 Ideas | William Ashford',
    seo_description: 'Style olive cargo pants 7 different ways. From casual to layered looks, get outfit inspiration for olive cargos.',
    intro_text: 'Olive is the most classic cargo pant colour — rooted in military heritage and endlessly versatile with earth tones and neutrals. Here are 7 proven outfit formulas.',
    occasion: 'Multi-Occasion Styling',
    style_tips: 'Look 1 — Classic Casual: Olive cargos + white tee + white sneakers. The cleanest, simplest look.\nLook 2 — Earthy Layers: Olive cargos + beige hoodie + brown bomber jacket.\nLook 3 — All Neutral: Olive cargos + cream knit sweater + tan Chelsea boots.\nLook 4 — Contrast Pop: Olive cargos + black fitted tee + black boots. High contrast.\nLook 5 — Smart Street: Olive cargos + grey Oxford shirt + clean leather sneakers.\nLook 6 — Weekend Adventure: Olive cargos + flannel shirt (open) + plain tee underneath.\nLook 7 — Summer Vibes: Olive cargos (cuffed) + linen camp-collar shirt + canvas slip-ons.',
    recommended_pieces: 'William Ashford Rugged Zip Cargo Pants in Olive\nWhite crew-neck t-shirts (stock 3-4)\nBeige or cream hoodie\nBrown bomber or overshirt\nWhite sneakers and tan/brown boots',
    dos_and_donts: 'DO: Stick to earthy, neutral, and monochrome colour palettes with olive\nDO: Use white as your go-to contrast colour\nDO: Layer textures — cotton cargos + knit sweater + leather jacket\nDON\'T: Pair olive with bright blue or red — the colours clash\nDON\'T: Go head-to-toe olive/green — you will look like a uniform\nDON\'T: Pair with other military-green pieces unless intentionally going full military',
    category: 'style-guides',
  },
  {
    handle: 'khaki-cargo-outfits',
    heading: 'How to Style Khaki Cargo Pants: 6 Outfit Ideas',
    seo_title: 'Khaki Cargo Pants Outfits | William Ashford',
    seo_description: 'Style khaki cargo pants 6 ways. Outfit ideas from casual to smart-casual for the classic sandy cargo colour.',
    intro_text: 'Khaki (sand/beige) cargo pants are the lightest neutral option — perfect for summer and warm-weather styling. They are more casual than olive or black but bring a relaxed, approachable energy.',
    occasion: 'Multi-Occasion Styling',
    style_tips: 'Look 1 — Summer Basic: Khaki cargos + navy tee + white sneakers.\nLook 2 — Safari Vibes: Khaki cargos + linen shirt in cream + suede boots.\nLook 3 — Cool Contrast: Khaki cargos + black tee + black high-top sneakers.\nLook 4 — Preppy Casual: Khaki cargos + navy polo shirt + tan loafers.\nLook 5 — Layered Autumn: Khaki cargos + burgundy crew-neck sweater + denim jacket.\nLook 6 — Weekend Easy: Khaki cargos + grey hoodie + running sneakers.',
    recommended_pieces: 'William Ashford Rugged Zip Cargo Pants in Khaki\nNavy and black fitted t-shirts\nLinen shirt in white or cream\nNavy polo shirt\nWhite sneakers and tan suede shoes',
    dos_and_donts: 'DO: Pair khaki with darker colours (navy, black, burgundy) for contrast\nDO: Keep the rest of the outfit slightly dressier to offset khaki\'s casual vibe\nDO: Roll cuffs in summer for a relaxed, seasonal look\nDON\'T: Pair khaki with other beige/cream pieces — the outfit will look washed out\nDON\'T: Wear khaki cargos in the rain — they show water marks badly\nDON\'T: Choose khaki for high-dirt situations — stains show easily',
    category: 'style-guides',
  },
  {
    handle: 'cargo-pants-winter-styling',
    heading: 'How to Wear Cargo Pants in Winter',
    seo_title: 'Winter Cargo Pants Style Guide | William Ashford',
    seo_description: 'How to style cargo pants in winter. Layering tips, boot pairings, and cold weather outfit ideas for cargo pants.',
    intro_text: 'Cargo pants are year-round staples — and in winter, the combination of sturdy fabric, full leg coverage, and functional pockets makes them even more practical. Here is how to layer them for colder months.',
    occasion: 'Winter / Cold Weather',
    style_tips: 'Layer with a thermal base if temperatures drop below 10°C\nChoose heavier weight cargos (280+ GSM) for added warmth\nPair with chunky boots — combat boots, hiking boots, or Chelsea boots\nTop with a puffer jacket, wool overcoat, or shearling-lined bomber\nUse cargo pockets for gloves, tissues, and hand warmer packets\nDark colours (black, charcoal, dark olive) work best in winter',
    recommended_pieces: 'William Ashford Rugged Zip Cargo Pants in Black or Olive\nThermal crew-neck undershirt\nWool or fleece sweater for mid-layer\nPuffer jacket or wool overcoat\nChunky boots with good sole grip\nBeanie and gloves',
    dos_and_donts: 'DO: Tuck cargos into boots or cuff above boot height for a clean winter look\nDO: Layer warmth on top — cargos provide structure, jackets provide insulation\nDO: Use zip pockets to keep cold hands warm\nDON\'T: Wear lightweight summer cargos in winter\nDON\'T: Let cargos drag in wet/snowy conditions — cuff or tuck\nDON\'T: Skip the belt — winter jackets lift waistlines and can expose the gap',
    category: 'style-guides',
  },
  {
    handle: 'festival-outfit-cargos',
    heading: 'Festival Outfit Ideas With Cargo Pants',
    seo_title: 'Festival Outfits With Cargo Pants | William Ashford',
    seo_description: 'Stand out at music festivals with cargo pants. Outfit ideas, practical tips, and why cargos are the perfect festival wear.',
    intro_text: 'Music festivals demand clothes that look great, handle crowds and weather, and carry your essentials without a bag. Cargo pants tick every box.',
    occasion: 'Music Festivals & Events',
    style_tips: 'Cargos let you go bag-free — phone, wallet, tickets all fit in cargo pockets\nChoose bold colours or unique details to stand out in the crowd\nPair with a graphic tee or band shirt for the festival vibe\nLayer with a lightweight jacket you can tie around your waist when it gets hot\nWear comfortable shoes you can stand in all day — broken-in sneakers or boots',
    recommended_pieces: 'William Ashford Rugged Zip Cargo Pants (any colour)\nBold graphic tee or vintage band shirt\nLightweight windbreaker or flannel overshirt\nBroken-in sneakers or canvas boots\nSunglasses and a cap/bucket hat',
    dos_and_donts: 'DO: Use zip pockets for phone and wallet — crowds mean pickpocket risk\nDO: Wear shoes that can handle dirt, grass, and standing for hours\nDO: Bring a lightweight layer — evenings get cold at outdoor events\nDON\'T: Wear brand new shoes — break them in first\nDON\'T: Bring a backpack if your cargos can carry everything you need\nDON\'T: Wear white cargos to a muddy outdoor festival',
    category: 'occasions',
  },
  {
    handle: 'best-cargo-pants-under-1500',
    heading: 'Best Cargo Pants Under ₹1,500 in India',
    seo_title: 'Best Cargo Pants Under ₹1500 in India | William Ashford',
    seo_description: 'Find the best cargo pants under ₹1,500 in India. What to look for in quality, fabric, and fit at this price range.',
    intro_text: 'The ₹1,000–1,500 range is the sweet spot for quality cargo pants in India. You can avoid the cheap market options that fall apart in weeks while not overspending. Here is what to look for and expect at this price.',
    occasion: 'Buying Guide',
    style_tips: 'At ₹1,500, expect 240-280 GSM cotton or cotton-blend fabric\nLook for reinforced stitching at pocket corners and seams\nZip closures on cargo pockets indicate better construction\nTest the zipper — it should feel smooth, not stiff or flimsy\nCheck the inside seam finishing — clean serging indicates quality\nStretch fabric (cotton + 2-5% elastane) is worth seeking at this price',
    recommended_pieces: 'William Ashford Rugged Zip Cargo Pants — premium quality at an accessible price\nLook for 100% cotton or cotton-elastane blends\nAvoid 100% polyester cargos at any price\nCheck for YKK or equivalent branded zippers',
    dos_and_donts: 'DO: Buy from brands that list fabric composition\nDO: Check the return policy before buying\nDO: Read reviews focusing on durability after 3+ months of wear\nDON\'T: Buy cargos that don\'t specify fabric weight or composition\nDON\'T: Expect the same quality as ₹3,000+ branded options\nDON\'T: Buy based on photos alone — check sizing charts carefully',
    category: 'buying-guides',
  },
  {
    handle: 'best-cargo-pants-for-summer-india',
    heading: 'Best Cargo Pants for Indian Summer: Beat the Heat',
    seo_title: 'Best Summer Cargo Pants for India | William Ashford',
    seo_description: 'Find the best cargo pants for Indian summers. Lightweight fabrics, breathable designs, and heat-beating style tips.',
    intro_text: 'Indian summers push temperatures above 40°C in many cities. The right cargo pants can still be comfortable if you know what fabric weight, colour, and style to choose.',
    occasion: 'Summer / Hot Weather',
    style_tips: 'Choose lightweight cargos under 260 GSM for breathability\nLight colours (khaki, beige, light grey) reflect heat better than dark ones\nCuff above the ankle for extra airflow\nPair with breathable cotton or linen tops — avoid polyester\nLoose fits allow more air circulation than skin-tight styles\nConsider cotton-linen blend cargos if available',
    recommended_pieces: 'William Ashford Rugged Zip Cargo Pants in Khaki or lighter colourway\nBreathable cotton crew-neck t-shirts\nLinen or cotton camp-collar shirt\nCanvas slip-ons or breathable mesh sneakers\nCap or bucket hat for sun protection',
    dos_and_donts: 'DO: Prioritise cotton and natural fibre cargos in summer\nDO: Carry a water bottle in a cargo pocket — stay hydrated\nDO: Wash cargos more frequently in summer — sweat and body oils degrade fabric faster\nDON\'T: Wear heavy canvas or 300+ GSM cargos in 40°C heat\nDON\'T: Choose black for daytime summer wear — it absorbs maximum heat\nDON\'T: Wear cargos with heavy boots in summer — choose lighter footwear',
    category: 'buying-guides',
  },
  {
    handle: 'how-to-choose-cargo-pants',
    heading: 'How to Choose Cargo Pants: Complete Buyer\'s Guide',
    seo_title: 'How to Choose Cargo Pants | William Ashford',
    seo_description: 'Complete guide to buying cargo pants. Fabric, fit, pockets, and quality indicators to help you find the perfect pair.',
    intro_text: 'With hundreds of cargo pant options available online and in stores, how do you find the right pair? This guide covers every factor — from fabric to fit to pocket design — so you make a confident choice.',
    occasion: 'Buying Guide',
    style_tips: 'Fabric: Look for 240-320 GSM cotton or cotton-blend. Avoid 100% polyester.\nFit: Tapered is the most versatile modern fit. Try it first.\nRise: Mid-rise (9-10 inches) works for most body types.\nPocket design: Zip closures are more secure and look cleaner than flaps.\nColour: Start with black (most versatile), then add olive or khaki.\nStitching: Check seams at pockets, crotch, and knees — these are stress points.\nZippers: Should be smooth and branded (YKK is the gold standard).\nWaistband: Should sit comfortably without a belt — elastic-back waistbands add comfort.',
    recommended_pieces: 'William Ashford Rugged Zip Cargo Pants — ticks every quality checkbox\nStart with one pair in black, then expand to olive and khaki\nBuy your actual waist size — don\'t size up or down without trying',
    dos_and_donts: 'DO: Try on cargos if possible — sit down, walk, squat to test mobility\nDO: Check the return policy before buying online\nDO: Read the fabric composition — it should be clearly listed\nDON\'T: Buy the cheapest option — you\'ll replace it in months\nDON\'T: Choose a colour just because it\'s trendy — versatility matters more\nDON\'T: Ignore the fit — a great fabric in the wrong fit still looks bad',
    category: 'buying-guides',
  },
  {
    handle: 'cargo-pants-size-guide',
    heading: 'Cargo Pants Size Guide: How to Find Your Perfect Fit',
    seo_title: 'Cargo Pants Size Guide — Fit Tips | William Ashford',
    seo_description: 'Find your cargo pants size. Measure your waist and hips correctly, understand fit types, and get the perfect fit every time.',
    intro_text: 'Getting the right size is the single biggest factor in how good cargo pants look on you. Too tight looks uncomfortable; too loose looks sloppy. Here is how to measure yourself and choose the right size.',
    occasion: 'Buying Guide',
    style_tips: 'Waist measurement: Measure at the narrowest point of your natural waist (above hip bones)\nHip measurement: Measure at the widest point of your hips/seat\nInseam: Measure from the crotch seam to where you want the pants to end\nAlways refer to the brand\'s size chart — sizes vary between brands\nIf between sizes: size up for relaxed fit, size down for slim fit\nConsider the fabric: stretch cotton is more forgiving than non-stretch',
    recommended_pieces: 'Use a soft measuring tape — not a metal one\nMeasure in your underwear for accuracy\nMeasure twice for confidence\nRefer to William Ashford size chart at williamashford.in/pages/size-chart',
    dos_and_donts: 'DO: Measure yourself rather than guessing based on other brands\nDO: Check the size chart every time you buy from a new brand\nDO: Consider that different fits (slim vs relaxed) may need different sizes\nDON\'T: Assume your jeans size is your cargo pants size\nDON\'T: Buy without checking the return/exchange policy\nDON\'T: Force a too-tight fit — comfort matters for all-day wear',
    category: 'buying-guides',
  },
  {
    handle: 'cargo-pants-fabric-guide',
    heading: 'Cargo Pants Fabric Guide: Which Material Is Best?',
    seo_title: 'Cargo Pants Fabric Guide | William Ashford',
    seo_description: 'Compare cargo pants fabrics — cotton twill, ripstop, canvas, nylon, and stretch blends. Find the best fabric for your needs.',
    intro_text: 'The fabric of your cargo pants determines how they feel, how long they last, and what activities they are suited for. Here is a breakdown of every common cargo pant fabric and when each excels.',
    occasion: 'Buying Guide',
    style_tips: 'Cotton Twill (best all-rounder): 240-300 GSM, breathable, comfortable, structured. Best for everyday wear.\nRipstop (best for durability): Grid-reinforced, tear-resistant, lighter weight. Best for outdoor and adventure.\nCanvas (heaviest duty): 280-400+ GSM, very sturdy, stiff when new. Best for heavy-duty workwear.\nStretch Cotton Blend (best comfort): Cotton + 2-5% elastane, flexible, moves with you. Best for slim-fit styles.\nNylon (best for rain/travel): Water-resistant, ultra-light, quick-dry. Best for technical/travel pants.\nPolyester (budget option): Wrinkle-resistant but hot and clammy. Best avoided for everyday wear.',
    recommended_pieces: 'William Ashford uses premium cotton twill and cotton-stretch blends\nFor everyday: Cotton twill (our Rugged Zip Cargo Pants)\nFor comfort: Cotton-stretch blend (ideal for slim and tapered fits)\nFor adventure: Look for ripstop or ripstop-blend cargos',
    dos_and_donts: 'DO: Prioritise cotton and cotton-blend fabrics for Indian weather\nDO: Check the fabric weight (GSM) — heavier is more durable but warmer\nDO: Choose stretch blends for slim-fit cargos — you need the mobility\nDON\'T: Buy 100% polyester cargos for daily wear — they trap heat\nDON\'T: Choose heavy canvas for summer — save it for winter\nDON\'T: Ignore fabric care instructions — the wrong wash ruins any fabric',
    category: 'buying-guides',
  },
];

async function main() {
  console.log('=== Creating Use Case Guides Batch 2 (15 guides) ===\n');
  let created = 0;
  for (const uc of useCases) {
    console.log(`Creating: ${uc.heading.substring(0, 55)}...`);
    const fields = Object.entries(uc)
      .filter(([key]) => key !== 'handle')
      .map(([key, value]) => ({ key, value }));
    fields.push({ key: 'last_updated', value: '2026-03-12' });

    const result = await graphql(CREATE_METAOBJECT, {
      metaobject: { type: 'use_case_guide', handle: uc.handle, fields },
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
  console.log(`\n=== Created ${created}/${useCases.length} use case guides ===`);
}

main().catch(console.error);
