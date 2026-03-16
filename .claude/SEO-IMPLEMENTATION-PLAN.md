# William Ashford — SEO Implementation Plan
Generated: March 2026 | Based on Audit v3 (Score: 79/100) + Content Quality + Hub Scaling Plan

## Baseline
| Metric | Now | Target |
|--------|-----|--------|
| SEO Score | 79/100 | 92+ |
| E-E-A-T Score | 58/100 | 82+ |
| AI Citation Score | 65/100 | 85+ |
| Indexed URLs | ~140 | ~230 |
| Spoke Pages | ~63 | ~106 |
| Avg Word Count (CMS) | 425–494 | 600–800+ |

---

## Phase 1 — Foundation Fixes (Days 1–3)
> Fix critical issues that actively harm rankings or signal low quality to Google.

### 1A. ✅ robots.txt — FIXED
**Issue:** `robots.default_groups` inherited a broad `Disallow: /` from Shopify's password-protection/dev-mode setting, blocking all crawlers.
**Fix Applied:** Replaced with explicit rules per crawler. `Allow: /` now stated for Googlebot, Bingbot, and `*`. AI training bots blocked. AI search bots (PerplexityBot, ChatGPT-User, OAI-SearchBot) allowed.

**File:** `templates/robots.txt.liquid`

### 1B. Fix Author Attribution (Affects ~70 pages)
**Issue:** Article/BlogPosting schema has empty `author` field. 5/6 CMS pages have no author. All blog posts have empty whitespace in author field. No visible byline on any page.
**Why it matters:** Google's Helpful Content guidelines explicitly weight author attribution. Empty schema is worse than no schema.

**Action:**
- In `snippets/microdata-schema.liquid`, populate author as:
  ```json
  "author": {
    "@type": "Person",
    "name": "William Ashford Editorial Team",
    "url": "/pages/about-us"
  }
  ```
- Add `datePublished` and `dateModified` to all Article and BlogPosting schema (only 1/11 pages has this now)
- Add a visible byline at the top of each CMS page template

### 1C. Clean HTML Sitemaps — Remove ~36 Dead URLs
**Issue:** `/pages/sitemap-style-guides`, `/pages/sitemap-fabric-glossary`, `/pages/sitemap-comparisons` still reference removed suit pages (404) and duplicate `-1` suffix URLs.
**Action (Shopify Admin):**
- Go to each sitemap page, remove all suit/tailoring links
- Remove all URLs with `-1` suffixes (Shopify duplicates)
- Verify every remaining URL returns 200

### 1D. Add Missing Meta Descriptions (7 pages)
| Page | Recommended Description | Chars |
|------|------------------------|-------|
| /pages/about-us | "William Ashford is a Hyderabad-based menswear brand crafting premium cargo pants and chinos from 100% cotton. Founded 2024. Free shipping across India." | 153 |
| /pages/cargo-lab | "See how William Ashford cargo pants are made — from fabric selection to enzyme washing. 100% cotton twill, designed and tested in Hyderabad." | 146 |
| /collections/all | "Shop all William Ashford menswear — premium cargo pants, chinos, and utility trousers. 100% cotton, enzyme-washed. Starting at Rs. 1,599." | 148 |
| /pages/fabric-glossary | "Learn about cargo pants fabrics — cotton twill, ripstop, canvas, stretch cotton, and more. Properties, care tips, and what to look for." | 144 |
| /pages/style-comparisons | "Cargo pants vs chinos, joggers, shorts, and more. Side-by-side comparisons to help you pick the right style for every occasion." | 133 |
| /pages/style-guides | "How to style cargo pants and chinos for every look. Black cargo outfits, olive combos, college fits, and buying guides from William Ashford." | 148 |
| /pages/occasions | "Cargo pants outfit guides for college, work, travel, hiking, dates, monsoon, and festivals. Find the right look for every occasion." | 137 |

Also: Shorten Rugged Zip Cargo Pant product meta description from 320 chars → 155 chars.

### 1E. Fix Broken URLs
- `/pages/linen-fabric` → 404. Create this page (linen is summer-cargo-relevant) or redirect to fabric-glossary.
- Set up 301 redirects in Shopify for removed suit pages:

| Old URL (404) | Redirect To |
|--------------|-------------|
| /pages/how-to-style-a-navy-suit | /pages/how-to-style-black-cargo-pants |
| /pages/how-to-style-a-grey-suit | /pages/olive-cargo-outfits |
| /pages/how-to-style-a-charcoal-suit | /pages/how-to-style-black-cargo-pants |
| /pages/linen-suits-for-summer | /pages/best-cargo-pants-for-summer-india |
| /pages/black-tie-dress-code-guide | /pages/style-guides |
| /pages/super-100s-wool | /pages/fabric-glossary |
| /pages/super-120s-wool | /pages/fabric-glossary |
| /pages/bespoke-vs-made-to-measure | /pages/style-comparisons |
| /pages/italian-vs-british-tailoring | /pages/style-comparisons |

### 1F. Fix Buying Guides Hub
- Remove duplicate H1 tag (has both "Buying Guides | William Ashford" and "Cargo Pants Buying Guides")
- Add CollectionPage + ItemList schema (currently only has BreadcrumbList)

**Expected score after Phase 1:** SEO 83 | E-E-A-T 68 | AI Citation 72

---

## Phase 2 — Content Quality (Days 3–10)
> Fix the template issues that Google quality raters flag as AI/programmatic content signals.

### 2A. Diversify Heading Structures (CRITICAL — all CMS pages use identical H2s)
**Issue:** Every CMS page has the exact same structure: `Style Tips → Recommended Pieces → Do's and Don'ts → Shop the Look → Explore More`. This is a scaled content abuse signal.

**Create 4 distinct templates:**

**Comparison pages** (`pseo-comparison.liquid`):
```
H2: Key Differences | H2: [Option A] Deep Dive | H2: [Option B] Deep Dive
H2: Side-by-Side Comparison Table | H2: Our Verdict | H2: Shop
```

**Style Guide pages** (`pseo-style-guide.liquid`):
```
H2: Why This Works | H2: Outfit 1: [specific look] | H2: Outfit 2: [specific look]
H2: Outfit 3: [specific look] | H2: Styling Tips | H2: What to Avoid | H2: Shop
```

**Occasion pages** (`pseo-use-case.liquid`):
```
H2: Why Cargo Pants for [Occasion] | H2: What to Wear | H2: Do's & Don'ts
H2: Weather & Season Tips | H2: Real Outfit Examples | H2: Shop
```

**Buying Guide pages** (new template or new section variant):
```
H2: What to Look For | H2: Our Top Picks | H2: Price vs Value Breakdown
H2: Buying Checklist | H2: Avoid These Mistakes | H2: Shop
```

### 2B. Expand CMS Pages to 600–800 Words (Currently 425–494)
Each page needs +150–350 words of genuine content:
- Add "Why This Matters" intro paragraph (unique per page)
- Add a comparison/data table (fabric weight, price, pros/cons)
- Add India-specific context (weather, cities, occasions, pricing)
- Add "Related Guides" section with 3–5 cross-pillar links (see 2C)

Pages to expand:
- cargo-pants-vs-chinos (494 → 700+)
- what-is-cotton-twill (467 → 600+)
- cargo-pants-for-college (471 → 700+)
- best-cargo-pants-under-1500 (479 → 700+)
- how-to-style-black-cargo-pants (464 → 700+)
- cargo-pants-for-travel (425 → 700+)

### 2C. Add 3–5 Cross-Pillar Links to Every Spoke Page
**Issue:** Each CMS page has exactly 1 topical link. Blog posts have 9–13. Replicate blog pattern.

**Cross-link map (priority connections):**
| Source | Link 1 (Fabric) | Link 2 (Comparison) | Link 3 (Occasion/Buying) |
|--------|----------------|---------------------|--------------------------|
| Cotton Twill | — | Cargo vs Chinos | Best for Summer |
| Ripstop | — | Cotton vs Polyester | Cargo for Hiking |
| Black Cargo Styling | — | Olive vs Black | Cargo for Date Night |
| College Occasion | — | Cargo vs Joggers | Best Under Rs.1500 |
| Travel Occasion | Ripstop | 6-Pocket vs 4-Pocket | How to Choose Cargos |
| Cargo vs Chinos | Cotton Twill | — | Chinos for Interview |

Full cross-link map in `williamashford-hub-scaling-plan.html`.

### 2D. Customize "Shop the Look" Products Per Page
**Issue:** Every single page links to the same 4 Rugged Zip Cargo variants. Topic-irrelevant recommendations.

- Hiking page → ripstop/canvas cargos
- College page → most affordable + black cargos
- Summer page → lightest-weight cargos
- Styling pages → the color featured in the guide
- Comparison pages → both options compared

### 2E. Add datePublished / dateModified to All Content Pages
Only 1/11 audited pages has dates in schema. All Article and BlogPosting schema must have:
```json
"datePublished": "2024-XX-XX",
"dateModified": "2026-03-XX"
```
Critical for AI citation freshness signals.

**Expected score after Phase 2:** SEO 87 | E-E-A-T 74 | AI Citation 78

---

## Phase 3 — Expansion (Weeks 2–4)
> Build on a now-quality foundation. New pages must use the diversified templates from Phase 2.

### 3A. Expand Blog Posts to 1,500+ Words (Currently 1,076–1,122)
Add 400–500 words to each of the 5 blog posts:
- More H3 subheadings for depth
- A comparison table
- India-specific context (cities, weather, occasions)
- Original data points where possible (testing, customer surveys)

### 3B. Create 25 New Spoke Pages (Keyword Gaps)

**Fabric Glossary (+5):**
| URL | Target Keyword | Priority |
|-----|---------------|----------|
| /pages/what-is-french-terry | french terry fabric | HIGH |
| /pages/cotton-vs-cotton-blend | 100% cotton vs cotton blend pants | HIGH |
| /pages/what-is-gsm-weight-guide | GSM meaning in fabric India | HIGH |
| /pages/what-is-oxford-cotton | oxford cotton fabric | MEDIUM |
| /pages/fabric-care-guide | how to care for cargo pants fabric | MEDIUM |

**Style Comparisons (+7):**
| URL | Target Keyword | Priority |
|-----|---------------|----------|
| /pages/cargo-pants-vs-parachute-pants | cargo pants vs parachute pants | HIGH |
| /pages/loose-fit-vs-tapered-cargo | loose fit vs tapered cargo pants | HIGH |
| /pages/cotton-cargo-vs-polyester-cargo | cotton cargo pants vs polyester | HIGH |
| /pages/baggy-cargo-vs-slim-cargo | baggy cargo pants vs slim fit | HIGH |
| /pages/cargo-pants-vs-carpenter-pants | cargo vs carpenter pants | MEDIUM |
| /pages/cargo-pants-vs-tactical-pants | cargo pants vs tactical pants | MEDIUM |
| /pages/enzyme-wash-vs-stone-wash | enzyme wash vs stone wash | MEDIUM |

**Style Guides (+7):**
| URL | Target Keyword | Priority |
|-----|---------------|----------|
| /pages/cargo-pants-outfit-ideas-men | cargo pants outfit ideas men India | CRITICAL |
| /pages/cargo-pants-with-shirt-combinations | cargo pants shirt combination men | HIGH |
| /pages/how-to-style-beige-cargo-pants | beige cargo pants outfit men | HIGH |
| /pages/how-to-style-brown-cargo-pants | brown cargo pants outfit men | HIGH |
| /pages/oversized-tshirt-with-cargo-pants | oversized t-shirt cargo pants outfit | HIGH |
| /pages/cargo-pants-with-sneakers | cargo pants sneakers outfit | MEDIUM |
| /pages/how-to-cuff-cargo-pants | how to cuff cargo pants | MEDIUM |

**Occasions (+4):**
| URL | Target Keyword | Priority |
|-----|---------------|----------|
| /pages/cargo-pants-for-streetwear | streetwear cargo pants India | HIGH |
| /pages/cargo-pants-for-road-trip | cargo pants road trip outfit | MEDIUM |
| /pages/cargo-pants-for-weekend | weekend outfit men cargo pants | MEDIUM |
| /pages/cargo-pants-for-concert | concert outfit men India | MEDIUM |

**Buying Guides (+2):**
| URL | Target Keyword | Priority |
|-----|---------------|----------|
| /pages/best-cargo-pants-under-2000 | best cargo pants under 2000 India | HIGH |
| /pages/beginners-guide-to-cargo-pants | cargo pants guide for beginners | MEDIUM |

> All 25 pages: 600+ words, diversified templates, 3–5 cross-pillar links, custom product recommendations, datePublished in schema.

### 3C. Add First-Party Data to 10 Key Pages
This is the #1 lever for AI citation. Weave in unique, quotable data:
- "Our 260 GSM cotton twill passed 50-wash testing with less than 3% shrinkage"
- "Customer surveys show 73% of our buyers choose black as their first cargo color"
- "In Mumbai humidity (avg 85% RH), cotton twill breathes 3× better than polyester"
- "We tested 5 GSM weights over 6 months — 260 GSM is the sweet spot for Indian climates"

Target: Cotton Twill, Ripstop, fabric GSM guide, cargo vs chinos, Black Cargo Styling, best under 1500, 3 blog posts.

### 3D. pSEO API Expansion — Run setup-api.js (~93 pages)
**Script:** `seo-setup/setup-api.js`
**Steps to complete:**
- Step 4: Create all ~93 pSEO pages (40 exist, +53 new)
- Step 5: Upsert all metaobject entries (`use_case_guide`, `style_comparison`, `fabric_glossary_term`)
- Step 6: Publish all pSEO pages (set `isPublished: true`)
- Command: `node seo-setup/setup-api.js --token <SHOPIFY_ACCESS_TOKEN>`

### 3E. Technical Fixes
- Add `sameAs` (Instagram, Facebook URLs) to Organization schema
- Add full `PostalAddress` (Hyderabad) to Organization schema
- Add a clear H1 to the homepage (currently missing)
- Fix product URLs: rename numeric suffixes to color descriptors + 301 redirects

**Expected score after Phase 3:** SEO 90 | E-E-A-T 80 | AI Citation 82

---

## Phase 4 — Growth Hubs (Weeks 4–8)
> Build new content pillars that capture high-intent traffic from brand comparison and color queries.

### 4A. Brand Comparisons Hub — NEW
**URL:** /pages/brand-comparisons
**Template:** `sections/pseo-brand-comparison.liquid` ✅ (already created)

**10 spoke pages to create:**
| URL | Target |
|-----|--------|
| /pages/best-cargo-pants-brands-india | best cargo pants brands India | CRITICAL |
| /pages/william-ashford-vs-urban-monkey | william ashford vs urban monkey | HIGH |
| /pages/william-ashford-vs-bewakoof | william ashford vs bewakoof | HIGH |
| /pages/william-ashford-vs-snitch | william ashford vs snitch | HIGH |
| /pages/william-ashford-vs-roadster | william ashford vs roadster | HIGH |
| /pages/william-ashford-vs-nobero | william ashford vs nobero | HIGH |
| /pages/william-ashford-vs-veirdo | william ashford vs veirdo | MEDIUM |
| /pages/william-ashford-vs-beyoung | william ashford vs beyoung | MEDIUM |
| /pages/cargo-pants-quality-comparison-india | premium vs budget cargo pants India | MEDIUM |
| /pages/why-choose-william-ashford | why buy from william ashford | MEDIUM |

### 4B. Color Guides Hub — EXPAND
**URL:** /pages/cargo-color-guides (new)
Move 3 existing color guides. Create 4 new:
- /pages/how-to-style-beige-cargo-pants (also in Phase 3)
- /pages/how-to-style-brown-cargo-pants (also in Phase 3)
- /pages/how-to-style-grey-cargo-pants
- /pages/best-cargo-colors-2026 (trend piece)

### 4C. Blog Cadence (2+ posts/month)
**Priority topics:**
- Monsoon Cargo Guide (seasonal, June 2026)
- How to Size Cargo Pants Without Trying On (purchase intent)
- Festival Outfits 2026 (seasonal)
- Cargo Pants Care & Maintenance Guide
- 10 Best Cargo Pants Outfits for Indian Summer

**Expected score after Phase 4:** SEO 92+ | E-E-A-T 82+ | AI Citation 85+

---

## Programmatic SEO Quality Gates

Per the pSEO framework, all programmatic pages must pass these before publishing:

| Gate | Threshold | Status |
|------|-----------|--------|
| Unique content % | ≥40% per page | ⚠️ Current CMS pages: ~35% — NEEDS TEMPLATE DIVERSIFICATION (Phase 2A) |
| Word count | ≥500 for guides, ≥400 for glossary | ❌ Current: 425–494 — EXPAND (Phase 2B) |
| Author attribution | Required on all pages | ❌ BROKEN — Fix first (Phase 1B) |
| Cross-pillar links | 3–5 per page | ⚠️ Current: 1 per page — Fix in Phase 2C |
| Schema completeness | author, datePublished, BreadcrumbList | ❌ author + dates missing |
| Custom product links | Topic-relevant, not identical | ❌ All pages link same 4 products |

**Publishing rule:** Do NOT publish the new ~53 pSEO pages until Phase 2 template fixes are in place. New pages built on the current broken template inherit all its weaknesses.

---

## Summary Timeline

| Phase | Timeline | Key Deliverable | Score Target |
|-------|----------|----------------|--------------|
| 1 | Days 1–3 | robots.txt fixed ✅, author schema, clean sitemaps, meta descriptions | 83/100 |
| 2 | Days 3–10 | Template diversity, 600+ words, cross-links, product customization | 87/100 |
| 3 | Weeks 2–4 | 25 new spoke pages, blog expansion, pSEO API run | 90/100 |
| 4 | Weeks 4–8 | Brand comparisons hub, color guides, blog cadence | 92+/100 |

**The critical sequencing rule:** Fix quality first (Phase 1–2), then expand (Phase 3), then build new pillars (Phase 4). Scaling on a broken template multiplies the problems.
