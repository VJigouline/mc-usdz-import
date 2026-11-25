import { zipSync } from 'three/examples/jsm/libs/fflate.module.js';
import { describe, expect, it } from 'vitest';
import { listUsdz, loadUsdz, UsdzImportError } from '../src/index.js';
import { sample } from './files.js';

describe('USDZ', () => {
  it('reads a package with its textures', async () => {
    const r = await loadUsdz(sample('saeukkang.usdz'));
    expect(r.entries[0]!.name).toMatch(/\.usd[ac]?$/);
    expect(r.stats.meshes).toBeGreaterThan(0);
    expect(r.stats.textures).toBeGreaterThan(0);
  });

  it('lists entries with their compression and alignment', () => {
    const entries = listUsdz(sample('saeukkang.usdz').data);
    expect(entries.length).toBeGreaterThan(1);
    expect(entries.every((e) => e.stored)).toBe(true);
  });

  it('warns about packages that break the specification', async () => {
    const layer = '#usda 1.0\n\ndef Mesh "Tri"\n{\n    int[] faceVertexCounts = [3]\n    int[] faceVertexIndices = [0, 1, 2]\n    point3f[] points = [(0, 0, 0), (1, 0, 0), (0, 1, 0)]\n}\n';
    const zip = zipSync({ 'tri.usda': [new TextEncoder().encode(layer), { level: 6 }] });
    const r = await loadUsdz({ name: 'tri.usdz', data: zip });
    expect(r.warnings.some((w) => w.includes('compressed'))).toBe(true);
    expect(r.stats.meshes).toBe(1);
  });

  it('refuses files that are not USDZ', async () => {
    await expect(loadUsdz({ name: 'a.usdz', data: 'hello' })).rejects.toThrow(UsdzImportError);
    const notUsd = zipSync({ 'readme.txt': new TextEncoder().encode('hello') });
    await expect(loadUsdz({ name: 'a.usdz', data: notUsd })).rejects.toThrow(/first file must be a USD layer/);
  });
});
