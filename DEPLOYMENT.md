# Deployment

This app deploys on Vercel. Set the following in **Project → Settings →
Environment Variables**. All `NEXT_PUBLIC_*` variables are exposed to the
browser — never put secrets in them. The workshop Stripe account should be a
throwaway, test-only account.

## Required environment variables

| Variable | Public? | Description |
| --- | --- | --- |
| `DATABASE_URL` | server | Postgres connection string |
| `STRIPE_SECRET_KEY` | server | Platform secret key (test mode). **Never** `NEXT_PUBLIC` |
| `STRIPE_PUBLISHABLE_KEY` | server | Platform publishable key |
| `INSTRUCTOR_PASSWORD` | server | SA/facilitator sign-in password |
| `BETTER_AUTH_SECRET` | server | Signing secret for instructor session cookie |
| `CRON_SECRET` | server | Bearer token protecting cron routes |
| `NEXT_PUBLIC_STRIPE_PLATFORM_ACCOUNT_ID` | browser | Platform account ID (`acct_…`). Viewers must be logged into this account for "Open Dashboard" to work |
| `NEXT_PUBLIC_WORKSHOP_ACCOUNT_FRAUD` | browser | Connected account ID for the Fraud & Radar workshop |
| `NEXT_PUBLIC_WORKSHOP_ACCOUNT_PAYMENTS` | browser | Connected account ID for Online Payments 101 |
| `NEXT_PUBLIC_WORKSHOP_ACCOUNT_BILLING` | browser | Connected account ID for Billing & Subscriptions |
| `NEXT_PUBLIC_WORKSHOP_ACCOUNT_CONNECT` | browser | Connected account ID for Stripe Connect |
| `NEXT_PUBLIC_WORKSHOP_ACCOUNT_DISPUTES` | browser | Connected account ID for Disputes & Chargebacks |
| `NEXT_PUBLIC_WORKSHOP_STRIPE_EMAIL` | browser | Shared workshop Stripe login email (shown in the auth modal) |
| `NEXT_PUBLIC_WORKSHOP_STRIPE_PASSWORD` | browser | Shared workshop Stripe login password (test account only; optional) |

## How "Open Dashboard" works

The workshop uses Stripe **View Dashboard As** (VDA). When a participant is
authenticated in their browser as the platform account, this URL drops them
directly into a connected account's full Dashboard:

```
https://dashboard.stripe.com/{PLATFORM_ID}/connect/view-as/{CONNECTED_ID}/{page}
```

The first time a participant clicks a Dashboard link, an auth pre-flight modal
reminds them to log in as the workshop account (and to log out of any personal
account first). After they confirm, the choice is remembered for the rest of
their browser session.

> Note: `NEXT_PUBLIC_*` account IDs are read at **build time**. After changing
> them in Vercel, trigger a redeploy for the new values to take effect.
