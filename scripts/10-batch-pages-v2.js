/**
 * Batch 2: Create all new PSEO pages
 */
const { graphql, sleep } = require('./shopify-api');

const CREATE_PAGE = `
mutation CreatePage($page: PageCreateInput!) {
  pageCreate(page: $page) {
    page { id handle title }
    userErrors { field message }
  }
}`;

const allPages = [
  // === New Glossary Pages (15) ===
  { title: 'What Is Corduroy Fabric?', handle: 'what-is-corduroy', template: 'fabric-glossary', seo_title: 'What Is Corduroy Fabric? | William Ashford', seo_description: 'Learn about corduroy — its ridged texture, warmth, and timeless appeal for autumn and winter trousers.' },
  { title: 'What Is Denim Fabric?', handle: 'what-is-denim', template: 'fabric-glossary', seo_title: 'What Is Denim Fabric? | William Ashford', seo_description: 'Everything about denim fabric — how it is made, types, and how it compares to twill.' },
  { title: 'What Is Nylon Fabric?', handle: 'what-is-nylon', template: 'fabric-glossary', seo_title: 'What Is Nylon Fabric? | William Ashford', seo_description: 'Learn about nylon — a synthetic material for strength and water resistance in technical pants.' },
  { title: 'What Is Linen Fabric?', handle: 'what-is-linen', template: 'fabric-glossary', seo_title: 'What Is Linen Fabric? Summer Guide | William Ashford', seo_description: 'Learn about linen — the most breathable natural textile, perfect for summer trousers.' },
  { title: 'What Is Polyester Fabric?', handle: 'what-is-polyester', template: 'fabric-glossary', seo_title: 'What Is Polyester? Pros & Cons | William Ashford', seo_description: 'Learn about polyester — its properties, pros and cons for trousers and everyday pants.' },
  { title: 'What Is Enzyme Wash?', handle: 'what-is-enzyme-wash', template: 'fabric-glossary', seo_title: 'What Is Enzyme Wash? | William Ashford', seo_description: 'Learn about enzyme washing — a natural process that softens garments for premium feel.' },
  { title: 'What Is Stone Wash?', handle: 'what-is-stone-wash', template: 'fabric-glossary', seo_title: 'What Is Stone Wash? Fabric Guide | William Ashford', seo_description: 'Learn about stone washing — the technique that creates vintage looks in denim and cotton.' },
  { title: 'What Is Mercerized Cotton?', handle: 'what-is-mercerized-cotton', template: 'fabric-glossary', seo_title: 'What Is Mercerized Cotton? | William Ashford', seo_description: 'Discover mercerized cotton — treated for lustre, strength, and vibrant colour retention.' },
  { title: 'What Is Brushed Twill?', handle: 'what-is-brushed-twill', template: 'fabric-glossary', seo_title: 'What Is Brushed Twill? | William Ashford', seo_description: 'Learn about brushed twill — soft, flannel-like cotton twill for cold weather trousers.' },
  { title: 'What Is Moisture-Wicking Fabric?', handle: 'what-is-moisture-wicking', template: 'fabric-glossary', seo_title: 'What Is Moisture-Wicking Fabric? | William Ashford', seo_description: 'Learn about moisture-wicking fabrics — how they keep you dry and comfortable.' },
  { title: 'What Is Anti-Pilling?', handle: 'what-is-anti-pilling', template: 'fabric-glossary', seo_title: 'What Is Anti-Pilling? | William Ashford', seo_description: 'Learn about anti-pilling treatments that keep trousers looking new longer.' },
  { title: 'What Is Overdyeing (OD)?', handle: 'what-is-overdyeing', template: 'fabric-glossary', seo_title: 'What Is Overdyeing? | William Ashford', seo_description: 'Learn about overdyeing — creating rich, complex colours by layering dye treatments.' },
  { title: 'Twill Weave vs Plain Weave', handle: 'twill-weave-vs-plain-weave', template: 'fabric-glossary', seo_title: 'Twill vs Plain Weave | William Ashford', seo_description: 'Compare twill and plain weave fabrics — which is better for trousers and durability.' },
  { title: 'What Is Sanforization?', handle: 'what-is-sanforization', template: 'fabric-glossary', seo_title: 'What Is Sanforization? Pre-Shrunk Fabric | William Ashford', seo_description: 'Learn about sanforization — the pre-shrinking process that ensures your pants fit after washing.' },
  { title: 'What Is Gabardine Fabric?', handle: 'what-is-gabardine', template: 'fabric-glossary', seo_title: 'What Is Gabardine? | William Ashford', seo_description: 'Learn about gabardine — a tightly woven twill famous for smooth finish and water resistance.' },

  // === New Comparison Pages (12) ===
  { title: 'Cargo Pants vs Track Pants', handle: 'cargo-pants-vs-track-pants', template: 'comparison', seo_title: 'Cargo Pants vs Track Pants | William Ashford', seo_description: 'Cargo pants or track pants? Compare style, comfort, and durability.' },
  { title: 'Chinos vs Jeans: The Ultimate Comparison', handle: 'chinos-vs-jeans', template: 'comparison', seo_title: 'Chinos vs Jeans | William Ashford', seo_description: 'Chinos or jeans? Compare comfort, versatility, and style for your wardrobe.' },
  { title: 'Cotton vs Linen Pants for Summer', handle: 'cotton-vs-linen-pants', template: 'comparison', seo_title: 'Cotton vs Linen Pants | William Ashford', seo_description: 'Cotton or linen for summer? Compare breathability, comfort, and style.' },
  { title: '6-Pocket vs 4-Pocket Cargo Pants', handle: '6-pocket-vs-4-pocket-cargo', template: 'comparison', seo_title: '6-Pocket vs 4-Pocket Cargos | William Ashford', seo_description: 'How many cargo pockets do you need? Compare 6-pocket and 4-pocket designs.' },
  { title: 'Ankle-Length vs Full-Length Pants', handle: 'ankle-length-vs-full-length-pants', template: 'comparison', seo_title: 'Ankle vs Full-Length Pants | William Ashford', seo_description: 'Should pants hit the ankle or cover shoes? Compare both lengths.' },
  { title: 'Cargo Pants vs Cargo Shorts', handle: 'cargo-pants-vs-shorts', template: 'comparison', seo_title: 'Cargo Pants vs Shorts | William Ashford', seo_description: 'Cargo pants or shorts? Compare style, occasions, and practicality.' },
  { title: 'Zip Cargo Pockets vs Flap Pockets', handle: 'zipper-cargo-vs-flap-cargo', template: 'comparison', seo_title: 'Zip vs Flap Cargo Pockets | William Ashford', seo_description: 'Zip or flap cargo pockets? Compare security, style, and function.' },
  { title: 'Mid-Rise vs High-Rise Pants for Men', handle: 'mid-rise-vs-high-rise-pants', template: 'comparison', seo_title: 'Mid vs High-Rise Pants | William Ashford', seo_description: 'Compare mid-rise and high-rise trousers for men.' },
  { title: 'Branded vs Unbranded Cargo Pants in India', handle: 'branded-vs-unbranded-cargo-pants', template: 'comparison', seo_title: 'Branded vs Unbranded Cargos | William Ashford', seo_description: 'Are branded cargo pants worth it? Compare quality and value.' },
  { title: 'Olive vs Black Cargo Pants', handle: 'olive-vs-black-cargo-pants', template: 'comparison', seo_title: 'Olive vs Black Cargo Pants | William Ashford', seo_description: 'Olive or black cargos? Compare versatility and styling options.' },
  { title: 'Cargo Pants vs Utility Pants', handle: 'cargo-pants-vs-utility-pants', template: 'comparison', seo_title: 'Cargo vs Utility Pants | William Ashford', seo_description: 'Are cargo and utility pants the same? Compare design and style.' },
  { title: 'Cuffed vs Uncuffed Pants', handle: 'cuffed-vs-uncuffed-pants', template: 'comparison', seo_title: 'Cuffed vs Uncuffed Pants | William Ashford', seo_description: 'When to roll your trousers and when to keep them clean-hemmed.' },

  // === New Use Case / Style Guide Pages (15) ===
  { title: 'Can You Wear Cargo Pants to the Gym?', handle: 'cargo-pants-for-gym', template: 'use-case', seo_title: 'Cargo Pants for Gym | William Ashford', seo_description: 'Should you wear cargo pants to the gym? Pros, cons, and when it works.' },
  { title: 'Cargo Pants for Hiking', handle: 'cargo-pants-for-hiking', template: 'use-case', seo_title: 'Cargo Pants for Hiking | William Ashford', seo_description: 'Why cargo pants are great for hiking — trail tips and outfit ideas.' },
  { title: 'What to Wear in Monsoon: Cargo Pants Guide', handle: 'cargo-pants-for-monsoon', template: 'use-case', seo_title: 'Monsoon Cargo Pants Guide | William Ashford', seo_description: 'How to wear cargo pants in Indian monsoon season.' },
  { title: 'Chinos for Job Interviews', handle: 'chinos-for-interview', template: 'use-case', seo_title: 'Chinos for Job Interview | William Ashford', seo_description: 'How to wear chinos to a job interview — colours, fit, and pairings.' },
  { title: '7 Outfit Ideas for Olive Cargo Pants', handle: 'olive-cargo-outfits', template: 'use-case', seo_title: 'Olive Cargo Outfits | William Ashford', seo_description: 'Style olive cargo pants 7 different ways — casual to layered looks.' },
  { title: 'How to Style Khaki Cargo Pants', handle: 'khaki-cargo-outfits', template: 'use-case', seo_title: 'Khaki Cargo Outfits | William Ashford', seo_description: 'Style khaki cargo pants 6 ways — summer casual to smart looks.' },
  { title: 'How to Wear Cargo Pants in Winter', handle: 'cargo-pants-winter-styling', template: 'use-case', seo_title: 'Winter Cargo Pants Style | William Ashford', seo_description: 'Layer cargo pants for winter — boot pairings and cold weather outfits.' },
  { title: 'Festival Outfit Ideas With Cargo Pants', handle: 'festival-outfit-cargos', template: 'use-case', seo_title: 'Festival Outfits With Cargos | William Ashford', seo_description: 'Stand out at festivals with cargo pants — practical and stylish.' },
  { title: 'Best Cargo Pants Under ₹1,500 in India', handle: 'best-cargo-pants-under-1500', template: 'use-case', seo_title: 'Best Cargo Pants Under ₹1500 | William Ashford', seo_description: 'Best cargo pants under ₹1,500 — what to look for in quality at this price.' },
  { title: 'Best Cargo Pants for Indian Summer', handle: 'best-cargo-pants-for-summer-india', template: 'use-case', seo_title: 'Best Summer Cargo Pants India | William Ashford', seo_description: 'Best cargo pants for Indian summers — lightweight and breathable picks.' },
  { title: 'How to Choose Cargo Pants: Buyer\'s Guide', handle: 'how-to-choose-cargo-pants', template: 'use-case', seo_title: 'How to Choose Cargo Pants | William Ashford', seo_description: 'Complete guide to buying cargo pants — fabric, fit, pockets, and quality.' },
  { title: 'Cargo Pants Size Guide', handle: 'cargo-pants-size-guide', template: 'use-case', seo_title: 'Cargo Pants Size Guide | William Ashford', seo_description: 'Find your cargo pants size — measuring tips and fit guide.' },
  { title: 'Cargo Pants Fabric Guide', handle: 'cargo-pants-fabric-guide', template: 'use-case', seo_title: 'Cargo Pants Fabric Guide | William Ashford', seo_description: 'Compare cargo pant fabrics — cotton twill, ripstop, canvas, nylon, and blends.' },
];

async function main() {
  console.log(`=== Creating ${allPages.length} New PSEO Pages ===\n`);
  let created = 0;
  let skipped = 0;

  for (const page of allPages) {
    process.stdout.write(`${page.handle}... `);

    const metafields = [];
    if (page.seo_title) metafields.push({ namespace: 'global', key: 'title_tag', value: page.seo_title, type: 'single_line_text_field' });
    if (page.seo_description) metafields.push({ namespace: 'global', key: 'description_tag', value: page.seo_description, type: 'single_line_text_field' });

    const result = await graphql(CREATE_PAGE, {
      page: {
        title: page.title,
        handle: page.handle,
        templateSuffix: page.template,
        body: `<p>${page.seo_description || page.title}</p>`,
        isPublished: true,
        metafields: metafields.length > 0 ? metafields : undefined,
      },
    });

    const data = result.data?.pageCreate;
    if (data?.userErrors?.length > 0) {
      const msg = data.userErrors.map(e => e.message).join(', ');
      if (msg.includes('has already been taken')) {
        console.log('exists');
        skipped++;
      } else {
        console.log(`⚠ ${msg}`);
      }
    } else if (data?.page) {
      console.log('✓');
      created++;
    } else {
      console.log('✗ unexpected response');
    }

    await sleep(350);
  }

  console.log(`\n=== Results: ${created} created, ${skipped} already existed, ${allPages.length - created - skipped} errors ===`);
}

main().catch(console.error);
