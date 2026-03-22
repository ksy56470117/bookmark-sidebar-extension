// Send toggle message to active tab when toolbar icon is clicked
chrome.action.onClicked.addListener(tab => {
  chrome.tabs.sendMessage(tab.id, { action: 'toggle' });
});
