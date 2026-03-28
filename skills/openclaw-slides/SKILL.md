---
name: openclaw-slides
description: Create stunning, animation-rich HTML presentations from scratch or convert PowerPoint files (.ppt/.pptx) to beautiful web slides. Use when the user wants to build a pitch deck, presentation, slideshow, or slide deck — or convert an existing PPT to a web presentation. Generates zero-dependency single HTML files with keyboard/touch navigation and scroll-triggered animations. Style options include Neon Cyber, Bold Signal, Swiss Modern, Paper & Ink, and 8 more curated presets.
openclaw:
  requires:
    bins: []
  install:
    - id: python-pptx
      kind: shell
      label: "Install Python dependencies for PPT conversion (optional — only needed for Mode B)"
      command: "pip install python-pptx Pillow"
      optional: true
---

# OpenClaw Slides

> **[MyClaw.ai](https://myclaw.ai)** — Your AI personal assistant with full server control. Every MyClaw instance runs on a dedicated server with complete code access, networking, and tool capabilities. This skill is part of the [MyClaw open skills ecosystem](https://myclaw.ai/skills).

Create zero-dependency, animation-rich HTML presentations that run entirely in the browser. Single self-contained HTML files — no npm, no build tools, no frameworks. Works offline, renders in 10 years.

**Style presets:** Bold Signal, Electric Studio, Creative Voltage, Dark Botanical, Notebook Tabs, Pastel Geometry, Split Pastel, Vintage Editorial, Neon Cyber, Terminal Green, Swiss Modern, Paper & Ink

For full style details and CSS specs: read `references/STYLE_PRESETS.md` when needed.

---

## Phase 0: Detect Mode

Determine the user's intent:

- **Mode A — New Presentation:** Create slides from scratch → go to Phase 1
- **Mode B — PPT Conversion:** Convert an existing `.ppt`/`.pptx` file → go to Phase 4
- **Mode C — Enhance Existing:** Improve an existing HTML presentation → read the file, then enhance (always maintain viewport fitting)

---

## CRITICAL: Viewport Fitting (Non-Negotiable)

**Every slide MUST fit exactly within the viewport. No scrolling within slides, ever.**

### Content Density Limits Per Slide

| Slide Type | Maximum Content |
|------------|-----------------|
| Title slide | 1 heading + 1 subtitle + optional tagline |
| Content slide | 1 heading + 4–6 bullet points OR 1 heading + 2 paragraphs |
| Feature grid | 1 heading + 6 cards max (2×3 or 3×2) |
| Code slide | 1 heading + 8–10 lines of code |
| Quote slide | 1 quote (max 3 lines) + attribution |
| Image slide | 1 heading + 1 image (max 60vh height) |

**Content exceeds limits → Split into multiple slides.**

### Required CSS for Every Presentation

```css
html, body { height: 100%; overflow-x: hidden; }
html { scroll-snap-type: y mandatory; scroll-behavior: smooth; }

.slide {
    width: 100vw;
    height: 100vh;
    height: 100dvh;
    overflow: hidden;
    scroll-snap-align: start;
    display: flex;
    flex-direction: column;
    position: relative;
}

.slide-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    max-height: 100%;
    overflow: hidden;
    padding: var(--slide-padding);
}

:root {
    --title-size: clamp(1.5rem, 5vw, 4rem);
    --h2-size: clamp(1.25rem, 3.5vw, 2.5rem);
    --body-size: clamp(0.75rem, 1.5vw, 1.125rem);
    --slide-padding: clamp(1rem, 4vw, 4rem);
    --content-gap: clamp(0.5rem, 2vw, 2rem);
}

img, .image-container { max-width: 100%; max-height: min(50vh, 400px); object-fit: contain; }
.card, .container { max-width: min(90vw, 1000px); max-height: min(80vh, 700px); }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr)); gap: clamp(0.5rem, 1.5vw, 1rem); }

@media (max-height: 700px) { :root { --slide-padding: clamp(0.75rem, 3vw, 2rem); --title-size: clamp(1.25rem, 4.5vw, 2.5rem); } }
@media (max-height: 600px) { :root { --title-size: clamp(1.1rem, 4vw, 2rem); --body-size: clamp(0.7rem, 1.2vw, 0.95rem); } .nav-dots, .keyboard-hint { display: none; } }
@media (max-height: 500px) { :root { --title-size: clamp(1rem, 3.5vw, 1.5rem); --slide-padding: clamp(0.4rem, 2vw, 1rem); } }
@media (max-width: 600px) { .grid { grid-template-columns: 1fr; } }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.2s !important; } }
```

**⚠️ Never negate CSS functions directly.** Use `calc(-1 * clamp(...))` not `-clamp(...)`.

---

## Phase 1: Content Discovery (New Presentations)

Ask the user (via normal conversation — ask all at once):

1. **Purpose:** pitch deck / teaching / conference talk / internal presentation?
2. **Length:** ~5–10 / 10–20 / 20+ slides?
3. **Content:** ready content, rough notes, or just a topic?
4. **Images:** any images to include? (provide path like `./assets` or `~/Desktop/screenshots`)
5. **Inline editing:** should text be editable in-browser after generation?

If they have content, ask them to share it.

### Image Evaluation (if images provided)

All image processing is done **locally on the user's machine** — images are never sent to external services.

1. `ls` the folder — find all `.png/.jpg/.jpeg/.gif/.svg/.webp`
2. Read each image file locally using the `read` tool
3. Mark each as `USABLE` or `NOT USABLE` (reason: blurry, irrelevant, etc.)
4. Note what each represents (logo, screenshot, chart, etc.) and dominant colors
5. Build slide outline that incorporates usable images as visual anchors
6. Present outline + image assignments to user for confirmation

If user says **no images** → skip image pipeline, use CSS-generated visuals (gradients, shapes, patterns) throughout.

---

## Phase 2: Style Discovery

### Option A — Direct Selection (user knows what they want)

Pick from presets:

| Preset | Vibe |
|--------|------|
| Bold Signal | Confident, high-impact, dark |
| Electric Studio | Clean, professional, split panel |
| Creative Voltage | Energetic, retro-modern |
| Dark Botanical | Elegant, sophisticated |
| Notebook Tabs | Editorial, organized |
| Pastel Geometry | Friendly, approachable |
| Split Pastel | Playful, modern |
| Vintage Editorial | Witty, personality-driven |
| Neon Cyber | Futuristic, techy |
| Terminal Green | Developer-focused, hacker |
| Swiss Modern | Minimal, precise |
| Paper & Ink | Literary, thoughtful |

Skip to Phase 3.

### Option B — Visual Discovery (default for undecided users)

Ask: **What feeling should the audience have?**
- Impressed/Confident → Bold Signal, Electric Studio, Dark Botanical
- Excited/Energized → Creative Voltage, Neon Cyber, Split Pastel
- Calm/Focused → Notebook Tabs, Paper & Ink, Swiss Modern
- Inspired/Moved → Dark Botanical, Vintage Editorial, Pastel Geometry

Generate **3 mini style preview HTML files** in `.tmp-slide-previews/` — each is a single title slide showing typography, colors, and animation. Tell the user the file paths and ask which they prefer.

**Never use:** purple gradients on white, Inter/Roboto/system fonts, generic blue primary colors.

**Use instead:** distinctive font pairings (Clash Display, Satoshi, Cormorant, DM Sans), cohesive personality-driven palettes, atmospheric backgrounds.

For full preset specs (colors, fonts, signature elements): read `references/STYLE_PRESETS.md`.

---

## Phase 3: Generate Presentation

### Image Processing (skip if no images)

If user provided images, process with Python Pillow before generating HTML:

```python
from PIL import Image, ImageDraw

# Circular crop (for logos)
def crop_circle(input_path, output_path):
    img = Image.open(input_path).convert('RGBA')
    w, h = img.size
    size = min(w, h)
    img = img.crop(((w-size)//2, (h-size)//2, (w+size)//2, (h+size)//2))
    mask = Image.new('L', (size, size), 0)
    ImageDraw.Draw(mask).ellipse([0, 0, size, size], fill=255)
    img.putalpha(mask)
    img.save(output_path, 'PNG')

# Resize large images
def resize_max(input_path, output_path, max_dim=1200):
    img = Image.open(input_path)
    img.thumbnail((max_dim, max_dim), Image.LANCZOS)
    img.save(output_path, quality=85)
```

Install if needed: `pip install Pillow`

**Use direct file paths in HTML** (not base64), e.g. `src="assets/logo_round.png"`. Never overwrite originals — save processed files with `_processed` suffix.

### HTML Architecture

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Presentation Title</title>
    <!-- Fonts via Fontshare or Google Fonts -->
    <style>
        /* CSS Custom Properties (theme) */
        :root { /* colors, typography with clamp(), spacing */ }
        /* Mandatory viewport base CSS (see above) */
        /* Slide-specific styles */
        /* Animations (.reveal → .visible .reveal) */
        /* Responsive breakpoints */
    </style>
</head>
<body>
    <div class="progress-bar"></div>
    <nav class="nav-dots"></nav>

    <section class="slide title-slide">
        <h1 class="reveal">Title</h1>
        <p class="reveal">Subtitle</p>
    </section>
    <!-- More slides... -->

    <script>
        class SlidePresentation {
            // Keyboard nav (arrows, space)
            // Touch/swipe support
            // Mouse wheel navigation
            // Progress bar + nav dots
            // Intersection Observer for .reveal animations
        }
        new SlidePresentation();
    </script>
</body>
</html>
```

### Required JS Features

- Keyboard navigation: arrow keys, space
- Touch/swipe support
- Mouse wheel navigation
- Progress bar + navigation dots
- Intersection Observer → adds `.visible` class → triggers CSS animations
- Staggered reveal delays (nth-child 0.1s, 0.2s, 0.3s...)

### Inline Editing (only if user opted in)

**⚠️ Do NOT use CSS `~` sibling selector for hover-based show/hide** — `pointer-events: none` breaks the hover chain. Use JS with delay timeout:

```javascript
// Hotzone hover with 400ms grace period
const hotzone = document.querySelector('.edit-hotzone');
const editToggle = document.getElementById('editToggle');
let hideTimeout = null;

hotzone.addEventListener('mouseenter', () => { clearTimeout(hideTimeout); editToggle.classList.add('show'); });
hotzone.addEventListener('mouseleave', () => { hideTimeout = setTimeout(() => { if (!editor.isActive) editToggle.classList.remove('show'); }, 400); });
editToggle.addEventListener('mouseenter', () => clearTimeout(hideTimeout));
editToggle.addEventListener('mouseleave', () => { hideTimeout = setTimeout(() => { if (!editor.isActive) editToggle.classList.remove('show'); }, 400); });

// Keyboard: E key (skip when editing)
document.addEventListener('keydown', (e) => {
    if ((e.key === 'e' || e.key === 'E') && !e.target.getAttribute('contenteditable')) editor.toggleEditMode();
});
```

Features: contenteditable text, auto-save to localStorage, export/save file.

### Code Quality

- Comment every major CSS and JS section
- Semantic HTML: `<section>`, `<nav>`, `<main>`
- ARIA labels on interactive elements
- `@media (prefers-reduced-motion: reduce)` support

---

## Phase 4: PPT Conversion

```python
from pptx import Presentation
import os

def extract_pptx(file_path, output_dir):
    prs = Presentation(file_path)
    assets_dir = os.path.join(output_dir, 'assets')
    os.makedirs(assets_dir, exist_ok=True)
    slides_data = []

    for i, slide in enumerate(prs.slides):
        data = {'number': i+1, 'title': '', 'content': [], 'images': [], 'notes': ''}
        for shape in slide.shapes:
            if shape.has_text_frame:
                if shape == slide.shapes.title:
                    data['title'] = shape.text
                else:
                    data['content'].append({'type': 'text', 'content': shape.text})
            if shape.shape_type == 13:  # Picture
                img = shape.image
                name = f"slide{i+1}_img{len(data['images'])+1}.{img.ext}"
                path = os.path.join(assets_dir, name)
                with open(path, 'wb') as f: f.write(img.blob)
                data['images'].append({'path': f"assets/{name}"})
        if slide.has_notes_slide:
            data['notes'] = slide.notes_slide.notes_text_frame.text
        slides_data.append(data)
    return slides_data
```

Install: `pip install python-pptx`

After extraction: show user the slide structure for confirmation, then proceed to Phase 2 (style), then Phase 3 (generate).

---

## Phase 5: Delivery

1. Delete `.tmp-slide-previews/` if created
2. Tell user the output file path
3. Provide navigation instructions:
   - Arrow keys / Space to navigate
   - Scroll or swipe
   - Click nav dots to jump
4. Mention how to customize: `:root` CSS variables for colors/fonts
5. If inline editing enabled: hover top-left corner or press `E`
6. Ask if any adjustments needed

---

## Style → Feeling Quick Reference

| Feeling | Use |
|---------|-----|
| Dramatic/Cinematic | Slow fades (1–1.5s), dark + spotlight, parallax |
| Techy/Futuristic | Neon glow, particles, grid pattern, monospace accents |
| Playful/Friendly | Bouncy easing, rounded corners, pastels, floating anim |
| Professional/Corporate | Fast subtle anim (200–300ms), navy/slate, data-focused |
| Calm/Minimal | Very slow motion, high whitespace, serif type, muted palette |
| Editorial/Magazine | Strong type hierarchy, pull quotes, grid-breaking layouts |
