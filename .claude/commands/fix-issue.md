---
description: End-to-end workflow for implementing a JIRA issue in the SPA SDK project — from ticket analysis to committed MR, JIRA update, and Slack notification
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, mcp__atlassian__atlassianUserInfo, mcp__atlassian__getJiraIssue, mcp__atlassian__getJiraIssueRemoteIssueLinks, mcp__atlassian__getConfluencePage, mcp__atlassian__searchConfluenceUsingCql, mcp__atlassian__getConfluencePageFooterComments, mcp__atlassian__search, mcp__atlassian__transitionJiraIssue, mcp__atlassian__editJiraIssue, mcp__atlassian__getTransitionsForJiraIssue, mcp__atlassian__lookupJiraAccountId, mcp__plugin_bloomreach-essentials_atlassian__atlassianUserInfo, mcp__plugin_bloomreach-essentials_atlassian__getAccessibleAtlassianResources, mcp__plugin_bloomreach-essentials_atlassian__getJiraIssue, mcp__plugin_bloomreach-essentials_atlassian__getJiraIssueRemoteIssueLinks, mcp__plugin_bloomreach-essentials_atlassian__getConfluencePage, mcp__plugin_bloomreach-essentials_atlassian__transitionJiraIssue, mcp__plugin_bloomreach-essentials_atlassian__editJiraIssue, mcp__plugin_bloomreach-essentials_atlassian__getTransitionsForJiraIssue, mcp__plugin_bloomreach-essentials_atlassian__lookupJiraAccountId, mcp__jenkins__getBuild, mcp__jenkins__getBuildLog, mcp__jenkins__searchBuildLog, mcp__slack__slack_search_users, mcp__slack__slack_send_message_draft, mcp__slack__slack_send_message, Agent
---

# Fix Issue

End-to-end workflow: preflight environment & tooling → read a JIRA ticket → plan → branch → implement → build → commit → MR → CI gate → notify reviewer.

## Arguments

One optional argument may be provided: `$ISSUE_KEY`

**JIRA issue key** (`$ISSUE_KEY`):
- If omitted, try to extract a key from the current branch name (pattern `[A-Z]+-\d+`).
- If none found, ask the user before proceeding.
- Must be resolved before Step 1 begins.

The base branch is always `development`. All MRs target `development`.

---

## ABSOLUTE RULE — Never commit or push to `development` or `main`

> **Under no circumstances will this skill ever commit, push, rebase onto, or otherwise write to the `development` or `main` branch.**
>
> `development` (integration) and `main` (released code only) are protected. All work happens on a `feature/` branch. The only interaction with `development` is reading from it (checkout to branch off, fetch for rebase base, diff base for affected packages).
>
> If at any point the current branch is detected to be `development` or `main`, **stop immediately** and tell the user:
> *"The current branch is `<branch>` — I will not commit or push to a protected branch. Please check out a feature branch and re-run `/fix-issue`."*
>
> This check must be applied:
> - At the start of Step 3.1 (after `git checkout -b`, verify the new branch is active)
> - At the start of Step 6 (before committing)
> - At the start of Step 7.2 (before `git push`)
> - At the start of Step 10.5 (before pushing review fixes)

---

## Step 0 — Environment & Tooling Preflight

Not all tools are equally required. Checks are grouped into three tiers:

| Tier | Behaviour if missing |
|------|---------------------|
| **1 — Hard block** | Stop immediately. Cannot proceed without these. |
| **2 — Deferred** | Warn now. Only becomes a hard block in Step 5, where builds and tests run. |
| **3 — Soft warn** | Note the limitation. The dependent step is skipped gracefully; everything else continues. |

Run all checks now. Hard blocks abort immediately. For deferred and soft-warn results, **remember what was missing** — later steps will ask you to recall this before running checks that require those tools.

> **MCP tool names.** This skill refers to MCP tools by their plain server names (`mcp__atlassian__*`, `mcp__slack__*`, `mcp__jenkins__*`). When a server is provided by a Claude Code plugin, the same tools carry a plugin prefix instead — e.g. the Bloomreach essentials plugin exposes Atlassian as `mcp__plugin_bloomreach-essentials_atlassian__*`. Wherever this skill names an MCP tool, use whichever variant is available in the session (load deferred tools via ToolSearch first). A server only counts as missing if **no** variant is available.

---

### 0.1 Tier 1 — Hard blocks (git + repo)

Run in order. **Abort on first failure** with a clear, actionable message.

```bash
command -v git                        # git must be on PATH
git rev-parse --is-inside-work-tree   # must be inside a git repo
git remote get-url origin             # origin remote must exist
git ls-remote --exit-code origin HEAD # origin must be reachable
```

Failure messages:
- No `git` → *"`git` is not on your PATH. Install it (e.g. `brew install git`) and re-run."*
- Not a git repo → *"Run this from inside the spa-sdk checkout."*
- No `origin` → *"No `origin` remote configured. Add one with `git remote add origin <url>` and re-run."*
- Origin unreachable → *"Cannot reach `origin`. Check your network/VPN and your GitLab credentials (an expired token embedded in the remote URL is a common cause — `git remote get-url origin`) and re-run."*

### 0.2 Tier 1 — Hard block (Atlassian MCP)

The skill cannot read JIRA tickets without this. **Hard block if missing or unreachable.**

First, try to verify the MCP is actually reachable by calling a lightweight Atlassian API:

```
mcp__atlassian__atlassianUserInfo()
# or the plugin-prefixed variant, e.g. mcp__plugin_bloomreach-essentials_atlassian__atlassianUserInfo()
```

The Atlassian `cloudId` used by later calls is `bloomreach.atlassian.net` (resolve the UUID with `getAccessibleAtlassianResources` if the hostname is rejected).

- **If the call succeeds**: the MCP is active and authenticated. Confirm *"Atlassian MCP reachable — proceeding."* and continue. Do not require `.mcp.json` to exist.
- **If the call fails or the tool is unavailable**: fall back to checking `.mcp.json`:

  ```bash
  test -f .mcp.json && cat .mcp.json
  ```

  - **`.mcp.json` exists with an `atlassian` entry**: the MCP is configured but not connected in this session. Explain: *"Atlassian MCP is configured in `.mcp.json` but not connected. Restart Claude Code (`claude --resume`) and complete the Atlassian OAuth flow. Say 'ready' when done."* **Stop** until the user confirms "ready".
  - **`.mcp.json` missing or no `atlassian` entry**: offer to create/merge the standard Atlassian remote MCP config into `.mcp.json`. Show the JSON before writing. Then explain: *"`.mcp.json` updated. Restart Claude Code (`claude --resume`) and complete the Atlassian OAuth flow. Say 'ready' when done."* **Stop** until the user confirms "ready".

### 0.3 Tier 1 — Hard block (glab)

Required for MR creation and CI status checks. **Hard block if missing or unauthenticated.**

```bash
command -v glab
```

If not installed, detect OS and offer the right command:

```bash
uname -s                                          # Darwin = macOS
test -f /etc/os-release && cat /etc/os-release    # linux distro
```

| Platform | Install command |
|----------|-----------------|
| macOS | `brew install glab` |
| Debian/Ubuntu | `sudo apt install glab` or `sudo snap install glab` |
| Fedora/RHEL | `sudo dnf install glab` |
| Fallback | Binary from <https://gitlab.com/gitlab-org/cli/-/releases> |

Then verify auth:

```bash
glab auth status
```

If not authenticated, run `glab auth login` and guide through the prompts. **Do not proceed** until `glab auth status` exits cleanly.

---

### 0.4 Tier 2 — Deferred (Node.js + pnpm)

Every SPA SDK package is TypeScript built with pnpm, so in practice every ticket needs these — but they are only *used* in Step 5. **Warn now; hard-block in Step 5.**

```bash
command -v node && node --version   # must be v20.0.0+
command -v pnpm && pnpm --version
test -d node_modules                # workspace dependencies installed
```

- **`node` missing or below v20**: **remember this**. Note: *"Node.js v20+ not found — Step 5 cannot build or test. Install it (e.g. `nvm use 20`, `mise use node@20`) before Step 5."*
- **`pnpm` missing**: **remember this**. Note: *"`pnpm` not found — Step 5 cannot build or test. Install it (e.g. `corepack enable`, `npm i -g pnpm@8`) before Step 5. Do not upgrade to a newer pnpm major than the repo uses — it can rewrite `pnpm-lock.yaml` in a different format."*
- **`node_modules` missing**: note *"Dependencies not installed — Step 5 will run `pnpm install` first."* This is not a block.
- **All present**: confirm *"`node` and `pnpm` found."* and continue.

> Step 5 will ask you to recall whether `node` and `pnpm` were found before running checks.

---

### 0.5 Tier 3 — Soft warn (Slack MCP)

Only needed for Step 9 (reviewer notification). **If missing, Step 9 is skipped gracefully** — the skill prints the reviewer's name and MR URL so the developer can notify manually.

Check whether the `mcp__slack__*` tools are available in this session (fall back to `test -f .mcp.json && cat .mcp.json` for a `slack` entry).

- **Missing**: **remember that Slack MCP is not available**. Note: *"Slack MCP not configured — Step 9 (reviewer notification) will be skipped. To enable it, add the Slack MCP and restart Claude Code. You can do this later without re-running the full workflow."* **Do not stop.**
- **Present**: confirm *"Slack MCP found."* and continue.

### 0.6 Tier 3 — Soft warn (jq)

Needed for the CI status gate (7.6, 10.0) and Step 10 (MR comment analysis). **If missing, those are skipped gracefully.**

```bash
command -v jq
```

- **Missing**: **remember that `jq` is not available**. Note: *"`jq` not found — the CI gate and Step 10 (address MR comments) will be skipped. Install it to enable them (`brew install jq`, `apt install jq`)."* **Do not stop.**
- **Present**: confirm *"`jq` found."* and continue.

### 0.7 Tier 3 — Soft warn (Jenkins MCP)

CI for this repo runs on **Jenkins** (see `Jenkinsfile`: install → build → lint → unit tests), which reports back to GitLab as a commit status named `jenkins`. The Jenkins MCP is only used to fetch failure logs. **If missing, failure logs are not fetched** — the skill shows the Jenkins build URL instead.

Check whether the `mcp__jenkins__*` tools are available in this session.

- **Missing**: note *"Jenkins MCP not available — on CI failure I'll link the Jenkins build instead of fetching its log."* **Do not stop.**
- **Present**: confirm *"Jenkins MCP found."*

---

### 0.8 Preflight summary

Print a compact summary before proceeding:

```
## Preflight — $ISSUE_KEY

Tier 1 (required):
  ✅ git 2.x.x
  ✅ Atlassian MCP
  ✅ glab 1.x.x

Tier 2 (deferred):
  ✅ node v20.x.x
  ✅ pnpm 8.x.x
  [or]
  ⚠️  node missing / < v20 — Step 5 will block until installed
  ⚠️  pnpm missing         — Step 5 will block until installed

Tier 3 (optional):
  ✅ Slack MCP     — Step 9 enabled
  ✅ jq 1.7.x      — CI gate and Step 10 enabled
  ✅ Jenkins MCP   — CI failure logs enabled
  [or]
  ℹ️  Slack MCP missing   — Step 9 will be skipped (notify reviewer manually)
  ℹ️  jq missing          — CI gate and Step 10 will be skipped
  ℹ️  Jenkins MCP missing — CI failures will link to Jenkins instead of showing logs
```

If any Tier 1 check failed, the skill has already aborted above — this summary is only reached when all Tier 1 checks pass.

### 0.9 Progress banner

After the summary, emit:

```
✅ Step 0 complete — next up: Step 1, Fetch and Analyse the JIRA Issue
```

If any Tier 3 steps will be skipped, append: `(Note: Steps N will be skipped — see preflight warnings above)`

Follow with one short, varied, genuine encouragement line about the environment being clean and ready (write a fresh one each run — do not reuse phrasing).

---

## Step 1 — Fetch and Analyse the JIRA Issue (Opus)

**Use the Opus model for this step** by spawning an Agent with `model: "opus"`.

The Opus agent must retrieve and synthesise **all available information** for `$ISSUE_KEY`:

- **Issue fields**: summary, description, issue type, priority, status, labels, components, fix version, story points, linked issues.
- **Comments**: all comments in chronological order, noting author and date.
- **Attachments**: list names and types; if any are Confluence pages (remote links or mentioned URLs), fetch their content via `mcp__atlassian__getConfluencePage`.
- **Remote issue links**: use `mcp__atlassian__getJiraIssueRemoteIssueLinks` to fetch any remote links (Confluence pages, external docs, etc.).
- **Linked issues**: for each `Blocks` / `is blocked by` / `Relates to` link, fetch the linked issue summary and status.

After gathering the data, the Opus agent must produce a **Ticket Analysis** with:

```
## Ticket Analysis — $ISSUE_KEY

### Summary
<One-paragraph plain-English description of what needs to be done and why>

### Acceptance Criteria
<Bulleted list extracted from description/comments. Infer if not explicit.>

### Technical Scope
- Affected packages: <e.g. spa-sdk, react-sdk, vue-sdk, ng-sdk, lit-sdk>
- Affected areas: <e.g. public API, types, components, docs, examples>
- Cross-framework parity: <does the change need to be mirrored in every framework SDK and example?>
- Key constraints: <backwards compatibility, public API contracts, peer dependency ranges, bundle size, etc.>
- Open questions: <anything ambiguous that needs a decision>

### Risk Flags
<Anything that could complicate implementation: breaking changes, missing info, dependencies on other tickets, etc.>
```

Return the Ticket Analysis to the main conversation.

### 1.1 Documentation prompt

After the Ticket Analysis is returned, ask the user:

> "Does this fix require a documentation update outside this repo (e.g. the Bloomreach developer docs)? (yes / no)"

**Stop and wait for their answer before continuing.**

- **Yes** → set `$DOCS_REQUIRED=true`. The label `docs-required` will be applied to the ticket in Step 8.
- **No** → set `$DOCS_REQUIRED=false`. No documentation label is added.

> In-repo docs (package READMEs, TypeDoc/JSDoc, the `docs/` site) are not covered by this prompt — if they're affected, they belong in the implementation plan in Step 2.

### 1.2 State Detection & Resume

Before assuming a fresh start, run a state detection pass to determine what has already been done for `$ISSUE_KEY`. The skill is frequently re-invoked on tickets where work is already in flight (a branch exists, commits are landed, an MR is open, or JIRA has already been moved). Without detection, Step 3 fatals when the branch already exists, Step 7 creates duplicate MRs, and Step 8 transitions an already-transitioned ticket. Detection runs once, prints a State Summary, and either confirms a clean fresh start or routes the developer to the right resume point.

Run the checks below **in order**. Each check is read-only and must not mutate state.

#### Check A — Dirty working tree

```bash
git status --porcelain
git rev-parse --abbrev-ref HEAD   # current branch name
```

Capture the porcelain output as `$DIRTY_FILES` and the current branch as `$CURRENT_BRANCH`. Ignore untracked OS/editor noise (e.g. `.DS_Store`) when deciding whether the tree is dirty.

- **If `$DIRTY_FILES` is non-empty AND `$CURRENT_BRANCH` does NOT match `feature/$ISSUE_KEY-*`**:
  1. List the dirty files (path and status letter).
  2. Warn: *"You have uncommitted changes on `$CURRENT_BRANCH` that are not on a feature branch for `$ISSUE_KEY`. Step 3 would normally check out `development`, which could lose or smear these changes."*
  3. Look at what the changes are. If they look like work for `$ISSUE_KEY` itself (the developer started before running `/fix-issue`, e.g. files the ticket names), say so and recommend **Carry over**.
  4. Offer four options and wait for the developer's choice:
     1. **Carry over** — keep the changes in the working tree and take them onto the feature branch in Step 3. Git keeps uncommitted and untracked changes when switching branches, so `git checkout development && git pull` followed by `git checkout -b` brings them along. If the checkout or pull refuses because a local change would be overwritten, stop and fall back to option 2. Set `$CARRY_OVER=true`; Step 4 then starts by reviewing the carried-over changes against the plan instead of writing them from scratch.
     2. **Stash** — run `git stash push -u -m "fix-issue auto-stash for $ISSUE_KEY"` and continue. Tell them how to recover later (`git stash list`, `git stash pop`).
     3. **Commit first** — pause the workflow and let the developer commit the changes manually on the current branch, then resume. Not allowed when `$CURRENT_BRANCH` is `development` or `main` (ABSOLUTE RULE) — offer Carry over or Stash instead.
     4. **Abort** — exit the skill cleanly; do not run further checks.
  5. Only proceed to Check B once the developer has chosen one of the four.

- **If `$DIRTY_FILES` is non-empty AND `$CURRENT_BRANCH` DOES match `feature/$ISSUE_KEY-*`**:
  This is expected in-progress work. Do **not** block. Briefly surface the dirty file list (e.g. *"You have N uncommitted file(s) on `$CURRENT_BRANCH` — that's expected for resumed work."*) and continue to Check B.

- **If `$DIRTY_FILES` is empty**: continue silently to Check B.

#### Check B — Existing feature branch (local or remote)

```bash
# Local matches
git branch --list "feature/$ISSUE_KEY-*"

# Remote matches
git ls-remote --heads origin "feature/$ISSUE_KEY-*" | awk '{print $2}' | sed 's|refs/heads/||'
```

Combine both lists, deduplicate, and store as `$BRANCH_CANDIDATES`.

- **If `$BRANCH_CANDIDATES` is empty**: set `$EXISTING_BRANCH=""` (no existing branch) and continue to Check E — there can be no commits or MR without a branch.
- **If `$BRANCH_CANDIDATES` has exactly one entry**: set `$EXISTING_BRANCH` to that name.
- **If `$BRANCH_CANDIDATES` has multiple entries**: present them as a numbered list and ask the developer which one to resume on. Set `$EXISTING_BRANCH` to their pick.

If `$EXISTING_BRANCH` is set, check whether we're already on it:

```bash
git rev-parse --abbrev-ref HEAD
```

- If `HEAD` already equals `$EXISTING_BRANCH`: note *"Already on `$EXISTING_BRANCH`."* and continue to Check C.
- If not: ask *"Branch `$EXISTING_BRANCH` already exists. Check it out now to inspect its state? (recommended)"* If the developer agrees, run `git fetch origin` followed by `git checkout $EXISTING_BRANCH` (creating a tracking branch from `origin/$EXISTING_BRANCH` if it only exists remotely). Then continue to Check C.

#### Check C — Commits ahead of development (only if `$EXISTING_BRANCH` is set)

```bash
git fetch origin development
git rev-list --count "origin/development..$EXISTING_BRANCH"
git log --oneline "origin/development..$EXISTING_BRANCH"
```

Record:
- `$COMMITS_AHEAD` — the integer count.
- `$COMMIT_SUMMARIES` — the one-line log for display.

If `$EXISTING_BRANCH` exists only on the remote (no local copy yet) and the developer chose not to check it out in Check B, run the equivalent against `origin/$EXISTING_BRANCH` instead.

#### Check D — Existing open MR

```bash
glab mr list --source-branch "$EXISTING_BRANCH" 2>/dev/null
```

(Skip this check entirely if `$EXISTING_BRANCH` is empty. `glab mr list` shows open MRs by default.)

If an open MR is found, capture:
- `$MR_IID` — the MR number (e.g. `!255`).
- `$MR_URL` — the web URL.
- `$MR_TITLE` — the title.
- `$CI_STATUS` — read the `jenkins` commit status for the branch head (see 7.6 for the command) and record `green` / `running` / `failed` / `none`.

If no open MR exists, set `$MR_IID=""` and `$CI_STATUS="N/A"`.

#### Check E — JIRA status

Use the `status` field already captured in the Step 1 ticket data — do **not** make another API call. Store as `$JIRA_STATUS` (e.g. `Open`, `Ready for Development`, `In Progress`, `Review`, `Resolved`, `Closed`).

#### State Summary

Render this table to the developer using the values gathered above. Use `✅` / `❌` / `⏳` glyphs literally.

```
## State Summary — $ISSUE_KEY

| Item                  | Status                                                |
|-----------------------|-------------------------------------------------------|
| Feature branch        | <✅ exists ($EXISTING_BRANCH) | ❌ not yet created>     |
| Commits on branch     | <$COMMITS_AHEAD commits ahead of development | none>  |
| Open MR               | <✅ $MR_IID ($MR_URL) | ❌ none>                       |
| CI (Jenkins)          | <✅ green | ⏳ running | ❌ failed | N/A>              |
| JIRA status           | <$JIRA_STATUS>                                        |
```

#### Resume map — recommended resume point

Before building the resume map, collect two additional facts about MR comment state:

```bash
# Count open resolvable threads (excluding own replies and system notes)
# Uses the same glab api call as Step 10.1 — run only if $MR_IID is set
OPEN_DISCUSSION_COUNT=<count of resolvable==true && resolved==false threads, author != current user>

# Compute the timestamp of the latest commit on the branch (needed for CodeRabbit detection)
LAST_COMMIT_TS=$(git log -1 --format=%cI HEAD)
CODERABBIT_REVIEWED_HEAD=<true if any coderabbitai note has created_at > LAST_COMMIT_TS, else false>
```

Store `$OPEN_DISCUSSION_COUNT` and `$CODERABBIT_REVIEWED_HEAD` in resume context alongside the other variables.

Update the State Summary table to include a comments row:

```
| MR comments           | <N open threads (A coderabbit, B human) | none>     |
```

Match the gathered state against the table below. Pick the **first row** whose conditions all hold.

| # | Conditions | Recommended resume |
|---|---|---|
| 1 | `$EXISTING_BRANCH=""`, tree clean | **Step 2** — fresh start |
| 2 | `$EXISTING_BRANCH` set, `$COMMITS_AHEAD=0`, `$MR_IID=""` | **Step 2** — branch empty, re-plan |
| 3 | `$EXISTING_BRANCH` set, `$COMMITS_AHEAD>0`, `$MR_IID=""`, dirty tree | **Step 4** — finish implementation |
| 4 | `$EXISTING_BRANCH` set, `$COMMITS_AHEAD>0`, `$MR_IID=""`, tree clean | **Step 5** — verify |
| 5 | `$MR_IID` set, `$CI_STATUS` is `running` or `failed` | **Step 10** — check CI failure, then comments |
| 6 | `$MR_IID` set, `$CI_STATUS=green`, `$OPEN_DISCUSSION_COUNT>0` | **Step 10** — address MR comments |
| 7 | `$MR_IID` set, `$CI_STATUS=green`, `$OPEN_DISCUSSION_COUNT=0`, `$JIRA_STATUS` not `Review` and not terminal | **Step 8** — JIRA update |
| 8 | `$MR_IID` set, `$JIRA_STATUS=Review`, no Slack sent | **Step 9** — notify reviewer |
| 9 | `$MR_IID` set, `$JIRA_STATUS=Review` or terminal, `$OPEN_DISCUSSION_COUNT=0` | **Completion summary** — nothing to do |

> **Row 5 note**: if CI is failing AND there are open comments, Step 10 handles both — its 10.0 precondition check surfaces the CI failure first, guides the fix, and then continues to comment analysis once CI is green.

> **Row 6 note**: if `$CODERABBIT_REVIEWED_HEAD=false` and there are only CodeRabbit threads (no human comments), the recommendation is still Step 10 but the prompt notes *"CodeRabbit may not have reviewed the latest commit yet."*

Then prompt:

> *"I recommend resuming from Step N. Press Enter to continue there, or tell me which step to start from (0–10) if you want to go elsewhere."*

**Always honour the developer's override.** If they pick an earlier step than recommended (e.g. *"start from Step 2 even though the branch already has 4 commits"*), warn them about the likely consequences (re-planning will invalidate the existing work; running Step 3 will fail without the guard; etc.) but respect the choice and continue from there.

Persist the following resume context for downstream steps to use:
- `$EXISTING_BRANCH`
- `$COMMITS_AHEAD`
- `$MR_IID`, `$MR_URL`, `$CI_STATUS`
- `$JIRA_STATUS`
- `$OPEN_DISCUSSION_COUNT`
- `$CODERABBIT_REVIEWED_HEAD`
- `$LAST_COMMIT_TS` — used by Step 10 to detect whether CodeRabbit has reviewed HEAD
- `$DOCS_REQUIRED` — whether the `docs-required` label should be added in Step 8 (set in section 1.1)
- `$CARRY_OVER` — whether uncommitted changes are being carried onto the feature branch (set in Check A)

### 1.3 Progress banner

```
✅ Step 1 complete — next up: Step 2, Draft Implementation Plan
```

Follow with a fresh one-sentence encouragement (e.g. about the ticket being well-understood, or the scope being clear). Vary the wording.

---

## Step 2 — Draft Implementation Plan

Based on the Ticket Analysis, produce a **numbered implementation plan**. Each step must name:
- The file(s) to create or modify (with package path, e.g. `packages/spa-sdk/src/page/image-set.ts`)
- The specific change (add export / modify type / update component / update docs / add test)
- Why the change is necessary

Group steps logically (e.g. core `spa-sdk` types → `spa-sdk` exports (`index.ts`) → framework SDKs → JSDoc/TypeDoc/README → examples → tests).

If the change affects behaviour that every framework SDK exposes, plan the matching change in **each** affected SDK (`react-sdk`, `vue-sdk`, `ng-sdk`, `lit-sdk`) and example — the SDKs are kept at feature parity.

Include **at least one explicit unit-test step** for any new function, class, component, or non-trivial change. Do not roll tests into "and then write tests" as an afterthought — they are first-class steps.

Present the plan to the user. **Stop and wait for approval or amendments before continuing.**

### 2.1 Progress banner

```
✅ Step 2 complete — next up: Step 3, Create Branch
```

Add a fresh one-sentence encouragement about the plan being approved / scope locked in.

---

## Step 3 — Create Branch (Sonnet)

After plan approval, determine the branch name:

- **Convention**: `feature/$ISSUE_KEY-<short-slug>` where the slug is 2–5 lowercase hyphenated words derived from the issue summary.
- Example: `feature/SPASDK-276-get-image-content-helper`

### 3.0 Resume guard — existing branch detected

Before running any branch-creation commands, check the resume context from section 1.2:

- **If `$EXISTING_BRANCH` is non-empty** (a feature branch for `$ISSUE_KEY` already exists):
  1. Inform the user: *"Branch `$EXISTING_BRANCH` already exists — checking it out instead of creating a new one."*
  2. If we're already on `$EXISTING_BRANCH` (verified with `git rev-parse --abbrev-ref HEAD`), do nothing further. Otherwise:
     ```bash
     git fetch origin
     git checkout "$EXISTING_BRANCH"
     # If only the remote copy exists, the line above creates a tracking branch automatically.
     # Pull the latest if a remote tracking branch is configured:
     git pull --ff-only 2>/dev/null || true
     ```
  3. Confirm the active branch and skip the rest of Step 3 (do **not** run `git checkout development` or `git checkout -b`). Jump straight to the 3.2 progress banner.

- **If `$EXISTING_BRANCH` is empty**: proceed with normal branch creation below.

### 3.1 Create the branch (fresh start)

Check out the base branch, pull the latest changes, then create the feature branch:

```bash
git checkout development
git pull origin development
git checkout -b feature/$ISSUE_KEY-<slug>
```

If `pnpm-lock.yaml` changed in the pull, run `pnpm install` so Step 5 builds against the right dependencies.

**Verify the active branch is the new feature branch, not a protected one:**

```bash
git rev-parse --abbrev-ref HEAD
```

If the result is `development` or `main` (e.g. `git checkout -b` failed), stop and apply the ABSOLUTE RULE above. Do not proceed.

If `$CARRY_OVER=true`, run `git status --short` and confirm the carried-over changes arrived on the new branch.

Confirm the active branch to the user.

### 3.2 Progress banner

```
✅ Step 3 complete — next up: Step 4, Implement Step by Step
```

Add a fresh one-sentence encouragement specific to the branch being live and ready for changes.

---

## Step 4 — Implement Step by Step (Interactive)

Work through each step of the approved plan **one at a time**.

If `$CARRY_OVER=true`, part of the work already exists in the working tree. For those plan steps, review the existing changes against the plan and the acceptance criteria instead of rewriting them, and report what (if anything) had to be fixed.

For every plan step:
1. State clearly which step you are about to execute (e.g. `## Implementing Step 3/6: Export ImageSet helper`).
2. Make the change (edit/create files).
3. Show a brief diff summary or description of what changed.
4. **Pause and ask the user to confirm before moving to the next step.**
   - Present options: `[C]ontinue`, `[S]kip`, `[A]djust` (user describes change), `[R]eplan` (restart from Step 2).

If any step reveals new information that invalidates later steps, surface it immediately and propose a plan update before continuing.

**Repo convention**: when importing from another module in the same folder, always use a relative path (e.g. `./image-set`) — never import from `'.'`.

### 4.1 Lint compliance

**Write lint-compliant code from the start** — do not defer lint fixes to Step 5.

Before writing or editing a file, check the lint config of the package it belongs to (`.eslintrc*` or `eslint.config.*` in the package root; the SDKs extend Bloomreach-specific configs such as `@bloomreach/eslint-config-base` / `-react`).

Common rules that cause CI failures:
- No unused imports or variables
- No `any` types without explicit justification
- Consistent quote style, trailing commas, and import ordering (match surrounding code)
- No `console.log` in library code

After changing a file, lint its package before confirming the step:

```bash
pnpm --filter <package> run lint
```

`vue-sdk` has no `lint` script — use `pnpm --filter @bloomreach/vue-sdk run type-check` instead.

Fix any lint errors immediately rather than accumulating them for Step 5.

### 4.2 Unit tests are first-class

When a plan step is "add unit tests" — or whenever you add a new function/class/component that warrants tests — **do not just write tests in isolation**. First, conform to the conventions already used in that package:

1. **Find analogous existing tests in the same package.** Use Glob/Grep:

   | Package | Test runner | Where tests live |
   |---------|-------------|------------------|
   | `spa-sdk` | Jest + ts-jest (jsdom) | `*.spec.ts` next to the source file |
   | `react-sdk` | Jest + @testing-library/react (snapshots) | `*.spec.tsx` next to the component |
   | `vue-sdk` | Vitest + @vue/test-utils | `src/__tests__/*.spec.ts` |
   | `ng-sdk` | Jest + jest-preset-angular | `*.spec.ts` next to the directive/component |
   | `lit-sdk` | Vitest (jsdom) | `src/__tests__/*.spec.ts` |

2. **Read 1–2 of the most similar existing tests.** Note:
   - Mocking strategy (`jest.fn()` / `vi.fn()`, mocked `Page`/`Component` objects, Inversify container setup in `spa-sdk`).
   - Fixture/setup patterns (`beforeEach`, shared model fixtures, render helpers).
   - Naming conventions (`describe`/`it` phrasing used in the file).
   - Whether snapshots are used (common in `react-sdk`).
3. **Write tests that match these conventions.** A test that fits the package's style is much more likely to be maintained than one that's structurally alien.
4. **Surface this as its own named step** in the implementation progress, e.g. `## Implementing Step 5/8: Add unit tests for getImage` — never bundle it silently into another step.

### 4.3 Progress banner

After the final implementation sub-step is confirmed:

```
✅ Step 4 complete — next up: Step 5, Verify
```

Add a fresh one-sentence encouragement about the implementation being done. Vary phrasing.

---

## Step 5 — Verify: Build, Tests, Lint, Types

### 5.0 Preflight warnings gate

Before running any checks, recall what was found during Step 0:

- If `node` (v20+) or `pnpm` was **not found in Step 0**: **stop now**. Tell the user which one is missing and how to install it (see 0.4), and to re-run from Step 5.
- If `node_modules` was missing, run `pnpm install` first.

### Determine affected packages

```bash
git fetch origin development
git diff --name-only origin/development...HEAD
git diff --name-only            # plus uncommitted changes
```

Map changed files to packages:

| Changed path prefix | Package filter |
|---------------------|----------------|
| `packages/spa-sdk/` | `@bloomreach/spa-sdk` |
| `packages/react-sdk/` | `@bloomreach/react-sdk` |
| `packages/vue-sdk/` | `@bloomreach/vue-sdk` |
| `packages/ng-sdk/` | `@bloomreach/ng-sdk` |
| `packages/lit-sdk/` | `@bloomreach/lit-sdk` |
| `examples/<name>/` | `@bloomreach/example-<name>` |
| `docs/` | docs site (`cd docs && pnpm build`) |

### Checks per affected package

For each affected SDK package, run build, tests, and lint. **Lint is mandatory** — a lint failure is a hard block, the same as a test or build failure (Jenkins runs `pnpm build`, `pnpm lint` and `pnpm test` on every MR).

```bash
# Build (also serves as type check for all packages except vue-sdk)
pnpm --filter <package> run build

# Type check (vue-sdk only — has a dedicated command)
pnpm --filter @bloomreach/vue-sdk run type-check

# Tests
pnpm --filter <package> run test

# Lint (not available for vue-sdk)
pnpm --filter <package> run lint
```

If `spa-sdk` changed, also build every framework SDK (they consume it as a workspace dependency) to catch integration issues:

```bash
pnpm --filter "./packages/*" run build
```

If an example changed, build it (and run its `lint` script if it has one):

```bash
pnpm --filter @bloomreach/example-<name> run build
```

### TypeDoc — run if the `spa-sdk` public API changed

```bash
pnpm --filter @bloomreach/spa-sdk run typedoc
```

Check for warnings about undocumented or missing exports.

### Report results

Present a summary table:

```
| Check                        | Result |
|------------------------------|--------|
| Build: <package>             | ✅ PASS / ❌ FAIL (details) |
| Tests: <package>             | ✅ PASS / ❌ FAIL (details) |
| Lint: <package>              | ✅ PASS / ❌ FAIL / N/A |
| Type check: vue-sdk          | ✅ PASS / N/A |
| Downstream SDK builds        | ✅ PASS / N/A |
| Example builds               | ✅ PASS / N/A |
| TypeDoc                      | ✅ PASS / N/A |
```

**Do not proceed if any check fails.** Fix failures and re-run the affected check before continuing. If a fix would require significant rework, return to Step 4.

### 5.1 Progress banner

```
✅ Step 5 complete — next up: Step 6, Commit
```

Add a fresh one-sentence encouragement about the checks being green. Vary the phrasing.

---

## Step 6 — Commit

**Protected branch guard**: before anything else, verify the current branch is not `development` or `main`:

```bash
git rev-parse --abbrev-ref HEAD
```

If it is, stop immediately and apply the ABSOLUTE RULE: *"The current branch is `<branch>` — I will not commit to a protected branch. Please check out a feature branch and re-run."*

### 6.0 Resume guard — nothing to commit

Before drafting a commit, check whether there's actually anything to commit:

```bash
git status --porcelain
```

- **If the porcelain output is empty AND `$COMMITS_AHEAD > 0`** (the branch already has prior commits with no new changes pending): ask the developer:
  > *"Nothing new to commit — the branch already has $COMMITS_AHEAD commit(s) ahead of `development`. Skip the commit step and proceed to Step 7?"*

  - If they say yes: skip the rest of Step 6 entirely and jump to the 6.2 progress banner.
  - If they say no: stop and let them describe what they want to do (e.g. amend a previous commit, or there are changes they expected to see that aren't showing up).

- **If the porcelain output is empty AND `$COMMITS_AHEAD = 0`**: there is genuinely nothing to commit. Surface this as a concern (*"No changes staged or unstaged, and no prior commits on the branch — has the implementation actually happened?"*) and let the developer decide whether to loop back to Step 4.

- **Otherwise** (changes are present): proceed normally to 6.1.

### 6.1 Draft the commit

Commit message format for this repo: `$ISSUE_KEY <type>: <short description>`

Types: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`

Example: `SPASDK-276 feat: add getImage helper to collapse image resolution chain`

Add a short body explaining **why** the change was made when the subject line alone doesn't make it obvious.

Stage specific files (avoid `git add -A` — the repo often has untracked noise like `.DS_Store`), draft the commit message, and present it to the user. **Validate the commit message with the user before committing.**

If the change is large enough to split (e.g. a `spa-sdk` helper plus its adoption in the examples), propose logically separate commits — every commit must start with `$ISSUE_KEY` (MRs are merged without squashing).

### 6.1.1 Explicit commit consent

Committing is destructive (it changes git history). Require **unambiguous explicit consent** before running `git commit`.

**Phrases that authorize a commit:**
- "commit"
- "go ahead and commit"
- "yes commit"
- "do it"
- "proceed with commit"
- Any unambiguous direct equivalent (e.g. "ship the commit", "commit it now")

**Phrases that do NOT authorize a commit** (these are *soft approvals* of the commit message, not consent to commit):
- "looks good"
- "I'm happy with it"
- "lgtm"
- "nice"
- "sounds good"
- "ok" / "okay"
- "sure"
- "yep"
- "great"

If the user replies with a soft approval after reviewing the message, ask explicitly:

> *"Just to confirm — should I go ahead and commit this? Say 'commit' to proceed."*

**Never commit on the basis of implied consent.** When in doubt, ask again.

### 6.1.2 JIRA issue reference sanitisation

When reviewing the commit message body, check whether it references any other JIRA issue keys (pattern `[A-Z]+-\d+`, e.g. `SPASDK-274`). If it does, **replace the dash with an underscore** in all referenced keys that are not `$ISSUE_KEY` itself:

- `SPASDK-274` → `SPASDK_274`
- `CMS-18773` → `CMS_18773`

**Why**: GitLab's Jira integration scans commit messages for `[A-Z]+-\d+` patterns and auto-links each match as a development activity on that ticket. A reference like *"relates to SPASDK-274"* would appear as a commit against SPASDK-274 in Jira, misleading reviewers into thinking that issue was fixed. Using `SPASDK_274` preserves the human-readable reference while preventing the auto-link.

### 6.2 Progress banner

After the commit lands (or after the skip in 6.0):

```
✅ Step 6 complete — next up: Step 7, Create Merge Request
```

Add a fresh one-sentence encouragement about the work being recorded.

---

## Step 7 — Create Merge Request

After the commit, rebase, push the branch, and create an MR.

### 7.1 Pre-push rebase

Always rebase onto the latest `development` before pushing. This catches integration issues *now* rather than during MR review.

```bash
git fetch origin
git rebase origin/development
```

- **Clean rebase**: confirm with *"Rebased cleanly onto `development` — ready to push."* and proceed. If `pnpm-lock.yaml` or any `package.json` changed upstream, run `pnpm install` and re-run the Step 5 checks for the affected packages before pushing.
- **Conflicts**: **STOP**. Do not push.
  1. Run `git status` and list the conflicting files.
  2. For each conflict, briefly explain what's clashing (which side did what — based on the recent commits and the current change).
  3. Walk the developer through resolution: open files, resolve, `git add <file>`, then `git rebase --continue`. For `pnpm-lock.yaml` conflicts, take `development`'s version and re-run `pnpm install` rather than hand-merging.
  4. Repeat until the rebase is complete and clean.
  5. Only then proceed to push.

### 7.2 Push consent + push

**Protected branch guard**: before pushing, verify the current branch is not `development` or `main`:

```bash
git rev-parse --abbrev-ref HEAD
```

If it is, stop immediately and apply the ABSOLUTE RULE. Do not push.

Pushing is also gated by **explicit consent**, identical in spirit to the commit gate (6.1.1).

**Phrases that authorize a push:** "push", "go ahead and push", "yes push", "do it", "proceed with push", or unambiguous direct equivalent.

**Phrases that do NOT authorize a push:** "looks good", "lgtm", "ok", "sure", "yep", "nice", "sounds good", or any soft approval of the MR metadata.

If ambiguous:

> *"Just to confirm — should I push the branch now? Say 'push' to proceed."*

When consent is given:

```bash
git push -u origin HEAD
```

If the branch was already pushed and the rebase in 7.1 rewrote it, a plain push will be rejected. Use `git push --force-with-lease` — and say so explicitly when asking for push consent.

### 7.3 Resume guard — existing MR detected

Before gathering MR metadata or running `glab mr create`, consult the resume context from section 1.2:

- **If `$MR_IID` is non-empty** (an open MR for this branch already exists):
  1. Inform the user: *"MR $MR_IID already exists at $MR_URL — skipping creation. Checking CI status."*
  2. Skip sections 7.4 and 7.5 (metadata gathering and `glab mr create`) entirely.
  3. Re-confirm the MR is still open and targets `development`:
     ```bash
     glab mr view "$MR_IID"
     ```
     If the MR has been merged, closed, or retargeted unexpectedly, surface that to the developer and ask how to proceed before continuing.
  4. Jump directly to the CI gate (7.6) using the existing `$MR_IID`.

- **If `$MR_IID` is empty**: proceed with normal MR creation (7.4 → 7.5 → 7.6).

### 7.4 Gather MR metadata (skipped when an MR already exists)

#### 7.4.1 Resolve assignee GitLab username

Do not assume the git user name matches the GitLab username. Resolve it explicitly:

```bash
glab api user | jq -r '.username'
```

If the lookup returns a username, use it as `$ASSIGNEE` and confirm: *"Assignee resolved: `$ASSIGNEE`"*. If it returns nothing, ask the user: *"Could not resolve your GitLab username — please enter it manually."*

#### 7.4.2 Suggest reviewer from git history

Before asking for a reviewer, analyse who has contributed most to the files changed in this branch:

```bash
# Get files changed in this branch
CHANGED_FILES=$(git diff --name-only origin/development...HEAD)

# Find top contributors to those files (excluding current user)
git log --all --format="%an" -- $CHANGED_FILES \
  | grep -v "$(git config user.name)" \
  | sort | uniq -c | sort -rn | head -5
```

Map each name to a GitLab username using `glab api "users?search=<name>"`. Present the top results as suggestions (skip anyone who resolves to the current user):

```
Suggested reviewers based on git history for changed files:
  1. <gitlab.username>  (47 commits)
  2. <gitlab.username>  (12 commits)
  3. <gitlab.username>  ← that's you, skipped

Pick a number, type a GitLab username directly, or press Enter to skip suggestions.
```

**The user must explicitly confirm the reviewer** — this is a suggestion, not an auto-selection. Wait for their input before proceeding.

### 7.5 Create MR with glab (skipped when an MR already exists)

```bash
glab mr create \
  --title "$ISSUE_KEY <issue summary from Step 1>" \
  --description "$(cat <<'EOF'
## What

<2-3 sentence summary of the change>

## Why

<Link to JIRA ticket and brief rationale>

## How to test

<Bulleted testing steps for the reviewer — include which example app(s) to run, if relevant>

## Checklist

- [ ] Tests added/updated
- [ ] No breaking public API changes (or migration notes added)
- [ ] Change mirrored across all affected framework SDKs and examples
- [ ] TypeDoc/JSDoc updated for changed exports
- [ ] README updated if usage docs are affected

🤖 Implemented with Claude Code
EOF
)" \
  --assignee "<assignee>" \
  --reviewer "<reviewer>" \
  --target-branch development \
  --remove-source-branch
```

Display the MR URL to the user.

### 7.6 CI gate (Jenkins)

Do not proceed to Step 8 until the Jenkins build for the pushed commit is green.

CI for this repo is **Jenkins**, not GitLab CI — `glab ci view` / `glab ci status` will not show it. Jenkins reports back to GitLab as a **commit status named `jenkins`** on the pushed commit, so read that instead. If `jq` was not found in Step 0.6, skip this gate: tell the user to check the MR's pipeline widget manually, and flag it in the completion checklist.

1. **Wait briefly** (15–20 seconds) for Jenkins to pick up the push.

2. **Polling loop** — read the `jenkins` commit status for the branch head:

   ```bash
   PROJECT_PATH=$(git remote get-url origin | sed 's|.*[:/]\(engineering/.*\)\.git|\1|' | sed 's|/|%2F|g')
   SHA=$(git rev-parse HEAD)
   BRANCH=$(git rev-parse --abbrev-ref HEAD)
   glab api "projects/${PROJECT_PATH}/repository/commits/${SHA}/statuses?ref=${BRANCH}" \
     | jq -r '[.[] | select(.name=="jenkins")] | sort_by(.created_at) | last | "\(.status) \(.target_url)"'
   ```

   > **Always pass `ref`.** Without it, GitLab only returns statuses recorded for the default branch, so a feature-branch commit always looks like it has no status and the gate would poll until it times out.

   The same commit also carries a `CodeRabbit` status; ignore it here — only `jenkins` gates the hand-off.

   Only these count as **terminal**:
   - ✅ `success`
   - ❌ `failed` / `canceled`

   Still running: `pending` / `running` / `created`, or no `jenkins` status yet.

   On each iteration print: *"Jenkins build running… checking again in 30s (N checks so far)"*

3. **Maximum wait**: after **20 minutes** of polling, offer to skip:
   > *"The Jenkins build is taking a while. Skip the CI check and proceed anyway? (not recommended)"*
   - If the user says no, keep polling.
   - If the user says yes, proceed to Step 8 — but flag this clearly in the final completion checklist.

4. **Build passes**: confirm with *"Jenkins build green — proceeding to JIRA update."* and continue to Step 8.

5. **Build fails**: **block Step 8**. Investigate:
   - The status's `target_url` points at the Jenkins build. If the Jenkins MCP is available (Step 0.7), fetch the log with `mcp__jenkins__getBuildLog` (or `mcp__jenkins__searchBuildLog` for `ERR!` / `FAIL` / `error TS`) using the job and build number from that URL.
   - Otherwise, show the `target_url` and ask the developer to paste the failing section.
   - The Jenkins stages are `Install` → `Build` → `Lint` → `Unit tests`; name the stage that failed.

   Present a concise failure summary (stage, error excerpt, likely cause). Do not transition JIRA or assign a reviewer to a broken build. Loop back to fixes (typically Step 4 or Step 5) and rebuild from there.

### 7.7 Progress banner

```
✅ Step 7 complete — next up: Step 8, Update JIRA Ticket
```

Add a fresh one-sentence encouragement about the MR being live and CI being green.

---

## Step 8 — Update JIRA Ticket

Transition the issue to **Review** and assign it to the MR reviewer using the Atlassian MCP.

### 8.0 Resume guard — JIRA already transitioned

Before running the transition, consult `$JIRA_STATUS` captured in section 1.2 (Check E):

- **If `$JIRA_STATUS` is `Review`**: skip the transition step. Inform the user: *"JIRA ticket is already in 'Review' — skipping transition."* Then proceed directly to the assignee step below (the reviewer may still need to be (re-)assigned).
- **If `$JIRA_STATUS` is a terminal state** (`Resolved`, `Closed`, `Done`, or any other status that represents completion in this project's workflow): skip both the transition and the assignee update. Inform the user: *"JIRA ticket is already in '$JIRA_STATUS' — skipping transition and assignee update; the ticket is past the review hand-off."* Jump directly to the 8.1 progress banner.
- **Otherwise** (`Open`, `Ready for Development`, `In Progress`, etc.): proceed with the transition normally.

### Transition to Review

First, fetch the available transitions to get the correct transition ID:

```
mcp__atlassian__getTransitionsForJiraIssue(cloudId, issueIdOrKey: "$ISSUE_KEY")
```

In the SPASDK workflow the transition is named **"Request Review"** and its target status (`to.name`) is **"Review"**. Pick the transition whose `to.name` is `"Review"` (case-insensitive) and extract its `id`. Then apply it:

```
mcp__atlassian__transitionJiraIssue(cloudId, issueIdOrKey: "$ISSUE_KEY", transition: { id: "<transition-id>" })
```

If no transition leads to "Review", list the available transitions to the user and ask which one to apply.

### Assign to reviewer

Look up the reviewer's Atlassian account ID from their email address (already known from Step 7) using:

```
mcp__atlassian__lookupJiraAccountId(cloudId, searchString: "<reviewer-email>")
```

Then update the assignee field. If `$DOCS_REQUIRED=true`, include `"labels"` in the same call — fetching the ticket's existing labels first and appending `docs-required` to avoid overwriting other labels:

```
# $DOCS_REQUIRED=true — include docs-required label
mcp__atlassian__editJiraIssue(cloudId, issueIdOrKey: "$ISSUE_KEY", fields: {
  assignee: { accountId: "<account-id>" },
  labels: [<existing labels...>, "docs-required"]
})

# $DOCS_REQUIRED=false — assignee only
mcp__atlassian__editJiraIssue(cloudId, issueIdOrKey: "$ISSUE_KEY", fields: { assignee: { accountId: "<account-id>" } })
```

Confirm the changes to the user: transition applied (or skipped), new assignee, and — if `$DOCS_REQUIRED=true` — that the `docs-required` label was added.

### 8.1 Progress banner

```
✅ Step 8 complete — next up: Step 9, Notify Reviewer via Slack
```

Add a fresh one-sentence encouragement about the ticket being officially handed off.

---

## Step 9 — Notify Reviewer via Slack

### 9.0 Slack MCP guard

Recall what was found during Step 0:

- If the **Slack MCP was not found in Step 0**: **skip this step entirely**. Inform the user: *"Slack MCP is not configured — skipping reviewer notification. Please notify `<reviewer name>` manually: `<MR URL>`."* Jump directly to the Completion checklist.
- Otherwise: proceed normally.

### Find reviewer's Slack user

Use `mcp__slack__slack_search_users` to find the reviewer's Slack user ID by GitLab username or display name.

### Draft the Slack message

Compose a concise message. **Show it to the user for approval before sending.**

Template:

```
Hi <reviewer name> 👋 I've just opened an MR for *$ISSUE_KEY* and would love your review.

*What it does*: <one sentence from the ticket summary>

MR: <MR URL>
JIRA: <JIRA issue URL>

Let me know if you have questions!
```

Use `mcp__slack__slack_send_message_draft` to save the draft first, confirm with the user, then send via `mcp__slack__slack_send_message`.

### 9.1 Progress banner

```
✅ Step 9 complete — workflow done.
```

Add a fresh one-sentence encouragement about the whole loop being closed. Vary phrasing.

---

## Step 10 — Address MR Comments (Optional, Repeatable)

This step is triggered automatically by state detection (section 1.2) when an open MR exists with unresolved comment threads, or manually at any time. It fetches all MR comments, analyses them, builds an action plan, and addresses actionable items interactively.

Skip this step entirely if:
- No MR exists (`$MR_IID` is empty), **or**
- `jq` was **not found in Step 0.6** — inform the user: *"`jq` is not installed — Step 10 (MR comment analysis) cannot run. Install it (`brew install jq`, `apt install jq`) and re-run `/fix-issue` to enter Step 10."*

---

### 10.0 CI precondition check

Before touching any comments, verify the Jenkins build for the branch head is green, using the same `jenkins` commit-status check as Step 7.6.

Poll until the status reaches a **definitive terminal state** (same logic as Step 7.6):
- ✅ `success` → build green
- ❌ `failed` / `canceled` → build failed
- ⏳ `pending` / `running` / no status yet → wait 30s and re-check; print *"Jenkins build running… checking again in 30s (N checks so far)"*
- After 20 minutes offer: *"The Jenkins build is taking a while. Skip the CI check and proceed to comments anyway? (not recommended)"*

**If passing**: confirm with *"Jenkins build green — proceeding to comment analysis."* and continue.

**If failing**: do NOT proceed to comment analysis. Instead:

1. **Identify the failing stage** from the Jenkins build (`target_url` of the commit status): `Install`, `Build`, `Lint`, or `Unit tests`.

2. **Fetch the log** via the Jenkins MCP (`mcp__jenkins__getBuildLog` / `mcp__jenkins__searchBuildLog`), or ask the developer to paste it if the MCP is unavailable. Extract the relevant error section — first TypeScript error, first failing test assertion, first lint violation, etc. Do not dump the entire log.

3. **Report** in this format:
   ```
   ## CI Failure Report

   Failed stage: <stage>  (<Jenkins build URL>)
   ─────────────────────────────────────────
   <error excerpt — 5-20 lines, trimmed to the signal>
   ```

4. **Suggest fix** based on the error type:
   - **TypeScript / build error** (`error TS…`, Rollup/Vite/ng-packagr failure) → show the exact file:line from the error, explain what's wrong, propose the specific code fix.
   - **Test failure** (Jest/Vitest) → show the failing test name and the expected/received diff, propose either fixing the implementation or updating the test (with reasoning on which is correct). For an outdated snapshot, only update it (`-u`) if the new output is the intended behaviour.
   - **Lint error** → show the file:line and the rule, propose the fix inline (or `pnpm --filter <package> run lint -- --fix` for auto-fixable rules).
   - **Install / dependency error** (`pnpm install` failed, lockfile out of date) → check that `pnpm-lock.yaml` is committed and matches the `package.json` changes; flag anything else as likely needing manual intervention.
   - **Unknown / infrastructure error** → show the last 20 lines of the log and note this may be a transient CI issue; suggest re-running the build from Jenkins.

5. **Offer options:**
   ```
   CI is failing. How would you like to proceed?
     [f] apply suggested fix, verify locally, commit and push
     [r] re-run the Jenkins build (for transient/infrastructure failures)
     [m] fix manually — I'll pause here; re-run /fix-issue when ready
     [s] skip CI check and proceed to comments anyway (not recommended)
   ```
   - `[f]`: apply the fix, run targeted local verification (Step 5 subset on changed packages), commit (`$ISSUE_KEY fix: CI failure in <stage>`), push, re-poll CI from 10.0.
   - `[r]`: re-trigger the build (Jenkins MCP `mcp__jenkins__rebuildBuild` if available, otherwise ask the developer to click "Rebuild" in Jenkins), wait for result, re-check from 10.0.
   - `[m]`: exit gracefully. Next invocation will re-enter at Step 10.
   - `[s]`: proceed but flag `CI_SKIPPED=true` — the completion checklist will mark this prominently.

---

### 10.1 Fetch MR discussions

Establish project and MR identifiers:

```bash
# $MR_IID is already set from state detection (section 1.2)
PROJECT_PATH=$(git remote get-url origin \
  | sed 's|.*[:/]\(engineering/.*\)\.git|\1|' \
  | sed 's|/|%2F|g')
```

Fetch all discussion threads:

```bash
glab api "projects/${PROJECT_PATH}/merge_requests/${MR_IID}/discussions?per_page=100" --paginate
```

Normalise with `jq` into a flat list (`jq` availability was verified in Step 0.6; Step 10 is skipped entirely if `jq` was missing):

```bash
| jq '[.[] | select(.notes[0].system == false) | {
    discussion_id: .id,
    author: .notes[0].author.username,
    created_at: .notes[0].created_at,
    resolvable: .notes[0].resolvable,
    resolved: .notes[0].resolved,
    kind: (if .notes[0].position == null then "general" else "inline" end),
    file: (.notes[0].position // {} | .new_path),
    line: (.notes[0].position // {} | .new_line),
    head_sha: (.notes[0].position // {} | .head_sha),
    body: .notes[0].body,
    reply_count: (.notes | length),
    all_authors: [.notes[].author.username] | unique
  }]'
```

Filter to **open, resolvable, non-own threads**:
- `resolvable == true && resolved == false`
- Author is not the current GitLab user (skip your own top-level notes)
- Exclude threads where all authors are the current GitLab user (fully self-replied threads)

Separate into:
- **CodeRabbit threads**: author matches `^coderabbit(ai|-ai-bot)?$`
- **Human threads**: everyone else

If there are CodeRabbit threads, check whether CodeRabbit has reviewed the latest commit:

```bash
LAST_COMMIT_TS=$(git log -1 --format=%cI HEAD)
# If no CodeRabbit note has created_at > LAST_COMMIT_TS, CodeRabbit hasn't reviewed HEAD yet
```

If CodeRabbit has **not** reviewed HEAD and human-only comments are present, prompt:
```
CodeRabbit has not yet reviewed the latest commit (<short-sha>, pushed <N> min ago).
  [w] wait up to 5 minutes for CodeRabbit, then proceed
  [n] proceed now with human comments only
  [c] cancel
```
On `[w]`: poll the discussions endpoint every 30 s for up to 5 minutes, then proceed either way.

---

### 10.2 Analyse comments and build action plan

For each open thread, classify it as **Actionable**, **Deferred**, **Question**, or **Already-addressed**.

#### Classification rules

**Already-addressed** (check first):
- Check whether commits exist on the branch that modified the relevant file *after* the comment's `head_sha`:
  ```bash
  git log --oneline <head_sha>..HEAD -- <file_path>
  ```
  If commits exist, flag as possibly-already-addressed and verify: does the current code at `file:line ± 10` satisfy the comment? If yes → **Already-addressed**.
- Also check CodeRabbit's summary note for a "✅ Addressed in commits" section listing the comment — auto-classify those as already-addressed.

**Deferred** (apply if any condition holds):
1. Conflicts with a project convention in `CLAUDE.md` or a package's README/conventions
2. Touches code outside this MR's diff (file unchanged in this branch)
3. Is a CodeRabbit `🧹 Nitpick` that is inconsistent with the style of the surrounding code in the same file
4. Is a CodeRabbit `🛠️ Refactor suggestion` that expands scope beyond the JIRA ticket's stated goals (compare with Step 1 ticket summary)
5. Is factually incorrect about the code's behaviour
6. Is a duplicate of another classified thread

Each deferred classification requires a one-sentence reason.

**Question** (ask developer):
- Comment asks something the skill cannot answer from local context
- Comment has multiple reasonable interpretations
- Comment references runtime/product behaviour that cannot be verified statically (e.g. Experience Manager preview behaviour)

**Actionable**: everything else that has a clear, implementable fix.

#### CodeRabbit severity weighting

Parse the leading marker from CodeRabbit's body:
- `⚠️ Potential issue` or `🔴` → high weight (treat like human reviewer)
- `🛠️ Refactor suggestion` → medium weight
- `🧹 Nitpick` or `💡` → low weight (default to deferred unless it is a trivial one-liner)

---

### 10.3 Present action plan

Present the full plan to the user **before touching any code**. Format:

```
================================================================================
MR Comment Action Plan — !$MR_IID ($ISSUE_KEY)
Fetched N discussions  |  Open: X  |  Resolved: Y
By source: coderabbitai (A)  |  human (B)

────────────────────────────────────────────────────────────────────────────────
ACTIONABLE  (N)
────────────────────────────────────────────────────────────────────────────────
[A1] <inline|general> | <author> (<severity if CodeRabbit>) | <file:line or "general">
     "<comment summary — one line>"
     -> Plan: <what will be changed, which file/function>
     Confidence: <high|medium>

[A2] ...

────────────────────────────────────────────────────────────────────────────────
DEFERRED  (N)  — will be replied + resolved with the stated reason
────────────────────────────────────────────────────────────────────────────────
[D1] <inline|general> | <author> | <file:line>
     "<comment summary>"
     Reason: <one-sentence deferral reason>
     Reply preview: "<exact text that will be posted to the thread>"

────────────────────────────────────────────────────────────────────────────────
ALREADY ADDRESSED  (N)
────────────────────────────────────────────────────────────────────────────────
[X1] <inline|general> | <author> | <file:line>
     "<comment summary>"
     Addressed in: <commit-sha>
     Reply preview: "Already addressed in <sha> — <one-line description of what changed>"

────────────────────────────────────────────────────────────────────────────────
QUESTIONS — need your input before classifying
────────────────────────────────────────────────────────────────────────────────
[Q1] <author> | <file:line or "general">
     "<comment body>"
     Options: (a) <option>  (b) <option>  (c) defer

────────────────────────────────────────────────────────────────────────────────
================================================================================

Approve plan?
  [a] approve and proceed
  [e] edit a classification (re-class any item: A↔D↔Q, or remove)
  [q] answer questions first, then re-show plan
  [x] abort
```

On `[e]`: prompt `Item id (e.g. A3): ` then `New class [A/D/Q/skip]:` and re-render.
On `[q]`: walk through each Q item, collect answers, fold back into plan, re-render.

**Stop and wait for user to approve before proceeding.**

---

### 10.4 Address actionable items interactively

Work through each `[A*]` item one at a time, same pattern as Step 4:

1. Print the original comment in full (author, file:line, body verbatim).
2. Show the planned change as a diff preview.
3. If multiple actionable items are in the **same file**, offer to batch them: *"A2 and A3 both modify image-set.ts — show as one combined diff? [y/n]"*
4. Prompt:
   ```
   [c] apply this fix
   [s] skip (leave thread open)
   [a] adjust (describe change)
   [d] defer instead (enter reason)
   [q] quit step 10
   ```
5. On `[c]`: apply the edit, run targeted local verification for the changed file's package:
   - Jest packages (`spa-sdk`, `react-sdk`, `ng-sdk`): `pnpm --filter <package> run test -- <file-or-pattern>`
   - Vitest packages (`vue-sdk`, `lit-sdk`): `pnpm --filter <package> run test -- <file-or-pattern>`
   - Plus `pnpm --filter <package> run lint` (or `type-check` for `vue-sdk`)
   - If verification passes: mark item done; continue.
   - If verification fails: show failure, offer `[f] fix the failure` / `[s] skip` / `[r] revert this change`.

Record outcome for each item: `done`, `skipped`, `deferred`.

---

### 10.5 Verify, commit, and push

Run after all actionable items are processed (even if some were skipped).

#### Verification (subset of Step 5)

Only run checks for packages changed in this step:

```bash
git diff --name-only HEAD
```

- For each affected package: `build`, `test`, and `lint` (`type-check` for `vue-sdk`), as in Step 5.
- If `spa-sdk` changed, also rebuild the framework SDKs (`pnpm --filter "./packages/*" run build`).
- Skip TypeDoc and example builds unless a public export or an example was touched.

If any check fails: do not commit. Surface the failure, propose a fix (same CI failure analysis as 10.0), and loop back to 10.4 for the relevant item.

#### Commit consent (same rule as Step 6)

Only explicit "commit" / "go ahead and commit" / "proceed with commit" authorises the commit. Soft approvals do not.

Commit message format:

```
$ISSUE_KEY fix: address MR review comments (round $ROUND)

- <one-line summary of A1>
- <one-line summary of A2>
...

Deferred: $DEFERRED_COUNT (replied + resolved on MR)
Already addressed: $ALREADY_COUNT (replied + resolved on MR)

Co-Authored-By: Claude <noreply@anthropic.com>
```

`$ROUND` is determined by counting prior commits on the branch matching the pattern `address MR review comments (round`.

#### Push consent (same rule as Step 7)

Only explicit "push" / "go ahead and push" authorises the push.

**Protected branch guard**: verify `git rev-parse --abbrev-ref HEAD` is not `development` or `main` before pushing. Abort if it is (ABSOLUTE RULE).

```bash
git push
```

---

### 10.6 Post-push: reply and resolve threads

After the push succeeds (so the new SHA exists on the remote), update the MR threads:

- **Actionable items done**: reply `Addressed in <commit-sha> — <one-line description of change>.` then resolve the thread:
  ```bash
  # Reply — write body to a temp file to avoid shell quoting issues
  echo '{"body":"Addressed in <sha> — <description>."}' > /tmp/reply.json
  glab api "projects/${PROJECT_PATH}/merge_requests/${MR_IID}/discussions/${DISCUSSION_ID}/notes" \
    -X POST -H "Content-Type: application/json" --input /tmp/reply.json
  # Resolve
  echo '{"resolved":true}' > /tmp/resolve.json
  glab api "projects/${PROJECT_PATH}/merge_requests/${MR_IID}/discussions/${DISCUSSION_ID}" \
    -X PUT -H "Content-Type: application/json" --input /tmp/resolve.json
  ```
- **Deferred items**: reply with the recorded deferral reason and resolve.
- **Already-addressed items**: reply `Already addressed in <prior-sha> — <description>.` and resolve.
- **Skipped items**: leave open — do not reply.

Print a summary: `N replies posted, M threads resolved, K threads left open (skipped).`

---

### 10.7 Post-push CI check

After the push, wait for the new Jenkins build using the same logic as Step 7.6 (poll the `jenkins` commit status every 30 s, 20-minute max, same failure analysis as 10.0 if it fails).

---

### 10.8 CodeRabbit follow-up

Only if CodeRabbit commented on this MR. After CI passes, poll for a new CodeRabbit review on the pushed commit (up to 5 minutes):

```
Push complete and CI is green.
Checking for CodeRabbit follow-up review…
  [w] wait up to 5 min for CodeRabbit
  [d] done — exit fix-issue
```

On `[w]`: if new CodeRabbit comments appear, automatically increment `$ROUND` and re-enter from 10.1 (round N+1). If none appear within 5 minutes, exit cleanly.

---

### 10.9 Progress banner

```
✅ Step 10 complete (round $ROUND) — $DONE_COUNT addressed, $DEFERRED_COUNT deferred, $SKIPPED_COUNT skipped.
```

Add a fresh one-sentence encouragement about the MR being cleaner. Vary phrasing.

---

## Completion

Output a final checklist:

```
## ✅ Fix-Issue Complete — $ISSUE_KEY

- [x] Environment & tooling preflight passed
- [x] Ticket analysed
- [x] Implementation plan approved
- [x] Branch created: feature/$ISSUE_KEY-<slug>
- [x] Implementation complete (<N> steps)
- [x] All checks passing
- [x] Committed: <commit hash>
- [x] Rebased cleanly onto development
- [x] MR created: <MR URL>
- [x] Jenkins build green: <Jenkins build URL>
- [x] JIRA transitioned to Review, assigned to <reviewer name>
- [x] Reviewer notified: <reviewer name>
```

> If the CI gate was skipped (Step 7.6 maximum-wait override, or `jq` missing), replace the CI line with:
> `- [!] CI check SKIPPED — verify manually: <MR URL>`

> If any step was skipped because state detection (1.2) determined the work was already done, replace the corresponding line with `- [=] Step skipped (already complete from prior run): <detail>` so the developer can see at a glance what was carried over.

> If Step 10 ran, append these lines to the checklist:
> ```
> - [x] MR comments addressed (round N): A done, D deferred, S skipped
> - [!] CI skipped by override during Step 10  (only if CI_SKIPPED=true)
> ```

---

## Encouragement guidance (for all progress banners)

The one-line encouragement after each step's progress banner must be:
- **Genuine** — not corporate cheerfulness, not exclamation-heavy.
- **Varied** — no two encouragements in the same run should reuse phrasing or a template.
- **Specific** — tied to what just happened (e.g. "ticket scope is locked in" after Step 2, "branch is live" after Step 3, "all checks green" after Step 5), not generic ("nice work!").
- **One sentence** — no paragraphs.
- **Slightly dry** — aim for human and quietly competent over peppy.

Do not pre-write the encouragements; compose them fresh at runtime so they fit the actual context of the run.

---

## Conventions Reference

| Item | Convention |
|------|-----------|
| Branch prefix | `feature/` |
| Branch name | `feature/$ISSUE_KEY-short-slug` (lowercase, hyphens) |
| Base branch | `development` |
| MR target | `development` |
| Protected branches | **NEVER** commit, push, or rebase-write to `development` or `main` |
| Commit format | `$ISSUE_KEY <type>: <description>` (feat/fix/refactor/docs/chore/test) |
| Commit consent | Explicit only ("commit", "go ahead and commit", etc.) — no soft approvals |
| Push consent | Explicit only ("push", "go ahead and push", etc.) — no soft approvals |
| Pre-push step | `git fetch origin && git rebase origin/development` |
| Package manager | `pnpm` with `--filter <package>` for targeted operations (do not upgrade the pnpm major) |
| Type check | `pnpm run build` for most packages; `pnpm run type-check` for vue-sdk only |
| Lint | Mandatory — `pnpm --filter <package> run lint` (vue-sdk has no lint script); lint failure is a hard block |
| Imports | Relative paths for modules in the same folder — never import from `'.'` |
| Cross-framework parity | Behaviour exposed by all SDKs is changed in every SDK (react, vue, ng, lit) and example |
| CI gate | Jenkins (`Jenkinsfile`: install → build → lint → test) — read the `jenkins` GitLab commit status; block JIRA update until it is `success` |
| CI failure logs | Jenkins MCP (`getBuildLog`, `searchBuildLog`) via the status `target_url` — verified in Step 0.7 (Tier 3 soft warn) |
| Atlassian MCP check | Verify via `mcp__atlassian__atlassianUserInfo()` first — fall back to `.mcp.json` check only if unreachable |
| MCP tool names | Plain (`mcp__atlassian__*`) or plugin-prefixed (`mcp__plugin_bloomreach-essentials_atlassian__*`) — use whichever is available |
| Dirty tree at start | Check A offers Carry over / Stash / Commit first / Abort; Carry over is recommended when the changes are the ticket's own work |
| Reviewer suggestion | `git log` on changed files → top contributors → GitLab username lookup → user confirms |
| Assignee resolution | `glab api user` — do not assume git name = GitLab username |
| Resume detection | Section 1.2 — runs every invocation; routes to the right step instead of fataling |
| Merge mode | Regular merge (no squash) — individual branch commits are preserved; all must start with `$ISSUE_KEY` |
| MR comment rounds | Step 10 is repeatable; each push increments `$ROUND`; CI gate runs at entry and post-push |
| `jq` requirement | Required for the CI gate and Step 10 — verified in Step 0.6 (Tier 3 soft warn) |
| JIRA updates | Via Atlassian MCP (`getTransitionsForJiraIssue` → "Request Review" → status `Review`; `editJiraIssue`; `lookupJiraAccountId`) |
| JIRA cross-references in commit body | Replace `-` with `_` in non-`$ISSUE_KEY` keys (e.g. `SPASDK-274` → `SPASDK_274`) — prevents GitLab auto-linking |
| Slack notifications | Via Slack MCP (`slack_search_users`, `slack_send_message_draft`, `slack_send_message`) — verified in Step 0.5 (Tier 3 soft warn) |
| Build tools | `node` v20+ and `pnpm` — warned in Step 0.4 (Tier 2); hard block in Step 5 |
| `$DOCS_REQUIRED` | Set in section 1.1; if true, `docs-required` label is applied via `editJiraIssue` in Step 8 |
