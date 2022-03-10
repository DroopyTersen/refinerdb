import type { MetaFunction } from "remix";
import {
  Links,
  LinksFunction,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "remix";
import globalStylesUrl from "./global.css";

export const meta: MetaFunction = () => {
  return { title: "New Remix App" };
};

export let links: LinksFunction = () => {
  return [
    { rel: "stylesheet", href: globalStylesUrl },
    // {
    //   rel: "stylesheet",
    //   href:
    //     "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.3.1/styles/monokai-sublime.min.css",
    // },
    {
      rel: "stylesheet",
      href: "https://unpkg.com/@codesandbox/sandpack-react/dist/index.css",
    },
  ];
};

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
