# Packing Helper

A local, browser-based app that asks you a series of questions and spits out a personalised packing list, downloadable as a Markdown file.

---

## Getting started

```
double-click index.html
```

---

## Project structure

```
packinghelper/
├── index.html           — entry point
├── css/
│   └── style.css        — all visual styling
└── js/
    ├── questions.js     ← question definitions
    ├── packingList.js   ← packing items + conditions
    └── app.js           — quiz engine, renderer, MD exporter
```

---

## Customizing questions (`js/questions.js`)

Each entry in the `QUESTIONS` array is one screen in the wizard.

```js
{
  id:          'duration',          // key used in the answers object
  text:        'How many days?',    // shown to the user
  type:        'number',            // see types below
  min:         1,                   // number-type options
  max:         365,
  placeholder: 'e.g. 7',
}
```

### Question types

| type | UI | Answer stored as |
|---|---|---|
| `choice` | Buttons — click auto-advances | `string` (the option's `value`) |
| `multiselect` | Toggle buttons + Continue | `string[]` (may be empty) |
| `number` | Number input + Continue | `number` |
| `text` | Text input + Continue | `string` |

For `choice` and `multiselect`, also provide an `options` array:

```js
options: [
  { value: 'hotel',   label: '🏨 Hotelsy'  },
  { value: 'outdoor', label: '⛺ Outdoorsy' },
]
```

---

## Customizing the packing list (`js/packingList.js`)

Each entry in `PACKING_ITEMS` describes one item and the condition under which it appears.

```js
{
  name:      'Sunscreen (SPF 50+)',
  category:  'Toiletries',                          // section heading in the output
  condition: (a) => a.climate === 'tropical',       // include when true
  quantity:  (a) => `×${Math.min(days(a), 3)}`,    // optional — shown next to name
  note:      'Apply 20 min before going outside',  // optional — small hint text
}
```

### The `answers` object

Both `condition` and `quantity` receive the same `answers` object. Its keys are the `id` values from `questions.js`:

```
answers.duration       number    — days
answers.style          string    — 'hotel' | 'outdoor' | 'mixed'
answers.climate        string    — 'tropical' | 'temperate' | 'cold' | 'variable'
answers.activities     string[]  — e.g. ['hiking', 'swimming']
answers.international  string    — 'yes' | 'no'
```

When you add a new question, its answer appears here automatically under its `id`.

### Helper functions (already defined in `packingList.js`)

```js
days(a)           // safe parse of answers.duration → number
has(a, activity)  // true if activity was selected in the multiselect
isOutdoor(a)      // true if style is 'outdoor' or 'mixed'
```

### Category ordering

Items appear in the output grouped by `category`, in the order their first member appears in `PACKING_ITEMS`. To control section order, place the first item of each category in the desired sequence.

---

## Markdown output

The downloaded `packing-list.md` contains:

1. **Trip Summary** — a bullet list of every question and the answer given
2. **Items** — one section per category, each item as a `- [ ]` checkbox

---

## Extending the app (`js/app.js`)

You should rarely need to touch `app.js`, but the three functions worth knowing about if you do:

| Function | What it does |
|---|---|
| `buildPackingList(answers)` | Filters and groups items — change if you want custom grouping logic |
| `renderResults(grouped)` | Builds the results HTML — change if you want a different layout |
| `generateMarkdown(grouped, answers)` | Builds the `.md` string — change if you want a different export format |
