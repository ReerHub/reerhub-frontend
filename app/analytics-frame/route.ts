import { randomUUID } from "node:crypto";
import { ANALYTICS_EVENTS, PAGE_FAMILIES } from "@/lib/analytics-events";
export async function GET(request: Request) {
  if (
    request.headers.get("sec-fetch-dest") !== "iframe" ||
    request.headers.get("sec-fetch-site") !== "same-origin"
  )
    return new Response(null, { status: 404 });
  const id = process.env.GA4_MEASUREMENT_ID || "";
  if (!/^G-[A-Z0-9]{6,15}$/.test(id))
    return new Response(null, { status: 404 });
  const nonce = randomUUID();
  const clientId = randomUUID();
  // Opaque-origin sandbox: the external tag cannot read the parent page, cookies,
  // private URLs, auth state or profile DOM. Only validated enum events cross.
  const html = `<!doctype html><html lang="en"><head><meta name="robots" content="noindex,nofollow"><title>REERHUB anonymous measurement</title></head><body><script nonce="${nonce}">
const id=${JSON.stringify(id)}, events=${JSON.stringify(ANALYTICS_EVENTS)}, families=${JSON.stringify(PAGE_FAMILIES)};
window.dataLayer=[]; function gtag(){dataLayer.push(arguments)};
gtag('js',new Date()); gtag('config',id,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,client_id:${JSON.stringify(clientId)},page_location:location.origin+'/analytics-frame',page_referrer:'',page_title:'REERHUB'});
addEventListener('message',e=>{if(e.source!==parent||!e.data||!events.includes(e.data.name))return;const raw=e.data.params||{},params={page_location:location.origin+'/analytics-frame',page_referrer:'',page_title:'REERHUB'};if(families.includes(raw.page_family))params.page_family=raw.page_family;if(['pro-weekly','pro-monthly','pro-quarterly'].includes(raw.plan))params.plan=raw.plan;if(['qualified','stretch','needs-review'].includes(raw.group))params.group=raw.group;gtag('event',e.data.name,params)});
parent.postMessage('reerhub-analytics-ready','*');
</script><script nonce="${nonce}" async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script></body></html>`;
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex, nofollow",
      "Referrer-Policy": "no-referrer",
      "Content-Security-Policy": `default-src 'none'; script-src 'nonce-${nonce}' https://www.googletagmanager.com; connect-src https://*.google-analytics.com https://*.analytics.google.com; img-src https://*.google-analytics.com; frame-ancestors 'self'; base-uri 'none'`,
    },
  });
}
