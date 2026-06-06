import { forwardRef, useLayoutEffect, useRef, useState } from "react";

const BracketFitViewport = forwardRef(function BracketFitViewport(
  { children, className = "" },
  ref
) {
  const containerRef = useRef(null);
  const contentRef = useRef(null);
  const [fit, setFit] = useState({ scale: 1, width: 0, height: 0 });

  const setContentRef = (node) => {
    contentRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  useLayoutEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const update = () => {
      const containerWidth = container.clientWidth;
      const contentWidth = content.scrollWidth;
      const contentHeight = content.scrollHeight;
      if (!contentWidth || !containerWidth) return;

      const rect = container.getBoundingClientRect();
      const viewportSpace = window.innerHeight - rect.top - 16;
      const containerHeight = Math.max(
        container.clientHeight,
        Math.min(viewportSpace, window.innerHeight * 0.82)
      );

      const scaleX = containerWidth / contentWidth;
      const scaleY = containerHeight / contentHeight;
      const scale = Math.min(1, scaleX, scaleY);

      setFit({
        scale,
        width: contentWidth,
        height: contentHeight * scale,
      });
    };

    const observer = new ResizeObserver(update);
    observer.observe(container);
    observer.observe(content);
    window.addEventListener("resize", update);
    update();

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [children]);

  return (
    <div
      ref={containerRef}
      className={`bracket-fit-viewport w-full overflow-hidden ${className}`}
    >
      <div style={{ height: fit.height || undefined, width: "100%" }}>
        <div
          style={{
            transform: `scale(${fit.scale})`,
            transformOrigin: "top center",
            width: fit.width || undefined,
            margin: "0 auto",
          }}
        >
          <div ref={setContentRef} data-bracket-export className="inline-block w-max">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
});

export default BracketFitViewport;
