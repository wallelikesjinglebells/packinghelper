// =============================================================================
// app.js — Quiz engine, packing list builder, and Markdown exporter
//
// This file is the glue. It reads QUESTIONS (questions.js) and PACKING_ITEMS
// (packingList.js) but you should rarely need to edit it. The three main
// sections you might extend:
//
//   buildPackingList()   — how items are filtered and grouped
//   renderResults()      — how the results page is built
//   generateMarkdown()   — what the downloaded .md file looks like
// =============================================================================

// ── State ─────────────────────────────────────────────────────────────────────

/**
 * Single source of truth for the quiz session.
 *   answers      — keyed by question ID; values set by advance()
 *   currentIndex — which question is currently displayed
 */
const state = {
  answers: {},
  currentIndex: 0,
};

// ── DOM References ────────────────────────────────────────────────────────────
// Queried once at startup rather than on every render.

const screens = {
  intro:   document.getElementById('screen-intro'),
  quiz:    document.getElementById('screen-quiz'),
  results: document.getElementById('screen-results'),
};

const els = {
  progressBar:  document.getElementById('progress-bar'),
  progressText: document.getElementById('progress-text'),
  questionCard: document.getElementById('question-card'),
  packingList:  document.getElementById('packing-list'),
};

// ── Screen Management ─────────────────────────────────────────────────────────

/** Show one screen, hide the others, and scroll to the top. */
function showScreen(name) {
  Object.values(screens).forEach(s => { s.hidden = true; });
  screens[name].hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Quiz Engine ───────────────────────────────────────────────────────────────

/** Resets state and starts the quiz from the first question. */
function startQuiz() {
  state.answers = {};
  state.currentIndex = 0;
  showScreen('quiz');
  renderQuestion(0);
}

/**
 * Renders the question at position `index` into #question-card.
 * Also updates the progress bar.
 */
function renderQuestion(index) {
  const q         = QUESTIONS[index];
  const total     = QUESTIONS.length;
  const existing  = state.answers[q.id]; // pre-fill if user navigated back

  // Progress: show 1-based fraction (question 1 = 1/n, question n = 100%)
  const pct = ((index + 1) / total) * 100;
  els.progressBar.style.width = `${pct}%`;
  els.progressText.textContent = `Question ${index + 1} of ${total}`;

  els.questionCard.innerHTML = buildQuestionHTML(q, existing);
  attachQuestionEvents(q);

  // Auto-focus the input for keyboard users
  const input = els.questionCard.querySelector('input');
  if (input) input.focus();
}

// ── HTML Builder ──────────────────────────────────────────────────────────────

/**
 * Returns the inner HTML for a question card.
 *
 * `currentAnswer` is used to restore selections when the user goes Back.
 * The Back button is only rendered for questions after the first.
 *
 * @param {Object} q             - Question object from questions.js
 * @param {*}      currentAnswer - Previously saved answer, or undefined
 * @returns {string} HTML string
 */
function buildQuestionHTML(q, currentAnswer) {
  const backBtn = state.currentIndex > 0
    ? `<button class="btn-back" id="btn-back">← Back</button>`
    : '';

  let inputHTML;

  switch (q.type) {

    case 'choice': {
      const opts = q.options.map(o => {
        const sel = currentAnswer === o.value;
        return `
          <button class="option-btn${sel ? ' selected' : ''}"
                  data-value="${o.value}"
                  role="radio"
                  aria-checked="${sel}">
            ${o.label}
          </button>`;
      }).join('');
      inputHTML = `<div class="options-grid" role="radiogroup">${opts}</div>`;
      break;
    }

    case 'multiselect': {
      const selSet = new Set(Array.isArray(currentAnswer) ? currentAnswer : []);
      const opts = q.options.map(o => {
        const sel = selSet.has(o.value);
        return `
          <button class="option-btn${sel ? ' selected' : ''}"
                  data-value="${o.value}"
                  aria-pressed="${sel}">
            ${o.label}
          </button>`;
      }).join('');
      inputHTML = `
        <div class="options-grid" role="group">${opts}</div>
        <p class="hint">Select all that apply — none is fine too.</p>
        <button class="btn-continue" id="btn-continue">Continue →</button>`;
      break;
    }

    case 'number':
      inputHTML = `
        <input type="number"
               id="q-input"
               class="text-input"
               min="${q.min  ?? 1}"
               max="${q.max  ?? 9999}"
               step="${q.step ?? 1}"
               value="${currentAnswer ?? ''}"
               placeholder="${q.placeholder ?? 'Enter a number'}">
        <button class="btn-continue" id="btn-continue">Continue →</button>`;
      break;

    case 'text':
      inputHTML = `
        <input type="text"
               id="q-input"
               class="text-input"
               value="${currentAnswer ?? ''}"
               placeholder="${q.placeholder ?? 'Your answer…'}">
        <button class="btn-continue" id="btn-continue">Continue →</button>`;
      break;

    default:
      inputHTML = `<p class="hint">⚠️ Unknown question type: "${q.type}"</p>`;
  }

  return `
    <h2 class="question-text">${q.text}</h2>
    <div class="question-input">
      ${inputHTML}
      ${backBtn}
    </div>`;
}

// ── Event Wiring ──────────────────────────────────────────────────────────────

/**
 * Attaches all interactive behaviour for the currently rendered question.
 * Must be called after the question HTML is in the DOM.
 *
 * @param {Object} q - Question object from questions.js
 */
function attachQuestionEvents(q) {
  const card = els.questionCard;

  // Back button (present on all questions except the first)
  card.querySelector('#btn-back')?.addEventListener('click', () => {
    state.currentIndex--;
    renderQuestion(state.currentIndex);
  });

  if (q.type === 'choice') {
    card.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        // Update visual state
        card.querySelectorAll('.option-btn').forEach(b => {
          b.classList.remove('selected');
          b.setAttribute('aria-checked', 'false');
        });
        btn.classList.add('selected');
        btn.setAttribute('aria-checked', 'true');

        // Brief pause so the user sees their selection before advancing.
        setTimeout(() => advance(q, btn.dataset.value), 300);
      });
    });
  }

  else if (q.type === 'multiselect') {
    // Seed selection from existing answer so Back navigation restores state.
    const selected = new Set(
      Array.isArray(state.answers[q.id]) ? state.answers[q.id] : []
    );

    card.querySelectorAll('.option-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const v = btn.dataset.value;
        if (selected.has(v)) {
          selected.delete(v);
          btn.classList.remove('selected');
          btn.setAttribute('aria-pressed', 'false');
        } else {
          selected.add(v);
          btn.classList.add('selected');
          btn.setAttribute('aria-pressed', 'true');
        }
      });
    });

    card.querySelector('#btn-continue').addEventListener('click', () => {
      advance(q, Array.from(selected));
    });
  }

  else if (q.type === 'number' || q.type === 'text') {
    const input = card.querySelector('#q-input');

    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') submitTextInput(q, input);
    });

    card.querySelector('#btn-continue').addEventListener('click', () => {
      submitTextInput(q, input);
    });
  }
}

/** Validates a text/number input and calls advance() if it passes. */
function submitTextInput(q, input) {
  const raw = input.value.trim();
  if (!raw) {
    input.classList.add('error');
    input.focus();
    return;
  }
  input.classList.remove('error');
  advance(q, q.type === 'number' ? Number(raw) : raw);
}

/**
 * Saves `value` under the question's ID and moves to the next question.
 * If this was the last question, renders the results screen instead.
 *
 * @param {Object} q     - The question that was just answered
 * @param {*}      value - The answer value to store
 */
function advance(q, value) {
  state.answers[q.id] = value;

  if (state.currentIndex < QUESTIONS.length - 1) {
    state.currentIndex++;
    renderQuestion(state.currentIndex);
  } else {
    showResults();
  }
}

// ── Packing List Builder ──────────────────────────────────────────────────────

/**
 * Evaluates each item's `condition()` against the collected answers.
 * Items whose condition throws (e.g. a missing answer key) are silently skipped.
 *
 * Returns items grouped by category, preserving the order they appear in
 * PACKING_ITEMS within each group.
 *
 * @param {Object} answers
 * @returns {Object<string, Item[]>}  { [categoryName]: Item[] }
 */
function buildPackingList(answers) {
  const grouped = {};

  for (const item of PACKING_ITEMS) {
    let include = false;
    try {
      include = !!item.condition(answers);
    } catch (err) {
      console.warn(`Condition error for "${item.name}":`, err);
    }

    if (include) {
      (grouped[item.category] ??= []).push(item);
    }
  }

  return grouped;
}

// ── Results Renderer ──────────────────────────────────────────────────────────

/** Builds the packing list and switches to the results screen. */
function showResults() {
  const grouped = buildPackingList(state.answers);
  renderResults(grouped);
  showScreen('results');
}

/**
 * Renders the grouped packing list into #packing-list.
 * Each category becomes a card; each item gets a checkbox.
 *
 * @param {Object<string, Item[]>} grouped
 */
function renderResults(grouped) {
  const categories = Object.entries(grouped);

  if (categories.length === 0) {
    els.packingList.innerHTML =
      '<p class="empty">No items matched your answers. Try adjusting your responses.</p>';
    return;
  }

  els.packingList.innerHTML = categories.map(([cat, items]) => {
    const rows = items.map(item => {
      const qty  = item.quantity
        ? ` <span class="qty">${item.quantity(state.answers)}</span>`
        : '';
      const note = item.note
        ? `<span class="item-note">${item.note}</span>`
        : '';
      return `
        <li class="item">
          <label class="item-label">
            <input type="checkbox">
            <span class="item-name">${item.name}${qty}</span>
          </label>
          ${note}
        </li>`;
    }).join('');

    return `
      <div class="category">
        <h3 class="category-title">${cat}</h3>
        <ul class="item-list">${rows}</ul>
      </div>`;
  }).join('');
}

// ── Markdown Exporter ─────────────────────────────────────────────────────────

/**
 * Builds a complete Markdown string from the grouped packing list.
 * Includes a "Trip Summary" section that mirrors the answers given.
 *
 * @param {Object<string, Item[]>} grouped
 * @param {Object}                 answers
 * @returns {string}
 */
function generateMarkdown(grouped, answers) {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  let md = `# Packing List\n*Generated ${date}*\n\n`;

  // Trip summary section derived from answers
  md += `## Trip Summary\n\n`;
  for (const q of QUESTIONS) {
    const val = answers[q.id];
    if (val === undefined || val === null) continue;
    const display = Array.isArray(val)
      ? (val.length ? val.join(', ') : '—')
      : String(val);
    md += `- **${q.text}** ${display}\n`;
  }

  md += `\n## Items\n\n`;

  for (const [cat, items] of Object.entries(grouped)) {
    md += `### ${cat}\n\n`;
    for (const item of items) {
      const qty  = item.quantity ? ` ${item.quantity(answers)}` : '';
      const note = item.note    ? ` *(${item.note})*`           : '';
      md += `- [ ] ${item.name}${qty}${note}\n`;
    }
    md += '\n';
  }

  return md;
}

/** Triggers a browser download of `content` as a Markdown file. */
function downloadMarkdown(content) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'packing-list.md';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Top-level Event Listeners ─────────────────────────────────────────────────

document.getElementById('btn-start').addEventListener('click', startQuiz);

document.getElementById('btn-restart').addEventListener('click', () => {
  showScreen('intro');
});

document.getElementById('btn-download').addEventListener('click', () => {
  const grouped = buildPackingList(state.answers);
  const md      = generateMarkdown(grouped, state.answers);
  downloadMarkdown(md);
});
