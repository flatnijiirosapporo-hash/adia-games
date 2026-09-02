# 問題バンク500問化 Phase 3 国語・社会・認知 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** legacy `tkk_games.html?game=`で動く17固定問題ゲームを各500問以上へ拡張し、問題データと出題ロジックを配布` tkk_games.html`へインラインする。

**Architecture:** `assets/tkk_games.js`を編集可能なソースとして維持し、17ゲームのバンクを明示的オブジェクトへ置き換える。`tools/build_tkk_selfcontained.js`が`game_catalog.js`、`game_profile_v24.js`、`result_store.js`、Phase 1のquestion-bag runtime、`tkk_games.js`を` tkk_games.html`へインラインし、最終配布ページから問題ロジックの外部JS依存を除く。

**Tech Stack:** vanilla JavaScript, Node.js build/test scripts, HTML

**Spec:** `docs/superpowers/specs/2026-09-02-question-bank-500-design.md`

## Global Constraints

- 対象17ゲーム: `colorquiz`, `shapequiz`, `hiraarrange`, `kataarrange`, `hirasearch`, `katasearch`, `idiomarrange`, `continents`, `prefecture`, `dicetalk`, `traffic`, `words`, `moraread`, `kanjipuzzle`, `bushu`, `palindrome`, `idiomsearch`。
- 各ゲーム500問以上。
- UI・結果記録・TOPカード名は変更しない。
- `story`と`hiramemory`は既に500通り以上として問題数目的では変更しない。

---

### Task 1: TKK固定問題17ゲームの監査テストを作る

**Files:**
- Create: `tests/tkk_fixed_banks_500.test.js`
- Create: `tools/tkk_bank_export.js`

**Interfaces:**
- `tools/tkk_bank_export.js` exports `FIXED_BANKS` for Node tests and emits browser assignment source for build.
- Keys exactly match the 17 game IDs.

- [ ] **Step 1: Write failing test**

For each ID assert bank count >=500, unique IDs, semantic duplicate 0, and 200/200/100 where difficulty applies. For `dicetalk`, allow 500 `all` questions because difficulty is not pedagogically necessary.

- [ ] **Step 2: Run RED**

Run: `node tests/tkk_fixed_banks_500.test.js`
Expected: FAIL because export module/banks do not exist.

- [ ] **Step 3: Define browser build contract**

Generated browser source must assign:

```js
window.NIJI_TKK_FIXED_BANKS={colorquiz:[/* records */],shapequiz:[/* records */]};
window.NIJI_QUESTION_BANK_VERSION='2026-09-02-q500-v1';
```

- [ ] **Step 4: Commit test contract**

```bash
git add tests/tkk_fixed_banks_500.test.js tools/tkk_bank_export.js
git commit -m "test: define 17 TKK fixed-bank gates"
```

### Task 2: 認知・社会4ゲームを500問化する

**Files:**
- Modify: `tools/tkk_bank_export.js`
- Modify: `assets/tkk_games.js:55-160`

**Games:** `colorquiz`, `shapequiz`, `continents`, `prefecture`

- [ ] **Step 1: Build `colorquiz` 500 records**

Use actual distinct color-learning tasks across basic colors, light/dark, warm/cool, same/different, everyday-object color recognition. Avoid presenting culturally variable object colors as uniquely correct unless prompt specifies the displayed swatch.

- [ ] **Step 2: Build `shapequiz` 500 records**

Cover name recognition, side/corner counts, matching, rotation invariance, 2D vs 3D where the existing UI supports the representation; maintain one correct choice.

- [ ] **Step 3: Build `continents` 500 records**

Use 6 continents + 3 oceans as factual base and create distinct tasks through name-to-location, location-to-name, neighboring ocean/continent, hemisphere/basic relative position, while avoiding false geopolitical claims.

- [ ] **Step 4: Build `prefecture` 500 records**

Use all 47 prefectures and factual cues such as region, capital name, shape/location relationships, neighboring prefectures, widely stable geographic features. Do not use volatile rankings/statistics without date/source.

- [ ] **Step 5: Change game functions to draw from `FIXED_BANKS[id]` via bag**

Preserve current per-play question counts and result UI.

- [ ] **Step 6: Run target test and commit**

```bash
node tests/tkk_fixed_banks_500.test.js
git add tools/tkk_bank_export.js assets/tkk_games.js
git commit -m "feat: expand TKK cognitive and social banks"
```

### Task 3: 国語の並べ替え・探索5ゲームを500問化する

**Files:**
- Modify: `tools/tkk_bank_export.js`
- Modify: `assets/tkk_games.js:130-150`

**Games:** `hiraarrange`, `kataarrange`, `hirasearch`, `katasearch`, `idiomarrange`

- [ ] **Step 1: Curate 500 unique vocabulary items per kana arrange/search game**

Hiragana easy bank emphasizes 2〜4 mora common words; normal 4〜6; challenge includes small kana, long sounds represented appropriately, voiced/semi-voiced sounds. Katakana banks use common child-accessible loanwords and proper generic categories, not brand names.

- [ ] **Step 2: Curate 500 valid four-character idioms/compounds for `idiomarrange`**

Every answer must be a real established expression. Store reading and short meaning in tags/explanation for validation and optional feedback.

- [ ] **Step 3: Generate search grids from bank answers at runtime**

The problem identity is the target word + direction + seed-independent placement class, not random filler layout. Bag chooses target question first; layout randomness may vary without consuming a second question ID.

- [ ] **Step 4: Run test and commit**

```bash
node tests/tkk_fixed_banks_500.test.js
git add tools/tkk_bank_export.js assets/tkk_games.js
git commit -m "feat: expand kana and idiom banks"
```

### Task 4: 国語の読み・漢字・回文・熟語探索5ゲームを500問化する

**Files:**
- Modify: `tools/tkk_bank_export.js`
- Modify: `assets/tkk_games.js:201-220`

**Games:** `moraread`, `kanjipuzzle`, `bushu`, `palindrome`, `idiomsearch`

- [ ] **Step 1: `moraread`**

500 words/short phrases with mora segmentation metadata; difficulty based on mora count and small kana/long vowel complexity.

- [ ] **Step 2: `kanjipuzzle`**

500 kanji decomposition records restricted to decompositions the game can render unambiguously. Each record stores exact allowed parts and rejects duplicate-part ambiguity.

- [ ] **Step 3: `bushu`**

500 kanji questions across common radicals; answer is the radical name, with visually similar distractors selected from other radicals.

- [ ] **Step 4: `palindrome`**

Create 250 genuine palindromes and 250 non-palindromes. Non-palindromes must be natural Japanese strings, not malformed text. Difficulty based on length.

- [ ] **Step 5: `idiomsearch`**

500 established four-character expressions; runtime grid generator must guarantee the target occurs at least once and validator rejects accidental second full occurrence if the game expects one target.

- [ ] **Step 6: Test and commit**

```bash
node tests/tkk_fixed_banks_500.test.js
git add tools/tkk_bank_export.js assets/tkk_games.js
git commit -m "feat: expand Japanese reading and kanji banks"
```

### Task 5: SST-lite3ゲームを500問化する

**Files:**
- Modify: `tools/tkk_bank_export.js`
- Modify: `assets/tkk_games.js:168-180`

**Games:** `dicetalk`, `traffic`, `words`

- [ ] **Step 1: `dicetalk` 500 prompts**

Use 500 age-appropriate conversation prompts with no forced disclosure of sensitive/private information. Categories include likes, activities, imagination, school-neutral daily life, cooperation, gratitude, goals, funny harmless choices.

- [ ] **Step 2: `traffic` 500 rule situations**

Use concrete stop/go/wait/look/listen choices across pedestrian, school corridor, public facility, vehicle boarding, play-space boundaries. Do not contradict actual traffic rules.

- [ ] **Step 3: `words` 500 language-choice questions**

Balance kind/neutral/hurtful phrasing and context; do not mark ordinary assertive boundaries as “bad words.”

- [ ] **Step 4: Test and commit**

```bash
node tests/tkk_fixed_banks_500.test.js
git add tools/tkk_bank_export.js assets/tkk_games.js
git commit -m "feat: expand conversation and rule banks"
```

### Task 6: `tkk_games.html`を自己完結ビルドする

**Files:**
- Create: `tools/build_tkk_selfcontained.js`
- Modify: `tkk_games.html`
- Modify: `tests/selfcontained_question_hosts.test.js`

**Interfaces:**
- Builder reads `tkk_games.html` as a template copy saved once as `tools/tkk_games_template.html`.
- Builder injects inline catalog/profile/result-store/question-bag/fixed-bank/tkk-game scripts.
- CSS/images may remain external as allowed by spec.

- [ ] **Step 1: Write failing build identity test**

Create `tests/tkk_selfcontained_build.test.js` that runs builder to a temp file, checks no `<script src="assets/tkk_games.js">`, no `<script src="assets/game_catalog.js">`, contains all 17 bank markers, and Node-parses every inline script.

- [ ] **Step 2: Run RED**
- [ ] **Step 3: Implement builder and generate `tkk_games.html`**
- [ ] **Step 4: Run GREEN**

```bash
node tests/tkk_selfcontained_build.test.js
node tests/tkk_fixed_banks_500.test.js
```

- [ ] **Step 5: Commit**

```bash
git add tools/tkk_games_template.html tools/build_tkk_selfcontained.js tkk_games.html tests/tkk_selfcontained_build.test.js
git commit -m "build: make TKK question host self-contained"
```

### Task 7: Phase 3 verification

- [ ] Run all TKK fixed-bank tests, local refs, and existing TOP tests.
- [ ] Confirm `story` and `hiramemory` behavior unchanged by targeted source hash/fixture checks.
- [ ] Commit phase gate.
