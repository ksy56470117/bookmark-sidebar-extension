// Open the side panel when the toolbar icon is clicked
chrome.action.onClicked.addListener(tab => {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

// Enable side panel on all pages by default
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
