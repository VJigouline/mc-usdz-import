# API

## `loadUsdz(input, options?)`

Reads `.usdz` and returns a promise of a `UsdzLoadResult`.

`input` is the file's contents (`ArrayBuffer`, `Uint8Array` or string), a browser `File`, `{ name, data }`, or an iterable of files. Zip archives among them are opened.

It throws `UsdzImportError` for input that isn't USDZ.

### Options

| Option | Default | Meaning |
| --- | --- | --- |
| `main` | the first .usdz file | The .usdz file to open, if several are given. |

### `UsdzLoadResult`

| Field | Type | Meaning |
| --- | --- | --- |
| `group` | `THREE.Group` | The model. |
| `entries` | `UsdzEntry[]` | The package's files: `name`, `size`, `stored` and `aligned`. |
| `warnings` | `string[]` | Problems that didn't stop the import. |
| `stats` | object | Counts of meshes, triangles and the like. |

See the package's `index.d.ts` for every exported type and helper.
