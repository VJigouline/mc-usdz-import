# Getting started

## Install

```sh
npm install three github:VJigouline/mc-usdz-import
```

## Open a file

`loadUsdz` takes the file's contents (`ArrayBuffer`, `Uint8Array` or string), a browser `File`, `{ name, data }`, or an iterable of files. Zip archives among them are opened. It returns a promise of the model.

```ts
import * as THREE from 'three';
import { loadUsdz } from 'mc-usdz-import';

const input = document.querySelector<HTMLInputElement>('input[type=file]')!;
input.addEventListener('change', async () => {
  const result = await loadUsdz(input.files![0]!);
  scene.add(result.group);
  for (const warning of result.warnings) console.warn(warning);
});
```

## What you get

- **`group`:** a `THREE.Group` holding the model, named after the file.
- **`stats`:** counts of what was read.
- **`warnings`:** anything that couldn't be read or was left out.

The model follows the stage's metersPerUnit and upAxis.

## Options

- **`main`** (default the first .usdz file): The .usdz file to open, if several are given.

See the [API](API.md) for every field of the result.
