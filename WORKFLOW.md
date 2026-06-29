# 3D model workflow — AbstractOcclusion site

How to get a 3D model from your tool of choice onto the **3D** page (`models.html`) so it loads fast, looks right, and is downloadable.

The viewer is Google's `<model-viewer>` web component. It renders **glTF** — either `.gltf` (JSON + separate files) or `.glb` (a single binary file). **Use `.glb`.** One file, textures embedded, easy to host and to offer as a download.

---

## 1. Export to .glb

**Blender** (recommended): `File → Export → glTF 2.0 (.glb/.gltf)`
- Format: **glTF Binary (.glb)**
- Include: Selected Objects (if you only want one), + Custom Properties off
- Transform: **+Y Up** (this is the glTF/web convention — model-viewer expects it)
- Geometry: Apply Modifiers ✓, UVs ✓, Normals ✓, Tangents ✓ (needed if you use normal maps)
- Materials: Export (Principled BSDF maps to glTF PBR cleanly)
- Compression: **Draco** ✓ if the mesh is heavy (see §3)

**Other tools:** Maya / 3ds Max export via the Babylon or glTF exporter; Substance Painter exports glTF directly; ZBrush → decimate → export FBX → convert (see §4).

## 2. What model-viewer reads (and what it ignores)

Relevant / supported:
- **PBR materials** — base color, metallic, roughness, normal, occlusion, emissive maps.
- **Embedded textures** (they ride inside the .glb).
- **Animations** — skeletal + morph targets play automatically; set `autoplay` on the tag.
- **Multiple meshes / hierarchy** — fine, kept as one model.
- **Vertex colors**, tangents for normal mapping.

Ignored / not supported (don't rely on these):
- Procedural / node-based shaders that aren't baked → **bake to textures first.**
- Lights and cameras inside the file → lighting comes from `environment-image` on the tag instead.
- Physics, modifiers not applied, custom engine materials.

## 3. Keep it light (load speed)

- Target a few **MB per model**. Big files = slow first load and a heavy download.
- **Textures:** 2K (2048²) is plenty for web; drop to 1K for small props. Use JPG for color, PNG only where you need alpha.
- **Geometry:** decimate / retopo high-poly sculpts. Aim for tens of thousands of tris, not millions.
- **Draco compression** (Blender export option) shrinks mesh data a lot; model-viewer decodes it automatically.
- Optional: run the file through `gltf-transform optimize model.glb out.glb` (npm `@gltf-transform/cli`) to compress textures and prune unused data.

## 4. Converting other formats

- **FBX / OBJ → glb:** import into Blender, then export as above. Or use the `FBX2glTF` CLI.
- **STL** (no materials): import to Blender, add a material, export.
- Quick web converters exist but Blender gives you control over scale, orientation, and material cleanup.

## 5. Putting it on the page

1. Drop the file in `assets/models/`, e.g. `assets/models/luminex-bot.glb`.
2. In `models.html`, find a `<article class="model-card">` block and set:
   - `<model-viewer src="assets/models/luminex-bot.glb" ...>`
   - the download link: `<a class="btn accent-btn" href="assets/models/luminex-bot.glb" download>`
   - the title, the category tag, the `data-langs="prop"` (matches the filter buttons), and the description.
3. Duplicate the block for each model. Add filter categories by editing the toolbar buttons + `data-langs`.

### Optional polish
- `poster="assets/models/luminex-bot.webp"` — a still image shown before the model loads (nice for heavy files).
- `auto-rotate` / `rotation-per-second="20deg"` — spin speed.
- `camera-orbit="45deg 75deg 2.5m"` — set the starting view.
- `environment-image="neutral"` (default) or point to an `.hdr` for custom lighting.
- `ar` attribute — adds a "View in your space" button on phones (AR via .glb on Android, needs a `.usdz` copy for iOS).
- `shadow-intensity` / `exposure` — already set; tweak to taste.

## 6. Naming & housekeeping
- lowercase, hyphenated: `forest-rock-01.glb`, never spaces.
- Keep a source folder (`.blend`) outside the site folder; only ship `.glb`.
- Note size + tri-count in the card's `mono-label` so visitors know what they're downloading.
