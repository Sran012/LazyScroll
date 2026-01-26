// LazyScroll Content Script - Using YouTube's Navigation Events
console.log("LazyScroll injected");

// State
let activeVideo = null;
let currentShortId = null;
let hasSkipped = false;
let enabled = true;
let isSkipping = false; // Add safe lock

function getShortIdFromUrl() {
    const match = window.location.href.match(/\/shorts\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
}

function detectVideo() {
    const videos = document.querySelectorAll("video");
    const newShortId = getShortIdFromUrl();

    for (const v of videos) {
        if (!v.paused && v.currentTime > 0) {
            // Check if we are actually on a new short ID
            if (newShortId && newShortId !== currentShortId) {
                currentShortId = newShortId;
                activeVideo = v;
                hasSkipped = false;
                isSkipping = false;
                console.log("New Short detected: ", currentShortId);
            }
            // Fallback for first load if id is same but video changed (rare)
            else if (!activeVideo) {
                activeVideo = v;
            }
            return;
        }
    }
}

setInterval(detectVideo, 500);

// Get initial status from storage
chrome.storage.local.get(['enabled'], (result) => {
    if (result.enabled !== undefined) {
        enabled = result.enabled;
    }
    console.log("LazyScroll initial enabled:", enabled);
});

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local' && changes.enabled) {
        enabled = changes.enabled.newValue;
        console.log("LazyScroll enabled changed to:", enabled);
    }
});

// Listen for YouTube's internal navigation events
window.addEventListener('yt-navigate-start', () => {
    console.log("YouTube navigation started");
    isSkipping = false;
});

window.addEventListener('yt-navigate-finish', () => {
    console.log("YouTube navigation finished");
    // State reset is handled in detectVideo now via URL check
});

function goToNextShort() {
    if (isSkipping) return;
    isSkipping = true;

    console.log("Attempting to skip to next short...");

    // Method 1: Click the down navigation button (most reliable for YouTube Shorts)
    const downButton = document.querySelector('#navigation-button-down button');
    if (downButton) {
        console.log("Clicking down navigation button");
        downButton.click();
        return;
    }

    // Method 2: Try to find any down/next button
    const nextButtons = document.querySelectorAll('[aria-label*="Next"], [aria-label*="next"], .navigation-button-down button');
    for (const btn of nextButtons) {
        if (btn.offsetParent !== null) {
            console.log("Clicking next button:", btn);
            btn.click();
            return;
        }
    }

    // Method 3: Dispatch YouTube's custom navigation event
    console.log("Dispatching yt-navigate event");
    const currentUrl = window.location.href;
    if (currentUrl.includes('/shorts/')) {
        // Try to trigger YouTube's internal navigation
        const ytdApp = document.querySelector('ytd-app');
        if (ytdApp) {
            ytdApp.dispatchEvent(new CustomEvent('yt-action', {
                bubbles: true,
                detail: { actionName: 'yt-next-continuation-item' }
            }));
        }
    }

    // Method 4: Fallback - simulate keyboard
    console.log("Using keyboard fallback");
    const shortsPlayer = document.querySelector('ytd-shorts, #shorts-player');
    if (shortsPlayer) {
        shortsPlayer.focus();
    }

    document.dispatchEvent(new KeyboardEvent("keydown", {
        key: "ArrowDown",
        code: "ArrowDown",
        keyCode: 40,
        which: 40,
        bubbles: true,
        cancelable: true,
        view: window
    }));
}

setInterval(() => {
    if (!activeVideo || !activeVideo.duration) return;

    const progress = activeVideo.currentTime / activeVideo.duration;

    // Only log distinct progress points to avoid spam
    if (Math.floor(progress * 100) % 10 === 0) {
        // console.log("Progress:", progress.toFixed(2));
    }

    if (progress > 0.8 && !hasSkipped && !isSkipping) {
        if (enabled) {
            hasSkipped = true;
            console.log(">> SKIPPING SHORT (80% reached) <<");
            goToNextShort();
        } else {
            // Avoid spamming the "disabled" log
            if (!hasSkipped) {
                console.log("[LazyScroll] Would skip now, but extension is DISABLED. Toggle it in the popup!");
                // Mark as skipped so we don't spam this log either for this video
                hasSkipped = true;
            }
        }
    }
}, 1000);
