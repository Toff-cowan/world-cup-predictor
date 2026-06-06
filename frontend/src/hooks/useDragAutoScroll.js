import { useEffect, useRef } from "react";
import { SIMPLE_DRAG_TYPE } from "../components/predictions/simpleBracketDrag.js";

const EDGE_PX = 56;
const MAX_SPEED = 18;

function isTeamDrag(dataTransfer) {
  if (!dataTransfer?.types) return false;
  return Array.from(dataTransfer.types).includes(SIMPLE_DRAG_TYPE);
}

/**
 * Auto-scroll a container (and optionally the page) while dragging teams near edges.
 */
export function useDragAutoScroll(containerRef, { axis = "x", enabled = true } = {}) {
  const velocityRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;
    const el = containerRef.current;
    if (!el) return;

    const tick = () => {
      const { x, y } = velocityRef.current;
      if (x !== 0 && (axis === "x" || axis === "both")) {
        el.scrollLeft += x;
      }
      if (y !== 0 && (axis === "y" || axis === "both")) {
        el.scrollTop += y;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    function velocityForAxis(clientPos, start, size) {
      const offset = clientPos - start;
      if (offset < EDGE_PX) {
        return -MAX_SPEED * Math.min(1, (EDGE_PX - offset) / EDGE_PX);
      }
      if (offset > size - EDGE_PX) {
        return MAX_SPEED * Math.min(1, (offset - (size - EDGE_PX)) / EDGE_PX);
      }
      return 0;
    }

    function updateVelocity(clientX, clientY) {
      const rect = el.getBoundingClientRect();
      const x =
        axis === "x" || axis === "both" ? velocityForAxis(clientX, rect.left, rect.width) : 0;
      const y =
        axis === "y" || axis === "both" ? velocityForAxis(clientY, rect.top, rect.height) : 0;
      velocityRef.current = { x, y };
    }

    function onContainerDragOver(e) {
      if (!isTeamDrag(e.dataTransfer)) return;
      e.preventDefault();
      updateVelocity(e.clientX, e.clientY);
    }

    function onDocumentDragOver(e) {
      if (!isTeamDrag(e.dataTransfer)) return;
      const pageY =
        axis === "y" || axis === "both"
          ? velocityForAxis(e.clientY, 0, window.innerHeight)
          : 0;
      if (pageY !== 0) {
        window.scrollBy(0, pageY);
      }
    }

    function stop() {
      velocityRef.current = { x: 0, y: 0 };
    }

    el.addEventListener("dragover", onContainerDragOver);
    document.addEventListener("dragover", onDocumentDragOver);
    document.addEventListener("dragend", stop);
    document.addEventListener("drop", stop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      el.removeEventListener("dragover", onContainerDragOver);
      document.removeEventListener("dragover", onDocumentDragOver);
      document.removeEventListener("dragend", stop);
      document.removeEventListener("drop", stop);
    };
  }, [containerRef, axis, enabled]);
}

/**
 * Click-drag on empty bracket space to scroll horizontally.
 */
export function usePanScroll(containerRef, { enabled = true } = {}) {
  useEffect(() => {
    if (!enabled) return;
    const el = containerRef.current;
    if (!el) return;

    const state = {
      active: false,
      startX: 0,
      startScrollLeft: 0,
      pointerId: null,
    };

    function isInteractive(target) {
      return target.closest(
        'input, button, select, textarea, a, [draggable="true"], [role="button"]'
      );
    }

    function onPointerDown(e) {
      if (e.button !== 0 || isInteractive(e.target)) return;
      state.active = true;
      state.startX = e.clientX;
      state.startScrollLeft = el.scrollLeft;
      state.pointerId = e.pointerId;
      el.setPointerCapture(e.pointerId);
      el.classList.add("is-panning");
    }

    function onPointerMove(e) {
      if (!state.active || e.pointerId !== state.pointerId) return;
      el.scrollLeft = state.startScrollLeft - (e.clientX - state.startX);
    }

    function endPan(e) {
      if (!state.active || e.pointerId !== state.pointerId) return;
      state.active = false;
      el.releasePointerCapture(e.pointerId);
      el.classList.remove("is-panning");
    }

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", endPan);
    el.addEventListener("pointercancel", endPan);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", endPan);
      el.removeEventListener("pointercancel", endPan);
      el.classList.remove("is-panning");
    };
  }, [containerRef, enabled]);
}
