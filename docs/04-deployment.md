# Frontend deployment (Vercel)

`develop` deploys to `https://staging.reerhub.com`; `main` deploys to `https://reerhub.com`. The `www.reerhub.com` host redirects to the apex domain. Set Node 24 in Vercel.

## Environment variables

Production:

```dotenv
API_URL=https://api.reerhub.com/api/v1
SITE_URL=https://reerhub.com
GOOGLE_CLIENT_ID=<id>.apps.googleusercontent.com
TURNSTILE_SITE_KEY=<turnstile-site-key>
```

Staging:

```dotenv
API_URL=https://staging-api.reerhub.com/api/v1
SITE_URL=https://staging.reerhub.com
GOOGLE_CLIENT_ID=<staging-or-shared-client-id>.apps.googleusercontent.com
TURNSTILE_SITE_KEY=<staging-widget-site-key>
```

These values are server/build-time values. Redeploy after changing them. The backend must allow both deployed origins through `CORS_FRONTEND_URL`, and Google OAuth plus Turnstile must list the matching frontend hostname.

## Release checks

1. Sign in with Google and magic link; verify the return URL preserves the requested page.
2. Confirm an anonymous visitor sees a teaser, a free user can view/apply/save, and a Pro member sees only relevance-based recommendations.
3. Use Razorpay Test mode on staging to verify checkout, signature verification, billing success, cancellation, webhook delivery, and expiry.
4. Confirm staging `robots.txt` disallows crawling; production sitemap and canonical URLs use `https://reerhub.com`.

Rollback through Vercel Deployments by redeploying the last known good production build.
# Admin deployment

Attach `admin.reerhub.com` to the existing public Vercel project; no second
project or environment is needed. Host routing serves `/auth` and `/dashboard`
only on that subdomain, while `reerhub.com/auth` is a 404 and customer login
remains `/login`. The admin subdomain uses the same `API_URL` and
`GOOGLE_CLIENT_ID` already configured for the public deployment. Add the admin
subdomain to the Google OAuth client’s Authorized JavaScript origins and to the
backend `CORS_FRONTEND_URL` list.

For testing, use `staging.reerhub.com/admin/auth` and
`staging.reerhub.com/admin/dashboard`, or their `localhost:3000` equivalents.
This keeps normal staging/local `/` and `/dashboard` public. Dedicated admin
testing hosts (`admin-staging.reerhub.com` and `admin.localhost`) use `/auth`
and `/dashboard` like production. Production public hosts remain blocked.
