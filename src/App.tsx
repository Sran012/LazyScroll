import { useEffect, useState } from "react";

export default function App() {
  const [enabled, setEnabled] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const [bootSequence, setBootSequence] = useState(true);

  useEffect(() => {
    // Simulate a boot sequence effect
    const timer = setTimeout(() => setBootSequence(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const initExtension = () => {
      // In a real environment, we'd check chrome.runtime
      if (typeof chrome === 'undefined' || !chrome.runtime) {
        // For development/preview purposes, just default to true/false without error
        // so the UI can be viewed in browser.
        // setError("Chrome APIs not available"); 
        console.warn("Chrome APIs not checked (dev mode)");
        return;
      }

      setTimeout(() => {
        chrome.storage.local.get(['enabled'], (result) => {
          const isEnabled = (result.enabled !== undefined) ? (result.enabled as boolean) : true;
          setEnabled(isEnabled);
          setError(undefined);
        });
      }, 100);

      // Get voice enabled status from storage
      chrome.storage.local.get(['voiceEnabled'], (result) => {
        if (result.voiceEnabled !== undefined) {
          setVoiceEnabled(result.voiceEnabled as boolean);
        } else {
          // Set default to true
          chrome.storage.local.set({ voiceEnabled: true });
          setVoiceEnabled(true);
        }
      });
    };

    initExtension();
  }, []);

  const toggle = () => {
    if (typeof chrome === 'undefined' || !chrome.runtime) {
      // Dev mode toggle
      setEnabled(!enabled);
      return;
    }

    const newEnabled = !enabled;
    setEnabled(newEnabled);
    setError(undefined);

    chrome.storage.local.set({ enabled: newEnabled }, () => {
      if (chrome.runtime.lastError) {
        setEnabled(!newEnabled);
        setError("Storage Failed");
      }
    });
  };

  const toggleVoice = () => {
    const newVoiceEnabled = !voiceEnabled;
    setVoiceEnabled(newVoiceEnabled);
    chrome.storage.local.set({ voiceEnabled: newVoiceEnabled });
  };

  if (bootSequence) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gaming-black text-gaming-red">
        <div className="animate-pulse text-xl tracking-[0.2em] font-bold">INITIALIZING...</div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-gaming-black p-6 text-white selection:bg-gaming-red selection:text-white">
      {/* Background Decor */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(255,0,0,0.02),rgba(255,0,0,0.06))] bg-[length:100%_4px,6px_100%] opacity-20" />
      <div className="pointer-events-none absolute top-0 left-0 h-16 w-16 border-t-2 border-l-2 border-gaming-red opacity-50" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-16 w-16 border-b-2 border-r-2 border-gaming-red opacity-50" />

      {/* Header */}
      <header className="mb-8 flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 animate-pulse bg-gaming-red shadow-[0_0_8px_#ff3333]" />
          <h1 className="text-2xl font-black tracking-wider text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">
            LAZY<span className="text-gaming-red">SCROLL</span>
          </h1>
        </div>
        <div className="text-[10px] text-white/40 font-mono">V.1.0</div>
      </header>

      {/* Main Control */}
      <main className="flex flex-1 flex-col items-center justify-center gap-8 relative z-10">

        {/* Status Display */}
        <div className="text-center space-y-2">
          <div className="text-xs tracking-[0.3em] text-white/50 uppercase">System Status</div>
          <div className={`text-4xl font-black tracking-widest transition-all duration-300 ${enabled
            ? "text-gaming-red drop-shadow-[0_0_15px_rgba(255,51,51,0.8)]"
            : "text-white/20"
            }`}>
            {enabled ? "ACTIVE" : "STANDBY"}
          </div>
        </div>

        {/* Voice Command Indicator */}
        <div className="text-center space-y-2">
          <div className="text-xs tracking-[0.3em] text-white/50 uppercase">Voice Control</div>
          <button
            onClick={toggleVoice}
            className={`px-4 py-2 rounded text-sm font-bold tracking-wider transition-all duration-300 ${
              voiceEnabled
                ? "bg-gaming-red text-black shadow-[0_0_15px_rgba(255,51,51,0.5)]"
                : "bg-white/10 text-white/60 hover:bg-white/20"
            }`}
          >
            {voiceEnabled ? "🎤 LISTENING" : "🔇 MUTED"}
          </button>
          {voiceEnabled && (
            <div className="text-[10px] text-white/40 mt-1">
              Say <span className="text-gaming-red font-bold">"next"</span> or <span className="text-gaming-red font-bold">"prev"</span>
            </div>
          )}
        </div>

        {/* The Button */}
        <button
          onClick={toggle}
          className={`
            group relative flex h-20 w-48 items-center justify-center overflow-hidden
            border-2 transition-all duration-300 ease-out
            ${enabled
              ? "border-gaming-red bg-gaming-surface shadow-[0_0_30px_rgba(255,51,51,0.3)]"
              : "border-white/20 bg-black hover:border-gaming-red/50"
            }
          `}
        >
          {/* Button Background/Glow Effects */}
          <div className={`absolute inset-0 bg-gaming-red/10 transition-transform duration-300 ${enabled ? "scale-100" : "scale-0"}`} />

          {/* Corner accents for the button */}
          <div className="absolute top-0 right-0 h-2 w-2 bg-gaming-red" />
          <div className="absolute bottom-0 left-0 h-2 w-2 bg-gaming-red" />

          {/* Text */}
          <span className={`relative z-10 text-lg font-bold tracking-widest transition-colors ${enabled ? "text-white" : "text-white/60 group-hover:text-gaming-red"}`}>
            {enabled ? "DISENGAGE" : "ENGAGE"}
          </span>
        </button>

        {/* Error Message */}
        {error && (
          <div className="absolute bottom-4 left-0 right-0 text-center animate-bounce">
            <span className="bg-gaming-red/20 border border-gaming-red px-3 py-1 text-xs text-gaming-red">
              ⚠ {error}
            </span>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto pt-6 flex flex-col gap-2 items-center text-[10px] uppercase tracking-widest relative z-10 w-full border-t border-white/5">

        {/* Links Container */}
        <div className="flex items-center justify-between w-full px-2">

          {/* Repo Link */}
          <a
            href="https://github.com/Sran012/LazyScroll"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 text-white/40 hover:text-white transition-colors duration-300"
          >
            <div className="p-1 border border-white/20 group-hover:border-gaming-red group-hover:bg-gaming-red/10 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <span className="group-hover:text-gaming-red transition-colors">Star It</span>
          </a>

          {/* Author Link */}
          <a
            href="https://github.com/Sran012"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2 text-white/40 hover:text-white transition-colors duration-300"
          >
            <span>Built with <span className="text-gaming-red">♥</span> by Sujal</span>
          </a>

        </div>

        {/* <div className="text-[9px] text-white/10 mt-1">
          Neural Interface // Connected
        </div> */}
      </footer>
    </div>
  );
}
