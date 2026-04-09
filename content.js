(function () {
  const TOP_THRESHOLD_PX = 8;

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type !== "EXPORT_CHAT_MD") {
      return;
    }

    exportConversationAsMarkdown();
  });

  function exportConversationAsMarkdown() {
    const messages = collectMessages();

    if (messages.length === 0) {
      alert("没有找到可导出的聊天内容。请确保已进入对话页面。");
      return;
    }

    const scrollContainer = findScrollContainer(messages[0].element);
    if (scrollContainer && scrollContainer.scrollTop > TOP_THRESHOLD_PX) {
      // alert("建议滚动到最上方浏览过的位置，以确保内容完整加载。");
      // continue anyway for better UX unless strictly necessary
    }

    const title = getConversationTitle();
    const markdown = buildMarkdown(title, messages);
    const filename = `${sanitizeFileName(title)}-${buildTimestamp()}.md`;

    triggerDownload(filename, markdown);
  }

  function collectMessages() {
    // OpenAI sometimes changes structure. [data-message-author-role] is current.
    // article is also a common wrapper.
    const nodes = Array.from(
      document.querySelectorAll("[data-message-author-role], article")
    ).filter((node) => node.querySelector(".markdown") || node.hasAttribute("data-message-author-role"));

    const messages = [];
    let lastContent = "";

    for (const node of nodes) {
      const roleAttr = node.getAttribute("data-message-author-role");
      let role = roleAttr ? roleAttr.toLowerCase() : "unknown";
      
      // If no role attribute but has markdown class inside, try to infer
      if (role === "unknown") {
        if (node.querySelector(".assistant-msg") || node.querySelector(".markdown")) {
          role = "assistant";
        } else {
          role = "user";
        }
      }

      const text = extractMarkdownFromNode(node);
      if (!text || text.length < 1) {
        continue;
      }

      // De-duplicate if necessary
      if (text === lastContent) {
        continue;
      }

      lastContent = text;
      messages.push({ role, text, element: node });
    }

    return messages;
  }

  /**
   * Converts a DOM node to a basic Markdown string to preserve formatting.
   */
  function extractMarkdownFromNode(node) {
    // For assistant messages, we focus on the .markdown container
    const contentContainer = node.querySelector(".markdown") || node;
    
    return elementToMarkdown(contentContainer);
  }

  function elementToMarkdown(element) {
    if (!element) return "";
    
    let markdown = "";

    function isInsideListItem(node) {
      let current = node.parentElement;
      while (current) {
        if (current.tagName === "LI") return true;
        current = current.parentElement;
      }
      return false;
    }

    function isAtListMarker() {
      return /(?:^|\n)\s*(?:-|\d+\.)\s$/.test(markdown);
    }

    function isInsideCode(node) {
      let current = node.parentElement;
      while (current) {
        if (current.tagName === "CODE" || current.tagName === "PRE") return true;
        current = current.parentElement;
      }
      return false;
    }

    function extractLanguage(node) {
      const candidates = [node, node.querySelector("code"), node.parentElement].filter(Boolean);
      for (const el of candidates) {
        const classHit = Array.from(el.classList || []).find((c) => c.startsWith("language-"));
        if (classHit) {
          return classHit.replace("language-", "");
        }
        const dataLang = el.getAttribute && (el.getAttribute("data-language") || el.getAttribute("data-lang"));
        if (dataLang) {
          return dataLang;
        }
      }
      return "";
    }

    const LANGUAGE_LABEL_MAP = {
      py: "python",
      python: "python",
      js: "javascript",
      javascript: "javascript",
      ts: "typescript",
      typescript: "typescript",
      shell: "bash",
      bash: "bash",
      sh: "bash",
      powershell: "powershell",
      ps1: "powershell",
      json: "json",
      yaml: "yaml",
      yml: "yaml",
      sql: "sql",
      html: "html",
      css: "css",
      java: "java",
      kotlin: "kotlin",
      swift: "swift",
      go: "go",
      rust: "rust",
      ruby: "ruby",
      php: "php",
      c: "c",
      "c++": "cpp",
      cpp: "cpp",
      "c#": "csharp",
      csharp: "csharp",
      r: "r",
      dart: "dart",
      scala: "scala"
    };

    function normalizeLangTag(value) {
      if (!value) return "";
      const key = String(value).trim().toLowerCase();
      return LANGUAGE_LABEL_MAP[key] || key;
    }

    function detectLangFromLine(line) {
      if (!line) return "";
      const compact = line
        .trim()
        .toLowerCase()
        .replace(/^language[:\s-]*/i, "")
        .replace(/\s+/g, "");
      return LANGUAGE_LABEL_MAP[compact] || "";
    }

    function isLikelyCodeStart(line) {
      if (!line) return false;
      return /(^\s{2,}|=>|[;{}()[\]=]|^\s*(const|let|var|def|class|import|from|for|while|if|elif|else|function|return|public|private|package|using|select|insert|update|delete|create|with)\b)/i.test(line);
    }

    function isLikelyControlLine(line) {
      if (!line) return false;
      const compact = line.trim().toLowerCase().replace(/\s+/g, " ");
      return /^(run|run code|copy|copy code|edit|preview|\u8fd0\u884c|\u590d\u5236|\u590d\u5236\u4ee3\u7801|\u8fd0\u884c\u4ee3\u7801)$/.test(compact);
    }

    function stripPreUiPreamble(raw, initialLang) {
      const lines = raw.split("\n");
      let lang = normalizeLangTag(initialLang);

      while (lines.length && !lines[0].trim()) {
        lines.shift();
      }

      let topLang = detectLangFromLine(lines[0] || "");
      if (topLang) {
        if (!lang) lang = topLang;
        lines.shift();
      } else if (lang) {
        topLang = detectLangFromLine(lines[0] || "");
        if (topLang && topLang === lang) {
          lines.shift();
        }
      }

      while (lines.length && !lines[0].trim()) {
        lines.shift();
      }

      while (lines.length && isLikelyControlLine(lines[0])) {
        const next = lines[1] || "";
        if (!next || isLikelyCodeStart(next) || !!detectLangFromLine(next)) {
          lines.shift();
          while (lines.length && !lines[0].trim()) {
            lines.shift();
          }
        } else {
          break;
        }
      }

      const codeText = lines.join("\n").replace(/\n+$/g, "");
      return { codeText, lang };
    }

    function fenceFor(codeText) {
      const matches = codeText.match(/`+/g) || [];
      let maxLen = 0;
      for (const run of matches) {
        if (run.length > maxLen) maxLen = run.length;
      }
      return "`".repeat(Math.max(3, maxLen + 1));
    }

    function appendPreBlock(preNode) {
      const codeEl = preNode.querySelector("code") || preNode;
      const initialLang = extractLanguage(preNode);
      const raw = (codeEl.innerText || codeEl.textContent || "")
        .replace(/\r\n/g, "\n")
        .replace(/\u00a0/g, " ");
      const cleaned = stripPreUiPreamble(raw, initialLang);
      const codeText = cleaned.codeText || raw.replace(/\n+$/g, "");
      const lang = cleaned.lang || initialLang;
      const fence = fenceFor(codeText);
      markdown += `\n\n${fence}${lang}\n${codeText}\n${fence}\n`;
    }

    function hasCopyAffordance(node) {
      const controls = Array.from(node.querySelectorAll("button, [role='button']"));
      return controls.some((control) => {
        const hint = [
          control.getAttribute("aria-label") || "",
          control.getAttribute("title") || "",
          control.getAttribute("data-testid") || "",
          control.textContent || ""
        ].join(" ").toLowerCase();
        return /copy|\u590d\u5236|\u62f7\u8d1d/.test(hint);
      });
    }

    function isLikelyCardHeader(node) {
      if (!node || node.nodeType !== Node.ELEMENT_NODE) return false;
      const tagName = node.tagName;
      if (!["DIV", "HEADER", "SECTION"].includes(tagName)) return false;
      if (!hasCopyAffordance(node)) return false;

      // Header rows are short labels like "Writing" and do not contain rich content tags.
      const hasRichContent = node.querySelector("p, ul, ol, li, h1, h2, h3, h4, h5, h6, blockquote, pre, code, table");
      if (hasRichContent) return false;

      const text = (node.textContent || "").replace(/\s+/g, " ").trim();
      return !!text && text.length <= 40;
    }
    
    function walk(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const raw = node.textContent || "";
        if (!raw) return;

        // Keep code content untouched.
        if (isInsideCode(node)) {
          markdown += raw;
          return;
        }

        // Ignore pure formatting whitespace from DOM (common around list blocks).
        if (!/\S/.test(raw)) {
          return;
        }

        let text = raw.replace(/\s+/g, " ");
        if (markdown.endsWith("\n") || markdown.endsWith(" ") || isAtListMarker()) {
          text = text.replace(/^\s+/, "");
        }
        markdown += text;
        return;
      }
      
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      
      const tagName = node.tagName;
      
      // Elements to skip completely
      if (["IMG", "SVG", "VIDEO", "CANVAS", "FIGURE", "BUTTON", "NAV", "STYLE", "SCRIPT"].includes(tagName)) return;
      // Skip hidden or UI elements
      if (node.classList.contains("sr-only") || node.getAttribute("aria-hidden") === "true") return;
      // Skip card/tool headers like "Writing" with a copy button (UI chrome, not message content).
      if (isLikelyCardHeader(node)) return;
      // Serialize code blocks from PRE in one shot to keep structure and avoid UI noise.
      if (tagName === "PRE") {
        appendPreBlock(node);
        return;
      }
      
      switch (tagName) {
        case "H1": markdown += "\n\n# "; break;
        case "H2": markdown += "\n\n## "; break;
        case "H3": markdown += "\n\n### "; break;
        case "H4": markdown += "\n\n#### "; break;
        case "H5": markdown += "\n\n##### "; break;
        case "H6": markdown += "\n\n###### "; break;
        case "P":
          if (!isInsideListItem(node)) {
            markdown += "\n\n";
          }
          break;
        case "BR": markdown += "\n"; break;
        case "BLOCKQUOTE": markdown += "\n\n> "; break;
        case "STRONG":
        case "B":
          markdown += "**";
          break;
        case "EM":
        case "I":
          markdown += "*";
          break;
        case "UL":
        case "OL":
          markdown += "\n";
          break;
        case "LI":
          const parent = node.parentElement;
          if (parent && parent.tagName === "OL") {
            const index = Array.from(parent.children).indexOf(node) + 1;
            markdown += `\n${index}. `;
          } else {
            markdown += "\n- ";
          }
          break;
        case "CODE":
          const inPre = !!node.closest("pre");
          if (!inPre) {
            markdown += "`";
          }
          break;
        case "A":
          markdown += "[";
          break;
        case "TR":
          markdown += "\n| ";
          break;
        case "TH":
        case "TD":
          markdown += " ";
          break;
      }

      // Walk children
      for (const child of node.childNodes) {
        walk(child);
      }

      switch (tagName) {
        case "STRONG":
        case "B":
          markdown += "**";
          break;
        case "EM":
        case "I":
          markdown += "*";
          break;
        case "CODE":
          if (!node.closest("pre")) {
            markdown += "`";
          }
          break;
        case "A":
          markdown += `](${node.getAttribute("href") || ""})`;
          break;
        case "TH":
        case "TD":
          markdown += " |";
          break;
        case "THEAD":
          // Add table divider
          if (node.rows && node.rows.length > 0) {
            const cells = node.rows[0].cells.length;
            markdown += "\n|" + Array(cells).fill(" --- |").join("");
          }
          break;
      }
    }
    
    walk(element);
    
    // Cleanup extra whitespace
    return markdown
      .replace(/((?:^|\n)\s*(?:-|\d+\.)\s*)\n+\s*/g, "$1")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/ +(?=\n)/g, "") // remove trailing spaces
      .trim();
  }

  function findScrollContainer(seedElement) {
    let current = seedElement;
    while (current && current !== document.body) {
      if (isScrollable(current)) return current;
      current = current.parentElement;
    }
    return document.scrollingElement || document.body;
  }

  function isScrollable(element) {
    const styles = window.getComputedStyle(element);
    const overflowY = styles.overflowY;
    const scrollableOverflow = overflowY === "auto" || overflowY === "scroll";
    return scrollableOverflow && element.scrollHeight > element.clientHeight;
  }

  function getConversationTitle() {
    const tabTitle = document.title || "ChatGPT Conversation";
    return tabTitle
      .replace(/\s*[-|]\s*ChatGPT\s*$/i, "")
      .replace(/\s*\(\d+\)\s*$/g, "")
      .trim() || "ChatGPT_Conversation";
  }

  function buildMarkdown(title, messages) {
    const lines = [];
    lines.push(`# ${title}`);
    lines.push("");
    lines.push(`> 导出日期: ${new Date().toLocaleString()}`);
    lines.push("");
    lines.push("---");
    lines.push("");

    messages.forEach((msg, index) => {
      const label = toRoleLabel(msg.role);
      lines.push(`### ${index + 1}. ${label}`);
      lines.push("");
      lines.push(msg.text);
      lines.push("");
      lines.push("---");
      lines.push("");
    });

    return lines.join("\n");
  }

  function toRoleLabel(role) {
    switch (role) {
      case "user":
        return "用户 (User)";
      case "assistant":
        return "助手 (Assistant)";
      default:
        return role.charAt(0).toUpperCase() + role.slice(1);
    }
  }

  function sanitizeFileName(name) {
    return name
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 100) || "chatgpt_conversation";
  }

  function buildTimestamp() {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}`;
  }

  function triggerDownload(filename, content) {
    // Add UTF-8 BOM for better compatibility with Excel/Notepad on Windows
    const blob = new Blob(["\ufeff" + content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    setTimeout(() => URL.revokeObjectURL(url), 100);
  }
})();

