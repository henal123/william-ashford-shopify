/**
 * Step 12: Create Brand Comparison Metaobject Definition
 * For brand comparison pages (e.g. "William Ashford vs Competitor")
 */
const { graphql, sleep } = require('./shopify-api');

const CREATE_DEFINITION = `
mutation CreateMetaobjectDefinition($definition: MetaobjectDefinitionCreateInput!) {
  metaobjectDefinitionCreate(definition: $definition) {
    metaobjectDefinition {
      id
      name
      type
    }
    userErrors {
      field
      message
    }
  }
}`;

const definitions = [
  {
    name: 'Brand Comparison',
    type: 'brand_comparison',
    displayNameKey: 'heading',
    access: { storefront: 'PUBLIC_READ' },
    fieldDefinitions: [
      { key: 'heading', name: 'Page Heading', type: 'single_line_text_field', required: true },
      { key: 'seo_title', name: 'SEO Title Override', type: 'single_line_text_field' },
      { key: 'seo_description', name: 'Meta Description Override', type: 'single_line_text_field' },
      { key: 'intro_text', name: 'Introduction Paragraph', type: 'multi_line_text_field' },
      { key: 'brand_a_name', name: 'Brand A Name (William Ashford)', type: 'single_line_text_field', required: true },
      { key: 'brand_b_name', name: 'Brand B Name (Competitor)', type: 'single_line_text_field', required: true },
      { key: 'brand_a_pros', name: 'Brand A Pros (one per line)', type: 'multi_line_text_field' },
      { key: 'brand_a_cons', name: 'Brand A Cons (one per line)', type: 'multi_line_text_field' },
      { key: 'brand_b_pros', name: 'Brand B Pros (one per line)', type: 'multi_line_text_field' },
      { key: 'brand_b_cons', name: 'Brand B Cons (one per line)', type: 'multi_line_text_field' },
      { key: 'comparison_table', name: 'Comparison Table (Feature: WA Value | Competitor Value per line)', type: 'multi_line_text_field' },
      { key: 'verdict', name: 'Verdict / Recommendation', type: 'multi_line_text_field' },
      { key: 'collection_link', name: 'CTA Collection URL', type: 'single_line_text_field' },
      { key: 'faq_data', name: 'FAQ Data (JSON array of {question, answer})', type: 'json' },
    ],
  },
];

async function main() {
  console.log('=== Creating Brand Comparison Metaobject Definition ===\n');

  for (const def of definitions) {
    console.log(`Creating: ${def.name} (${def.type})...`);
    const result = await graphql(CREATE_DEFINITION, { definition: def });

    const data = result.data?.metaobjectDefinitionCreate;
    if (data?.userErrors?.length > 0) {
      console.log(`  ⚠ Errors:`, data.userErrors.map(e => e.message).join(', '));
      if (data.userErrors.some(e => e.message.includes('already exists'))) {
        console.log(`  → Already exists, skipping.`);
      }
    } else if (data?.metaobjectDefinition) {
      console.log(`  ✓ Created: ${data.metaobjectDefinition.id}`);
    } else {
      console.log(`  ✗ Unexpected response:`, JSON.stringify(result.errors || result, null, 2));
    }

    await sleep(500);
  }

  console.log('\n=== Done ===');
}

main().catch(console.error);
