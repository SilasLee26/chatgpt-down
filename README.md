# chatgpt-down

Export the current ChatGPT conversation to Markdown from a Chrome extension.

The extension code is shared across platforms and can be developed on macOS or Windows.
This repository now treats Chrome on both platforms as part of one main workflow.

## Features

- One-click export of the active ChatGPT conversation to `.md`
- Text-focused export (no image binary extraction)
- Ordered and unordered list items stay on the same line as their content
- Reduced accidental blank lines in Markdown output
- Better fenced code block export with language handling
- Chat UI-only labels (for example card headers) are filtered from exported content

## Requirements

- Google Chrome (or Chromium-based browser)
- macOS or Windows
- Access to `https://chatgpt.com/*`
- Access to `https://chat.openai.com/*`

## Local Install (Unpacked Extension)

1. Open `chrome://extensions/`.
2. Enable `Developer mode`.
3. Click `Load unpacked`.
4. Select your local clone of this repository.

Example paths:

- macOS: `/Users/your-name/Documents/Playground/chatgpt-down`
- Windows: `D:\projects\chatgpt-down`

## Usage

1. Open a ChatGPT conversation page.
2. Scroll to the top of the conversation first (to reduce lazy-load misses).
3. Click the extension icon.
4. A Markdown file is downloaded automatically.

## Project Files

- `manifest.json`: MV3 extension manifest
- `background.js`: toolbar click handling and message dispatch
- `content.js`: content extraction and Markdown serialization
- `docs/GIT_STRATEGY.md`: branch and release strategy for cross-platform development
- `docs/MACOS_MIGRATION_PLAN.md`: step-by-step migration plan for Chrome on macOS
- `docs/MACOS_TESTING.md`: manual verification checklist for Chrome on macOS

## Open Source

- License: [MIT](LICENSE)
- Changelog: [CHANGELOG.md](CHANGELOG.md)
- Contributing: [CONTRIBUTING.md](CONTRIBUTING.md)
- Code of Conduct: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- Security Policy: [SECURITY.md](SECURITY.md)

## Roadmap

- Validate export behavior on Chrome for macOS
- Keep Markdown formatting behavior consistent across platforms
- Improve regression tests for formatting edge cases
