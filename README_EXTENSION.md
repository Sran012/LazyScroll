# LazyScroll Chrome Extension

## Development

1. Run `npm run build:extension` to build all extension components
2. Load the `/dist` folder as an unpacked extension in Chrome
3. Test on YouTube Shorts

## Chrome Extension Installation

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `/dist` folder
4. The extension should appear in your extensions list
5. Visit YouTube Shorts to test the functionality

## Files Structure

- `background.ts` - Service worker for extension state management
- `content.ts` - Content script injected into YouTube pages
- `src/App.tsx` - React popup UI
- `manifest.json` - Extension configuration