import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { ArrowLeft, Compass } from "lucide-react";

import appCss from "../styles.css?url";
import { brandName, faviconUrl, logoUrl, siteUrl, socialPreviewUrl, slogan } from "@/lib/envoiz";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { SmoothScroll } from "@/components/SmoothScroll";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-[#f7f8f4] px-5 py-10 text-[#1b2018]">
      <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(#e3e8dc_1px,transparent_1px),linear-gradient(90deg,#e3e8dc_1px,transparent_1px)] [background-size:44px_44px]" />
      <div className="relative w-full max-w-xl rounded-[28px] border border-[#dce2d5] bg-white/85 p-8 text-center shadow-[0_24px_70px_rgba(35,45,27,.08)] backdrop-blur-sm sm:p-12">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-[#dfe6d4] bg-[#f2f6e9] text-[#637d3a]">
          <Compass size={22} />
        </div>
        <p className="mt-7 font-mono text-[10px] tracking-[.2em] text-[#7e8a73]">ERROR 404</p>
        <h1 className="mt-3 font-[var(--tight)] text-5xl font-semibold tracking-[-.06em] sm:text-6xl">
          This page is off the map.
        </h1>
        <p className="mx-auto mt-5 max-w-sm text-sm leading-6 text-[#70796c]">
          The address may be out of date, or the page may have moved somewhere new.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#1b2018] px-5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
            style={{ color: "#fff" }}
          >
            Go home <ArrowLeft size={16} />
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#dbe1d4] bg-white px-5 text-sm font-medium text-[#46503f] transition-colors hover:bg-[#f5f7f1]"
          >
            Go back
          </button>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: unknown; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${brandName} - ${slogan}` },
      { name: "description", content: slogan },
      { property: "og:title", content: `${brandName} - ${slogan}` },
      { property: "og:description", content: slogan },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: brandName },
      { property: "og:url", content: siteUrl },
      { property: "og:image", content: socialPreviewUrl },
      { property: "og:image:alt", content: "Envoiz smart invoicing workspace" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: `${brandName} - ${slogan}` },
      { name: "twitter:description", content: slogan },
      { name: "twitter:image", content: socialPreviewUrl },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preload", href: logoUrl, as: "image" },
      { rel: "preload", href: faviconUrl, as: "image" },
      { rel: "icon", href: faviconUrl },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <SmoothScroll />
      <AuthProvider>
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
        <Toaster position="top-right" richColors closeButton />
      </AuthProvider>
    </QueryClientProvider>
  );
}
