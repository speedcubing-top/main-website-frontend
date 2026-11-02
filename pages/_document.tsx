import { Head, Html, Main, NextScript } from 'next/document';

// Runs before React, so the page stays behind the Loading screen until the web fonts are ready.
// Fonts already in the cache show the page right away, and it never waits more than 3 seconds.
const revealWhenFontsLoad = `(function () {
  var root = document.documentElement;
  var reveal = function () { root.classList.remove('fonts-loading'); };
  var fonts = ['400 16px Inter', '700 16px "Readex Pro"', '400 16px "JetBrains Mono"'];
  if (!document.fonts || fonts.every(function (font) { return document.fonts.check(font); })) {
    reveal();
    return;
  }
  setTimeout(reveal, 3000);
  Promise.all(fonts.map(function (font) { return document.fonts.load(font); })).then(reveal, reveal);
})();`;

// !important because this comes before the stylesheet that hides the page.
const showWithoutScript = 'html.fonts-loading #__next{visibility:visible!important}html.fonts-loading::after{display:none!important}';

export default function Document() {
  return (
    <Html className="fonts-loading">
      <Head>
        <noscript>
          <style dangerouslySetInnerHTML={{ __html: showWithoutScript }} />
        </noscript>
      </Head>
      <body>
        <Main />
        <NextScript />
        <script dangerouslySetInnerHTML={{ __html: revealWhenFontsLoad }} />
      </body>
    </Html>
  );
}
