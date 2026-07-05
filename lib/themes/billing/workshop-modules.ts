import type {
  CalloutKind,
  Callout,
  WorkshopGif,
  DashboardUrl,
  WorkshopStep,
  WorkshopModule,
} from '@/lib/workshop-modules'

export const BILLING_GETTING_STARTED_MODULE: WorkshopModule = {
  id: 'billing-getting-started',
  number: 0,
  title: 'Getting Started',
  estMinutes: 5,
  isPrerequisite: true,
  intro: `Welcome to the Billing & Subscriptions workshop. Before diving into recurring revenue, take five minutes to open your Stripe test account and locate the Billing section. Everything in this workshop happens inside that account.`,
  narrative: `You have just joined CloudCanvas, a SaaS design tool that has been selling one-time licenses through Stripe. The founders want to launch a subscription tier — "CloudCanvas Pro" — and they have asked you to build it out. This is your Stripe account.`,
  steps: [
    {
      title: 'Open your Stripe Dashboard',
      body: `Click the "Open Stripe Dashboard" button in the left sidebar. It will open your account in a new tab. The link is generated fresh each time you click it.\n\nIf the link has expired (they last 5 minutes), just click it again and a new one will be generated.`,
      renderDashboardButton: true,
    },
    {
      title: 'Sign in with your credentials',
      body: `Your test account credentials are shown below. You will need these if you are prompted to verify your identity or access the account directly at dashboard.stripe.com.`,
      renderCredentialsCard: true,
    },
    {
      title: 'Navigate to the Billing section',
      body: `Once you are in, look at the left sidebar. Find the Billing section — this is where subscriptions, invoices, and revenue recovery tools live. You should also note the Products section and the Customers section, as you will use all three today.\n\nTake a moment to click through each one so you know where they are.`,
      gif: {
        caption: 'Record: the Stripe Dashboard home screen with the left sidebar visible, highlighting Billing, Products, and Customers in the navigation.',
        screen: 'Dashboard → Home',
      },
    },
    {
      title: 'Keep the Dashboard open',
      body: `Keep your Stripe Dashboard open in its own tab for the rest of the workshop. Each module will link directly to the relevant section, so you will not need to navigate manually — just click the link and it takes you straight there.`,
    },
  ],
  doneLabel: `I've set up my Stripe Dashboard and found the Billing section`,
}

export const BILLING_WORKSHOP_MODULES: WorkshopModule[] = [
  BILLING_GETTING_STARTED_MODULE,

  // ── MODULE 1 ──────────────────────────────────────────────────────────
  {
    id: 'recurring-revenue-fundamentals',
    number: 1,
    title: 'Recurring Revenue Fundamentals',
    estMinutes: 5,
    intro: `Before writing any code or clicking any buttons, understand the core concepts behind subscription billing. This module covers the mental model that everything else builds on: products, prices, subscriptions, and the lifecycle events that connect them.`,
    narrative: `CloudCanvas currently charges a flat $99 per license. The founders want predictable monthly revenue instead. Before you build anything, you need to understand how Stripe models recurring billing so you can design CloudCanvas Pro correctly from the start.`,
    overviewAddition: `The conceptual foundation for everything you will build today.`,
    steps: [
      {
        title: 'The subscription billing model',
        body: `Subscription billing on Stripe is built around four core objects: Products, Prices, Customers, and Subscriptions. A Product represents what you sell — in CloudCanvas's case, "CloudCanvas Pro". A Price defines how much it costs and how often — for example, $29/month or $290/year.\n\nA Customer is the person or company paying. A Subscription ties a Customer to one or more Prices and manages the recurring charge cycle automatically. Stripe handles the scheduling, invoicing, payment collection, and retry logic.\n\nThis separation matters because it lets you change pricing without affecting existing subscribers, offer multiple billing intervals for the same product, and bundle multiple products into a single subscription.`,
        callouts: [
          {
            kind: 'explanation',
            text: `Think of it like a newspaper: the Product is "The Daily News", the Price is "$10/month home delivery", the Customer is the subscriber, and the Subscription is the ongoing agreement that generates a new invoice every month. Changing the subscription price for new customers does not change it for existing ones — just like a newspaper can raise rates for new subscribers while honouring the old rate for current ones.`,
          },
        ],
      },
      {
        title: 'Subscription lifecycle events',
        body: `Every subscription moves through a predictable lifecycle. It starts as \`incomplete\` while the first payment is being processed. Once the payment succeeds, it becomes \`active\`. At each billing period, Stripe automatically creates an invoice, attempts payment, and either keeps the subscription \`active\` or moves it to \`past_due\` if payment fails.\n\nIf retries are exhausted without a successful payment, the subscription moves to \`unpaid\` or \`canceled\`, depending on your settings. Customers can also cancel voluntarily, which sets the status to \`canceled\` either immediately or at the end of the current period.\n\nUnderstanding this lifecycle is critical because each transition triggers a webhook event that your application needs to handle — updating access, sending emails, or prompting the customer to update their payment method.`,
        callouts: [
          {
            kind: 'billing-fact',
            text: `The average SaaS company loses 5-7% of its monthly recurring revenue to involuntary churn — failed payments that are never recovered. Stripe's built-in retry logic and Smart Retries recover a significant portion of this automatically.`,
          },
        ],
      },
      {
        title: 'How Stripe invoices work',
        body: `Every subscription payment is backed by an Invoice object. When a billing cycle begins, Stripe creates a draft invoice, adds the subscription's line items, finalises it, and then attempts payment. The invoice records the full history: what was charged, when, which payment method was used, and whether it succeeded or failed.\n\nInvoices are not just internal records — they are customer-facing documents. Stripe can email them automatically, host them on a branded page, and generate PDF versions. For CloudCanvas, this means your customers get professional invoices without you building any invoicing infrastructure.\n\nYou can also add one-off line items to subscription invoices — useful for usage overages, setup fees, or mid-cycle adjustments.`,
        gif: {
          caption: 'Record: opening the Invoices section in the Stripe Dashboard and viewing an invoice detail page.',
          screen: 'Dashboard → Invoices',
        },
      },
      {
        title: 'Key API objects to know',
        body: `Here are the Stripe API objects you will work with throughout this workshop:\n\n\`Product\` — what you sell. Has a \`name\`, \`description\`, and optional \`metadata\`.\n\n\`Price\` — how much it costs. Has a \`unit_amount\`, \`currency\`, \`recurring.interval\` (day, week, month, year), and belongs to a Product.\n\n\`Customer\` — who is paying. Has an \`email\`, \`name\`, default \`payment_method\`, and \`metadata\`.\n\n\`Subscription\` — the ongoing relationship. Links a Customer to one or more Prices, tracks \`status\`, \`current_period_start\`, \`current_period_end\`, and manages the billing cycle.\n\n\`Invoice\` — the bill for each period. Created automatically by subscriptions, contains \`lines\` (line items), \`amount_due\`, \`status\`, and the associated \`payment_intent\`.\n\nEvery other concept in this workshop — trials, promotions, dunning, usage billing — is built on top of these five objects.`,
        callouts: [
          {
            kind: 'tip',
            text: `Bookmark the Stripe API reference for Subscriptions at docs.stripe.com/api/subscriptions. You will refer to it constantly when building subscription integrations. The object reference pages show every field, its type, and example values.`,
          },
        ],
      },
    ],
    doneLabel: `I've learned the core subscription billing concepts`,
  },

  // ── MODULE 2 ──────────────────────────────────────────────────────────
  {
    id: 'products-and-pricing',
    number: 2,
    title: 'Products & Pricing Models',
    estMinutes: 10,
    intro: `Products and Prices are the building blocks of your billing catalogue. This module walks through creating products in the Dashboard, configuring flat-rate and tiered pricing, and understanding how Stripe's pricing model flexibility lets you experiment without code changes.`,
    narrative: `CloudCanvas needs three tiers: a free Starter plan, a $29/month Pro plan, and a $99/month Team plan with per-seat pricing. You need to model all of this in Stripe before a single customer signs up.`,
    overviewAddition: `The product catalogue that will power CloudCanvas's subscription tiers.`,
    steps: [
      {
        title: 'Open the Products page',
        body: `Open Products in your Dashboard. This is where you define everything CloudCanvas sells. Each product can have multiple prices — for example, a monthly price and an annual price for the same plan.\n\nNote the columns: name, pricing, and created date. If you have existing products from one-time sales, they will appear here too. Subscriptions and one-time products live in the same catalogue.`,
        dashboardLink: { label: 'Products', url: 'https://dashboard.stripe.com/products' },
        gif: {
          caption: 'Record: opening the Products page in the Stripe Dashboard.',
          screen: 'Dashboard → Products',
        },
        callouts: [
          {
            kind: 'info',
            text: `Products in Stripe are reusable across payment links, Checkout sessions, invoices, and subscriptions. Creating a well-structured product catalogue now saves significant refactoring later.`,
          },
        ],
      },
      {
        title: 'Create CloudCanvas Pro (flat-rate)',
        body: `Click "Add product". Name it "CloudCanvas Pro". Add a description: "Professional design tools with unlimited projects and priority support."\n\nUnder Pricing, select "Recurring". Set the amount to $29.00 and the interval to "Monthly". Click "Add another price" and add a $290.00 yearly price — this gives annual subscribers a discount equivalent to two months free.\n\nClick "Save product".`,
        gif: {
          caption: 'Record: creating a new product called CloudCanvas Pro with monthly and annual pricing.',
          screen: 'Products → Add product',
        },
        callouts: [
          {
            kind: 'tip',
            text: `Offering an annual plan at a discount is one of the most effective ways to reduce churn. Annual subscribers have 3-5x lower churn rates than monthly subscribers because they have committed for a longer period and experience less frequent payment friction.`,
          },
        ],
      },
      {
        title: 'Create CloudCanvas Team (per-seat pricing)',
        body: `Click "Add product" again. Name it "CloudCanvas Team". Description: "Collaborative design workspace with admin controls, shared libraries, and team billing."\n\nUnder Pricing, select "Recurring" and set the interval to "Monthly". For the pricing model, select "Per unit". Set the unit amount to $15.00 per seat per month. This means a team of 5 pays $75/month, a team of 20 pays $300/month.\n\nAdd a yearly per-seat price of $150.00 per seat per year. Click "Save product".`,
        dashboardLink: { label: 'Products', url: 'https://dashboard.stripe.com/products' },
        gif: {
          caption: 'Record: creating CloudCanvas Team with per-unit (per-seat) monthly and annual pricing.',
          screen: 'Products → Add product → Per unit pricing',
        },
        callouts: [
          {
            kind: 'explanation',
            text: `Per-seat pricing is the most common SaaS pricing model for team products. When creating a subscription with a per-unit price, you pass a quantity parameter — Stripe multiplies the unit amount by the quantity automatically. Updating the seat count mid-cycle generates a prorated invoice.`,
          },
        ],
      },
      {
        title: 'Explore tiered pricing (graduated)',
        body: `Click "Add product" once more. Name it "CloudCanvas API" — this represents an API access tier for developers. Under Pricing, select "Recurring", then choose "Graduated pricing" as the model.\n\nSet up three tiers: First 1,000 API calls at $0.00 (free tier), next 9,000 at $0.01 each, and anything above 10,000 at $0.005 each. Set the interval to "Monthly".\n\nThis graduated model charges progressively — the first 1,000 are free, the next 9,000 cost $90, and additional calls are half price. The total bill depends on total usage.`,
        gif: {
          caption: 'Record: configuring graduated tiered pricing for an API product with three pricing tiers.',
          screen: 'Products → Add product → Graduated pricing',
        },
        callouts: [
          {
            kind: 'explanation',
            text: `Graduated pricing charges each unit at the rate for its tier. Volume pricing charges ALL units at the rate of the tier reached. For example, with graduated pricing, 1,500 calls costs $0 (first 1,000) + $5 (next 500 at $0.01). With volume pricing, 1,500 calls would cost $15 (all 1,500 at the $0.01 tier rate). Choose graduated when you want to reward growth; choose volume when you want simple tier breakpoints.`,
          },
        ],
      },
      {
        title: 'Add metadata to your products',
        body: `Open each product you created and click "Edit". In the Metadata section, add a key called \`plan_tier\` with values like \`pro\`, \`team\`, or \`api\`. Add another key called \`feature_set\` describing what is included.\n\nMetadata is arbitrary key-value data that travels with the product through the API. Your application can read it to determine feature access, display plan details, or drive conditional logic — without hardcoding product IDs.`,
        dashboardLink: { label: 'Products', url: 'https://dashboard.stripe.com/products' },
        callouts: [
          {
            kind: 'tip',
            text: `Use product and price metadata to store feature flags like "max_projects: 50" or "priority_support: true". Your app reads these from the subscription's price metadata to gate features — this way, changing plan limits is a Dashboard edit, not a code deploy.`,
          },
        ],
      },
      {
        title: 'Review your product catalogue',
        body: `Open Products in your Dashboard. You should see three products: CloudCanvas Pro (flat-rate monthly and annual), CloudCanvas Team (per-seat monthly and annual), and CloudCanvas API (graduated tiered). Each product has at least one recurring price.\n\nThis catalogue covers the three most common SaaS pricing models: flat-rate, per-seat, and usage-based. In later modules you will attach these prices to subscriptions, configure trials, and build a customer portal.`,
        dashboardLink: { label: 'Products', url: 'https://dashboard.stripe.com/products' },
        gif: {
          caption: 'Record: the Products page showing all three CloudCanvas products with their configured prices.',
          screen: 'Products → Full catalogue view',
        },
      },
    ],
    doneLabel: `I've created products with flat-rate, per-seat, and tiered pricing`,
  },

  // ── MODULE 3 ──────────────────────────────────────────────────────────
  {
    id: 'first-subscription',
    number: 3,
    title: 'Creating Your First Subscription',
    estMinutes: 12,
    intro: `With products and prices defined, it is time to create your first subscription. This module covers creating customers, attaching payment methods, and starting a subscription — both through the Dashboard and by understanding what happens in the API.`,
    narrative: `CloudCanvas has its first interested customer — a freelance designer named Alex who wants to try CloudCanvas Pro at $29/month. You need to set up Alex as a customer, collect payment details, and start the subscription.`,
    overviewAddition: `CloudCanvas's very first paying subscriber.`,
    steps: [
      {
        title: 'Create a customer',
        body: `Open Customers in your Dashboard. Click "Add customer". Fill in:\n\n- Name: Alex Rivera\n- Email: alex@example.com\n\nClick "Add customer". This creates a Customer object in Stripe that will be the anchor for Alex's subscriptions, payment methods, invoices, and billing history.\n\nNote the customer ID that appears — it starts with \`cus_\`. This ID is what your application stores to link a CloudCanvas user to their Stripe billing record.`,
        dashboardLink: { label: 'Customers', url: 'https://dashboard.stripe.com/customers' },
        gif: {
          caption: 'Record: creating a new customer named Alex Rivera in the Stripe Dashboard.',
          screen: 'Customers → Add customer',
        },
        callouts: [
          {
            kind: 'info',
            text: `Every Stripe object has a unique ID with a descriptive prefix: cus_ for customers, sub_ for subscriptions, in_ for invoices, pi_ for payment intents. These prefixes make debugging much easier — you can immediately tell what type of object you are looking at in logs, webhooks, and API responses.`,
          },
        ],
      },
      {
        title: 'Add a test payment method',
        body: `On Alex's customer detail page, click "Add payment method". Select "Card" and enter Stripe's test card number: 4242 4242 4242 4242. Use any future expiry date (e.g. 12/30) and any CVC (e.g. 123).\n\nClick "Add" and then set this card as the default payment method. Stripe will use the default payment method for all subscription invoices unless the customer specifies otherwise.\n\nIn production, you would use Stripe Elements or Checkout to collect payment details securely — you never handle raw card numbers in your own code.`,
        gif: {
          caption: 'Record: adding the 4242 test card as a payment method on the customer detail page.',
          screen: 'Customers → Customer detail → Add payment method',
        },
        callouts: [
          {
            kind: 'tip',
            text: `Stripe provides dozens of test card numbers for different scenarios: 4242 4242 4242 4242 always succeeds, 4000 0000 0000 0341 attaches successfully but fails on the first charge, 4000 0000 0000 9995 fails with a decline. Use these to test every path in your subscription flow.`,
          },
        ],
      },
      {
        title: 'Create the subscription',
        body: `On Alex's customer detail page, click "Create subscription". In the product search, find "CloudCanvas Pro" and select the $29.00/month price.\n\nLeave the start date as "Now" and the billing cycle anchor as automatic. Review the summary: it should show a $29.00 charge today, with the next invoice in one month.\n\nClick "Start subscription". Stripe will immediately create an invoice, attempt payment on the default card, and if successful, set the subscription status to \`active\`.`,
        dashboardLink: { label: 'Subscriptions', url: 'https://dashboard.stripe.com/subscriptions' },
        gif: {
          caption: 'Record: creating a subscription for CloudCanvas Pro on the customer detail page.',
          screen: 'Customers → Customer detail → Create subscription',
        },
        callouts: [
          {
            kind: 'explanation',
            text: `When you create a subscription, Stripe performs several actions in sequence: creates a Subscription object, generates the first Invoice, creates a PaymentIntent for that invoice, and attempts to charge the customer's default payment method. If the charge succeeds, the subscription becomes active. If it fails, the subscription enters an incomplete state and waits for a successful payment.`,
          },
        ],
      },
      {
        title: 'Inspect the subscription detail',
        body: `Open Subscriptions in your Dashboard and click on Alex's new subscription. Examine the detail page:\n\n- \`status\`: should be "Active"\n- \`current_period_start\` and \`current_period_end\`: defines the current billing window\n- \`default_payment_method\`: the card Stripe will charge\n- \`items\`: the price(s) included in this subscription\n\nScroll down to see the invoice history. The first invoice should show as "Paid". Click it to see the full invoice detail including the payment intent, line items, and receipt.`,
        dashboardLink: { label: 'Subscriptions', url: 'https://dashboard.stripe.com/subscriptions' },
        gif: {
          caption: 'Record: the subscription detail page showing status, billing period, and invoice history.',
          screen: 'Subscriptions → Subscription detail',
        },
      },
      {
        title: 'Understand the API equivalent',
        body: `What you just did in the Dashboard maps directly to API calls. Creating the subscription is equivalent to:\n\n\`stripe.subscriptions.create({ customer: "cus_xxx", items: [{ price: "price_xxx" }] })\`\n\nThe \`items\` array accepts one or more price IDs. Each item becomes a line on the invoice. You can also pass \`trial_period_days\`, \`coupon\`, \`metadata\`, and \`payment_behavior\` to control the subscription's initial behaviour.\n\nThe API returns a Subscription object with all the fields you saw in the Dashboard. Your application should store the \`subscription.id\` and listen for webhook events to track status changes.`,
        callouts: [
          {
            kind: 'tip',
            text: `Set payment_behavior to "default_incomplete" when creating subscriptions via the API. This returns the subscription with a pending PaymentIntent that your frontend can confirm using Stripe.js — giving you full control over the payment UX including 3D Secure authentication.`,
          },
          {
            kind: 'warning',
            text: `Never rely solely on the API response to determine subscription status. Always use webhooks. The API response tells you the status at the moment of creation, but subsequent events (payment failures, disputes, cancellations) happen asynchronously.`,
          },
        ],
      },
      {
        title: 'Verify in the Payments list',
        body: `Open Payments in your Dashboard. You should see a $29.00 payment from Alex Rivera. Click it and note the connection chain: Payment → Invoice → Subscription → Customer.\n\nEvery subscription payment flows through this chain. When debugging billing issues in production, you can trace any payment back to its subscription and customer by following these links.`,
        dashboardLink: { label: 'Payments', url: 'https://dashboard.stripe.com/payments' },
        gif: {
          caption: 'Record: finding the subscription payment in the Payments list and tracing it to the subscription.',
          screen: 'Payments → Payment detail → linked subscription',
        },
      },
    ],
    doneLabel: `I've created my first customer and subscription in Stripe`,
  },

  // ── MODULE 4 ──────────────────────────────────────────────────────────
  {
    id: 'trials-and-promotions',
    number: 4,
    title: 'Trial Periods & Promotions',
    estMinutes: 8,
    intro: `Free trials and promotional discounts are two of the most effective levers for converting prospects into paying subscribers. Stripe handles both natively — trial periods delay the first charge, and coupons apply discounts to invoices. This module covers how to configure both without writing custom billing logic.`,
    narrative: `CloudCanvas's marketing team wants to offer a 14-day free trial of Pro and a 20% launch discount for the first three months. You need to set this up so it works automatically — no manual intervention when the trial ends or the discount expires.`,
    overviewAddition: `The acquisition tools that will drive CloudCanvas's initial subscriber growth.`,
    steps: [
      {
        title: 'Add a trial period to a subscription',
        body: `Open Subscriptions in your Dashboard. Click "Create subscription". Select a customer and add the CloudCanvas Pro monthly price.\n\nBefore clicking "Start subscription", find the "Free trial" section. Set the trial to 14 days. Notice how the summary changes — the first charge is now scheduled 14 days from today instead of immediately.\n\nDuring the trial, the subscription status is \`trialing\`. The customer has full access but is not charged. When the trial ends, Stripe automatically creates the first invoice and attempts payment. If payment succeeds, the status transitions to \`active\`. If it fails, it goes to \`past_due\`.`,
        dashboardLink: { label: 'Subscriptions', url: 'https://dashboard.stripe.com/subscriptions' },
        gif: {
          caption: 'Record: creating a subscription with a 14-day free trial and reviewing the deferred billing date.',
          screen: 'Subscriptions → Create subscription → Free trial',
        },
        callouts: [
          {
            kind: 'billing-fact',
            text: `SaaS companies with free trials convert at an average rate of 15-25% from trial to paid, compared to 2-5% for freemium models. The key difference is that trials create urgency — the clock is ticking, and the customer has already invested time setting up the product.`,
          },
        ],
      },
      {
        title: 'Create a coupon',
        body: `Open Coupons in your Dashboard (under Billing → Coupons, or the Product catalog). Click "Create coupon".\n\nName it "Launch20" and set it to 20% off. Under Duration, select "Repeating" and set it to 3 months. This means the discount applies to the first three invoices and then automatically stops.\n\nYou can also set a redemption limit (how many customers can use it) and an expiry date (after which the code stops working). For CloudCanvas's launch, set a redemption limit of 100 and an expiry of 90 days from today.`,
        dashboardLink: { label: 'Coupons', url: 'https://dashboard.stripe.com/coupons' },
        gif: {
          caption: 'Record: creating a 20% off repeating coupon named Launch20 with a 3-month duration.',
          screen: 'Billing → Coupons → Create coupon',
        },
        callouts: [
          {
            kind: 'explanation',
            text: `Coupons define the discount logic. Promotion codes are customer-facing codes that reference a coupon. You can create multiple promotion codes for the same coupon — useful for tracking which marketing channel each signup came from. For example, coupon "Launch20" might have promotion codes "TWITTER20", "NEWSLETTER20", and "PARTNER20" all applying the same 20% discount.`,
          },
        ],
      },
      {
        title: 'Create a promotion code',
        body: `On the coupon detail page for Launch20, click "Create promotion code". Enter the code "CLOUDPRO20". Optionally restrict it to first-time subscribers only by checking "First-time order".\n\nPromotion codes are what customers type at checkout. The code "CLOUDPRO20" maps to the "Launch20" coupon's 20% discount for 3 months. You can share this code on your website, in emails, or through partner channels.\n\nIn the API, you apply a promotion code to a subscription using the \`promotion_code\` parameter, or customers can enter it directly in Stripe Checkout.`,
        callouts: [
          {
            kind: 'tip',
            text: `Always set an expiry date and redemption limit on launch coupons. It is very common for coupon codes to leak to discount-sharing websites. Without limits, a coupon intended for 100 early adopters can end up used by thousands, significantly impacting revenue.`,
          },
        ],
      },
      {
        title: 'Combine trials with coupons',
        body: `Create a new subscription with both a 14-day trial AND the Launch20 coupon applied. Look at the billing summary carefully:\n\n- Days 1-14: Free trial, no charge\n- Invoice 1 (day 14): $23.20 ($29.00 minus 20%)\n- Invoice 2 (day 44): $23.20\n- Invoice 3 (day 74): $23.20\n- Invoice 4 (day 104): $29.00 (full price — coupon expired)\n\nStripe handles the entire sequence automatically. The trial delays the first charge, the coupon discounts the first three charges, and then full-price billing continues. No cron jobs, no manual adjustments.`,
        dashboardLink: { label: 'Subscriptions', url: 'https://dashboard.stripe.com/subscriptions' },
        gif: {
          caption: 'Record: creating a subscription with both a free trial and a coupon, reviewing the combined billing timeline.',
          screen: 'Subscriptions → Create subscription → Trial + Coupon',
        },
        callouts: [
          {
            kind: 'warning',
            text: `When combining trials and coupons, be careful about the customer experience at trial end. The first real charge is already discounted, which softens the landing. But make sure your trial-ending email mentions the discounted price, not the full price — otherwise the customer expects to pay $29 and sees $23.20, which is confusing even though it is in their favour.`,
          },
        ],
      },
      {
        title: 'Review active discounts',
        body: `Open a subscription that has a coupon applied. In the subscription detail, find the "Discount" section. It shows the coupon name, the percentage off, how many billing periods remain, and the total amount saved so far.\n\nYou can also remove a discount from a subscription at any time by clicking "Remove discount". This takes effect on the next invoice. Removing a discount does not change past invoices — those remain at the discounted price.`,
        dashboardLink: { label: 'Subscriptions', url: 'https://dashboard.stripe.com/subscriptions' },
        callouts: [
          {
            kind: 'info',
            text: `You can apply discounts at the subscription level (affects all line items) or at the subscription item level (affects only one price). Item-level discounts are useful when a subscription includes multiple products and you only want to discount one of them.`,
          },
        ],
      },
    ],
    doneLabel: `I've configured free trials and promotional coupons`,
  },

  // ── MODULE 5 ──────────────────────────────────────────────────────────
  {
    id: 'customer-portal',
    number: 5,
    title: 'The Customer Portal',
    estMinutes: 10,
    intro: `Stripe provides a hosted Customer Portal that lets subscribers manage their own billing — update payment methods, switch plans, cancel, view invoices, and apply coupons. This module covers how to configure and launch it, saving you weeks of building self-service billing UI.`,
    narrative: `CloudCanvas's support inbox is filling up with requests: "How do I update my card?", "Can I switch to annual billing?", "Where are my invoices?". Instead of building a custom billing management page, you will deploy Stripe's Customer Portal and let customers self-serve.`,
    overviewAddition: `Self-service billing that eliminates 80% of billing support tickets.`,
    steps: [
      {
        title: 'Open the Customer Portal settings',
        body: `Navigate to Settings → Billing → Customer portal in your Dashboard. This is where you configure what customers can do when they access the portal.\n\nThe portal is a Stripe-hosted page with your branding. Customers access it via a short-lived URL that your application generates using the API. Once there, they can manage everything billing-related without contacting support.`,
        dashboardLink: { label: 'Customer Portal', url: 'https://dashboard.stripe.com/settings/billing/portal' },
        gif: {
          caption: 'Record: opening the Customer Portal settings page in the Stripe Dashboard.',
          screen: 'Settings → Billing → Customer portal',
        },
        callouts: [
          {
            kind: 'info',
            text: `The Customer Portal is entirely hosted by Stripe. You do not need to build any UI for payment method updates, plan changes, cancellations, or invoice history. You generate a portal session URL with one API call and redirect the customer there.`,
          },
        ],
      },
      {
        title: 'Configure portal features',
        body: `In the portal settings, enable the following features:\n\n- **Payment methods**: Allow customers to update their card or add new payment methods\n- **Subscriptions**: Allow customers to switch plans and cancel\n- **Invoices**: Show invoice history and allow PDF downloads\n- **Promotion codes**: Allow customers to apply coupon codes\n\nFor cancellations, you have options: cancel immediately, cancel at end of billing period, or require customers to provide a reason before cancelling. For CloudCanvas, select "Cancel at end of period" and enable the cancellation reason prompt — this gives you churn data without cutting off access abruptly.`,
        gif: {
          caption: 'Record: configuring Customer Portal features — enabling payment methods, subscriptions, invoices, and cancellation settings.',
          screen: 'Customer portal settings → Features configuration',
        },
        callouts: [
          {
            kind: 'tip',
            text: `Always set cancellation to "end of period" rather than immediate. Customers who cancel and then change their mind within the billing period can simply reactivate without any disruption. Immediate cancellation is irreversible and creates unnecessary support requests from customers who cancelled accidentally.`,
          },
        ],
      },
      {
        title: 'Configure plan switching',
        body: `In the Subscriptions section of the portal settings, add the products that customers are allowed to switch between. Add CloudCanvas Pro (monthly and annual) and CloudCanvas Team (monthly and annual).\n\nConfigure proration behaviour: when a customer upgrades mid-cycle, you can charge the prorated difference immediately or apply it as a credit on the next invoice. For CloudCanvas, select "Create prorations" with "Always invoice immediately" — this charges the upgrade cost right away so customers get immediate access to the higher tier.\n\nWhen a customer downgrades, the credit for the unused portion of their current plan is applied to their next invoice automatically.`,
        dashboardLink: { label: 'Customer Portal', url: 'https://dashboard.stripe.com/settings/billing/portal' },
        callouts: [
          {
            kind: 'explanation',
            text: `Proration calculates the unused portion of the current plan and the cost of the new plan for the remainder of the period. If a customer on a $29/month plan upgrades to a $99/month Team plan halfway through the month, they get a $14.50 credit for the unused Pro days and a $49.50 charge for the remaining Team days — net charge of $35.00.`,
          },
        ],
      },
      {
        title: 'Generate a portal session URL',
        body: `The API call to create a portal session is:\n\n\`stripe.billingPortal.sessions.create({ customer: "cus_xxx", return_url: "https://app.cloudcanvas.io/account" })\`\n\nThis returns a \`url\` field — redirect the customer to this URL. The session lasts 5 minutes. The \`return_url\` is where the customer is sent when they click "Done" or navigate back.\n\nIn your CloudCanvas application, you would add a "Manage Billing" button on the account settings page that calls this API endpoint and redirects the customer to the portal.`,
        callouts: [
          {
            kind: 'tip',
            text: `Portal sessions are short-lived for security. Generate a fresh URL each time the customer clicks "Manage Billing" — do not cache or store portal URLs. The API call is fast (typically under 200ms) and does not count against rate limits in any meaningful way.`,
          },
        ],
      },
      {
        title: 'Preview the Customer Portal',
        body: `Back in the portal settings page, click "Preview" to see what the portal looks like from a customer's perspective. Note the branding, the available actions, and the invoice history.\n\nCustomers can update their payment method (Stripe handles PCI compliance for the card form), view and download past invoices, switch between plans you have configured, and cancel their subscription with a reason prompt.\n\nThis single page replaces what would typically take 2-4 weeks of custom development — card update forms, plan comparison UI, proration calculations, cancellation flows, and invoice downloads.`,
        dashboardLink: { label: 'Customer Portal', url: 'https://dashboard.stripe.com/settings/billing/portal' },
        gif: {
          caption: 'Record: previewing the Customer Portal showing payment methods, plan switching, and invoice history.',
          screen: 'Customer portal settings → Preview',
        },
      },
    ],
    doneLabel: `I've configured the Customer Portal for self-service billing`,
  },

  // ── MODULE 6 ──────────────────────────────────────────────────────────
  {
    id: 'invoices-and-collection',
    number: 6,
    title: 'Invoices & Payment Collection',
    estMinutes: 10,
    intro: `Every subscription payment in Stripe is backed by an invoice. Understanding how invoices work — their lifecycle, customisation options, and collection behaviour — gives you control over exactly how and when customers are charged.`,
    narrative: `CloudCanvas is growing and the finance team wants professional invoices with line-item details, tax information, and custom footer text. They also want to understand the gap between "invoice created" and "payment collected" so they can improve cash flow forecasting.`,
    overviewAddition: `The financial backbone of CloudCanvas's subscription operation.`,
    steps: [
      {
        title: 'Explore the Invoices page',
        body: `Open Invoices in your Dashboard. You will see invoices generated by the subscriptions you created in earlier modules. Note the columns: number, customer, amount, status, and date.\n\nInvoice statuses are: \`draft\` (being prepared), \`open\` (finalised and awaiting payment), \`paid\` (payment succeeded), \`void\` (cancelled before payment), and \`uncollectible\` (marked as unrecoverable). For automatic subscriptions, invoices move from draft to open to paid within seconds.`,
        dashboardLink: { label: 'Invoices', url: 'https://dashboard.stripe.com/invoices' },
        gif: {
          caption: 'Record: the Invoices page showing a list of subscription-generated invoices with their statuses.',
          screen: 'Dashboard → Invoices',
        },
        callouts: [
          {
            kind: 'info',
            text: `Stripe assigns sequential invoice numbers automatically (e.g., INV-0001, INV-0002). You can customise the prefix and starting number in your invoice settings. For accounting and tax compliance, invoice numbers must be sequential and unique — Stripe enforces this.`,
          },
        ],
      },
      {
        title: 'Inspect an invoice detail',
        body: `Click on any paid invoice. Examine its structure:\n\n- **Header**: Invoice number, date, customer name and email\n- **Line items**: Each subscription item with description, quantity, unit price, and total\n- **Subtotal, tax, and total**: The calculated amounts\n- **Payment details**: The payment method used, the PaymentIntent ID, and the charge status\n- **PDF**: Click "Download PDF" to see the customer-facing invoice document\n\nNote the \`billing_reason\` field — it tells you why this invoice exists. Common values are \`subscription_create\` (first invoice), \`subscription_cycle\` (recurring), and \`subscription_update\` (plan change with proration).`,
        gif: {
          caption: 'Record: opening an invoice detail page and reviewing line items, totals, and payment details.',
          screen: 'Invoices → Invoice detail',
        },
        callouts: [
          {
            kind: 'explanation',
            text: `The billing_reason field is invaluable for analytics. It lets you distinguish between new revenue (subscription_create), recurring revenue (subscription_cycle), expansion revenue (subscription_update with increased amount), and contraction (subscription_update with decreased amount). These four categories map directly to the SaaS revenue waterfall that finance teams use for reporting.`,
          },
        ],
      },
      {
        title: 'Configure invoice settings',
        body: `Open Settings → Billing → Invoices in your Dashboard. Configure the following:\n\n- **Default payment terms**: Set to "Due on receipt" for subscriptions (payment is attempted immediately) or set net terms like "Net 30" for invoice-based billing\n- **Invoice footer**: Add "CloudCanvas Inc. — Thank you for your subscription."\n- **Default memo**: Optionally add a note that appears on every invoice\n- **Email invoices**: Enable automatic invoice emails so customers receive a copy\n\nThese settings apply to all new invoices. Existing invoices are not retroactively updated.`,
        dashboardLink: { label: 'Invoice Settings', url: 'https://dashboard.stripe.com/settings/billing/invoice' },
        gif: {
          caption: 'Record: configuring invoice settings including payment terms, footer, and email delivery.',
          screen: 'Settings → Billing → Invoices',
        },
      },
      {
        title: 'Understand collection methods',
        body: `Stripe supports two collection methods for subscriptions:\n\n**charge_automatically** (default): Stripe charges the customer's default payment method on the invoice due date. If the charge fails, Stripe retries according to your retry schedule. This is what CloudCanvas uses for self-serve subscriptions.\n\n**send_invoice**: Stripe emails the invoice to the customer and waits for them to pay manually. You set payment terms (e.g., Net 30) and the customer clicks a link to pay. This is common for enterprise or B2B billing where customers need to route invoices through procurement.\n\nYou set the collection method per subscription. A single customer can have one subscription on automatic collection and another on manual invoicing.`,
        callouts: [
          {
            kind: 'tip',
            text: `For B2B SaaS, consider using send_invoice with Net 30 terms for annual enterprise contracts. This matches how procurement departments work — they receive an invoice, route it for approval, and pay within 30 days. Trying to charge a corporate card automatically often fails because the card has spending limits or the admin needs to approve each charge.`,
          },
          {
            kind: 'billing-fact',
            text: `Companies using automatic payment collection see 95-98% of subscription invoices paid on time. Companies using manual invoicing (send_invoice) see 70-85% paid within terms. The gap represents cash flow risk that grows with subscriber count.`,
          },
        ],
      },
      {
        title: 'Create a one-off invoice item',
        body: `Sometimes you need to bill a customer outside the regular subscription cycle — for a setup fee, consulting hours, or usage overage. Open a customer's detail page and click "Create invoice".\n\nAdd a line item manually: description "CloudCanvas Pro — Onboarding & Setup", amount $199.00, quantity 1. You can add this to an existing subscription invoice (it appears as an additional line item on the next billing cycle) or create a standalone invoice.\n\nThe API equivalent is \`stripe.invoiceItems.create({ customer: "cus_xxx", amount: 19900, currency: "usd", description: "Onboarding & Setup" })\`. This invoice item will be swept into the next invoice for that customer.`,
        dashboardLink: { label: 'Invoices', url: 'https://dashboard.stripe.com/invoices' },
        callouts: [
          {
            kind: 'explanation',
            text: `Pending invoice items are automatically included on the next invoice Stripe generates for that customer — whether from a subscription cycle or a manually created invoice. This is how you add one-time charges to a subscription relationship without creating a separate payment flow.`,
          },
        ],
      },
    ],
    doneLabel: `I've explored invoices and configured collection settings`,
  },

  // ── MODULE 7 ──────────────────────────────────────────────────────────
  {
    id: 'subscription-webhooks',
    number: 7,
    title: 'Handling Subscription Webhooks',
    estMinutes: 12,
    intro: `Webhooks are how Stripe tells your application about events that happen asynchronously — subscription renewals, payment failures, cancellations, and plan changes. Without webhooks, your application has no way to know when a subscription status changes. This module covers the critical webhook events and how to handle them.`,
    narrative: `CloudCanvas's subscription count is growing but the application still checks subscription status by calling the API on every page load. This is slow, wasteful, and breaks when the API is unreachable. You need to implement webhook handlers so the app reacts to billing events in real time.`,
    overviewAddition: `The event-driven architecture that keeps CloudCanvas in sync with Stripe.`,
    steps: [
      {
        title: 'Open the Webhooks page',
        body: `Open Webhooks in your Dashboard. This is where you register endpoint URLs that Stripe will POST event data to whenever something happens in your account.\n\nClick "Add endpoint". For the endpoint URL, you would use your application's webhook handler — something like \`https://api.cloudcanvas.io/webhooks/stripe\`. In development, you can use the Stripe CLI to forward events to your local server.\n\nDo not add the endpoint yet — first understand which events you need.`,
        dashboardLink: { label: 'Webhooks', url: 'https://dashboard.stripe.com/webhooks' },
        gif: {
          caption: 'Record: opening the Webhooks page and viewing the Add endpoint form.',
          screen: 'Developers → Webhooks → Add endpoint',
        },
        callouts: [
          {
            kind: 'info',
            text: `Stripe signs every webhook event with a signature header (Stripe-Signature). Your endpoint must verify this signature using your webhook signing secret to ensure the event actually came from Stripe and was not forged by an attacker. Every Stripe SDK provides a built-in method for signature verification.`,
          },
        ],
      },
      {
        title: 'The essential subscription events',
        body: `For a subscription billing system, these are the webhook events you must handle:\n\n**\`customer.subscription.created\`** — A new subscription has been created. Update your database to record the subscription and grant access to the appropriate features.\n\n**\`customer.subscription.updated\`** — The subscription has changed. This fires on plan changes, status transitions, trial endings, and metadata updates. Always check the \`status\` field — it tells you whether the subscription is active, past_due, canceled, or unpaid.\n\n**\`customer.subscription.deleted\`** — The subscription has been fully canceled (not just scheduled to cancel). Revoke access to paid features.\n\n**\`invoice.payment_succeeded\`** — A subscription invoice was paid. Confirm continued access and optionally send a receipt.\n\n**\`invoice.payment_failed\`** — Payment failed. Prompt the customer to update their payment method before Stripe's retry schedule runs out.`,
        callouts: [
          {
            kind: 'warning',
            text: `The customer.subscription.updated event fires frequently — for status changes, metadata updates, price changes, and even billing cycle anchor adjustments. Always check what actually changed by comparing the event's data.object with data.previous_attributes. Do not assume every update event means a plan change.`,
          },
        ],
      },
      {
        title: 'Handle the subscription lifecycle',
        body: `Here is how CloudCanvas should respond to each status transition:\n\n**\`trialing\` → \`active\`**: Trial ended, payment succeeded. No action needed beyond confirming access is granted — the customer is now paying.\n\n**\`active\` → \`past_due\`**: Payment failed on renewal. Send the customer an email asking them to update their payment method. Display a banner in the app. Do not revoke access immediately — give them time to fix the issue.\n\n**\`past_due\` → \`active\`**: The customer updated their payment method and the retry succeeded. Remove the banner, send a confirmation email.\n\n**\`past_due\` → \`canceled\`**: All retries exhausted, subscription terminated. Revoke access to Pro features, downgrade to Starter.\n\n**\`active\` → \`canceled\`**: Customer voluntarily canceled (or cancel_at_period_end triggered). Revoke Pro access.\n\nEach of these transitions arrives as a \`customer.subscription.updated\` webhook with the new status in the event payload.`,
        gif: {
          caption: 'Record: a diagram showing subscription status transitions and the corresponding webhook events.',
          screen: 'Subscription lifecycle diagram',
        },
        callouts: [
          {
            kind: 'tip',
            text: `Implement a grace period for past_due subscriptions. Most SaaS companies give customers 7-14 days to fix their payment method before revoking access. Aggressive lockouts (revoking access on the first failed payment) cause unnecessary churn — many payment failures are due to expired cards or temporary bank issues, not customers who want to stop paying.`,
          },
        ],
      },
      {
        title: 'Test webhooks with the Stripe CLI',
        body: `The Stripe CLI lets you forward webhook events to your local development server. Install it and run:\n\n\`stripe listen --forward-to localhost:3000/api/webhooks/stripe\`\n\nThis creates a temporary webhook endpoint that forwards all events from your Stripe account to your local server. The CLI prints each event as it arrives, including the event type and ID.\n\nTo trigger a test event manually:\n\n\`stripe trigger customer.subscription.created\`\n\nThis creates a test subscription in your account and sends the corresponding webhook event to your local listener. Use this to test each handler without waiting for real billing cycles.`,
        callouts: [
          {
            kind: 'explanation',
            text: `The Stripe CLI provides a webhook signing secret that starts with whsec_. Use this secret in your local development environment for signature verification. It is different from the signing secret shown in the Dashboard for production endpoints. Each endpoint — local or production — has its own signing secret.`,
          },
        ],
      },
      {
        title: 'Ensure idempotent handling',
        body: `Stripe may deliver the same webhook event more than once. Network timeouts, retries, and edge cases can all result in duplicate deliveries. Your webhook handler must be idempotent — processing the same event twice should produce the same result as processing it once.\n\nThe standard approach: store the \`event.id\` in your database when you process it. Before processing any event, check whether you have already seen that ID. If you have, return a 200 response and skip processing.\n\nAlternatively, make your handlers naturally idempotent by using upsert operations instead of inserts, and by checking current state before making changes. For example, do not downgrade a customer to Starter if they are already on Starter.\n\nAlways return a 2xx HTTP response to acknowledge receipt, even if you choose to skip processing. Stripe interprets non-2xx responses as failures and will retry the delivery, compounding the duplicate problem.`,
        callouts: [
          {
            kind: 'warning',
            text: `Webhook endpoints must respond within 20 seconds. If your handler performs slow operations (sending emails, calling external APIs, running database migrations), do the heavy work asynchronously — acknowledge the webhook immediately and process the event in a background job queue.`,
          },
        ],
      },
    ],
    doneLabel: `I've learned how to handle subscription webhook events`,
  },

  // ── MODULE 8 ──────────────────────────────────────────────────────────
  {
    id: 'dunning-and-recovery',
    number: 8,
    title: 'Dunning & Failed Payment Recovery',
    estMinutes: 10,
    intro: `Payment failures are inevitable. Cards expire, bank accounts have insufficient funds, and issuers decline transactions for risk reasons. Dunning is the process of recovering failed payments through retries, customer notifications, and smart payment timing. Stripe provides extensive tools for this — configuring them correctly is the difference between recovering revenue and losing subscribers.`,
    narrative: `CloudCanvas has 200 subscribers now and the first wave of payment failures is hitting. Twelve subscriptions failed to renew last week. Some are expired cards, some are temporary declines. Without a recovery strategy, these customers will churn silently.`,
    overviewAddition: `Recovering the revenue that would otherwise disappear to failed payments.`,
    steps: [
      {
        title: 'Open the retry schedule settings',
        body: `Navigate to Settings → Billing → Subscriptions and emails in your Dashboard. Find the "Manage failed payments" section. This is where you configure how Stripe handles payment failures.\n\nThe retry schedule determines how many times Stripe attempts to charge a failed payment, and when. The default schedule retries up to 4 times over approximately 3 weeks. You can customise the interval between retries and the total number of attempts.`,
        dashboardLink: { label: 'Subscription Settings', url: 'https://dashboard.stripe.com/settings/billing/automatic' },
        gif: {
          caption: 'Record: opening the subscription billing settings and finding the retry schedule configuration.',
          screen: 'Settings → Billing → Subscriptions and emails → Manage failed payments',
        },
        callouts: [
          {
            kind: 'billing-fact',
            text: `On average, 10-15% of subscription payment attempts fail on the first try. Of those, Stripe's retry logic recovers 40-60% without any customer action required. The remaining failures need customer intervention — updating the card, adding funds, or contacting their bank.`,
          },
        ],
      },
      {
        title: 'Configure subscription status after failures',
        body: `In the same settings section, find "If all retries for a payment fail". You have three options:\n\n**Cancel the subscription**: Stripe cancels it entirely. The customer loses access immediately. Most aggressive option.\n\n**Mark the subscription as unpaid**: The subscription stays active but in an \`unpaid\` state. You decide whether to continue granting access. Most flexible option.\n\n**Leave the subscription past_due**: The subscription remains \`past_due\` indefinitely until the customer updates their payment method or you cancel manually.\n\nFor CloudCanvas, select "Mark the subscription as unpaid" — this lets you implement a custom grace period in your application while maintaining a clear status signal.`,
        callouts: [
          {
            kind: 'tip',
            text: `Many SaaS companies use a tiered access approach: past_due customers get a warning banner but full access for 7 days, then read-only access for 7 more days, then full lockout. This gives customers multiple chances to update their payment method without abruptly cutting off work in progress.`,
          },
        ],
      },
      {
        title: 'Configure customer emails',
        body: `In the subscription settings, find the "Emails" section. Stripe can automatically send emails to customers when:\n\n- A payment fails (with a link to update their payment method)\n- A subscription is about to be canceled due to non-payment\n- An upcoming renewal is approaching (advance notice)\n- A trial is about to end\n\nEnable all of these for CloudCanvas. The payment failure email includes a hosted link where the customer can update their card directly — no login to your application required. This is often the single most effective recovery mechanism.`,
        dashboardLink: { label: 'Email Settings', url: 'https://dashboard.stripe.com/settings/billing/automatic' },
        gif: {
          caption: 'Record: enabling customer notification emails for failed payments, upcoming renewals, and trial endings.',
          screen: 'Settings → Billing → Emails configuration',
        },
        callouts: [
          {
            kind: 'explanation',
            text: `The hosted payment update link in Stripe's failure emails is powerful because it removes friction. The customer clicks the link, enters a new card, and Stripe automatically retries the failed payment. No login, no navigation, no support ticket. Recovery emails with a direct payment link recover 2-3x more failed payments than emails that simply say "please update your payment method".`,
          },
        ],
      },
      {
        title: 'Understand Smart Retries',
        body: `If you have Stripe Billing enabled, you have access to Smart Retries. Unlike fixed retry schedules that attempt payment at predetermined intervals, Smart Retries uses machine learning to determine the optimal time to retry each specific payment.\n\nSmart Retries considers the failure reason (expired card vs. insufficient funds vs. issuer decline), the customer's payment history, time-of-day and day-of-week patterns, and signals from Stripe's network to pick the moment most likely to succeed.\n\nTo enable Smart Retries, go to Settings → Billing → Subscriptions and emails and toggle "Use Smart Retries" on. Once enabled, Stripe replaces your fixed retry schedule with its ML-optimised timing.`,
        callouts: [
          {
            kind: 'billing-fact',
            text: `Stripe reports that Smart Retries recovers an average of 38% more revenue than fixed retry schedules. For a company with $100K in monthly recurring revenue and a 10% failure rate, that translates to roughly $3,800 in additional recovered revenue per month.`,
          },
        ],
      },
      {
        title: 'Monitor your recovery metrics',
        body: `Open the Billing overview in your Dashboard. Look for the revenue recovery section — it shows how many failed payments were recovered, the recovery rate, and the total recovered amount.\n\nTrack these metrics monthly. A healthy recovery rate is above 50% (meaning more than half of all failed payments are eventually collected). If your rate is below 40%, consider shortening your retry window, enabling Smart Retries, or improving your payment failure emails with more specific language about what the customer needs to do.`,
        dashboardLink: { label: 'Billing', url: 'https://dashboard.stripe.com/billing' },
        gif: {
          caption: 'Record: viewing the revenue recovery metrics on the Billing overview page.',
          screen: 'Billing → Overview → Revenue recovery',
        },
      },
    ],
    doneLabel: `I've configured dunning, retries, and customer recovery emails`,
  },

  // ── MODULE 9 ──────────────────────────────────────────────────────────
  {
    id: 'upgrades-downgrades-pausing',
    number: 9,
    title: 'Upgrades, Downgrades & Pausing',
    estMinutes: 10,
    intro: `Subscribers change their minds. They want to upgrade for more features, downgrade to save money, or pause when they are not using the product. Stripe handles all of these changes with proration, schedule management, and pause controls. This module covers how to manage subscription changes correctly.`,
    narrative: `CloudCanvas Pro is live and customers are asking for flexibility. A design agency wants to upgrade from Pro to Team. A freelancer wants to pause for the summer. Another customer wants to switch from monthly to annual. You need to handle all of these without manual calculations or billing errors.`,
    overviewAddition: `Flexibility that keeps customers subscribed instead of cancelling outright.`,
    steps: [
      {
        title: 'Upgrade a subscription',
        body: `Open Subscriptions in your Dashboard. Click on any active Pro subscription. Click "Update subscription". Change the price from CloudCanvas Pro ($29/month) to CloudCanvas Team ($15/seat/month) and set the quantity to 5 seats.\n\nBefore confirming, look at the proration preview. Stripe calculates the credit for the unused portion of the current Pro period and the charge for the remaining Team period. The net amount (positive or negative) is either charged immediately or applied to the next invoice, depending on your proration settings.\n\nClick "Update" to apply the change.`,
        dashboardLink: { label: 'Subscriptions', url: 'https://dashboard.stripe.com/subscriptions' },
        gif: {
          caption: 'Record: upgrading a subscription from Pro to Team with 5 seats, showing the proration preview.',
          screen: 'Subscriptions → Subscription detail → Update subscription',
        },
        callouts: [
          {
            kind: 'explanation',
            text: `Proration is calculated to the second. If a customer upgrades 15 days into a 30-day billing period, they get a credit for 15/30 of their old plan and a charge for 15/30 of their new plan. Stripe handles leap years, varying month lengths, and timezone differences automatically. You never need to calculate prorations manually.`,
          },
        ],
      },
      {
        title: 'Downgrade a subscription',
        body: `Open another subscription and click "Update subscription". Change from CloudCanvas Team to CloudCanvas Pro. Note how the proration preview shows a credit — the customer overpaid for the higher-tier plan.\n\nYou have two options for when the downgrade takes effect:\n\n**Immediately**: The subscription changes to Pro right now. The credit for unused Team time is applied to the next invoice.\n\n**At end of period**: The subscription stays on Team until the current billing period ends, then switches to Pro on the next renewal. No proration needed because the customer used the full paid period.\n\nFor most SaaS products, "at end of period" is the standard for downgrades. The customer already paid for the current period and should retain access to Team features until it expires.`,
        callouts: [
          {
            kind: 'tip',
            text: `In the API, use the proration_behavior parameter: "create_prorations" for immediate changes with proration, "none" for changes without proration adjustments, or "always_invoice" to generate an invoice for the proration immediately rather than waiting for the next billing cycle.`,
          },
        ],
      },
      {
        title: 'Switch billing intervals',
        body: `A customer wants to switch from monthly ($29/month) to annual ($290/year) billing. Open their subscription and click "Update subscription". Remove the monthly price and add the annual price for the same product.\n\nThe proration preview shows a credit for the unused monthly period and a charge for the annual plan. Stripe recalculates the billing anchor to start a new 12-month period from the change date.\n\nThis is a common upgrade path — annual billing gives the customer a discount and gives CloudCanvas a longer commitment with better revenue predictability.`,
        dashboardLink: { label: 'Subscriptions', url: 'https://dashboard.stripe.com/subscriptions' },
        gif: {
          caption: 'Record: switching a subscription from monthly to annual billing, showing the proration calculation.',
          screen: 'Subscriptions → Update subscription → Interval change',
        },
      },
      {
        title: 'Pause a subscription',
        body: `Stripe supports pausing subscriptions through the \`pause_collection\` parameter. When paused, Stripe stops creating invoices and attempting payments, but the subscription object remains active in a paused state.\n\nIn the API:\n\n\`stripe.subscriptions.update("sub_xxx", { pause_collection: { behavior: "void" } })\`\n\nThe \`behavior\` parameter controls what happens to invoices during the pause:\n\n- **\`void\`**: Invoices are voided (not charged). Most common for temporary pauses.\n- **\`keep_as_draft\`**: Invoices are created as drafts. Useful if you want to review and finalise them manually when the customer resumes.\n- **\`mark_uncollectible\`**: Invoices are marked as uncollectible. Used when the customer has indicated they will not pay.\n\nTo resume, update the subscription with \`pause_collection: null\`. Stripe immediately resumes the billing cycle.`,
        callouts: [
          {
            kind: 'billing-fact',
            text: `Companies that offer subscription pausing see 15-20% lower cancellation rates. Customers who might otherwise cancel because they are travelling, switching projects, or temporarily budget-constrained will pause instead — and most of them resume within 1-3 months.`,
          },
          {
            kind: 'warning',
            text: `When a paused subscription resumes, Stripe does not retroactively charge for the paused period. The customer is not billed for the time they were paused. The next invoice starts a new billing period from the resume date.`,
          },
        ],
      },
      {
        title: 'Use subscription schedules for planned changes',
        body: `For changes that should happen at a future date — like a promotional price that reverts after 6 months — use Subscription Schedules. A schedule defines a sequence of phases, each with its own price, quantity, and duration.\n\nFor example, CloudCanvas could offer a "6 months at $19/month, then $29/month" deal using a schedule with two phases:\n\n- Phase 1: CloudCanvas Pro at $19/month for 6 months\n- Phase 2: CloudCanvas Pro at $29/month, ongoing\n\nStripe automatically transitions between phases at the specified dates. No cron jobs, no manual intervention.\n\nIn the API: \`stripe.subscriptionSchedules.create({ customer: "cus_xxx", start_date: "now", phases: [{ items: [{ price: "price_promo" }], iterations: 6 }, { items: [{ price: "price_standard" }] }] })\``,
        dashboardLink: { label: 'Subscriptions', url: 'https://dashboard.stripe.com/subscriptions' },
        callouts: [
          {
            kind: 'tip',
            text: `Subscription schedules are ideal for enterprise deals with custom pricing periods, annual contracts that auto-renew at different rates, and promotional introductory pricing. They replace the need for background jobs that update subscriptions at specific dates.`,
          },
        ],
      },
    ],
    doneLabel: `I've performed upgrades, downgrades, and learned about pausing subscriptions`,
  },

  // ── MODULE 10 ─────────────────────────────────────────────────────────
  {
    id: 'usage-based-billing',
    number: 10,
    title: 'Usage-Based & Metered Billing',
    estMinutes: 10,
    intro: `Not all billing is a fixed monthly fee. Usage-based billing charges customers based on how much they consume — API calls, storage gigabytes, compute hours, or active users. Stripe's metered billing tracks usage throughout a billing period and calculates the invoice amount at period end.`,
    narrative: `CloudCanvas's API product needs metered billing — developers pay based on how many API calls they make. The engineering team will report usage to Stripe throughout the month, and Stripe will calculate and charge the right amount at billing time.`,
    overviewAddition: `The pay-as-you-go model for CloudCanvas's developer API.`,
    steps: [
      {
        title: 'Understand metered vs licensed billing',
        body: `Stripe Billing supports two usage types:\n\n**Licensed** (default): The customer is charged a fixed amount per unit per billing period. You set the quantity when creating the subscription. If a team has 10 seats, they pay for 10 seats every month regardless of how many they used.\n\n**Metered**: The customer is charged based on reported usage during the billing period. You report usage records throughout the period, and Stripe sums them up at invoice time. The price defines the rate (e.g., $0.01 per API call), and the total charge depends on actual consumption.\n\nMetered billing requires a price with \`recurring.usage_type\` set to \`metered\`. You created this earlier with the CloudCanvas API product's graduated pricing — now you will learn how to report usage against it.`,
        callouts: [
          {
            kind: 'explanation',
            text: `The key difference: with licensed billing, you set the quantity upfront and can change it anytime (triggering proration). With metered billing, you never set a quantity — instead, you report usage events throughout the period and Stripe calculates the total at invoice time. Metered billing always invoices in arrears (after usage occurs), while licensed billing invoices in advance (before the period starts).`,
          },
        ],
      },
      {
        title: 'Create a metered price',
        body: `Open Products in your Dashboard. Open the CloudCanvas API product (or create it if you skipped Module 2). Add a new price:\n\n- Pricing model: "Graduated pricing"\n- Usage type: "Metered"\n- Aggregation: "Sum of usage during period"\n- Interval: Monthly\n- Tiers: First 1,000 at $0.00, next 9,000 at $0.01, above 10,000 at $0.005\n\nThe "Sum" aggregation means Stripe adds up all reported usage records for the period. Other options include "Last during period" (useful for seat counts that fluctuate) and "Max during period" (useful for peak concurrent usage).`,
        dashboardLink: { label: 'Products', url: 'https://dashboard.stripe.com/products' },
        gif: {
          caption: 'Record: creating a metered price with graduated tiers and sum aggregation.',
          screen: 'Products → CloudCanvas API → Add metered price',
        },
        callouts: [
          {
            kind: 'tip',
            text: `Choose your aggregation method carefully. "Sum" is for consumable resources (API calls, messages sent, emails delivered). "Last during period" is for state-based resources (current seat count, active users). "Max during period" is for peak-based resources (maximum concurrent connections, peak bandwidth).`,
          },
        ],
      },
      {
        title: 'Report usage records',
        body: `Usage records are reported via the API. Each record has a \`quantity\`, a \`timestamp\`, and identifies the subscription item it applies to.\n\nThe API call:\n\n\`stripe.subscriptionItems.createUsageRecord("si_xxx", { quantity: 150, timestamp: Math.floor(Date.now() / 1000), action: "increment" })\`\n\nThe \`action\` parameter can be \`increment\` (add to the running total) or \`set\` (replace the current total). For API calls, use \`increment\` — each report adds to the count. For seat counts, use \`set\` — each report replaces the previous value.\n\nIn CloudCanvas's architecture, the API gateway would batch usage counts every hour and report them to Stripe. Real-time per-request reporting is possible but unnecessary for billing — hourly or daily batches are standard.`,
        callouts: [
          {
            kind: 'warning',
            text: `Usage records cannot be reported for past billing periods after the invoice has been finalised. If your usage reporting pipeline has delays, make sure records are submitted before the billing period closes. Stripe allows a configurable grace period (usage_record_deadline) of up to 24 hours after period end for late records.`,
          },
        ],
      },
      {
        title: 'View usage in the Dashboard',
        body: `Open Subscriptions in your Dashboard. Find a subscription with a metered price and click on it. In the subscription detail, you will see a "Usage" section showing reported usage for the current period.\n\nThe usage chart shows the cumulative total over time. At the end of the period, Stripe takes this total and applies it to the pricing tiers to calculate the invoice amount.\n\nFor example, if CloudCanvas API reported 5,500 API calls this month, the invoice would be: 1,000 × $0.00 + 4,500 × $0.01 = $45.00.`,
        dashboardLink: { label: 'Subscriptions', url: 'https://dashboard.stripe.com/subscriptions' },
        gif: {
          caption: 'Record: viewing the usage section on a metered subscription detail page, showing the cumulative usage chart.',
          screen: 'Subscriptions → Subscription detail → Usage section',
        },
      },
      {
        title: 'Combine metered and licensed items',
        body: `A single subscription can include both licensed and metered items. This is common in SaaS — a customer pays a fixed platform fee plus variable usage.\n\nFor CloudCanvas, you could create a subscription with:\n\n- CloudCanvas Pro at $29/month (licensed, fixed)\n- CloudCanvas API at metered pricing (variable, based on usage)\n\nThe monthly invoice would show two line items: the $29 platform fee and the calculated API usage charge. Both are managed under one subscription, one billing cycle, and one payment.\n\nIn the API: \`stripe.subscriptions.create({ customer: "cus_xxx", items: [{ price: "price_pro" }, { price: "price_api_metered" }] })\``,
        callouts: [
          {
            kind: 'billing-fact',
            text: `Hybrid pricing (fixed base + usage) is the fastest-growing SaaS pricing model. It provides revenue predictability from the fixed component while capturing upside from high-usage customers. Companies using hybrid pricing report 15-25% higher average revenue per customer compared to flat-rate-only pricing.`,
          },
        ],
      },
    ],
    doneLabel: `I've set up metered billing and learned how to report usage`,
  },

  // ── MODULE 11 ─────────────────────────────────────────────────────────
  {
    id: 'revenue-recovery-smart-features',
    number: 11,
    title: 'Revenue Recovery & Smart Features',
    estMinutes: 8,
    intro: `Stripe Billing includes several intelligent features designed to maximise revenue collection — automatic card updates, smart retries, and revenue recovery tools. These features work behind the scenes to reduce involuntary churn and recover failed payments without customer action.`,
    narrative: `CloudCanvas is now losing about 6% of monthly revenue to failed payments. The founders want that number below 3%. Time to deploy Stripe's revenue recovery arsenal and understand the features that work silently in the background to save subscriptions.`,
    overviewAddition: `The automated systems that recover revenue while you sleep.`,
    steps: [
      {
        title: 'Automatic card updates',
        body: `When a card expires or is replaced, Stripe can automatically update the card details through partnerships with card networks (Visa Account Updater, Mastercard ABU). This is called Automatic Card Updating and it is enabled by default on Stripe accounts.\n\nWhen a customer's bank issues a new card (expiry renewal, replacement for a lost card, or card upgrade), the card network notifies Stripe of the new card number and expiry. Stripe updates the \`PaymentMethod\` object automatically. The customer does not need to re-enter their card details, and their subscription continues uninterrupted.\n\nYou can verify this is enabled in Settings → Billing. Look for "Automatically update expired cards".`,
        dashboardLink: { label: 'Billing Settings', url: 'https://dashboard.stripe.com/settings/billing/automatic' },
        callouts: [
          {
            kind: 'billing-fact',
            text: `Automatic card updates prevent approximately 2-3% of subscriptions from failing each month due to card expiry alone. For CloudCanvas with 200 subscribers, that is 4-6 subscriptions per month that would have failed silently without this feature.`,
          },
          {
            kind: 'info',
            text: `Not all card replacements are covered by automatic updates. Cards cancelled due to fraud, cards switched to a different bank, and some prepaid cards are not eligible. For these cases, the payment will fail and your dunning flow handles the recovery.`,
          },
        ],
      },
      {
        title: 'Smart Retries in depth',
        body: `Smart Retries uses machine learning to choose the optimal time to retry failed payments. Instead of retrying on a fixed schedule (e.g., days 3, 5, 7), Stripe analyses the failure reason, the customer's payment patterns, and network-wide signals to pick the moment most likely to succeed.\n\nFor example, a payment that failed due to "insufficient funds" on the 28th might be retried on the 1st — when many customers receive their salary. A payment that failed due to a temporary issuer outage might be retried within hours.\n\nSmart Retries also considers time of day. Payments retried during banking hours in the customer's timezone have higher success rates than those retried at 3am.\n\nTo verify Smart Retries is enabled, go to Settings → Billing → Subscriptions and emails.`,
        gif: {
          caption: 'Record: the Smart Retries setting in the subscription billing configuration.',
          screen: 'Settings → Billing → Smart Retries toggle',
        },
        callouts: [
          {
            kind: 'explanation',
            text: `Smart Retries is not the same as the fixed retry schedule. When Smart Retries is enabled, it replaces the fixed schedule entirely. Stripe may retry more or fewer times than your configured maximum, and at different intervals, because the ML model has determined a different strategy is more likely to succeed for each individual payment.`,
          },
        ],
      },
      {
        title: 'Revenue recovery emails',
        body: `Beyond the customer-facing emails you configured in the dunning module, Stripe provides a hosted payment page where customers can update their card and immediately retry the failed payment.\n\nThis page is linked in every failed payment email Stripe sends. It is branded with your company name and logo (configured in Settings → Branding). The customer does not need to log in to your application — they click the link, enter a new card, and the failed invoice is retried automatically.\n\nMake sure your branding is configured so these emails look professional and trustworthy. Customers are more likely to enter card details on a page that clearly identifies CloudCanvas.`,
        dashboardLink: { label: 'Branding', url: 'https://dashboard.stripe.com/settings/branding' },
        callouts: [
          {
            kind: 'tip',
            text: `Customise the recovery email content in Settings → Billing → Emails. The default email is functional but generic. Adding your product name, support contact, and a brief message ("We noticed your CloudCanvas Pro payment didn't go through — click below to update your card and keep your projects safe") significantly improves recovery rates.`,
          },
        ],
      },
      {
        title: 'Monitor recovery performance',
        body: `Open the Billing section in your Dashboard and look for the Revenue Recovery metrics. This shows:\n\n- **Total failed**: The dollar amount of payments that failed this period\n- **Recovered**: The amount recovered through retries and customer action\n- **Recovery rate**: Recovered / Total failed as a percentage\n- **Still outstanding**: Failed payments that have not yet been recovered\n\nA healthy recovery rate for a SaaS product is 50-70%. Below 50% suggests your retry and notification strategy needs improvement. Above 70% means your automated systems are performing well.\n\nTrack this monthly and correlate it with changes you make to retry schedules, email content, and customer communication timing.`,
        dashboardLink: { label: 'Billing', url: 'https://dashboard.stripe.com/billing' },
        gif: {
          caption: 'Record: the Billing overview showing revenue recovery metrics — failed, recovered, and outstanding amounts.',
          screen: 'Billing → Overview → Revenue recovery metrics',
        },
      },
    ],
    doneLabel: `I've reviewed Stripe's automatic revenue recovery features`,
  },

  // ── MODULE 12 ─────────────────────────────────────────────────────────
  {
    id: 'billing-analytics-reporting',
    number: 12,
    title: 'Billing Analytics & Reporting',
    estMinutes: 8,
    intro: `Running a subscription business requires tracking key metrics: monthly recurring revenue (MRR), churn rate, customer lifetime value, and revenue composition. Stripe provides built-in analytics that compute these metrics automatically from your billing data. This module covers how to read and use them.`,
    narrative: `CloudCanvas's board meeting is next week. The founders need a subscription health report: MRR, churn rate, new vs expansion revenue, and a forecast. Everything they need is already in the Stripe Dashboard — you just need to know where to look and what the numbers mean.`,
    overviewAddition: `The metrics that tell you whether CloudCanvas's subscription business is healthy.`,
    steps: [
      {
        title: 'Open the Billing analytics',
        body: `Navigate to Billing → Overview in your Dashboard. This page is the command centre for your subscription business. At the top, you will see headline metrics: MRR (Monthly Recurring Revenue), active subscribers, and revenue growth.\n\nMRR is calculated as the sum of all active subscription amounts normalised to a monthly figure. An annual subscription at $290/year contributes $24.17/month to MRR. A monthly subscription at $29/month contributes $29.00.\n\nBelow the headline metrics, you will see charts showing MRR over time, new subscribers, and churn.`,
        dashboardLink: { label: 'Billing', url: 'https://dashboard.stripe.com/billing' },
        gif: {
          caption: 'Record: the Billing overview page showing MRR, active subscribers, and revenue growth charts.',
          screen: 'Billing → Overview → Headline metrics',
        },
        callouts: [
          {
            kind: 'info',
            text: `MRR is the single most important metric for a subscription business. It represents your predictable monthly revenue baseline. Growth in MRR means the business is acquiring customers faster than it is losing them. Declining MRR means churn is outpacing acquisition — an early warning that requires immediate attention.`,
          },
        ],
      },
      {
        title: 'Understand the MRR waterfall',
        body: `On the Billing overview, find the MRR movement chart. This breaks down MRR changes into categories:\n\n**New MRR**: Revenue from customers who subscribed for the first time this period.\n\n**Expansion MRR**: Revenue increase from existing customers who upgraded their plan or added seats.\n\n**Contraction MRR**: Revenue decrease from existing customers who downgraded.\n\n**Churned MRR**: Revenue lost from customers who cancelled entirely.\n\n**Reactivation MRR**: Revenue from previously cancelled customers who re-subscribed.\n\nNet MRR change = New + Expansion + Reactivation - Contraction - Churn. A healthy SaaS business has net positive MRR movement every month.`,
        callouts: [
          {
            kind: 'explanation',
            text: `The most efficient path to MRR growth is often expansion revenue, not new customer acquisition. It costs 5-7x less to expand an existing customer (upsell seats, upgrade tiers) than to acquire a new one. If CloudCanvas's expansion MRR consistently exceeds churned MRR, the business can grow even with modest new customer acquisition.`,
          },
          {
            kind: 'billing-fact',
            text: `Top-performing SaaS companies achieve a "net revenue retention" above 120% — meaning that expansion revenue from existing customers more than offsets all churn and contraction. This means the business grows even if it stopped acquiring new customers entirely.`,
          },
        ],
      },
      {
        title: 'Analyse churn',
        body: `Find the churn metrics on the Billing overview. Stripe tracks two types of churn:\n\n**Customer churn rate**: The percentage of subscribers who cancelled this period. Calculated as (cancelled subscribers / total subscribers at period start).\n\n**Revenue churn rate**: The percentage of MRR lost to cancellations and downgrades. This is often more meaningful than customer churn because losing a $99/month customer hurts more than losing a $29/month customer.\n\nFor SaaS businesses, a monthly customer churn rate below 5% is considered healthy. Below 3% is excellent. Above 7% indicates a retention problem that needs investigation.\n\nDrill into churned subscriptions by clicking the churn metric. Look for patterns: are cancellations concentrated in a specific plan, a specific cohort (e.g., customers who joined during a promotion), or a specific time after signup?`,
        dashboardLink: { label: 'Billing', url: 'https://dashboard.stripe.com/billing' },
        gif: {
          caption: 'Record: viewing churn metrics and drilling into churned subscriptions by plan and cohort.',
          screen: 'Billing → Overview → Churn analysis',
        },
      },
      {
        title: 'Export billing data',
        body: `For board reports or custom analysis, you can export billing data from the Dashboard. Navigate to Billing → Overview and click "Export" (or use the Reports section).\n\nStripe can export:\n\n- Subscription list with status, plan, MRR, and dates\n- Invoice list with amounts, statuses, and payment details\n- Customer list with subscription count and total spend\n- Revenue reports with MRR breakdown\n\nExports are available as CSV files. For automated reporting, use the Stripe API to pull this data programmatically — the \`/v1/subscriptions\`, \`/v1/invoices\`, and \`/v1/balance_transactions\` endpoints support filtering, pagination, and date ranges.\n\nFor CloudCanvas's board meeting, export the subscription list and the revenue report. These two exports contain everything needed for a subscription health summary.`,
        callouts: [
          {
            kind: 'tip',
            text: `For recurring board reporting, consider using the Stripe Sigma add-on. Sigma lets you write SQL queries directly against your Stripe data — no exports, no CSV wrangling. Queries like "MRR by plan tier for the last 12 months" or "average revenue per customer by acquisition channel" are straightforward in SQL and always reflect live data.`,
          },
        ],
      },
      {
        title: 'Build your subscription dashboard',
        body: `Step back and identify the five metrics CloudCanvas should track weekly:\n\n1. **MRR**: Total monthly recurring revenue\n2. **Net MRR growth**: New + Expansion - Contraction - Churn\n3. **Customer churn rate**: Percentage of subscribers cancelling per month\n4. **Revenue recovery rate**: Percentage of failed payments recovered\n5. **Trial conversion rate**: Percentage of trial subscribers who become paying customers\n\nAll five are available in the Stripe Dashboard without any additional tooling. For CloudCanvas at its current stage (200 subscribers), the Dashboard is sufficient. As the subscriber count grows into the thousands, consider tools like Stripe Sigma, ChartMogul, or Baremetrics for more advanced cohort analysis and forecasting.\n\nThe goal is to review these metrics weekly and act on trends before they become problems. A dip in trial conversion might indicate a product issue. A spike in churn might indicate a pricing problem. A declining recovery rate might indicate a dunning configuration issue.`,
        dashboardLink: { label: 'Billing', url: 'https://dashboard.stripe.com/billing' },
        callouts: [
          {
            kind: 'billing-fact',
            text: `Companies that review subscription metrics weekly respond to churn spikes an average of 18 days faster than companies that review monthly. That 18-day difference translates to catching and fixing retention problems before they compound — because churn is exponential, not linear.`,
          },
        ],
      },
    ],
    doneLabel: `I've explored billing analytics and identified key subscription metrics`,
  },
]

export const BILLING_SCORED_MODULES = BILLING_WORKSHOP_MODULES.filter(
  (m) => !m.isPrerequisite
)
