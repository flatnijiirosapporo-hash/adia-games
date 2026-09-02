# 問題バンク500問化 Phase 5 かたちパズル Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** かたちパズルを約300問から、解が存在する実質重複なし500問以上へ拡張し、既存のタッチ操作改善を維持する。

**Architecture:** 既存`tools/generate_shape_puzzles.js`を決定的seed対応へ拡張し、canonical shape keyで完成形・ピース構成の重複を排除する。validatorは各ピース配置を再構成して盤面充填を確認する。生成後、データを`shape_puzzle.html`へインラインする既存自己完結方式を維持する。

**Tech Stack:** Node.js generator/validator, vanilla JS/HTML

**Spec:** `docs/superpowers/specs/2026-09-02-question-bank-500-design.md`

---

### Task 1: 500問品質ゲートを先に作る

**Files:**
- Create: `tests/shape_puzzle_500.test.js`
- Modify: `tools/validate_shape_puzzles.js`

- [ ] Write test requiring `count>=500`, unique IDs, unique canonical puzzle keys, valid piece cells, no overlap, board coverage equality.
- [ ] Run RED against current ~300 bank.
- [ ] Commit test gate.

### Task 2: generatorを決定的・重複排除型へ拡張する

**Files:**
- Modify: `tools/generate_shape_puzzles.js`

**Interfaces:**

```js
generatePuzzles({count:500,seed:'nijifla-q500-v1'}) -> Puzzle[]
canonicalPuzzleKey(puzzle) -> string
```

- [ ] Add seeded PRNG so the same seed produces byte-stable data.
- [ ] Canonicalize board under translation and allowed rotations/reflections only if the current game considers those equivalent; include piece multiset in the key.
- [ ] Generate until 500 unique valid puzzles are accepted, with a hard deterministic candidate cap that throws if 500 cannot be reached.
- [ ] Run validator and test.

### Task 3: 500問データを`shape_puzzle.html`へ再埋め込みする

**Files:**
- Modify: `shape_puzzle.html`
- Modify if needed: `assets/shape_puzzle_core.js`, `assets/shape_puzzle_app.js`

- [ ] Keep the existing 46px piece size, enlarged touch area, grab offset, 1.25-cell snap, edge slack, tap-select/second-tap rotate, rotate button, invalid shake behavior.
- [ ] Change only bank size/data selection and persistent bag selection.
- [ ] Preserve 1-play length and report flow.
- [ ] Run existing touch-fix tests plus new 500 test.

### Task 4: Phase 5 verification

```bash
node tests/shape_puzzle_500.test.js
node tools/validate_shape_puzzles.js
node tests/local_refs.test.js
```

Expected: >=500 valid unique puzzles; touch behavior regression PASS.
