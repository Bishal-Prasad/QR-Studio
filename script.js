/**
 * QR Studio — UI Controller & Single Mode Generator
 * Handles theme toggle, tab navigation, real-time payload encoding,
 * live QR matrix rendering, customization options, and PNG/SVG exports.
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. Theme Management (Light / Dark with animated icon rotation)
  // =========================================================================
  const STORAGE_KEY_THEME = 'qr_studio_theme';
  const STORAGE_KEY_HISTORY = 'qr_studio_history';
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeSunIcon = document.getElementById('theme-sun-icon');
  const themeMoonIcon = document.getElementById('theme-moon-icon');

  function getPreferredTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
    if (savedTheme) {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);

    if (theme === 'dark') {
      if (themeSunIcon && themeMoonIcon) {
        themeMoonIcon.style.display = 'none';
        themeMoonIcon.classList.remove('spin-in');
        themeMoonIcon.classList.add('spin-out');

        themeSunIcon.style.display = 'block';
        themeSunIcon.classList.remove('spin-out');
        themeSunIcon.classList.add('spin-in');
      }
      if (themeToggleBtn) {
        themeToggleBtn.setAttribute('aria-label', 'Switch to light mode');
      }
    } else {
      if (themeSunIcon && themeMoonIcon) {
        themeSunIcon.style.display = 'none';
        themeSunIcon.classList.remove('spin-in');
        themeSunIcon.classList.add('spin-out');

        themeMoonIcon.style.display = 'block';
        themeMoonIcon.classList.remove('spin-out');
        themeMoonIcon.classList.add('spin-in');
      }
      if (themeToggleBtn) {
        themeToggleBtn.setAttribute('aria-label', 'Switch to dark mode');
      }
    }
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY_THEME, nextTheme);
    applyTheme(nextTheme);
  }

  // Initial theme setup
  applyTheme(getPreferredTheme());

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
  }

  // =========================================================================
  // 2. Segmented Mode Control (Single vs Bulk) with Keyboard Nav
  // =========================================================================
  const singleBtn = document.getElementById('mode-single-btn');
  const bulkBtn = document.getElementById('mode-bulk-btn');
  const segmentedThumb = document.getElementById('segmented-thumb');
  const singlePanel = document.getElementById('panel-single');
  const bulkPanel = document.getElementById('panel-bulk');
  const downloadZipBtn = document.getElementById('download-zip-btn');

  function setMode(mode) {
    if (mode === 'bulk') {
      if (singleBtn) {
        singleBtn.classList.remove('is-active');
        singleBtn.setAttribute('aria-selected', 'false');
        singleBtn.setAttribute('tabindex', '-1');
      }
      if (bulkBtn) {
        bulkBtn.classList.add('is-active');
        bulkBtn.setAttribute('aria-selected', 'true');
        bulkBtn.setAttribute('tabindex', '0');
        bulkBtn.focus();
      }
      if (segmentedThumb) {
        segmentedThumb.style.transform = 'translateX(100%)';
      }
      if (singlePanel) singlePanel.style.display = 'none';
      if (bulkPanel) bulkPanel.style.display = 'block';
      if (downloadZipBtn) downloadZipBtn.style.display = 'inline-flex';
    } else {
      if (bulkBtn) {
        bulkBtn.classList.remove('is-active');
        bulkBtn.setAttribute('aria-selected', 'false');
        bulkBtn.setAttribute('tabindex', '-1');
      }
      if (singleBtn) {
        singleBtn.classList.add('is-active');
        singleBtn.setAttribute('aria-selected', 'true');
        singleBtn.setAttribute('tabindex', '0');
        singleBtn.focus();
      }
      if (segmentedThumb) {
        segmentedThumb.style.transform = 'translateX(0)';
      }
      if (singlePanel) singlePanel.style.display = 'block';
      if (bulkPanel) bulkPanel.style.display = 'none';
      if (downloadZipBtn) downloadZipBtn.style.display = 'none';
    }
  }

  if (singleBtn) {
    singleBtn.addEventListener('click', () => setMode('single'));
    singleBtn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        setMode('bulk');
      }
    });
  }

  if (bulkBtn) {
    bulkBtn.addEventListener('click', () => setMode('bulk'));
    bulkBtn.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        setMode('single');
      }
    });
  }

  // =========================================================================
  // 3. QR Types Navigation & Selection (with Animated Indicator)
  // =========================================================================
  const typeNav = document.getElementById('qr-type-nav');
  const typeNavIndicator = document.getElementById('type-nav-indicator');
  const typePills = document.querySelectorAll('.type-pill');
  const typeForms = document.querySelectorAll('.type-form-block');
  let currentActiveType = 'url';

  function updateIndicator(activeBtn, animate = true) {
    if (!typeNavIndicator || !typeNav || !activeBtn) return;

    const navRect = typeNav.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();

    // Calculate left offset relative to scroll container
    const offsetLeft = activeBtn.offsetLeft;
    const width = activeBtn.offsetWidth;

    if (!animate) {
      typeNavIndicator.style.transition = 'none';
    } else {
      typeNavIndicator.style.transition = '';
    }

    typeNavIndicator.style.width = `${width}px`;
    typeNavIndicator.style.transform = `translateX(${offsetLeft}px)`;
    typeNavIndicator.style.opacity = '1';

    // Mark pills as animated so fallback styles are suppressed
    typePills.forEach((p) => p.setAttribute('data-animated', 'true'));

    // Ensure button is scrolled into view smoothly if partially out of view
    if (activeBtn.scrollIntoView) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
  }

  function selectType(type, animate = true) {
    currentActiveType = type;
    let activePill = null;

    typePills.forEach((pill) => {
      const isActive = pill.getAttribute('data-type') === type;
      pill.classList.toggle('is-active', isActive);
      pill.setAttribute('aria-selected', isActive ? 'true' : 'false');
      pill.setAttribute('tabindex', isActive ? '0' : '-1');
      if (isActive) activePill = pill;
    });

    if (activePill) {
      updateIndicator(activePill, animate);
    }

    typeForms.forEach((form) => {
      form.style.display = form.id === `form-${type}` ? 'block' : 'none';
    });

    // Re-generate QR for new type
    updateSingleQR();
  }

  typePills.forEach((pill, idx) => {
    pill.addEventListener('click', () => {
      const type = pill.getAttribute('data-type');
      selectType(type, true);
    });

    pill.addEventListener('keydown', (e) => {
      let targetIdx = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        targetIdx = (idx + 1) % typePills.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        targetIdx = (idx - 1 + typePills.length) % typePills.length;
      } else if (e.key === 'Home') {
        targetIdx = 0;
      } else if (e.key === 'End') {
        targetIdx = typePills.length - 1;
      }

      if (targetIdx !== null) {
        e.preventDefault();
        typePills[targetIdx].click();
        typePills[targetIdx].focus();
      }
    });
  });

  // Re-align indicator on window resize
  window.addEventListener('resize', () => {
    const activePill = document.querySelector('.type-pill.is-active');
    if (activePill) {
      updateIndicator(activePill, false);
    }
  });

  // Align indicator on initial load after fonts and DOM settle
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      const activePill = document.querySelector('.type-pill.is-active');
      if (activePill) {
        updateIndicator(activePill, false);
      }
    }, 50);
  });

  // =========================================================================
  // 4. Customization Options State
  // =========================================================================
  const customization = {
    fg: '#171717',
    bg: '#ffffff',
    pattern: 'square',
    ecc: 'M',
    margin: 2,
    logoDataUrl: null,
    logoImageElement: null
  };

  const toggleCustomizationBtn = document.getElementById('toggle-customization-btn');
  const customizationPanel = document.getElementById('customization-panel');

  if (toggleCustomizationBtn && customizationPanel) {
    toggleCustomizationBtn.addEventListener('click', () => {
      const isOpen = customizationPanel.classList.toggle('is-open');
      toggleCustomizationBtn.classList.toggle('is-open', isOpen);
      toggleCustomizationBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  // Foreground and Background Color Pickers
  const fgColorInput = document.getElementById('qr-color-fg');
  const bgColorInput = document.getElementById('qr-color-bg');
  const fgHexVal = document.getElementById('fg-hex-val');
  const bgHexVal = document.getElementById('bg-hex-val');

  if (fgColorInput && fgHexVal) {
    fgColorInput.addEventListener('input', (e) => {
      customization.fg = e.target.value;
      fgHexVal.textContent = e.target.value.toLowerCase();
      updateSingleQR();
    });
  }

  if (bgColorInput && bgHexVal) {
    bgColorInput.addEventListener('input', (e) => {
      customization.bg = e.target.value;
      bgHexVal.textContent = e.target.value.toLowerCase();
      updateSingleQR();
    });
  }

  // Pattern Style Buttons
  const patternButtons = document.querySelectorAll('.style-choice-btn');
  patternButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      patternButtons.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      customization.pattern = btn.getAttribute('data-pattern') || 'square';
      updateSingleQR();
    });
  });

  // Quiet Zone Margin Slider
  const marginSlider = document.getElementById('qr-margin');
  const marginBadge = document.getElementById('margin-val-badge');
  if (marginSlider && marginBadge) {
    marginSlider.addEventListener('input', (e) => {
      customization.margin = parseInt(e.target.value, 10);
      marginBadge.textContent = `${e.target.value} modules`;
      updateSingleQR();
    });
  }

  // Error Correction Select
  const eccSelect = document.getElementById('qr-ecc');
  const previewMetaEcc = document.getElementById('preview-meta-ecc');
  if (eccSelect && previewMetaEcc) {
    eccSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      customization.ecc = val;
      const pctMap = { L: '7%', M: '15%', Q: '25%', H: '30%' };
      previewMetaEcc.textContent = `ECC: ${val} (${pctMap[val] || '15%'})`;
      updateSingleQR();
    });
  }

  // Reset Customization Defaults
  const resetStyleBtn = document.getElementById('reset-style-btn');
  if (resetStyleBtn) {
    resetStyleBtn.addEventListener('click', () => {
      customization.fg = '#171717';
      customization.bg = '#ffffff';
      customization.pattern = 'square';
      customization.ecc = 'M';
      customization.margin = 2;
      removeLogo();

      if (fgColorInput) {
        fgColorInput.value = '#171717';
        if (fgHexVal) fgHexVal.textContent = '#171717';
      }
      if (bgColorInput) {
        bgColorInput.value = '#ffffff';
        if (bgHexVal) bgHexVal.textContent = '#ffffff';
      }
      patternButtons.forEach((b, i) => b.classList.toggle('is-active', i === 0));
      if (eccSelect) {
        eccSelect.value = 'M';
        if (previewMetaEcc) previewMetaEcc.textContent = 'ECC: M (15%)';
      }
      if (marginSlider) {
        marginSlider.value = 2;
        if (marginBadge) marginBadge.textContent = '2 modules';
      }

      updateSingleQR();
    });
  }

  // =========================================================================
  // 5. Logo Upload & Handling
  // =========================================================================
  const logoDropzone = document.getElementById('logo-dropzone');
  const logoFileInput = document.getElementById('logo-file-input');
  const logoPreviewRow = document.getElementById('logo-preview-row');
  const logoPreviewImg = document.getElementById('logo-preview-img');
  const logoFilename = document.getElementById('logo-filename');
  const removeLogoBtn = document.getElementById('remove-logo-btn');

  if (logoDropzone && logoFileInput) {
    logoDropzone.addEventListener('click', () => logoFileInput.click());
    logoDropzone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        logoFileInput.click();
      }
    });

    ['dragenter', 'dragover'].forEach((ev) => {
      logoDropzone.addEventListener(ev, (e) => {
        e.preventDefault();
        logoDropzone.classList.add('drag-over');
      });
    });

    ['dragleave', 'drop'].forEach((ev) => {
      logoDropzone.addEventListener(ev, (e) => {
        e.preventDefault();
        logoDropzone.classList.remove('drag-over');
      });
    });

    logoDropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleLogoFile(e.dataTransfer.files[0]);
      }
    });

    logoFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleLogoFile(e.target.files[0]);
      }
    });
  }

  function handleLogoFile(file) {
    if (!file.type.match(/image\/(png|jpeg|svg\+xml)/)) {
      alert('Please upload a valid image file (PNG, JPG, or SVG).');
      return;
    }
    const reader = new FileReader();
    reader.onload = function (event) {
      customization.logoDataUrl = event.target.result;
      const img = new Image();
      img.onload = () => {
        customization.logoImageElement = img;
        if (logoPreviewImg) logoPreviewImg.src = event.target.result;
        if (logoFilename) logoFilename.textContent = file.name;
        if (logoPreviewRow) logoPreviewRow.style.display = 'flex';
        if (logoDropzone) logoDropzone.style.display = 'none';

        // Auto-upgrade ECC to Q/H if user is on low ECC to preserve readability
        if (customization.ecc === 'L' || customization.ecc === 'M') {
          customization.ecc = 'Q';
          if (eccSelect) eccSelect.value = 'Q';
          if (previewMetaEcc) previewMetaEcc.textContent = 'ECC: Q (25%)';
        }

        updateSingleQR();
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  }

  function removeLogo() {
    customization.logoDataUrl = null;
    customization.logoImageElement = null;
    if (logoFileInput) logoFileInput.value = '';
    if (logoPreviewImg) logoPreviewImg.src = '';
    if (logoPreviewRow) logoPreviewRow.style.display = 'none';
    if (logoDropzone) logoDropzone.style.display = 'block';
    updateSingleQR();
  }

  if (removeLogoBtn) {
    removeLogoBtn.addEventListener('click', removeLogo);
  }

  // =========================================================================
  // 6. Form Field Extraction & Real-time Live Rendering
  // =========================================================================
  function getFieldsForType(type) {
    switch (type) {
      case 'url':
        return { url: document.getElementById('input-url')?.value || '' };
      case 'text':
        return { text: document.getElementById('input-text')?.value || '' };
      case 'wifi':
        return {
          ssid: document.getElementById('wifi-ssid')?.value || '',
          security: document.getElementById('wifi-security')?.value || 'WPA',
          password: document.getElementById('wifi-pass')?.value || '',
          hidden: document.getElementById('wifi-hidden')?.checked || false
        };
      case 'vcard':
        return {
          fn: document.getElementById('vcard-fn')?.value || '',
          ln: document.getElementById('vcard-ln')?.value || '',
          org: document.getElementById('vcard-org')?.value || '',
          title: document.getElementById('vcard-title')?.value || '',
          phone: document.getElementById('vcard-phone')?.value || '',
          email: document.getElementById('vcard-email')?.value || ''
        };
      case 'email':
        return {
          email: document.getElementById('email-to')?.value || '',
          subject: document.getElementById('email-subject')?.value || '',
          body: document.getElementById('email-body')?.value || ''
        };
      case 'phone':
        return { phone: document.getElementById('phone-number')?.value || '' };
      case 'sms':
        return {
          phone: document.getElementById('sms-number')?.value || '',
          body: document.getElementById('sms-body')?.value || ''
        };
      case 'whatsapp':
        return {
          phone: document.getElementById('wa-phone')?.value || '',
          text: document.getElementById('wa-text')?.value || ''
        };
      case 'social':
        return {
          platform: document.getElementById('social-platform')?.value || 'instagram',
          profile: document.getElementById('social-profile')?.value || ''
        };
      case 'upi':
        return {
          vpa: document.getElementById('upi-id')?.value || '',
          name: document.getElementById('upi-name')?.value || '',
          amount: document.getElementById('upi-amount')?.value || '',
          note: document.getElementById('upi-note')?.value || ''
        };
      case 'location':
        return {
          lat: document.getElementById('geo-lat')?.value || '',
          lon: document.getElementById('geo-lon')?.value || ''
        };
      case 'event':
        return {
          title: document.getElementById('event-title')?.value || '',
          start: document.getElementById('event-start')?.value || '',
          end: document.getElementById('event-end')?.value || '',
          location: document.getElementById('event-location')?.value || ''
        };
      default:
        return {};
    }
  }

  // Attach live change/input listeners to all form controls
  const formsContainer = document.getElementById('forms-container');
  if (formsContainer) {
    formsContainer.addEventListener('input', () => updateSingleQR());
    formsContainer.addEventListener('change', () => updateSingleQR());
  }

  const socialPlatformSelect = document.getElementById('social-platform');
  const socialProfileInput = document.getElementById('social-profile');
  const socialValidation = document.getElementById('social-validation');
  const socialPlaceholders = {
    instagram: '@yourprofile', facebook: 'your.profile', youtube: '@yourhandle',
    tiktok: '@yourprofile', x: '@yourhandle', linkedin: 'your-profile',
    snapchat: 'yourusername', pinterest: 'yourprofile', telegram: 'yourchannel',
    other: 'https://example.com/your-profile'
  };

  function updateSocialPlatformHint() {
    if (!socialPlatformSelect || !socialProfileInput) return;
    socialProfileInput.placeholder = socialPlaceholders[socialPlatformSelect.value] || 'https://example.com/your-profile';
    socialProfileInput.setCustomValidity('');
    if (socialValidation) socialValidation.textContent = '';
  }

  function updateSocialValidation(message = '') {
    if (!socialProfileInput || !socialValidation) return;
    socialProfileInput.setCustomValidity(message);
    socialValidation.textContent = message;
  }

  if (socialPlatformSelect) {
    socialPlatformSelect.addEventListener('change', updateSocialPlatformHint);
    updateSocialPlatformHint();
  }

  // Active state cache
  let currentMatrixData = null;
  let currentEncoded = null;
  let currentSVGString = null;

  const previewWrapper = document.getElementById('qr-preview-wrapper');
  const previewStatusPill = document.getElementById('preview-status-pill');
  const previewMetaFormat = document.getElementById('preview-meta-format');
  const downloadPngBtn = document.getElementById('download-png-btn');
  const downloadSvgBtn = document.getElementById('download-svg-btn');
  const upiAmountInput = document.getElementById('upi-amount');

  if (upiAmountInput) {
    upiAmountInput.addEventListener('input', () => {
      const value = upiAmountInput.value;
      upiAmountInput.setCustomValidity(value && !/^\d*(?:\.\d{0,2})?$/.test(value)
        ? 'Use a positive amount with up to 2 decimal places.'
        : '');
    });
  }

  function updateSingleQR() {
    if (!window.QREncoders || !window.QRRenderer) return;

    const fields = getFieldsForType(currentActiveType);
    const encoderFn = window.QREncoders[currentActiveType];
    if (!encoderFn) return;

    const encoded = encoderFn(fields);

    if (currentActiveType === 'social') {
      updateSocialValidation(encoded.error || '');
    }

    if (encoded.error) {
      clearPreview();
      if (previewStatusPill) {
        previewStatusPill.innerHTML = '<span class="pill-badge-dot" style="background-color: var(--color-warning);"></span> Incomplete';
      }
      if (downloadPngBtn) downloadPngBtn.disabled = true;
      if (downloadSvgBtn) downloadSvgBtn.disabled = true;
      return;
    }

    try {
      const matrixData = window.QRRenderer.createMatrix(encoded.payload, customization.ecc);
      const svgString = window.QRRenderer.renderSVGString(matrixData, {
        fg: customization.fg,
        bg: customization.bg,
        margin: customization.margin,
        pattern: customization.pattern,
        logo: customization.logoDataUrl
      });

      if (previewWrapper) {
        previewWrapper.innerHTML = svgString;
      }

      currentMatrixData = matrixData;
      currentEncoded = encoded;
      currentSVGString = svgString;

      if (previewStatusPill) {
        previewStatusPill.innerHTML = '<span class="pill-badge-dot" style="background-color: var(--color-link);"></span> Active';
      }
      if (previewMetaFormat) {
        previewMetaFormat.textContent = `${matrixData.count}×${matrixData.count} Modules`;
      }
      if (downloadPngBtn) downloadPngBtn.disabled = false;
      if (downloadSvgBtn) downloadSvgBtn.disabled = false;

    } catch (err) {
      console.warn('[QR Studio] Rendering error:', err);
      if (previewStatusPill) {
        previewStatusPill.innerHTML = '<span class="pill-badge-dot" style="background-color: var(--color-error);"></span> Data Overflow';
      }
      if (downloadPngBtn) downloadPngBtn.disabled = true;
      if (downloadSvgBtn) downloadSvgBtn.disabled = true;
    }
  }

  function clearPreview() {
    currentMatrixData = null;
    currentEncoded = null;
    currentSVGString = null;
    if (previewWrapper) previewWrapper.innerHTML = '';
    if (previewMetaFormat) previewMetaFormat.textContent = 'Format: Vector Ready';
    if (downloadPngBtn) downloadPngBtn.disabled = true;
    if (downloadSvgBtn) downloadSvgBtn.disabled = true;
  }

  // =========================================================================
  // 7. Genuine Downloads & History Recording
  // =========================================================================
  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function getSafeFilename(baseName, ext) {
    const clean = (baseName || 'qr-code').replace(/[^a-z0-9_-]/gi, '_').toLowerCase().slice(0, 32);
    return `${clean}_${Date.now()}.${ext}`;
  }

  // Download SVG
  if (downloadSvgBtn) {
    downloadSvgBtn.addEventListener('click', () => {
      if (!currentSVGString || !currentEncoded) return;
      const blob = new Blob([currentSVGString], { type: 'image/svg+xml;charset=utf-8' });
      triggerDownload(blob, getSafeFilename(currentEncoded.label, 'svg'));
      saveToHistory(currentEncoded.label, currentActiveType, { fields: getFieldsForType(currentActiveType) });
      showToast(`Exported "${currentEncoded.label}" as SVG.`, 'success');
    });
  }

  // Download PNG
  if (downloadPngBtn) {
    downloadPngBtn.addEventListener('click', () => {
      if (!currentMatrixData || !currentEncoded) return;

      const sizeSelect = document.getElementById('export-resolution');
      const targetSize = sizeSelect ? parseInt(sizeSelect.value, 10) : 1024;

      const canvas = window.QRRenderer.renderCanvas(
        currentMatrixData,
        {
          fg: customization.fg,
          bg: customization.bg,
          margin: customization.margin,
          pattern: customization.pattern,
          logoImageElement: customization.logoImageElement
        },
        targetSize
      );

      canvas.toBlob((blob) => {
        if (!blob) return;
        triggerDownload(blob, getSafeFilename(currentEncoded.label, 'png'));
        saveToHistory(currentEncoded.label, currentActiveType, { fields: getFieldsForType(currentActiveType) });
        showToast(`Exported "${currentEncoded.label}" as PNG.`, 'success');
      }, 'image/png');
    });
  }

  // History Manager
  // Toast Notification System
  function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.textContent = message;

    container.appendChild(toast);
    requestAnimationFrame(() => {
      toast.classList.add('toast-show');
    });

    setTimeout(() => {
      toast.classList.remove('toast-show');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 250);
    }, 2800);
  }

  // History Manager with Restore, Delete, and Storage Protection
  function loadHistory() {
    try {
      const items = JSON.parse(localStorage.getItem(STORAGE_KEY_HISTORY) || '[]');
      // Remove legacy field snapshots while retaining the history entries and
      // timestamps. Older versions persisted private form values here.
      const historyLabels = { url: 'Website QR', text: 'Text QR', wifi: 'Wi-Fi QR', vcard: 'Contact QR', email: 'Email QR', phone: 'Phone QR', sms: 'SMS QR', whatsapp: 'WhatsApp QR', social: 'Social Media QR', upi: 'UPI payment QR', location: 'Location QR', event: 'Event QR', bulk: 'Batch Export' };
      const redactedItems = items.map((item) => ({ ...item, label: historyLabels[item.type] || 'QR Code', snapshot: null }));
      if (JSON.stringify(items) !== JSON.stringify(redactedItems)) {
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(redactedItems));
      }
      renderHistoryList(redactedItems);
    } catch (e) {
      console.warn('Corrupt history in storage, clearing:', e);
      localStorage.removeItem(STORAGE_KEY_HISTORY);
      renderHistoryList([]);
    }
  }

  function saveToHistory(label, type) {
    try {
      let items = [];
      try {
        items = JSON.parse(localStorage.getItem(STORAGE_KEY_HISTORY) || '[]');
      } catch {
        items = [];
      }

      // Avoid immediate sequential duplicate entries
      if (items.length > 0 && items[0].label === label && items[0].type === type) {
        return;
      }

      // History is an activity list, not a form-draft store. Keeping payloads or
      // field snapshots here would expose passwords, contact details, and payments
      // to the next person using this browser.
      const safeLabels = {
        url: 'Website QR', text: 'Text QR', wifi: 'Wi-Fi QR', vcard: 'Contact QR',
        email: 'Email QR', phone: 'Phone QR', sms: 'SMS QR', whatsapp: 'WhatsApp QR', social: 'Social Media QR',
        upi: 'UPI payment QR', location: 'Location QR', event: 'Event QR', bulk: 'Batch Export'
      };

      items.unshift({
        id: Date.now() + Math.random().toString(36).substring(2, 6),
        label: safeLabels[type] || 'QR Code',
        type: type,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        snapshot: null
      });

      // Strict sensible storage limit: keep last 15 entries
      if (items.length > 15) {
        items = items.slice(0, 15);
      }

      try {
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(items));
      } catch (storageErr) {
        // QuotaExceededError handling: purge older half and retry
        console.warn('[QR Studio] Storage quota exceeded. Evicting old items...', storageErr);
        items = items.slice(0, 6);
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(items));
      }

      renderHistoryList(items);
    } catch (err) {
      console.warn('[QR Studio] Could not save history item:', err);
    }
  }

  function deleteHistoryItem(id) {
    try {
      let items = JSON.parse(localStorage.getItem(STORAGE_KEY_HISTORY) || '[]');
      items = items.filter((item) => item.id !== id);
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(items));
      renderHistoryList(items);
      showToast('Item deleted from history.', 'info');
    } catch (err) {
      console.warn('Could not delete history item:', err);
    }
  }

  function restoreHistoryItem(id) {
    try {
      const items = JSON.parse(localStorage.getItem(STORAGE_KEY_HISTORY) || '[]');
      const item = items.find((i) => i.id === id);
      if (!item || !item.snapshot) {
        showToast('History item details not available for restore.', 'error');
        return;
      }

      const snap = item.snapshot;
      // Switch to Single mode
      setMode('single');

      // Switch type
      selectType(snap.type);

      // Restore form fields
      if (snap.fields) {
        restoreFieldsForType(snap.type, snap.fields);
      }

      // Restore customization
      if (snap.customization) {
        customization.fg = snap.customization.fg || '#171717';
        customization.bg = snap.customization.bg || '#ffffff';
        customization.pattern = snap.customization.pattern || 'square';
        customization.ecc = snap.customization.ecc || 'M';
        customization.margin = snap.customization.margin !== undefined ? snap.customization.margin : 2;

        if (fgColorInput) {
          fgColorInput.value = customization.fg;
          if (fgHexVal) fgHexVal.textContent = customization.fg.toLowerCase();
        }
        if (bgColorInput) {
          bgColorInput.value = customization.bg;
          if (bgHexVal) bgHexVal.textContent = customization.bg.toLowerCase();
        }
        patternButtons.forEach((b) => {
          b.classList.toggle('is-active', b.getAttribute('data-pattern') === customization.pattern);
        });
        if (eccSelect) {
          eccSelect.value = customization.ecc;
          if (previewMetaEcc) {
            const pctMap = { L: '7%', M: '15%', Q: '25%', H: '30%' };
            previewMetaEcc.textContent = `ECC: ${customization.ecc} (${pctMap[customization.ecc] || '15%'})`;
          }
        }
        if (marginSlider) {
          marginSlider.value = customization.margin;
          if (marginBadge) marginBadge.textContent = `${customization.margin} modules`;
        }
      }

      updateSingleQR();
      showToast(`Restored "${item.label}"`, 'success');
    } catch (err) {
      console.warn('Restore failed:', err);
      showToast('Could not restore item.', 'error');
    }
  }

  function restoreFieldsForType(type, fields) {
    switch (type) {
      case 'url':
        if (document.getElementById('input-url')) document.getElementById('input-url').value = fields.url || '';
        break;
      case 'text':
        if (document.getElementById('input-text')) document.getElementById('input-text').value = fields.text || '';
        break;
      case 'wifi':
        if (document.getElementById('wifi-ssid')) document.getElementById('wifi-ssid').value = fields.ssid || '';
        if (document.getElementById('wifi-security')) document.getElementById('wifi-security').value = fields.security || 'WPA';
        if (document.getElementById('wifi-pass')) document.getElementById('wifi-pass').value = fields.password || '';
        if (document.getElementById('wifi-hidden')) document.getElementById('wifi-hidden').checked = !!fields.hidden;
        break;
      case 'vcard':
        if (document.getElementById('vcard-fn')) document.getElementById('vcard-fn').value = fields.fn || '';
        if (document.getElementById('vcard-ln')) document.getElementById('vcard-ln').value = fields.ln || '';
        if (document.getElementById('vcard-org')) document.getElementById('vcard-org').value = fields.org || '';
        if (document.getElementById('vcard-title')) document.getElementById('vcard-title').value = fields.title || '';
        if (document.getElementById('vcard-phone')) document.getElementById('vcard-phone').value = fields.phone || '';
        if (document.getElementById('vcard-email')) document.getElementById('vcard-email').value = fields.email || '';
        break;
      case 'email':
        if (document.getElementById('email-to')) document.getElementById('email-to').value = fields.email || '';
        if (document.getElementById('email-subject')) document.getElementById('email-subject').value = fields.subject || '';
        if (document.getElementById('email-body')) document.getElementById('email-body').value = fields.body || '';
        break;
      case 'phone':
        if (document.getElementById('phone-number')) document.getElementById('phone-number').value = fields.phone || '';
        break;
      case 'sms':
        if (document.getElementById('sms-number')) document.getElementById('sms-number').value = fields.phone || '';
        if (document.getElementById('sms-body')) document.getElementById('sms-body').value = fields.body || '';
        break;
      case 'whatsapp':
        if (document.getElementById('wa-phone')) document.getElementById('wa-phone').value = fields.phone || '';
        if (document.getElementById('wa-text')) document.getElementById('wa-text').value = fields.text || '';
        break;
      case 'social':
        if (document.getElementById('social-platform')) document.getElementById('social-platform').value = fields.platform || 'instagram';
        if (document.getElementById('social-profile')) document.getElementById('social-profile').value = fields.profile || '';
        updateSocialPlatformHint();
        break;
      case 'upi':
        if (document.getElementById('upi-id')) document.getElementById('upi-id').value = fields.vpa || '';
        if (document.getElementById('upi-name')) document.getElementById('upi-name').value = fields.name || '';
        if (document.getElementById('upi-amount')) document.getElementById('upi-amount').value = fields.amount || '';
        if (document.getElementById('upi-note')) document.getElementById('upi-note').value = fields.note || '';
        break;
      case 'location':
        if (document.getElementById('geo-lat')) document.getElementById('geo-lat').value = fields.lat || '';
        if (document.getElementById('geo-lon')) document.getElementById('geo-lon').value = fields.lon || '';
        break;
      case 'event':
        if (document.getElementById('event-title')) document.getElementById('event-title').value = fields.title || '';
        if (document.getElementById('event-start')) document.getElementById('event-start').value = fields.start || '';
        if (document.getElementById('event-end')) document.getElementById('event-end').value = fields.end || '';
        if (document.getElementById('event-location')) document.getElementById('event-location').value = fields.location || '';
        break;
    }
  }

  function renderHistoryList(items) {
    const historyListEl = document.getElementById('history-items-list');
    if (!historyListEl) return;

    if (!items || items.length === 0) {
      historyListEl.innerHTML = '<div class="text-body-sm" style="color: var(--color-mute); font-size: 11px; padding: 6px 0;">No saved codes yet.</div>';
      return;
    }

    historyListEl.innerHTML = '';
    items.forEach((item) => {
      const div = document.createElement('div');
      div.className = 'history-item';

      const infoSpan = document.createElement('div');
      infoSpan.className = 'history-item-info';
      infoSpan.title = 'Click to restore this QR code';
      infoSpan.innerHTML = `
        <span style="font-weight: 500; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${escapeHTML(item.label)}</span>
        <span class="text-code" style="font-size: 10px; color: var(--color-mute);">${item.type.toUpperCase()} · ${item.timestamp}</span>
      `;
      infoSpan.addEventListener('click', () => {
        restoreHistoryItem(item.id);
      });

      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'history-item-actions';

      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'history-btn-icon history-btn-delete';
      deleteBtn.setAttribute('aria-label', `Delete ${item.label} from history`);
      deleteBtn.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteHistoryItem(item.id);
      });

      actionsDiv.appendChild(deleteBtn);
      div.appendChild(infoSpan);
      div.appendChild(actionsDiv);
      historyListEl.appendChild(div);
    });
  }

  const clearHistoryBtn = document.getElementById('clear-history-btn');
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
      try {
        localStorage.removeItem(STORAGE_KEY_HISTORY);
        renderHistoryList([]);
        showToast('History cleared.', 'info');
      } catch (err) {
        console.warn('Clear history error:', err);
      }
    });
  }

  // Load history on initialization
  loadHistory();

  // Initial single QR generation
  updateSingleQR();

  // =========================================================================
  // 8. Bulk CSV / TSV Parsing, Batch Generation & ZIP Packaging
  // =========================================================================
  const csvDropzone = document.getElementById('csv-dropzone');
  const csvFileInput = document.getElementById('csv-file-input');
  const csvFileStatus = document.getElementById('csv-file-status');
  const bulkRawText = document.getElementById('bulk-raw-text');
  const bulkParseBtn = document.getElementById('bulk-parse-btn');
  const bulkSkipDupes = document.getElementById('bulk-skip-dupes');
  const bulkErrorBanner = document.getElementById('bulk-error-banner');
  const bulkErrorDesc = document.getElementById('bulk-error-desc');
  const bulkPreviewContainer = document.getElementById('bulk-preview-container');
  const bulkCountBadge = document.getElementById('bulk-count-badge');
  const bulkRecordsTbody = document.getElementById('bulk-records-tbody');
  const bulkZipFormat = document.getElementById('bulk-zip-format');
  const bulkProgressWrapper = document.getElementById('bulk-progress-wrapper');
  const bulkProgressStatus = document.getElementById('bulk-progress-status');
  const bulkProgressPercent = document.getElementById('bulk-progress-percent');
  const bulkProgressBar = document.getElementById('bulk-progress-bar');

  // Parsed and validated batch records
  let bulkItems = [];
  let bulkGenerationCancelled = false;
  let bulkInputRevision = 0;

  /**
   * RFC 4180-compliant CSV/TSV parser supporting quotes, commas, newlines, and escaping.
   */
  function parseCSV(text) {
    const rows = [];
    let currentRow = [];
    let currentField = '';
    let insideQuotes = false;

    // Detect delimiter: tab or comma
    const delimiter = text.includes('\t') && !text.includes(',') ? '\t' : ',';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (insideQuotes && nextChar === '"') {
          currentField += '"';
          i++; // skip escaped quote
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === delimiter && !insideQuotes) {
        currentRow.push(currentField.trim());
        currentField = '';
      } else if ((char === '\r' || char === '\n') && !insideQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        currentRow.push(currentField.trim());
        if (currentRow.some((f) => f.length > 0)) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }

    if (currentField.length > 0 || currentRow.length > 0) {
      currentRow.push(currentField.trim());
      if (currentRow.some((f) => f.length > 0)) {
        rows.push(currentRow);
      }
    }

    return rows;
  }

  function handleBulkParsing() {
    const rawContent = (bulkRawText?.value || '').trim();
    if (!rawContent) {
      showBulkError('Empty input. Please paste records or upload a CSV file.');
      bulkItems = [];
      renderBulkTable();
      return;
    }

    const rows = parseCSV(rawContent);
    if (!rows || rows.length === 0) {
      showBulkError('No recognizable rows found in file.');
      bulkItems = [];
      renderBulkTable();
      return;
    }

    hideBulkError();

    // Check if row 0 is a header (e.g., contains 'url', 'payload', 'content', 'link', 'name', 'label')
    let startIndex = 0;
    const headerCandidates = ['payload', 'url', 'link', 'text', 'content', 'value', 'data', 'label', 'name', 'title'];
    const row0Tokens = rows[0].map((t) => t.toLowerCase());
    const isHeaderRow = row0Tokens.some((t) => headerCandidates.includes(t));
    if (isHeaderRow) {
      startIndex = 1;
    }

    const seenPayloads = new Set();
    const parsed = [];
    const notices = [];
    let dupeCount = 0;
    let malformedCount = 0;

    for (let i = startIndex; i < rows.length; i++) {
      const row = rows[i];
      if (row.length === 0 || (row.length === 1 && !row[0])) {
        continue;
      }

      let payload = '';
      let label = '';

      if (row.length === 1) {
        payload = row[0];
        label = `item_${i + 1}`;
      } else {
        // If 2 columns, detect which is payload (URL/data) and which is label
        if (/^https?:\/\//i.test(row[0]) || row[0].length > 30) {
          payload = row[0];
          label = row[1];
        } else if (/^https?:\/\//i.test(row[1])) {
          payload = row[1];
          label = row[0];
        } else {
          payload = row[0];
          label = row[1];
        }
      }

      if (!payload) {
        malformedCount++;
        continue;
      }

      // Check duplicates
      if (bulkSkipDupes && bulkSkipDupes.checked) {
        if (seenPayloads.has(payload)) {
          dupeCount++;
          continue;
        }
      }
      seenPayloads.add(payload);

      parsed.push({
        index: parsed.length + 1,
        label: label || `qr_${parsed.length + 1}`,
        payload: payload,
        status: 'ready'
      });
    }

    if (dupeCount > 0) notices.push(`Skipped ${dupeCount} duplicate payload(s).`);
    if (malformedCount > 0) notices.push(`Skipped ${malformedCount} empty or malformed row(s).`);

    if (notices.length > 0) {
      showBulkError(notices.join(' '));
    }

    bulkItems = parsed;
    renderBulkTable();
  }

  function showBulkError(msg) {
    if (bulkErrorBanner && bulkErrorDesc) {
      bulkErrorDesc.textContent = msg;
      bulkErrorBanner.style.display = 'block';
    }
  }

  function hideBulkError() {
    if (bulkErrorBanner) {
      bulkErrorBanner.style.display = 'none';
    }
  }

  function renderBulkTable() {
    if (!bulkRecordsTbody || !bulkCountBadge || !bulkPreviewContainer) return;

    bulkRecordsTbody.innerHTML = '';

    if (bulkItems.length === 0) {
      bulkCountBadge.textContent = '0 items loaded';
      bulkPreviewContainer.style.display = 'none';
      if (downloadZipBtn) downloadZipBtn.disabled = true;
      return;
    }

    bulkCountBadge.textContent = `${bulkItems.length} item${bulkItems.length > 1 ? 's' : ''} loaded`;
    bulkPreviewContainer.style.display = 'block';
    if (downloadZipBtn) downloadZipBtn.disabled = false;

    // Render items (cap visual rows at 200 for lightning responsiveness if huge dataset)
    const displayLimit = Math.min(bulkItems.length, 200);

    for (let i = 0; i < displayLimit; i++) {
      const item = bulkItems[i];
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="color: var(--color-mute); font-size: 11px;">${i + 1}</td>
        <td><strong style="color: var(--color-ink);">${escapeHTML(item.label)}</strong></td>
        <td style="font-family: var(--font-mono); font-size: 11px; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHTML(item.payload)}</td>
        <td style="text-align: center;"><span class="pill-badge" style="font-size: 10px; padding: 1px 6px;">Ready</span></td>
        <td style="text-align: right; white-space: nowrap;">
          <button type="button" class="btn-app-ghost bulk-dl-png" data-idx="${i}" style="height: 24px; padding: 0 6px; font-size: 11px; margin-right: 4px;">PNG</button>
          <button type="button" class="btn-app-ghost bulk-dl-svg" data-idx="${i}" style="height: 24px; padding: 0 6px; font-size: 11px;">SVG</button>
        </td>
      `;
      bulkRecordsTbody.appendChild(tr);
    }

    if (bulkItems.length > displayLimit) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td colspan="5" style="text-align: center; color: var(--color-mute); font-size: 11px; padding: 8px;">
          Showing first ${displayLimit} of ${bulkItems.length} items. All items will be included in the ZIP export.
        </td>
      `;
      bulkRecordsTbody.appendChild(tr);
    }

    // Attach individual download listeners
    bulkRecordsTbody.querySelectorAll('.bulk-dl-png').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        downloadSingleBulkItem(idx, 'png');
      });
    });

    bulkRecordsTbody.querySelectorAll('.bulk-dl-svg').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        downloadSingleBulkItem(idx, 'svg');
      });
    });
  }

  function escapeHTML(str) {
    return (str || '').replace(/[&<>'"]/g, (tag) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

  /**
   * Downloads a single item from the bulk list using shared styling.
   */
  function downloadSingleBulkItem(idx, format) {
    const item = bulkItems[idx];
    if (!item) return;

    try {
      const matrixData = window.QRRenderer.createMatrix(item.payload, customization.ecc);

      if (format === 'svg') {
        const svgString = window.QRRenderer.renderSVGString(matrixData, {
          fg: customization.fg,
          bg: customization.bg,
          margin: customization.margin,
          pattern: customization.pattern,
          logo: customization.logoDataUrl
        });
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        triggerDownload(blob, getSafeFilename(item.label, 'svg'));
      } else {
        const sizeSelect = document.getElementById('export-resolution');
        const targetSize = sizeSelect ? parseInt(sizeSelect.value, 10) : 1024;
        const canvas = window.QRRenderer.renderCanvas(
          matrixData,
          {
            fg: customization.fg,
            bg: customization.bg,
            margin: customization.margin,
            pattern: customization.pattern,
            logoImageElement: customization.logoImageElement
          },
          targetSize
        );
        canvas.toBlob((blob) => {
          if (blob) {
            triggerDownload(blob, getSafeFilename(item.label, 'png'));
          }
        }, 'image/png');
      }
    } catch (err) {
      alert(`Could not generate QR for "${item.label}": ${err.message}`);
    }
  }

  /**
   * Batch ZIP generation using JSZip.
   */
  async function generateBulkZip() {
    if (!bulkItems || bulkItems.length === 0) {
      alert('Please parse or upload bulk records before generating a ZIP.');
      return;
    }
    if (typeof JSZip === 'undefined') {
      alert('JSZip library is missing.');
      return;
    }

    if (downloadZipBtn) {
      downloadZipBtn.disabled = true;
    }
    bulkGenerationCancelled = false;
    if (bulkProgressWrapper) {
      bulkProgressWrapper.style.display = 'block';
    }

    const format = bulkZipFormat ? bulkZipFormat.value : 'png';
    const sizeSelect = document.getElementById('export-resolution');
    const targetSize = sizeSelect ? parseInt(sizeSelect.value, 10) : 1024;

    const zip = new JSZip();
    const folder = zip.folder('qr-codes');
    const total = bulkItems.length;

    for (let i = 0; i < total; i++) {
      if (bulkGenerationCancelled) {
        if (bulkProgressStatus) bulkProgressStatus.textContent = 'Batch generation cancelled.';
        return;
      }
      const item = bulkItems[i];
      const safeName = (item.label || `qr_${i + 1}`).replace(/[^a-z0-9_-]/gi, '_').toLowerCase().slice(0, 32);

      try {
        const matrixData = window.QRRenderer.createMatrix(item.payload, customization.ecc);

        if (format === 'svg' || format === 'both') {
          const svgString = window.QRRenderer.renderSVGString(matrixData, {
            fg: customization.fg,
            bg: customization.bg,
            margin: customization.margin,
            pattern: customization.pattern,
            logo: customization.logoDataUrl
          });
          folder.file(`${String(i + 1).padStart(3, '0')}_${safeName}.svg`, svgString);
        }

        if (format === 'png' || format === 'both') {
          const canvas = window.QRRenderer.renderCanvas(
            matrixData,
            {
              fg: customization.fg,
              bg: customization.bg,
              margin: customization.margin,
              pattern: customization.pattern,
              logoImageElement: customization.logoImageElement
            },
            targetSize
          );

          // Get base64 PNG data
          const dataUrl = canvas.toDataURL('image/png');
          const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
          folder.file(`${String(i + 1).padStart(3, '0')}_${safeName}.png`, base64Data, { base64: true });
        }
      } catch (err) {
        console.warn(`Failed rendering item ${i + 1}:`, err);
      }

      // Update progress bar
      const pct = Math.round(((i + 1) / total) * 100);
      if (bulkProgressPercent) bulkProgressPercent.textContent = `${pct}%`;
      if (bulkProgressBar) bulkProgressBar.style.width = `${pct}%`;
      if (bulkProgressStatus) bulkProgressStatus.textContent = `Generated ${i + 1} of ${total}...`;

      // Allow UI thread tick every 10 items
      if (i % 10 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    if (bulkProgressStatus) bulkProgressStatus.textContent = 'Packaging ZIP archive...';

    try {
      const content = await zip.generateAsync(
        { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
        (metadata) => {
          if (bulkProgressBar) bulkProgressBar.style.width = `${Math.round(metadata.percent)}%`;
        }
      );

      if (bulkGenerationCancelled) return;
      triggerDownload(content, `qr_studio_batch_${Date.now()}.zip`);
      saveToHistory(`Batch Export (${total} items)`, 'bulk');

      if (bulkProgressStatus) bulkProgressStatus.textContent = 'Done!';
    } catch (err) {
      alert(`ZIP archive creation failed: ${err.message}`);
    } finally {
      if (downloadZipBtn) downloadZipBtn.disabled = false;
      setTimeout(() => {
        if (bulkProgressWrapper) bulkProgressWrapper.style.display = 'none';
      }, 2500);
    }
  }

  // Hook Bulk file drag-and-drop & file input
  if (csvDropzone && csvFileInput) {
    csvDropzone.addEventListener('click', () => csvFileInput.click());
    csvDropzone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        csvFileInput.click();
      }
    });

    ['dragenter', 'dragover'].forEach((ev) => {
      csvDropzone.addEventListener(ev, (e) => {
        e.preventDefault();
        csvDropzone.classList.add('drag-over');
      });
    });

    ['dragleave', 'drop'].forEach((ev) => {
      csvDropzone.addEventListener(ev, (e) => {
        e.preventDefault();
        csvDropzone.classList.remove('drag-over');
      });
    });

    csvDropzone.addEventListener('drop', (e) => {
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleCsvFile(e.dataTransfer.files[0]);
      }
    });

    csvFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleCsvFile(e.target.files[0]);
      }
    });
  }

  function handleCsvFile(file) {
    const inputRevision = ++bulkInputRevision;
    if (csvFileStatus) {
      csvFileStatus.textContent = file.name;
      csvFileStatus.style.display = 'block';
    }
    const reader = new FileReader();
    reader.onload = function (event) {
      if (inputRevision !== bulkInputRevision) return;
      if (bulkRawText) {
        bulkRawText.value = event.target.result;
        handleBulkParsing();
      }
    };
    reader.readAsText(file);
  }

  if (bulkParseBtn) {
    bulkParseBtn.addEventListener('click', handleBulkParsing);
  }

  if (downloadZipBtn) {
    downloadZipBtn.addEventListener('click', generateBulkZip);
  }

  // Clears only Batch mode's transient input and processing state. It never
  // changes shared styling controls, Single mode, or QR history.
  const bulkClearInputsBtn = document.getElementById('bulk-clear-inputs-btn');
  function clearBatchInputs() {
    bulkGenerationCancelled = true;
    bulkInputRevision++;
    if (bulkRawText) bulkRawText.value = '';
    if (csvFileInput) csvFileInput.value = '';
    if (csvFileStatus) {
      csvFileStatus.textContent = '';
      csvFileStatus.style.display = 'none';
    }
    if (bulkSkipDupes) bulkSkipDupes.checked = true;
    if (bulkZipFormat) bulkZipFormat.value = 'png';
    bulkItems = [];
    hideBulkError();
    renderBulkTable();
    if (bulkProgressWrapper) bulkProgressWrapper.style.display = 'none';
    if (bulkProgressBar) bulkProgressBar.style.width = '0%';
    if (bulkProgressPercent) bulkProgressPercent.textContent = '0%';
    if (bulkProgressStatus) bulkProgressStatus.textContent = 'Rendering QR codes...';
    showToast('Batch inputs cleared. History was kept.', 'info');
  }

  if (bulkClearInputsBtn) {
    bulkClearInputsBtn.addEventListener('click', clearBatchInputs);
  }

  // Clear sensitive form data and transient previews without touching history.
  const clearInputsBtn = document.getElementById('clear-inputs-btn');
  function clearAllInputs() {
    if (formsContainer) {
      formsContainer.querySelectorAll('input, textarea, select').forEach((control) => {
        if (control.type === 'checkbox' || control.type === 'radio') {
          control.checked = false;
        } else if (control.tagName === 'SELECT') {
          control.selectedIndex = 0;
        } else {
          control.value = '';
        }
        control.setCustomValidity?.('');
      });
    }

    clearBatchInputs();

    updateSocialPlatformHint();

    removeLogo();
    clearPreview();
    updateSocialPlatformHint();
    try {
      const history = JSON.parse(localStorage.getItem(STORAGE_KEY_HISTORY) || '[]');
      const historyLabels = { url: 'Website QR', text: 'Text QR', wifi: 'Wi-Fi QR', vcard: 'Contact QR', email: 'Email QR', phone: 'Phone QR', sms: 'SMS QR', whatsapp: 'WhatsApp QR', social: 'Social Media QR', upi: 'UPI payment QR', location: 'Location QR', event: 'Event QR', bulk: 'Batch Export' };
      const redactedHistory = history.map((item) => ({ ...item, label: historyLabels[item.type] || 'QR Code', snapshot: null }));
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(redactedHistory));
    } catch (err) {
      console.warn('[QR Studio] Could not redact legacy history snapshots:', err);
    }
    document.querySelectorAll('.toast-container').forEach((container) => container.replaceChildren());
    showToast('All inputs and the preview have been cleared. History was kept.', 'info');
  }

  if (clearInputsBtn) {
    clearInputsBtn.addEventListener('click', clearAllInputs);
  }

  console.log('[QR Studio] Single & Bulk modes fully initialized and operational.');
})();
