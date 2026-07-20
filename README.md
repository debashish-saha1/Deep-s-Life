<div align="center">

# Deep's Life

### An interactive 3D story told through the people, places, and passions that shaped me.

[![Live Experience](https://img.shields.io/badge/Explore_the_live_experience-deepsaha.com-287e92?style=for-the-badge)](https://deepsaha.com)

</div>

![Deep's Life interactive 3D diorama](preview.png)

## About the experience

**Deep's Life** is a handcrafted, portrait-first 3D autobiographical diorama. A central traveler stands among the pieces of his story: New York City, two university campuses, family, career, travel, and a fire-breathing performance that represents creativity and passion.

The composition was assembled from individual GLB models and staged as one warm, illustrated world inspired by a sculpted paper-and-stone diorama.

## Highlights

- **Interactive storytelling** — hover over a model to discover its chapter.
- **Click-to-focus camera** — select an object to bring it forward and reveal its story.
- **Mobile-first composition** — carefully framed for portrait screens without losing depth.
- **Slow cinematic rotation** — the diorama gently turns when left untouched.
- **Hand-staged 3D scene** — custom lighting, orbit paths, planets, sandstone platforms, and layered terraces.
- **Personal story worlds** — life, career, education, family, city, passion, and travel.
- **No framework or build step** — the entire experience runs with HTML, CSS, JavaScript, and Three.js.

## Story chapters

| Scene | Chapter | Meaning |
| --- | --- | --- |
| Central traveler | **My Life** | The journey at the heart of the composition |
| Stone desk and laptop | **My Career** | Work, ideas, tools, and ambition |
| University campuses | **My Education** | The communities that shaped how I learn and build |
| Family sculpture | **My Family** | Support, connection, and shared strength |
| New York skyline | **My City** | Energy, opportunity, and home |
| Fire-breathing performer | **My Passion** | Creativity, courage, and taking risks |
| Airplane and orbit | **My Journey** | New perspectives and possibilities |

## Controls

| Action | Desktop | Mobile |
| --- | --- | --- |
| Explore a chapter | Hover over a model | Tap a model |
| Focus on a chapter | Click a model | Tap a model |
| Rotate the diorama | Click and drag | Drag |
| Zoom | Scroll | Pinch |
| Return to the composition | Select **Full scene** or **Reset view** | Select **Full scene** or **Reset view** |

## Built with

- [Three.js](https://threejs.org/) for real-time 3D rendering
- `GLTFLoader` for the GLB models
- `OrbitControls` for camera interaction and ambient rotation
- Vanilla JavaScript for scene construction, raycasting, and camera animation
- Responsive CSS for the portrait interface and story panels
- Netlify for static hosting and custom-domain delivery

## Run locally

No package installation or build command is required. From the project directory, start a local web server:

```bash
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

> Three.js is imported from jsDelivr, so the first load requires an internet connection.

## Project structure

```text
.
├── index.html           # Page structure and Three.js import map
├── styles.css           # Responsive interface and story-card styling
├── app.js               # Scene, models, lighting, interactions, and animation
├── preview.png          # Project preview used by this README
├── assets/              # GLB models and visual reference
└── tools/
    └── inspect-glb.mjs  # Small utility for inspecting GLB scene contents
```

## Deployment

Because this is a static website, it can be deployed directly to Netlify, Vercel, GitHub Pages, or any conventional web host. Upload the project with `index.html` at the root and preserve the `assets/` directory.

The live version is available at **[deepsaha.com](https://deepsaha.com)**.

## Performance note

The experience uses detailed GLB models and may require a larger first download on mobile. Browser caching makes repeat visits faster. Future optimization opportunities include Draco or Meshopt geometry compression and compressed GPU textures.

## Creator

Designed and assembled by **Deep Saha** as an interactive portrait of life, learning, family, work, and creative ambition.

---

<div align="center">
  <sub>Made with curiosity, courage, and a little bit of fire.</sub>
</div>
