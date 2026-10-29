import { createFileRoute } from "@tanstack/react-router";
import InvoiceTemplate from "@/components/InvoiceTemplate";
import html2canvas from "html2canvas-pro";
import { useEffect, useRef } from "react";

export const Route = createFileRoute("/generate-preview")({
  component: GeneratePreviewPage,
});

/**
 * One-off script/route to generate the preview PNG for the invoice template.
 * 
 * To regenerate the preview if the template changes:
 * 1. Make sure your dev server is running.
 * 2. Navigate to /generate-preview in your browser.
 * 3. The page will automatically render the template and download a PNG file.
 * 4. Move the downloaded file to `public/previews/template-1.png`.
 */
function GeneratePreviewPage() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (ref.current) {
        html2canvas(ref.current, { scale: 2 }).then((canvas) => {
          const link = document.createElement("a");
          link.download = "template-1.png";
          link.href = canvas.toDataURL("image/png");
          link.click();
        });
      }
    }, 1500); // give it time to load fonts and render
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-10 bg-neutral-100 min-h-screen">
      <p className="mb-8 text-center text-sm text-neutral-500">
        Capturing preview... Save the downloaded file to <code>public/previews/template-1.png</code>
      </p>
      {/* Wrapper to constrain width similar to A4 or common PDF aspect ratio */}
      <div className="mx-auto w-[800px] bg-white p-8 shadow-xl" ref={ref}>
        <InvoiceTemplate />
      </div>
    </div>
  );
}
