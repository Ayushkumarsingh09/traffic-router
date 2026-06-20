# Standalone Traffic Router — Installation

Single file: **`traffic-router.js`**

## Quick install (Hostinger / cPanel / any host)

### Step 1 — Upload the file

Upload `traffic-router.js` to your website root, for example:

```
public_html/traffic-router.js
```

### Step 2 — Add one line to `index.html`

Open your site's `index.html` and add this **inside `<head>`**, as the **first script** (before CSS/JS):

```html
<script src="/traffic-router.js"></script>
```

If the file is in a subfolder:

```html
<script src="/assets/traffic-router.js"></script>
```

### Step 3 — Configure destinations

Edit the `CONFIG` block at the top of `traffic-router.js`:

```javascript
destinations: [
  { url: "https://open.spotify.com", weight: 40 },
  { url: "https://www.amazon.com", weight: 30 },
  { url: "https://www.google.com", weight: 20 },
  { url: "https://www.facebook.com", weight: 10 },
],
```

Weights are relative — 40/30/20/10 means 40%, 30%, 20%, 10%.

## Behavior

| Visitor | Result |
|---|---|
| Facebook in-app browser | Your website loads normally |
| Chrome, Safari, Firefox, desktop, other apps | Random redirect to one of your configured URLs |

## Optional settings

| Setting | Purpose |
|---|---|
| `debug: true` | Log decisions to browser console |
| `enableDesktopRedirect: true` | Send wide-screen visitors to `desktopRedirectUrl` |
| `skipPaths: ["/admin"]` | Never redirect certain paths |
| `detectReferrer: false` | Only use User-Agent for Facebook detection |

## Reuse on multiple sites

Copy the same `traffic-router.js` to each site and add the `<script>` tag. You can use different `CONFIG` per site by editing the top of the file.

## Testing

1. **Normal load test:** Open your site in Chrome → should redirect randomly.
2. **Facebook test:** Share the link in Facebook and open from the Facebook app → site should load normally.

## Notes

- Do **not** use `defer` or `async` on the script tag.
- Place the script in `<head>` for the fastest redirect on non-FB traffic.
- Your existing HTML/CSS/content does not need to change — only add the one script line.
