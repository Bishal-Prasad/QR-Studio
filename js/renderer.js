/**
 * QR Studio — Precision Vector SVG & Canvas PNG QR Renderer
 * Generates mathematically clean vector SVGs and hi-res raster PNGs.
 * Supports square, rounded, dots, and circle module styles, quiet zone margins,
 * custom colors, and center brand logos with clear safety zones.
 */

window.QRRenderer = {
  /**
   * Generates a QR matrix using the bundled qrcode-generator engine.
   * @param {string} text - Payload to encode
   * @param {string} ecc - Error Correction Level ('L', 'M', 'Q', 'H')
   * @returns {{ count: number, matrix: boolean[][] }}
   */
  createMatrix: function (text, ecc = 'M') {
    if (typeof qrcode === 'undefined') {
      throw new Error('qrcode-generator engine is not loaded.');
    }
    // TypeNumber 0 tells the generator to automatically select the optimal QR version (1 to 40)
    const qr = qrcode(0, ecc);
    qr.addData(text);
    qr.make();
    const count = qr.getModuleCount();
    const matrix = [];
    for (let r = 0; r < count; r++) {
      const row = [];
      for (let c = 0; c < count; c++) {
        row.push(qr.isDark(r, c));
      }
      matrix.push(row);
    }
    return { count, matrix };
  },

  /**
   * Generates a genuine vector SVG string.
   */
  renderSVGString: function (matrixData, options = {}) {
    const { count, matrix } = matrixData;
    const fg = options.fg || '#171717';
    const bg = options.bg || '#ffffff';
    const margin = options.margin !== undefined ? Number(options.margin) : 2;
    const pattern = options.pattern || 'square';
    const logo = options.logo || null;

    const totalModules = count + margin * 2;
    const cellSize = 10;
    const totalSize = totalModules * cellSize;

    // Finder pattern positions (7x7 in 3 corners)
    function isFinder(r, c) {
      if (r < 7 && c < 7) return true; // Top-left
      if (r < 7 && c >= count - 7) return true; // Top-right
      if (r >= count - 7 && c < 7) return true; // Bottom-left
      return false;
    }

    // Logo safety zone (central 22%-26% area)
    let logoModules = 0;
    if (logo) {
      logoModules = Math.floor(count * 0.25);
      if (logoModules % 2 === 0) logoModules++;
    }
    const logoStart = Math.floor((count - logoModules) / 2);
    const logoEnd = logoStart + logoModules;

    function inLogoZone(r, c) {
      if (!logo) return false;
      return r >= logoStart && r < logoEnd && c >= logoStart && c < logoEnd;
    }

    const paths = [];

    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        if (!matrix[r][c]) continue;
        if (inLogoZone(r, c)) continue;

        const x = (c + margin) * cellSize;
        const y = (r + margin) * cellSize;

        if (isFinder(r, c)) {
          // Corner finders remain crisp squares or subtly softened for 100% scan reliability
          if (pattern === 'rounded' || pattern === 'circle' || pattern === 'dots') {
            paths.push(`<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2" ry="2" fill="${fg}" />`);
          } else {
            paths.push(`<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${fg}" />`);
          }
        } else {
          // Data modules
          if (pattern === 'dots') {
            const cx = x + cellSize / 2;
            const cy = y + cellSize / 2;
            const radius = (cellSize / 2) * 0.85;
            paths.push(`<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${fg}" />`);
          } else if (pattern === 'circle') {
            const cx = x + cellSize / 2;
            const cy = y + cellSize / 2;
            const radius = (cellSize / 2) * 0.96;
            paths.push(`<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${fg}" />`);
          } else if (pattern === 'rounded') {
            const rx = cellSize * 0.35;
            paths.push(`<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="${rx}" ry="${rx}" fill="${fg}" />`);
          } else {
            // Standard crisp square
            paths.push(`<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${fg}" />`);
          }
        }
      }
    }

    let logoSvg = '';
    if (logo) {
      const lx = (logoStart + margin) * cellSize;
      const ly = (logoStart + margin) * cellSize;
      const lsize = logoModules * cellSize;
      const pad = 3;
      logoSvg = `
        <rect x="${lx - pad}" y="${ly - pad}" width="${lsize + pad * 2}" height="${lsize + pad * 2}" rx="4" fill="${bg}" />
        <image href="${logo}" x="${lx}" y="${ly}" width="${lsize}" height="${lsize}" preserveAspectRatio="xMidYMid meet" />
      `;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="100%" height="100%">
  <rect width="${totalSize}" height="${totalSize}" fill="${bg}" />
  ${paths.join('')}
  ${logoSvg}
</svg>`;
  },

  /**
   * Renders the QR code directly onto a Canvas element at a designated target resolution (e.g. 1024x1024).
   */
  renderCanvas: function (matrixData, options = {}, targetSize = 1024) {
    const { count, matrix } = matrixData;
    const fg = options.fg || '#171717';
    const bg = options.bg || '#ffffff';
    const margin = options.margin !== undefined ? Number(options.margin) : 2;
    const pattern = options.pattern || 'square';
    const logoImg = options.logoImageElement || null;

    const canvas = document.createElement('canvas');
    canvas.width = targetSize;
    canvas.height = targetSize;
    const ctx = canvas.getContext('2d');

    // Fill background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, targetSize, targetSize);

    const totalModules = count + margin * 2;
    const cellSize = targetSize / totalModules;

    function isFinder(r, c) {
      if (r < 7 && c < 7) return true;
      if (r < 7 && c >= count - 7) return true;
      if (r >= count - 7 && c < 7) return true;
      return false;
    }

    let logoModules = 0;
    if (logoImg) {
      logoModules = Math.floor(count * 0.25);
      if (logoModules % 2 === 0) logoModules++;
    }
    const logoStart = Math.floor((count - logoModules) / 2);
    const logoEnd = logoStart + logoModules;

    function inLogoZone(r, c) {
      if (!logoImg) return false;
      return r >= logoStart && r < logoEnd && c >= logoStart && c < logoEnd;
    }

    ctx.fillStyle = fg;

    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) {
        if (!matrix[r][c]) continue;
        if (inLogoZone(r, c)) continue;

        const x = (c + margin) * cellSize;
        const y = (r + margin) * cellSize;

        if (isFinder(r, c)) {
          if (pattern === 'rounded' || pattern === 'circle' || pattern === 'dots') {
            const rad = cellSize * 0.2;
            ctx.beginPath();
            ctx.roundRect(x, y, cellSize, cellSize, rad);
            ctx.fill();
          } else {
            ctx.fillRect(x, y, cellSize, cellSize);
          }
        } else {
          if (pattern === 'dots') {
            const cx = x + cellSize / 2;
            const cy = y + cellSize / 2;
            const rad = (cellSize / 2) * 0.85;
            ctx.beginPath();
            ctx.arc(cx, cy, rad, 0, Math.PI * 2);
            ctx.fill();
          } else if (pattern === 'circle') {
            const cx = x + cellSize / 2;
            const cy = y + cellSize / 2;
            const rad = (cellSize / 2) * 0.96;
            ctx.beginPath();
            ctx.arc(cx, cy, rad, 0, Math.PI * 2);
            ctx.fill();
          } else if (pattern === 'rounded') {
            const rad = cellSize * 0.35;
            ctx.beginPath();
            ctx.roundRect(x, y, cellSize, cellSize, rad);
            ctx.fill();
          } else {
            ctx.fillRect(x, y, cellSize, cellSize);
          }
        }
      }
    }

    // Draw logo if present
    if (logoImg) {
      const lx = (logoStart + margin) * cellSize;
      const ly = (logoStart + margin) * cellSize;
      const lsize = logoModules * cellSize;
      const pad = cellSize * 0.25;

      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.roundRect(lx - pad, ly - pad, lsize + pad * 2, lsize + pad * 2, cellSize * 0.4);
      ctx.fill();

      try {
        ctx.drawImage(logoImg, lx, ly, lsize, lsize);
      } catch (err) {
        console.warn('Could not draw logo onto canvas:', err);
      }
    }

    return canvas;
  }
};
