# Formats and support

mc-usdz-import reads USDZ with three.js's USDLoader.

## What is read

- The package's root layer (its first file), text or binary crate, and the layers and textures in it.
- Everything [mc-usd-import](https://github.com/VJigouline/mc-usd-import) reads: meshes, UsdPreviewSurface materials and textures, references and variants, units and up axis.
- The package's entries, with checks against the USDZ specification: files must be stored uncompressed, at 64-byte alignment. Packages that break these rules are still read, with warnings.

## Orientation and units

The model follows the stage's metersPerUnit and upAxis.

## Limits

Curves, points, volumes and procedural prims are not drawn.
