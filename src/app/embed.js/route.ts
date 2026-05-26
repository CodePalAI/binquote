import { NextResponse } from "next/server";

// Served from /embed.js. This is the snippet operators paste into their website.
// It injects a sized iframe pointing at /widget/<slug>.
export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const js = `(function(){
  var scripts = document.currentScript ? [document.currentScript] : document.querySelectorAll('script[data-binquote]');
  scripts.forEach(function(s){
    var slug = s.getAttribute('data-binquote');
    if(!slug) return;
    var theme = s.getAttribute('data-theme') || 'paper';
    var wrap = document.createElement('div');
    wrap.style.cssText = 'all:initial;display:block;width:100%;max-width:880px;margin:0 auto;';
    var iframe = document.createElement('iframe');
    iframe.src = '${origin}/widget/' + encodeURIComponent(slug) + '?theme=' + encodeURIComponent(theme) + '&embed=1';
    iframe.title = 'Instant dumpster quote';
    iframe.loading = 'lazy';
    iframe.style.cssText = 'border:0;width:100%;min-height:720px;background:transparent;display:block;';
    iframe.allow = 'clipboard-write';
    wrap.appendChild(iframe);
    s.parentNode.insertBefore(wrap, s);
    window.addEventListener('message', function(e){
      if(e.source !== iframe.contentWindow) return;
      if(e.data && e.data.type === 'binquote:resize' && typeof e.data.height === 'number'){
        iframe.style.height = (e.data.height + 8) + 'px';
      }
    });
  });
})();`;
  return new NextResponse(js, {
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "public, max-age=300",
      "access-control-allow-origin": "*",
    },
  });
}
