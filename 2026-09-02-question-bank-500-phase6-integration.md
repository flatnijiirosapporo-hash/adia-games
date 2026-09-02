# 問題バンク500問化 Phase 6 Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Phase 1〜5を84ゲーム版へ統合し、全問題数・ランダム重複防止・TOP・リンク・国旗・記録・ZIPまで配布品質で検証する。

**Architecture:** 最終監査ツールがHTML内バンク、生成器、TOPカタログを横断集計する。GitHub Pagesの旧キャッシュを避けるため変更対象hrefへ新しいversion queryを付与する。ZIP作成後は別ディレクトリへ再展開し、展開物に対して同じテストを再実行する。

**Tech Stack:** Node.js, shell, ZIP, static HTML/JS

**Spec:** `docs/superpowers/specs/2026-09-02-question-bank-500-design.md`

---

### Task 1: 全84分類監査ツールを作る

**Files:**
- Create: `tools/question_game_manifest.js`
- Create: `tools/audit_question_banks.js`
- Create: `tools/audit_generator_spaces.js`
- Create: `tests/question_game_manifest.test.js`

**Interfaces:** manifest has exactly 84 entries with `mode` one of `fixed500`, `generated500`, `existingRich`, `nonQuestion`.

- [ ] Write failing test requiring counts exactly 31/13/4/36 and IDs matching TOP catalog IDs/logical SST mode mapping.
- [ ] Implement manifest and audit output.
- [ ] Audit fixed banks using `validateFixedBank` and generator games using `listProblemKeys`/`validateProblem`.
- [ ] Commit.

### Task 2: TOPとキャッシュ番号を更新する

**Files:**
- Modify: `index.html`
- Modify: `assets/game_catalog.js`

- [ ] Keep exactly 84 cards and no duplicate IDs.
- [ ] Update modified page query versions to `v=20260902-q500-1`.
- [ ] Keep flag game route on a fresh version while preserving 201-country content.
- [ ] Update `tkk_games.html?game=<id>` cards to append `&v=20260902-q500-1` without changing game IDs.
- [ ] Run TOP static fallback, all-games catalog and local ref tests.

### Task 3: Existing-rich4と非問題36の回帰確認

**Files:**
- Create: `tests/non_target_behavior_guard.test.js`

- [ ] Guard `story`, `hiramemory`, `flag_game.html` data cardinality/modes, and all 36 non-question card routes.
- [ ] Verify no question-bank migration accidentally changes the purpose or removes controls of non-question pages.
- [ ] For flag game run all existing `flag_game_*.test.js` suites.
- [ ] Commit.

### Task 4: シャッフルバッグ統合試験

**Files:**
- Create: `tests/question_bag_integration.test.js`

- [ ] For one 500-bank fixed game per architecture (`danger`, `sstQuiz`, `tkk colorquiz`, `shapePuzzle`) simulate 50 plays x 10 questions in memory storage and assert first 500 draws have no repeated IDs.
- [ ] Switch difficulty and assert histories are independent.
- [ ] Add a new question ID with a new bank version and assert it is eligible without resurrecting deleted IDs.
- [ ] Commit.

### Task 5: 全体フルテスト

Run exactly:

```bash
for f in tests/*.test.js; do
  echo "=== $f ==="
  node "$f" || exit 1
done
node tools/audit_question_banks.js
node tools/audit_generator_spaces.js
node tests/local_refs.test.js
find . -type f -name '*.js' -not -path './tests/*' -print0 | xargs -0 -n1 node --check
```

Expected audit lines:

```text
TOP cards: 84
fixed500: 31 PASS
generated500: 13 PASS
existingRich: 4 PASS
nonQuestion: 36 PASS
```

### Task 6: READMEとQAレポートを更新する

**Files:**
- Modify: `README.md`
- Create: `QUESTION_BANK_500_QA_REPORT.txt`

Report must include per fixed game: count, difficulty counts, semantic duplicate count. Per generator: unique key count and validation error count. Include flag data count=201 and TOP count=84.

### Task 7: ZIP作成と再展開検証

- [ ] Create ZIP from workspace root preserving `.nojekyll`.

```bash
zip -qr /mnt/data/nijifla_Ver2.5_84games_QUESTION_BANK_500_FINAL_2026-09-02.zip .
zip -T /mnt/data/nijifla_Ver2.5_84games_QUESTION_BANK_500_FINAL_2026-09-02.zip
```

- [ ] Re-extract to a clean directory.

```bash
rm -rf /mnt/data/question_bank_500_final_verify
mkdir -p /mnt/data/question_bank_500_final_verify
unzip -q /mnt/data/nijifla_Ver2.5_84games_QUESTION_BANK_500_FINAL_2026-09-02.zip -d /mnt/data/question_bank_500_final_verify
```

- [ ] Re-run the full Task 5 suite from the extracted directory.
- [ ] Only after all commands exit 0, mark the ZIP deliverable complete.

### Task 8: Final commit/checkpoint

```bash
git add .
git commit -m "feat: complete 500-question bank expansion"
```
