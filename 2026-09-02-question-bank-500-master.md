# 84ゲーム 問題バンク500問化 Master Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** にじフラ チャレンジの問題型31ゲームを実質500問以上、自動生成型13ゲームを500通り以上へ拡張し、複数プレイをまたぐ重複防止と既存84ゲームの回帰安全性を確保する。

**Architecture:** 実装を6フェーズへ分割する。Phase 1で共通検証・シャッフルバッグ・数字ハイアンドローを先に固定し、Phase 2〜5でゲーム群ごとに問題バンクまたは生成器を拡張する。最終Phase 6でTOP 84カード、キャッシュ番号、全リンク、JS構文、ZIP再展開まで統合検証する。固定問題データとその出題ロジックは最終配布HTMLへインライン化し、GitHub Pagesやfile://起動時に外部問題JSONへ依存しない。

**Tech Stack:** HTML5, vanilla JavaScript, CSS, Node.js test scripts, localStorage, ZIP/GitHub Pages static hosting

**Spec:** `docs/superpowers/specs/2026-09-02-question-bank-500-design.md`

## Global Constraints

- TOPのゲームカード数は84件を維持する。
- 固定問題型31ゲームは原則500問以上。
- 難易度が成立する固定問題型は easy=200 / normal=200 / challenge=100 を基本配分とする。
- 自動生成型13ゲームは500以上の一意問題キーを生成可能にする。
- 既存問題は品質基準を満たすものを残し、不足分だけ追加する。
- 語尾・固有名詞・数字だけを変える水増しは禁止。
- 問題IDは永続的に一意で、完全な別問題へ差し替える場合のみ新IDにする。
- 同一プレイ内で同じ問題IDを再出題しない。
- 複数プレイ間は難易度別シャッフルバッグで、一巡前の再出題を原則禁止する。
- 固定問題データと出題ロジックは最終配布HTMLへ直接内包する。
- 1プレイの問題数は既存ゲームの5問・10問・15問等を原則維持する。
- 国旗ゲームは201国・地域のまま維持し、問題数目的の水増しをしない。
- 数字ハイアンドローは easy=1〜10 / normal=1〜50 / challenge=1〜100、1プレイ10問、同値なしへ戻す。
- 非問題型36ゲームは500問化しない。
- 最終ZIPは再展開後も全自動検証がPASSすること。

---

## Plan Set

- [ ] **Phase 1 — 共通基盤・シャッフルバッグ・数字ハイアンドロー**
  - Plan: `docs/superpowers/plans/2026-09-02-question-bank-500-phase1-foundation.md`
  - Deliverable: 共通検証API、永続シャッフルバッグ、自己完結ビルド方式、数字ハイアンドロー3難易度が動作し、既存84カードを壊さない。

- [ ] **Phase 2 — SST・危険予知・10分チェック固定問題**
  - Plan: `docs/superpowers/plans/2026-09-02-question-bank-500-phase2-sst-safety.md`
  - Deliverable: 13対象ゲーム/モードが500問以上、実質重複なし、場面カテゴリ分散、シャッフルバッグ対応。

- [ ] **Phase 3 — 国語・社会・認知固定問題**
  - Plan: `docs/superpowers/plans/2026-09-02-question-bank-500-phase3-language-social.md`
  - Deliverable: legacy TKK host内の17固定問題ゲームが各500問以上で、最終` tkk_games.html`に問題データと出題ロジックを内包。

- [ ] **Phase 4 — 算数・生活13自動生成ゲーム**
  - Plan: `docs/superpowers/plans/2026-09-02-question-bank-500-phase4-generators.md`
  - Deliverable: 13ゲームが500以上の一意問題キーを生成可能で、正答検算・範囲・選択肢整合性テストを通過。

- [ ] **Phase 5 — かたちパズル500問化**
  - Plan: `docs/superpowers/plans/2026-09-02-question-bank-500-phase5-shape-puzzle.md`
  - Deliverable: 500問以上、解成立、実質重複なし、既存タッチ操作改善を維持。

- [ ] **Phase 6 — 全体統合・回帰・ZIP**
  - Plan: `docs/superpowers/plans/2026-09-02-question-bank-500-phase6-integration.md`
  - Deliverable: TOP 84、対象問題数、生成空間、リンク、JS構文、国旗、記録、ZIP再展開まで全PASSした配布ZIP。

## Dependency Order

1. Phase 1は全後続フェーズの前提。
2. Phase 2とPhase 3はPhase 1完了後なら独立して進められる。
3. Phase 4はPhase 1の検証APIとシャッフルバッグAPIへ依存する。
4. Phase 5はPhase 1の品質検証APIを利用する。
5. Phase 6はPhase 1〜5の全成果物へ依存する。

## Master Acceptance Gate

次のコマンド群がすべてexit 0のときだけ配布版を完成扱いにする。

```bash
cd /mnt/data/question-bank-500-work
for f in tests/*.test.js; do node "$f"; done
node tools/audit_question_banks.js
node tools/audit_generator_spaces.js
node tests/local_refs.test.js
find . -type f -name '*.js' -not -path './tests/*' -print0 | xargs -0 -n1 node --check
zip -T /mnt/data/nijifla_Ver2.5_84games_QUESTION_BANK_500_FINAL_2026-09-02.zip
```

Expected final audit summary:

```text
TOP cards: 84
Fixed-bank games: 31/31 >= 500
Generator games: 13/13 >= 500 unique keys
Existing-rich games: 4/4 preserved
Non-question games: 36/36 unchanged in purpose
Duplicate IDs: 0
Broken local refs: 0
JS syntax failures: 0
ZIP test: OK
```
