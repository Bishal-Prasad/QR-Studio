# QR Studio

**A privacy-focused QR code generator built for precision, customization, and batch processing.**

QR Studio is a browser-based QR code workstation built with HTML5, CSS3, and vanilla JavaScript. Generate customizable QR codes, export high-resolution PNGs and true vector SVGs, and process multiple entries into downloadable ZIP archives — all directly in your browser.

- **No backend required**
- **No account or sign-in required**
- **No build step required**
- **Deployable on GitHub Pages**
- **Designed with privacy in mind**

---

## Table of Contents

- [Features](#features)
- [Supported QR Code Types](#supported-qr-code-types)
- [Customization Options](#customization-options)
- [Bulk QR Generation](#bulk-qr-generation)
- [History and Privacy](#history-and-privacy)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Deploying to GitHub Pages](#deploying-to-github-pages)
- [Quality Assurance](#quality-assurance)
- [Known Limitations](#known-limitations)

---

## Features

### 1. High-Quality QR Code Export

**Vector SVG export**
- Generates genuine vector SVG files using individual `<rect>` and `<circle>` elements.
- Does not simply embed a raster image inside an SVG.
- Suitable for scalable graphics and print workflows.

**High-resolution PNG export**
- Renders QR codes using the HTML Canvas API.
- Supports output sizes of 512, 1024, 2048, and up to 4096 pixels.
- Suitable for digital sharing and high-resolution printing.

### 2. Supported QR Code Types

QR Studio supports the following 12 QR code categories:

| QR Type | Purpose |
|---|---|
| Website / URL | Open a website or web page. |
| Plain Text | Display text entered by the user. |
| Wi-Fi | Share network credentials, including supported WPA, WEP, open, and hidden-network options. |
| vCard | Share contact details using the vCard 3.0 format. |
| Email | Open an email application using a `mailto:` link. |
| Phone | Make a phone number available through a `tel:` link. |
| SMS | Prepare a text message using the `SMSTO:` format. |
| WhatsApp | Open a WhatsApp conversation using a `wa.me` link. |
| Social Media | Share a social media profile using its URL. |
| UPI Payment | Create a payment link using the `upi://pay` format. |
| Geo-Location | Represent a geographic location using a `geo:` URI. |
| Calendar Event | Encode event details using the iCalendar `VEVENT` format. |

Each QR type uses a suitable payload format and validation rules for its intended purpose.

### 3. QR Code Customization

Personalize the appearance of your QR codes with the following options:

- **Module patterns:** Square, Rounded, Dots, and Circle.
- **Custom colors:** Choose foreground and background colors using hexadecimal color values.
- **Quiet zone:** Adjust the margin around the QR code from 0 to 6 modules.
- **Error correction:** Choose L, M, Q, or H.
- **Logo support:** Upload or drag and drop a logo into the center of the QR code.
- **Logo safety zones:** Reserve a central area to help maintain scanning reliability.

Error correction levels provide approximate recovery capacities of:

| Level | Approximate recovery |
|---|---:|
| L | 7% |
| M | 15% |
| Q | 25% |
| H | 30% |

Actual scan reliability depends on the QR content, size, contrast, logo coverage, printing quality, and scanning device. Always test a customized QR code before distributing it.

### 4. Bulk QR Code Generation

Generate QR codes for multiple entries in one workflow.

**Input and parsing**
- Paste multiple entries or upload a CSV file.
- Parse CSV data with support for quoted fields, escaped quotation marks, commas, tabs, and embedded newlines.
- Detect headers where possible.
- Report malformed rows and handle empty entries.
- Optionally filter duplicate payloads.

**Batch processing**
- Display progress while generating multiple QR codes.
- Support batch export as PNG, SVG, or both.
- Package generated files into a downloadable ZIP archive.
- Use sanitized, zero-padded filenames for organized output.

**Social Media batch entries**

For Social Media entries in bulk mode, provide a complete profile URL for each row. The bulk generator does not automatically infer a platform from a username.

**Performance note:** Large batches require more browser memory, especially at high output resolutions.

### 5. Local History and Privacy

QR Studio is designed to work entirely on the client side.

- Generate QR codes directly in the browser.
- Keep processing local without requiring a backend service.
- Access previous entries through the History panel.
- Restore a history entry.
- Delete individual history entries.
- Clear all history using the dedicated history-clearing action.
- Protect against local storage quota limits using safeguards and automatic eviction where implemented.

**Privacy note:** Browser-based storage is local to the browser profile and device. It is not equivalent to encrypted storage. Anyone with access to the same browser profile may be able to access saved history. Avoid saving sensitive information on shared devices.

### 6. Design and Accessibility

QR Studio follows the visual design specifications in [`DESIGN.md`](DESIGN.md).

The interface includes:

- Geist typography and a minimalist visual style.
- Light and dark themes with a persistent theme preference.
- An animated Sun/Moon theme switcher.
- An animated Single/Bulk mode selector.
- Keyboard navigation for supported segmented controls.
- Visible keyboard focus indicators.
- Reduced-motion support through `prefers-reduced-motion`.
- Responsive layouts for desktop, tablet, and mobile.

---

## Technology Stack

QR Studio uses standard browser technologies and locally bundled JavaScript libraries.

| Technology | Purpose |
|---|---|
| HTML5 | Page structure and semantic markup. |
| CSS3 | Styling, responsive layout, themes, and animations. |
| Vanilla JavaScript | Application logic, validation, and interaction. |
| `qrcode-generator.min.js` | QR matrix generation. |
| `qrcode.min.js` | QR code utility functions. |
| `jszip.min.js` | In-browser ZIP archive generation. |
| Canvas API | High-resolution PNG rendering. |
| SVG | Scalable vector QR code output. |
| Local Storage | Persistent preferences and history, where implemented. |

No Node.js installation or build process is required to run the static website.

---

## Project Structure

```text
QR Studio/
├── DESIGN.md
├── index.html
├── style.css
├── script.js
├── js/
│   ├── encoders.js
│   ├── renderer.js
│   └── vendor/
│       ├── qrcode-generator.min.js
│       ├── qrcode.min.js
│       └── jszip.min.js
└── README.md
```

**Main files**

- `DESIGN.md` — Design tokens and interface specifications.
- `index.html` — Page structure, form controls, QR workspace, preview, and dialogs.
- `style.css` — Styling, responsive breakpoints, animations, and theme rules.
- `script.js` — Application state, interactions, history, keyboard navigation, and batch processing coordination.
- `js/encoders.js` — QR payload encoders, formatting, and sanitization.
- `js/renderer.js` — SVG generation and high-resolution Canvas rendering.
- `js/vendor/` — Locally bundled QR and ZIP libraries.

---

## Getting Started

### Prerequisites

- A modern browser such as Chrome, Firefox, Safari, or Edge.
- The QR Studio project files.
- Python 3 or Node.js if you want to run a local HTTP server.

No package installation or compilation is required.

### Option 1: Run with Python (Recommended)

Open a terminal in the project directory and run:

```bash
python -m http.server 8000
```

Then open:

<http://localhost:8000>

If the `python` command is unavailable, try:

```bash
python3 -m http.server 8000
```

### Option 2: Run with Node.js

If Node.js is installed, run:

```bash
npx serve .
```

Open the local URL shown in the terminal.

### Option 3: Open the HTML File Directly

You can open `index.html` in a modern browser.

However, some browser security policies may restrict certain file operations, especially image-related Canvas exports. Running a local HTTP server is recommended for more reliable testing.

---

## Deploying to GitHub Pages

QR Studio is designed for static hosting and uses relative asset paths, making it suitable for GitHub Pages project subpaths.

### Step 1: Push the project to GitHub

Initialize a Git repository if necessary, then commit and push your files:

```bash
git add .
git commit -m "Deploy QR Studio"
git push origin main
```

### Step 2: Enable GitHub Pages

1. Open your GitHub repository.
2. Navigate to **Settings → Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Select the `main` branch.
5. Choose the `/ (root)` folder.
6. Click **Save**.

### Step 3: Open your website

After GitHub Pages finishes deploying, your website should be available at:

```text
https://<username>.github.io/<repository-name>/
```

Replace `<username>` and `<repository-name>` with your GitHub username and repository name.

Deployment usually takes a short time, but the first build may take longer.

**Deployment checklist**
- Confirm that `index.html` is in the selected publishing directory.
- Ensure `DESIGN.md`, CSS, JavaScript, and vendor libraries are committed.
- Use relative paths for project assets.
- Open the deployed website and test QR generation, themes, downloads, and batch processing.

---

## Quality Assurance

The original project notes report the following checks as passed. These results should be retained only if they reflect tests actually performed against the current version.

- [x] Payload encoder tests with special-character escaping.
- [x] Rendering of all four QR module patterns in SVG and Canvas.
- [x] High-error-correction logo placement and central safety zones.
- [x] CSV parsing with escaped quotes, commas, newlines, and duplicate filtering.
- [x] ZIP archive creation with multiple files and sanitized filenames.
- [x] Light and dark theme persistence after page reload.
- [x] History restore, individual deletion, and clear-all operations.
- [x] Keyboard navigation for supported tabs and segmented controls.
- [x] Console error checks and relative asset path checks for GitHub Pages compatibility.

For release testing, also verify that generated QR codes can be decoded by a separate QR scanner. Wi-Fi connection, UPI payments, and device-specific behavior should be tested on compatible real devices where possible.

---

## Known Limitations

### Browser Memory

Generating many high-resolution QR codes simultaneously can consume substantial memory. Batches exceeding 1,000 codes at 4096-pixel output may exceed the practical limits of some browsers or devices.

For typical batches of 50–500 codes, performance depends on device specifications, selected resolution, and QR complexity.

### Logo Readability and Scanning

Logos containing fine text or intricate details may lose clarity when placed in the center of a QR code. Large logos or low-contrast designs can also reduce scan reliability.

Use high-contrast logos, keep the central overlay within the supported safety zone, and test the final QR code before printing or sharing it.

### Browser and Device Differences

Native date pickers, download behavior, and camera-based QR scanning can vary between browsers, operating systems, and devices.

### Client-Side Storage

History and preferences stored in the browser may be lost if site data is cleared, the browser profile changes, or storage limits are reached. Local browser storage should not be treated as secure encrypted storage.

---

## Contributing

Contributions and improvements are welcome.

Before submitting changes:

1. Test the affected QR types.
2. Verify SVG, PNG, and ZIP exports where relevant.
3. Check light and dark themes.
4. Test responsive layouts and keyboard accessibility.
5. Confirm that the application still works on GitHub Pages.

Keep dependencies pinned and bundled locally when possible.

---

## License

Add the project's chosen license here before distributing or reusing the code.

---

**QR Studio — Create, customize, and export QR codes with control and privacy.**
