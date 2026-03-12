/**
 * Step 5: Create Use Case Guide metaobjects
 * Powers /pages/[use-case] PSEO pages
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

const useCases = [
  {
    handle: 'cargo-pants-for-college',
    heading: 'How to Wear Cargo Pants to College',
    seo_title: 'Cargo Pants for College — Style Guide | William Ashford',
    seo_description: 'Style cargo pants for college with ease. Outfit ideas, colour combos, and tips for looking sharp on campus with cargo pants.',
    intro_text: 'College is where your personal style takes shape. Cargo pants are one of the most popular choices on campuses across India — they are comfortable for long lecture days, practical for carrying essentials, and deliver effortless street-style cool.',
    occasion: 'College / University',
    style_tips: 'Pair slim-fit cargos with a graphic tee and clean white sneakers for the classic campus look\nLayer with a zip hoodie or bomber jacket for cooler months\nStick to neutral cargo colours (black, olive, khaki) that mix with everything\nCuff the ankles slightly to show off your sneakers\nKeep the top half fitted — avoid baggy-on-baggy',
    recommended_pieces: 'William Ashford Rugged Zip Cargo Pants in Olive or Black\nA clean oversized t-shirt or fitted crew-neck\nWhite sneakers or Air Force 1-style shoes\nA minimal crossbody bag or backpack',
    dos_and_donts: 'DO: Roll or cuff cargos to ankle length for a clean finish\nDO: Mix textures — cotton cargos with a jersey hoodie\nDO: Keep shoes clean — dirty shoes ruin the whole look\nDON\'T: Overstuff cargo pockets — it ruins the silhouette\nDON\'T: Pair with formal shoes or dress shirts\nDON\'T: Wear cargos that are too long and dragging on the ground',
    category: 'occasions',
  },
  {
    handle: 'cargo-pants-for-travel',
    heading: 'Why Cargo Pants Are the Best Travel Pants',
    seo_title: 'Best Travel Pants: Cargo Pants Guide | William Ashford',
    seo_description: 'Discover why cargo pants are ideal for travel. Functional pockets, comfort, and style make them the ultimate travel companion.',
    intro_text: 'When packing for travel, every item needs to earn its place. Cargo pants are arguably the single most versatile trouser you can pack — functional pockets replace the need for a day bag, durable fabric handles any terrain, and they look good from airport to adventure.',
    occasion: 'Travel & Adventure',
    style_tips: 'Choose a dark colour (black or charcoal) that hides stains and dirt\nPair with a breathable cotton or linen shirt for warm destinations\nLayer with a lightweight jacket that packs down small\nWear comfortable walking shoes or travel-friendly sneakers\nUse cargo pockets strategically — phone, passport, wallet distributed across pockets',
    recommended_pieces: 'William Ashford Rugged Zip Cargo Pants in Black — the most versatile travel colour\nA breathable cotton crew-neck tee\nLightweight windbreaker or overshirt\nComfortable walking sneakers\nMinimalist belt',
    dos_and_donts: 'DO: Choose zip-pocket cargos for security while travelling\nDO: Pack two pairs of cargos for a week-long trip (one dark, one neutral)\nDO: Cuff ankles in hot weather for airflow\nDON\'T: Overload pockets — keep weight balanced left and right\nDON\'T: Choose white or light cargos for adventure travel\nDON\'T: Forget to check pocket contents before going through airport security',
    category: 'occasions',
  },
  {
    handle: 'cargo-pants-for-date-night',
    heading: 'How to Wear Cargo Pants on a Date Night',
    seo_title: 'Cargo Pants for Date Night — Style Tips | William Ashford',
    seo_description: 'Can you wear cargo pants on a date? Yes! Learn how to style cargo pants for a date night that is stylish, confident, and effortlessly cool.',
    intro_text: 'The days of cargo pants being strictly casual are over. With the right fit and styling, cargo pants deliver a confident, fashion-forward date-night look that stands out from the typical jeans-and-shirt uniform.',
    occasion: 'Date Night',
    style_tips: 'Choose black or dark olive slim-fit cargos — avoid baggy fits for date night\nPair with a well-fitted button-down shirt or a clean black crew-neck\nAdd Chelsea boots or minimal leather sneakers\nAccessorise with a simple watch and subtle cologne\nA fitted overshirt or blazer elevates the entire look\nKeep the colour palette to 2-3 tones maximum',
    recommended_pieces: 'William Ashford Rugged Zip Cargo Pants in Black\nFitted Oxford shirt or clean crew-neck in white/black\nChelsea boots in black or tan leather\nMinimalist leather watch\nA dark overshirt or lightweight bomber jacket',
    dos_and_donts: 'DO: Iron or steam your cargos — wrinkled pants kill the look\nDO: Make sure the fit is dialled in — tapered is best\nDO: Keep pockets relatively empty for a clean silhouette\nDON\'T: Wear graphic tees or loud prints — let the cargos be the statement\nDON\'T: Pair with athletic shoes or sandals\nDON\'T: Go too matchy — contrast textures and tones',
    category: 'occasions',
  },
  {
    handle: 'what-to-wear-with-chinos',
    heading: 'What to Wear With Chinos: Complete Style Guide',
    seo_title: 'What to Wear With Chinos — Men\'s Guide | William Ashford',
    seo_description: 'Complete guide to styling chinos for men. From casual to smart-casual, learn what tops, shoes, and layers pair perfectly with chinos.',
    intro_text: 'Chinos are the Swiss Army knife of menswear. They bridge the gap between jeans and dress pants, making them appropriate for almost any situation. The key to styling chinos well is matching the formality of the rest of your outfit to the occasion.',
    occasion: 'Everyday Versatile',
    style_tips: 'Casual: Chinos + t-shirt + white sneakers = the everyday uniform\nSmart-casual: Chinos + Oxford shirt + loafers = office to dinner\nSemi-formal: Chinos + button-down + blazer + leather shoes = interview ready\nWeekend: Chinos + hoodie + clean trainers = relaxed but put together\nAlways match the formality of your shoes to the occasion',
    recommended_pieces: 'William Ashford Refined Everyday Chinos in Khaki or Navy\nWhite or light blue Oxford button-down shirt\nClean white leather sneakers (casual) or brown loafers (smart-casual)\nCotton crew-neck sweater for layering\nUnstructured blazer in navy or grey for dressier occasions',
    dos_and_donts: 'DO: Ensure chinos are hemmed to the right length — no pooling at ankles\nDO: Use a leather belt that matches your shoe colour\nDO: Experiment with colour — navy, olive, and burgundy chinos add variety\nDON\'T: Pair with running shoes or athletic sneakers\nDON\'T: Go too formal — chinos with a suit jacket and tie looks odd\nDON\'T: Ignore the fit — baggy chinos look sloppy, skin-tight looks uncomfortable',
    category: 'style-guides',
  },
  {
    handle: 'how-to-style-black-cargo-pants',
    heading: 'How to Style Black Cargo Pants: 5 Outfit Ideas',
    seo_title: 'How to Style Black Cargo Pants | William Ashford',
    seo_description: '5 ways to style black cargo pants for men. From streetwear to smart-casual, get outfit inspiration for black cargos.',
    intro_text: 'Black cargo pants are the most versatile colour choice in the cargo family. They work across more occasions and pair with more colours than any other option. Here are five proven outfit formulas using black cargos.',
    occasion: 'Multi-Occasion Styling',
    style_tips: 'Look 1 — Monochrome: All-black with a fitted black tee and black boots. Add a silver chain for accent.\nLook 2 — Streetwear: Black cargos + oversized graphic tee + chunky white sneakers + crossbody bag.\nLook 3 — Smart-Casual: Black cargos + white Oxford shirt (untucked) + Chelsea boots + minimal watch.\nLook 4 — Layered: Black cargos + fitted hoodie + bomber jacket + clean sneakers.\nLook 5 — Summer: Black cargos (cuffed) + linen shirt + canvas slip-ons.',
    recommended_pieces: 'William Ashford Rugged Zip Cargo Pants in Black\nFitted crew-neck tees in white, black, and grey\nBlack Chelsea boots for dressy looks\nWhite sneakers for casual looks\nBomber jacket or overshirt for layering',
    dos_and_donts: 'DO: Invest in quality black cargos that don\'t fade to grey quickly\nDO: Keep shoes either very clean (white) or very dark (black)\nDO: Experiment with textures — black cargos + knit sweater is great\nDON\'T: Pair black cargos with navy — the dark tones clash\nDON\'T: Wear faded black cargos — they look worn out not vintage\nDON\'T: Go full goth — break up the black with one lighter piece',
    category: 'style-guides',
  },
  {
    handle: 'cargo-pants-for-work',
    heading: 'Can You Wear Cargo Pants to Work?',
    seo_title: 'Cargo Pants for Work — Office Style Guide | William Ashford',
    seo_description: 'Can you wear cargo pants to work? Learn when and how to style cargos for the office, casual Fridays, and creative workplaces.',
    intro_text: 'The short answer: it depends on your workplace. The longer answer: modern slim-fit cargo pants in neutral colours can absolutely work in casual and creative office environments. Here is how to navigate cargo pants at work.',
    occasion: 'Workplace / Office',
    style_tips: 'Choose slim-fit or tapered cargos in black, navy, or charcoal\nPair with a collared shirt — button-down or polo\nAdd leather shoes — loafers, derbies, or clean leather sneakers\nKeep cargo pockets flat and empty at the office\nA structured overshirt or blazer makes cargos office-appropriate instantly\nAvoid military colours (olive, camo) for corporate settings — stick to dark neutrals',
    recommended_pieces: 'William Ashford Rugged Zip Cargo Pants in Black\nSlim-fit polo shirt or Oxford button-down\nClean leather sneakers or minimalist derbies\nLeather belt in matching colour\nUnstructured blazer for meetings',
    dos_and_donts: 'DO: Check your company dress code first\nDO: Start with Casual Friday before wearing cargos all week\nDO: Keep the overall look polished — cargos need to be the only casual element\nDON\'T: Wear baggy or relaxed-fit cargos to work\nDON\'T: Pair with graphic tees or hoodies in the office\nDON\'T: Stuff pockets with items — it looks unprofessional',
    category: 'occasions',
  },
];

async function main() {
  console.log('=== Creating Use Case Guides ===\n');

  for (const uc of useCases) {
    console.log(`Creating: ${uc.heading.substring(0, 50)}...`);

    const fields = Object.entries(uc)
      .filter(([key]) => key !== 'handle')
      .map(([key, value]) => ({ key, value }));

    fields.push({ key: 'last_updated', value: '2026-03-12' });

    const result = await graphql(CREATE_METAOBJECT, {
      metaobject: {
        type: 'use_case_guide',
        handle: uc.handle,
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

  console.log(`\n=== Created ${useCases.length} use case guides ===`);
}

main().catch(console.error);
