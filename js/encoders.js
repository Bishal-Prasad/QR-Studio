/**
 * QR Studio — Payload Encoders & Sanitizers
 * Formats valid payloads according to standard RFCs and QR reader specifications.
 */

window.QREncoders = {
  // Website URL
  url: function (fields) {
    let url = (fields.url || '').trim();
    if (!url) return { error: 'Please enter a URL.' };
    if (!/^https?:\/\//i.test(url)) {
      url = 'https://' + url;
    }
    return { payload: url, label: url };
  },

  // Plain Text
  text: function (fields) {
    // Do not normalize user content: QR text must round-trip exactly, including
    // whitespace, line breaks, punctuation, and Unicode characters.
    const text = String(fields.text ?? '');
    if (!text) return { error: 'Please enter some text.' };
    return { payload: text, label: text.length > 25 ? text.slice(0, 25) + '...' : text };
  },

  // Wi-Fi Configuration (WIFI:S:<SSID>;T:<WPA|WEP|nopass>;P:<password>;H:<true|false>;;)
  wifi: function (fields) {
    const ssid = (fields.ssid || '').trim();
    if (!ssid) return { error: 'Wi-Fi network name (SSID) is required.' };
    const requestedSecurity = fields.security || 'WPA';
    const security = ['WPA', 'WEP', 'nopass'].includes(requestedSecurity) ? requestedSecurity : 'WPA';
    const password = fields.password || '';
    const hidden = fields.hidden ? 'true' : 'false';

    // Escape special chars: \, ;, ,, :, "
    const escapeWifi = (str) => str.replace(/([\\;,:"])/g, '\\$1');

    if (security !== 'nopass' && !password) {
      return { error: 'A password is required for WPA/WPA2/WPA3 and WEP networks.' };
    }

    let payload = `WIFI:T:${security};S:${escapeWifi(ssid)};`;
    if (security !== 'nopass') {
      payload += `P:${escapeWifi(password)};`;
    }
    if (fields.hidden) {
      payload += `H:${hidden};`;
    }
    payload += ';';

    return { payload, label: `Wi-Fi: ${ssid}` };
  },

  // vCard 3.0 Standard
  vcard: function (fields) {
    const fn = (fields.fn || '').trim();
    const ln = (fields.ln || '').trim();
    if (!fn && !ln) return { error: 'Please enter at least a first or last name.' };

    const fullName = [fn, ln].filter(Boolean).join(' ');
    const org = (fields.org || '').trim();
    const title = (fields.title || '').trim();
    const phone = (fields.phone || '').trim();
    const email = (fields.email || '').trim();

    let lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${ln};${fn};;;`,
      `FN:${fullName}`
    ];

    if (org) lines.push(`ORG:${org}`);
    if (title) lines.push(`TITLE:${title}`);
    if (phone) lines.push(`TEL;TYPE=CELL:${phone}`);
    if (email) lines.push(`EMAIL;TYPE=INTERNET:${email}`);
    lines.push('END:VCARD');

    return { payload: lines.join('\n'), label: `Contact: ${fullName}` };
  },

  // Email (mailto:email@domain.com?subject=...&body=...)
  email: function (fields) {
    const email = (fields.email || '').trim();
    if (!email) return { error: 'Recipient email is required.' };
    const subject = (fields.subject || '').trim();
    const body = (fields.body || '').trim();

    let payload = `mailto:${encodeURIComponent(email)}`;
    const params = [];
    if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
    if (body) params.push(`body=${encodeURIComponent(body)}`);
    if (params.length) payload += `?${params.join('&')}`;

    return { payload, label: `Email: ${email}` };
  },

  // Phone Call (tel:+1234567890)
  phone: function (fields) {
    const phone = (fields.phone || '').trim().replace(/[\s\-()]/g, '');
    if (!phone) return { error: 'Phone number is required.' };
    return { payload: `tel:${phone}`, label: `Phone: ${phone}` };
  },

  // SMS (SMSTO:+1234567890:Message text)
  sms: function (fields) {
    const phone = (fields.phone || '').trim().replace(/[\s\-()]/g, '');
    if (!phone) return { error: 'Recipient phone number is required.' };
    const body = fields.body || '';
    const payload = `SMSTO:${phone}:${body}`;
    return { payload, label: `SMS: ${phone}` };
  },

  // WhatsApp (https://wa.me/<number>?text=<encoded text>)
  whatsapp: function (fields) {
    let phone = (fields.phone || '').trim().replace(/[^0-9]/g, '');
    if (!phone) return { error: 'WhatsApp phone number with country code is required.' };
    const text = fields.text || '';
    let payload = `https://wa.me/${phone}`;
    if (text) {
      payload += `?text=${encodeURIComponent(text)}`;
    }
    return { payload, label: `WhatsApp: +${phone}` };
  },

  // Social profile URL. Usernames are converted only for documented platform
  // profile routes; "Other" deliberately requires a complete HTTPS/HTTP URL.
  social: function (fields) {
    const platform = (fields.platform || 'instagram').toLowerCase();
    const profile = (fields.profile || '').trim();
    if (!profile) return { error: 'Enter a profile URL or username.' };

    if (/^https?:\/\//i.test(profile)) {
      try {
        const url = new URL(profile);
        return { payload: url.href, label: 'Social Media QR' };
      } catch {
        return { error: 'Enter a valid profile URL.' };
      }
    }

    const routes = {
      instagram: { base: 'https://www.instagram.com/', pattern: /^[A-Za-z0-9._]{1,30}$/ },
      facebook: { base: 'https://www.facebook.com/', pattern: /^[A-Za-z0-9.]{1,50}$/ },
      youtube: { base: 'https://www.youtube.com/@', pattern: /^[A-Za-z0-9._-]{3,30}$/ },
      tiktok: { base: 'https://www.tiktok.com/@', pattern: /^[A-Za-z0-9._]{1,24}$/ },
      x: { base: 'https://x.com/', pattern: /^[A-Za-z0-9_]{1,15}$/ },
      linkedin: { base: 'https://www.linkedin.com/in/', pattern: /^[A-Za-z0-9-]{3,100}$/ },
      snapchat: { base: 'https://www.snapchat.com/add/', pattern: /^[A-Za-z0-9._-]{1,30}$/ },
      pinterest: { base: 'https://www.pinterest.com/', pattern: /^[A-Za-z0-9._-]{1,50}$/ },
      telegram: { base: 'https://t.me/', pattern: /^[A-Za-z0-9_]{5,32}$/ }
    };
    const route = routes[platform];
    if (!route) return { error: 'For Other, enter a complete profile URL beginning with https://.' };

    const username = profile.replace(/^@/, '');
    if (!route.pattern.test(username)) {
      return { error: 'Enter a valid username for the selected platform, or use a full profile URL.' };
    }
    return { payload: route.base + encodeURIComponent(username) + (platform === 'instagram' || platform === 'pinterest' ? '/' : ''), label: 'Social Media QR' };
  },

  // UPI Payment (upi://pay?pa=...&pn=...&am=...&cu=INR&tn=...)
  upi: function (fields) {
    const vpa = (fields.vpa || '').trim();
    if (!vpa) return { error: 'UPI ID (VPA) is required.' };
    const name = (fields.name || '').trim();
    const amount = (fields.amount || '').trim();
    const note = (fields.note || '').trim();

    let params = [
      `pa=${encodeURIComponent(vpa)}`,
      `pn=${encodeURIComponent(name || vpa)}`,
      'cu=INR'
    ];
    if (amount) {
      // Accept conventional positive INR amounts only; Number() alone accepts
      // invalid formats such as exponent notation and silently loses precision.
      if (!/^\d+(?:\.\d{1,2})?$/.test(amount) || Number(amount) <= 0 || Number(amount) > 99999999.99) {
        return { error: 'Enter a positive amount with up to 2 decimal places.' };
      }
      params.push(`am=${encodeURIComponent(Number(amount).toFixed(2))}`);
    }
    if (note) {
      params.push(`tn=${encodeURIComponent(note)}`);
    }

    const payload = `upi://pay?${params.join('&')}`;
    return { payload, label: `UPI: ${vpa}` };
  },

  // Geographic Location (geo:lat,lon or maps URL)
  location: function (fields) {
    const lat = (fields.lat || '').trim();
    const lon = (fields.lon || '').trim();
    if (!lat || !lon) return { error: 'Both latitude and longitude are required.' };
    if (isNaN(Number(lat)) || isNaN(Number(lon))) {
      return { error: 'Latitude and Longitude must be valid numbers.' };
    }
    const payload = `geo:${lat},${lon}?q=${lat},${lon}`;
    return { payload, label: `Location: ${lat}, ${lon}` };
  },

  // iCalendar Event (VEVENT)
  event: function (fields) {
    const title = (fields.title || '').trim();
    if (!title) return { error: 'Event title is required.' };

    const formatCalDate = (isoStr) => {
      if (!isoStr) return '';
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const start = formatCalDate(fields.start);
    const end = formatCalDate(fields.end);
    const loc = (fields.location || '').trim();

    let lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'BEGIN:VEVENT',
      `SUMMARY:${title}`
    ];
    if (start) lines.push(`DTSTART:${start}`);
    if (end) lines.push(`DTEND:${end}`);
    if (loc) lines.push(`LOCATION:${loc}`);
    lines.push('END:VEVENT');
    lines.push('END:VCALENDAR');

    return { payload: lines.join('\n'), label: `Event: ${title}` };
  }
};
