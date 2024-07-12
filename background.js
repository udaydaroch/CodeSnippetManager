chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ snippets: [], tags: [] });
});
