<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Niscala Furniture — project rules

Read this before touching anything. It is the entry point: `CLAUDE.md` imports
this file, and other agents read `AGENTS.md` directly.

## Record every change

After any change that alters behaviour, output, build steps or deploy steps,
**add an entry to `CHANGELOG.md`** under `## Unreleased`, newest first. One
entry, in this shape:

```
### <short title>
- **What** one or two sentences.
- **Why** the reason, with the number or symptom that forced it where there is one.
- **Watch** what a later change could break by not knowing this. Omit if nothing.
```

Skip it only for pure typo fixes and formatting. The point is that the next
agent — and the other developer — can see why the code is shaped this way
without re-deriving it. If you find yourself re-discovering something the hard
way, that is a missing entry: add it.

## Which document is authoritative

| Question | File |
| --- | --- |
| What changed, and why | `CHANGELOG.md` |
| How to branch, review, and sync between developers | `CONTRIBUTING.md` |
| Stack, folder map, routing, data flow | `CODEX_MEMORY.md` |
| Setup, image pipeline, deploy | `README.md` |
| Rules and traps (this file) | `AGENTS.md` |
| Moving a second developer onto this repo | `SYNC-AGENT.md` |

Keep `CODEX_MEMORY.md` current when the structure moves. It is the map, and a
wrong map costs more than no map.

## Commands

| | |
| --- | --- |
| `npm run dev` | Dev server. Builds image variants first. |
| `npm run build` | Production build. Builds image variants first. |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run lint` | ESLint. Must report **0 errors** before a commit. |
| `npm run prepare:images` | Re-derives `public/images` from `BAHAN/`. Destructive — read the trap below. |
| `npm run prepare:variants` | Rebuilds `public/v`. Incremental. |
| `npm run prepare:blur` | Rewrites blur placeholders into the manifests. |

## Traps

Each of these has already cost someone real time.

**`public/v/` is generated and git-ignored, and the site is blank without it.**
Every `<img>` points there. `npm run build` creates it (~55s, ~40 MB). If you
deploy a tree you built locally, it must be uploaded too.

**The width ladder is a three-way contract.** `src/lib/image-ladder.mjs` is
imported by `next.config.mjs`, `scripts/build-image-variants.mjs` and
`src/lib/image-loader.ts`. Change it there and nowhere else — a ladder that
disagrees with the config puts srcset entries on files nobody wrote.

**`npm run prepare:images` wipes and renumbers.** Filenames are index-based
(`<slug>-01`, `-02`), and the script deletes each category directory before
rewriting it. Adding one photo that sorts early renumbers everything after it,
rewriting dozens of binary files that git cannot merge. One person owns
`BAHAN/` and runs this, in its own commit, never mixed with code.

**`src/data/custom-articles.json` is written by the running app.** The admin
panel edits it. So it appears as an uncommitted change after anyone uses
`/admin`, and a deploy overwrites whatever was edited live. Treat a diff there
as content, not code, and decide deliberately whether it ships.

**`public/uploads/articles/` is written by the running app and is not
git-ignored.** Uploaded images land in the repo. They also bypass the image
pipeline entirely — they are rendered with a plain `<img>`, not `next/image`.

**The admin panel fails closed and has no defaults.** `ADMIN_USERNAME`,
`ADMIN_SECRET` and one of `ADMIN_PASSWORD_HASH` / `ADMIN_PASSWORD` are all
required. Do not reintroduce a `||` fallback in `src/lib/auth.ts` - the previous
one put a working password and, worse, the session signing key into public
source, so anyone could forge a session cookie and skip the login form
entirely. `ADMIN_SECRET` must stay independent of the password.

**`next.config.mjs` must stay `.mjs`.** Hostinger's glibc is too old for the
SWC binary that would compile a `.ts` config, and the build dies before the
first page.

**The type scale must not invert.** `--text-display-mobile` has to stay above
`--text-headline-lg-mobile` (36px). If one heading needs to be smaller, do it
on that heading's own class, not on the shared token.

**Do not flatten `arrowRowClasses` into a literal class list.** It carries
`tap-safe`, which is the 44px touch target on links that draw 16px tall.
Layer overrides with `cn()` instead.

**The Next.js block at the top of this file is rewritten by `next dev`.**
Commit it with your work; deleting it from a diff only recreates it.
