# 問題バンク500問化 Phase 4 算数・生活 Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 算数・生活の13ゲームについて、固定500問ではなく、正解が保証された500通り以上の一意問題空間を実装する。

**Architecture:** 純粋関数の生成器を`tools/tkk_generator_core.js`へ置き、Nodeテストで全生成空間または決定的サンプル空間を列挙検証する。配布時はbuilderが同じ生成器ソースを` tkk_games.html`へインラインするため、runtimeは外部問題ファイルに依存しない。

**Tech Stack:** vanilla JavaScript, Node.js `assert`, deterministic seeded generation for tests

**Spec:** `docs/superpowers/specs/2026-09-02-question-bank-500-design.md`

## Global Constraints

対象13: `make10`, `make10drop`, `multblock`, `primeblock`, `divisor`, `commondiv`, `commonmult`, `calcmaze`, `dayword`, `shopping`, `dagashi`, `moneycount`, `exchange`。

---

### Task 1: 13生成器の共通インターフェースをTDDで定義する

**Files:**
- Create: `tools/tkk_generator_core.js`
- Create: `tests/tkk_generators_500.test.js`

**Interfaces:**

```js
listProblemKeys(gameId) -> string[]
makeProblem(gameId, key) -> {key,prompt,answer,choices?,payload}
validateProblem(gameId, problem) -> string[]
```

- [ ] **Step 1: Write failing test**

For every target ID:

```js
const keys=listProblemKeys(id);
assert.ok(new Set(keys).size>=500,`${id}: <500 unique keys`);
for(const key of keys.slice(0,500)) assert.deepStrictEqual(validateProblem(id,makeProblem(id,key)),[]);
```

- [ ] **Step 2: Run RED**

Run: `node tests/tkk_generators_500.test.js`
Expected: FAIL because module does not exist.

- [ ] **Step 3: Implement dispatch shell with no game claiming PASS until its key space is defined**
- [ ] **Step 4: Commit**

```bash
git add tools/tkk_generator_core.js tests/tkk_generators_500.test.js
git commit -m "test: define 500-space generator contract"
```

### Task 2: 基礎計算4ゲーム

**Files:**
- Modify: `tools/tkk_generator_core.js`
- Modify: `assets/tkk_games.js:99-120`

**Games:** `make10`, `make10drop`, `multblock`, `primeblock`

- [ ] `make10`: keys encode board composition and target pair placement; enumerate >=500 solvable boards with at least one pair summing to 10.
- [ ] `make10drop`: enumerate >=500 solvable adjacent-board states and verify at least one legal 10-pair exists.
- [ ] `multblock`: keys cover multiplication facts plus board/distractor arrangements; verify displayed answer equals product.
- [ ] `primeblock`: keys cover number sets with verified primality; implement deterministic `isPrime(n)` and reject 0,1 as prime.
- [ ] Run `node tests/tkk_generators_500.test.js` and commit.

### Task 3: 約数・公約数・公倍数3ゲーム

**Files:**
- Modify: `tools/tkk_generator_core.js`
- Modify: `assets/tkk_games.js:121-135`

- [ ] `divisor`: enumerate integers 2〜300 with option-set variants; answer set must equal exact divisors within offered range.
- [ ] `commondiv`: enumerate ordered number pairs with at least two common divisors; validator recomputes GCD/divisor intersection.
- [ ] `commonmult`: enumerate pairs and bounded multiples; validator recomputes LCM and all offered answers.
- [ ] Ensure >=500 unique keys each and no duplicated choice values.
- [ ] Test and commit.

### Task 4: 計算迷路・日付3ゲーム

**Files:**
- Modify: `tools/tkk_generator_core.js`
- Modify: `assets/tkk_games.js:129-185`

- [ ] `calcmaze`: generate grid paths where exactly one route satisfies the intended arithmetic rule; solver in test must independently confirm reachability.
- [ ] `dayword`: enumerate actual calendar dates over a fixed leap-safe span 2024-01-01 through 2030-12-31; prompt asks yesterday/today/tomorrow relationship and answer is recomputed with UTC date arithmetic.
- [ ] `shopping`: generate item totals/payment choices under the existing child-appropriate money range; exact payable amount is recomputed from payload.
- [ ] Test and commit.

### Task 5: 買い物・硬貨3ゲーム

**Files:**
- Modify: `tools/tkk_generator_core.js`
- Modify: `assets/tkk_games.js:221-235`

- [ ] `dagashi`: enumerate budgets 100〜500 and item-cart combinations with total <= budget; answer/change is exact.
- [ ] `moneycount`: enumerate canonical coin multisets using Japanese denominations `[1,5,10,50,100,500]`; choices must be unique and one equals sum.
- [ ] `exchange`: enumerate target amounts and at least three coin combinations; exactly one choice must equal target unless prompt explicitly allows multiple selection, which current UI does not.
- [ ] Test and commit.

### Task 6: runtimeへ統合しシャッフルバッグ相当を適用する

**Files:**
- Modify: `assets/tkk_games.js`
- Modify: `tools/build_tkk_selfcontained.js`

- [ ] Inline generator core before game engine in generated `tkk_games.html`.
- [ ] For each game, create an ID bag from `listProblemKeys(gameId)` and draw the existing per-play length without replacement.
- [ ] Preserve current UI, scores and result storage.
- [ ] Rebuild `tkk_games.html` and run `tests/tkk_selfcontained_build.test.js`.
- [ ] Commit.

### Task 7: Phase 4 full verification

Run:

```bash
node tests/tkk_generators_500.test.js
node tests/tkk_selfcontained_build.test.js
node tests/local_refs.test.js
```

Expected: 13/13 generators >=500 unique validated keys.
