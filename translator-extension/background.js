// background.js
// Ouvrir le side panel au clic sur l'icône
chrome.runtime.onInstalled.addListener(() => {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
        .catch(() => {
            // Ignorer les erreurs si API indisponible
        });

    chrome.contextMenus.create({
        id: "openDarijaPanel",
        title: "Ouvrir le panneau Darija",
        contexts: ["selection", "page"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "openDarijaPanel" && tab?.windowId) {
        chrome.sidePanel.open({ windowId: tab.windowId });
    }
});