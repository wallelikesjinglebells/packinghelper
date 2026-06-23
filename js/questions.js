// =============================================================================
// questions.js — Define the questions asked during the quiz
//
// HOW TO ADD A QUESTION
// ─────────────────────
// Push a new object into the QUESTIONS array. The `id` you choose here is the
// key used in the `answers` object that every condition function in
// packingList.js receives.
//
// QUESTION SCHEMA
// ───────────────
// {
//   id:          string                   — unique key (becomes answers.<id>)
//   text:        string                   — the question displayed to the user
//   type:        'choice'                 — single-select; click auto-advances
//              | 'multiselect'            — multiple toggles + Continue button
//              | 'number'                 — numeric input + Continue button
//              | 'text'                   — free-text input + Continue button
//   options:     Array<{value, label}>    — required for choice / multiselect
//   min, max, step: number               — optional; only used for type:'number'
//   placeholder: string                  — optional hint text for number/text
// }
//
// ANSWER TYPES PRODUCED
// ──────────────────────
//   choice      → string  (the selected option's `value`)
//   multiselect → string[] (array of selected `value`s; may be empty)
//   number      → number
//   text        → string
// =============================================================================

const QUESTIONS = [

  // ── How long? ──────────────────────────────────────────────────────────────
  {
    id:          'duration',
    text:        'How many days is the trip?',
    type:        'number',
    min:         1,
    max:         365,
    step:        1,
    placeholder: 'e.g. 7',
  },

  // ── What kind of trip? ──────────────────────────────────────────────────────
  {
    id:   'style',
    text: "What's the vibe of your trip?",
    type: 'choice',
    options: [
      { value: 'hotel',   label: '🏨 Hotelsy'       },
      { value: 'outdoor', label: '⛺ Outdoorsy'      },
      { value: 'mixed',   label: '🌗 Mix of both'   },
    ],
  },

  // ── Climate ────────────────────────────────────────────────────────────────
  {
    id:   'climate',
    text: "What's the climate like at your destination?",
    type: 'choice',
    options: [
      { value: 'tropical',  label: '🌴 Hot & humid'          },
      { value: 'temperate', label: '🌤️ Mild / Mediterranean' },
      { value: 'cold',      label: '❄️ Cold'                 },
      { value: 'variable',  label: '🌦️ Variable / mixed'    },
    ],
  },

  // ── Activities ─────────────────────────────────────────────────────────────
  {
    id:   'activities',
    text: 'Which activities are you planning? (select all that apply)',
    type: 'multiselect',
    options: [
      { value: 'hiking',   label: '🥾 Hiking / trekking' },
      { value: 'swimming', label: '🏊 Swimming / beach'   },
      { value: 'formal',   label: '👔 Formal events'      },
      { value: 'business', label: '💼 Business meetings'  },
      { value: 'cycling',  label: '🚴 Cycling'            },
    ],
  },

  // ── International? ─────────────────────────────────────────────────────────
  {
    id:   'international',
    text: 'Is this an international trip?',
    type: 'choice',
    options: [
      { value: 'yes', label: '✈️ Yes, flying abroad' },
      { value: 'no',  label: '🚗 No, staying domestic' },
    ],
  },

];
