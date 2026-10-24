# QR Studio

A studio-grade, privacy-focused QR code workstation built with HTML5, CSS3, and vanilla JavaScript. Generates crisp, mathematically precise vector SVGs, high-resolution PNGs, and batch ZIP archives directly in your browser.

Deployable instantly on GitHub Pages with zero external backend or telemetry dependencies.

---

## Highlights & Features

- **Mathematical Vector SVGs**: Exports genuine vector `<rect>` and `<circle>` SVG modules—not raster images embedded in an SVG.
- **High-Resolution PNGs**: Canvas rasterizer supporting 512px, 1024px, 2048px, up to 4096px print quality.
- **12 Validated QR Types**: URL, Plain Text, Wi-Fi (WPA/WEP/Open/Hidden), vCard 3.0, Email (`mailto:`), Phone (`tel:`), SMS (`SMSTO:`), WhatsApp (`wa.me`), Social Media profiles, UPI Payment (`upi://pay`), Geo-Location (`geo:`), and iCalendar Events (`VEVENT`).
- **Brand Customization**:
  - 4 Module Patterns: Square, Rounded, Dots, and Circle.
  - Custom foreground and background hex colors.
  - Quiet zone margin control (0 to 6 modules).
  - Error Correction Level selection (L: 7%, M: 15%, Q: 25%, H: 30%).
  - Brand logo drag-and-drop with central cutout safety zones.
- **Bulk Batch Processing**:
  - RFC 4180-compliant parser supporting quoted fields, commas, tabs, and newlines.
  - Intelligent header detection and malformed-row notices.
  - Optional duplicate payload filtering.
  - Multi-threaded rendering simulation with progress percentage feedback.
  - One-click ZIP archive packaging (containing PNGs, SVGs, or both) with zero-padded, sanitized filenames.
  - Social Media batch entries use complete profile URLs (one URL per row); platform + username pairs are not inferred in bulk mode.
- **Local History & Privacy**:
  - 100% client-side: all payloads and images remain strictly in local browser memory.
  - History drawer with one-click **Restore**, individual **Delete**, and **Clear All**.
  - LocalStorage quota protection and automatic eviction safeguards.
- **Design System & A11y**:
  - Follows [DESIGN.md](DESIGN.md) tokens (Geist typography, #fafafa canvas, #171717 ink, hairline borders, and subtle micro-shadows).
  - Rotating Sun/Moon theme switcher with persistent dark/light mode preference.
  - Smooth animated Single/Bulk segmented slider with keyboard arrow navigation.
  - Full `prefers-reduced-motion` and `:focus-visible` accessibility support.

---

## Local Testing

Because QR Studio uses standard vanilla web technologies and pinned local dependencies, no build step or node package installations are required.

### Option 1: Python HTTP Server (Recommended)
```bash
# Python 3
python -m http.server 8000
```
Open `http://localhost:8000` in your web browser.

### Option 2: Node.js (npx serve)
```bash
npx serve .
```

### Option 3: Direct File Opening
You can open `index.html` directly in any modern browser (Chrome, Firefox, Safari, Edge). Note that some browser security policies may restrict Canvas `toBlob()` exports for local `file:///` protocols when reading local image assets; running a local HTTP server is recommended.

---

## GitHub Pages Deployment

QR Studio is built with strictly relative asset paths (`./` and relative file URLs), making it fully compatible with GitHub Pages project subpaths (e.g. `https://<username>.github.io/<repository-name>/`).

### Deployment Steps:
1. Commit and push the repository to GitHub:
   ```bash
   git add .
   git commit -m "Deploy QR Studio"
   git push origin main
   ```
2. In your GitHub repository:
   - Navigate to **Settings** → **Pages**.
   - Under **Build and deployment** > **Source**, choose **Deploy from a branch**.
   - Select branch **`main`** and folder **`/ (root)`**.
   - Click **Save**.
3. Your site will be live at `https://<username>.github.io/<repository-name>/` in about 1–2 minutes.

---

## Project Structure

```text
QR Studio/
├── DESIGN.md              # Design tokens and visual specifications
├── index.html             # Semantic markup, controls, workspace, preview, and modals
├── style.css              # Design tokens, responsive breakpoints, animations, and dark mode
├── script.js              # Runtime state, keyboard navigation, history, and batch coordinator
├── js/
│   ├── encoders.js        # RFC-compliant payload encoders and sanitizers
│   ├── renderer.js        # Precision vector SVG generator and high-res Canvas rasterizer
│   └── vendor/
│       ├── qrcode-generator.min.js # Pinned matrix generator
│       ├── qrcode.min.js           # Pinned canvas/SVG utility
│       └── jszip.min.js            # Pinned in-browser ZIP archive generator
└── README.md              # Comprehensive documentation and deployment guide
```

---

## Quality Assurance & Limitations

### Automated & Manual Tests Passed:
- [x] All 11 payload encoders tested with special character escaping.
- [x] All 4 module pattern styles rendered as valid vector SVG markup and Canvas drawings.
- [x] High-error-correction logo placement tested with safety cutout zones.
- [x] RFC 4180 CSV parser tested with escaped quotes, commas, newlines, and duplicate filtering.
- [x] ZIP archive generation tested with multiple files and clean filenames.
- [x] Light and dark theme persistence tested across page reloads.
- [x] History restore, individual item delete, and clear-all verified.
- [x] Keyboard navigation (`Tab`, `ArrowLeft`, `ArrowRight`, `Enter`, `Space`) verified across all segmented tabs and pills.
- [x] Verified zero console errors and 100% relative asset paths for GitHub Pages subpath compatibility.

### Known Limitations:
- **Client-Side Memory Limits**: Very large bulk batches (>1,000 QR codes rendered simultaneously in 4096px print resolution) are bounded by browser RAM limits. For standard batches of 50–500 codes, rendering runs smoothly without freezing.
- **Logo Visual Density**: Extremely intricate logos with fine text may lose detail when scaled into the center QR cutout. High-contrast, clean geometric logos are recommended for optimal scan reliability.
