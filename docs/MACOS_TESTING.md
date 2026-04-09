# macOS Manual Testing

Use this checklist after each macOS-related change before merging to `main`.

## Environment

- macOS with Google Chrome installed
- Extension loaded from `chrome://extensions/` in Developer mode
- Test against both `https://chatgpt.com/` and `https://chat.openai.com/` when possible

## Install and Reload

1. Open `chrome://extensions/`.
2. Enable `Developer mode`.
3. Click `Load unpacked` and select the repository folder.
4. After each code change, click `Reload` on the extension card.

## Functional Checks

1. Open an existing ChatGPT conversation.
2. Scroll near the top so earlier messages are loaded.
3. Click the extension action button.
4. Confirm that a Markdown file downloads successfully.
5. Open the exported file in a macOS editor and confirm the content is readable.

## Content Checks

Verify the exported Markdown keeps the expected structure:

- Conversation title appears as the top heading
- User and assistant messages are separated and ordered correctly
- Ordered and unordered lists stay on one line per item
- Code blocks use fenced Markdown and keep the language label when present
- Tables and links remain readable
- Chinese and English mixed content remains intact

## Filename Checks

- File name is created without illegal characters
- Long conversation titles still produce a usable file name
- The downloaded file opens correctly from Finder

## Regression Notes

Record any page structure changes from ChatGPT that break extraction, especially:

- Missing messages
- Duplicate messages
- UI labels exported as content
- Broken code fences or code language labels
