// The geometry of the image viewer of a course: an image fitted in a stage,
// enlarged around a point and moved, without ever leaving the stage empty
// beside it. Pure, so the gestures of a mouse, a trackpad and a touch screen
// all go through the same arithmetic.

export type Size = { width: number; height: number };
export type Point = { x: number; y: number };
/** `scale` 1 is the image fitted whole; `x`, `y` place its top-left corner in the stage. */
export type ZoomView = { scale: number; x: number; y: number };

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 6;
/** What a click, or a press on +, enlarges by. */
export const ZOOM_STEP = 2;

/** The image's size when it is shown whole, never larger than its own pixels. */
export function fittedSize(image: Size, stage: Size): Size {
  if (image.width <= 0 || image.height <= 0 || stage.width <= 0 || stage.height <= 0) return { width: 0, height: 0 };
  const ratio = Math.min(stage.width / image.width, stage.height / image.height, 1);
  return { width: image.width * ratio, height: image.height * ratio };
}

function along(position: number, shown: number, room: number): number {
  // Smaller than the stage: centred. Larger: its edges stay outside the stage's.
  if (shown <= room) return (room - shown) / 2;
  return Math.min(0, Math.max(room - shown, position));
}

/** The same view, within the zoom limits and with the image kept in the stage. */
export function clampView(view: ZoomView, fitted: Size, stage: Size): ZoomView {
  const scale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, view.scale));
  return {
    scale,
    x: along(view.x, fitted.width * scale, stage.width),
    y: along(view.y, fitted.height * scale, stage.height),
  };
}

/** The image fitted whole, centred. */
export function fitView(fitted: Size, stage: Size): ZoomView {
  return clampView({ scale: MIN_ZOOM, x: 0, y: 0 }, fitted, stage);
}

/** Enlarges or reduces by `factor`, keeping what is under `point` under it. */
export function zoomAt(view: ZoomView, factor: number, point: Point, fitted: Size, stage: Size): ZoomView {
  const scale = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, view.scale * factor));
  const ratio = scale / view.scale;
  return clampView({
    scale,
    x: point.x - (point.x - view.x) * ratio,
    y: point.y - (point.y - view.y) * ratio,
  }, fitted, stage);
}

/** Moves the image by a drag or a scroll. */
export function panBy(view: ZoomView, dx: number, dy: number, fitted: Size, stage: Size): ZoomView {
  return clampView({ scale: view.scale, x: view.x + dx, y: view.y + dy }, fitted, stage);
}
