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
