# macOS Migration Plan

This plan keeps the project on one shared Chrome extension code line unless real platform-specific behavior appears.

## Goal

Make the extension reliable to develop and use on macOS Chrome without introducing unnecessary branch complexity.

## Phase 1: Baseline Validation

1. Load the unpacked extension in Chrome on macOS.
2. Export several real ChatGPT conversations.
3. Confirm downloads, file names, and Markdown formatting all behave as expected.
4. Record any macOS-only issues before changing code.

## Phase 2: Documentation and Workflow

1. Update installation docs to include macOS paths and steps.
2. Update contribution guidance to use cross-platform development language.
3. Add a macOS testing checklist for manual regression checks.
4. Keep Git strategy lightweight while the codebase is still shared.

## Phase 3: Compatibility Decisions

Review and decide whether these items need code changes:

- UTF-8 BOM in exported Markdown files
- File name sanitization behavior on macOS
- Any download behavior differences in Chrome on macOS
- Any ChatGPT DOM differences observed during testing

Only change the code when a macOS-specific issue is confirmed.

## Phase 4: Code Changes

If testing reveals real issues, implement fixes in small, isolated commits:

1. One commit for download or encoding behavior
2. One commit for extraction or formatting fixes
3. One commit for documentation updates tied to the behavior change

Keep each commit easy to review and easy to revert.

## Phase 5: Release

1. Re-run the macOS checklist.
2. Merge the feature branch into `main`.
3. Tag the next release from `main`.
4. In release notes, state what was verified on macOS Chrome.

## Git Workflow

Recommended branch flow:

1. Start from `main`
2. Create a short-lived branch such as `codex/feat/macos-chrome-support`
3. Commit in small pieces
4. Push the branch and open a pull request
5. Merge back into `main` after manual verification

## When To Reconsider Platform Branches

Create long-lived platform branches only if:

- the extension logic differs between macOS and Windows
- release packaging must be maintained separately
- or the team repeatedly has to maintain different fixes per platform
