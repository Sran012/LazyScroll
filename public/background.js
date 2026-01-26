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

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log("Background received message:", msg);

    if (msg.type === "GET_STATUS") {
        chrome.storage.local.get(['enabled'], (result) => {
            const enabled = result.enabled ?? true;
            console.log("Sending status:", { enabled });
            sendResponse({ enabled });
        });
        return true;
    }

    if (msg.type === "SET_STATUS") {
        const enabled = msg.enabled ?? false;
        chrome.storage.local.set({ enabled }, () => {
            console.log("Updated status to:", enabled);
            sendResponse({ enabled });
        });
        return true;
    }
});
