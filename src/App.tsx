import { useEffect, useState } from "react";

export default function App() {
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  

useEffect(() => {
    const initExtension = () => {
      if (typeof chrome === 'undefined' || !chrome.runtime) {
        setError("Chrome APIs not available");
        return;
      }

      // Wait a bit for background script to be ready
      setTimeout(() => {
        chrome.runtime.sendMessage(
          { type: "GET_STATUS" },
          (res: { enabled: boolean }) => {
            if (chrome.runtime.lastError) {
              console.error("GET_STATUS error:", chrome.runtime.lastError);
              setError("Extension not ready - please reload extension");
            } else {
              setEnabled(res.enabled);
              setError(undefined);
            }
          }
        );
      }, 100);
    };

    initExtension();
  }, []);

  const toggle = () => {
    if (typeof chrome === 'undefined' || !chrome.runtime) {
      setError("Chrome APIs not available");
      return;
    }

    const newEnabled = !enabled;
    
    // Optimistic update
    setEnabled(newEnabled);
    setError(undefined);

    try {
      chrome.runtime.sendMessage(
        { type: "SET_STATUS", enabled: newEnabled },
        (res: { enabled: boolean }) => {
          if (chrome.runtime.lastError) {
            console.error("Message error:", chrome.runtime.lastError);
            // Revert on error
            setEnabled(!newEnabled);
            setError(chrome.runtime.lastError.message || "Unknown error");
          } else {
            setEnabled(res.enabled);
            setError(undefined);
          }
        }
      );
    } catch (err) {
      console.error("Send error:", err);
      // Revert on error
      setEnabled(!newEnabled);
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <h3>LazyScroll</h3>
      <button onClick={toggle}>
        {enabled ? "ON" : "OFF"}
      </button>
      {error && (
        <div style={{ fontSize: 12, color: 'red', marginTop: 8 }}>
          {error}
        </div>
      )}
    </div>
  );
}

