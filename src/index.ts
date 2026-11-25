import * as THREE from 'three';
import { USDLoader } from 'three/examples/jsm/loaders/USDLoader.js';
import { countModel, FileManager, ImportFiles, type ImportInput, type ImportStats } from './common.js';

export { ImportFiles, countModel } from './common.js';
export type { ImportInput, ImportFile, ImportData, ImportStats } from './common.js';

export interface UsdzOptions {
  /** The .usdz file to open, if several are given. By default, the first. */
  main?: string;
}

export interface UsdzEntry {
  name: string;
  size: number;
  /** True if the entry is stored uncompressed, as the USDZ specification requires. */
  stored: boolean;
  /** True if the entry's data starts at a multiple of 64 bytes, as the specification requires. */
  aligned: boolean;
}

export interface UsdzLoadResult {
  /** The stage, in metres and Y up: a group named after the package. */
  group: THREE.Group;
  /** The package's files, in order; the first is the root layer. */
  entries: UsdzEntry[];
  /** Problems that didn't stop the import, including departures from the USDZ specification. */
  warnings: string[];
  stats: ImportStats;
}

export class UsdzImportError extends Error {
  override name = 'UsdzImportError';
}

/** Lists a zip's entries from its central directory, with their compression and alignment. */
export function listUsdz(bytes: Uint8Array): UsdzEntry[] {
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let eocd = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65557); i--) {
    if (v.getUint32(i, true) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new UsdzImportError('Not a USDZ package: it is not a zip archive');
  const count = v.getUint16(eocd + 10, true);
  let at = v.getUint32(eocd + 16, true);
  const entries: UsdzEntry[] = [];
  for (let k = 0; k < count && at + 46 <= bytes.length; k++) {
    const method = v.getUint16(at + 10, true);
    const size = v.getUint32(at + 24, true);
    const nameLength = v.getUint16(at + 28, true);
    const extra = v.getUint16(at + 30, true);
    const comment = v.getUint16(at + 32, true);
    const local = v.getUint32(at + 42, true);
    const name = new TextDecoder().decode(bytes.subarray(at + 46, at + 46 + nameLength));
    const dataStart = local + 30 + v.getUint16(local + 26, true) + v.getUint16(local + 28, true);
    entries.push({ name, size, stored: method === 0, aligned: dataStart % 64 === 0 });
    at += 46 + nameLength + extra + comment;
  }
  return entries;
}

/** Reads a USDZ package: a zip holding a root USD layer and the files it uses. */
export async function loadUsdz(input: ImportInput, options: UsdzOptions = {}): Promise<UsdzLoadResult> {
  const files = await ImportFiles.from(input, 'model.usdz', ['usdz']);
  const main = files.main(['usdz'], options.main) ?? files.files[0];
  if (!main) throw new UsdzImportError('There is no .usdz file to open');
  const entries = listUsdz(main.bytes);
  const warnings: string[] = [];
  const first = entries[0];
  if (!first || !/\.usd[ac]?$/i.test(first.name)) throw new UsdzImportError(`${main.name} is not a USDZ package: its first file must be a USD layer`);
  const compressed = entries.filter((e) => !e.stored).map((e) => e.name);
  if (compressed.length) warnings.push(`Not as the USDZ specification requires, these files are compressed: ${compressed.join(', ')}`);
  const unaligned = entries.filter((e) => e.stored && !e.aligned).map((e) => e.name);
  if (unaligned.length) warnings.push(`Not as the USDZ specification requires, these files are not 64-byte aligned: ${unaligned.join(', ')}`);

  const fm = new FileManager(files);
  const loader = new USDLoader(fm.manager);
  const buffer = main.bytes.buffer.slice(main.bytes.byteOffset, main.bytes.byteOffset + main.bytes.byteLength) as ArrayBuffer;
  const stage = await new Promise<THREE.Group>((resolve, reject) => {
    let group: THREE.Group | undefined;
    try {
      group = loader.parse(buffer, '', (g: THREE.Group) => resolve(g), (e: unknown) => {
        warnings.push(`Some textures could not be read: ${(e as Error)?.message ?? e}`);
        if (group) resolve(group);
      });
    } catch (error) {
      reject(new UsdzImportError(`${main.name} could not be read: ${(error as Error).message}`));
    }
  });
  await fm.done();
  fm.dispose();
  const name = main.name.replace(/\\/g, '/').split('/').pop()!.replace(/\.usdz$/i, '');
  const group = new THREE.Group();
  group.name = name;
  group.add(stage);
  return { group, entries, warnings, stats: countModel(group) };
}
