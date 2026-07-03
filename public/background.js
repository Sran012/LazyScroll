// LazyScroll Background Script - Simple Version
console.log("Background script loaded");

// Initialize storage with enabled = true by default
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.get(['enabled'], (result) => {
        if (result.enabled === undefined) {
            chrome.storage.local.set({ enabled: true });
            console.log("Set default enabled to true");
        }
    });
});

