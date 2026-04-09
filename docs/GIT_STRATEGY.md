# Git Strategy

This project is small enough to stay on one shared code line while Chrome behavior remains the same on macOS and Windows.

## Current State

- `main` is the stable shared branch.
- Day-to-day work should happen in short-lived feature branches created from `main`.
- Prefer branch names such as `codex/feat/macos-...`, `codex/fix/macos-...`, `codex/feat/export-...`, or `codex/docs/...`.

## Recommended Workflow

1. Branch from `main`.
2. Keep each branch focused on one change area.
3. Validate the extension manually in Chrome.
4. Open a pull request back into `main`.
5. Tag releases from `main` after the branch is merged.

## When To Split By Platform

Do not create long-lived `platform/windows` or `platform/macos` branches yet.
Introduce them only if one of these becomes true:

- Chrome extension code starts to differ per platform
- Packaging or release assets become platform-specific
- The same fix must be repeatedly cherry-picked between platform variants

## Versioning and Releases

- Use SemVer tags on `main` for shared releases, for example `v0.2.0`.
- Keep release notes explicit about what was verified on macOS and Windows.
- If platform-specific assets are needed later, keep the Git history shared and separate the packaged artifacts in releases.

## Why this model

- Keeps one GitHub repo and one issue tracker.
- Keeps shared logic reuse easy while the codebase is still small.
- Avoids unnecessary branch overhead before real platform divergence appears.
