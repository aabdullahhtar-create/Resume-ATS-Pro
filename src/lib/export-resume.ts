const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

function safeFileName(name: string, fallback = "resume") {
  const cleaned = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return cleaned || fallback;
}

function nextFrame() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

async function waitForImages(element: HTMLElement) {
  const images = Array.from(element.querySelectorAll("img"));
  await Promise.all(images.map((image) => {
    if (image.complete) return Promise.resolve();
    return new Promise<void>((resolve) => {
      image.onload = () => resolve();
      image.onerror = () => resolve();
    });
  }));
}

async function prepareExportClone(source: HTMLElement) {
  const host = document.createElement("div");
  host.setAttribute("data-resume-export-host", "true");
  host.style.position = "absolute";
  host.style.left = "0";
  host.style.top = `${window.scrollY + window.innerHeight + 1000}px`;
  host.style.width = `${A4_WIDTH_PX}px`;
  host.style.background = "#ffffff";
  host.style.pointerEvents = "none";
  host.style.zIndex = "0";
  host.style.contain = "layout style paint";

  const clone = source.cloneNode(true) as HTMLElement;
  clone.id = `${source.id || "resume-preview"}-export`;
  clone.classList.add("resume-exporting");
  clone.style.width = `${A4_WIDTH_PX}px`;
  clone.style.minHeight = `${A4_HEIGHT_PX}px`;
  clone.style.height = "auto";
  clone.style.maxHeight = "none";
  clone.style.transform = "none";
  clone.style.margin = "0";
  clone.style.boxShadow = "none";
  clone.style.overflow = "visible";

  host.appendChild(clone);
  document.body.appendChild(host);

  if (document.fonts?.ready) await document.fonts.ready.catch(() => undefined);
  await waitForImages(clone);
  await nextFrame();
  await nextFrame();

  return {
    clone,
    cleanup: () => host.remove()
  };
}

export async function renderResumeToCanvas(source: HTMLElement) {
  const { clone, cleanup } = await prepareExportClone(source);
  try {
    const html2canvas = (await import("html2canvas")).default;
    const height = Math.max(clone.scrollHeight, clone.offsetHeight, A4_HEIGHT_PX);

    return await html2canvas(clone, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
      width: A4_WIDTH_PX,
      height,
      windowWidth: A4_WIDTH_PX,
      windowHeight: height,
      scrollX: 0,
      scrollY: 0
    });
  } finally {
    cleanup();
  }
}

export async function downloadResumeImage(source: HTMLElement | null, name: string, format: "png" | "jpg") {
  if (!source) return;

  const canvas = await renderResumeToCanvas(source);
  const link = document.createElement("a");
  const mimeType = format === "jpg" ? "image/jpeg" : "image/png";
  link.href = canvas.toDataURL(mimeType, 0.98);
  link.download = `${safeFileName(name)}.${format}`;
  link.click();
}

export async function downloadResumePdf(source: HTMLElement | null, name: string) {
  if (!source) return;

  const canvas = await renderResumeToCanvas(source);
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const sourcePageHeight = Math.floor((canvas.width * pageHeight) / pageWidth);

  let y = 0;
  let page = 0;

  while (y < canvas.height) {
    const sliceHeight = Math.min(sourcePageHeight, canvas.height - y);
    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvas.width;
    pageCanvas.height = sourcePageHeight;

    const context = pageCanvas.getContext("2d");
    if (!context) throw new Error("Could not prepare PDF page.");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
    context.drawImage(canvas, 0, y, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);

    if (page > 0) pdf.addPage();
    pdf.addImage(pageCanvas.toDataURL("image/jpeg", 0.98), "JPEG", 0, 0, pageWidth, pageHeight);

    y += sourcePageHeight;
    page += 1;
  }

  pdf.save(`${safeFileName(name)}.pdf`);
}
