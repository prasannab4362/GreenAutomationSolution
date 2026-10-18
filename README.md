# Green Automation Solution — Website

A professional, premium single-page business website for **Green Automation Solution**, covering CCTV surveillance, home automation & IoT, robotics & AI education, smart agriculture, and industrial IoT.

---

## Project Structure

```
green-automation-solution/
├── index.html              ← Single-page website (all sections)
├── contact.php             ← PHP form processor (CSRF, validation, email)
├── config.example.php      ← Configuration template — copy to config.php
├── assets/
│   ├── css/
│   │   └── style.css       ← All styles (design system + responsive)
│   ├── js/
│   │   └── script.js       ← All JavaScript (navigation, animations, form)
│   └── images/             ← Website images
│       ├── hero_bg.jpg
│       ├── about_team.jpg
│       ├── service_cctv.jpg
│       ├── service_home_automation.jpg
│       ├── service_robotics.jpg
│       ├── service_agriculture.jpg
│       ├── service_industrial.jpg
│       ├── product_camera.jpg
│       ├── product_smart_switch.jpg
│       ├── product_iot_sensor.jpg
│       ├── product_robotics_kit.jpg
│       └── project_showcase.jpg
└── logs/                   ← Auto-created by contact.php (enquiry logs)
```

---

## Quick Start — Viewing Locally

### Option A: Open directly in browser (no form)

Simply open `index.html` in your web browser. All sections, navigation, animations, and layout will work.

> **Note:** The contact form will not submit without a PHP server. It will show a clear message if you try.

### Option B: Local PHP server (full form functionality)

Requires PHP 7.4+ installed.

```bash
# Navigate to project directory
cd green-automation-solution

# Start PHP built-in server
php -S localhost:8080

# Open in browser
# http://localhost:8080
```

### Option C: XAMPP / WAMP / Laragon (Windows)

1. Place the `green-automation-solution/` folder inside your `htdocs` directory.
2. Start Apache via the XAMPP control panel.
3. Open `http://localhost/green-automation-solution/` in your browser.

---

## Setting Up the Contact Form (PHP Hosting / cPanel)

### 1. Create your config file

```bash
cp config.example.php config.php
```

Open `config.php` and replace all placeholder values:

| Key | Description |
|-----|-------------|
| `recipient_email` | Email address where enquiries are delivered |
| `sender_name` | Display name in From: header |
| `sender_email` | Valid email on your domain |
| `phone` | Company phone number |
| `whatsapp` | WhatsApp number with country code (digits only) |
| `address` | Company address |
| `social_*` | Social media profile URLs |
| `send_auto_reply` | `true` to send acknowledgement to enquirer |
| `debug_skip_csrf` | **Always `false` in production** |

### 2. Create the logs directory

```bash
mkdir logs
chmod 755 logs
```

### 3. Add config.php to .gitignore

```
config.php
logs/
```

### 4. Upload to cPanel

Upload the entire `green-automation-solution/` folder via File Manager or FTP. The site works with standard shared PHP hosting. No Node.js, no npm, no build steps required.

---

## Updating Company Details

All editable contact details are clearly marked with `<!-- EDITABLE: -->` comments in `index.html`. Search for `EDITABLE` to find every placeholder quickly.

Items to update:

- **Phone number** — appears in nav, contact section, and footer
- **Email address** — appears in contact section and footer
- **WhatsApp number** — update all `wa.me/` links (search for `wa.me`)
- **Address** — appears in contact section and footer
- **Social media URLs** — in contact section and footer

---

## Customisation

### Colours

Edit CSS custom properties in `assets/css/style.css` at the top of the file:

```css
:root {
  --clr-navy:   #0a1628;   /* Primary background */
  --clr-green:  #22c55e;   /* Brand accent       */
  --clr-white:  #ffffff;   /* Headings           */
}
```

### Fonts

The site uses **Manrope** from Google Fonts. To change:

1. Update the `<link>` in `<head>` of `index.html`.
2. Update `--font-primary` in `style.css`.

### Adding Real Projects

Replace the sample project cards in the `#projects` section of `index.html`. Remove or update the yellow notice banner once real projects are listed.

### Adding Real Products

Replace the product card content in `#products`. Update product images in `assets/images/`.

### Privacy Policy

The Privacy Policy link in the footer currently links to `#`. Create a `privacy.html` file and update the `href` accordingly.

---

## Technology

| Component | Technology |
|-----------|------------|
| Structure | HTML5 (semantic) |
| Styling | CSS3 (custom properties, grid, flexbox) |
| Fonts | Manrope via Google Fonts |
| Interactions | Vanilla JavaScript (ES2020) |
| Form backend | PHP 7.4+ |
| Animation | CSS transitions + Intersection Observer API |
| Particles | HTML5 Canvas |

No frameworks. No npm. No build tools. Compatible with any standard PHP hosting.

---

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome 90+ | ✅ Full |
| Firefox 85+ | ✅ Full |
| Safari 14+ | ✅ Full |
| Edge 90+ | ✅ Full |
| IE 11 | ❌ Not supported |

---

## SEO

- Semantic HTML5 elements (`<section>`, `<article>`, `<header>`, `<footer>`, `<nav>`)
- Single `<h1>` per page
- Descriptive `alt` attributes on all images
- Meta title, description, Open Graph, and Twitter Card tags
- Accessible labels on all interactive elements
- Structured `aria-label` and `aria-labelledby` throughout

---

## Accessibility

- Keyboard navigation supported
- Focus indicators visible
- ARIA roles and labels on all major regions
- Screen-reader-only text (`.sr-only`) where needed
- Respects `prefers-reduced-motion` for animations

---

## Security (PHP form)

- CSRF token validation
- Honeypot anti-spam field
- Input sanitisation and whitelist validation
- File-based rate limiting (5 requests per 15 minutes per IP)
- Enquiry logging to `logs/enquiries.log`
- `config.php` excluded from public access (add to `.htaccess` if needed)

---

## Deployment Checklist

- [ ] Copy `config.example.php` to `config.php` and fill in real details
- [ ] Update all `<!-- EDITABLE -->` placeholders in `index.html`
- [ ] Update all `wa.me/` WhatsApp links with real number
- [ ] Create `logs/` directory on server (chmod 755)
- [ ] Set `debug_skip_csrf` to `false` in `config.php`
- [ ] Add `config.php` to `.gitignore`
- [ ] Upload via FTP or cPanel File Manager
- [ ] Test contact form submission end-to-end
- [ ] Confirm email delivery and auto-reply
- [ ] Review on mobile, tablet, and desktop

---

## Licence

This website was created for **Green Automation Solution**. All content, images, and code are intended for use by Green Automation Solution only.
