# TravelBloom — Travel Recommendation Website

A static travel recommendation website built with plain HTML, CSS, and vanilla JavaScript. No frameworks, no build step, no npm — deployable to GitHub Pages as-is.

## Features

- **Search destinations** by category (beach, temple, country, mosque) or by city/country name
- **Live local time** display for country/city results using IANA timezones
- **Responsive design** — mobile-first, tested at 320–1920px
- **Accessible** — semantic HTML5, ARIA labels, focus management, keyboard navigation
- **Contact form** with client-side validation

## Important: Running Locally

> **`fetch()` does not work over the `file://` protocol.** The site must be served via an HTTP server to load the JSON data.

### Options:
1. **VS Code Live Server** — Install the [Live Server extension](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer), right-click `index.html` → "Open with Live Server"
2. **Python** — `python -m http.server 8000` in the project directory
3. **Node.js** — `npx serve .` in the project directory
4. **GitHub Pages** — Push the repo and enable Pages in Settings

## File Structure

```
├── index.html                      (redirects to Home)
├── travel_recommendation.html      (Home page)
├── about_us.html                   (About Us page)
├── contact_us.html                 (Contact Us page)
├── travel_recommendation.css       (shared stylesheet)
├── travel_recommendation.js        (shared JavaScript)
├── travel_recommendation_api.json  (travel data)
└── images/
    ├── hero-bg.jpg                 (hero background)
    ├── location-1.jpg              (About Us — NYC)
    ├── location-2.jpg              (About Us — Toronto)
    └── placeholder.jpg             (fallback for broken images)
```

## Search Keywords

| Keyword | Results |
|---------|---------|
| `beach` / `beaches` | Beach destinations worldwide |
| `temple` / `temples` | Famous temples and shrines |
| `country` / `countries` | Cities from different countries |
| `mosque` / `mosques` | Notable mosques worldwide |
| City/country names (e.g. `tokyo`, `australia`, `canada`) | Matching destinations |

## License

See [LICENSE](./LICENSE) file.
