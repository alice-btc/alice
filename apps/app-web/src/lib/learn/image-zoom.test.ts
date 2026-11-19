import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { clampView, fitView, fittedSize, MAX_ZOOM, panBy, zoomAt } from './image-zoom.ts';

const stage = { width: 400, height: 600 };

describe('the image viewer of a course', () => {
  it('fits a large image whole and leaves a small one at its own size', () => {
    assert.deepEqual(fittedSize({ width: 1600, height: 800 }, stage), { width: 400, height: 200 });
    assert.deepEqual(fittedSize({ width: 200, height: 100 }, stage), { width: 200, height: 100 });
    assert.deepEqual(fittedSize({ width: 0, height: 100 }, stage), { width: 0, height: 0 });
  });

  it('centres the fitted image', () => {
    assert.deepEqual(fitView({ width: 400, height: 200 }, stage), { scale: 1, x: 0, y: 200 });
  });

  it('keeps the point under the pointer in place while zooming', () => {
    const fitted = { width: 400, height: 600 };
    const view = zoomAt(fitView(fitted, stage), 2, { x: 300, y: 150 }, fitted, stage);
    assert.deepEqual(view, { scale: 2, x: -300, y: -150 });
    // The image point that was at (300, 150) is still there: (300 - x) / scale.
    assert.equal((300 - view.x) / view.scale, 300);
    assert.equal((150 - view.y) / view.scale, 150);
  });

  it('never zooms past its limits, and comes back to the fitted image', () => {
    const fitted = { width: 400, height: 200 };
    let view = fitView(fitted, stage);
    for (let i = 0; i < 10; i++) view = zoomAt(view, 2, { x: 200, y: 300 }, fitted, stage);
    assert.equal(view.scale, MAX_ZOOM);
    for (let i = 0; i < 10; i++) view = zoomAt(view, 0.5, { x: 10, y: 10 }, fitted, stage);
    assert.deepEqual(view, fitView(fitted, stage));
  });

  it('stops a drag at the image edges, and keeps a narrow side centred', () => {
    const fitted = { width: 400, height: 200 };
    const zoomed = zoomAt(fitView(fitted, stage), 2, { x: 200, y: 300 }, fitted, stage);
    // 800 x 400 in a 400 x 600 stage: it moves sideways, stays centred in height.
    assert.deepEqual(panBy(zoomed, 5_000, 5_000, fitted, stage), { scale: 2, x: 0, y: 100 });
    assert.deepEqual(panBy(zoomed, -5_000, -5_000, fitted, stage), { scale: 2, x: -400, y: 100 });
    assert.deepEqual(clampView({ scale: 0.2, x: 90, y: 90 }, fitted, stage), fitView(fitted, stage));
  });
});
