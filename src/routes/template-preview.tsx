import { createFileRoute } from "@tanstack/react-router";
import InvoiceTemplate from "@/components/InvoiceTemplate";

// This route is used to generate a preview image for the Template 2 template
// It renders just the template on a dark background for screenshotting

export const Route = createFileRoute("/template-preview")({
  component: TemplatePreview,
});

function TemplatePreview() {
  return (
    <div 
      style={{ 
        backgroundColor: '#0a0a0a',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
      }}
    >
      <div style={{ maxWidth: '700px', width: '100%' }}>
        <InvoiceTemplate />
      </div>
    </div>
  );
}
