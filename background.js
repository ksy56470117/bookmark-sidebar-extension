// Send toggle message to active tab when toolbar icon is clicked
chrome.action.onClicked.addListener(async tab => {
  // chrome:// and other internal pages can't run content scripts
  if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) return;

  try {
    // Try sending to already-injected content script
    await chrome.tabs.sendMessage(tab.id, { action: 'toggle' });
  } catch {
    // Content script not yet injected — inject then toggle
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
    await chrome.scripting.insertCSS({ target: { tabId: tab.id }, files: ['sidebar.css'] });
    await chrome.tabs.sendMessage(tab.id, { action: 'toggle' });
  }
});

// Handle bookmark requests from content scripts
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.action === 'getBookmarks') {
    chrome.bookmarks.getTree(nodes => sendResponse({ nodes }));
    return true; // keep channel open for async response
  }
});

// Broadcast bookmark changes to all tabs
function broadcastBookmarkChange() {
  chrome.tabs.query({}, tabs => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, { action: 'reloadBookmarks' }).catch(() => {});
    });
  });
}
['onCreated','onRemoved','onChanged','onMoved'].forEach(ev => {
  chrome.bookmarks[ev].addListener(broadcastBookmarkChange);
});
