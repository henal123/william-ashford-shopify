/**
 * Phase 1 SEO Fixes
 * 1D — Meta descriptions for key pages and collections
 * 1E — 301 URL redirects for orphaned/stale pages
 * 1F — Fix buying-guides hub duplicate H1 in body HTML
 *
 * Usage:
 *   node scripts/14-phase1-seo-fixes.js                  # run all
 *   node scripts/14-phase1-seo-fixes.js --redirects      # only redirects
 *   node scripts/14-phase1-seo-fixes.js --meta           # only meta descriptions
 *   node scripts/14-phase1-seo-fixes.js --hub-fix        # only hub H1 fix
 */

const { graphql, sleep } = require('./shopify-api');

// ---------------------------------------------------------------------------
// Phase 1E — URL Redirects
// ---------------------------------------------------------------------------

const redirects = [
  { path: '/pages/how-to-style-a-navy-suit', target: '/pages/how-to-style-black-cargo-pants' },
  { path: '/pages/how-to-style-a-grey-suit', target: '/pages/olive-cargo-outfits' },
  { path: '/pages/how-to-style-a-charcoal-suit', target: '/pages/how-to-style-black-cargo-pants' },
  { path: '/pages/linen-suits-for-summer', target: '/pages/best-cargo-pants-for-summer-india' },
  { path: '/pages/black-tie-dress-code-guide', target: '/pages/style-guides' },
  { path: '/pages/funeral-attire-men', target: '/pages/how-to-style-black-cargo-pants' },
  { path: '/pages/super-100s-wool', target: '/pages/fabric-glossary' },
  { path: '/pages/super-120s-wool', target: '/pages/fabric-glossary' },
  { path: '/pages/bespoke-vs-made-to-measure', target: '/pages/style-comparisons' },
  { path: '/pages/italian-vs-british-tailoring', target: '/pages/style-comparisons' },
];

const URL_REDIRECT_CREATE = `
  mutation urlRedirectCreate($urlRedirect: UrlRedirectInput!) {
    urlRedirectCreate(urlRedirect: $urlRedirect) {
      urlRedirect { id path target }
      userErrors { field message }
    }
  }
`;

async function createRedirects() {
  console.log('--- Phase 1E: Creating URL Redirects ---');
  for (const r of redirects) {
    const res = await graphql(URL_REDIRECT_CREATE, { urlRedirect: { path: r.path, target: r.target } });
    const result = res.data?.urlRedirectCreate;
    if (result?.userErrors?.length) {
      console.warn(`  WARN ${r.path} →`, result.userErrors.map(e => e.message).join(', '));
    } else if (result?.urlRedirect) {
      console.log(`  ✓ ${r.path} → ${r.target}`);
    } else {
      console.warn(`  WARN unexpected response for ${r.path}:`, JSON.stringify(res));
    }
    await sleep(300);
  }
}

// ---------------------------------------------------------------------------
// Phase 1D — Meta Descriptions (pages + collection)
// ---------------------------------------------------------------------------

const pageMetaDescs = [
  {
    handle: 'about-us',
    desc: 'William Ashford is a Hyderabad-based menswear brand crafting premium cargo pants and chinos from 100% cotton. Founded 2024. Free shipping across India.',
  },
  {
    handle: 'cargo-lab',
    desc: 'See how William Ashford cargo pants are made — from fabric selection to enzyme washing. 100% cotton twill, designed and tested in Hyderabad.',
  },
  {
    handle: 'fabric-glossary',
    desc: 'Learn about cargo pants fabrics — cotton twill, ripstop, canvas, stretch cotton, and more. Properties, care tips, and what to look for.',
  },
  {
    handle: 'style-comparisons',
    desc: 'Cargo pants vs chinos, joggers, shorts, and more. Side-by-side comparisons to help you pick the right style for every occasion.',
  },
  {
    handle: 'style-guides',
    desc: 'How to style cargo pants and chinos for every look. Black cargo outfits, olive combos, college fits, and buying guides from William Ashford.',
  },
  {
    handle: 'occasions',
    desc: 'Cargo pants outfit guides for college, work, travel, hiking, dates, monsoon, and festivals. Find the right look for every occasion.',
  },
];

const GET_PAGE_ID = `
  query getPageId($query: String!) {
    pages(first: 1, query: $query) {
      edges { node { id handle } }
    }
  }
`;

const PAGE_UPDATE = `
  mutation pageUpdate($id: ID!, $page: PageUpdateInput!) {
    pageUpdate(id: $id, page: $page) {
      page { id handle }
      userErrors { field message }
    }
  }
`;

const GET_COLLECTION_ID = `
  query getCollectionId {
    collectionByHandle(handle: "all") {
      id
      title
    }
  }
`;

const COLLECTION_UPDATE = `
  mutation collectionUpdate($input: CollectionInput!) {
    collectionUpdate(input: $input) {
      collection { id title }
      userErrors { field message }
    }
  }
`;

async function updateMetaDescriptions() {
  console.log('--- Phase 1D: Updating Meta Descriptions ---');

  // Update page meta descriptions
  for (const { handle, desc } of pageMetaDescs) {
    // Look up page ID
    const lookup = await graphql(GET_PAGE_ID, { query: 'handle:' + handle });
    const edges = lookup.data?.pages?.edges;
    if (!edges || edges.length === 0) {
      console.warn(`  WARN page not found: ${handle}`);
      await sleep(300);
      continue;
    }
    const id = edges[0].node.id;

    // Update metafield
    const res = await graphql(PAGE_UPDATE, {
      id,
      page: {
        metafields: [
          {
            namespace: 'global',
            key: 'description_tag',
            type: 'multi_line_text_field',
            value: desc,
          },
        ],
      },
    });
    const result = res.data?.pageUpdate;
    if (result?.userErrors?.length) {
      console.warn(`  WARN ${handle}:`, result.userErrors.map(e => e.message).join(', '));
    } else if (result?.page) {
      console.log(`  ✓ page/${handle} meta description updated`);
    } else {
      console.warn(`  WARN unexpected response for page/${handle}:`, JSON.stringify(res));
    }
    await sleep(300);
  }

  // Update collections/all meta description
  const colLookup = await graphql(GET_COLLECTION_ID);
  const colId = colLookup.data?.collectionByHandle?.id;
  if (!colId) {
    console.warn('  WARN collection "all" not found');
  } else {
    const colRes = await graphql(COLLECTION_UPDATE, {
      input: {
        id: colId,
        metafields: [
          {
            namespace: 'global',
            key: 'description_tag',
            type: 'multi_line_text_field',
            value:
              'Shop all William Ashford menswear — premium cargo pants, chinos, and utility trousers. 100% cotton, enzyme-washed. Starting at Rs. 1,599.',
          },
        ],
      },
    });
    const colResult = colRes.data?.collectionUpdate;
    if (colResult?.userErrors?.length) {
      console.warn('  WARN collection/all:', colResult.userErrors.map(e => e.message).join(', '));
    } else if (colResult?.collection) {
      console.log('  ✓ collection/all meta description updated');
    } else {
      console.warn('  WARN unexpected response for collection/all:', JSON.stringify(colRes));
    }
  }
}

// ---------------------------------------------------------------------------
// Phase 1F — Fix buying-guides hub duplicate H1
// ---------------------------------------------------------------------------

const GET_BUYING_GUIDES_PAGE = `
  query getBuyingGuidesPage {
    pages(first: 1, query: "handle:buying-guides") {
      edges { node { id handle body } }
    }
  }
`;

async function fixBuyingGuidesHub() {
  console.log('--- Phase 1F: Fix buying-guides Duplicate H1 ---');

  const lookup = await graphql(GET_BUYING_GUIDES_PAGE);
  const edges = lookup.data?.pages?.edges;
  if (!edges || edges.length === 0) {
    console.warn('  WARN page not found: buying-guides');
    return;
  }

  const { id, body } = edges[0].node;

  if (!/<h1[\s>]/i.test(body)) {
    console.log('  ✓ No H1 found in body — nothing to fix');
    return;
  }

  const cleanedBody = body.replace(/<h1[^>]*>[\s\S]*?<\/h1>/gi, '');
  console.log('  Found H1 in body, removing...');

  const res = await graphql(PAGE_UPDATE, {
    id,
    page: { bodyHtml: cleanedBody },
  });
  const result = res.data?.pageUpdate;
  if (result?.userErrors?.length) {
    console.warn('  WARN buying-guides:', result.userErrors.map(e => e.message).join(', '));
  } else if (result?.page) {
    console.log('  ✓ buying-guides H1 removed from body HTML');
  } else {
    console.warn('  WARN unexpected response:', JSON.stringify(res));
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('=== Phase 1 SEO Fixes ===\n');

  const args = process.argv.slice(2);
  const runAll = !args.length;
  const runRedirects = runAll || args.includes('--redirects');
  const runMeta = runAll || args.includes('--meta');
  const runHubFix = runAll || args.includes('--hub-fix');

  if (runRedirects) await createRedirects();
  if (runMeta) await updateMetaDescriptions();
  if (runHubFix) await fixBuyingGuidesHub();

  console.log('\n✓ Done');
}

main().catch(console.error);
