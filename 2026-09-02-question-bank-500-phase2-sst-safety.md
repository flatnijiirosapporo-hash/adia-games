# 問題バンク500問化 Phase 2 SST・安全 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** SST・危険予知・10分チェック系の13対象ゲーム/モードを、実質重複のない500問以上へ拡張し、場面カテゴリ分散と永続シャッフルバッグを適用する。

**Architecture:** 各HTMLの既存`DATA`を新しいオブジェクトスキーマへ移行し、問題ID・difficulty・categoryを追加する。データは各HTMLへ直接内包し、出題時はPhase 1の`createQuestionBag`ソースを同じHTMLへインラインする。`sst_skills.html`は6モードそれぞれ独立500問・独立バッグとして扱う。

**Tech Stack:** HTML, vanilla JavaScript, Node.js validators, localStorage

**Spec:** `docs/superpowers/specs/2026-09-02-question-bank-500-design.md`

## Global Constraints

- 対象: 危険予知、10分チェック、問題形式SST、SSTロールプレイ、助けを求める、上手に断る、気持ちを伝える、聞く・会話を続ける、仲直り・やり直し、相手の立場、気持ち選択、順番・待つ、トラブル対応。
- 6つの`sst_skills.html?mode=`は6ゲームとしてそれぞれ500問。
- 難易度を持つゲームは200/200/100。難易度が不自然なロールプレイ等は500一括プール可。
- SST/危険予知は12場面カテゴリへ分散し、各カテゴリ最低25問、最大80問を目安にする。
- 危険・羞恥・攻撃性を必要以上に強めない。

---

### Task 1: SST・安全専用品質監査を先に作る

**Files:**
- Create: `tests/sst_safety_500_quality.test.js`
- Create: `tools/extract_inline_bank.js`

**Interfaces:**
- `extractInlineBank(file, marker)` returns parsed bank array from `/* NIJI_BANK:<marker>:START */` and `/* NIJI_BANK:<marker>:END */` JSON literal.

- [ ] **Step 1: Write tests for 13 pages/modes**

Expected bank keys:

```js
[
 ['danger_game.html','danger'],
 ['cognitive_check_10min.html','cognitive'],
 ['sst_quiz.html','sstQuiz'],
 ['sst_roleplay.html','sstRoleplay'],
 ['sst_skills.html','help'],['sst_skills.html','refuse'],['sst_skills.html','feel'],
 ['sst_skills.html','listen'],['sst_skills.html','repair'],['sst_skills.html','perspective'],
 ['feeling_choice.html','feelingChoice'],
 ['turn_waiting.html','turnWaiting'],
 ['trouble_response.html','troubleResponse']
]
```

For every key assert `count>=500`, unique IDs, zero semantic duplicates, and choice correctness where applicable.

- [ ] **Step 2: Run RED**

Run: `node tests/sst_safety_500_quality.test.js`
Expected: FAIL; current banks are below 500 or duplicated and markers do not exist.

- [ ] **Step 3: Add category-balance assertions**

For `danger`, `sstQuiz`, skill modes, `feelingChoice`, `turnWaiting`, `troubleResponse`, aggregate these categories exactly:

```text
school, nijifla, home, park, transport, public, friends, group,
study, rules, emotion, help
```

Require every category to be present and no category to exceed 20% of the bank.

- [ ] **Step 4: Commit test gate**

```bash
git add tests/sst_safety_500_quality.test.js tools/extract_inline_bank.js
git commit -m "test: define SST and safety 500-question quality gate"
```

### Task 2: 危険予知を500問へ拡張する

**Files:**
- Modify: `danger_game.html:587-590`

**Interfaces:**
- Bank marker: `danger`
- Schema: `{id,difficulty,prompt,answer,choices,category,tags,explanation}`

- [ ] **Step 1: Preserve and normalize current valid questions**

Assign IDs `danger-e-001` onward without changing meaning. Classify into 12 categories; distribute new questions to reach easy 200, normal 200, challenge 100.

- [ ] **Step 2: Add 500 curated records**

Challenge questions must require two cues, e.g. weather + location, traffic signal + turning vehicle, peer pressure + public safety. Easy questions remain concrete one-step safety choices.

- [ ] **Step 3: Replace `shuffle(DATA).slice(0,10)` with bag draw**

Use:

```js
const ids=DATA.filter(q=>q.difficulty===difficulty).map(q=>q.id);
const bag=createQuestionBag({storage:localStorage,gameId:'danger',difficulty,bankVersion:NIJI_QUESTION_BANK_VERSION,ids,random:Math.random});
const byId=new Map(DATA.map(q=>[q.id,q]));
deck=bag.draw(10).map(id=>byId.get(id));
```

- [ ] **Step 4: Run target tests**

Run: `node tests/sst_safety_500_quality.test.js`
Expected: only `danger` moves to PASS; remaining unmigrated targets still report failures.

- [ ] **Step 5: Commit**

```bash
git add danger_game.html
git commit -m "feat: expand danger prediction to 500 questions"
```

### Task 3: 10分チェックを500問へ拡張する

**Files:**
- Modify: `cognitive_check_10min.html:614-898`

**Interfaces:**
- Bank marker: `cognitive`
- Preserve existing task types and timer/report behavior.

- [ ] **Step 1: Define 500 balanced items**

Use five task families with exactly 100 items each: visual matching, short-term memory, sequence prediction, inhibition/attention, simple reasoning. Within each family assign easy 40, normal 40, challenge 20 so global totals are 200/200/100.

- [ ] **Step 2: Give every record a stable ID `cog-<family>-NNN`**

- [ ] **Step 3: Draw 10 from the selected difficulty bag**

Do not change the existing per-question timer or A4 report fields.

- [ ] **Step 4: Add result metadata**

`NIJI_RESULT.extra` must include `questionIds`, `difficulty`, and `bankVersion`, without changing existing score/detail semantics.

- [ ] **Step 5: Run**

`node tests/sst_safety_500_quality.test.js` and existing 10-minute page syntax/local-ref tests.

- [ ] **Step 6: Commit**

```bash
git add cognitive_check_10min.html
git commit -m "feat: expand cognitive check bank to 500"
```

### Task 4: 問題形式SSTを500問へ拡張する

**Files:**
- Modify: `sst_quiz.html:587-700`

**Interfaces:** Bank marker `sstQuiz`; 200/200/100; 12 categories.

- [ ] **Step 1: Keep valid current questions and assign IDs**
- [ ] **Step 2: Curate to 500 with category/difficulty distribution**
- [ ] **Step 3: Ensure every objective item has exactly one correct answer and three distinct distractors**
- [ ] **Step 4: Replace random slice with persistent bag draw of the existing per-play length**
- [ ] **Step 5: Run quality and existing `sst_quiz` flow tests**
- [ ] **Step 6: Commit**

```bash
git add sst_quiz.html
git commit -m "feat: expand SST quiz to 500 scenarios"
```

### Task 5: SSTロールプレイを500場面へ拡張する

**Files:**
- Modify: `sst_roleplay.html:1-end`

**Interfaces:** Bank marker `sstRoleplay`; schema includes `{id,prompt,goal,model,category,tags}`; difficulty=`all`.

- [ ] **Step 1: Write 500 genuinely different role-play situations**

Allocate at least 35 situations to each of the 12 common scene categories; use the remaining 80 to cover transitions, losing/winning, asking to join, stopping unwanted contact, apology, asking for clarification, and leaving unsafe situations.

- [ ] **Step 2: Use bag draw for the existing 5-scene session**
- [ ] **Step 3: Preserve staff rating buttons and result storage**
- [ ] **Step 4: Run bank/flow tests**
- [ ] **Step 5: Commit**

```bash
git add sst_roleplay.html
git commit -m "feat: expand SST roleplay to 500 situations"
```

### Task 6: `sst_skills.html` 6モードを各500問へ拡張する

**Files:**
- Modify: `sst_skills.html:1-end`

**Interfaces:** Markers: `help`, `refuse`, `feel`, `listen`, `repair`, `perspective`; each bank independently `>=500`.

- [ ] **Step 1: Add six independent inline banks**

Each record uses `{id,difficulty,prompt,answer,choices,category,tags,explanation}`. IDs use prefixes `help-`, `refuse-`, `feel-`, `listen-`, `repair-`, `persp-`.

- [ ] **Step 2: Apply 200/200/100 per mode**
- [ ] **Step 3: Select bank from `mode` query parameter and key bag by the same mode**
- [ ] **Step 4: Verify switching modes does not share consumed history**
- [ ] **Step 5: Run `node tests/sst_safety_500_quality.test.js`**
- [ ] **Step 6: Commit**

```bash
git add sst_skills.html
git commit -m "feat: expand six SST skill banks to 500 each"
```

### Task 7: 気持ち選択・順番待ち・トラブル対応を各500へ拡張する

**Files:**
- Modify: `feeling_choice.html:DATA block and start()`
- Modify: `turn_waiting.html:492-494`
- Modify: `trouble_response.html:492-494`

**Interfaces:** Markers `feelingChoice`, `turnWaiting`, `troubleResponse`.

- [ ] **Step 1: Replace repeated filler records with 500 unique situations per game**

`turnWaiting` must cover lines, equipment, speaking turns, shared materials, transport, snack, games, transitions, adult attention, online/device turns, and public facilities. `troubleResponse` must cover conflict types rather than repeating one fight scene.

- [ ] **Step 2: Apply stable IDs and difficulty where appropriate**
- [ ] **Step 3: Replace random slice with bag draw**
- [ ] **Step 4: Verify current visual/report behavior remains unchanged**
- [ ] **Step 5: Run target tests**
- [ ] **Step 6: Commit**

```bash
git add feeling_choice.html turn_waiting.html trouble_response.html
git commit -m "feat: expand emotion waiting and trouble banks"
```

### Task 8: Phase 2 full gate

**Files:**
- Test only.

- [ ] **Step 1: Run quality gate**

Run: `node tests/sst_safety_500_quality.test.js`
Expected: Task 1で列挙した13ゲーム/モードがすべてPASS。`sst_skills.html`の6モードはそれぞれ独立ゲームとして6件カウントする。

- [ ] **Step 2: Run local refs + JS syntax**

```bash
node tests/local_refs.test.js
find . -type f -name '*.js' -not -path './tests/*' -print0 | xargs -0 -n1 node --check
```

- [ ] **Step 3: Commit phase**

```bash
git add .
git commit -m "chore: verify SST safety 500-question phase"
```
