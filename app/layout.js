import "./globals.css";

export const metadata = {
  title: "Aether Research - Trend Explorer",
  description: "An AI-powered Research Trend Explorer. Discover breakthroughs, analyze publications, map topics, and chat with papers using RAG.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
