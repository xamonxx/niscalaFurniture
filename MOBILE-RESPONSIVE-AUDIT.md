# Mobile Responsiveness Audit - Niscala Furniture

Audit date: 2026-09-09
Method: Chromium with mobile device emulation (touch, Android UA, DPR 2) driving
the local dev server at `http://localhost:3000`. Layout measured from the DOM
(`getBoundingClientRect`, `getComputedStyle`, `scrollX` probing) rather than from
screenshots, so every number below is a measurement, not an impression.

## Coverage

Viewports (CSS px):

| Viewport | Represents |
| --- | --- |
| 320x568 | iPhone SE 1st gen, Galaxy Fold cover, smallest realistic phone |
| 360x800 | Galaxy A/S series, most common Android width worldwide |
| 390x844 | iPhone 12/13/14/15/16, Pixel 7/8 |
| 430x932 | iPhone Pro Max |
| 667x375 | any phone rotated to landscape (crosses the `sm:` breakpoint) |

Templates: `/`, `/portfolio`, `/portfolio/kategori/[slug]`, `/portfolio/[slug]`,
`/services`, `/knowledge`, `/knowledge/[slug]`, `/about`, `/survey`, `/contact`,
`/privacy`, and the 404.

## Executive summary

The layout itself is in very good shape. **Zero horizontal overflow on every
template at every width tested**, portrait and landscape - confirmed not by
comparing `scrollWidth` (which reports scrollbar noise under emulation) but by
calling `window.scrollTo(500, 0)` and observing `scrollX` stay at `0`. Responsive
images, mobile typography scale, the gallery carousel and the before/after
slider are all correctly built for touch.

Five defects were found and all five are fixed. One was a blocking interaction
bug, one damaged the primary conversion form, three were polish. A sixth turned
up while verifying the fifth and is fixed too (P6, below).

## Findings

### P1 - Mobile menu is unusable in landscape - FIXED 2026-09-09

`src/components/layout/mobile-menu.tsx:40`

`Dialog.Content` is positioned `fixed left-space-md right-space-md top-space-md`
with **no `max-height` and `overflow-y: visible`**, while Radix locks
`body { overflow: hidden }` behind it.

Measured at 667x375 (`/services`, same on every page):

```
viewport height      375px
dialog height        466px
overflows viewport   +95px
body overflow        hidden   <- cannot scroll to reach the remainder
```

Unreachable items: the **Kontak** link (bottom edge 377px) and the
**Konsultasi via WhatsApp** button (bottom edge 445px). The panel is
`lg:hidden`, i.e. active up to 1023px, so this covers every phone in landscape
and every tablet in portrait below 1024px. Portrait phones are fine today
(486px panel in a 568px viewport at 320x568) but have only ~78px of headroom, so
one more nav link would break portrait too.

Fix applied:

```diff
-<Dialog.Content className="fixed ... top-space-md z-[70] origin-top rounded-lg ...">
+<Dialog.Content
+  data-lenis-prevent
+  className="fixed ... top-space-md z-[70] max-h-[calc(100dvh-2rem)] origin-top overflow-y-auto overscroll-contain rounded-lg ..."
+>
```

`data-lenis-prevent` matches the pattern already used on the `<select>` popup:
on a narrow desktop window the pointer is fine, so Lenis is running and would
otherwise take the wheel off the panel.

### P2 - 14px form controls make iOS zoom the survey form - FIXED 2026-09-09

`src/components/forms/fields.tsx:57` - `controlClasses` sets `text-body-sm`,
which is 14px.

Measured on `/survey` at 360x800, every control on the address step:

| Control | Font size | Height |
| --- | --- | --- |
| `select[name=province]` | 14px | 46px |
| `input[name=city]` | 14px | 46px |
| `input[name=district]` | 14px | 46px |
| `textarea[name=address]` | 14px | 86px |

iOS Safari auto-zooms the page whenever a focused control renders below 16px.
The visitor taps the first field, the page jumps to ~1.3x, and they have to
pinch back out - on the site's main conversion path. `-webkit-text-size-adjust`
does not suppress this; only a 16px control does.

Heights (46px) and the wizard's option cards (47px) are already fine, so this is
purely the font size.

Fix applied - `pointer-coarse:text-body-md` on `controlClasses`, keyed on the
input device rather than a width breakpoint, because a phone in landscape is
wider than `sm` and still zooms:

```diff
-  "... px-space-md py-space-sm text-body-sm text-on-surface " +
+  "... px-space-md py-space-sm text-body-sm pointer-coarse:text-body-md text-on-surface " +
```

### P3 - `env(safe-area-inset-bottom)` never resolves - FIXED 2026-09-09

`src/components/layout/sticky-mobile-cta.tsx` applied
`paddingBottom: env(safe-area-inset-bottom)`, but `src/app/layout.tsx` exports a
viewport without `viewportFit`. The served tag is:

```html
<meta name="viewport" content="width=device-width, initial-scale=1"/>
```

Without `viewport-fit=cover`, `env(safe-area-inset-*)` is defined as `0`, so the
padding resolved to nothing and only looked like it was doing the work.

**Resolved by making the code honest, not by opting into `cover`.** The inert
`style` prop is gone and the reasoning now lives in the component's doc comment,
so the next person neither re-adds dead code nor breaks the bar by turning
`cover` on without the rest.

The case against `cover` here:

- Portrait, which is nearly all mobile traffic, gains nothing. iOS puts the home
  indicator over Safari's own toolbar there, not over the page, and the bar is
  already clear of it.
- The only visible gain is landscape on a notched iPhone, where the notch band
  currently paints `bg-surface` warm white beside the black hero.
- The cost is five surfaces that each need their own insets - `container-editorial`,
  the header, this bar, the mobile menu panel, and the footer's bottom padding,
  which at 96px would no longer clear a bar that grows to ~99px. Five new places
  where a miss puts content under a notch.

Going edge to edge is a visual decision, not a responsiveness fix. If it is ever
wanted, the component comment lists exactly what it touches.

### P4 - Touch targets below platform guidance - FIXED 2026-09-09

None of these failed WCAG 2.2 AA 2.5.8 - the footer nav cleared it on the 24px
spacing exception (19px tall on a 28px pitch), and the filter chips were exactly
24px tall, which meets the minimum. But none reached Apple's 44pt or Android's
48dp either, and several are primary actions.

| Element | Was | Now (coarse pointer) | Where |
| --- | --- | --- | --- |
| Arrow rows ("Lihat 5 proyek", "Semua proyek", "Baca Panduan") | 16px tall | 44px reachable | `arrowRowClasses` in `src/components/ui/typography.tsx` |
| Footer nav rows | 19px, 28px pitch | 320x44, 44px pitch | `footerRowClasses` in `src/components/layout/footer.tsx` |
| Footer contact rows | ~20px | 320x44 | same |
| Category filter chips | 24px, 4px gaps | 44px, 8px gaps | `src/components/portfolio/category-filter.tsx` |
| Footer social icons | 36x36 | 44x44 | `src/components/layout/social-links.tsx` |
| Menu trigger and close | 40x40 | 44x44 | `src/components/layout/mobile-menu.tsx` |
| Gallery arrows | 40x40 | 44x44 | `src/components/portfolio/project-gallery.tsx` |
| `size="sm"` buttons ("Reservasi Konsultasi", "Chat Sekarang") | 34px tall | 44px tall | `src/components/ui/button.tsx` |

Two techniques, chosen by whether the neighbours leave room.

**Where there is clear space, the hit area grows and the layout does not.** A
new `tap-safe` utility in `globals.css` lays a 44px transparent pseudo-element
over the control, so the type keeps the size and rhythm it was drawn at:

```css
@utility tap-safe {
  position: relative;

  @media (pointer: coarse) {
    &::after {
      content: "";
      position: absolute;
      inset-inline: 0;
      top: 50%;
      translate: 0 -50%;
      height: 100%;
      min-height: 2.75rem;
    }
  }
}
```

**Where neighbours sit closer than ~14px, the rows themselves grow.** The footer
lists are 8px and 4px apart, so a pseudo-element on each would overlap the rows
above and below it and the topmost would swallow taps meant for its neighbours.
Those rows take real height (`pointer-coarse:flex min-h-11 items-center`) and the
lists drop their own `space-y` on touch, so the spacing comes from the rows.

The inline `Kebijakan Privasi` link in the footer's bottom bar is deliberately
left alone: it sits inside a sentence, where a block-level 44px row would break
the line it belongs to. WCAG's inline exception covers it.

Everything is keyed on `pointer: coarse`, the same rule as the P2 fix, so a
1280px desktop is byte-for-byte unchanged: chips still 97x24, footer rows still
54x19, social still 36x36, and no `::after` is generated at all.

#### Correction to the original write-up

The component is `TextLink`, not `ArrowLink`, and the first version of this
report said the six hand-built copies "should be replaced by it". They cannot:
two of them are back links carrying a leading `ArrowLeft`, which `TextLink` has
no way to express, and the rest would pick up its hover underline sweep - a
redesign, not a fix. What they actually shared was the class string, so that is
what was extracted, as `arrowRowClasses`. All seven now compose it with their
own colour, and `tap-safe` reaches every one of them from a single place.

### P5 - 11px eyebrow labels - FIXED 2026-09-09

`--text-label-eyebrow` was 11px/14px, used 56 times on the homepage alone. For
pure decoration that is defensible, but some of it is content: the step captions
in the process section, the "Sebelum"/"Sesudah" labels on the before/after
frame, the footer's service taglines.

Now 12px/16px in `src/app/globals.css`. Tracking (0.12em) and weight (600) are
unchanged.

Unlike P2 and P4 this is **not** scoped to coarse pointers - it is a token, so
desktop moves with it. That is deliberate: 11px is under the floor on a monitor
too, and splitting one type token by input device would be the odd thing in this
system, not the fix.

Verified at 320px, the width where a 9% wider label is most likely to break
something: 56 eyebrows on `/`, 15 on `/services`, **none overflowing**, and
`scrollX` still `0`. The two at-risk shapes both absorb it - the absolute
"Sebelum"/"Sesudah" badges size to their own content, and the hero caption is
capped in `ch`, which scales with the font.

## Verified clean

- **No horizontal overflow** on any template at 320, 360, 390, 430 or 667px.
  The CTA banner's 130vw curve is correctly contained by `overflow-x-clip`, and
  the hero collage's ~5px bleed is clipped by the hero's `overflow-hidden`.
- **Responsive images are correct.** `sizes` matches the real mobile layout on
  every component; a 360px-wide slot at DPR 2 resolves to the `w=750` candidate,
  and the optimiser serves it at 750x938. Source assets are 1280x1600.
  `process-storytelling`'s `sizes="38vw"` looks wrong out of context but that
  panel is `hidden lg:block`, so it never renders on a phone.
- **Pinch zoom is allowed** - no `maximum-scale` or `user-scalable=no`.
- **Article typography scales properly.** At 320px: h1 36/42, h2 26/32, body
  18/29.
- **Gallery is a real carousel below `md`** with 40x40 arrows and a live
  "Foto n dari m" counter, and deactivates itself into a grid above it.
- **Before/after is a real `<input type="range">`** rendering 320x200 on mobile -
  one of the best touch targets on the site - with the scroll-pinned variant
  correctly restricted to `lg` and tall viewports.
- **Sticky CTA behaves.** It steps aside for the survey form, sets
  `aria-hidden` and `tabIndex={-1}` when concealed, and its 65px height clears
  the footer's 96px bottom padding.
- **FAQ accordion triggers** are full-width with `p-space-lg`.
- **Survey option cards** are 47px tall; the phone fields carry `type="tel"` and
  `inputMode="tel"`.

## P6 - Sticky CTA buttons wrap at 320px - FIXED 2026-09-09

Not one of the original five, and not caused by any of the fixes - the sticky
bar's markup and every token it used were untouched. It surfaced because P5 sent
me back to 320px to re-measure.

At 320px the row gives each button 140px. Measuring the label in its own
rendered face rather than estimating:

```
button width                 140px
  padding 16px either side   -32
  gap                         -4
  icon                       -16
  = room for the label         88px
"Ajukan Survey" needs          95px   -> seven pixels short, wraps
"WhatsApp" needs               69px   -> fits
```

The row is `flex items-center`, so the wrapped button did not pull its neighbour
with it: one stood 56px, the other 40px, and the bar grew from 65px to 81px.

Fixed with two changes to `src/components/layout/sticky-mobile-cta.tsx`.

**The padding drops from 16px to 8px.** Horizontal padding is dead weight on a
`flex-1` button - the width comes from the row, not from the content, so the
only thing 16px was doing was squeezing the label. The buttons are the same
width they always were and the label is centred either way, so nothing moves;
the label just gets 104px instead of 88, nine more than it needs, which is
enough to survive the fallback face rendering wider than Manrope.

**The row becomes `items-stretch`.** That is the part that has to hold if a
future label is longer anyway: the two buttons then grow together instead of one
standing a head taller than the other. `whitespace-nowrap` was the other option
and was rejected - it turns a wrap into clipped text, which is a worse failure
than a tidy two-line pair.

| Viewport | Buttons | Bar height |
| --- | --- | --- |
| 320px | 140x40 and 140x40 | 65px (was 81px) |
| 360px | 160x40 and 160x40 | 65px |
| 430px | 195x40 and 195x40 | 65px |

## P7 - Hero sizing and layout - FIXED 2026-09-09

Raised from a screenshot of the hero on a phone, not from the sweep. Four
things were wrong at once, measured at 360x740:

| | Before | After |
| --- | --- | --- |
| Hero height | 828px | 756px |
| Headline | 44px, 4 lines, 192px tall | 40px, 3 lines, 132px |
| Buttons | 301x44 and 230x46 | 320 and 320, matched |
| Proof bar | 60px **below** the fold | 13px **above** it, fully visible |
| Stat captions | capped at 77px, wrapping | full 160px column |

### The buttons were the visible mistake

`flex flex-wrap` sizes each button to its own label. Side by side that is
right; stacked it produces two left-aligned buttons of different widths, which
reads as a bug rather than a pair. They are now a one-column grid until `sm` -
grid items stretch, so stacked they always match - and a row after it, with
`items-stretch` so the outline button's 1px border stops making it 46px against
its neighbour's 44px.

### The `10ch` cap belonged to the desktop layout

`max-w-[10ch]` keeps the captions honest across four columns. Below `sm` there
are two columns of about 154px and the cap squeezed them to 77px, wrapping every
label for no reason and making the proof bar 34px taller than it needed to be.
Now `sm:max-w-[10ch]`.

### Sizing

`--text-display-mobile` drops from 44px/48px to 40px/44px. It is the token every
display headline shares - hero, closing CTA, CTA banner - so they step down
together and the hierarchy above `headline-lg-mobile` (36px) holds. The hero
headline goes from four lines to three. The proof rule also gets symmetric
spacing (16px above and below instead of 24 above, 16 below).

### The fix that was not a hero fix at all

Making the full-width buttons give up their 32px of horizontal padding - dead
weight on a stretched button, exactly as in P6 - did nothing at first. Both
`px-space-xl` and `px-space-md` stayed on the element:

```
class="... px-space-xl py-space-sm text-label-lg px-space-md sm:px-space-xl"
computed padding-left: 32px
```

`space-xl` is neither a length nor an arbitrary value, so tailwind-merge cannot
file `px-space-xl` under padding-x at all, and a class it cannot classify is
never a conflict and so never dropped. The decision fell to the cascade, where
the override lost.

`src/lib/cn.ts` already fixed this exact bug class for the type scale - its
comment describes a black button that ended up with black text on it - so the
spacing scale is now declared there the same way, across the padding, margin and
gap groups. Any `className` override of a spacing utility now wins, which is
what every call site already assumed.

Verified at 320px: `px-space-xl` gone, padding 16px, both buttons 280px wide and
neither label wraps. At 706px: padding back to 32px, both buttons on one row at
equal height. At 320px the whole hero is still 878px against a 568px viewport -
an iPhone SE cannot hold this headline, a six-line paragraph, two buttons and a
four-figure proof bar on one screen, and shortening the copy is a content
decision, not a layout one.

## P8 - The secondary hero button was invisible - FIXED 2026-09-09

Raised from a screenshot. "Lihat Portofolio Proyek" was a 12% white hairline on
no fill at all, standing on a photograph. It had nothing to hold on to: over a
busy frame the border crossed light and dark parts of the picture within its own
length, so the shape kept breaking up and the control read as an accident.

| | Before | After |
| --- | --- | --- |
| Fill | none | 10% white |
| Border | 12% white | 25% white |
| Backdrop | none | `blur(12px)` |
| Edge | none | 18% white inset highlight along the top |
| Lift | none | `0 8px 24px -12px` at 70% of the deep black |
| Hover | border to full white, 10% fill | border to 50%, fill to 20% |

The fill is what makes it visible and the blur is what keeps it calm - the wash
lifts it off any ground, and blurring what sits behind it stops the
photograph's detail from competing with the label. The inset highlight is the
top edge catching light, which is what separates the shape from a *bright* patch
of photograph, where a drop shadow can do nothing.

The order degrades correctly: the wash and the border are ordinary paint, so a
browser without `backdrop-filter` still gets something plainly a button. The
blur is additive.

`outline-inverse` is used in exactly one place, the hero, so the blast radius is
that button. The label keeps `#f2f1ec` on a dark composite, so text contrast is
unchanged and high; what changed is that the *shape* is now carried by a fill
rather than by a hairline alone.

## P9 - The survey form's last step ran off the screen - FIXED 2026-09-09

Raised from a screenshot, and worse than the screenshot showed. **The original
sweep missed this entirely** because it never filled the form: steps 1-3 carry a
short "Lanjut" button and look fine, and only the last step has a label long
enough to break the row. Reaching it needed the wizard driven through four steps
of validation with real values.

At 320px, on the last step:

| | Before | After |
| --- | --- | --- |
| `document.scrollWidth` | 374px against a 320px viewport | 320px |
| Submit past the card's edge | +75px | inside it, by 24 |
| Submit past the screen's edge | +55px | inside it, by 44 |
| "Kembali" / submit widths | 147 and 160 | 232 and 232 |
| Submit height | 84px, label on three lines | 64px, two lines |
| Step indicator | overflowed its line by 8px | fits |

**Part of the primary action of the whole form was off the side of the phone.**

### Why

The footer was a `justify-between` row. In a 216px line `Kembali` took 147 of
it, and the submit button - which cannot shrink below its own minimum content
width - started at x=215 and ran 160px wide, straight out of the card and off
the viewport, with its label broken over three lines to fit a box that was
itself too small. Nothing clipped it, so it simply hung there.

### Fixed in four places

1. **The footer stacks below `sm`** and is a row above it. One column means both
   buttons are exactly as wide as the form and neither can push the other
   anywhere. `sm:items-stretch` keeps them level once they sit side by side,
   since the outline variant's 1px border would otherwise make it 46 against 44.
2. **The buttons drop 32px of horizontal padding to 16 below `sm`** - dead
   weight on a full-width button, the same trade as P6 and P7, and only
   possible at all because of the `cn` fix in P7.
3. **The card gives 8px back**, `p-space-xl` to `p-space-lg` on a phone. A 320px
   screen already spends 40px on the container's margins; another 64px here left
   the form 216px to work in.
4. **The step connector shrinks**, `w-6` to `w-4` below `sm`. Four 28px circles
   and three 24px rules plus gaps came to 224px in a 216px line.

### Verified

| Viewport | Layout | Buttons | Page width |
| --- | --- | --- | --- |
| 320px | stacked | 232x46 and 232x64 (two lines) | 320, no overflow |
| 360px | stacked | 272x46 and 272x44 (one line) | 360, no overflow |
| 720px | row, `justify-between` | 147x46 and 278x46, level | 720, no overflow |

The form is rendered on `/`, `/contact` and `/survey`, so this was on the
homepage too. All three now report `scrollWidth === clientWidth` at 320px with
zero overflowing elements.

## P10 - The before/after slider hid its own payoff on mobile - FIXED 2026-09-09

Raised from a screenshot showing the divider at the middle. **That was not the
default.** Measured on the running site and on production, the divider opened at
`--pos: 100` - fully closed, showing only the *before* photograph. What the
screenshot showed was the state after someone dragged it.

Chasing that discrepancy turned up the real defect.

### The section had two behaviours and only described one

The pinned scroll reveal exists at `lg` and above, in a window at least 640px
tall, with motion allowed. Everywhere else - which is every phone - the effect
does not attach at all: `if (!query.matches) return`. So on a phone:

- The divider opened fully closed, and the caption read "Ruangan terbuka sendiri
  saat Anda menggulir" - the room opens by itself as you scroll. Nothing was
  going to open by itself. The visitor scrolled and waited for it.
- The *after* photograph, which is the entire point of the section, stayed
  hidden behind a drag gesture nobody was told about.

That is precisely the failure the component's own doc comment says it was built
to solve on desktop - it was simply never solved for phones.

### Fixed

1. **A resting split.** `RESTING_POS = 50`. The opening value now comes from a
   class, `[--pos:50] lg:[--pos:100]`, not an inline style, so the two layouts
   can differ without the page painting the wrong one first. Fully closed only
   where the scroll is about to open it; half and half everywhere else, where
   both photographs are on screen at once and the seam advertises the control.
2. **The input agrees with the picture.** `settle()` puts the range input's
   value and its `aria-valuetext` on the same number. Before this the picture
   could show 50 while a screen reader read out "100% menampilkan kondisi
   sebelum".
3. **The caption follows the behaviour.** Two spans, switched on
   `motion-safe:lg:[@media(min-height:640px)]` - the same condition the tall
   track itself is built on, so the promise and the behaviour cannot drift.
4. **A short window counts as no runway.** A 1280x600 laptop is over the width
   breakpoint but has no track to scroll, so it now settles at 50 like a phone
   instead of sitting closed over the photograph worth seeing.

### Verified

| Viewport | `--pos` | Input value | Caption |
| --- | --- | --- | --- |
| 360x740 phone | 50 | 50 | "Geser pembatas..." |
| 1280x600 short desktop | 50 | 50 | "Geser pembatas..." |
| 1280x900 desktop | 100 | 100 | "Ruangan terbuka sendiri..." |

The divider's opening position and the caption now agree in every case.

### A note on verifying this one

The first three measurements said `settle()` never ran. It was not the code: no
client component on the page was hydrated - the Radix accordion would not open
either, and a dispatched `input` event never reached React. The Browser pane had
stalled hydration for the whole route. A fresh load fixed it, and every number
above was taken with hydration proved first by expanding the accordion.

## Status

| ID | Item | Status |
| --- | --- | --- |
| P1 | Mobile menu capped and scrollable | Fixed 2026-09-09 |
| P2 | 16px form controls on coarse pointers | Fixed 2026-09-09 |
| P4 | 44px touch targets on coarse pointers | Fixed 2026-09-09 |
| P3 | Inert `env()` removed, `viewport-fit` left alone | Fixed 2026-09-09 |
| P5 | Eyebrow 11px -> 12px | Fixed 2026-09-09 |
| P6 | Sticky CTA buttons wrap at 320px | Fixed 2026-09-09 (found during verification) |
| P7 | Hero sizing and layout, and the `cn` spacing bug behind it | Fixed 2026-09-09 (raised from a screenshot) |
| P8 | Secondary hero button given a glass surface | Fixed 2026-09-09 (raised from a screenshot) |
| P9 | Survey form's last step ran off the screen | Fixed 2026-09-09 (missed by the original sweep) |
| P10 | Before/after slider opened closed on mobile, with copy that did not apply | Fixed 2026-09-09 (raised from a screenshot) |

### Verification

Re-measured on the same emulated devices after each change.

**P1**, at 667x375 with the menu open:

```
dialog height     343px  (was 466px)
fits viewport     yes
overflow-y        auto
overscroll        contain
inner scroll      122px of range
unreachable       none - "Kontak" and "Konsultasi via WhatsApp" both reachable
```

At 320x568 portrait the panel is unchanged at 486px and `scrollHeight ===
clientHeight`, so the cap only engages where it is needed.

**P2**, on `/survey` step 2:

| Context | `pointer` | Control font | Control height |
| --- | --- | --- | --- |
| 360x800 emulated phone | coarse | 16px | 50px |
| 1280px desktop | fine | 14px | unchanged |

**P4**, at 360x800. The pseudo-element is invisible to
`getBoundingClientRect`, so it was verified with `document.elementFromPoint`
instead - the only test that proves a thumb would actually land on the link:

```
"Lihat 5 proyek", drawn 16px tall
  centre -20px -> LINK
  centre -10px -> LINK
  centre   0   -> LINK
  centre +10px -> LINK
  centre +20px -> LINK
  centre +30px -> the neighbouring div, as it should be
```

Measured sizes on touch: footer nav rows 320x44 on a 44px pitch, footer contact
rows 320x44, filter chips 44px tall with 8px gaps, social icons 44x44, menu
trigger 44x44, gallery arrows 44x44, `size="sm"` buttons 272x44.

The risk with an invisible hit area is that it steals taps from whatever sits
beside it, so every interactive element on `/services` (43 of them) and `/about`
(37) was hit-tested at its own centre: **0 stolen** on both.

On a 1280px desktop nothing changed - chips 97x24, footer rows 54x19, social
36x36, and `getComputedStyle(el, '::after')` returns no box at all.

No regressions: `window.scrollTo(500, 0)` still leaves `scrollX` at `0` on `/`,
`/portfolio`, `/portfolio/[slug]`, `/knowledge/[slug]`, `/about`, `/contact` and
`/survey` at 320 and 360px. `npm run lint`, `npm run typecheck` and
`npm run build` all pass, and the production CSS carries
`@media (pointer:coarse){.tap-safe:after{...}}` as expected.
