/**
 * William Ashford — Populate pSEO Metaobject Content
 *
 * Creates metaobject entries with full content for all 40 menswear pSEO pages.
 *
 * Usage:
 *   node seo-setup/populate-content.js --token=shpat_xxxxx
 */

const https = require('https');

const STORE = 'william-ashford-apex.myshopify.com';
const API_VERSION = '2024-10';
const TOKEN = process.argv.find(a => a.startsWith('--token='))?.split('=')[1]
  || process.env.SHOPIFY_ADMIN_TOKEN;

if (!TOKEN) {
  console.error('ERROR: Provide token via --token=shpat_xxxxx');
  process.exit(1);
}

function graphql(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query, variables });
    const req = https.request({
      hostname: STORE,
      path: `/admin/api/${API_VERSION}/graphql.json`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': TOKEN,
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.errors) reject(new Error(JSON.stringify(parsed.errors, null, 2)));
          else resolve(parsed.data);
        } catch (e) {
          reject(new Error(`Parse error: ${data.substring(0, 300)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function createMetaobject(type, handle, fields) {
  const result = await graphql(`
    mutation CreateMetaobject($metaobject: MetaobjectCreateInput!) {
      metaobjectCreate(metaobject: $metaobject) {
        metaobject { id handle }
        userErrors { field message }
      }
    }
  `, {
    metaobject: {
      type,
      handle,
      fields: Object.entries(fields).map(([key, value]) => ({
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value),
      })),
    },
  });

  const res = result.metaobjectCreate;
  if (res.userErrors?.length > 0) {
    const exists = res.userErrors.some(e => e.message.toLowerCase().includes('handle') || e.message.toLowerCase().includes('taken'));
    if (exists) return 'EXISTS';
    throw new Error(res.userErrors.map(e => e.message).join(', '));
  }
  return 'OK';
}

// ============================================================
// CONTENT DATA
// ============================================================

const styleGuides = [
  {
    handle: 'how-to-style-a-navy-suit',
    heading: 'How to Style a Navy Suit',
    seo_title: 'How to Style a Navy Suit | William Ashford',
    seo_description: 'Complete guide to styling a navy suit for work, weddings, and smart occasions. Shirt, tie, and shoe pairings from William Ashford.',
    intro_text: 'The navy suit is the foundation of every man\'s wardrobe. More versatile than black, sharper than grey, it works in the boardroom, at weddings, and everywhere in between. This guide covers exactly how to wear it — shirts, ties, shoes, and the occasions that call for each combination.',
    style_tips: 'Start with a white dress shirt — it is the most reliable pairing and works for every occasion\nBrown shoes (tan, cognac, or chocolate) complement navy better than black in most settings\nA burgundy or wine-coloured tie adds depth without competing with the suit\nFor summer, swap the tie for an open collar and add suede loafers\nPocket squares should complement, not match, your tie — try a white linen square\nKeep your belt colour consistent with your shoes — always',
    recommended_pieces: 'Navy two-piece suit in Super 120s wool\nWhite poplin dress shirt with spread collar\nBurgundy silk tie\nTan or cognac leather Oxford shoes\nWhite linen pocket square\nDark brown leather belt',
    dos_and_donts: 'Invest in proper tailoring — even the best navy suit looks average if it doesn\'t fit\nMatch your metals — silver watch with silver cufflinks\nWear navy with confidence at interviews, client meetings, and weddings\nDon\'t wear a navy tie with a navy suit — it blends and looks flat\nAvoid black shoes with navy unless the event is strictly formal\nNever wear white socks — match socks to your trousers, not your shoes',
    collection_link: '/collections/all',
    faq_data: [
      { question: 'What colour shirt goes best with a navy suit?', answer: 'White is the most versatile and universally appropriate. Light blue is a strong second choice for less formal settings. Pink works well for spring and summer occasions.' },
      { question: 'Can I wear brown shoes with a navy suit?', answer: 'Yes — brown shoes are one of the best pairings with a navy suit. Tan and cognac work for daytime and smart-casual, while darker brown suits more formal events.' },
      { question: 'Is a navy suit appropriate for a wedding?', answer: 'Absolutely. A navy suit is one of the most popular choices for wedding guests. Pair with a pastel tie and brown shoes for daytime, or a dark tie and black shoes for an evening ceremony.' },
      { question: 'What tie colours work with a navy suit?', answer: 'Burgundy, deep red, gold, forest green, and silver all pair beautifully with navy. Avoid navy-on-navy as it creates a flat, washed-out look.' }
    ],
  },
  {
    handle: 'how-to-style-a-grey-suit',
    heading: 'How to Style a Grey Suit',
    seo_title: 'How to Style a Grey Suit | William Ashford',
    seo_description: 'Grey suit styling guide for men. Colour combinations, shirt choices, and occasion tips from William Ashford.',
    intro_text: 'Grey is the chameleon of suit colours. A light grey suit is relaxed and warm-weather ready. A mid-grey is the ultimate all-rounder. The key is knowing which shade to wear and what to pair it with — this guide breaks it down by shade, occasion, and season.',
    style_tips: 'Light grey suits pair best with pastel shirts — try pale blue or soft pink\nMid-grey is the safest bet for your first grey suit — it works year-round\nA navy tie with a grey suit is one of the most classic colour combinations in menswear\nBlack shoes sharpen a grey suit for formal occasions; brown shoes soften it for daytime\nFor texture, consider a grey flannel suit in autumn and winter\nCharcoal shirts under grey suits create a modern, monochromatic look',
    recommended_pieces: 'Mid-grey worsted wool suit\nPale blue dress shirt\nNavy silk knit tie\nBlack cap-toe Oxford shoes\nNavy pocket square with white border\nSilver-tone watch',
    dos_and_donts: 'Experiment with tie colours — grey is the most tie-friendly suit colour\nWear lighter grey in spring and summer, darker grey in autumn and winter\nConsider grey as your second suit after navy\nDon\'t pair light grey with light grey shirts — the contrast is too low\nAvoid overly bright ties that make the suit look cheap\nNever wear grey socks with brown shoes — match to trousers',
    collection_link: '/collections/all',
    faq_data: [
      { question: 'What shade of grey suit is most versatile?', answer: 'Mid-grey is the most versatile shade. It works for business, weddings, and smart-casual events across all seasons. Light grey skews more casual, while charcoal is more formal.' },
      { question: 'Can I wear a grey suit to a funeral?', answer: 'Dark charcoal grey is acceptable for funerals. Avoid light or mid-grey — they are too casual for the occasion.' },
      { question: 'What shoes go with a grey suit?', answer: 'Both black and brown shoes work with grey suits. Black is more formal, brown is more relaxed. Burgundy or oxblood shoes also pair beautifully with grey.' }
    ],
  },
  {
    handle: 'how-to-style-a-charcoal-suit',
    heading: 'How to Style a Charcoal Suit',
    seo_title: 'How to Style a Charcoal Suit | William Ashford',
    seo_description: 'Charcoal suit outfit ideas for men. The most versatile dark suit colour — worn right, from William Ashford.',
    intro_text: 'Charcoal is the dark suit that isn\'t black. It carries the same authority without the severity, making it the most versatile dark suit in your wardrobe. From boardrooms to black-tie-adjacent events, charcoal adapts. Here is how to style it for every situation.',
    style_tips: 'A white shirt with a charcoal suit is the sharpest combination for business\nCharcoal works with both black and brown shoes — choose based on formality\nA silver or pale grey tie creates an elegant tonal look\nFor contrast, try a lavender or soft pink shirt under charcoal\nCharcoal flannel is exceptional in winter — the texture adds visual interest\nKeep accessories minimal — charcoal is already commanding',
    recommended_pieces: 'Charcoal two-piece suit in Super 110s wool\nCrisp white poplin shirt\nSilver-grey silk tie\nBlack leather Oxford shoes\nWhite cotton pocket square\nGunmetal cufflinks',
    dos_and_donts: 'Wear charcoal when you want the authority of black without the starkness\nPair with a white shirt for the most reliable professional look\nChoose charcoal over black for most business occasions\nDon\'t confuse charcoal with mid-grey — charcoal should be distinctly dark\nAvoid matching charcoal with dark navy — the tones are too close and clash subtly\nNever wear a charcoal suit with a black shirt — it looks dated',
    collection_link: '/collections/all',
    faq_data: [
      { question: 'Is charcoal better than black for a suit?', answer: 'For most occasions, yes. Charcoal is less severe than black, more versatile across events, and more flattering in daylight. Black suits are best reserved for formal evening events and funerals.' },
      { question: 'What tie goes with a charcoal suit?', answer: 'Almost any colour works — that is the beauty of charcoal. Silver, burgundy, navy, deep purple, and forest green are all excellent choices.' }
    ],
  },
  {
    handle: 'suit-with-brown-shoes',
    heading: 'How to Wear a Suit with Brown Shoes',
    seo_title: 'How to Wear a Suit with Brown Shoes | William Ashford',
    seo_description: 'Which suit colours work with brown shoes? Shade matching, belt rules, and styling tips from William Ashford.',
    intro_text: 'Brown shoes with a suit is one of menswear\'s most reliable combinations — when done right. The key lies in matching the shade of brown to the suit colour and the formality of the event. This guide breaks down exactly which browns work with which suits, and when to reach for brown over black.',
    style_tips: 'Tan and light brown shoes pair best with navy and light grey suits\nDark brown (chocolate or espresso) works with charcoal and mid-grey suits\nCognac is the most versatile brown — it works with almost every suit colour\nAlways match your belt to your shoes — this is non-negotiable\nSuede brown shoes are excellent for summer suits and smart-casual looks\nBrogues in brown are slightly less formal than plain Oxfords — choose accordingly',
    recommended_pieces: 'Cognac leather Oxford shoes\nTan leather Derby shoes for smart-casual\nDark brown suede loafers for summer\nMatching brown leather belt\nNavy or grey suit to pair with',
    dos_and_donts: 'Match your belt leather to your shoe leather — same colour, same finish\nWear brown shoes with navy suits — it is one of the best combinations in menswear\nChoose darker brown for more formal occasions, lighter brown for casual\nDon\'t wear tan shoes with a black suit — the contrast is too jarring\nAvoid scuffed or unpolished brown shoes — they show wear more than black\nNever wear brown shoes to a black-tie event',
    collection_link: '/collections/all',
    faq_data: [
      { question: 'Can you wear brown shoes with a black suit?', answer: 'It is generally best avoided. The stark contrast between black and brown looks unintentional. Stick to black shoes with black suits, and save your brown shoes for navy, grey, and earth-toned suits.' },
      { question: 'What shade of brown shoes goes with a navy suit?', answer: 'Almost any shade works, but cognac and tan are the most popular choices. They create a warm, balanced contrast that looks intentional and sophisticated.' }
    ],
  },
  {
    handle: 'how-to-wear-a-suit-without-a-tie',
    heading: 'How to Wear a Suit Without a Tie',
    seo_title: 'How to Wear a Suit Without a Tie | William Ashford',
    seo_description: 'Pull off a tieless suit with confidence. Collar choices, shirt options, and occasions where it works.',
    intro_text: 'The tieless suit is no longer a fashion risk — it is a modern standard. But going without a tie requires attention to collar choice, shirt fit, and the overall silhouette. Get these details right and you look sharp and contemporary. Get them wrong and you look like you forgot something.',
    style_tips: 'Choose a spread collar or cutaway collar — they hold their shape without a tie\nButton-down collars also work well for a more casual feel\nLeave only the top button undone — never two or more\nEnsure the shirt fits precisely at the neck — a loose collar looks sloppy without a tie\nTextured fabrics (linen, Oxford cloth) add visual interest that a tie would normally provide\nA pocket square becomes more important without a tie — it fills the visual gap',
    recommended_pieces: 'White or light blue spread collar dress shirt\nNavy or grey suit in modern fit\nBrown or tan leather shoes\nWhite linen pocket square\nMinimal dress watch',
    dos_and_donts: 'Invest in shirts with structured collars — the collar carries the whole look\nAdd a pocket square to compensate for the missing tie\nKeep the rest of the outfit sharp — shoes polished, suit pressed\nDon\'t leave a floppy point collar undone — it splays and looks messy\nAvoid going tieless at events where a dress code specifies ties\nNever wear a tieless suit with a visible undershirt',
    collection_link: '/collections/all',
    faq_data: [
      { question: 'Is it OK to wear a suit without a tie?', answer: 'Yes, it is widely accepted in modern business and social settings. The key is wearing a shirt with a collar that holds its shape — spread collars and button-downs are the best choices.' },
      { question: 'What collar works best without a tie?', answer: 'Spread collars and cutaway collars are ideal because they maintain their structure without a tie. Point collars tend to splay open and look untidy.' }
    ],
  },
  {
    handle: 'how-to-style-a-blazer-with-trousers',
    heading: 'How to Style a Blazer with Trousers',
    seo_title: 'How to Style a Blazer with Trousers | William Ashford',
    seo_description: 'Mix blazer and trouser combinations that look considered, not mismatched. William Ashford styling guide.',
    intro_text: 'Wearing a blazer with separate trousers is one of the most versatile looks in menswear — but it demands more thought than a matching suit. The wrong combination looks like a suit that lost its partner. The right one looks intentional, polished, and effortlessly smart.',
    style_tips: 'Contrast is key — a navy blazer with grey trousers is the gold standard\nAvoid combining colours that are too similar — navy blazer with dark grey trousers can look like a mismatched suit\nTexture contrast helps — try a wool blazer with cotton chinos\nA navy blazer with cream or tan trousers is the definitive summer combination\nKnit ties and pocket squares add personality to separates\nBrown shoes almost always look better than black with blazer and trousers',
    recommended_pieces: 'Navy wool blazer with gold or horn buttons\nMid-grey wool trousers or cream chinos\nLight blue Oxford button-down shirt\nBrown leather loafers or Derby shoes\nKnit tie in burgundy or forest green\nLinen or silk pocket square',
    dos_and_donts: 'Make the contrast between blazer and trousers obvious and intentional\nUse texture to differentiate — smooth blazer with textured trousers, or vice versa\nThink of the blazer as a sport coat — it should be versatile across outfits\nDon\'t pair a navy blazer with navy trousers — it reads as a failed suit\nAvoid matching your blazer buttons to your trouser colour\nNever wear a blazer that is clearly an orphaned suit jacket — the fabric gives it away',
    collection_link: '/collections/all',
    faq_data: [
      { question: 'What trousers go with a navy blazer?', answer: 'Grey wool trousers are the classic choice. Cream, tan, and khaki chinos work beautifully for casual settings. Even dark jeans can work for a smart-casual look.' },
      { question: 'Is a blazer and trousers as formal as a suit?', answer: 'No — separates are inherently less formal than a matching suit. They are ideal for smart-casual events, business casual offices, and social occasions where a full suit would be overdressed.' }
    ],
  },
  {
    handle: 'linen-suits-for-summer',
    heading: 'Linen Suits for Summer',
    seo_title: 'Linen Suits for Summer | William Ashford',
    seo_description: 'How to wear a linen suit in summer. Fabric guide, styling tips, and why the creasing is the point.',
    intro_text: 'Linen suits are the definitive warm-weather choice. They breathe, they drape, and yes — they crease. That is not a flaw. The relaxed texture is what makes linen look intentional rather than stuffy. Here is how to wear linen well, from fabric weight to pairing.',
    style_tips: 'Embrace the creasing — pressing your linen suit razor-sharp defeats the purpose\nBeige, stone, and light blue are the classic linen suit colours for summer\nPair with loafers (no socks) for the most authentic summer look\nA linen suit with a linen shirt can be too much texture — try a cotton shirt instead\nKeep the silhouette relaxed — linen suits should fit slightly looser than wool\nUnstructured shoulders work best for linen — no padding needed',
    recommended_pieces: 'Stone or beige linen suit\nWhite cotton poplin shirt\nBrown suede loafers\nNo tie — or a light knit tie if needed\nSunglasses with a leather case\nMinimal leather watch',
    dos_and_donts: 'Wear linen when the temperature is above 25°C — it is purpose-built for heat\nChoose natural, muted colours that complement linen\'s texture\nHang your linen suit properly between wears to let creases relax\nDon\'t iron linen to a crisp finish — it looks unnatural\nAvoid dark linen suits — they show sweat marks more easily\nNever wear heavy shoes with linen — keep everything lightweight',
    collection_link: '/collections/all',
    faq_data: [
      { question: 'Do linen suits look unprofessional?', answer: 'Not at all — linen suits are appropriate for most business settings in summer. The key is fit and colour. A well-fitted stone linen suit looks far better than a poorly fitting wool suit in 35°C heat.' },
      { question: 'How do you stop a linen suit from creasing?', answer: 'You don\'t — and you shouldn\'t try. Creasing is inherent to linen. It is what gives the fabric its character. Hang the suit properly between wears and the worst creases will drop out naturally.' }
    ],
  },
  {
    handle: 'smart-casual-men',
    heading: 'Smart Casual for Men: The Definitive Guide',
    seo_title: 'Smart Casual Dress Code for Men | William Ashford',
    seo_description: 'What smart casual actually means for men. Real outfit examples and what to avoid. William Ashford guide.',
    intro_text: 'Smart casual is the most misunderstood dress code in menswear. It sits between business formal and casual — but where exactly? This guide gives you clear rules, specific outfit combinations, and the confidence to get it right without overdressing or underdressing.',
    style_tips: 'The foundation is a collared shirt with tailored trousers — start there\nA blazer instantly elevates jeans or chinos to smart-casual territory\nChinos are the smart-casual trouser — not jeans, not dress trousers\nLoafers or clean leather sneakers are the ideal shoe choices\nKnit polos under blazers work in summer — skip the shirt entirely\nLayer with a merino crew-neck over a shirt for cooler months',
    recommended_pieces: 'Navy or grey unstructured blazer\nWhite Oxford button-down shirt\nTan or olive chinos\nBrown leather loafers or clean white sneakers\nKnit polo in navy or grey (summer alternative)\nLeather-strap watch',
    dos_and_donts: 'Always wear a collar — it is the minimum requirement for smart-casual\nInvest in well-fitted chinos — they are the workhorse of this dress code\nWhen in doubt, add a blazer — it is the easiest way to look smart-casual\nDon\'t wear trainers — clean sneakers are fine, but athletic shoes are not\nAvoid graphic t-shirts under blazers — it reads as costume, not style\nNever wear a full suit and tie to a smart-casual event — you will be overdressed',
    collection_link: '/collections/all',
    faq_data: [
      { question: 'What is smart casual for men?', answer: 'Smart casual sits between business formal and casual. It typically means a collared shirt or polo, tailored trousers or chinos, and leather shoes or clean sneakers. A blazer is optional but always welcome.' },
      { question: 'Can I wear jeans for smart casual?', answer: 'Dark, well-fitted jeans can work in some smart-casual settings, especially when paired with a blazer and good shoes. Avoid distressed, faded, or light-wash jeans.' }
    ],
  },
  {
    handle: 'how-to-style-dress-trousers',
    heading: 'How to Style Dress Trousers',
    seo_title: 'How to Style Dress Trousers | William Ashford',
    seo_description: 'Dress trouser outfit ideas for men. Waistband, break, and pairing guide from William Ashford.',
    intro_text: 'Dress trousers are the backbone of sharp dressing. The right pair — properly fitted, correctly hemmed, and well paired — elevates everything above them. This guide covers fit, break, fabric, and how to wear dress trousers across different levels of formality.',
    style_tips: 'The trouser break matters — a slight break (fabric just touching the shoe) is the modern standard\nHigh-waisted trousers sit at your natural waist and create a longer leg line\nWool trousers drape better than cotton for formal settings\nGrey dress trousers are the most versatile — they pair with almost any jacket\nPleat or flat-front is a personal choice — pleats give more room, flat-fronts look slimmer\nAlways have dress trousers hemmed professionally — the length makes or breaks the look',
    recommended_pieces: 'Mid-grey wool dress trousers\nNavy wool dress trousers\nWhite or light blue dress shirt\nBrown or black leather shoes\nLeather belt matching shoe colour\nSuspenders for high-waisted styles',
    dos_and_donts: 'Get the hem right — too long looks sloppy, too short looks like you borrowed them\nChoose wool over polyester — it drapes better and lasts longer\nWear dress trousers at your natural waist for the best silhouette\nDon\'t wear dress trousers with casual sneakers — the formality clash is obvious\nAvoid trousers that are too tight — you should be able to pinch an inch at the thigh\nNever skip the belt or suspenders — the waistband needs finishing',
    collection_link: '/collections/all',
    faq_data: [
      { question: 'What is the right trouser break?', answer: 'A slight break — where the front of the trouser just touches the top of the shoe with a small fold — is the modern standard. No break looks sharp for slim trousers, while a full break is more traditional.' },
      { question: 'Should dress trousers have pleats?', answer: 'Pleats are making a strong comeback. They offer more comfort and range of motion, and look especially good on high-waisted trousers. Flat-front trousers are slimmer and more contemporary.' }
    ],
  },
  {
    handle: 'how-to-style-a-morning-suit',
    heading: 'How to Style a Morning Suit',
    seo_title: 'How to Style a Morning Suit | William Ashford',
    seo_description: 'Morning suit guide for weddings and formal occasions. What to wear and how to wear it.',
    intro_text: 'The morning suit is the most formal daytime dress code. Worn at weddings, horse racing, and formal ceremonies, it demands precision. This guide covers every element — from the tail coat to the correct trouser stripe — so you get it right.',
    style_tips: 'The morning coat should be black or charcoal grey with tails that taper to a point\nTrousers should be grey-and-black striped — never matching the coat\nA waistcoat adds the colour — dove grey, buff, or pale blue are traditional\nWear a white shirt with a spread collar and double cuffs\nA silk tie in silver, pale blue, or muted gold is appropriate\nTop hat and gloves are optional but correct for Royal Ascot and the most formal occasions',
    recommended_pieces: 'Black or charcoal morning coat\nGrey-and-black striped morning trousers\nDove grey waistcoat\nWhite double-cuff shirt\nSilver silk tie\nBlack Oxford shoes\nPocket square in white silk or linen',
    dos_and_donts: 'Hire a morning suit if you wear one fewer than twice a year — it is not worth owning\nEnsure the coat tails hit the back of the knee — too short looks comical\nWear the waistcoat buttoned with the bottom button undone\nDon\'t wear a matching grey coat and trousers — it should be coat and separate trousers\nAvoid novelty waistcoats — the pattern should be subtle\nNever wear a morning suit after 6pm — switch to evening wear',
    collection_link: '/collections/all',
    faq_data: [
      { question: 'When do you wear a morning suit?', answer: 'Morning suits are worn for formal daytime events — primarily weddings, horse racing (Royal Ascot), and garden parties with formal dress codes. They are appropriate from morning until approximately 6pm.' },
      { question: 'Can I rent a morning suit?', answer: 'Yes, and for most men this is the practical choice. Morning suits are worn infrequently, and a well-fitted rental will look just as good as a purchased one.' }
    ],
  },
  {
    handle: 'business-casual-dress-code-men',
    heading: 'Business Casual Dress Code for Men',
    seo_title: 'Business Casual Dress Code for Men | William Ashford',
    seo_description: 'What business casual means in practice. Specific outfit examples for every workplace.',
    intro_text: 'Business casual means different things in different offices — and that ambiguity is what makes it stressful. This guide strips away the confusion with clear outfit formulas that work across industries, from creative agencies to corporate offices that have relaxed their dress code.',
    style_tips: 'Chinos or dress trousers with a collared shirt is the business-casual baseline\nA blazer over an open-collar shirt hits the sweet spot between formal and relaxed\nLeather shoes — loafers, Derbys, or monk straps — are always safe\nPolo shirts work in warmer months but should be fitted, not oversized\nKnitwear layered over a shirt is an excellent autumn and winter option\nDark jeans can work in creative industries — but only with a blazer and leather shoes',
    recommended_pieces: 'Navy unstructured blazer\nWhite or blue Oxford shirt\nGrey or navy chinos\nBrown leather loafers\nMerino crew-neck sweater for layering\nLeather dress watch',
    dos_and_donts: 'Observe what your senior colleagues wear and calibrate accordingly\nWhen in doubt, overdress slightly — you can always remove a blazer\nKeep shoes clean and polished — they are the first thing people notice\nDon\'t wear shorts, flip-flops, or casual sandals — ever\nAvoid logo-heavy clothing — keep branding subtle or absent\nNever interpret business casual as casual — the word business comes first',
    collection_link: '/collections/all',
    faq_data: [
      { question: 'Can I wear jeans to business casual?', answer: 'In some offices, dark, well-fitted jeans are acceptable as business casual — particularly in creative industries. In more traditional settings, stick to chinos or dress trousers. When starting a new job, wait a week to observe the office norm.' },
      { question: 'Do I need a tie for business casual?', answer: 'No — a tie is not required and is often too formal for business casual. A collared shirt, whether buttoned up or open at the collar, is sufficient.' }
    ],
  },
  {
    handle: 'how-to-style-tweed',
    heading: 'How to Style Tweed',
    seo_title: 'How to Style Tweed for Men | William Ashford',
    seo_description: 'Tweed styling beyond the countryside. Modern outfit ideas for tweed jackets and suits.',
    intro_text: 'Tweed is one of the most characterful fabrics in menswear — but it carries countryside baggage that puts some men off. Styled correctly, tweed works in the city just as well as in the country. This guide shows you how to wear tweed jackets and suits in a modern, considered way.',
    style_tips: 'A tweed jacket over dark jeans and a roll-neck is the modern urban tweed look\nHarris Tweed and Donegal tweed are the most versatile types\nPair tweed with smooth textures — cotton shirts, flannel trousers — for contrast\nEarth tones (brown, green, rust) are classic tweed colours — lean into them\nTweed suits work best in autumn and winter — the weight is too heavy for summer\nLayer a gilet or waistcoat under a tweed jacket for additional warmth and texture',
    recommended_pieces: 'Brown or green Harris Tweed blazer\nWhite or ecru cotton shirt\nDark indigo jeans or moleskin trousers\nBrown suede or leather Chelsea boots\nWool-silk pocket square in autumnal tones\nKnit tie in rust or forest green',
    dos_and_donts: 'Wear tweed from September to March — it is a cold-weather fabric\nMix tweed with modern pieces to avoid looking like you are on a country shoot\nInvest in a well-fitted tweed blazer — it will last decades\nDon\'t wear tweed head-to-toe with a flat cap — unless you are genuinely going to the races\nAvoid pairing tweed with shiny or synthetic fabrics — they clash texturally\nNever wear tweed in summer — you will overheat and it looks out of season',
    collection_link: '/collections/all',
    faq_data: [
      { question: 'Is tweed old-fashioned?', answer: 'Not at all. Tweed is experiencing a strong revival in modern menswear. The key is styling it with contemporary pieces — dark jeans, roll-neck sweaters, and Chelsea boots — rather than traditional country-wear pairings.' },
      { question: 'When should I wear tweed?', answer: 'Tweed is best worn in autumn and winter (September to March). It is too heavy for warm weather. It works for smart-casual events, country weekends, and as a textured alternative to wool blazers.' }
    ],
  },
];

const occasionPages = [
  {
    handle: 'what-to-wear-to-a-job-interview',
    heading: 'What to Wear to a Job Interview',
    seo_title: 'What to Wear to a Job Interview (Men) | William Ashford',
    seo_description: 'Job interview outfit guide for men. What to wear for different industries, and what to avoid.',
    intro_text: 'Your interview outfit should communicate competence, attention to detail, and respect for the opportunity. What you wear depends on the industry and company culture — but there are universal rules that apply everywhere. This guide covers every scenario.',
    style_tips: 'Research the company dress code before choosing your outfit\nFor corporate roles: a navy or charcoal suit with a white shirt and conservative tie\nFor creative roles: smart separates — a blazer with chinos and no tie\nFor tech roles: a smart button-down with chinos and clean shoes is usually sufficient\nEnsure everything is clean, pressed, and fits properly\nWear shoes that are polished — scuffed shoes undermine an otherwise perfect outfit',
    recommended_pieces: 'Navy or charcoal suit\nWhite poplin dress shirt\nConservative tie in navy, burgundy, or silver\nBlack or dark brown leather shoes\nMinimal leather watch\nDark dress socks',
    dos_and_donts: 'Dress one level above the company\'s daily dress code\nGet a fresh haircut a few days before — not the day of\nKeep jewellery and accessories minimal\nDon\'t wear strong cologne — some interviewers are sensitive to scent\nAvoid overly trendy clothing — the goal is timeless professionalism\nNever wear casual shoes, trainers, or open-toed footwear',
    collection_link: '/collections/all',
    faq_data: [
      { question: 'Should I wear a suit to a job interview?', answer: 'For corporate, finance, law, and consulting roles — yes, always. For creative, tech, and startup roles, smart separates (blazer and chinos) may be more appropriate. When in doubt, wear the suit.' },
      { question: 'What colour suit is best for an interview?', answer: 'Navy and charcoal are the safest choices. They project authority and competence without being severe. Avoid black unless interviewing for a very formal role.' }
    ],
  },
  {
    handle: 'black-tie-dress-code-guide',
    heading: 'Black Tie Dress Code Guide for Men',
    seo_title: 'Black Tie Dress Code Guide for Men | William Ashford',
    seo_description: 'What black tie means in practice. Dinner suit, shirt, shoes, and what is and is not acceptable.',
    intro_text: 'Black tie is the most common formal dress code — and the most frequently got wrong. It means a dinner suit (tuxedo), not just a dark suit with a bow tie. This guide covers every element of correct black-tie dressing, from lapel style to shoe type.',
    style_tips: 'A dinner suit should be black or midnight blue — no other colours\nPeak lapels or shawl collar in silk or grosgrain are correct — notch lapels are less traditional\nThe shirt should be white with a marcella (piqué) or pleated front\nA black silk bow tie is essential — pre-tied is fine if it looks right\nBlack patent leather shoes or highly polished calf leather Oxfords\nA white pocket square in a flat fold — nothing flashy',
    recommended_pieces: 'Black dinner suit with satin peak lapels\nWhite marcella dress shirt with double cuffs\nBlack silk bow tie\nBlack patent leather Oxford shoes\nBlack silk dress socks\nWhite pocket square\nSilver or black cufflinks',
    dos_and_donts: 'Ensure the dinner suit fits impeccably — hire a tailor if needed\nWear a cummerbund or low-cut waistcoat to cover the trouser waistband\nKeep everything black, white, and silver — that is the palette\nDon\'t wear a standard business suit and call it black tie — it is immediately obvious\nAvoid coloured bow ties or cummerbunds unless specifically invited to\nNever wear a belt with a dinner suit — use suspenders or side adjusters',
    collection_link: '/collections/all',
    faq_data: [
      { question: 'What is the difference between black tie and formal?', answer: 'Black tie means a dinner suit (tuxedo). White tie (formal) is even more formal and requires a tailcoat. Most evening events that say "formal" actually mean black tie.' },
      { question: 'Can I wear a regular suit to a black-tie event?', answer: 'Technically no — black tie specifically means a dinner suit. If you do not own one, hire one. Wearing a regular suit to a black-tie event signals that you did not make the effort.' }
    ],
  },
  {
    handle: 'what-to-wear-to-a-wedding-as-a-guest',
    heading: 'What to Wear to a Wedding as a Guest',
    seo_title: 'Wedding Guest Outfit Guide for Men | William Ashford',
    seo_description: 'Wedding guest attire for men. Dress codes explained, outfit ideas, and what not to wear.',
    intro_text: 'What you wear to a wedding depends on the dress code, the venue, and the time of day. This guide breaks down every common wedding dress code and gives you specific outfit combinations so you arrive appropriately dressed — without outshining the couple.',
    style_tips: 'Read the invitation carefully — it will specify the dress code\nFor formal weddings: a dark suit or morning suit with a tie\nFor semi-formal: a lighter suit or blazer and trousers\nFor casual outdoor weddings: linen suit or chinos with a blazer\nPastel ties and pocket squares are wedding-appropriate without being flashy\nBrown shoes are usually better than black for daytime weddings',
    recommended_pieces: 'Navy or mid-grey suit\nLight blue or white dress shirt\nPastel silk tie\nBrown or tan leather shoes\nLinen pocket square\nSunglasses for outdoor ceremonies',
    dos_and_donts: 'Dress to complement the event — match the level of formality\nWear something you feel confident in — you will be photographed\nBring a jacket even for summer weddings — the evening gets cooler\nDon\'t wear white or cream — those colours are reserved for the couple\nAvoid anything too trendy that will date the photos\nNever underdress — it is better to be slightly overdressed than underdressed at a wedding',
    collection_link: '/collections/all',
    faq_data: [
      { question: 'Can I wear a navy suit to a wedding?', answer: 'Yes — a navy suit is one of the most popular and appropriate choices for wedding guests. Pair with a pastel tie and brown shoes for daytime, or a darker tie and black shoes for evening.' },
      { question: 'Is it OK to wear black to a wedding?', answer: 'A black suit is acceptable for evening weddings and very formal daytime weddings. For casual or outdoor daytime weddings, navy or grey is more appropriate.' }
    ],
  },
  {
    handle: 'menswear-for-court-hearings',
    heading: 'What to Wear to Court',
    seo_title: 'What to Wear to Court (Men) | William Ashford',
    seo_description: 'Court appearance dress guide for men. What is expected, what helps, and what to avoid.',
    intro_text: 'What you wear to court communicates respect for the institution and can influence how you are perceived. Whether you are a witness, defendant, or simply attending, dressing appropriately shows that you take the proceedings seriously. Conservative, understated, and well-fitted is the standard.',
    style_tips: 'A dark suit (navy or charcoal) with a white shirt is the safest choice\nKeep the tie conservative — solid colours or subtle patterns only\nShoes should be clean, dark leather — black is preferred\nRemove all jewellery except a wedding ring and watch\nEnsure your outfit is freshly pressed — wrinkled clothing looks careless\nIf you do not own a suit, dark trousers with a collared shirt and blazer is acceptable',
    recommended_pieces: 'Navy or charcoal suit\nWhite dress shirt\nDark solid tie (navy, charcoal, or burgundy)\nBlack leather Oxford shoes\nDark dress socks\nMinimal leather watch',
    dos_and_donts: 'Dress conservatively — the goal is to be unremarkable\nArrive early to avoid rushing and looking dishevelled\nKeep grooming neat — fresh shave or trimmed beard\nDon\'t wear casual clothing — jeans, trainers, and t-shirts are disrespectful\nAvoid loud colours, patterns, or branded clothing\nNever wear sunglasses, hats, or caps inside the courtroom',
    collection_link: '/collections/all',
    faq_data: [
      { question: 'Do I need to wear a suit to court?', answer: 'While not legally required, a suit is strongly recommended. It shows respect for the court and can positively influence how judges and barristers perceive you. At minimum, wear dark trousers and a collared shirt.' },
    ],
  },
  {
    handle: 'garden-party-outfit-men',
    heading: 'Garden Party Outfit Guide for Men',
    seo_title: 'Garden Party Outfit Guide for Men | William Ashford',
    seo_description: 'What to wear to a garden party. Dress codes, fabric choices, and occasion-appropriate looks.',
    intro_text: 'Garden parties sit in an unusual space — formal enough to require a jacket, casual enough to allow open collars and lighter fabrics. The key is looking polished without overdressing. Linen, lightweight wool, and cotton are your allies here.',
    style_tips: 'A linen or unstructured cotton blazer is the ideal garden party jacket\nLight colours — stone, cream, pale blue — suit the outdoor setting\nAn open collar with a blazer is perfectly acceptable\nSuede shoes or loafers (no socks) work well on grass\nChinos or light wool trousers — not jeans, not suit trousers\nA Panama hat is welcome if the sun is strong — and looks great in photos',
    recommended_pieces: 'Stone or light blue linen blazer\nWhite linen or cotton shirt (open collar)\nCream or tan chinos\nBrown suede loafers\nPanama hat (optional)\nLinen pocket square',
    dos_and_donts: 'Dress for the weather — layer so you can adjust as the day warms up\nWear shoes that work on grass — leather soles and stilettos sink\nBring sunglasses — you will need them\nDon\'t wear a full dark suit — it is too heavy for the setting\nAvoid shorts unless the invitation specifically permits them\nNever wear trainers or flip-flops to a garden party with a dress code',
    collection_link: '/collections/all',
    faq_data: [
      { question: 'What is garden party dress code?', answer: 'Garden party dress code typically means smart-casual to semi-formal in light fabrics and colours. A blazer with chinos and an open-collar shirt is the standard. Linen is welcome, as are loafers and Panama hats.' },
    ],
  },
  {
    handle: 'graduation-outfit-men',
    heading: 'Graduation Outfit Guide for Men',
    seo_title: 'Graduation Outfit Guide for Men | William Ashford',
    seo_description: 'What to wear to a graduation ceremony. Smart outfit options that work under a gown and at dinner after.',
    intro_text: 'Graduation is one of the most photographed days of your life. Your outfit needs to look sharp under a gown, work for the ceremony, and carry you through the family dinner afterwards. Here is how to get it right.',
    style_tips: 'A suit or blazer and trousers works best — both look smart under the gown\nNavy or charcoal are the ideal suit colours for graduation photos\nA tie is optional but adds a level of polish your parents will appreciate\nChoose shoes you can walk in comfortably — ceremonies involve a lot of standing\nMake sure your outfit works without the gown — you will remove it for dinner\nGet a fresh haircut a few days before — it will look better in photos',
    recommended_pieces: 'Navy suit or blazer with grey trousers\nWhite or light blue shirt\nOptional: silk tie in a celebratory colour\nBrown or black leather shoes\nPocket square for photos\nClean, polished watch',
    dos_and_donts: 'Plan your outfit in advance — do not leave it to the morning\nCheck what shows under the gown — collar and tie will be visible\nBring a spare shirt if it is a hot day — you will thank yourself\nDon\'t wear all black — it looks severe in photos and blends with the gown\nAvoid trainers or casual shoes — leather shoes photograph better\nNever wear something brand new on the day — break in shoes and test the outfit first',
    collection_link: '/collections/all',
    faq_data: [
      { question: 'Do I need to wear a suit to graduation?', answer: 'A suit is the most appropriate choice and photographs the best. If a suit feels too formal, a blazer with chinos and a shirt is an excellent alternative. Avoid casual clothing — you will regret it in the photos.' },
    ],
  },
  {
    handle: 'christmas-party-outfit-men',
    heading: 'Christmas Party Outfit Guide for Men',
    seo_title: 'Christmas Party Outfit for Men | William Ashford',
    seo_description: 'Christmas party outfit ideas for men. Festive without being ridiculous. William Ashford guide.',
    intro_text: 'The Christmas party is your chance to dress up without the constraints of business wear. Whether it is an office party, a friend\'s gathering, or a formal dinner, the goal is to look festive and polished — not like a novelty act.',
    style_tips: 'A velvet blazer in navy or burgundy is the perfect Christmas party statement piece\nDark suits with a festive pocket square or tie add subtle celebration\nDeep jewel tones — emerald, ruby, midnight blue — are inherently festive\nRoll-neck sweaters with a blazer work for less formal gatherings\nSilver or gold accessories (watch, cufflinks) add a touch of sparkle\nBlack shoes are generally better for evening parties than brown',
    recommended_pieces: 'Navy or burgundy velvet blazer\nWhite dress shirt or fine-gauge roll-neck\nDark tailored trousers\nBlack leather Chelsea boots or Oxfords\nSilk pocket square in a rich colour\nDark patterned tie (optional)',
    dos_and_donts: 'Dress one level up from what you think the event requires\nUse accessories to add festive touches — ties, pocket squares, cufflinks\nWear something you can move and dance in comfortably\nDon\'t wear a Christmas jumper to a smart party — save it for casual gatherings\nAvoid novelty ties and accessories — they look cheap\nNever turn up in jeans and a t-shirt to an office Christmas party — it signals disrespect',
    collection_link: '/collections/all',
    faq_data: [
      { question: 'What should I wear to an office Christmas party?', answer: 'A dark suit with a festive tie or pocket square is the safest choice. A velvet blazer with dark trousers is a stylish step up. Avoid anything too casual — your colleagues and managers will be there.' },
    ],
  },
  {
    handle: 'horse-racing-dress-code-men',
    heading: 'Horse Racing Dress Code for Men',
    seo_title: 'Horse Racing Dress Code for Men | William Ashford',
    seo_description: 'What to wear to Ascot, Goodwood, and race meetings. Enclosure rules and outfit tips.',
    intro_text: 'Horse racing events have some of the strictest dress codes in British social life — particularly at Royal Ascot. But even at more relaxed race days, there are standards to uphold. This guide covers what to wear for every level of enclosure.',
    style_tips: 'Royal Enclosure at Ascot requires morning dress — tail coat, waistcoat, top hat\nMembers\' enclosures typically require a suit and tie as a minimum\nGeneral admission is more relaxed — a blazer and chinos are usually fine\nLinen suits are excellent for summer race days (Goodwood, for example)\nA hat is required in the Royal Enclosure — top hat in grey or black\nBrown shoes work well for daytime racing — save black for the Royal Enclosure',
    recommended_pieces: 'Morning suit for Royal Enclosure (hire if needed)\nLight grey or navy suit for Members\' enclosures\nPanama hat or trilby for summer race days\nSilk tie in a bold colour or pattern\nBrown leather shoes for daytime\nLinen pocket square',
    dos_and_donts: 'Check the specific dress code for your enclosure before attending\nDress for the weather — racing is outdoors and British summers are unpredictable\nBring layers — a light coat or extra layer for the afternoon\nDon\'t arrive underdressed — many enclosures will refuse entry\nAvoid overly casual clothing — trainers, shorts, and t-shirts are never acceptable\nNever remove your jacket in the Royal Enclosure — it is against the rules',
    collection_link: '/collections/all',
    faq_data: [
      { question: 'Do I need a top hat for horse racing?', answer: 'Only for the Royal Enclosure at Royal Ascot — it is mandatory. For other enclosures and race days, a hat is optional but adds to the occasion. A Panama or trilby works well for summer meetings.' },
    ],
  },
  {
    handle: 'funeral-attire-men',
    heading: 'Funeral Attire for Men',
    seo_title: 'Funeral Attire Guide for Men | William Ashford',
    seo_description: 'What to wear to a funeral. What is appropriate, what to avoid, and how to show respect through dress.',
    intro_text: 'Funeral attire should be understated, respectful, and unremarkable. The goal is to show that you cared enough to dress appropriately — not to stand out. Dark, conservative clothing is the universal standard.',
    style_tips: 'A black or dark charcoal suit is the most appropriate choice\nA white shirt with a dark tie is the standard — avoid patterns\nBlack leather shoes, polished and clean\nKeep accessories to a minimum — a watch and wedding ring only\nA dark overcoat in winter — black or charcoal\nIf you do not own a suit, dark trousers with a dark blazer and white shirt is acceptable',
    recommended_pieces: 'Black or dark charcoal suit\nWhite dress shirt\nBlack or very dark tie\nBlack leather Oxford shoes\nBlack socks\nWhite pocket square (optional, flat fold only)',
    dos_and_donts: 'Dress conservatively — the occasion is about the person being mourned\nEnsure your clothing is clean, pressed, and well-fitting\nArrive on time and dressed appropriately — rushing and adjusting your tie is disrespectful\nDon\'t wear bright or loud colours — even if the family requests \'celebration of life\', err on the side of dark\nAvoid casual clothing entirely — jeans and trainers are never appropriate\nNever wear sunglasses during the service — remove them when indoors',
    collection_link: '/collections/all',
    faq_data: [
      { question: 'Do I have to wear black to a funeral?', answer: 'Black is traditional and safest. Very dark charcoal and navy are also acceptable. If the family requests colourful clothing for a celebration of life, follow their wishes — but keep it understated.' },
    ],
  },
  {
    handle: 'first-date-outfit-men',
    heading: 'First Date Outfit Guide for Men',
    seo_title: 'First Date Outfit Ideas for Men | William Ashford',
    seo_description: 'What to wear on a first date. Outfit ideas across different settings — dinner, casual, and smart-casual.',
    intro_text: 'A first date outfit should say you made an effort without looking like you tried too hard. The right outfit depends entirely on the venue — a cocktail bar demands different clothing than a coffee shop. Here is what to wear for every type of first date.',
    style_tips: 'Dress for the venue — research where you are going before choosing your outfit\nFor a restaurant: dark jeans or chinos, a collared shirt, and leather shoes\nFor drinks: a fitted jumper or polo with tailored trousers\nFor a casual date: well-fitted jeans, a crew-neck tee, and clean sneakers\nWear something you feel confident in — confidence is more attractive than any outfit\nFit matters more than brand — make sure everything fits well',
    recommended_pieces: 'Dark fitted jeans or tailored chinos\nOxford shirt or fitted crew-neck sweater\nClean leather shoes or white sneakers\nLeather watch\nSimple belt\nSubtle cologne — one or two sprays only',
    dos_and_donts: 'Wear something you feel comfortable in — fidgeting with your clothes is distracting\nMake sure you smell good — shower, deodorant, and a subtle fragrance\nDress slightly better than the venue requires — it shows effort\nDon\'t overdress — a full suit to a coffee shop is intimidating\nAvoid anything with holes, stains, or visible wear — it looks careless\nNever wear a strong cologne — it should be subtle enough that she has to lean in to notice it',
    collection_link: '/collections/all',
    faq_data: [
      { question: 'Should I wear a suit on a first date?', answer: 'Only if you are going to a very upscale restaurant. For most first dates, smart-casual is the best level — a collared shirt with chinos or dark jeans and leather shoes strikes the right balance.' },
    ],
  },
];

const fabricPages = [
  {
    handle: 'super-100s-wool',
    term_name: 'Super 100s Wool',
    seo_title: 'What is Super 100s Wool? | William Ashford',
    seo_description: 'Super 100s wool explained. Yarn fineness, what the Super number means, and why it matters for suits.',
    short_definition: 'Super 100s wool refers to wool yarn with a fibre diameter of 18.5 microns, offering a balance of durability and softness ideal for year-round suiting.',
    full_definition: 'The Super number system measures the fineness of wool yarn. Super 100s means the individual fibres are 18.5 microns in diameter — fine enough to feel smooth against the skin but robust enough for daily wear.\n\nSuper 100s sits in the sweet spot for suiting. It is finer than standard wool (which typically falls below Super 80s) but more durable than ultra-fine Super 150s or 180s wools, which can be delicate.\n\nFor a suit you plan to wear regularly, Super 100s offers the best combination of comfort, drape, and longevity. It resists creasing reasonably well and can handle the demands of a working wardrobe.',
    properties: 'Fibre Diameter: 18.5 microns\nWeight Range: 240-280 GSM (typical for suiting)\nDurability: High — excellent for everyday wear\nDrape: Medium — holds structure well\nSeason: Year-round\nCrease Recovery: Good',
    care_tips: 'Dry clean only — do not machine wash\nHang on a shaped wooden hanger after each wear\nAllow 24 hours between wears to let fibres recover\nBrush with a garment brush to remove surface dust\nStore in a breathable garment bag during off-season\nAddress stains promptly — blot, do not rub',
    collection_link: '/collections/all',
    faq_data: [
      { question: 'Is Super 100s wool good for suits?', answer: 'Yes — Super 100s is one of the best all-round choices for suiting. It offers a great balance of softness, durability, and drape. It is fine enough to feel luxurious but tough enough for regular wear.' },
      { question: 'What is the difference between Super 100s and Super 120s?', answer: 'Super 120s has a finer fibre diameter (17.5 microns vs 18.5 for Super 100s). This makes it softer and smoother, but slightly less durable. Super 100s is better for everyday suits; Super 120s is better for occasions.' }
    ],
  },
  {
    handle: 'super-120s-wool',
    term_name: 'Super 120s Wool',
    seo_title: 'What is Super 120s Wool? | William Ashford',
    seo_description: 'Super 120s wool guide. How it differs from Super 100s, where it excels, and what to expect.',
    short_definition: 'Super 120s wool has a fibre diameter of 17.5 microns — finer and softer than Super 100s, with an elevated drape that makes it ideal for premium occasion suits.',
    full_definition: 'Super 120s wool represents a step up in fineness from Super 100s. At 17.5 microns, the fibres are noticeably smoother to the touch and produce a fabric with superior drape and lustre.\n\nThis fineness comes at a trade-off: Super 120s is slightly less durable than Super 100s and more prone to showing wear at stress points (seat, elbows, inner thigh). For suits worn once or twice a week, this is not a concern. For daily beaters, Super 100s may be more practical.\n\nWhere Super 120s truly excels is in the way it moves. The fabric flows rather than sits — creating a silhouette that looks more refined, especially in tailored jackets and trousers.',
    properties: 'Fibre Diameter: 17.5 microns\nWeight Range: 220-260 GSM\nDurability: Good — best for rotation wear\nDrape: Excellent — fluid and refined\nSeason: Year-round (lighter weights for summer)\nLustre: Noticeable natural sheen',
    care_tips: 'Dry clean only — handle with care\nUse a wide-shouldered wooden hanger to preserve shape\nRotate between multiple suits to extend lifespan\nBrush gently after each wear\nAvoid sitting for extended periods on rough surfaces\nStore away from direct sunlight to prevent colour fading',
    collection_link: '/collections/all',
    faq_data: [
      { question: 'Is Super 120s better than Super 100s?', answer: 'It depends on use. Super 120s is softer and drapes better, making it ideal for special occasions and suits worn in rotation. Super 100s is more durable and better suited for everyday wear. Neither is objectively better — they serve different purposes.' },
    ],
  },
  {
    handle: 'merino-wool',
    term_name: 'Merino Wool',
    seo_title: 'What is Merino Wool? | William Ashford',
    seo_description: 'Merino wool explained for menswear. Why it is used in premium suits and knitwear.',
    short_definition: 'Merino wool comes from Merino sheep and is prized for its exceptional softness, temperature regulation, and natural moisture-wicking properties.',
    full_definition: 'Merino wool is widely regarded as the finest wool for next-to-skin comfort. The fibres are significantly finer than standard wool — typically 15-24 microns — which eliminates the itch associated with coarser wools.\n\nWhat sets Merino apart is its natural performance characteristics. It regulates temperature by trapping air between fibres, keeping you warm in cold conditions and cool in warm ones. It wicks moisture away from the body and is naturally odour-resistant.\n\nIn suiting, Merino wool produces fabrics with excellent drape and a soft hand feel. In knitwear, it delivers warmth without bulk. It is one of the most versatile natural fibres in menswear.',
    properties: 'Fibre Diameter: 15-24 microns\nTemperature Regulation: Excellent — warm in winter, cool in summer\nMoisture Wicking: Natural and effective\nOdour Resistance: Naturally antimicrobial\nSoftness: Exceptional — no itch\nDurability: Good with proper care',
    care_tips: 'Hand wash in cool water or use a wool-specific machine cycle\nUse a pH-neutral wool detergent\nDo not tumble dry — lay flat to dry\nFold knitwear rather than hanging to prevent stretching\nStore with cedar balls to deter moths\nDe-pill with a fabric comb as needed',
    collection_link: '/collections/all',
    faq_data: [
      { question: 'Is Merino wool itchy?', answer: 'No — Merino wool is specifically prized for its softness. The fibres are fine enough (typically under 20 microns for quality Merino) to feel smooth against the skin, unlike coarser wool types.' },
      { question: 'Can you wear Merino wool in summer?', answer: 'Yes. Merino wool naturally regulates temperature and wicks moisture, making it comfortable in warm weather. Lightweight Merino suits and knits are excellent summer options.' }
    ],
  },
  {
    handle: 'half-canvas-construction',
    term_name: 'Half-Canvas Construction',
    seo_title: 'What is Half-Canvas Suit Construction? | William Ashford',
    seo_description: 'Half-canvas explained. How it differs from fused and full-canvas, and why it matters.',
    short_definition: 'Half-canvas construction uses a floating canvas interlining in the chest and lapel area of a suit jacket, providing better drape and shape than fused construction at a more accessible price than full canvas.',
    full_definition: 'In a half-canvas suit, a layer of horsehair or wool canvas is hand-stitched into the chest and lapel area. This canvas floats between the outer fabric and the lining, allowing the jacket to drape naturally over the body and develop a shape that conforms to the wearer over time.\n\nThe lower portion of the jacket (below the chest) uses fusible interlining — a lighter adhesive bond — which reduces cost and weight without significantly compromising the overall quality.\n\nHalf-canvas represents the sweet spot in suit construction. It provides 80% of the benefits of full canvas at roughly 60% of the cost. The lapels roll naturally, the chest drapes cleanly, and the jacket moulds to your body with wear.',
    properties: 'Interlining: Horsehair/wool canvas (chest and lapels)\nLower Body: Fused interlining\nDrape: Very good — natural chest roll\nLongevity: 5-10+ years with proper care\nPrice Point: Mid to high\nBreak-In: Improves with wear',
    care_tips: 'Dry clean sparingly — once or twice per season\nHang on a wide wooden hanger to maintain shoulder shape\nAllow the jacket to rest between wears\nSteam rather than iron to remove wrinkles\nStore in a breathable garment bag\nAvoid getting the chest area wet — the canvas can warp if soaked',
    collection_link: '/collections/all',
    faq_data: [
      { question: 'Is half-canvas better than fused?', answer: 'Yes, in terms of drape, longevity, and the way the suit shapes to your body over time. Fused suits can bubble or delaminate over time, while half-canvas maintains its structure. For any suit you plan to keep for years, half-canvas is the minimum quality level.' },
      { question: 'Is half-canvas good enough?', answer: 'For most men, half-canvas is more than good enough. It provides excellent drape, natural lapel roll, and long-term shape retention. Full canvas is marginally better but significantly more expensive — the difference is subtle.' }
    ],
  },
  {
    handle: 'full-canvas-construction',
    term_name: 'Full-Canvas Construction',
    seo_title: 'What is Full-Canvas Suit Construction? | William Ashford',
    seo_description: 'Full-canvas construction guide. The benchmark of premium tailoring — what it is and what it delivers.',
    short_definition: 'Full-canvas construction uses a complete horsehair canvas interlining throughout the entire jacket, creating the finest drape, longest lifespan, and most natural silhouette possible in a suit.',
    full_definition: 'A full-canvas suit has a floating canvas interlining that runs from the shoulder to the hem of the jacket. This canvas — typically made from horsehair, wool, or a blend — is never glued to the outer fabric. Instead, it is attached through thousands of small pad stitches.\n\nThis construction allows the fabric to move independently from the canvas, creating a drape that no fused or half-canvas suit can replicate. Over time, the canvas moulds to the wearer\'s body, creating a truly personalised fit.\n\nFull canvas is the gold standard of suit construction. It is more labour-intensive, requires more skilled tailoring, and uses more expensive materials — which is reflected in the price. But for suits that will be worn for years or decades, it represents the best value.',
    properties: 'Interlining: Full horsehair/wool canvas throughout\nDrape: Exceptional — the gold standard\nLongevity: 10-20+ years\nBody Moulding: Conforms to wearer over time\nPrice Point: Premium\nWeight: Slightly heavier than fused',
    care_tips: 'Dry clean only — and sparingly (2-3 times per year)\nAlways hang on a contoured wooden hanger\nBrush with a natural bristle brush after each wear\nAllow minimum 48 hours between wears\nStore in a breathable cotton garment bag\nHave the suit professionally pressed — avoid home ironing',
    collection_link: '/collections/all',
    faq_data: [
      { question: 'Is a full-canvas suit worth it?', answer: 'If you plan to wear a suit regularly for 5+ years, yes. The superior drape, body moulding, and longevity justify the higher cost. For occasional wear, half-canvas offers similar benefits at a lower price.' },
    ],
  },
  {
    handle: 'herringbone-weave',
    term_name: 'Herringbone Weave',
    seo_title: 'What is Herringbone Weave? | William Ashford',
    seo_description: 'Herringbone weave explained. The V-pattern, its properties, and how it looks in suits.',
    short_definition: 'Herringbone is a distinctive V-shaped weave pattern created by reversing the direction of the twill at regular intervals, creating a zigzag effect that adds visual texture and depth to suiting fabrics.',
    full_definition: 'Herringbone gets its name from its resemblance to the skeleton of a herring fish. The pattern is created by alternating the direction of the twill weave — the diagonal lines reverse at regular intervals, forming a continuous V or zigzag pattern.\n\nThis weave structure gives herringbone fabrics a distinctive visual texture that is subtle enough for business wear but interesting enough to stand out from plain weaves. The pattern adds depth to solid colours and creates visual interest without the formality of a stripe or check.\n\nHerringbone is particularly popular in wool suiting, tweed jackets, and overcoats. The weave structure also makes the fabric slightly more durable than plain weaves, as the alternating direction distributes stress more evenly.',
    properties: 'Pattern: V-shaped zigzag\nWeave Type: Broken twill\nTexture: Visible but subtle\nDurability: Above average — stress distributed evenly\nFormality: Business to smart-casual\nBest Uses: Suits, blazers, overcoats',
    care_tips: 'Dry clean for suits and structured garments\nBrush regularly to maintain the pattern\'s crispness\nStore on wide hangers to prevent shoulder marks\nSteam rather than iron to avoid flattening the texture\nRotate herringbone pieces to prevent wear patterns\nWool herringbone can be spot-cleaned for minor marks',
    collection_link: '/collections/all',
    faq_data: [
      { question: 'Is herringbone formal or casual?', answer: 'Herringbone sits comfortably in both worlds. A fine herringbone in worsted wool is appropriate for business. A chunky herringbone in tweed is more casual. The scale of the pattern determines the formality.' },
    ],
  },
  {
    handle: 'twill-weave',
    term_name: 'Twill Weave',
    seo_title: 'What is Twill Weave? | William Ashford',
    seo_description: 'Twill weave fabric guide. The diagonal structure that makes suiting fabrics drape well.',
    short_definition: 'Twill is a fundamental weave pattern characterised by diagonal parallel ribs, created by passing the weft thread over one or more warp threads in a staggered pattern. It produces fabrics with excellent drape and durability.',
    full_definition: 'Twill weave is one of the three fundamental textile weaves (alongside plain weave and satin weave). It is identified by its distinctive diagonal lines — the parallel ribs that run across the fabric surface.\n\nThe diagonal pattern is created by offsetting each row of weft thread by one or more warp threads, creating a stepped progression that forms the visible ribs. This structure gives twill fabrics several advantages over plain weaves: better drape, greater wrinkle resistance, and higher durability.\n\nIn menswear, twill weave is used extensively in suiting, dress shirts, chinos, and denim (which is a specific type of twill). The weave produces fabrics that move well on the body, resist showing creases, and feel smooth to the touch.',
    properties: 'Structure: Diagonal parallel ribs\nDrape: Excellent\nDurability: High — stronger than plain weave\nWrinkle Resistance: Good\nCommon Fabrics: Gabardine, denim, serge, cavalry twill\nAppearance: Smooth with visible diagonal lines',
    care_tips: 'Follow the care label specific to the fibre content\nTwill weaves can typically handle more washing than delicate weaves\nIron on the reverse side to maintain the rib texture\nWool twills should be dry cleaned\nCotton twills can usually be machine washed\nHang to dry when possible to prevent shrinkage',
    collection_link: '/collections/all',
    faq_data: [
      { question: 'What is the difference between twill and plain weave?', answer: 'Plain weave creates a flat, uniform texture by alternating over-under in each row. Twill creates diagonal ribs by offsetting each row. Twill fabrics generally drape better, resist wrinkles more effectively, and are more durable.' },
    ],
  },
  {
    handle: 'linen-fabric',
    term_name: 'Linen',
    seo_title: 'What is Linen Fabric? | William Ashford',
    seo_description: 'Linen for menswear explained. Why it creases, why that is correct, and how to wear it well.',
    short_definition: 'Linen is a natural fibre made from the flax plant, valued in menswear for its exceptional breathability, moisture absorption, and relaxed texture — the ideal warm-weather fabric.',
    full_definition: 'Linen is one of the oldest textile fibres in human history, made from the cellulose fibres of the flax plant. It has been used for clothing for over 5,000 years, and for good reason — no other natural fibre matches its combination of breathability, moisture absorption, and cooling comfort.\n\nLinen absorbs up to 20% of its weight in moisture before feeling damp. It dries quickly and allows air to circulate freely against the skin. This makes it the definitive warm-weather fabric for menswear.\n\nThe characteristic creasing of linen is often misunderstood as a flaw. In fact, it is an inherent property of the fibre — and in menswear circles, the relaxed rumple of a linen suit is considered a mark of authenticity. Attempting to iron linen to a crisp finish is both futile and beside the point.',
    properties: 'Source: Flax plant\nBreathability: Exceptional\nMoisture Absorption: Up to 20% of weight\nDrying Speed: Fast\nCreasing: High — inherent to the fibre\nSeason: Spring and summer\nDurability: High — stronger when wet',
    care_tips: 'Machine wash on a gentle cycle in cool water\nUse a mild detergent — avoid bleach\nHang to dry — do not tumble dry\nIron while slightly damp if a pressed look is desired\nAccept the creasing — it is part of linen\'s character\nStore folded rather than hanging to prevent stretching\nDry clean linen suits to maintain structure',
    collection_link: '/collections/all',
    faq_data: [
      { question: 'Why does linen crease so much?', answer: 'Linen fibres have low elasticity — they do not spring back after being bent, which causes creasing. This is an inherent property of the flax fibre and is not a defect. In menswear, linen\'s relaxed creasing is considered part of its charm.' },
      { question: 'Is linen good for suits?', answer: 'Yes — linen is the best fabric for suits in hot weather. It breathes exceptionally well and keeps you cool. The creasing is expected and accepted. Choose light colours (stone, beige, light blue) for the most authentic look.' }
    ],
  },
];

const comparisonPages = [
  {
    handle: 'single-breasted-vs-double-breasted-suit',
    heading: 'Single-Breasted vs Double-Breasted Suit',
    seo_title: 'Single vs Double-Breasted Suit | William Ashford',
    seo_description: 'Single-breasted vs double-breasted suit compared. Body types, occasions, and the right choice.',
    intro_text: 'The single-breasted suit is the default. The double-breasted suit is the statement. Both have their place in a man\'s wardrobe — the question is which suits your body type, your occasion, and your personal style. This comparison breaks down the key differences.',
    item_a_name: 'Single-Breasted',
    item_a_pros: 'More versatile — works for nearly every occasion\nFlattering on all body types\nEasier to dress up or down\nMore comfortable when seated\nSimpler to layer under overcoats',
    item_a_cons: 'Can look generic without careful styling\nLess visual impact than double-breasted\nStraight body types may lack definition',
    item_b_name: 'Double-Breasted',
    item_b_pros: 'Stronger visual presence and authority\nCreates a V-shape silhouette that flatters\nExcellent for tall and slim builds\nMore formal and distinctive\nLooks exceptional with peak lapels',
    item_b_cons: 'Less forgiving on shorter or stockier builds\nShould be worn buttoned — limits comfort\nHarder to dress down for casual settings\nFewer occasions where it is appropriate',
    verdict: 'If you own one suit, make it single-breasted — it is more versatile. If you are building a wardrobe and want something with more presence, add a double-breasted in navy or charcoal as your second or third suit.',
    item_a_collection: '/collections/all',
    item_b_collection: '/collections/all',
    faq_data: [
      { question: 'Can short men wear double-breasted suits?', answer: 'Yes, but fit is critical. Choose a 4-button (showing 2) rather than 6-button configuration, keep the jacket slim, and ensure the button stance is not too low. A well-fitted double-breasted suit can actually elongate a shorter frame.' },
    ],
  },
  {
    handle: 'flat-front-vs-pleated-trousers',
    heading: 'Flat-Front vs Pleated Trousers',
    seo_title: 'Flat-Front vs Pleated Trousers | William Ashford',
    seo_description: 'Flat-front vs pleated trousers guide. Comfort, silhouette, occasion, and body type.',
    intro_text: 'The flat-front versus pleated debate is one of menswear\'s longest-running discussions. After years of flat-fronts dominating, pleats are making a definitive comeback. Here is how to choose between them.',
    item_a_name: 'Flat-Front',
    item_a_pros: 'Clean, streamlined silhouette\nModern and contemporary\nWorks well with slim and tailored fits\nLooks sharp on slender builds\nEasier to find in ready-to-wear',
    item_a_cons: 'Less room for movement\nCan be restrictive when seated\nLess flattering on larger waists\nOffers less drape than pleated',
    item_b_name: 'Pleated',
    item_b_pros: 'More room and comfort in the seat and thigh\nBetter drape and movement\nFlattering on athletic and larger builds\nMore elegant with high-waisted styles\nCurrently experiencing a strong revival',
    item_b_cons: 'Can add visual bulk if poorly fitted\nRequires precise tailoring to look right\nForward pleats work better than reverse for most men\nHarder to pair with very slim jackets',
    verdict: 'Flat-fronts are the safer, more modern choice — ideal for slim and regular builds. Pleats are the more comfortable, elegant option — especially for men with athletic builds or those who prefer high-waisted trousers. The best wardrobes include both.',
    item_a_collection: '/collections/all',
    item_b_collection: '/collections/all',
    faq_data: [
      { question: 'Are pleated trousers back in style?', answer: 'Yes — pleated trousers have made a significant comeback in recent years, driven by a broader shift toward relaxed, fuller silhouettes in menswear. Forward pleats in particular are widely worn by stylish men.' },
    ],
  },
  {
    handle: 'wool-vs-linen-suit',
    heading: 'Wool vs Linen Suit',
    seo_title: 'Wool vs Linen Suit: Which is Right? | William Ashford',
    seo_description: 'Wool or linen suit? Breathability, structure, season suitability, and guidance.',
    intro_text: 'Wool and linen are the two most important natural fibres in suiting — but they serve very different purposes. This comparison helps you decide which is right for your climate, your lifestyle, and your wardrobe.',
    item_a_name: 'Wool Suit',
    item_a_pros: 'Year-round versatility in different weights\nExcellent drape and wrinkle resistance\nHolds structure and tailoring beautifully\nWide range of colours and weaves available\nSuitable for business, formal, and casual settings',
    item_a_cons: 'Can be uncomfortable in extreme heat\nHeavier weights are restrictive in summer\nRequires dry cleaning',
    item_b_name: 'Linen Suit',
    item_b_pros: 'Exceptional breathability for hot weather\nLight and comfortable\nDistinctive relaxed texture\nDries quickly after perspiration\nAuthentic warm-weather aesthetic',
    item_b_cons: 'Creases heavily — inherent to the fabric\nLimited to spring and summer wear\nLess structured than wool\nNarrower colour range (best in light neutrals)\nNot appropriate for formal business settings',
    verdict: 'If you can only own one suit, make it wool — it works year-round. If you live in a warm climate or attend summer events regularly, add a linen suit as a seasonal complement. The ideal wardrobe has both.',
    item_a_collection: '/collections/all',
    item_b_collection: '/collections/all',
    faq_data: [
      { question: 'Can I wear a linen suit to the office?', answer: 'In most offices, a well-fitted linen suit in a neutral colour is acceptable during summer. In very conservative workplaces (law, finance), stick to tropical-weight wool, which offers breathability with a more structured appearance.' },
    ],
  },
  {
    handle: 'slim-fit-vs-regular-fit-suit',
    heading: 'Slim Fit vs Regular Fit Suit',
    seo_title: 'Slim Fit vs Regular Fit Suit | William Ashford',
    seo_description: 'Slim fit vs regular fit suit — which is right for your body type and occasion?',
    intro_text: 'Fit is the single most important factor in how a suit looks. But "slim" and "regular" mean different things to different brands. This guide defines both, explains who each suits best, and helps you choose the right silhouette.',
    item_a_name: 'Slim Fit',
    item_a_pros: 'Modern, contemporary silhouette\nCreates a clean, sharp line\nFlattering on slim to average builds\nPhotographs well — no excess fabric\nLooks intentional and well-considered',
    item_a_cons: 'Restrictive if you gain weight or are between sizes\nLess comfortable for all-day wear\nNot ideal for athletic or broader builds\nCan look too tight if incorrectly sized',
    item_b_name: 'Regular Fit',
    item_b_pros: 'Comfortable for all-day wear\nAccommodates a wider range of body types\nClassic, timeless silhouette\nEasier to layer underneath\nMore forgiving as your body changes',
    item_b_cons: 'Can look shapeless if too large\nLess defined waistline\nMay require more tailoring to look sharp\nCan photograph with excess fabric',
    verdict: 'Choose slim fit if you are slim to average build and prioritise a modern look. Choose regular fit if you are athletic or broad, value comfort, or plan to wear the suit for long days. The best fit is the one that follows your body without restricting it.',
    item_a_collection: '/collections/all',
    item_b_collection: '/collections/all',
    faq_data: [
      { question: 'How do I know if my suit is too slim?', answer: 'If you see an X-shaped pull across the button when fastened, the jacket is too tight. If the trousers pull at the thighs when seated, they are too slim. You should be able to sit, reach, and move comfortably.' },
    ],
  },
  {
    handle: 'suit-vs-blazer-and-trousers',
    heading: 'Suit vs Blazer and Trousers',
    seo_title: 'Suit vs Blazer and Trousers | William Ashford',
    seo_description: 'When to wear a suit vs blazer with separate trousers. Formality, versatility, and value.',
    intro_text: 'A suit and a blazer with trousers serve different purposes. One is a single outfit. The other is a system that creates multiple outfits. This guide explains when each is appropriate and how to maximise the value of both.',
    item_a_name: 'Matching Suit',
    item_a_pros: 'More formal and authoritative\nRequires less thought — one piece, one look\nAppropriate for business, interviews, and formal events\nMatching fabric creates a clean, cohesive silhouette\nGenerally expected at weddings and professional settings',
    item_a_cons: 'Less versatile — the jacket and trousers must be worn together\nIf one piece wears out, both are unusable\nFewer outfit combinations possible\nCan be overdressed for casual settings',
    item_b_name: 'Blazer and Trousers',
    item_b_pros: 'Maximum versatility — mix and match with different trousers\nMore relaxed and approachable\nBetter for smart-casual settings\nThe blazer works with jeans, chinos, and dress trousers\nMore outfits from fewer pieces',
    item_b_cons: 'Less formal than a matching suit\nRequires more skill to combine well\nWrong combinations can look like a mismatched suit\nNot appropriate for formal business or ceremonies',
    verdict: 'Own both. A navy suit covers formal occasions and business. A navy blazer with separate trousers covers everything in between. If you must choose one, the suit is safer — you can dress it down more easily than you can dress up separates.',
    item_a_collection: '/collections/all',
    item_b_collection: '/collections/all',
    faq_data: [
      { question: 'Can I wear a suit jacket as a blazer?', answer: 'Generally no. Suit jackets are made from lighter fabric with a matching weave designed to pair with the trousers. Worn separately, they often look like an orphaned half of a suit. True blazers have heavier fabric and distinctive buttons.' },
    ],
  },
  {
    handle: 'morning-dress-vs-lounge-suit',
    heading: 'Morning Dress vs Lounge Suit',
    seo_title: 'Morning Dress vs Lounge Suit | William Ashford',
    seo_description: 'Morning dress or lounge suit for weddings and formal events? The decision made clear.',
    intro_text: 'When a wedding or formal daytime event requires you to dress up, the choice often comes down to morning dress or a lounge suit. One is the most formal daytime option. The other is the modern standard. This guide helps you decide.',
    item_a_name: 'Morning Dress',
    item_a_pros: 'The most formal daytime dress code\nMakes a strong visual impression\nTraditional and ceremonial\nRequired at Royal Ascot and some weddings\nHistorically correct for daytime formality',
    item_a_cons: 'Expensive to buy — most men hire\nLimited to very specific occasions\nCan feel costume-like if worn incorrectly\nNot practical for everyday use',
    item_b_name: 'Lounge Suit',
    item_b_pros: 'Versatile across business and social occasions\nComfortable and practical\nOwn rather than hire\nAppropriate for the vast majority of events\nModern standard for weddings and formal events',
    item_b_cons: 'Less formal than morning dress\nMay be underdressed at very traditional events\nCommon — does not make a distinctive statement',
    verdict: 'For most weddings and formal daytime events, a well-fitted lounge suit in navy or grey is appropriate and expected. Morning dress is reserved for very specific occasions — Royal Ascot, traditional weddings where the dress code specifies it, and formal ceremonies. When in doubt, check the invitation.',
    item_a_collection: '/collections/all',
    item_b_collection: '/collections/all',
    faq_data: [
      { question: 'Do I need morning dress for a wedding?', answer: 'Only if the invitation specifically states morning dress. Most weddings today expect a lounge suit. If the groom is wearing morning dress and you are in the wedding party, you will usually be told to match.' },
    ],
  },
  {
    handle: 'canvas-vs-fused-construction',
    heading: 'Canvas vs Fused Suit Construction',
    seo_title: 'Canvas vs Fused Suit Construction | William Ashford',
    seo_description: 'Canvas vs fused suit construction compared. Longevity, drape, and cost.',
    intro_text: 'The construction method of a suit jacket determines how it drapes, how long it lasts, and how it ages. This comparison explains the fundamental difference between canvas and fused construction — and what it means for your wardrobe.',
    item_a_name: 'Canvas Construction',
    item_a_pros: 'Superior drape — fabric moves naturally\nMoulds to the wearer\'s body over time\nLapels roll naturally and beautifully\nLonger lifespan — 10+ years with care\nBetter breathability — no glue layer',
    item_a_cons: 'Significantly more expensive\nRequires skilled tailoring\nSlightly heavier than fused\nNot available in most fast-fashion brands',
    item_b_name: 'Fused Construction',
    item_b_pros: 'Much more affordable\nWidely available\nLightweight\nConsistent shape and appearance\nGood for occasional wear',
    item_b_cons: 'Can bubble or delaminate over time with dry cleaning\nDoes not drape as naturally\nLapels can look flat and lifeless\nDoes not mould to the body\nShorter lifespan — typically 3-5 years',
    verdict: 'For suits you plan to wear regularly and keep for years, invest in canvas construction (half or full). For suits worn occasionally or on a tight budget, fused construction is acceptable — just understand that it will not last as long or look as refined.',
    item_a_collection: '/collections/all',
    item_b_collection: '/collections/all',
    faq_data: [
      { question: 'How can I tell if a suit is fused or canvassed?', answer: 'Pinch the front of the jacket below the lapel. If you can feel three distinct layers (outer fabric, canvas, lining) that move independently, it is canvassed. If the front feels stiff and the layers move together as one, it is fused.' },
    ],
  },
  {
    handle: 'bespoke-vs-made-to-measure',
    heading: 'Bespoke vs Made-to-Measure',
    seo_title: 'Bespoke vs Made-to-Measure Suits | William Ashford',
    seo_description: 'Bespoke vs made-to-measure — what the terms mean and which is worth the investment.',
    intro_text: 'Bespoke and made-to-measure are often used interchangeably — but they are fundamentally different processes with different results and vastly different price points. This guide clarifies what each term actually means.',
    item_a_name: 'Bespoke',
    item_a_pros: 'Pattern created from scratch for your body\nComplete freedom in every design detail\nMultiple fittings for perfect fit\nHandmade by skilled craftspeople\nThe highest standard of tailoring',
    item_a_cons: 'Very expensive — typically £2,000-£10,000+\nTakes 6-12 weeks to complete\nRequires multiple in-person fittings\nLimited to specialist tailors\nResult depends entirely on the tailor\'s skill',
    item_b_name: 'Made-to-Measure',
    item_b_pros: 'Based on your measurements — better fit than off-the-rack\nMore affordable than bespoke\nFaster turnaround — typically 3-6 weeks\nGood range of fabric and style options\nAccessible online and in many stores',
    item_b_cons: 'Based on a standard pattern adjusted to your measurements\nLess individual than bespoke\nFit is good but rarely perfect\nLimited by the base pattern\'s proportions\nQuality varies significantly by provider',
    verdict: 'Made-to-measure offers the best value for most men — a significant improvement over off-the-rack at a fraction of bespoke prices. Bespoke is worth the investment for men who need precise fit for unusual proportions, or who want the highest standard of craftsmanship.',
    item_a_collection: '/collections/all',
    item_b_collection: '/collections/all',
    faq_data: [
      { question: 'Is made-to-measure the same as custom?', answer: 'Usually, yes. Most brands that advertise "custom" suits are offering made-to-measure — a standard pattern adjusted to your measurements. True bespoke involves creating a unique pattern from scratch. Ask whether a new pattern is created or an existing one is adjusted.' },
    ],
  },
  {
    handle: 'italian-vs-british-tailoring',
    heading: 'Italian vs British Tailoring',
    seo_title: 'Italian vs British Tailoring | William Ashford',
    seo_description: 'Italian vs British tailoring traditions — cut, shoulder, and silhouette compared.',
    intro_text: 'Italian and British tailoring represent two distinct philosophies of menswear. One prioritises softness and ease. The other prioritises structure and precision. Neither is superior — they serve different aesthetics and body types. This guide explains the core differences.',
    item_a_name: 'Italian Tailoring',
    item_a_pros: 'Soft, natural shoulder line\nLighter construction — comfortable in warmth\nRelaxed, effortless silhouette\nHigher armholes for better movement\nExcellent drape and fluidity',
    item_a_cons: 'Less structure — can look soft on some builds\nWrinkles more easily due to lighter construction\nMay lack the authority of structured tailoring\nSome styles prioritise fashion over timelessness',
    item_b_name: 'British Tailoring',
    item_b_pros: 'Defined, structured shoulder\nClean, sharp silhouette\nExcellent for creating a V-shape\nTimeless and authoritative\nSuperior construction and longevity',
    item_b_cons: 'Heavier and less comfortable in heat\nCan feel restrictive\nPadded shoulders may look dated if overdone\nLess relaxed — harder to dress down',
    verdict: 'Choose Italian tailoring if you value comfort, a relaxed aesthetic, and live in a warmer climate. Choose British tailoring if you want structure, authority, and a suit that commands a room. The best wardrobes often include both traditions.',
    item_a_collection: '/collections/all',
    item_b_collection: '/collections/all',
    faq_data: [
      { question: 'Which is better — Italian or British suits?', answer: 'Neither is objectively better. Italian suits prioritise soft comfort and natural drape. British suits prioritise structure and a defined silhouette. The best choice depends on your body type, climate, and personal style preference.' },
    ],
  },
  {
    handle: 'two-piece-vs-three-piece-suit',
    heading: 'Two-Piece vs Three-Piece Suit',
    seo_title: 'Two-Piece vs Three-Piece Suit | William Ashford',
    seo_description: 'Two-piece or three-piece suit? When the waistcoat adds value and when it\'s too formal.',
    intro_text: 'The waistcoat transforms a suit from two pieces to three — and changes the entire character of the outfit. But when does a waistcoat add value, and when is it too much? This guide helps you decide.',
    item_a_name: 'Two-Piece Suit',
    item_a_pros: 'More versatile — works for every occasion\nMore comfortable — less layering\nBetter for warm weather\nModern and understated\nEasier to dress up or down',
    item_a_cons: 'Less visual impact\nRemoving the jacket leaves just shirt and trousers\nFewer layering options',
    item_b_name: 'Three-Piece Suit',
    item_b_pros: 'Adds a layer of formality and polish\nLook sharp even with the jacket removed\nThe waistcoat creates a complete look on its own\nExcellent for weddings and formal events\nProvides extra warmth in winter',
    item_b_cons: 'Can be overdressed for casual settings\nAdds warmth — uncomfortable in summer\nMore expensive than a two-piece\nThe waistcoat must fit perfectly or it detracts',
    verdict: 'A two-piece suit should be your foundation — it is appropriate everywhere. Add a three-piece when you want to elevate for weddings, formal events, or cold-weather dressing. The waistcoat is best when it adds to the occasion, not when it overwhelms it.',
    item_a_collection: '/collections/all',
    item_b_collection: '/collections/all',
    faq_data: [
      { question: 'Can I buy the waistcoat separately?', answer: 'You can, but it must be in the same fabric as the suit. A mismatched waistcoat with a suit looks deliberate only if the contrast is intentional (e.g., a contrasting colour). A slightly different shade of the same colour looks like a mistake.' },
    ],
  },
];

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  William Ashford — Populate pSEO Content               ║');
  console.log('╚══════════════════════════════════════════════════════════╝\n');

  // Verify connection
  const shop = await graphql('{ shop { name } }');
  console.log(`Connected to: ${shop.shop.name}\n`);

  let created = 0, skipped = 0, errors = 0;

  // Style Guides (use_case_guide)
  console.log(`=== Style Guides (${styleGuides.length} entries) ===`);
  for (const sg of styleGuides) {
    process.stdout.write(`  ${sg.handle}...`);
    try {
      const status = await createMetaobject('use_case_guide', sg.handle, {
        heading: sg.heading,
        occasion: sg.heading,
        seo_title: sg.seo_title,
        seo_description: sg.seo_description,
        intro_text: sg.intro_text,
        style_tips: sg.style_tips,
        recommended_pieces: sg.recommended_pieces,
        dos_and_donts: sg.dos_and_donts,
        collection_link: sg.collection_link,
        faq_data: sg.faq_data,
      });
      if (status === 'EXISTS') { console.log(' EXISTS'); skipped++; }
      else { console.log(' OK'); created++; }
    } catch (e) { console.log(` ERROR: ${e.message.substring(0, 100)}`); errors++; }
    await sleep(300);
  }

  // Occasion Pages (use_case_guide)
  console.log(`\n=== Occasion Pages (${occasionPages.length} entries) ===`);
  for (const op of occasionPages) {
    process.stdout.write(`  ${op.handle}...`);
    try {
      const status = await createMetaobject('use_case_guide', op.handle, {
        heading: op.heading,
        occasion: op.heading,
        seo_title: op.seo_title,
        seo_description: op.seo_description,
        intro_text: op.intro_text,
        style_tips: op.style_tips,
        recommended_pieces: op.recommended_pieces,
        dos_and_donts: op.dos_and_donts,
        collection_link: op.collection_link,
        faq_data: op.faq_data,
      });
      if (status === 'EXISTS') { console.log(' EXISTS'); skipped++; }
      else { console.log(' OK'); created++; }
    } catch (e) { console.log(` ERROR: ${e.message.substring(0, 100)}`); errors++; }
    await sleep(300);
  }

  // Fabric Glossary (fabric_glossary_term)
  console.log(`\n=== Fabric Glossary (${fabricPages.length} entries) ===`);
  for (const fg of fabricPages) {
    process.stdout.write(`  ${fg.handle}...`);
    try {
      const status = await createMetaobject('fabric_glossary_term', fg.handle, {
        term_name: fg.term_name,
        seo_title: fg.seo_title,
        seo_description: fg.seo_description,
        short_definition: fg.short_definition,
        full_definition: fg.full_definition,
        properties: fg.properties,
        care_tips: fg.care_tips,
        collection_link: fg.collection_link,
        faq_data: fg.faq_data,
      });
      if (status === 'EXISTS') { console.log(' EXISTS'); skipped++; }
      else { console.log(' OK'); created++; }
    } catch (e) { console.log(` ERROR: ${e.message.substring(0, 100)}`); errors++; }
    await sleep(300);
  }

  // Comparisons (style_comparison)
  console.log(`\n=== Style Comparisons (${comparisonPages.length} entries) ===`);
  for (const cp of comparisonPages) {
    process.stdout.write(`  ${cp.handle}...`);
    try {
      const status = await createMetaobject('style_comparison', cp.handle, {
        heading: cp.heading,
        seo_title: cp.seo_title,
        seo_description: cp.seo_description,
        intro_text: cp.intro_text,
        item_a_name: cp.item_a_name,
        item_a_pros: cp.item_a_pros,
        item_a_cons: cp.item_a_cons,
        item_b_name: cp.item_b_name,
        item_b_pros: cp.item_b_pros,
        item_b_cons: cp.item_b_cons,
        verdict: cp.verdict,
        item_a_collection: cp.item_a_collection,
        item_b_collection: cp.item_b_collection,
        faq_data: cp.faq_data,
      });
      if (status === 'EXISTS') { console.log(' EXISTS'); skipped++; }
      else { console.log(' OK'); created++; }
    } catch (e) { console.log(` ERROR: ${e.message.substring(0, 100)}`); errors++; }
    await sleep(300);
  }

  console.log(`\n══════════════════════════════════════════════════════════`);
  console.log(`  DONE: ${created} created, ${skipped} already existed, ${errors} errors`);
  console.log(`══════════════════════════════════════════════════════════\n`);
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
