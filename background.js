const CHAT_HOSTS = new Set(["chatgpt.com", "chat.openai.com"]);

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) {
    return;
  }

  try {
    const hostname = new URL(tab.url || "").hostname;
    if (!CHAT_HOSTS.has(hostname)) {
      return;
    }
  } catch {
    return;
  }

  try {
    await sendExportMessage(tab.id);
  } catch (error) {
    console.error("[chatgpt-down] failed to send export message", error);
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "DOWNLOAD_MARKDOWN") {
    return false;
  }

  void (async () => {
    try {
      const pageUrl = message.pageUrl || sender.tab?.url || "";
      if (!isAllowedChatPage(pageUrl)) {
        throw new Error("Download request did not come from an allowed ChatGPT page.");
      }

      const downloadId = await downloadMarkdownFile(message.filename, message.content);
      sendResponse({ ok: true, downloadId });
    } catch (error) {
      console.error("[chatgpt-down] failed to download markdown", error);
      sendResponse({
        ok: false,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  })();

  return true;
});

function isAllowedChatPage(url) {
  try {
    const hostname = new URL(url).hostname;
    return CHAT_HOSTS.has(hostname);
  } catch {
    return false;
  }
}

async function downloadMarkdownFile(filename, content) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const objectUrl = URL.createObjectURL(blob);

  try {
    return await chrome.downloads.download({
      url: objectUrl,
      filename,
      saveAs: false
    });
  } finally {
    setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
  }
}

async function sendExportMessage(tabId) {
  try {
    await chrome.tabs.sendMessage(tabId, { type: "EXPORT_CHAT_MD" });
  } catch (error) {
    if (!isMissingReceiverError(error)) {
      throw error;
    }

    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.js"]
    });

    await chrome.tabs.sendMessage(tabId, { type: "EXPORT_CHAT_MD" });
  }
}

function isMissingReceiverError(error) {
  const message = error instanceof Error ? error.message : String(error || "");
  return message.includes("Receiving end does not exist");
}
