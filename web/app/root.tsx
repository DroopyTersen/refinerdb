import * as React from "react";
import type { LinksFunction } from "remix";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useCatch,
} from "remix";
import globalStylesUrl from "~/styles/global.css";
import layoutStylesUrl from "~/styles/layout.css";
import { Layout } from "./features/layouts/Layout";

/**
 * The `links` export is a function that returns an array of objects that map to
 * the attributes for an HTML `<link>` element. These will load `<link>` tags on
 * every route in the app, but individual routes can include their own links
 * that are automatically unloaded when a user navigates away from the route.
 *
 * https://remix.run/api/app#links
 */
export let links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: globalStylesUrl },
    { rel: "stylesheet", href: layoutStylesUrl },
    {
      rel: "stylesheet",
      href: "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.3.1/styles/monokai-sublime.min.css",
    },
    {
      rel: "stylesheet",
      href: "https://unpkg.com/@codesandbox/sandpack-react/dist/index.css",
    },
  ];
};

/**
 * The root module's default export is a component that renders the current
 * route via the `<Outlet />` component. Think of this as the global layout
 * component for your app.
 */
export default function App() {
  return (
    <Document>
      <Layout>
        <Outlet />
      </Layout>
    </Document>
  );
}

function Document({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <html lang="en" data-theme="refinerdb">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        {title ? <title>{title}</title> : null}
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
        {process.env.NODE_ENV === "development" && <LiveReload />}

        <script src="//unpkg.com/@highlightjs/cdn-assets@11.3.1/highlight.min.js"></script>
        {/* <script>hljs.highlightAll();</script> */}
      </body>
    </html>
  );
}

export function CatchBoundary() {
  let caught = useCatch();

  let message;
  switch (caught.status) {
    case 401:
      message = (
        <p>Oops! Looks like you tried to visit a page that you do not have access to.</p>
      );
      break;
    case 404:
      message = <p>Oops! Looks like you tried to visit a page that does not exist.</p>;
      break;

    default:
      throw new Error(caught.data || caught.statusText);
  }

  return (
    <Document title={`${caught.status} ${caught.statusText}`}>
      <Layout>
        <h1>
          {caught.status}: {caught.statusText}
        </h1>
        {message}
      </Layout>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);
  return (
    <Document title="Error!">
      <Layout>
        <div>
          <h1>There was an error</h1>
          <p>{error.message}</p>
          <hr />
          <p>
            Hey, developer, you should replace this with what you want your users to see.
          </p>
        </div>
      </Layout>
    </Document>
  );
}
