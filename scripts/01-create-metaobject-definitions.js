/**
 * Step 1: Create Metaobject Definitions
 * - FAQ Item
 * - Fabric Glossary Term
 * - Style Comparison
 * - Use Case / Occasion
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
    name: 'FAQ Item',
    type: 'faq_item',
    access: { storefront: 'PUBLIC_READ' },
    fieldDefinitions: [
      { key: 'question', name: 'Question', type: 'single_line_text_field', required: true },
      { key: 'answer', name: 'Answer', type: 'multi_line_text_field', required: true },
    ],
  },
  {
    name: 'Fabric Glossary Term',
    type: 'fabric_glossary_term',
    access: { storefront: 'PUBLIC_READ' },
    fieldDefinitions: [
      { key: 'term_name', name: 'Term Name', type: 'single_line_text_field', required: true },
      { key: 'seo_title', name: 'SEO Title (max 60)', type: 'single_line_text_field' },
      { key: 'seo_description', name: 'SEO Description (max 160)', type: 'multi_line_text_field' },
      { key: 'short_definition', name: 'Short Definition', type: 'multi_line_text_field', required: true },
      { key: 'full_definition', name: 'Full Definition (Rich Text)', type: 'multi_line_text_field' },
      { key: 'properties', name: 'Key Properties', type: 'multi_line_text_field' },
      { key: 'care_tips', name: 'Care Tips', type: 'multi_line_text_field' },
      { key: 'category', name: 'Category', type: 'single_line_text_field' },
      { key: 'last_updated', name: 'Last Updated', type: 'single_line_text_field' },
    ],
  },
  {
    name: 'Style Comparison',
    type: 'style_comparison',
    access: { storefront: 'PUBLIC_READ' },
    fieldDefinitions: [
      { key: 'heading', name: 'H1 Heading', type: 'single_line_text_field', required: true },
      { key: 'seo_title', name: 'SEO Title (max 60)', type: 'single_line_text_field' },
      { key: 'seo_description', name: 'SEO Description (max 160)', type: 'multi_line_text_field' },
      { key: 'intro_text', name: 'Introduction', type: 'multi_line_text_field' },
      { key: 'item_a_name', name: 'Item A Name', type: 'single_line_text_field', required: true },
      { key: 'item_a_pros', name: 'Item A Pros', type: 'multi_line_text_field' },
      { key: 'item_a_cons', name: 'Item A Cons', type: 'multi_line_text_field' },
      { key: 'item_b_name', name: 'Item B Name', type: 'single_line_text_field', required: true },
      { key: 'item_b_pros', name: 'Item B Pros', type: 'multi_line_text_field' },
      { key: 'item_b_cons', name: 'Item B Cons', type: 'multi_line_text_field' },
      { key: 'verdict', name: 'Verdict / Recommendation', type: 'multi_line_text_field' },
      { key: 'category', name: 'Category', type: 'single_line_text_field' },
      { key: 'last_updated', name: 'Last Updated', type: 'single_line_text_field' },
    ],
  },
  {
    name: 'Use Case Guide',
    type: 'use_case_guide',
    access: { storefront: 'PUBLIC_READ' },
    fieldDefinitions: [
      { key: 'heading', name: 'H1 Heading', type: 'single_line_text_field', required: true },
      { key: 'seo_title', name: 'SEO Title (max 60)', type: 'single_line_text_field' },
      { key: 'seo_description', name: 'SEO Description (max 160)', type: 'multi_line_text_field' },
      { key: 'intro_text', name: 'Introduction', type: 'multi_line_text_field' },
      { key: 'occasion', name: 'Occasion / Use Case', type: 'single_line_text_field', required: true },
      { key: 'style_tips', name: 'Style Tips', type: 'multi_line_text_field' },
      { key: 'recommended_pieces', name: 'Recommended Pieces', type: 'multi_line_text_field' },
      { key: 'dos_and_donts', name: "Do's and Don'ts", type: 'multi_line_text_field' },
      { key: 'category', name: 'Category', type: 'single_line_text_field' },
      { key: 'last_updated', name: 'Last Updated', type: 'single_line_text_field' },
    ],
  },
];

async function main() {
  console.log('=== Creating Metaobject Definitions ===\n');

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
