# Git Strategy (Windows First, macOS Next)

This project currently ships from Windows only.

## Current State

- `main` is the active development branch for the Windows version.
- Use feature branches named `feat/windows-...` or `fix/windows-...`.

## When macOS starts

Use one repository with branch separation:

- Keep `main` as the shared and stable baseline.
- Create long-lived platform branches: `platform/windows` and `platform/macos`.

Workflow:

1. Shared logic goes to `main` first.
2. Platform-only changes go to the matching platform branch.
3. Regularly merge `main` into platform branches to stay aligned.

## Versioning and Releases

- Use SemVer tags on `main` for shared releases, for example `v0.2.0`.
- For platform-specific releases, add annotated tags, for example `windows-v0.2.0` and `macos-v0.2.0`.

## Why this model

- Keeps one GitHub repo and one issue tracker.
- Makes shared logic reuse easier.
- Keeps platform divergence explicit and manageable.
