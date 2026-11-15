# Narrow to Now · Case study

DV2008 individual case study by Celine Emily Wijaya. A Goodreads redesign that helps readers pick one book from a long Want to Read list.

Plain HTML, CSS and JavaScript. No build step, so GitHub Pages can serve it as-is.

```
index.html      page content
styles.css      look and feel (matches celineemily.com)
main.js         starry sky, moon cursor + star trail, scroll reveals, image zoom
assets/img/     prototype screenshots (WebP)
.nojekyll       tells GitHub Pages to serve files untouched
```

## Preview locally

Open `index.html` in a browser, or run a tiny server from this folder:

```
python3 -m http.server 8000
```

then visit http://localhost:8000

## Deploy to GitHub Pages

1. Create a new repo on GitHub, for example `narrow-to-now`.
2. Upload everything in this folder (including `.nojekyll`) to the repo root, or:
   ```
   git init
   git add .
   git commit -m "Narrow to Now case study"
   git branch -M main
   git remote add origin https://github.com/<your-username>/narrow-to-now.git
   git push -u origin main
   ```
3. In the repo go to **Settings → Pages**, set **Source** to "Deploy from a branch", pick `main` and `/ (root)`, then Save.
4. After a minute it's live at `https://<your-username>.github.io/narrow-to-now/`.

To link it from celineemily.com, point the case study card's "Explore the case study" link at that URL.

## Editing

- Text lives in `index.html`, one `<section>` per part of the case study.
- Colours and fonts are CSS variables at the top of `styles.css`.
- The custom cursor only runs on devices with a mouse and turns off for people who prefer reduced motion.
