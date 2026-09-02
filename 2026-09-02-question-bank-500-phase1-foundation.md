# 問題バンク500問化 Phase 1 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 全問題型ゲームで再利用できる品質検証・シャッフルバッグ・自己完結ビルド基盤を作り、数字ハイアンドローを承認済み3難易度へ戻す。

**Architecture:** Node側に純粋関数の検証/シャッフルバッグコアを置き、同じソースを最終HTMLへインライン注入できる形にする。ゲーム固有データは外部JSONにしない。localStorageキーはゲームID・難易度・問題バンクバージョンを含め、データ更新時に新規IDを未出題として取り込めるようにする。

**Tech Stack:** vanilla JavaScript, Node.js `assert`, localStorage, HTML

**Spec:** `docs/superpowers/specs/2026-09-02-question-bank-500-design.md`

## Global Constraints

- シャッフルバッグは難易度別に独立する。
- 同一プレイ内重複0、一巡前の複数プレイ再出題0。
- 固定問題のID、空欄、選択肢、正答一意性、実質重複を検査できる。
- 最終配布HTMLは問題データと出題ロジックを外部JSONへ依存しない。
- 数字ハイアンドローは easy 1〜10 / normal 1〜50 / challenge 1〜100、10問、同値なし。

---

### Task 1: テスト可能な問題バンク検証コアを作る

**Files:**
- Create: `tools/question_bank_core.js`
- Create: `tests/question_bank_core.test.js`

**Interfaces:**
- Produces: `normalizeQuestion(q)`, `semanticKey(q)`, `validateFixedBank(bank, options)`
- `validateFixedBank` returns `{count, ids, difficultyCounts, duplicateIds, semanticDuplicates, errors, categoryCounts}`

- [ ] **Step 1: Write the failing test**

```js
const assert=require('assert');
const {validateFixedBank}=require('../tools/question_bank_core');
const bank=[
  {id:'g-e-001',difficulty:'easy',prompt:'3より大きい数は？',answer:'4',choices:['2','3','4'],category:'数'},
  {id:'g-e-001',difficulty:'easy',prompt:'3 より 大きい 数は？',answer:'4',choices:['2','3','4'],category:'数'}
];
const r=validateFixedBank(bank,{minCount:2,requireChoices:true});
assert.deepStrictEqual(r.duplicateIds,['g-e-001']);
assert.strictEqual(r.semanticDuplicates.length,1);
assert.ok(r.errors.length>=2);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node tests/question_bank_core.test.js`
Expected: FAIL because `../tools/question_bank_core` does not exist.

- [ ] **Step 3: Implement the validation core**

`semanticKey(q)` must normalize Unicode NFKC, whitespace, Japanese punctuation, choice order, and lowercase Latin text. `validateFixedBank` must count `easy/normal/challenge/all`, reject duplicate IDs, empty prompt/answer, duplicate choices, answers absent from choices, and normalized duplicate prompt+answer+choices.

- [ ] **Step 4: Run test to verify it passes**

Run: `node tests/question_bank_core.test.js`
Expected: PASS.

- [ ] **Step 5: Commit checkpoint**

```bash
git add tools/question_bank_core.js tests/question_bank_core.test.js
git commit -m "test: add question bank quality validator"
```

### Task 2: 永続シャッフルバッグを実装する

**Files:**
- Create: `tools/question_bag_runtime.js`
- Create: `tests/question_bag_runtime.test.js`

**Interfaces:**
- Produces: `createQuestionBag({storage, gameId, difficulty, bankVersion, ids, random})`
- Returned object: `{draw(count), remaining(), reset()}`

- [ ] **Step 1: Write failing tests for no-repeat and persistence**

```js
const assert=require('assert');
const {createQuestionBag}=require('../tools/question_bag_runtime');
const mem=new Map();
const storage={getItem:k=>mem.has(k)?mem.get(k):null,setItem:(k,v)=>mem.set(k,String(v)),removeItem:k=>mem.delete(k)};
const random=()=>0.42;
const ids=Array.from({length:20},(_,i)=>`q${i+1}`);
const a=createQuestionBag({storage,gameId:'demo',difficulty:'easy',bankVersion:'v1',ids,random});
const first=a.draw(10);
const b=createQuestionBag({storage,gameId:'demo',difficulty:'easy',bankVersion:'v1',ids,random});
const second=b.draw(10);
assert.strictEqual(new Set([...first,...second]).size,20);
assert.strictEqual(a.remaining()>=0,true);
```

- [ ] **Step 2: Run to verify RED**

Run: `node tests/question_bag_runtime.test.js`
Expected: FAIL because runtime module does not exist.

- [ ] **Step 3: Implement bag state**

Persist under `nijifla_qbag_v1:<gameId>:<difficulty>`. Stored JSON must be:

```js
{bankVersion:'v1', order:['q3','q8'], cursor:0, knownIds:['q1','q2']}
```

On bank version/ID changes: remove deleted IDs from `order`, append all new IDs, shuffle only the unconsumed/new tail, and keep already-consumed IDs consumed until the current cycle ends.

- [ ] **Step 4: Add version-update test**

```js
const c=createQuestionBag({storage,gameId:'demo',difficulty:'easy',bankVersion:'v2',ids:[...ids,'q21'],random});
const drawn=c.draw(1);
assert.strictEqual(drawn.length,1);
assert.ok([...ids,'q21'].includes(drawn[0]));
```

- [ ] **Step 5: Run GREEN**

Run: `node tests/question_bag_runtime.test.js`
Expected: PASS.

- [ ] **Step 6: Commit checkpoint**

```bash
git add tools/question_bag_runtime.js tests/question_bag_runtime.test.js
git commit -m "feat: add persistent question shuffle bag"
```

### Task 3: HTML内包ビルド検査を作る

**Files:**
- Create: `tools/assert_selfcontained_bank.js`
- Create: `tests/selfcontained_question_hosts.test.js`

**Interfaces:**
- Consumes: target HTML paths and required bank/runtime marker names.
- Produces: exit code 0 only when each selected HTML contains both `NIJI_QUESTION_BANK_VERSION` and `createQuestionBag` source and contains no external question JSON dependency.

- [ ] **Step 1: Write failing test against the Phase 1 target**

The initial target is only `number_highlow.html`. Later phases append their migrated hosts to the target matrix.

- [ ] **Step 2: Run RED**

Run: `PHASE_TARGETS=number_highlow.html node tests/selfcontained_question_hosts.test.js`
Expected: FAIL because the common markers/runtime do not yet exist in `number_highlow.html`.

- [ ] **Step 3: Implement the assertion tool**

The tool must strip comments before dependency checks, inspect only the comma-separated `PHASE_TARGETS` list when supplied, and report exact missing markers per file.

- [ ] **Step 4: Inline Phase 1 runtime markers into `number_highlow.html`**

Insert `const NIJI_QUESTION_BANK_VERSION='2026-09-02-q500-v1';` and the exact browser-safe `createQuestionBag` implementation from `tools/question_bag_runtime.js` into the page script.

- [ ] **Step 5: Run GREEN**

Run: `PHASE_TARGETS=number_highlow.html node tests/selfcontained_question_hosts.test.js`
Expected: PASS.

- [ ] **Step 6: Commit checkpoint**

```bash
git add number_highlow.html tools/assert_selfcontained_bank.js tests/selfcontained_question_hosts.test.js
git commit -m "test: enforce self-contained question hosts"
```

### Task 4: 数字ハイアンドロー3難易度をTDDで復元する

**Files:**
- Modify: `number_highlow.html:170-410`
- Create: `tests/number_highlow_difficulty.test.js`

**Interfaces:**
- Produces in page script: `RANGES={easy:[1,10],normal:[1,50],challenge:[1,100]}` and `buildSequence(difficulty)`
- `buildSequence` returns 11 values for a 10-question run; adjacent values must differ; values are within selected range.

- [ ] **Step 1: Write failing structural/behavior test**

Extract the page script in a VM with DOM stubs and assert the three ranges. Generate 2,000 sequences per difficulty and verify min/max and adjacent inequality.

- [ ] **Step 2: Run RED**

Run: `node tests/number_highlow_difficulty.test.js`
Expected: FAIL because current page uses a fixed `NUMBER_POOL` of 1〜20.

- [ ] **Step 3: Add difficulty chooser and range-aware sequence generation**

The start screen must show three large buttons:

```text
かんたん 1〜10
ふつう 1〜50
チャレンジ 1〜100
```

`buildSequence` must choose each next value uniformly from the selected range excluding the current value. If a generated result is range minimum or maximum and would become the next question's base, replace that base before the next question with a non-edge random base from `[min+1,max-1]` as approved.

- [ ] **Step 4: Preserve 10-question, hint, sound, result, A4 flows**

Run: `node tests/number_highlow_ui_unify.test.js && node tests/number_highlow_cache_and_message.test.js && node tests/number_highlow_difficulty.test.js`
Expected: all PASS.

- [ ] **Step 5: Commit checkpoint**

```bash
git add number_highlow.html tests/number_highlow_difficulty.test.js
git commit -m "fix: restore high low difficulty ranges"
```

### Task 5: Phase 1 verification

**Files:**
- Modify only if test expectations require version-aware markers: `tests/top_embedded_core_scripts.test.js`

- [ ] **Step 1: Run all pre-existing tests**

```bash
for f in tests/*.test.js; do node "$f" || exit 1; done
```

Expected: all tests pass except the intentionally phase-gated self-contained host test for files not yet migrated. That test must support `PHASE1_TARGETS=number_highlow.html` so Phase 1 can assert the migrated target independently.

- [ ] **Step 2: Run Phase 1 target check**

Run: `PHASE_TARGETS=number_highlow.html node tests/selfcontained_question_hosts.test.js`
Expected: PASS.

- [ ] **Step 3: Commit checkpoint**

```bash
git add number_highlow.html tests tools
git commit -m "chore: verify question bank foundation"
```
