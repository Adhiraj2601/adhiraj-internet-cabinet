# Adhiraj's Internet Cabinet

A personal corner of the internet. Things I build, books I read, ideas I collect.

## Stack

- React + TypeScript
- Vite
- Tailwind CSS v4
- Framer Motion
- React Router DOM

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Content

All content is data-driven and lives in `src/content/`:

- `projects.ts` — Projects and work
- `posts.ts` — Notes and journal entries
- `books.ts` — Reading list with notes
- `experiments.ts` — Lab experiments and ideas

## Design tokens

CSS variables in `src/styles/globals.css`:

```css
--background: #F4F1EA
--foreground: #171717
--muted: #77736B
--border: rgba(23,23,23,0.15)
--accent: #315CFF
```

## Deployment

Deployable to Vercel. `vercel.json` handles SPA routing.
