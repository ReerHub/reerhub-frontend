# Security Policy

## Supported versions

Only the latest `main` is supported. Security fixes ship as direct commits/PRs to `main` and deploy automatically (Vercel).

## Reporting a vulnerability

**Do not open a public issue.** Use GitHub's private vulnerability reporting
(Security tab → Report a vulnerability) on this repo, or email
security@reerhub.com. Please include:

- What you found and where (page, commit, or screenshot)
- Steps to reproduce (redact any secrets — rotate anything you paste)
- Impact assessment if known

We aim to acknowledge within 72 hours and will keep you updated until a fix
is deployed.

## Scope notes

- Public listings show teasers only (title/company/chips/excerpt); full detail, saves, and Apply need a session — crawlers see the identical view (no cloaking). Only `/dashboard` and
  `/profile` require login.
- Out of scope: spam/phishing content reports, theoretical findings without
  reproduction, third-party (Vercel/Render) infrastructure issues.
