# Loom 🧵

A landing site for **Loom** — a collaborative website studio. The pitch that
sets it apart from generic DIY builders: *we build your website **with** you,
not just for you.*

## What's inside

A fast, dependency-free static site:

- `index.html` — all sections (hero, process, services, why, showcase, pricing, start-a-project, footer)
- `styles.css` — dark, modern design system with gradients, hover states, and full responsiveness
- `script.js` — scroll progress, mobile menu, reveal-on-scroll, animated counters, and an interactive 3-step "Start a project" wizard with validation

No build step and no npm dependencies — it runs anywhere.

## Run it locally

```bash
# from this folder
python3 -m http.server 8099
# then open http://localhost:8099
```

Or open `index.html` directly in a browser.

## Notable features

- **3-step project wizard** with inline validation. Submissions are saved to
  `localStorage` (key `loom_requests`) since there's no backend yet — easy to
  swap for a real endpoint later.
- **Accessible**: keyboard-focusable cards, visible focus rings, reduced-motion support, ARIA labels.
- **Responsive** down to mobile with a slide-down menu.

## Next steps (ideas)

- Wire the wizard to a real backend or form service (Formspree, a serverless function, etc.)
- Add real project case studies to the Showcase section
- Hook up a CMS or blog
