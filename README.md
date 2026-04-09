# chatgpt-down

Export the current ChatGPT conversation to Markdown from a Chrome extension.

This repository is currently focused on the Windows development workflow.
macOS development will be added in a separate platform flow later.

## Features

- One-click export of the active ChatGPT conversation to `.md`
- Text-focused export (no image binary extraction)
- Ordered and unordered list items stay on the same line as their content
- Reduced accidental blank lines in Markdown output
- Better fenced code block export with language handling
- Chat UI-only labels (for example card headers) are filtered from exported content

## Requirements

- Google Chrome (or Chromium-based browser)
- Access to `https://chatgpt.com/*`
- Access to `https://chat.openai.com/*`

## Local Install (Unpacked Extension)

1. Open `chrome://extensions/`.
2. Enable `Developer mode`.
3. Click `Load unpacked`.
4. Select `D:\projects\chatgpt-down`.

## Usage

1. Open a ChatGPT conversation page.
2. Scroll to the top of the conversation first (to reduce lazy-load misses).
3. Click the extension icon.
4. A Markdown file is downloaded automatically.

## Project Files

- `manifest.json`: MV3 extension manifest
- `background.js`: toolbar click handling and message dispatch
- `content.js`: content extraction and Markdown serialization
- `docs/GIT_STRATEGY.md`: branch and release strategy for Windows/macOS split

## Open Source

- License: [MIT](LICENSE)
- Changelog: [CHANGELOG.md](CHANGELOG.md)
- Contributing: [CONTRIBUTING.md](CONTRIBUTING.md)
- Code of Conduct: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- Security Policy: [SECURITY.md](SECURITY.md)

## Roadmap

- Stabilize Windows export behavior and formatting parity
- Add macOS workflow and branch strategy implementation
- Improve regression tests for formatting edge cases
