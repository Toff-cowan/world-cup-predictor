import { forwardRef, useLayoutEffect, useRef, useState } from "react";

const MOBILE_MAX_WIDTH = 767;

const BracketFitViewport = forwardRef(function BracketFitViewport(
  { children, className = "" },
  ref
) {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [fit, setFit] = useState({
    scale: 1,
    contentWidth: 0,
    contentHeight: 0,
    isMobile: false,
    ready: false,
  });

  const setContentRef = (node) => {
    contentRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  useLayoutEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    let frame = 0;

    const update = () => {
      const containerWidth =
        container.clientWidth || container.offsetWidth || window.innerWidth;
      const contentWidth = content.scrollWidth;
      const contentHeight = content.scrollHeight;

      if (!contentWidth || !contentHeight) {
        frame = requestAnimationFrame(update);
        return;
      }

      const isMobile = containerWidth <= MOBILE_MAX_WIDTH;
      const scaleX = containerWidth / contentWidth;

      let scale;
      if (isMobile) {
        scale = Math.min(1, scaleX);
      } else {
        const rect = container.getBoundingClientRect();
        const viewportSpace = Math.max(320, window.innerHeight - rect.top - 16);
        const scaleY = viewportSpace / contentHeight;
        scale = Math.min(1, scaleX, scaleY);
      }

      scale = Math.max(scale, 0.05);

      setFit({
        scale,
        contentWidth,
        contentHeight,
        isMobile,
        ready: true,
      });
    };

    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    });

    observer.observe(container);
    observer.observe(content);
    window.addEventListener("resize", update);
    window.visualViewport?.addEventListener("resize", update);
    update();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("resize", update);
    };
  }, [children]);

  const scaledWidth = fit.contentWidth * fit.scale;
  const scaledHeight = fit.contentHeight * fit.scale;

  return (
    <div
      ref={containerRef}
      className={[
        "bracket-fit-viewport w-full overflow-hidden",
        fit.isMobile ? "bracket-fit-viewport--mobile" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div
        className="bracket-fit-scaler relative mx-auto"
        style={{
          width: fit.ready ? scaledWidth : "100%",
          height: fit.ready ? scaledHeight : fit.isMobile ? scaledHeight || 460 : undefined,
          minHeight: fit.ready ? undefined : 460,
        }}
      >
        <div
          ref={setContentRef}
          data-bracket-export
          className="bracket-fit-content inline-block w-max origin-top-left"
          style={fit.ready ? { transform: `scale(${fit.scale})` } : undefined}
        >
          {children}
        </div>
      </div>
    </div>
  );
});

export default BracketFitViewport;
