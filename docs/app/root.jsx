import { Links, Meta, Outlet, Scripts } from '@remix-run/react';
import './styles.css';

export const meta = () => [
  { title: 'Asset Downloader — Scan & Download Web Assets' },
  { name: 'description', content: 'Scan and download images, sprites, fonts, and audio from any web page.' },
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}