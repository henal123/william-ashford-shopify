/**
 * Step 4: Create Style Comparison metaobjects
 * Powers /pages/[comparison] PSEO pages
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

const comparisons = [
  {
    handle: 'cargo-pants-vs-chinos',
    heading: 'Cargo Pants vs Chinos: Which Should You Choose?',
    seo_title: 'Cargo Pants vs Chinos — Style Guide | William Ashford',
    seo_description: 'Cargo pants or chinos? Compare fit, versatility, pockets, and style to find the right pants for your wardrobe. Expert guide from William Ashford.',
    intro_text: 'Cargo pants and chinos are two of the most popular trouser styles in menswear, yet they serve very different purposes. This guide breaks down the key differences to help you decide which style belongs in your rotation — or why you might need both.',
    item_a_name: 'Cargo Pants',
    item_a_pros: 'Maximum pocket storage — ideal for carrying essentials hands-free\nStreet-style appeal — on-trend and bold\nExtremely durable construction for everyday wear\nAvailable in relaxed, regular, and slim fits\nVersatile with casual and streetwear outfits',
    item_a_cons: 'Not suitable for formal or business settings\nBulkier silhouette due to side pockets\nCan look oversized if fit is not dialled in\nLimited colour range compared to chinos',
    item_b_name: 'Chinos',
    item_b_pros: 'Seamlessly transitions from casual to business-casual\nClean, streamlined silhouette flatters all body types\nWide range of colours and fits available\nPairs with everything from t-shirts to blazers\nLightweight and comfortable for all-day wear',
    item_b_cons: 'No utility pockets — limited storage\nCan look too plain without intentional styling\nLess durable than cargo pants for rough use\nStains show more easily on lighter colours',
    verdict: 'Choose cargo pants when you want a bold, street-ready look with functional pockets — perfect for weekends, travel, and casual outings. Choose chinos when you need versatility that works from office to dinner. The smartest move? Own both. William Ashford Rugged Zip Cargo Pants handle your casual days while our Refined Everyday Chinos cover everything else.',
    category: 'style-vs',
  },
  {
    handle: 'slim-fit-vs-relaxed-fit-cargos',
    heading: 'Slim-Fit vs Relaxed-Fit Cargo Pants: Finding Your Fit',
    seo_title: 'Slim vs Relaxed Fit Cargo Pants | William Ashford',
    seo_description: 'Slim-fit or relaxed-fit cargo pants? Compare silhouettes, comfort, and style to find your ideal cargo pant fit. Guide by William Ashford.',
    intro_text: 'The fit of your cargo pants changes the entire look. A slim-fit cargo delivers modern, clean streetwear while a relaxed fit leans into the classic military heritage. Here is how they compare.',
    item_a_name: 'Slim-Fit Cargos',
    item_a_pros: 'Modern, streamlined silhouette\nEasier to dress up for smart-casual occasions\nLooks cleaner with fitted tops and jackets\nPocket profile sits flatter against the leg\nWorks well for shorter or slimmer builds',
    item_a_cons: 'Less room for movement in thighs\nPockets can be harder to access when tight\nMay feel restrictive without stretch fabric\nNot ideal for layering underneath',
    item_b_name: 'Relaxed-Fit Cargos',
    item_b_pros: 'Maximum comfort and freedom of movement\nAuthentic military/utility aesthetic\nGenerous pocket access and storage\nOn-trend with the wide-leg and baggy revival\nIdeal for larger and athletic builds',
    item_b_cons: 'Can look sloppy if too oversized\nHarder to dress up for occasions\nMay pool or bunch at the ankles\nRequires confident styling to avoid looking dated',
    verdict: 'For most men building a modern wardrobe, slim-fit or tapered cargos offer the best balance of style and function. If you are into the streetwear/Y2K revival trend or prefer maximum comfort, relaxed-fit is the way to go. William Ashford Rugged Zip Cargo Pants offer a tapered fit that threads the needle perfectly — fitted through the thigh with a taper to the ankle.',
    category: 'fit-guide',
  },
  {
    handle: 'cotton-vs-polyester-pants',
    heading: 'Cotton vs Polyester Pants: Which Fabric Is Better?',
    seo_title: 'Cotton vs Polyester Pants — Fabric Guide | William Ashford',
    seo_description: 'Compare cotton and polyester for trousers. Learn which fabric wins for comfort, durability, breathability, and everyday wear.',
    intro_text: 'The fabric of your pants affects everything — how they feel, how long they last, and how they look over time. Cotton and polyester are the two most common trouser fabrics. Here is an honest comparison.',
    item_a_name: '100% Cotton',
    item_a_pros: 'Naturally breathable — ideal for warm climates like India\nSoft hand-feel that improves with every wash\nHypoallergenic — gentle on sensitive skin\nAbsorbs moisture well\nDevelops attractive character and patina over time',
    item_a_cons: 'Wrinkles more easily than synthetic fabrics\nCan shrink if washed in hot water\nTakes longer to dry\nMay lose shape without elastane blend\nFades faster with frequent washing',
    item_b_name: 'Polyester',
    item_b_pros: 'Highly wrinkle-resistant — stays smooth all day\nVery durable and resistant to stretching\nDries quickly — great for travel\nHolds colour well through many washes\nLightweight and easy to maintain',
    item_b_cons: 'Less breathable — can feel hot and sticky\nDoesn not absorb moisture (traps sweat)\nSynthetic feel — less comfortable against skin\nStatic build-up is common\nEnvironmental concerns with microplastic shedding',
    verdict: 'For everyday trousers worn in Indian weather, cotton is the clear winner for comfort and breathability. Polyester has its place in performance and travel wear. The best option? A cotton-dominant blend (95-98% cotton, 2-5% elastane) gives you cotton comfort with added stretch and recovery. This is exactly what William Ashford uses for most of our trouser range.',
    category: 'fabric-vs',
  },
  {
    handle: 'cargo-pants-vs-joggers',
    heading: 'Cargo Pants vs Joggers: Style & Comfort Compared',
    seo_title: 'Cargo Pants vs Joggers — Which Is Better? | William Ashford',
    seo_description: 'Cargo pants or joggers? Compare style, comfort, versatility, and occasions to decide which casual pant suits your lifestyle.',
    intro_text: 'Both cargo pants and joggers live in the casual end of your wardrobe, but they serve different purposes. This comparison helps you understand when to reach for each.',
    item_a_name: 'Cargo Pants',
    item_a_pros: 'More structured and put-together appearance\nFunctional pockets for real utility\nWorks for more occasions than joggers\nDurable woven fabric lasts longer\nCan be dressed up with the right styling',
    item_a_cons: 'Heavier and warmer than joggers\nLess comfortable for lounging and exercise\nRequires more deliberate styling\nNot suitable for athletic activities',
    item_b_name: 'Joggers',
    item_b_pros: 'Maximum comfort — perfect for lounging and travel\nElastic waist requires no belt\nLightweight and easy to move in\nGreat for gym-to-street transitions\nEasy to style — just throw on and go',
    item_b_cons: 'Limited to very casual occasions\nLess durable than woven fabrics\nKnit fabric can sag and lose shape over time\nPockets are usually small and impractical\nCannot be dressed up at all',
    verdict: 'Joggers are for comfort and sport. Cargo pants are for making a statement while still being practical. If you are leaving the house and want to look intentional, cargo pants are the better choice. If you are working from home or hitting the gym, joggers win. William Ashford cargos are built to be your go-to pants for everything outside the gym.',
    category: 'style-vs',
  },
  {
    handle: 'tapered-vs-straight-fit',
    heading: 'Tapered vs Straight Fit Trousers: Which Suits You?',
    seo_title: 'Tapered vs Straight Fit Trousers | William Ashford',
    seo_description: 'Compare tapered and straight-fit trousers. Learn which cut flatters your body type and works with your personal style.',
    intro_text: 'The cut of your trousers dramatically changes how an outfit comes together. Tapered and straight fits are the two most popular modern silhouettes. Here is how they compare.',
    item_a_name: 'Tapered Fit',
    item_a_pros: 'Modern, clean silhouette that narrows at the ankle\nShowcases footwear — great with sneakers and boots\nFlattering on most body types\nWorks perfectly with both cargos and chinos\nLooks intentional and styled',
    item_a_cons: 'Can feel tight at the calf for muscular legs\nMay require the right length to avoid bunching\nLess forgiving than straight fit\nNot ideal if you prefer a roomier feel below the knee',
    item_b_name: 'Straight Fit',
    item_b_pros: 'Consistent width from hip to hem — classic look\nMore room throughout the leg for comfort\nTimeless silhouette that never goes out of style\nForgiving on different body shapes\nEasy to hem to any length',
    item_b_cons: 'Can look boxy on shorter frames\nDoesn not showcase shoes as well as tapered\nMay appear dated when trends favour slim fits\nLess defined shape overall',
    verdict: 'Tapered fit is the modern standard — it works for 90% of men and looks sharp with everything from sneakers to Chelsea boots. Straight fit is better if you have muscular thighs or simply prefer a no-fuss, classic look. William Ashford Rugged Zip Cargo Pants feature a tapered cut that we believe is the most versatile choice for contemporary menswear.',
    category: 'fit-guide',
  },
];

async function main() {
  console.log('=== Creating Style Comparisons ===\n');

  for (const comp of comparisons) {
    console.log(`Creating: ${comp.heading.substring(0, 50)}...`);

    const fields = Object.entries(comp)
      .filter(([key]) => key !== 'handle')
      .map(([key, value]) => ({ key, value }));

    fields.push({ key: 'last_updated', value: '2026-03-12' });

    const result = await graphql(CREATE_METAOBJECT, {
      metaobject: {
        type: 'style_comparison',
        handle: comp.handle,
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

  console.log(`\n=== Created ${comparisons.length} comparisons ===`);
}

main().catch(console.error);
