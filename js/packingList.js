// =============================================================================
// packingList.js — Define every possible packing item and when to include it
//
// HOW TO ADD AN ITEM
// ──────────────────
// Push a new object into the PACKING_ITEMS array (see schema below).
// Items appear in the output in the order they are declared here, grouped by
// `category`. Category names are arbitrary strings; items sharing the same
// string are rendered together.
//
// ITEM SCHEMA
// ───────────
// {
//   name:      string                       — display name in the list
//   category:  string                       — section heading (e.g. 'Clothing')
//   condition: (answers) => boolean         — return true to include this item
//   quantity:  (answers) => string          — optional; shown next to the name
//   note:      string                       — optional; small hint under the name
// }
//
// THE `answers` OBJECT
// ────────────────────
// Condition and quantity functions both receive the same `answers` object:
//   answers.duration      number    — number of days (from questions.js)
//   answers.style         string    — 'hotel' | 'outdoor' | 'mixed'
//   answers.climate       string    — 'tropical' | 'temperate' | 'cold' | 'variable'
//   answers.activities    string[]  — e.g. ['hiking', 'swimming']
//   answers.international string    — 'yes' | 'no'
//
// If you add new questions in questions.js, their answers appear here
// automatically under the question's `id` key.
//
// HELPER FUNCTIONS (defined below)
// ─────────────────────────────────
//   days(a)         → number of trip days (safe parse)
//   has(a, act)     → true if the activity was selected
//   isOutdoor(a)    → true if style is outdoor or mixed
// =============================================================================

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Safe integer parse of the duration answer. */
const days = (a) => Math.max(1, parseInt(a.duration) || 1);

/** True if the given activity was selected in the multiselect question. */
const has = (a, activity) =>
  Array.isArray(a.activities) && a.activities.includes(activity);

/** True if the trip involves outdoor / camping nights. */
const isOutdoor = (a) => a.style === 'outdoor' || a.style === 'mixed';


// ── Packing Items ─────────────────────────────────────────────────────────────

const PACKING_ITEMS = [

  // ── Clothing ────────────────────────────────────────────────────────────────

  {
    name:      'Underwear',
    category:  'Clothing',
    condition: (_) => true,
    // Cap at 7: for longer trips the user will do laundry.
    quantity:  (a) => `×${Math.min(days(a), 7)}`,
  },
  {
    name:      'Socks',
    category:  'Clothing',
    condition: (_) => true,
    quantity:  (a) => `×${Math.min(days(a), 7)} pairs`,
  },
  {
    name:      'T-shirts / casual tops',
    category:  'Clothing',
    condition: (_) => true,
    quantity:  (a) => `×${Math.min(days(a), 5)}`,
  },
  {
    name:      'Trousers / jeans',
    category:  'Clothing',
    condition: (_) => true,
    quantity:  () => '×2',
  },
  {
    name:      'Shorts',
    category:  'Clothing',
    condition: (a) => a.climate === 'tropical' || a.climate === 'temperate' || has(a, 'hiking'),
    quantity:  () => '×2',
  },
  {
    name:      'Swimsuit',
    category:  'Clothing',
    condition: (a) => has(a, 'swimming') || a.climate === 'tropical',
    quantity:  () => '×2',
    note:      'Doubles as shorts in a pinch',
  },
  {
    name:      'Warm fleece or jumper',
    category:  'Clothing',
    condition: (a) => a.climate === 'cold' || a.climate === 'variable' || isOutdoor(a),
  },
  {
    name:      'Waterproof / windproof jacket',
    category:  'Clothing',
    condition: (a) => a.climate === 'cold' || a.climate === 'variable' || isOutdoor(a),
  },
  {
    name:      'Thermal base layers',
    category:  'Clothing',
    condition: (a) => a.climate === 'cold',
    quantity:  () => '×2 sets',
  },
  {
    name:      'Formal outfit',
    category:  'Clothing',
    condition: (a) => has(a, 'formal'),
    note:      'One full outfit per event',
  },
  {
    name:      'Business attire',
    category:  'Clothing',
    condition: (a) => has(a, 'business'),
    quantity:  (a) => '×2–3 outfits',
  },
  {
    name:      'Hiking boots',
    category:  'Clothing',
    condition: (a) => has(a, 'hiking'),
  },
  {
    name:      'Sandals / flip-flops',
    category:  'Clothing',
    condition: (a) => a.climate === 'tropical' || has(a, 'swimming'),
  },
  {
    name:      'Comfortable walking shoes',
    category:  'Clothing',
    condition: (_) => true,
  },
  {
    name:      'Cycling kit (padded shorts, jersey)',
    category:  'Clothing',
    condition: (a) => has(a, 'cycling'),
    quantity:  () => '×2 sets',
  },

  // ── Toiletries ───────────────────────────────────────────────────────────────

  {
    name:      'Travel-size toiletries',
    category:  'Toiletries',
    condition: (_) => true,
    note:      'Shampoo, conditioner, body wash',
  },
  {
    name:      'Toothbrush & toothpaste',
    category:  'Toiletries',
    condition: (_) => true,
  },
  {
    name:      'Deodorant',
    category:  'Toiletries',
    condition: (_) => true,
  },
  {
    name:      'Sunscreen (SPF 50+)',
    category:  'Toiletries',
    condition: (a) =>
      a.climate === 'tropical' || a.climate === 'temperate' ||
      has(a, 'swimming') || has(a, 'hiking') || has(a, 'cycling'),
  },
  {
    name:      'Insect repellent',
    category:  'Toiletries',
    condition: (a) => a.climate === 'tropical' || has(a, 'hiking') || isOutdoor(a),
  },
  {
    name:      'Lip balm with SPF',
    category:  'Toiletries',
    condition: (a) => a.climate === 'cold' || a.climate === 'tropical',
  },
  {
    name:      'Moisturiser',
    category:  'Toiletries',
    condition: (a) => a.climate === 'cold',
    note:      'Cold air is drying',
  },

  // ── Electronics ──────────────────────────────────────────────────────────────

  {
    name:      'Phone charger',
    category:  'Electronics',
    condition: (_) => true,
  },
  {
    name:      'Universal power adapter',
    category:  'Electronics',
    condition: (a) => a.international === 'yes',
    note:      'Check destination outlet type before you buy',
  },
  {
    name:      'Portable battery pack',
    category:  'Electronics',
    condition: (a) => isOutdoor(a) || has(a, 'hiking') || has(a, 'cycling'),
    note:      'Especially if you rely on phone GPS offline',
  },
  {
    name:      'Laptop + charger',
    category:  'Electronics',
    condition: (a) => has(a, 'business'),
  },
  {
    name:      'Camera',
    category:  'Electronics',
    condition: (_) => false, // Change to `true` or add your own condition
  },

  // ── Gear ─────────────────────────────────────────────────────────────────────

  {
    name:      'Daypack / backpack',
    category:  'Gear',
    condition: (a) => isOutdoor(a) || has(a, 'hiking') || has(a, 'cycling'),
  },
  {
    name:      'Water bottle (1 L)',
    category:  'Gear',
    condition: (_) => true,
  },
  {
    name:      'First aid kit',
    category:  'Gear',
    condition: (a) => isOutdoor(a) || has(a, 'hiking') || has(a, 'cycling'),
    note:      'Plasters, antiseptic, blister pads, pain relief',
  },
  {
    name:      'Headlamp + spare batteries',
    category:  'Gear',
    condition: (a) => isOutdoor(a) || has(a, 'hiking'),
  },
  {
    name:      'Sleeping bag',
    category:  'Gear',
    condition: (a) => a.style === 'outdoor',
    note:      'Check temperature rating vs. forecast',
  },
  {
    name:      'Bike lock',
    category:  'Gear',
    condition: (a) => has(a, 'cycling'),
  },
  {
    name:      'Snorkelling mask',
    category:  'Gear',
    condition: (a) => has(a, 'swimming') && a.climate === 'tropical',
  },
  {
    name:      'Packing cubes',
    category:  'Gear',
    condition: (a) => days(a) >= 5,
    note:      'Worth it for longer trips',
  },

  // ── Documents & Admin ─────────────────────────────────────────────────────────

  {
    name:      'Passport',
    category:  'Documents & Admin',
    condition: (a) => a.international === 'yes',
  },
  {
    name:      'Travel insurance documents',
    category:  'Documents & Admin',
    condition: (a) => a.international === 'yes',
  },
  {
    name:      'Local currency / travel card',
    category:  'Documents & Admin',
    condition: (a) => a.international === 'yes',
  },
  {
    name:      'Copies of important documents',
    category:  'Documents & Admin',
    condition: (a) => a.international === 'yes',
    note:      'Stored separately from originals (or photographed)',
  },
  {
    name:      'Hotel / accommodation confirmation',
    category:  'Documents & Admin',
    condition: (_) => true,
  },

];
