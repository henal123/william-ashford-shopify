/**
 * Batch 2: Additional Style Comparisons (12 new)
 */
const { graphql, sleep } = require('./shopify-api');

const CREATE_METAOBJECT = `
mutation CreateMetaobject($metaobject: MetaobjectCreateInput!) {
  metaobjectCreate(metaobject: $metaobject) {
    metaobject { id handle }
    userErrors { field message }
  }
}`;

const comparisons = [
  {
    handle: 'cargo-pants-vs-track-pants',
    heading: 'Cargo Pants vs Track Pants: Which Should You Own?',
    seo_title: 'Cargo Pants vs Track Pants | William Ashford',
    seo_description: 'Cargo pants or track pants? Compare style, comfort, durability, and occasions to pick the right casual pants for your wardrobe.',
    intro_text: 'Cargo pants and track pants both occupy the casual end of menswear, but they project very different images. This guide breaks down when each makes sense.',
    item_a_name: 'Cargo Pants',
    item_a_pros: 'Woven fabric looks more intentional and put-together\nFunctional cargo pockets add real utility\nWorks for more social situations than track pants\nDurable construction lasts for years\nCan be dressed up with the right pairing',
    item_a_cons: 'Heavier than track pants\nLess comfortable for sports or lounging\nRequires more thought to style well\nNot ideal for high-intensity physical activity',
    item_b_name: 'Track Pants',
    item_b_pros: 'Maximum comfort with elastic waistband\nPerfect for sports, gym, and active wear\nLightweight and easy to move in\nRequires zero styling effort\nOften more affordable',
    item_b_cons: 'Only appropriate for very casual settings\nKnit fabric sags and loses shape over time\nLooks sloppy for anything beyond errands\nNo functional pockets\nCannot be dressed up at all',
    verdict: 'Track pants are for the gym and couch. Cargo pants are for everything else. If you are stepping outside and want to look like you made an effort, cargo pants win every time. William Ashford cargos give you the comfort of casual wear with a look that actually impresses.',
    category: 'style-vs',
  },
  {
    handle: 'chinos-vs-jeans',
    heading: 'Chinos vs Jeans: The Ultimate Trouser Comparison',
    seo_title: 'Chinos vs Jeans — Which Is Better? | William Ashford',
    seo_description: 'Chinos or jeans? Compare comfort, versatility, and style to decide which trouser deserves more space in your wardrobe.',
    intro_text: 'Jeans and chinos are the two most popular casual trousers in the world. While jeans get all the cultural attention, chinos might actually be the more versatile choice. Here is an honest comparison.',
    item_a_name: 'Chinos',
    item_a_pros: 'More versatile — works from casual to business-casual\nLighter weight and more breathable than denim\nWider range of colours available\nSmooth finish looks more refined\nMore comfortable in warm climates like India',
    item_a_cons: 'Less iconic — no cultural cachet of jeans\nLess durable than heavy denim\nStains show more easily on lighter colours\nMay not hold up to heavy outdoor use',
    item_b_name: 'Jeans',
    item_b_pros: 'Iconic and universally recognised\nExtremely durable — heavy denim lasts decades\nDevelops unique character and fading with wear\nHides stains and dirt well (especially dark wash)\nResale value for premium denim brands',
    item_b_cons: 'Too casual for many office environments\nHeavy and hot in warm weather\nLimited colour range (mostly blue, black, grey)\nCan feel stiff and restrictive without stretch\nRequires break-in period for raw denim',
    verdict: 'In Indian weather, chinos are the smarter everyday choice — lighter, cooler, and more versatile across occasions. Jeans earn their place for going out, weekends, and when durability matters most. The ideal wardrobe has 2-3 pairs of chinos and 1-2 pairs of jeans. William Ashford Refined Everyday Chinos cover your daily needs perfectly.',
    category: 'style-vs',
  },
  {
    handle: 'cotton-vs-linen-pants',
    heading: 'Cotton vs Linen Pants: Best Fabric for Summer',
    seo_title: 'Cotton vs Linen Pants for Summer | William Ashford',
    seo_description: 'Cotton or linen pants for summer? Compare breathability, comfort, wrinkle resistance, and style to find the best warm weather trousers.',
    intro_text: 'When the temperature rises, your trouser fabric matters more than anything. Cotton and linen are the two most popular natural fibre choices for warm weather. Each has strengths the other lacks.',
    item_a_name: 'Cotton Pants',
    item_a_pros: 'Good breathability with moderate structure\nWide variety of weaves and weights available\nMore wrinkle-resistant than linen\nHolds colour well through many washes\nVersatile from casual to semi-formal',
    item_a_cons: 'Not as breathable as linen in extreme heat\nHeavier weight than equivalent linen\nAbsorbs sweat and can feel damp\nSlower to dry than linen',
    item_b_name: 'Linen Pants',
    item_b_pros: 'The most breathable natural fabric — best for extreme heat\nDries faster than cotton\nNaturally moisture-wicking\nLightweight and airy feel\nDevelops a beautiful relaxed aesthetic',
    item_b_cons: 'Wrinkles very easily — requires acceptance of the rumpled look\nLess structured — can look shapeless\nLimited to very casual occasions\nFibres can feel scratchy until broken in\nNarrower colour range in most stores',
    verdict: 'For Indian summers (35°C+), linen pants win on pure cooling ability. For everyday versatility across seasons, cotton wins. Cotton-linen blends (70/30 or 60/40) offer the best of both — cotton structure with improved breathability. William Ashford cotton twill pants work well for temperatures up to 32-33°C; above that, consider a cotton-linen blend.',
    category: 'fabric-vs',
  },
  {
    handle: '6-pocket-vs-4-pocket-cargo',
    heading: '6-Pocket vs 4-Pocket Cargo Pants: How Many Pockets Do You Need?',
    seo_title: '6-Pocket vs 4-Pocket Cargo Pants | William Ashford',
    seo_description: 'Compare 6-pocket and 4-pocket cargo pants. How many cargo pockets do you actually need? Style and function breakdown.',
    intro_text: 'Cargo pants are defined by their pockets — but more is not always better. The number and placement of pockets affects both the look and functionality of your cargos.',
    item_a_name: '6-Pocket Cargo Pants',
    item_a_pros: 'The classic cargo pant design — two front, two back, two thigh\nMaximum storage capacity\nAuthentic military/utility heritage look\nPerfect for travel, hiking, and outdoor activities\nThe pockets define the silhouette',
    item_a_cons: 'Thigh pockets add bulk to the silhouette\nFull pockets can look bulgy and messy\nMore casual than minimal pocket designs\nThigh pockets may interfere with sitting comfort\nHarder to dress up for occasions',
    item_b_name: '4-Pocket Cargo Pants',
    item_b_pros: 'Cleaner, slimmer silhouette without thigh bulk\nEasier to dress up for smart-casual occasions\nMore comfortable when sitting for long periods\nModern minimalist aesthetic\nStill has the cargo DNA without the excess',
    item_b_cons: 'Less storage — only front and back pockets\nMay not be considered true cargos by purists\nLess authentic military look\nNo dedicated phone or utility pocket',
    verdict: 'If you want the full cargo experience with maximum function, go 6-pocket. If you want cargo style with a cleaner modern look, 4-pocket is the way. William Ashford Rugged Zip Cargo Pants feature a smartly designed 6-pocket layout with zip closures that keep the silhouette clean even when pockets are in use.',
    category: 'style-vs',
  },
  {
    handle: 'ankle-length-vs-full-length-pants',
    heading: 'Ankle-Length vs Full-Length Pants: Which Looks Better?',
    seo_title: 'Ankle-Length vs Full-Length Pants | William Ashford',
    seo_description: 'Should your pants hit the ankle or cover your shoes? Compare ankle-length and full-length trousers for the best look.',
    intro_text: 'The length of your trousers affects the entire outfit. Ankle-length (cropped) and full-length are the two main choices, each projecting a different style.',
    item_a_name: 'Ankle-Length (Cropped)',
    item_a_pros: 'Showcases footwear — great with statement shoes\nLooks clean and modern\nKeeps you cooler in warm weather\nNo need for hemming — designed to be short\nPopular in contemporary streetwear and smart-casual',
    item_a_cons: 'Can look odd with wrong footwear (formal shoes, high boots)\nNot flattering on very short legs without careful proportioning\nLess warm in cold weather\nSome workplaces may consider it too casual\nSocks become part of the outfit (choose wisely)',
    item_b_name: 'Full-Length',
    item_b_pros: 'Classic, timeless look that never goes out of style\nMore versatile across all occasions and workplaces\nCan be cuffed for an ankle-length look when desired\nBetter proportions for most body types\nWarmer in cooler weather',
    item_b_cons: 'Requires proper hemming for the best look\nToo-long pants pooling at ankles looks sloppy\nHides your shoe game\nCan look dated if too wide at the hem\nMore fabric can feel warmer in summer',
    verdict: 'Full-length with a slight taper is the safest, most versatile choice. Ankle-length works best in summer or with intentional streetwear styling. The smart move: buy full-length and cuff them when you want the cropped look — instant versatility. William Ashford cargos are designed with a taper that looks great at full length or cuffed.',
    category: 'fit-guide',
  },
  {
    handle: 'cargo-pants-vs-shorts',
    heading: 'Cargo Pants vs Cargo Shorts: When to Wear Each',
    seo_title: 'Cargo Pants vs Cargo Shorts | William Ashford',
    seo_description: 'Cargo pants or cargo shorts? Compare style, occasions, and practicality to decide which cargo style works for you.',
    intro_text: 'The cargo family extends beyond pants to shorts. While both share the utility pocket DNA, they serve different purposes in your wardrobe and have very different style rules.',
    item_a_name: 'Cargo Pants',
    item_a_pros: 'Appropriate for more occasions and settings\nBetter protection for legs in outdoor environments\nMore pockets typically than shorts\nLooks more styled and intentional\nWorks year-round (even summer with cuffing)',
    item_a_cons: 'Warmer in extreme heat\nMore fabric means less freedom for active sports\nHeavier to pack for travel\nRequires more styling consideration',
    item_b_name: 'Cargo Shorts',
    item_b_pros: 'Maximum airflow in hot weather\nComfortable for beach, pool, and outdoor activities\nCasual summer staple\nLess fabric means lighter packing\nGreat for vacation and weekend wear',
    item_b_cons: 'Very limited to casual occasions only\nCan look sloppy if too long or baggy (knee-length max)\nStrongly divided opinion in fashion — many consider them outdated\nExpose legs to sun, insects, and scrapes\nNot accepted in most workplaces or restaurants',
    verdict: 'Cargo pants are the better investment for style versatility. Cargo shorts have their place strictly in hot weather and very casual settings. If you are choosing one, choose pants — you can always cuff them. For Indian summers, breathable cotton cargo pants in a lighter weight are often more practical than shorts for daily wear.',
    category: 'style-vs',
  },
  {
    handle: 'zipper-cargo-vs-flap-cargo',
    heading: 'Zipper Cargo Pockets vs Flap Cargo Pockets: Which Design Is Better?',
    seo_title: 'Zip vs Flap Cargo Pockets | William Ashford',
    seo_description: 'Compare zip-closure and flap-closure cargo pockets. Which design is more secure, stylish, and practical for everyday wear?',
    intro_text: 'The pocket closure is one of the defining design elements of cargo pants. The two main options — zipper and flap — affect the look, security, and functionality of your cargos.',
    item_a_name: 'Zipper Closure',
    item_a_pros: 'Sleek, modern aesthetic — lies flat when closed\nMost secure — nothing falls out during activity\nClean silhouette even when pockets are loaded\nQuick and easy to open and close\nContemporary, fashion-forward look',
    item_a_cons: 'Zippers can snag on fabric or break\nSlightly more expensive to produce\nCannot access pocket contents as quickly as open pockets\nZipper pull adds a small visible hardware detail\nMetal zippers set off metal detectors at airports',
    item_b_name: 'Flap Closure',
    item_b_pros: 'Classic military heritage look\nFlap adds visual dimension and texture to the pant\nButtons or snaps are easily replaceable if damaged\nQuick access — just lift the flap\nAuthentic vintage cargo aesthetic',
    item_b_cons: 'Flap adds bulk to the thigh silhouette\nLess secure — flap can come undone\nButton/snap flaps can look bulky when pockets are empty\nFlap may curl or warp with washing\nCan look more casual than zip closure',
    verdict: 'Zipper closures deliver a cleaner, more modern look and better security. Flap closures offer authentic military heritage style. William Ashford chose zipper closures for our Rugged Zip Cargo Pants specifically because they keep the silhouette clean while providing maximum pocket security — whether you are commuting, travelling, or out for the night.',
    category: 'style-vs',
  },
  {
    handle: 'mid-rise-vs-high-rise-pants',
    heading: 'Mid-Rise vs High-Rise Pants for Men: Finding Your Rise',
    seo_title: 'Mid-Rise vs High-Rise Men\'s Pants | William Ashford',
    seo_description: 'Compare mid-rise and high-rise trousers for men. Learn which rise flatters your body type and works with your style.',
    intro_text: 'The rise of your trousers — the distance from crotch seam to waistband — is one of the most underrated fit factors. It affects comfort, proportions, and overall look more than most men realise.',
    item_a_name: 'Mid-Rise (9-10 inches)',
    item_a_pros: 'The modern standard — works with most body types\nSits between hip and natural waist for balanced proportions\nComfortable for all-day wear\nPairs well with both tucked and untucked shirts\nNot too high (dated) or too low (uncomfortable)',
    item_a_cons: 'May not provide enough coverage when bending/reaching\nNot the most flattering for longer torsos\nCan shift down during activity without a belt\nLess waist definition than high-rise',
    item_b_name: 'High-Rise (10.5-12 inches)',
    item_b_pros: 'Sits at or near the natural waist — the most comfortable position\nElongates the leg line — makes legs appear longer\nBetter coverage and security during movement\nClassic, sophisticated look when tucking in shirts\nReturning to fashion — no longer considered old-fashioned',
    item_b_cons: 'Can look dated if combined with baggy fit\nShortens the torso visually\nTakes some adjustment if you are used to low-rise\nMay feel restrictive around the midsection\nRequires the right proportions to avoid a "dad pants" look',
    verdict: 'Mid-rise is the safest, most universally flattering choice for modern menswear. High-rise is making a comeback and looks great on men who want to elongate their legs or prefer wearing shirts tucked in. Avoid low-rise (below 9 inches) — it looks dated and is uncomfortable. William Ashford uses a mid-rise cut that suits the widest range of body types.',
    category: 'fit-guide',
  },
  {
    handle: 'branded-vs-unbranded-cargo-pants',
    heading: 'Branded vs Unbranded Cargo Pants: Is the Price Difference Worth It?',
    seo_title: 'Branded vs Unbranded Cargo Pants | William Ashford',
    seo_description: 'Are branded cargo pants worth the price? Compare quality, durability, and value between branded and unbranded cargo pants in India.',
    intro_text: 'Walk into any market or browse any shopping app in India and you will find cargo pants ranging from ₹399 to ₹3,999. The question every smart shopper asks: what actually justifies the price difference?',
    item_a_name: 'Branded Cargo Pants (₹1,200–3,999)',
    item_a_pros: 'Better fabric quality — higher GSM, longer staple cotton\nSuperior stitching — reinforced seams, stronger thread\nConsistent sizing — same size fits the same every time\nBetter hardware — quality zippers, buttons that last\nDesign intentionality — fit and proportions are refined',
    item_a_cons: 'Higher upfront cost\nBrand markup may exceed quality difference\nSome brands charge for logo, not quality\nLimited availability in some areas\nMay be over-engineered for rough daily use',
    item_b_name: 'Unbranded Cargo Pants (₹399–999)',
    item_b_pros: 'Very affordable — easy to buy multiple pairs\nOkay for rough use where damage is expected\nWide availability in local markets\nNo attachment if damaged or lost\nGood for trying the cargo style before investing',
    item_b_cons: 'Inconsistent sizing — even same "size" varies between pieces\nLower GSM fabric — thinner, less durable\nPoor stitching — seams split within months\nCheap zippers and buttons that fail quickly\nColour fades dramatically after 3-5 washes\nFit is rarely flattering — often too baggy or oddly proportioned',
    verdict: 'The sweet spot is a quality brand at a fair price — not the cheapest, not the most expensive. At William Ashford, we focus on fabric quality, construction, and fit at an accessible price point. Our cargo pants are designed to outlast 5+ pairs of unbranded alternatives, making them the better long-term investment. Price per wear is what matters, not price per pair.',
    category: 'buying-guide',
  },
  {
    handle: 'olive-vs-black-cargo-pants',
    heading: 'Olive vs Black Cargo Pants: Which Colour Should You Buy First?',
    seo_title: 'Olive vs Black Cargo Pants | William Ashford',
    seo_description: 'Olive or black cargo pants? Compare versatility, styling options, and occasions to decide which colour to buy first.',
    intro_text: 'If you are buying your first pair of cargo pants, colour is the biggest decision after fit. Olive and black are the two most popular options — both versatile, both stylish, but each with different strengths.',
    item_a_name: 'Olive Cargo Pants',
    item_a_pros: 'The classic cargo colour — authentic military heritage\nWarm, earthy tone that pairs with most neutral colours\nStands out more than black — makes a style statement\nShows off pocket details and texture better\nPerfect for autumn/winter earth-tone palettes',
    item_a_cons: 'Harder to dress up than black\nLimited to casual and streetwear styling\nDoes not pair well with certain colours (red, orange, bright pink)\nShows stains more than black\nCan look too military if paired with other khaki/green pieces',
    item_b_name: 'Black Cargo Pants',
    item_b_pros: 'The most versatile colour — pairs with literally everything\nEasiest to dress up for smart-casual occasions\nHides stains and dirt well\nWorks across all seasons\nCreates a sleek, modern silhouette\nMinimises the visual bulk of cargo pockets',
    item_b_cons: 'Less distinctive — black pants are common\nDoes not showcase cargo details as well as lighter colours\nCan look too dark/heavy in peak summer\nShows lint and dust easily\nFades to dark grey over time with washing',
    verdict: 'Buy black first — it is the more versatile, multi-occasion colour. Buy olive second to expand your options. If you already own several pairs of black pants, olive is the better choice to diversify your wardrobe. William Ashford Rugged Zip Cargo Pants are available in both colours — we recommend starting with black.',
    category: 'buying-guide',
  },
  {
    handle: 'cargo-pants-vs-utility-pants',
    heading: 'Cargo Pants vs Utility Pants: What Is the Difference?',
    seo_title: 'Cargo Pants vs Utility Pants | William Ashford',
    seo_description: 'Are cargo pants and utility pants the same thing? Compare design, pocket placement, and style to understand the difference.',
    intro_text: 'The terms "cargo pants" and "utility pants" are often used interchangeably, but there are meaningful design differences between them. Understanding these helps you choose the right pair for your needs.',
    item_a_name: 'Cargo Pants',
    item_a_pros: 'Distinctive large side pockets on the thighs\nStrong visual identity — instantly recognisable as cargos\nMilitary heritage with fashion-forward evolution\nMaximum pocket storage volume\nDominant in streetwear and casual fashion',
    item_a_cons: 'Thigh pockets add bulk to the silhouette\nStrongly casual — limited formal versatility\nThe pocket design divides fashion opinion\nCan look oversized if pockets are too large',
    item_b_name: 'Utility Pants',
    item_b_pros: 'Multiple pockets distributed more evenly (not just thigh)\nCleaner silhouette — pockets are often flatter and more discreet\nMore versatile across casual to smart-casual\nWorkwear heritage — rugged yet refined\nFunctional without the bold cargo aesthetic',
    item_b_cons: 'Less pocket capacity than dedicated cargos\nLess visually distinctive — can look like regular trousers\nLess streetwear appeal\nThe "utility" category is vaguely defined',
    verdict: 'Cargo pants are a subset of utility pants. All cargos are utility pants, but not all utility pants are cargos. If you want the bold cargo look with large thigh pockets, choose cargos. If you want functional pockets with a subtler design, look for utility pants. William Ashford Rugged Zip Cargo Pants bridge both worlds — cargo pocket functionality with a refined, modern design.',
    category: 'style-vs',
  },
  {
    handle: 'cuffed-vs-uncuffed-pants',
    heading: 'Cuffed vs Uncuffed Pants: When to Roll Your Trousers',
    seo_title: 'Cuffed vs Uncuffed Pants — Style Guide | William Ashford',
    seo_description: 'Should you cuff your pants? Learn when rolling or cuffing your trousers looks great and when to keep them uncuffed.',
    intro_text: 'Cuffing (rolling) your trouser hems is a simple styling move that can change the entire look of an outfit. But timing and technique matter — here is when it works and when it does not.',
    item_a_name: 'Cuffed / Rolled',
    item_a_pros: 'Showcases your footwear — great with statement sneakers or boots\nCreates a visual break between pant and shoe\nAdds a casual, styled touch to any outfit\nAdjusts too-long pants without hemming\nLooks modern and fashion-forward',
    item_a_cons: 'Shortens the leg line — not ideal for shorter frames\nCan look sloppy if the cuff is uneven or too thick\nNot appropriate for formal settings\nCuffs can come undone during wear\nExposes ankles in cold weather',
    item_b_name: 'Uncuffed / Clean Hem',
    item_b_pros: 'Clean, classic look that suits all occasions\nElongates the leg line\nMore formal and polished appearance\nNo maintenance — stays put\nBetter for formal and business settings',
    item_b_cons: 'Requires proper hemming for the best look\nCan hide great shoes\nLess personality than a well-placed cuff\nCan look too plain with casual outfits\nToo-long uncuffed hems look sloppy',
    verdict: 'Cuff your cargo pants and casual chinos — it adds character and shows off your shoes. Keep dress trousers and formal chinos uncuffed. For William Ashford cargos, a single or double cuff roll looks excellent with sneakers, revealing the zip pocket hardware and giving the outfit a styled, intentional finish.',
    category: 'style-vs',
  },
];

async function main() {
  console.log('=== Creating Comparisons Batch 2 (12 comparisons) ===\n');
  let created = 0;
  for (const comp of comparisons) {
    console.log(`Creating: ${comp.heading.substring(0, 55)}...`);
    const fields = Object.entries(comp)
      .filter(([key]) => key !== 'handle')
      .map(([key, value]) => ({ key, value }));
    fields.push({ key: 'last_updated', value: '2026-03-12' });

    const result = await graphql(CREATE_METAOBJECT, {
      metaobject: { type: 'style_comparison', handle: comp.handle, fields },
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
  console.log(`\n=== Created ${created}/${comparisons.length} comparisons ===`);
}

main().catch(console.error);
