chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) {
    return;
  }

  const chatHosts = ["chatgpt.com", "chat.openai.com"];

  try {
    const hostname = new URL(tab.url || "").hostname;
    if (!chatHosts.includes(hostname)) {
      return;
    }
  } catch {
    return;
  }

  try {
    await chrome.tabs.sendMessage(tab.id, { type: "EXPORT_CHAT_MD" });
  } catch (error) {
    console.error("[chatgpt-down] failed to send export message", error);
  }
});
