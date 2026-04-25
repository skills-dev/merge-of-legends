# Merge of Legends custom instructions

You are working on the Merge of Legends GitHub game. Preserve the quest engine and workflow contract first; update story content second.

## Core game model

- The game maintains exactly one active quest issue at a time.
- A player starts from the main quest issue, chooses one path, completes that path, and the game resets by creating or reusing the next open quest issue.
- Finishing a quest must follow this sequence:
  1. success condition is met
  2. finish/tip comments are posted
  3. the current issue is closed
  4. `0-0-start.yml` is called with the closed issue number
  5. a comment is added to the closed issue linking to the next open quest issue

## Stable workflow contract

Do not break these workflow interfaces unless explicitly asked:

### `0-0-start.yml`

- Creates or reuses the main quest issue
- Accepts reusable-workflow input:
  - `closed-issue-number`
- Outputs:
  - `issue-url`
- When invoked after quest completion, it must comment on the closed issue with the link to the next open issue

### `0-1-pick.yml`

- Reads the checked option from the main quest issue
- Dispatches exactly one of the three start workflows:
  - Mona
  - Copilot
  - Ducky

### Start workflows

- `1-1-mona-start.yml`
- `2-1-copilot-start.yml`
- `3-1-ducky-start.yml`

All start workflows:

- accept input:
  - `issue-number`
- post challenge/setup comments to the selected issue
- enable the corresponding check workflow

### Check workflows

- `1-2-mona-check.yml`
- `2-2-copilot-check.yml`
- `3-2-ducky-check.yml`

All check workflows:

- validate player progress
- post feedback
- on success:
  - post finish content
  - close the issue
  - hand off to `0-0-start.yml` with `closed-issue-number`

## Path-specific behavior

### Mona

- Path type: ordering / history repair
- Start workflow posts intro + instructions + graph context
- Check workflow validates ordered content and reports remaining problems through `not_asc_count`
- Success means the ordering check passes completely

### Copilot

- Path type: multi-step quiz / checkbox correctness
- Start workflow posts intro, instructions, and quiz comments
- Check workflow validates checkbox answers and updates feedback comments
- Success means all required answers are correct

### Ducky

- Path type: image/tag formatting challenge
- Start workflow posts intro and challenge instructions
- Check workflow validates exactly three character image tags with required width/alt/src rules
- Preserve support for repository image URL validation and accepted raw/blob URL variants

## Image handling rules

- `README.md` may use repo-root paths like `.github/images/...`
- Files in `.github/steps/` should use step-relative paths like `../images/...`
- Workflow-published content must be rendered to absolute image URLs before being posted to issues/comments
- Do not hardcode repository-specific absolute URLs directly in source markdown unless explicitly required
- Preserve the shared render-and-normalize flow used by workflow comments and issue creation

## Editing guidance

- Favor shared helpers over duplicating workflow logic
- Keep workflow inputs, outputs, and handoff names stable
- If changing quest content, preserve the same start/check/finish structure
- If changing validation logic, update the matching tests and harness
- If changing comments/templates, ensure repo rendering and workflow rendering both still work

## Required validation mindset

Before considering a change complete, verify:

- the selected path still starts correctly from `0-1-pick.yml`
- the check workflow still detects success correctly
- quest completion still closes the issue
- `0-0-start.yml` still comments on the closed issue with the next issue link
- the workflow harness and related JS tests still pass
