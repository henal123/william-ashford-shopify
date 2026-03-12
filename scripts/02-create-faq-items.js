/**
 * Step 2: Create FAQ Item metaobjects
 * These are reused across glossary, comparison, and use-case pages
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

const faqItems = [
  // Cargo pants FAQs
  { handle: 'faq-what-are-cargo-pants', question: 'What are cargo pants?', answer: 'Cargo pants are a style of trousers featuring large utility pockets on the sides of the legs. Originally designed for military and outdoor use, they have evolved into a versatile fashion staple that combines functionality with street-style appeal. William Ashford cargo pants are crafted with premium fabrics and refined pocket designs for a modern, elevated look.' },
  { handle: 'faq-cargo-pants-formal', question: 'Can you wear cargo pants to a formal event?', answer: 'Traditional baggy cargos are too casual for formal settings. However, William Ashford slim-fit and tapered cargo pants in neutral colours like black, olive, or navy can work for smart-casual occasions when paired with a crisp shirt, blazer, and clean shoes. The key is choosing a refined silhouette over a relaxed one.' },
  { handle: 'faq-cargo-pants-wash', question: 'How should I wash cargo pants?', answer: 'Turn cargo pants inside out before washing. Use cold water on a gentle cycle to preserve the fabric and colour. Avoid bleach. Empty all pockets and zip up any zippers. Hang dry or tumble dry on low heat. For William Ashford cotton cargos, ironing on medium heat keeps them looking sharp.' },
  { handle: 'faq-cargo-vs-chinos', question: 'What is the difference between cargo pants and chinos?', answer: 'Cargo pants feature large side pockets and a more utilitarian design, while chinos have a cleaner, streamlined silhouette with flat or slant pockets. Cargos lean casual and streetwear, while chinos are more versatile from casual to business-casual. William Ashford offers both styles crafted with the same premium attention to detail.' },
  { handle: 'faq-best-shoes-cargo', question: 'What shoes go best with cargo pants?', answer: 'Cargo pants pair well with sneakers for casual looks, boots (Chelsea or combat) for an edgier style, and loafers or clean leather shoes for smart-casual outfits. Avoid overly formal dress shoes. The shoe choice should match the overall vibe you are going for.' },

  // Chinos FAQs
  { handle: 'faq-what-are-chinos', question: 'What are chinos?', answer: 'Chinos are lightweight cotton or cotton-blend trousers with a smooth, flat-front design. They originated as military uniform trousers and have become one of the most versatile pants in menswear. William Ashford chinos feature a refined everyday fit with premium cotton twill fabric for comfort and durability.' },
  { handle: 'faq-chinos-business-casual', question: 'Are chinos appropriate for business casual?', answer: 'Yes, chinos are a cornerstone of business-casual dressing. Pair them with an Oxford shirt, a belt, and leather shoes for a polished yet relaxed office look. Stick to classic colours like navy, khaki, grey, or olive. William Ashford Refined Everyday Chinos are designed specifically for this versatility.' },
  { handle: 'faq-chinos-vs-dress-pants', question: 'What is the difference between chinos and dress pants?', answer: 'Chinos are made from cotton twill and have a more relaxed, casual construction. Dress pants (trousers) are typically made from wool or wool-blend fabrics with a sharper crease and more formal tailoring. Chinos bridge the gap between jeans and dress pants.' },

  // Fabric FAQs
  { handle: 'faq-what-is-cotton-twill', question: 'What is cotton twill fabric?', answer: 'Cotton twill is a weaving pattern that creates diagonal lines (ribs) on the fabric surface. This weave makes the fabric more durable, drape-friendly, and resistant to wrinkles compared to plain weave cotton. It is the primary fabric used in chinos, cargo pants, and many trouser styles. William Ashford uses premium cotton twill across its collections.' },
  { handle: 'faq-ripstop-vs-twill', question: 'What is the difference between ripstop and twill?', answer: 'Ripstop fabric has a reinforced grid pattern woven in that prevents tears from spreading, making it extremely durable for outdoor and military use. Twill has a diagonal weave pattern that offers good durability with a smoother, more refined appearance. For everyday fashion, twill looks dressier; for rugged utility wear, ripstop is the better choice.' },
  { handle: 'faq-cotton-vs-polyester', question: 'Is cotton better than polyester for pants?', answer: 'Cotton is more breathable, comfortable in warm weather, and has a natural feel. Polyester is more durable, wrinkle-resistant, and dries faster. Many premium pants use a cotton-polyester blend to combine the best of both. William Ashford prioritizes high cotton content for comfort while adding minimal synthetic blend for durability.' },

  // Style guide FAQs
  { handle: 'faq-how-to-style-cargos', question: 'How do I style cargo pants for a date night?', answer: 'Choose slim-fit or tapered cargos in black or olive. Pair with a fitted crew-neck or a clean button-down shirt. Add Chelsea boots or minimalist leather sneakers. Keep accessories minimal - a simple watch and a clean belt. Avoid oversized tops that can make the look too casual.' },
  { handle: 'faq-best-colours-cargos', question: 'What are the best colours for cargo pants?', answer: 'The most versatile cargo pant colours are: Black (goes with everything, most dressed-up option), Olive/Military Green (the classic cargo colour), Khaki/Beige (great for summer and casual looks), and Navy (a sophisticated alternative to black). William Ashford offers all core colours across its cargo range.' },
  { handle: 'faq-how-pants-should-fit', question: 'How should pants fit properly?', answer: 'Well-fitting pants should sit comfortably at the waist without a belt holding them up, have enough room in the thigh for movement without excess fabric, taper slightly towards the ankle, and break just at the top of your shoe (or show a slight ankle with no-break). The rise (crotch to waistband) should not feel restrictive or saggy.' },

  // General William Ashford FAQs
  { handle: 'faq-wa-shipping', question: 'Does William Ashford offer free shipping?', answer: 'William Ashford offers free shipping across India on all orders. International shipping rates are calculated at checkout. Orders are typically dispatched within 1-2 business days.' },
  { handle: 'faq-wa-returns', question: 'What is the return policy at William Ashford?', answer: 'William Ashford accepts returns within 7 days of delivery for unworn items with original tags attached. Contact our support team to initiate a return. Exchanges are also available for size swaps.' },
  { handle: 'faq-wa-sizing', question: 'How do I find my size at William Ashford?', answer: 'Refer to the size chart on each product page. Measure your waist and hip circumference with a soft tape measure. If you are between sizes, we recommend sizing up for a relaxed fit or sizing down for a slim fit. Our size chart page at williamashford.in/pages/size-chart has detailed measurements for every style.' },
  { handle: 'faq-wa-made-in-india', question: 'Are William Ashford products made in India?', answer: 'Yes, all William Ashford garments are designed and manufactured in India. We work with skilled local artisans and factories that meet our quality standards, supporting Indian craftsmanship while delivering premium menswear at accessible prices.' },
];

async function main() {
  console.log('=== Creating FAQ Items ===\n');

  for (const faq of faqItems) {
    console.log(`Creating FAQ: "${faq.question.substring(0, 50)}..."}`);
    const result = await graphql(CREATE_METAOBJECT, {
      metaobject: {
        type: 'faq_item',
        handle: faq.handle,
        fields: [
          { key: 'question', value: faq.question },
          { key: 'answer', value: faq.answer },
        ],
      },
    });

    const data = result.data?.metaobjectCreate;
    if (data?.userErrors?.length > 0) {
      console.log(`  ⚠`, data.userErrors.map(e => e.message).join(', '));
    } else if (data?.metaobject) {
      console.log(`  ✓ ${data.metaobject.handle}`);
    }

    await sleep(300);
  }

  console.log(`\n=== Created ${faqItems.length} FAQ items ===`);
}

main().catch(console.error);
