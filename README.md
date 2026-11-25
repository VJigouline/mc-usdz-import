# mc-usdz-import

A USDZ importer for [three.js](https://threejs.org/), written in TypeScript. It reads USDZ packages, the zipped Universal Scene Description format of Apple's AR Quick Look, with the textures inside them, in metres and Y up. It was made for [SceneEditor](https://github.com/VJigouline/SceneEditor), and works in any three.js application.

```ts
import { loadUsdz } from 'mc-usdz-import';

const result = await loadUsdz(await file.arrayBuffer());
scene.add(result.group);
console.log(result.warnings);       // anything that couldn't be read
```

## What it reads

- The package's root layer (its first file), text or binary crate, and the layers and textures in it.
- Everything [mc-usd-import](https://github.com/VJigouline/mc-usd-import) reads: meshes, UsdPreviewSurface materials and textures, references and variants, units and up axis.
- The package's entries, with checks against the USDZ specification: files must be stored uncompressed, at 64-byte alignment. Packages that break these rules are still read, with warnings.

Curves, points, volumes and procedural prims are not drawn. See [Formats and support](Documentation/Support.md) for the details.

## Install

The package is not on the npm registry. Install it from GitHub:

```sh
npm install github:VJigouline/mc-usdz-import
```

`three` (r160 or later) is a peer dependency. The package builds itself on install.

## Documentation

- [Getting started](Documentation/GettingStarted.md)
- [API](Documentation/API.md)
- [Formats and support](Documentation/Support.md)
- [Using it in SceneEditor](Documentation/SceneEditor.md)

## Development

```sh
npm install
npm test           # unit tests, with Vitest
npm run typecheck
npm run build      # dist/
```

The tests load real USDZ files, kept in [`tests/samples`](tests/samples/README.md) with their licences. It needs Node.js 22 or later.

## Licence

[MIT](LICENSE)
