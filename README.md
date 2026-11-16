# Teige builds things

A minimal, accessible Astro blog for documenting hobby projects.

- Light / dark mode (follows your OS until a visitor picks one; no flash on load)
- Font switcher (**Aa** button): Lexend → OpenDyslexic → Atkinson Hyperlegible, remembered per visitor
- Animations: page transitions, post titles that morph between list and post page, staggered entrances, scroll-reveal, a circular theme-switch reveal, a reading progress bar, and hover micro-interactions
- All motion turns off automatically when the visitor has "reduce motion" set
- Posts in Markdown/MDX with type-checked frontmatter, tags, reading time, RSS, sitemap, and Open Graph tags for LinkedIn previews
- Fonts are self-hosted (no Google Fonts requests)

## Get started

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # outputs static site to dist/
npm run preview    # serve the built site locally
```

Requires Node 22.12+.

## Make it yours

1. `src/consts.ts`: site title, description, GitHub and LinkedIn URLs
2. `astro.config.mjs`: set `site` to your real domain
3. `src/pages/about.astro`: your bio
4. Colors are CSS variables at the top of `src/styles/global.css`
5. Delete `src/content/blog/formatting-demo.md` once you have a real post

## Writing a post

Copy `src/content/blog/_template.md` to `src/content/blog/my-project.md` and edit it.
The file name becomes the URL (`/blog/my-project/`).

Frontmatter fields:

| Field         | Required | Notes                                                        |
| ------------- | -------- | ------------------------------------------------------------ |
| `title`       | yes      |                                                              |
| `description` | yes      | Used on the home page, in RSS, and in LinkedIn link previews |
| `pubDate`     | yes      | `2026-11-16`                                                 |
| `tags`        | no       | `['3d-printing', 'python']`                                  |
| `status`      | no       | `idea`, `in-progress`, `shipped`, `shelved`                  |
| `repo`/`demo` | no       | Full URLs; shown as links under the title                    |
| `updatedDate` | no       |                                                              |
| `draft`       | no       | `true` = visible in `npm run dev` only                       |

Use `.mdx` instead of `.md` if you want to embed components in a post.

## Deploy to Cloudflare

1. Push this folder to a GitHub repo.
2. In the Cloudflare dashboard go to **Workers & Pages → Create → Import a repository** and pick the repo.
3. Build command: `npm run build`. Output directory: `dist`.
4. Add your custom domain under the project's **Domains** settings.

Every push to `main` redeploys automatically, and pull requests get preview URLs.
The same build settings work on Netlify or Vercel.
