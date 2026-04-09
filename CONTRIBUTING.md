# Contributing

Thanks for your interest in contributing.

## Development Setup

1. Clone the repository.
2. Open `chrome://extensions/` and enable Developer mode.
3. Load this folder as an unpacked extension.
4. Make changes and click Reload on the extension page.
5. If you are testing on macOS, follow the checklist in `docs/MACOS_TESTING.md`.

## Branch and Commit Guidelines

- Create short-lived feature branches from `main`.
- Prefer branch names such as `codex/feat/macos-...`, `codex/fix/macos-...`, or `codex/docs/...`.
- Keep commits focused and descriptive.
- Prefer small pull requests that are easy to review.
- Only create long-lived platform branches if the codebase starts to diverge in a real way.

## Pull Request Checklist

- The change is scoped and documented.
- Manual verification was performed on ChatGPT web pages.
- macOS Chrome was rechecked when behavior, downloads, or file naming changed.
- README or docs are updated if behavior changed.
- No unrelated file changes are included.

## Code Style

- Keep logic readable and avoid unnecessary complexity.
- Preserve existing behavior unless intentionally changed.
- Add comments only when non-obvious logic needs context.
