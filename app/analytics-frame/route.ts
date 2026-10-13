import { analyticsConfig } from "@/lib/analytics-config";
import { randomUUID } from "node:crypto";
import { ANALYTICS_EVENTS, PAGE_FAMILIES } from "@/lib/analytics-events";
export async function GET(request: Request) {
  if (
    request.headers.get("sec-fetch-dest") !== "iframe" ||
    request.headers.get("sec-fetch-site") !== "same-origin"
  )
    return new Response(null, { status: 404 });
  const config = analyticsConfig();
  const id = config.gtmContainerId || config.ga4MeasurementId;
  if (!id) return new Response(null, { status: 404 });
  const nonce = randomUUID();
  const clientId = randomUUID();
  // Opaque-origin sandbox: the external tag cannot read the parent page, cookies,
  // private URLs, auth state or profile DOM. Only validated enum events cross.
  const gtm = Boolean(config.gtmContainerId);
  const initialization = `window.dataLayer=[]; function gtag(){dataLayer.push(arguments)};
  gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  `;
  const loader = gtm
    ? `<script nonce="${nonce}">${initialization}
  dataLayer.push({client_id:${JSON.stringify(clientId)},page_location:location.origin+'/analytics-frame',page_referrer:'',page_title:'REERHUB'});
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;j.nonce=${JSON.stringify(nonce)};f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',${JSON.stringify(id)});
  </script>`
    : `<script nonce="${nonce}">${initialization}
  gtag('js',new Date());gtag('config',${JSON.stringify(id)},{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,client_id:${JSON.stringify(clientId)},page_location:location.origin+'/analytics-frame',page_referrer:'',page_title:'REERHUB'});
  </script><script nonce="${nonce}" async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>`;
  const html = `<!doctype html><html lang="en"><head><meta name="robots" content="noindex,nofollow"><title>REERHUB anonymous measurement</title>${loader}</head><body>${gtm ? `<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${id}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>` : ""}<script nonce="${nonce}">
const events=${JSON.stringify(ANALYTICS_EVENTS)}, families=${JSON.stringify(PAGE_FAMILIES)};
addEventListener('message',e=>{if(e.source!==parent||!e.data||!events.includes(e.data.name))return;const raw=e.data.params||{},params={page_location:location.origin+'/analytics-frame',page_referrer:'',page_title:'REERHUB'};if(families.includes(raw.page_family))params.page_family=raw.page_family;if(['pro-weekly','pro-monthly','pro-quarterly'].includes(raw.plan))params.plan=raw.plan;if(['qualified','stretch','needs-review'].includes(raw.group))params.group=raw.group;${gtm ? "dataLayer.push({event:e.data.name,...params})" : "gtag('event',e.data.name,params)"}});
parent.postMessage('reerhub-analytics-ready','*');
</script></body></html>`;
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "Referrer-Policy": "no-referrer",
      "Content-Security-Policy": `default-src 'none'; script-src 'nonce-${nonce}' https://www.googletagmanager.com; connect-src https://www.googletagmanager.com https://*.google-analytics.com https://*.analytics.google.com; img-src https://*.google-analytics.com; frame-src https://www.googletagmanager.com; frame-ancestors 'self'; base-uri 'none'`,
    },
  });
}
