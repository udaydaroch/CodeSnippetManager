// content.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'insertSnippet') {
    const snippet = request.snippet;
    const codeElement = document.activeElement;

    if (codeElement.tagName === 'TEXTAREA' || (codeElement.tagName === 'INPUT' && codeElement.type === 'text')) {
      const cursorPos = codeElement.selectionStart;
      const textBefore = codeElement.value.substring(0, cursorPos);
      const textAfter = codeElement.value.substring(cursorPos);

      codeElement.value = textBefore + snippet.code + textAfter;
      codeElement.selectionStart = codeElement.selectionEnd = cursorPos + snippet.code.length;
      codeElement.focus();
    }
  }
});
