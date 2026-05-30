import { toPng } from "html-to-image";

function waitForImages(element) {
  const images = [...element.querySelectorAll("img")];
  return Promise.all(
    images.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          img.addEventListener("load", () => resolve(), { once: true });
          img.addEventListener("error", () => resolve(), { once: true });
        })
    )
  );
}

function triggerDownload(dataUrl, filename) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/** Capture a DOM node and download it as PNG. */
export async function downloadElementScreenshot(element, filename = "bracket.png") {
  if (!element) {
    throw new Error("Nothing to capture");
  }

  await waitForImages(element);

  const width = element.scrollWidth;
  const height = element.scrollHeight;

  const dataUrl = await toPng(element, {
    cacheBust: true,
    pixelRatio: 2,
    backgroundColor: "#ffffff",
    width,
    height,
    style: {
      overflow: "visible",
      width: `${width}px`,
      height: `${height}px`,
    },
    skipFonts: false,
  });

  triggerDownload(dataUrl, filename);
}
