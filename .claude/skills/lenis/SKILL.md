---
name: lenis
description: Lenis smooth scroll library (darkroomengineering/lenis, npm "lenis") — setup in vanilla JS, React (ReactLenis/useLenis), Vue/Nuxt (VueLenis), GSAP ScrollTrigger sync, scrollTo, stop/start for modals, nested scroll, anchors, snap, reduced motion. Use when the user wants smooth scrolling, inertia/"buttery" scroll, Lenis, scroll syncing with GSAP/WebGL, or asks about lenis.scrollTo, data-lenis-prevent or lenis/snap.
license: MIT
---

# Lenis (smooth scroll)

Lenis smooths native scroll (it keeps the real page scroll, so `position: sticky`, `IntersectionObserver` and ScrollTrigger keep working). Based on Lenis v1.3.x docs.

## Install

```bash
npm i lenis
```

```js
import Lenis from 'lenis'
import 'lenis/dist/lenis.css' // ALWAYS include the recommended CSS
```

No build step (pin a version):

```html
<link rel="stylesheet" href="https://unpkg.com/lenis@1.3.27/dist/lenis.css">
<script src="https://unpkg.com/lenis@1.3.27/dist/lenis.min.js"></script>
<script>new Lenis({ autoRaf: true, anchors: true, allowNestedScroll: true })</script>
```

## Setup — pick exactly ONE frame loop

```js
// A) Standalone
const lenis = new Lenis({ autoRaf: true })

// B) Manual rAF
const lenis = new Lenis()
function raf(time) { lenis.raf(time); requestAnimationFrame(raf) }
requestAnimationFrame(raf)
```

Never combine `autoRaf: true` with a manual `lenis.raf()` call — it double-updates.

## With GSAP ScrollTrigger (most common pairing)

```js
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

gsap.registerPlugin(ScrollTrigger)

const lenis = new Lenis()                  // no autoRaf: GSAP's ticker drives it
lenis.on('scroll', ScrollTrigger.update)   // keep ScrollTrigger in sync
gsap.ticker.add((time) => lenis.raf(time * 1000)) // GSAP time is seconds → ms
gsap.ticker.lagSmoothing(0)
```

- Do NOT also use GSAP ScrollSmoother — pick one smooth scroller.
- Do not set `scroller:` on ScrollTriggers when Lenis uses the default window scroll.
- For scroll-to navigation use `lenis.scrollTo()`, not ScrollToPlugin (they fight).

## React / Next.js

```jsx
'use client'
import { ReactLenis, useLenis } from 'lenis/react'
import 'lenis/dist/lenis.css'

export default function Layout({ children }) {
  return (<><ReactLenis root />{children}</>)
}

function Nav() {
  const lenis = useLenis(({ scroll }) => { /* runs every scroll */ })
  return <button onClick={() => lenis?.scrollTo('#contact')}>Contact</button>
}
```

React + GSAP: let the GSAP ticker drive it.

```jsx
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ReactLenis } from 'lenis/react'
import { useEffect, useRef } from 'react'

export default function App() {
  const lenisRef = useRef()
  useEffect(() => {
    const update = (time) => lenisRef.current?.lenis?.raf(time * 1000)
    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)
    const unsubscribe = lenisRef.current?.lenis?.on('scroll', ScrollTrigger.update)
    return () => { gsap.ticker.remove(update); unsubscribe?.() }
  }, [])
  return <ReactLenis root options={{ autoRaf: false }} ref={lenisRef} />
}
```

`useLenis(callback, deps, priority)` returns the instance (may be `undefined` on first render — use `lenis?.`).

## Vue / Nuxt

```js
// main.js
import LenisVue from 'lenis/vue'
app.use(LenisVue)
// nuxt.config: modules: ['lenis/nuxt']
```

```vue
<script setup>
import { VueLenis, useLenis } from 'lenis/vue'
const lenis = useLenis((l) => { /* every scroll */ })
</script>
<template>
  <VueLenis root :options="{ lerp: 0.1 }" />
</template>
```

## Key options

| Option | Default | Notes |
|---|---|---|
| `autoRaf` | `false` | Run its own rAF loop |
| `lerp` | `0.1` | 0–1; lower = smoother/slower. Overrides `duration`/`easing` |
| `duration` / `easing` | `1.2` / expo-out | Only used if `lerp` is not set |
| `smoothWheel` | `true` | Smooth wheel input |
| `syncTouch` | `false` | Smooth touch too (unstable on iOS < 16) |
| `wheelMultiplier` / `touchMultiplier` | `1` | Speed |
| `orientation` / `gestureOrientation` | `vertical` | `horizontal`, `both` (gestures) |
| `anchors` | `false` | `true` or scrollTo options (`{ offset: -80 }`) to smooth `#hash` links |
| `allowNestedScroll` | `false` | Let inner scroll areas scroll natively (DOM check each event) |
| `prevent` | – | `(node) => boolean` to opt elements out |
| `autoToggle` | `false` | Stop/start from wrapper `overflow` (needs Lenis CSS) |
| `infinite` | `false` | Infinite scroll (needs `syncTouch` on touch) |
| `wrapper` / `content` | `window` / `<html>` | Custom scroll container |
| `respectReducedMotion` | `true` | Keep it on |

## API

```js
lenis.scrollTo(target, { offset, duration, easing, lerp, immediate, lock, force, onComplete })
// target: number (px) | CSS selector | Element | 'top' | 'bottom' | 'start' | 'end'
lenis.stop()     // e.g. when a modal opens
lenis.start()    // when it closes
lenis.resize()   // only if autoResize: false
lenis.destroy()  // on unmount / page teardown
const off = lenis.on('scroll', (l) => {}) // returns unsubscribe; also lenis.off(event, fn). l.scroll, l.velocity, l.direction, l.progress
lenis.on('virtual-scroll', ({ deltaX, deltaY, event }) => {})
```

Properties: `scroll`, `targetScroll`, `animatedScroll`, `velocity`, `direction` (1/-1), `progress` (0–1), `limit`, `isScrolling`, `isStopped`, `prefersReducedMotion`.

## Common situations

- **Modals / menus**: `lenis.stop()` on open, `lenis.start()` on close; mark the modal's scrollable area with `data-lenis-prevent`.
- **Nested scroll areas** (dropdowns, code blocks, chat): `data-lenis-prevent` (or `-wheel`, `-touch`, `-vertical`, `-horizontal`), or `allowNestedScroll: true`.
- **Sticky header offset**: `scrollTo('#id', { offset: -80 })` / `anchors: { offset: -80 }`.
- **Scroll to top on route change**: `lenis.scrollTo(0, { immediate: true })`.
- **Scroll snap**: CSS `scroll-snap` does not work with Lenis — use `lenis/snap`:
  ```js
  import Snap from 'lenis/snap'
  const snap = new Snap(lenis, { type: 'mandatory' }) // 'proximity' | 'mandatory' | 'lock'
  snap.addElements(document.querySelectorAll('section'), { align: 'start' })
  ```
- **Content height changes** (images/fonts loading): `autoResize` handles most; after big DOM changes call `ScrollTrigger.refresh()`.

## Limitations / troubleshooting

- Safari caps at 60fps (30 in Low Power Mode); smooth scroll stops over iframes.
- If nothing scrolls: include `lenis.css`, check the page scrolls without Lenis, and confirm a frame loop exists (`autoRaf` or `raf()`).
- Don't put `scroll-behavior: smooth` on `html` (the Lenis CSS overrides it; don't fight it).
- Always `destroy()` instances you create in SPA components to avoid duplicates.
