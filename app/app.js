// Vice City Trophy Guide: checklist + tracker for the 55 official GTA VI (PS5) trophies.
// Progress and the spoiler setting are saved in localStorage; export/import move them as JSON.
// Everything is local: the trophy data comes from data/trophies.json, no network request.
const EARNED_KEY = 'gta6-trophy-guide-earned-v1';
const SPOILER_KEY = 'gta6-trophy-guide-spoilers-v1';

const listEl = document.getElementById('trophy-list');
const searchEl = document.getElementById('search');
const gradeEl = document.getElementById('grade');
const kindEl = document.getElementById('kind');
const statusEl = document.getElementById('status');
const spoilersEl = document.getElementById('spoilers');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');
const gradeCountsEl = document.getElementById('grade-counts');
const resultCountEl = document.getElementById('result-count');

const KIND_LABELS = {
  story: 'Story', side: 'Side stories', robbery: 'Robberies', activity: 'Activities',
  collectible: 'Collectibles', money: 'Money & property', combat: 'Combat & driving',
  exploration: 'Exploration', misc: 'Odd jobs', platinum: 'Platinum & 100%',
};

let earned = new Set(JSON.parse(localStorage.getItem(EARNED_KEY) ?? '[]'));
let spoilersOn = localStorage.getItem(SPOILER_KEY) !== 'off';
spoilersEl.checked = spoilersOn;

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;

function saveEarned() {
  localStorage.setItem(EARNED_KEY, JSON.stringify([...earned]));
}

function saveSpoilers() {
  localStorage.setItem(SPOILER_KEY, spoilersOn ? 'on' : 'off');
}

function isHiddenFromSpoilers(t) {
  return spoilersOn && t.kind === 'story' && !earned.has(t.name);
}

function badge(t) {
  const span = document.createElement('span');
  span.className = `grade-badge grade-${t.grade}`;
  span.textContent = t.grade;
  return span;
}

function flag(text, cls) {
  const span = document.createElement('span');
  span.className = `flag ${cls}`;
  span.textContent = text;
  return span;
}

function renderProgress() {
  const n = earned.size;
  const total = trophies.length;
  const pct = Math.round((n / total) * 100);
  progressFill.style.width = `${pct}%`;
  progressText.textContent = `${n} of ${total} earned — ${pct}%`;
  const counts = {};
  for (const t of trophies) {
    counts[t.grade] = counts[t.grade] ?? { earned: 0, total: 0 };
    counts[t.grade].total += 1;
    if (earned.has(t.name)) counts[t.grade].earned += 1;
  }
  gradeCountsEl.textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => `${counts[g].earned}/${counts[g].total} ${g}`)
    .join('  ·  ');
}

function render() {
  const q = searchEl.value.trim().toLowerCase();
  listEl.replaceChildren();
  let shown = 0;
  for (const t of trophies) {
    if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) continue;
    if (kindEl.value !== 'all' && t.kind !== kindEl.value) continue;
    if (statusEl.value === 'earned' && !earned.has(t.name)) continue;
    if (statusEl.value === 'unearned' && earned.has(t.name)) continue;
    if (q && !(t.name.toLowerCase().includes(q) || t.guide.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))) continue;
    shown += 1;

    const card = document.createElement('article');
    card.className = `trophy-card grade-${t.grade}`;
    if (earned.has(t.name)) card.classList.add('earned');

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.className = 'earn-box';
    box.checked = earned.has(t.name);
    box.setAttribute('aria-label', `Mark ${t.name} as earned`);
    box.addEventListener('change', () => {
      if (box.checked) earned.add(t.name);
      else earned.delete(t.name);
      saveEarned();
      render();
    });
    card.append(box);

    const body = document.createElement('div');
    body.className = 'trophy-body';

    const head = document.createElement('div');
    head.className = 'trophy-head';
    const nameEl = document.createElement('h3');
    nameEl.className = 'trophy-name';
    head.append(nameEl, badge(t));
    if (t.hidden) head.append(flag('Hidden', 'flag-hidden'));
    if (t.missable) head.append(flag('Missable', 'flag-missable'));
    body.append(head);

    if (isHiddenFromSpoilers(t)) {
      nameEl.textContent = 'Hidden story trophy';
      const cover = document.createElement('p');
      cover.className = 'spoiler-cover';
      cover.textContent = 'A story trophy. Its name, description and guide stay hidden until you earn it — or turn the spoiler setting off.';
      body.append(cover);
    } else {
      nameEl.textContent = t.name;
      const desc = document.createElement('p');
      desc.className = 'official-desc';
      desc.textContent = `“${t.description}” — official description`;
      body.append(desc);
      const guide = document.createElement('p');
      guide.className = 'guide';
      guide.textContent = t.guide;
      body.append(guide);
      const meta = document.createElement('p');
      meta.className = 'trophy-meta';
      meta.textContent = `When: ${t.when}  ·  Kind: ${KIND_LABELS[t.kind] ?? t.kind}`;
      body.append(meta);
      const src = document.createElement('p');
      src.className = 'trophy-sources';
      src.textContent = `Sources: ${t.sources.join('; ')}`;
      body.append(src);
    }
    card.append(body);
    listEl.append(card);
  }
  resultCountEl.textContent = shown === trophies.length
    ? `Showing all ${trophies.length} trophies.`
    : `Showing ${shown} of ${trophies.length} trophies.`;
  renderProgress();
}

document.getElementById('export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(
    [JSON.stringify({ game: 'Grand Theft Auto VI', platform: 'PS5', earned: [...earned] }, null, 2)],
    { type: 'application/json' },
  ));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  // render() rewrites the result line, so any import feedback must be set
  // after it runs — setting it before would be wiped out immediately.
  let note = '';
  try {
    const data = JSON.parse(await file.text());
    const names = new Set(trophies.map((t) => t.name));
    earned = new Set((data.earned ?? data ?? []).filter((n) => names.has(n)));
    saveEarned();
    note = `Imported progress: ${earned.size} of ${trophies.length} trophies earned.`;
  } catch {
    note = 'That file could not be read as a progress export.';
  }
  e.target.value = '';
  render();
  resultCountEl.textContent = note;
});

document.getElementById('reset').addEventListener('click', () => {
  if (!earned.size) return;
  earned = new Set();
  saveEarned();
  render();
  resultCountEl.textContent = 'Progress reset: 0 of 55 trophies earned.';
});

spoilersEl.addEventListener('change', () => {
  spoilersOn = spoilersEl.checked;
  saveSpoilers();
  render();
});

for (const el of [searchEl, gradeEl, kindEl, statusEl]) el.addEventListener('input', render);

render();
