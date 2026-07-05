import type {
  WorkshopModule,
  CalloutKind,
  Callout,
  WorkshopGif,
  DashboardUrl,
  WorkshopStep,
} from '@/lib/workshop-modules'

export const GETTING_STARTED_MODULE: WorkshopModule = {
  id: 'getting-started',
  number: 0,
  title: 'Getting Started',
  estMinutes: 5,
  isPrerequisite: true,
  intro: `Welcome to Online Payments 101. Before diving into Stripe's payment APIs, take five minutes to open your Stripe Dashboard and locate your API keys. Everything in this workshop runs through your test-mode account — no real money moves.`,
  narrative: `You just joined NovaMart, a growing e-commerce company selling artisanal home goods online. The founders have been accepting payments through a basic hosted form, but they need a proper Stripe integration. You are the developer they hired to build it. Step one: get into the Dashboard.`,
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
      title: 'Find your API keys',
      body: `Navigate to the Developers section in the left sidebar and click API keys. You will see two keys: a publishable key (starts with pk_test_) and a secret key (starts with sk_test_). The publishable key is used in your frontend code. The secret key is used on your server and must never be exposed to the browser.\n\nNote the "Test mode" toggle in the top-right corner of the Dashboard. It should be switched on — everything in this workshop happens in test mode.`,
      dashboardLink: { label: 'API Keys', url: 'https://dashboard.stripe.com/apikeys' },
      gif: {
        caption: 'Record: navigating to Developers → API keys and locating the publishable and secret keys.',
        screen: 'Dashboard → Developers → API Keys',
      },
      callouts: [
        {
          kind: 'warning' as CalloutKind,
          text: `Never commit your secret key to version control or expose it in client-side code. Treat sk_test_ and sk_live_ keys like passwords. If a key is ever leaked, roll it immediately from the API keys page.`,
        },
      ],
    },
    {
      title: 'Confirm test mode is active',
      body: `Look at the top-right of your Dashboard. You should see a "Test mode" badge or toggle. When test mode is active, all API calls use test keys and no real charges are created. You can freely experiment without worrying about billing real customers.\n\nKeep this tab open for the rest of the workshop. Each module will link directly to the relevant Dashboard section.`,
      callouts: [
        {
          kind: 'tip' as CalloutKind,
          text: `Test mode data is completely separate from live mode data. You can create test customers, payments, and refunds without any risk. When you are ready to go live, you switch to live-mode keys — the API calls are identical.`,
        },
      ],
    },
  ],
  doneLabel: `I've opened my Dashboard, found my API keys, and confirmed test mode`,
}

export const ONLINE_PAYMENTS_WORKSHOP_MODULES: WorkshopModule[] = [
  GETTING_STARTED_MODULE,

  // ── MODULE 1 ──────────────────────────────────────────────────────────
  {
    id: 'payments-landscape',
    number: 1,
    title: 'The Payments Landscape',
    estMinutes: 5,
    intro: `Before writing any code, understand the ecosystem you are building on. Online payments involve multiple parties — card networks, issuing banks, acquiring banks, and payment processors — all coordinating in real time to move money from a buyer to a seller. Stripe sits in the middle and handles the complexity so you don't have to.`,
    narrative: `NovaMart's founders keep asking why they can't just accept credit card numbers directly. Before you start building, you need to explain to them why a payment processor exists and what happens behind the scenes every time a customer clicks "Pay". This module is your cheat sheet.`,
    overviewAddition: `Understand the moving parts before you touch any code.`,
    steps: [
      {
        title: 'How an online payment works',
        body: `When a customer enters their card details on NovaMart's checkout page and clicks "Pay", a chain of events fires in under two seconds. The card number travels from the browser to Stripe's servers (never touching NovaMart's backend). Stripe forwards the charge request to the card network (Visa, Mastercard, etc.), which routes it to the issuing bank — the bank that gave the customer their card.\n\nThe issuing bank checks the customer's available balance, runs its own fraud checks, and sends back an approval or decline. That response travels back through the network to Stripe, which tells NovaMart's server whether the payment succeeded. The entire round trip happens in 1-3 seconds.\n\nThe actual money settlement — when funds arrive in NovaMart's bank account — happens separately, typically 2 business days later. The authorization and the settlement are different steps, which is why you can refund a payment before the money has even landed.`,
        callouts: [
          {
            kind: 'stripe-fact' as CalloutKind,
            text: `Stripe processes hundreds of billions of dollars in payments annually across millions of businesses in over 195 countries. Every payment you create through the API benefits from Stripe's direct relationships with card networks and banks worldwide.`,
          },
        ],
        gif: {
          caption: 'Record: a diagram showing the flow from customer → Stripe → card network → issuing bank → approval → Stripe → merchant.',
          screen: 'Payment flow diagram',
        },
      },
      {
        title: 'Card networks and issuing banks',
        body: `There are four major card networks: Visa, Mastercard, American Express, and Discover. Each network sets its own rules for interchange fees, dispute processes, and authentication requirements. Stripe abstracts these differences so NovaMart's integration code is the same regardless of which card brand the customer uses.\n\nThe issuing bank is the customer's bank — the one that issued their card. When a payment is declined, it is almost always the issuing bank that made that decision, not Stripe. Common decline reasons include insufficient funds, suspected fraud, or the card being expired. Stripe surfaces these decline codes through the API so you can show helpful error messages to customers.`,
        callouts: [
          {
            kind: 'explanation' as CalloutKind,
            text: `Interchange fees are the cost of processing a payment — typically 1.5-3% of the transaction amount. Stripe's pricing includes interchange plus Stripe's own fee. You never need to negotiate directly with card networks or banks.`,
          },
        ],
      },
      {
        title: 'Why PCI compliance matters',
        body: `The Payment Card Industry Data Security Standard (PCI DSS) governs how card data must be handled. If NovaMart were to collect card numbers directly on their server, they would need to comply with the full PCI DSS standard — hundreds of security requirements, regular audits, and significant infrastructure investment.\n\nStripe eliminates most of this burden. When you use Stripe.js and Elements (which you will in Module 3), card details go directly from the customer's browser to Stripe's PCI-compliant servers. NovaMart's server never sees or stores the raw card number. This reduces your PCI scope to the simplest level: SAQ A, which is a short self-assessment questionnaire.`,
        callouts: [
          {
            kind: 'warning' as CalloutKind,
            text: `Never collect raw card numbers on your server. Always use Stripe.js, Stripe Elements, or Stripe Checkout to tokenize card data on the client side. This is not just a best practice — it is a PCI requirement for most merchants.`,
          },
        ],
      },
      {
        title: `Stripe's role in the stack`,
        body: `Stripe is a payment processor and a developer platform. At its core, Stripe does three things for NovaMart: it securely collects payment details from customers, it communicates with card networks and banks to authorize and capture charges, and it settles funds into NovaMart's bank account.\n\nBeyond that, Stripe provides APIs for subscriptions, invoicing, fraud detection (Radar), multi-party payments (Connect), and dozens of other financial services. For this workshop, you will focus on the core payment flow: collecting a card, creating a PaymentIntent, and confirming the charge.`,
        gif: {
          caption: 'Record: the Stripe Dashboard home screen showing the product overview tiles.',
          screen: 'Dashboard → Home',
        },
      },
    ],
    doneLabel: `I've understood the payment ecosystem and Stripe's role in it`,
  },

  // ── MODULE 2 ──────────────────────────────────────────────────────────
  {
    id: 'stripe-account-dashboard',
    number: 2,
    title: 'Your Stripe Account & Dashboard',
    estMinutes: 8,
    intro: `The Stripe Dashboard is your control center. It is where you monitor payments, review logs, manage API keys, and configure account settings. Before writing any integration code, you need to know your way around it. This module tours the sections you will use most and introduces the tools that will save you time during development.`,
    narrative: `NovaMart's CTO wants a walkthrough of what Stripe provides out of the box before any custom development begins. You are going to show her the Dashboard, the Logs viewer, and the event system that powers real-time notifications.`,
    overviewAddition: `Know the Dashboard inside out before you write a single line of integration code.`,
    steps: [
      {
        title: 'Navigate the Dashboard sections',
        body: `Open your Dashboard home page. The left sidebar organises everything into sections. The ones you will use most during this workshop are:\n\n• Payments — every charge, refund, and dispute\n• Customers — saved customer records and their payment methods\n• Developers — API keys, logs, webhooks, and events\n• Settings — account configuration, branding, and team management\n\nClick through each section to see what is there. You do not need to configure anything yet — just build a mental map.`,
        dashboardLink: { label: 'Dashboard Home', url: 'https://dashboard.stripe.com/' },
        gif: {
          caption: 'Record: clicking through Payments, Customers, Developers, and Settings in the Dashboard sidebar.',
          screen: 'Dashboard → Sidebar navigation',
        },
      },
      {
        title: 'Explore the Payments section',
        body: `Open Payments in your Dashboard. This is the central view for all payment activity. You can filter by status (succeeded, failed, refunded), date range, amount, and payment method. Click on any payment to see its full detail page — the amount, currency, payment method, metadata, and a timeline of every event that occurred.\n\nThe search bar at the top accepts payment IDs (pi_...), customer IDs (cus_...), and email addresses. This is the fastest way to find a specific transaction when debugging.`,
        dashboardLink: { label: 'Payments', url: 'https://dashboard.stripe.com/payments' },
        callouts: [
          {
            kind: 'tip' as CalloutKind,
            text: `Bookmark the Payments page. During development, you will check it constantly to verify your API calls are working correctly. Every PaymentIntent you create from your code will appear here within seconds.`,
          },
        ],
      },
      {
        title: 'Use the Developers logs',
        body: `Open the Logs section under Developers. Every API request your integration makes — and Stripe's response — is recorded here. You can filter by endpoint, status code, and time range.\n\nClick on any log entry to see the full request body and response body. This is invaluable for debugging. When a payment fails, the log entry shows exactly what your code sent and what Stripe returned, including the error code and message.`,
        dashboardLink: { label: 'Logs', url: 'https://dashboard.stripe.com/logs' },
        gif: {
          caption: 'Record: opening the Developers → Logs page and clicking on a log entry to see request and response details.',
          screen: 'Dashboard → Developers → Logs',
        },
        callouts: [
          {
            kind: 'info' as CalloutKind,
            text: `Logs are retained for 30 days in test mode and 90 days in live mode. For long-term record keeping, use webhooks to store event data in your own database.`,
          },
        ],
      },
      {
        title: 'Understand events and the event log',
        body: `Open the Events section under Developers. Stripe generates events for everything that happens in your account — payment succeeded, payment failed, customer created, refund issued, and hundreds more. Each event has a type (like payment_intent.succeeded), a timestamp, and a data payload containing the full object.\n\nEvents are the foundation of webhooks, which you will configure in Module 5. For now, browse the event types and notice how granular they are.`,
        dashboardLink: { label: 'Events', url: 'https://dashboard.stripe.com/events' },
        callouts: [
          {
            kind: 'explanation' as CalloutKind,
            text: `Stripe events follow a consistent naming pattern: object_type.action. For example, payment_intent.succeeded, customer.created, charge.refunded. Learning this pattern makes it easy to predict event names without looking them up.`,
          },
        ],
      },
      {
        title: 'Configure account settings',
        body: `Open Settings in your Dashboard. Take note of two areas: Business settings (where you configure your public business name, support email, and statement descriptor) and Branding (where you upload your logo and set brand colors for Stripe-hosted pages like Checkout).\n\nThe statement descriptor is especially important — it is the text that appears on your customer's credit card statement. Set it to something recognizable like "NOVAMART" so customers do not file disputes because they do not recognize the charge.`,
        dashboardLink: { label: 'Settings', url: 'https://dashboard.stripe.com/settings' },
        callouts: [
          {
            kind: 'warning' as CalloutKind,
            text: `An unclear statement descriptor is one of the top causes of "friendly fraud" — disputes filed by customers who genuinely do not recognize a charge on their statement. Always set a clear, recognizable descriptor.`,
          },
        ],
      },
    ],
    doneLabel: `I've toured the Dashboard, found the Logs viewer, and reviewed account settings`,
  },

  // ── MODULE 3 ──────────────────────────────────────────────────────────
  {
    id: 'stripe-js-elements',
    number: 3,
    title: 'Stripe.js & Elements',
    estMinutes: 12,
    intro: `Stripe Elements is a set of prebuilt UI components that securely collect payment details in your frontend. Elements handles card number formatting, real-time validation, and PCI-compliant tokenization — the card data goes directly from the customer's browser to Stripe, never touching your server. This module covers how to load Stripe.js, mount Elements, and create a PaymentMethod from collected card details.`,
    narrative: `NovaMart's checkout page currently has a plain HTML form. The founders want it to look professional and handle card input properly. You are going to replace that form with Stripe Elements — a drop-in component that handles all the hard parts of collecting payment information securely.`,
    overviewAddition: `The frontend is where the customer experience begins. Get this right and everything downstream is easier.`,
    steps: [
      {
        title: 'Load Stripe.js',
        body: `Stripe.js is the client-side JavaScript library that powers Elements and handles PCI-compliant tokenization. You load it in one of two ways: via a script tag pointing to https://js.stripe.com/v3/, or via the @stripe/stripe-js npm package.\n\nThe npm package is a thin wrapper that loads the same script asynchronously and provides TypeScript types. For NovaMart's React frontend, install it with:\n\nnpm install @stripe/stripe-js @stripe/react-stripe-js\n\nThen initialize Stripe with your publishable key:\n\nconst stripePromise = loadStripe('pk_test_...')\n\nThis returns a Promise that resolves to a Stripe instance. You pass this to the Elements provider so all child components can access it.`,
        callouts: [
          {
            kind: 'warning' as CalloutKind,
            text: `Always load Stripe.js from js.stripe.com — never bundle or self-host it. Stripe requires this for PCI compliance and to ensure you always get the latest security patches. The npm package handles this automatically.`,
          },
        ],
        gif: {
          caption: 'Record: installing @stripe/stripe-js and @stripe/react-stripe-js with npm.',
          screen: 'Terminal → npm install',
        },
      },
      {
        title: 'Mount the Payment Element',
        body: `The Payment Element is Stripe's recommended all-in-one UI component. It dynamically renders input fields for cards, bank debits, wallets, and other payment methods based on your account configuration and the customer's location.\n\nWrap your checkout page in an Elements provider, passing the stripePromise and a clientSecret (from a PaymentIntent you created on your server). Then render the PaymentElement component:\n\n<Elements stripe={stripePromise} options={{ clientSecret }}>\n  <PaymentElement />\n</Elements>\n\nThe Payment Element automatically handles card number formatting, expiry validation, CVC input, and postal code collection. It adapts its layout to the customer's locale and device.`,
        callouts: [
          {
            kind: 'tip' as CalloutKind,
            text: `The Payment Element replaces the older CardElement. It supports 40+ payment methods out of the box — cards, bank redirects, wallets, and buy-now-pay-later — all from a single component. New payment methods are added automatically as you enable them in your Dashboard.`,
          },
          {
            kind: 'explanation' as CalloutKind,
            text: `The clientSecret ties the frontend Element to a specific PaymentIntent on the server. This ensures the amount, currency, and payment configuration are locked server-side and cannot be tampered with from the browser.`,
          },
        ],
      },
      {
        title: 'Customize the Element appearance',
        body: `Elements supports extensive theming through the appearance API. You pass an appearance object to the Elements provider to match NovaMart's brand colors and typography:\n\nconst appearance = {\n  theme: 'stripe',\n  variables: {\n    colorPrimary: '#0570de',\n    colorBackground: '#ffffff',\n    colorText: '#30313d',\n    colorDanger: '#df1b41',\n    fontFamily: 'Ideal Sans, system-ui, sans-serif',\n    borderRadius: '4px',\n  },\n}\n\nThe theme can be 'stripe' (default), 'night' (dark mode), or 'flat' (minimal). Variables control specific design tokens. You can also pass rules for granular per-element styling.`,
        gif: {
          caption: 'Record: applying a custom appearance theme to the Payment Element and seeing the visual change.',
          screen: 'Checkout page → Element with custom theme',
        },
      },
      {
        title: 'Handle Element events',
        body: `The Payment Element emits events as the customer interacts with it. The two most important are onChange and onReady.\n\nonChange fires every time the customer modifies the form. The event object includes a complete boolean indicating whether all required fields are filled and valid, and an empty boolean indicating whether the form has been touched at all. Use complete to enable or disable your submit button.\n\nonReady fires when the Element has fully loaded and rendered. Use this to hide a loading spinner and show the payment form.\n\nYou can also listen for onFocus, onBlur, and onEscape for more granular control over the checkout UX.`,
        callouts: [
          {
            kind: 'info' as CalloutKind,
            text: `The onChange event does not expose the raw card number — only validation state. This is by design. Your frontend code never has access to sensitive card data, which keeps you out of PCI scope.`,
          },
        ],
      },
      {
        title: 'Confirm the payment from the frontend',
        body: `When the customer clicks "Pay", call stripe.confirmPayment() with the Elements instance and a return_url where the customer is redirected after authentication (e.g. 3D Secure). Stripe handles the rest:\n\nconst { error } = await stripe.confirmPayment({\n  elements,\n  confirmParams: {\n    return_url: 'https://novamart.com/order/complete',\n  },\n})\n\nIf there is a validation error (incomplete fields, invalid card), confirmPayment returns immediately with an error object you can display to the customer. If the payment requires authentication, Stripe redirects the customer automatically. If the payment succeeds without authentication, the customer is redirected to your return_url with a payment_intent query parameter.\n\nOn your return page, retrieve the PaymentIntent using the ID from the URL to show the order confirmation.`,
        dashboardLink: { label: 'Payments', url: 'https://dashboard.stripe.com/payments' },
        callouts: [
          {
            kind: 'tip' as CalloutKind,
            text: `Always set a return_url. Even if your current payment methods do not require redirects, future methods you enable (like bank redirects or wallets) might. Setting it now future-proofs your integration.`,
          },
        ],
        gif: {
          caption: 'Record: clicking "Pay" on the checkout page and seeing the payment succeed in the Dashboard.',
          screen: 'Checkout → Pay → Dashboard confirmation',
        },
      },
    ],
    doneLabel: `I've loaded Stripe.js, mounted the Payment Element, and confirmed a test payment`,
  },

  // ── MODULE 4 ──────────────────────────────────────────────────────────
  {
    id: 'payment-intents-api',
    number: 4,
    title: 'The Payment Intents API',
    estMinutes: 15,
    intro: `The PaymentIntent is the core object in Stripe's payment flow. It represents a single attempt to collect a payment from a customer. You create a PaymentIntent on your server with an amount and currency, send its client_secret to your frontend, and use that secret with Elements to confirm the payment. This module walks through the full server-side lifecycle of a PaymentIntent.`,
    narrative: `NovaMart's backend is a Node.js Express server. You need to build the API endpoint that creates PaymentIntents when customers reach checkout. The frontend team is waiting for the client_secret — once you give them that, they can wire up the Payment Element you set up in Module 3.`,
    overviewAddition: `This is the server-side half of the payment flow. Frontend and backend work together through the PaymentIntent.`,
    steps: [
      {
        title: 'Install the Stripe server SDK',
        body: `On your server, install the Stripe Node.js library:\n\nnpm install stripe\n\nInitialize it with your secret key:\n\nconst stripe = require('stripe')('sk_test_...')\n\nThe Stripe SDK is a thin HTTP client that wraps the Stripe REST API. Every method call translates to an HTTPS request to api.stripe.com. The SDK handles authentication, request serialization, response parsing, automatic retries on network errors, and idempotency key management.`,
        callouts: [
          {
            kind: 'info' as CalloutKind,
            text: `Stripe publishes official server SDKs for Node.js, Python, Ruby, PHP, Java, Go, and .NET. The API is the same across all languages — only the syntax differs. This workshop uses Node.js, but every concept translates directly.`,
          },
        ],
      },
      {
        title: 'Create a PaymentIntent',
        body: `When a customer reaches checkout, your server creates a PaymentIntent:\n\nconst paymentIntent = await stripe.paymentIntents.create({\n  amount: 2999,\n  currency: 'usd',\n  automatic_payment_methods: { enabled: true },\n  metadata: { order_id: '6735' },\n})\n\nThe amount is in the smallest currency unit — 2999 means $29.99 USD. The currency is a three-letter ISO code. automatic_payment_methods tells Stripe to enable all payment methods you have configured in your Dashboard.\n\nThe response includes a client_secret (like pi_3abc...secret_xyz). Send this to your frontend. The client_secret authorizes the browser to confirm the payment but not to modify or capture it — a deliberate security boundary.`,
        callouts: [
          {
            kind: 'warning' as CalloutKind,
            text: `Always create PaymentIntents on your server, never from the browser. The amount and currency must be set server-side to prevent customers from modifying the price. The client_secret is the only value that should reach the frontend.`,
          },
          {
            kind: 'explanation' as CalloutKind,
            text: `The metadata field accepts up to 50 key-value pairs of arbitrary data. Use it to attach your internal order ID, customer reference, or any business data you want to see in the Dashboard and webhook payloads. Metadata is not visible to the customer.`,
          },
        ],
        gif: {
          caption: 'Record: creating a PaymentIntent via the API and seeing it appear in the Dashboard with "Incomplete" status.',
          screen: 'Dashboard → Payments → New PaymentIntent',
        },
      },
      {
        title: 'Understand PaymentIntent statuses',
        body: `A PaymentIntent moves through a series of statuses during its lifecycle:\n\n• requires_payment_method — just created, waiting for the customer to enter their card\n• requires_confirmation — payment method attached, ready to confirm\n• requires_action — the payment needs additional authentication (like 3D Secure)\n• processing — the charge is being processed by the card network\n• succeeded — the payment completed successfully\n• canceled — you explicitly canceled the PaymentIntent\n• requires_capture — the payment was authorized but not yet captured (for manual capture flows)\n\nEach status transition generates a Stripe event (payment_intent.created, payment_intent.succeeded, etc.) that you can listen for via webhooks.`,
        callouts: [
          {
            kind: 'tip' as CalloutKind,
            text: `Check paymentIntent.status on your server before fulfilling an order. Never rely on the frontend redirect alone — a network interruption could prevent the redirect while the payment still succeeds. Webhooks are the reliable way to confirm payment (covered in Module 5).`,
          },
        ],
      },
      {
        title: 'Add an idempotency key',
        body: `Network errors happen. If your server sends a PaymentIntent creation request and the connection drops before receiving a response, you do not know if the PaymentIntent was created. Without protection, retrying would create a duplicate charge.\n\nIdempotency keys solve this. Pass a unique key with every write operation:\n\nconst paymentIntent = await stripe.paymentIntents.create(\n  { amount: 2999, currency: 'usd' },\n  { idempotencyKey: 'order_6735_checkout_attempt_1' }\n)\n\nIf you retry with the same key within 24 hours, Stripe returns the original response instead of creating a new PaymentIntent. Use your order ID or a UUID as the key.`,
        callouts: [
          {
            kind: 'stripe-fact' as CalloutKind,
            text: `Stripe automatically retries failed requests with idempotency keys under the hood. The Node.js SDK retries up to 2 times on network errors by default. You can configure this with the maxNetworkRetries option when initializing the client.`,
          },
        ],
        gif: {
          caption: 'Record: creating a PaymentIntent with an idempotency key and retrying the same request to show it returns the same object.',
          screen: 'Terminal → API request with idempotency key',
        },
      },
      {
        title: 'Retrieve and update a PaymentIntent',
        body: `You can retrieve a PaymentIntent at any time to check its current status:\n\nconst paymentIntent = await stripe.paymentIntents.retrieve('pi_3abc...')\n\nYou can also update a PaymentIntent before it is confirmed — for example, to adjust the amount if the customer modifies their cart:\n\nconst updated = await stripe.paymentIntents.update('pi_3abc...', {\n  amount: 3499,\n  metadata: { coupon_applied: 'SUMMER10' },\n})\n\nOnce a PaymentIntent has succeeded, you cannot modify it — you can only refund it. If the customer changes their mind before paying, cancel the PaymentIntent explicitly with stripe.paymentIntents.cancel().`,
        dashboardLink: { label: 'Payments', url: 'https://dashboard.stripe.com/payments' },
        callouts: [
          {
            kind: 'info' as CalloutKind,
            text: `Each PaymentIntent has a unique ID starting with pi_. This ID is stable and can be used to track a payment across your server, the Dashboard, webhooks, and support conversations. Store it alongside your order record.`,
          },
        ],
      },
      {
        title: 'Handle errors gracefully',
        body: `Stripe API calls can fail for many reasons: invalid parameters, card declines, rate limits, or network issues. The SDK throws typed errors you can catch:\n\ntry {\n  const pi = await stripe.paymentIntents.create({ ... })\n} catch (err) {\n  switch (err.type) {\n    case 'StripeCardError':\n      // Card was declined — show err.message to the customer\n      break\n    case 'StripeInvalidRequestError':\n      // Your code sent invalid parameters — fix the request\n      break\n    case 'StripeRateLimitError':\n      // Too many requests — back off and retry\n      break\n    default:\n      // Unexpected error — log and alert\n  }\n}\n\nAlways handle StripeCardError separately from other errors. Card declines are expected and should result in a user-friendly message. API errors indicate bugs in your code.`,
        callouts: [
          {
            kind: 'tip' as CalloutKind,
            text: `Every Stripe error response includes a code field (like card_declined, expired_card, incorrect_cvc) and a decline_code for card errors. Use these to show specific messages: "Your card was declined" is less helpful than "Your card has expired — please use a different card."`,
          },
        ],
      },
    ],
    doneLabel: `I've created a PaymentIntent, understood its lifecycle, and handled errors`,
  },

  // ── MODULE 5 ──────────────────────────────────────────────────────────
  {
    id: 'handling-webhooks',
    number: 5,
    title: 'Handling Webhooks',
    estMinutes: 12,
    intro: `Webhooks are HTTP callbacks that Stripe sends to your server when events occur in your account — a payment succeeds, a refund is issued, a dispute is opened. They are essential for reliable payment processing because they notify your server of outcomes that the customer's browser might never report (network interruptions, 3D Secure completions on another device, asynchronous payment methods). This module covers setting up a webhook endpoint, verifying signatures, and handling the events you care about.`,
    narrative: `NovaMart has a problem: sometimes a customer pays but their order is never confirmed in the system. The frontend redirect occasionally fails — the customer closes the tab, their connection drops, or the browser crashes mid-redirect. You need a server-side listener that catches payment confirmations regardless of what happens in the browser.`,
    overviewAddition: `Webhooks are your safety net. If the browser misses the confirmation, your server still knows.`,
    steps: [
      {
        title: 'Create a webhook endpoint in the Dashboard',
        body: `Open the Webhooks section under Developers. Click "Add endpoint". Enter your server URL (e.g. https://novamart.com/webhooks/stripe) and select the events you want to receive.\n\nFor a basic payment integration, start with these events:\n\n• payment_intent.succeeded\n• payment_intent.payment_failed\n• charge.refunded\n• charge.dispute.created\n\nStripe will send an HTTP POST request to your URL every time one of these events occurs. The request body is a JSON Event object containing the event type and the full data of the affected object.`,
        dashboardLink: { label: 'Webhooks', url: 'https://dashboard.stripe.com/webhooks' },
        gif: {
          caption: 'Record: creating a webhook endpoint in the Dashboard and selecting payment_intent.succeeded and other events.',
          screen: 'Dashboard → Developers → Webhooks → Add endpoint',
        },
        callouts: [
          {
            kind: 'tip' as CalloutKind,
            text: `During development, use the Stripe CLI to forward webhook events to your local server: stripe listen --forward-to localhost:3000/webhooks/stripe. This avoids the need for a public URL while testing.`,
          },
        ],
      },
      {
        title: 'Verify webhook signatures',
        body: `Anyone on the internet could POST fake events to your webhook URL. Stripe prevents this by signing every webhook request with a secret. When you create an endpoint, Stripe gives you a webhook signing secret (whsec_...).\n\nOn your server, verify the signature before processing:\n\nconst endpointSecret = 'whsec_...'\n\napp.post('/webhooks/stripe', express.raw({ type: 'application/json' }), (req, res) => {\n  const sig = req.headers['stripe-signature']\n  let event\n  try {\n    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret)\n  } catch (err) {\n    return res.status(400).send('Webhook signature verification failed')\n  }\n  // Process the event\n  res.json({ received: true })\n})\n\nThe constructEvent method compares the signature header against an HMAC of the raw request body using your signing secret. If they do not match, the event was not sent by Stripe and should be rejected.`,
        callouts: [
          {
            kind: 'warning' as CalloutKind,
            text: `You must use the raw request body (not parsed JSON) for signature verification. If your framework parses the body before it reaches the webhook handler, the signature check will fail. In Express, use express.raw({ type: 'application/json' }) for the webhook route.`,
          },
        ],
      },
      {
        title: 'Handle key event types',
        body: `Inside your webhook handler, switch on the event type and process accordingly:\n\nswitch (event.type) {\n  case 'payment_intent.succeeded':\n    const paymentIntent = event.data.object\n    await fulfillOrder(paymentIntent.metadata.order_id)\n    break\n  case 'payment_intent.payment_failed':\n    const failedIntent = event.data.object\n    await notifyCustomerOfFailure(failedIntent.metadata.order_id)\n    break\n  case 'charge.dispute.created':\n    const dispute = event.data.object\n    await alertFraudTeam(dispute)\n    break\n}\n\nThe event.data.object contains the full Stripe object (PaymentIntent, Charge, Dispute, etc.) at the time of the event. Use the metadata you attached during creation to correlate back to your internal records.`,
        callouts: [
          {
            kind: 'explanation' as CalloutKind,
            text: `Your webhook handler must return a 2xx HTTP status code within 30 seconds to acknowledge receipt. If Stripe does not receive a 2xx, it retries the webhook up to 3 times with exponential backoff. After all retries fail, the event is marked as failed in your Dashboard.`,
          },
        ],
        gif: {
          caption: 'Record: a webhook event appearing in the Dashboard event log with a 200 response status.',
          screen: 'Dashboard → Developers → Webhooks → Event attempts',
        },
      },
      {
        title: 'Make your handler idempotent',
        body: `Stripe may deliver the same event more than once. Network issues, timeouts, or retries can all cause duplicate deliveries. Your webhook handler must be idempotent — processing the same event twice should produce the same result as processing it once.\n\nThe simplest approach: store the event ID (evt_...) in your database when you process it, and skip any event you have already seen:\n\nif (await hasEventBeenProcessed(event.id)) {\n  return res.json({ received: true })\n}\nawait processEvent(event)\nawait markEventAsProcessed(event.id)\n\nThis pattern prevents duplicate order fulfillment, double refunds, and other dangerous side effects of re-processing.`,
        callouts: [
          {
            kind: 'info' as CalloutKind,
            text: `Stripe guarantees at-least-once delivery for webhooks, not exactly-once. Building idempotent handlers is not optional — it is a requirement for a production-grade integration.`,
          },
        ],
      },
      {
        title: 'Test webhooks with the Stripe CLI',
        body: `Install the Stripe CLI and log in with stripe login. Then start listening:\n\nstripe listen --forward-to localhost:3000/webhooks/stripe\n\nThe CLI prints a webhook signing secret (whsec_...) — use this in your local development environment. Now trigger a test event:\n\nstripe trigger payment_intent.succeeded\n\nThis creates a real PaymentIntent in your test account and sends the corresponding event to your local server. Check your server logs to confirm the event was received and processed correctly.`,
        callouts: [
          {
            kind: 'tip' as CalloutKind,
            text: `The Stripe CLI can trigger over 200 event types. Run stripe trigger --help to see the full list. You can also replay specific events from your Dashboard using the "Resend" button on any webhook delivery attempt.`,
          },
        ],
        gif: {
          caption: 'Record: running stripe listen in the terminal and seeing events forwarded to the local server.',
          screen: 'Terminal → stripe listen → event received',
        },
      },
      {
        title: 'Monitor webhook health',
        body: `Back in the Dashboard, open your webhook endpoint. The delivery attempts tab shows every event Stripe sent: the HTTP status code your server returned, the response time, and any errors. A healthy endpoint shows all green 200 responses.\n\nIf you see repeated failures, check: Is your server running? Is the URL correct? Is the signing secret correct? Is your server returning a 2xx before the 30-second timeout?\n\nStripe also sends email alerts when a webhook endpoint has been failing consistently, giving you time to fix the issue before events are permanently missed.`,
        dashboardLink: { label: 'Webhooks', url: 'https://dashboard.stripe.com/webhooks' },
        callouts: [
          {
            kind: 'stripe-fact' as CalloutKind,
            text: `Stripe retries failed webhook deliveries over a period of up to 3 days with exponential backoff. The retry schedule starts at a few seconds and extends to hours between attempts, giving you time to fix outages without losing events.`,
          },
        ],
      },
    ],
    doneLabel: `I've set up a webhook endpoint, verified signatures, and tested with the CLI`,
  },

  // ── MODULE 6 ──────────────────────────────────────────────────────────
  {
    id: 'payment-methods-wallets',
    number: 6,
    title: 'Payment Methods & Wallets',
    estMinutes: 8,
    intro: `Cards are just the beginning. Stripe supports over 40 payment methods — digital wallets like Apple Pay and Google Pay, bank debits, bank redirects, buy-now-pay-later, and more. Offering the right payment methods for your customer base increases conversion and reduces cart abandonment. This module covers how to enable and test different payment methods in your integration.`,
    narrative: `NovaMart's analytics show that 30% of mobile customers abandon checkout. The CEO read that Apple Pay and Google Pay reduce mobile checkout friction dramatically. She wants them enabled by yesterday. Fortunately, if you built your integration with the Payment Element, this is mostly a configuration change.`,
    overviewAddition: `More payment methods means more customers completing checkout.`,
    steps: [
      {
        title: 'Enable payment methods in the Dashboard',
        body: `Open the Payment methods settings in your Dashboard. You will see a list of all available payment methods organized by type: cards, wallets, bank debits, bank redirects, and buy-now-pay-later.\n\nEach method has an "Enable" toggle. For NovaMart, enable:\n\n• Cards (already enabled by default)\n• Apple Pay\n• Google Pay\n• Link (Stripe's one-click checkout)\n\nWhen you enable a payment method here and your integration uses automatic_payment_methods: { enabled: true } on PaymentIntents, the Payment Element automatically renders the appropriate UI for each enabled method.`,
        dashboardLink: { label: 'Payment methods', url: 'https://dashboard.stripe.com/settings/payment_methods' },
        gif: {
          caption: 'Record: the Payment methods settings page with toggles for cards, Apple Pay, Google Pay, and Link.',
          screen: 'Dashboard → Settings → Payment methods',
        },
        callouts: [
          {
            kind: 'info' as CalloutKind,
            text: `Apple Pay and Google Pay have no additional fees beyond standard card processing rates. They use the customer's card stored in their wallet, so the underlying transaction is still a card payment — just with a faster, more secure checkout experience.`,
          },
        ],
      },
      {
        title: 'Understand payment method types',
        body: `Stripe categorizes payment methods by how they work:\n\n• Immediate confirmation: Cards, Apple Pay, Google Pay — the customer pays and you get an immediate success or failure.\n• Redirect-based: iDEAL, Bancontact, Sofort — the customer is redirected to their bank's website to authorize the payment, then redirected back.\n• Delayed notification: ACH debits, SEPA debits — the payment is initiated but confirmation takes 2-5 business days.\n• Buy now, pay later: Klarna, Afterpay — the customer pays in installments; you receive the full amount upfront from the provider.\n\nEach type has different implications for your order fulfillment flow. Immediate methods let you fulfill instantly. Delayed methods require you to wait for a webhook confirmation before shipping.`,
        callouts: [
          {
            kind: 'explanation' as CalloutKind,
            text: `This is why webhooks (Module 5) are essential. For redirect-based and delayed payment methods, the browser redirect is not a reliable signal. The webhook is the only guaranteed confirmation that the payment succeeded.`,
          },
        ],
      },
      {
        title: 'Test Apple Pay and Google Pay',
        body: `Apple Pay works in Safari on macOS and iOS devices with a card in your Apple Wallet. Google Pay works in Chrome with a card saved in your Google account. In test mode, both wallets use your real wallet UI but process the payment against Stripe's test environment — no real charge is created.\n\nLoad your checkout page in the appropriate browser. If the wallet is available, the Payment Element automatically renders an Apple Pay or Google Pay button above the card form. Click it to test the flow.\n\nIf you do not see the wallet button, check: (1) you are using HTTPS (required for wallets), (2) the domain is registered in your Dashboard under Apple Pay settings, (3) the browser has a card configured in its wallet.`,
        callouts: [
          {
            kind: 'tip' as CalloutKind,
            text: `For local development, use the Stripe CLI's built-in HTTPS proxy or a tool like ngrok to serve your checkout page over HTTPS. Apple Pay and Google Pay require a secure context and will not appear on HTTP pages.`,
          },
        ],
        gif: {
          caption: 'Record: the Payment Element showing an Apple Pay button on a mobile checkout page.',
          screen: 'Checkout → Apple Pay button → Payment sheet',
        },
      },
      {
        title: 'Handle Link for returning customers',
        body: `Link is Stripe's one-click checkout solution. When a customer pays with Link, Stripe remembers their payment details and shipping address. On their next purchase — on NovaMart or any other Link-enabled merchant — they can pay with a single click and a verification code.\n\nLink appears automatically in the Payment Element when enabled. The customer enters their email, and if they have a Link account, Stripe pre-fills their saved payment method and address. If they are new to Link, they are offered the option to save their details after paying.\n\nYou do not need any additional code to support Link. It is handled entirely by the Payment Element and Stripe's backend.`,
        callouts: [
          {
            kind: 'stripe-fact' as CalloutKind,
            text: `Link-enabled checkouts have been shown to increase conversion rates by up to 7% for returning customers. The speed of one-click checkout dramatically reduces cart abandonment, especially on mobile devices.`,
          },
        ],
      },
      {
        title: 'Set up payment method-specific configuration',
        body: `Some payment methods require additional configuration on the PaymentIntent. For example, bank debit methods often need a mandate (a customer authorization to debit their account). The Stripe SDK handles mandate creation automatically when you use automatic_payment_methods.\n\nFor buy-now-pay-later methods like Klarna, you may want to pass line item details so the provider can display them to the customer:\n\nconst paymentIntent = await stripe.paymentIntents.create({\n  amount: 4999,\n  currency: 'usd',\n  automatic_payment_methods: { enabled: true },\n  shipping: {\n    name: 'Jenny Rosen',\n    address: { line1: '123 Main St', city: 'San Francisco', state: 'CA', postal_code: '94111', country: 'US' },\n  },\n})\n\nCheck Stripe's documentation for each payment method's specific requirements. The Payment Element will show an error if a required field is missing.`,
        dashboardLink: { label: 'Payment methods', url: 'https://dashboard.stripe.com/settings/payment_methods' },
        callouts: [
          {
            kind: 'warning' as CalloutKind,
            text: `Not all payment methods support all currencies. For example, iDEAL only works with EUR, and ACH only works with USD. If you serve customers in multiple countries, check currency support before enabling a method.`,
          },
        ],
      },
    ],
    doneLabel: `I've enabled wallets and alternative payment methods and tested them`,
  },

  // ── MODULE 7 ──────────────────────────────────────────────────────────
  {
    id: 'three-d-secure-auth',
    number: 7,
    title: '3D Secure & Authentication',
    estMinutes: 10,
    intro: `3D Secure (3DS) is a protocol that adds an extra authentication step to online card payments. The cardholder is prompted to verify their identity — usually via an SMS code, a banking app notification, or biometrics. 3DS reduces fraud and shifts liability for fraudulent chargebacks from the merchant to the card issuer. This module covers how 3DS works with Stripe, when it is triggered, and how your integration handles the authentication flow.`,
    narrative: `NovaMart just received its first chargeback. A customer claims they never made the purchase. The $189.99 order plus a $15.00 dispute fee is gone. Your CTO asks: "Isn't there a way to make them prove it's really them before we charge the card?" There is. It's called 3D Secure.`,
    overviewAddition: `Authentication is the difference between absorbing fraud losses and shifting them to the card issuer.`,
    steps: [
      {
        title: 'How 3D Secure works',
        body: `When 3DS is triggered on a payment, the customer sees an authentication challenge — typically a pop-up or redirect to their bank's verification page. The bank asks them to confirm with a one-time SMS code, a push notification in their banking app, or a biometric scan (fingerprint or face).\n\nBehind the scenes, the card issuer evaluates the authentication request and returns one of three results: authenticated (the cardholder proved their identity), not authenticated (they failed or canceled), or unavailable (the card or issuer does not support 3DS).\n\nWhen authentication succeeds, a liability shift occurs. This means if the payment later results in a fraud dispute, the card issuer bears the loss — not NovaMart. This is the key financial benefit of 3DS.`,
        callouts: [
          {
            kind: 'explanation' as CalloutKind,
            text: `3DS2 is the current version of the protocol. It supports frictionless authentication — the issuer can approve the transaction silently based on risk signals without showing a challenge to the customer. Only higher-risk transactions trigger the visible challenge. This reduces checkout friction while maintaining security.`,
          },
        ],
        gif: {
          caption: 'Record: a 3D Secure authentication popup appearing during a test payment.',
          screen: 'Checkout → 3DS challenge popup',
        },
      },
      {
        title: 'When 3DS is triggered',
        body: `3DS can be triggered in three ways:\n\n1. Stripe Radar rules — you write rules in the Dashboard that request 3DS for specific conditions (e.g. risk_level = 'elevated' or amount > 10000)\n2. Card issuer requirements — some issuers mandate 3DS for all online transactions, especially in Europe under the Strong Customer Authentication (SCA) regulation\n3. Manual request — you set payment_intent.confirm with payment_method_options.card.request_three_d_secure = 'any' to force 3DS on specific payments\n\nStripe handles the 3DS flow automatically. When authentication is required, the PaymentIntent moves to requires_action status and the frontend SDK renders the authentication UI.`,
        callouts: [
          {
            kind: 'info' as CalloutKind,
            text: `In the European Economic Area, SCA regulation requires 3DS on most online card payments. Stripe automatically applies 3DS when required by regulation, even if you have not written any Radar rules. Your integration handles this seamlessly through the requires_action status.`,
          },
        ],
      },
      {
        title: 'Handle requires_action in your frontend',
        body: `When you call stripe.confirmPayment() and the payment requires 3DS, Stripe automatically renders the authentication challenge. You do not need to write any 3DS-specific frontend code — the Payment Element and confirmPayment handle it.\n\nThe flow is:\n1. Customer clicks "Pay"\n2. Your code calls stripe.confirmPayment()\n3. Stripe detects 3DS is needed\n4. The authentication popup appears automatically\n5. Customer completes or cancels authentication\n6. If successful, the payment continues to processing/succeeded\n7. If failed, confirmPayment returns an error\n\nThe key insight: your confirm flow is the same whether 3DS is triggered or not. Stripe abstracts the complexity.`,
        callouts: [
          {
            kind: 'tip' as CalloutKind,
            text: `If you are using a custom payment confirmation flow (not the Payment Element), you may need to handle the requires_action status yourself using stripe.handleNextAction(). The Payment Element flow is recommended because it handles all edge cases automatically.`,
          },
        ],
      },
      {
        title: 'Test with 3DS test cards',
        body: `Stripe provides specific test card numbers that simulate different 3DS scenarios:\n\n• 4000 0025 0000 3155 — requires authentication (customer completes 3DS)\n• 4000 0000 0000 3220 — requires authentication (3DS2 frictionless flow)\n• 4000 0000 0000 3063 — requires authentication (customer fails 3DS)\n• 4000 0000 0000 3097 — 3DS is required but not supported by the card\n\nUse any future expiration date, any 3-digit CVC, and any 5-digit ZIP code. Create a PaymentIntent with one of these card numbers and observe the behavior in your checkout flow.`,
        dashboardLink: { label: 'Payments', url: 'https://dashboard.stripe.com/payments' },
        callouts: [
          {
            kind: 'stripe-fact' as CalloutKind,
            text: `Stripe maintains a comprehensive list of test card numbers at stripe.com/docs/testing that simulate every scenario: declines, disputes, specific error codes, 3DS outcomes, and card brand behaviors. Bookmark this page — you will use it constantly during development.`,
          },
        ],
        gif: {
          caption: 'Record: making a test payment with card 4000002500003155 and completing the 3DS popup.',
          screen: 'Checkout → Test payment → 3DS challenge → Success',
        },
      },
      {
        title: 'Check liability shift in the Dashboard',
        body: `After a successful 3DS-authenticated payment, open it in the Dashboard. In the payment detail page, look for the "3D Secure" section. It shows:\n\n• Authentication status: authenticated, attempted, or failed\n• Liability shift: whether the liability shifted to the card issuer\n• Version: 3DS1 or 3DS2\n\nA payment with "authenticated" status and "yes" for liability shift means NovaMart is protected against fraud disputes for that charge. If a customer disputes a liability-shifted payment claiming fraud, the card issuer absorbs the loss.`,
        dashboardLink: { label: 'Payments', url: 'https://dashboard.stripe.com/payments' },
        callouts: [
          {
            kind: 'warning' as CalloutKind,
            text: `Liability shift only protects against fraud disputes (reason: "fraudulent"). It does not protect against other dispute types like "product not received" or "product not as described." Those require different evidence regardless of 3DS status.`,
          },
        ],
      },
    ],
    doneLabel: `I've understood 3D Secure, tested with 3DS cards, and verified liability shift`,
  },

  // ── MODULE 8 ──────────────────────────────────────────────────────────
  {
    id: 'testing-integration',
    number: 8,
    title: 'Testing Your Integration',
    estMinutes: 10,
    intro: `Stripe's test mode is a complete sandbox environment with its own data, API keys, and Dashboard view. Test mode lets you simulate every scenario your integration will encounter in production — successful payments, declines, disputes, refunds, and edge cases — without moving real money. This module covers Stripe's testing tools, test card numbers, and strategies for thorough integration testing.`,
    narrative: `NovaMart's integration is taking shape, but before you show it to the CTO, you need to prove it works. Not just the happy path — you need to test what happens when cards are declined, when webhooks fail, when 3DS times out, and when things go wrong. If you find the bugs now, customers will not find them later.`,
    overviewAddition: `Test every failure mode before your customers discover them for you.`,
    steps: [
      {
        title: 'Understand test mode vs live mode',
        body: `Stripe maintains two completely separate environments for every account. Test mode uses pk_test_ and sk_test_ keys. Live mode uses pk_live_ and sk_live_ keys. Data created in test mode is invisible in live mode and vice versa.\n\nTest mode has no rate limits for most endpoints (though there are soft limits to prevent abuse). Charges in test mode never contact real card networks — Stripe simulates the entire authorization and settlement flow internally. This means test mode responses are faster (usually <100ms) and always available, even if a card network is having issues.\n\nThe API surface is identical between modes. The same code that processes a test payment will process a live payment — you only change the API key.`,
        callouts: [
          {
            kind: 'info' as CalloutKind,
            text: `You can view test mode and live mode side-by-side in the Dashboard using the "Test mode" toggle in the header. All Dashboard pages (Payments, Customers, Webhooks, etc.) have separate test-mode views.`,
          },
        ],
      },
      {
        title: 'Test card numbers for common scenarios',
        body: `Stripe provides specific card numbers that trigger deterministic outcomes:\n\n• 4242 4242 4242 4242 — Visa, always succeeds\n• 5555 5555 5555 4444 — Mastercard, always succeeds\n• 4000 0000 0000 0002 — always declines (generic decline)\n• 4000 0000 0000 9995 — declines with insufficient_funds\n• 4000 0000 0000 9987 — declines with lost_card\n• 4000 0000 0000 0341 — succeeds on charge, but triggers a dispute\n• 4000 0000 0000 3220 — requires 3D Secure (frictionless)\n\nAll test cards use any future expiration date, any 3-digit CVC, and any valid postal code. These are not real card numbers — they only work in test mode.`,
        callouts: [
          {
            kind: 'tip' as CalloutKind,
            text: `The card 4000000000000341 is especially useful — it creates a successful charge that is automatically disputed after a few minutes. Use it to test your dispute handling webhook and evidence submission flow end-to-end.`,
          },
        ],
        gif: {
          caption: 'Record: making a test payment with 4242424242424242 and seeing it succeed in the Dashboard.',
          screen: 'Checkout → Test card → Dashboard payment detail',
        },
      },
      {
        title: 'Test error handling',
        body: `Use decline test cards to verify your frontend displays appropriate error messages. Make a payment with 4000 0000 0000 0002 and confirm your UI shows a clear decline message rather than a generic "something went wrong".\n\nThen test your server-side error handling by sending invalid parameters to the API. Try creating a PaymentIntent with amount: -100 (invalid amount) or currency: 'xxx' (invalid currency). Verify your server catches the StripeInvalidRequestError and responds gracefully.\n\nFinally, test your webhook error handling by temporarily breaking your webhook endpoint (return a 500 status code) and confirm that Stripe retries the delivery as expected.`,
        callouts: [
          {
            kind: 'warning' as CalloutKind,
            text: `Do not test only the happy path. In production, roughly 5-15% of payment attempts are declined. Your customers will see decline messages regularly — make sure they are helpful and actionable, not confusing error codes.`,
          },
          {
            kind: 'explanation' as CalloutKind,
            text: `Stripe returns specific decline_code values that you can map to customer-friendly messages. For example, insufficient_funds can display "Your card has insufficient funds — please try a different card." Check the Stripe docs for the full list of decline codes and suggested messages.`,
          },
        ],
      },
      {
        title: 'Use the Stripe CLI for testing',
        body: `The Stripe CLI is a command-line tool for interacting with your Stripe account. Beyond webhook forwarding (covered in Module 5), it can:\n\n• Create test resources: stripe payment_intents create --amount 999 --currency usd\n• Trigger specific events: stripe trigger invoice.payment_failed\n• Tail API logs in real time: stripe logs tail\n• Open Dashboard pages: stripe open payments\n\nInstall it from stripe.com/docs/stripe-cli and authenticate with stripe login. The CLI is especially useful for automated test scripts that create and verify payments as part of your CI pipeline.`,
        callouts: [
          {
            kind: 'tip' as CalloutKind,
            text: `Run stripe logs tail during development to see every API request your application makes in real time. This is faster than refreshing the Dashboard logs page and helps you spot unexpected calls immediately.`,
          },
        ],
        gif: {
          caption: 'Record: running stripe logs tail in the terminal and seeing API requests appear in real time.',
          screen: 'Terminal → stripe logs tail',
        },
      },
      {
        title: 'Write automated integration tests',
        body: `For your test suite, use the Stripe API directly in test mode. Create real PaymentIntents and confirm them with test card tokens. Here is a pattern using a test helper:\n\nconst paymentIntent = await stripe.paymentIntents.create({\n  amount: 2000,\n  currency: 'usd',\n  payment_method: 'pm_card_visa',\n  confirm: true,\n  automatic_payment_methods: {\n    enabled: true,\n    allow_redirects: 'never',\n  },\n})\nassert(paymentIntent.status === 'succeeded')\n\nThe pm_card_visa token is a test payment method that always succeeds. Other test tokens include pm_card_declined for declines and pm_card_threeDSecureRequired for 3DS. These tokens bypass the frontend flow and let you test server-side logic directly.`,
        dashboardLink: { label: 'API Keys', url: 'https://dashboard.stripe.com/apikeys' },
        callouts: [
          {
            kind: 'info' as CalloutKind,
            text: `Consider using a separate Stripe account (or restricted API key) for automated testing. This keeps your development test data separate from manual testing and prevents test runs from cluttering your Dashboard.`,
          },
        ],
      },
    ],
    doneLabel: `I've tested with test cards, simulated errors, and used the Stripe CLI`,
  },

  // ── MODULE 9 ──────────────────────────────────────────────────────────
  {
    id: 'refunds-disputes-chargebacks',
    number: 9,
    title: 'Refunds, Disputes & Chargebacks',
    estMinutes: 10,
    intro: `Payments do not always end at "succeeded". Customers return products, find unauthorized charges on their statements, and file disputes with their banks. Handling refunds programmatically and responding to disputes effectively are essential parts of any payment integration. This module covers the Refund API, the dispute lifecycle, and strategies for reducing chargebacks.`,
    narrative: `NovaMart has been live for a week. Three customers want refunds — one received a damaged vase, one ordered the wrong size, and one claims they never made the purchase at all. The customer service team is asking: "How do we process these?" You need to build refund capability into the system and establish a process for handling disputes.`,
    overviewAddition: `Refunds and disputes are inevitable. Handle them well and customers stay loyal.`,
    steps: [
      {
        title: 'Create a refund via the API',
        body: `Refunds reverse a successful payment. You can refund the full amount or a partial amount:\n\n// Full refund\nconst refund = await stripe.refunds.create({\n  payment_intent: 'pi_3abc...',\n})\n\n// Partial refund\nconst partialRefund = await stripe.refunds.create({\n  payment_intent: 'pi_3abc...',\n  amount: 500, // refund $5.00 of the original charge\n})\n\nRefunds are processed through the original payment method. For card payments, the refund typically appears on the customer's statement in 5-10 business days. The refund object has a status: succeeded, pending, or failed.`,
        dashboardLink: { label: 'Payments', url: 'https://dashboard.stripe.com/payments' },
        callouts: [
          {
            kind: 'info' as CalloutKind,
            text: `You can issue multiple partial refunds on the same payment as long as the total refunded does not exceed the original charge amount. Each refund creates a separate Refund object with its own ID (re_...).`,
          },
        ],
        gif: {
          caption: 'Record: creating a refund from the Dashboard payment detail page and seeing the refund status.',
          screen: 'Dashboard → Payment detail → Refund',
        },
      },
      {
        title: 'Handle refund webhooks',
        body: `When a refund is processed, Stripe fires the charge.refunded event. Your webhook handler should listen for this to update your internal order status:\n\ncase 'charge.refunded':\n  const charge = event.data.object\n  const refundedAmount = charge.amount_refunded\n  await updateOrderStatus(charge.payment_intent, 'refunded', refundedAmount)\n  await notifyCustomerOfRefund(charge)\n  break\n\nNote that charge.refunded fires for both full and partial refunds. Check charge.refunded (boolean) and charge.amount_refunded (integer) to determine whether the refund was full or partial.`,
        callouts: [
          {
            kind: 'tip' as CalloutKind,
            text: `Also listen for the charge.refund.updated event, which fires when a refund's status changes (e.g. from pending to succeeded or failed). Bank account refunds can take several days to settle, so the status may change asynchronously.`,
          },
        ],
      },
      {
        title: 'Understand the dispute process',
        body: `A dispute (chargeback) occurs when a cardholder contacts their bank to reverse a charge. The bank immediately removes the funds from NovaMart's account (plus a dispute fee, typically $15) and gives NovaMart a window to respond with evidence.\n\nThe dispute lifecycle:\n1. Customer contacts their bank\n2. Bank creates a dispute → Stripe fires charge.dispute.created\n3. NovaMart has a deadline to submit evidence (usually 7-21 days depending on the card network)\n4. NovaMart submits evidence through the API or Dashboard\n5. The bank reviews and makes a decision → charge.dispute.closed fires\n6. Outcome: won (funds returned to NovaMart), lost (funds stay with customer), or warning (no financial impact but noted on the account)\n\nDispute fees are not refunded even if you win the dispute.`,
        dashboardLink: { label: 'Disputes', url: 'https://dashboard.stripe.com/disputes' },
        callouts: [
          {
            kind: 'warning' as CalloutKind,
            text: `A high dispute rate can trigger consequences from card networks. Visa and Mastercard flag merchants with dispute rates above 0.9% of transactions. Exceeding 1.8% can result in fines, increased processing fees, or account termination. Monitor your dispute rate closely.`,
          },
        ],
      },
      {
        title: 'Submit dispute evidence',
        body: `You can submit evidence via the API or the Dashboard. The API approach:\n\nawait stripe.disputes.update('dp_...', {\n  evidence: {\n    customer_email_address: 'jenny@example.com',\n    customer_purchase_ip: '203.0.113.42',\n    product_description: 'Handmade ceramic vase, 12 inches tall',\n    shipping_tracking_number: '1Z999AA10123456784',\n    shipping_carrier: 'ups',\n    uncategorized_text: 'Customer completed checkout with verified shipping address. Order was delivered and signed for on 2024-01-15.',\n  },\n  submit: true,\n})\n\nThe evidence fields vary by dispute reason. For a "fraudulent" dispute, focus on proving the real cardholder made the purchase (IP address, device fingerprint, shipping to the address on file). For "product not received", provide tracking numbers and delivery confirmation.`,
        callouts: [
          {
            kind: 'explanation' as CalloutKind,
            text: `Once you submit evidence with submit: true, it cannot be modified. If you want to build evidence incrementally, omit the submit field and call update multiple times. Submit only when your evidence package is complete.`,
          },
        ],
        gif: {
          caption: 'Record: opening a dispute in the Dashboard and filling in the evidence submission form.',
          screen: 'Dashboard → Disputes → Submit evidence',
        },
      },
      {
        title: 'Reduce disputes proactively',
        body: `The best dispute strategy is prevention. NovaMart can reduce disputes significantly with these practices:\n\n• Set a clear statement descriptor — customers should recognize "NOVAMART" on their bank statement, not "STRIPE* RANDOM123"\n• Send order confirmation emails immediately after payment with the amount and description\n• Make your refund policy easy to find and use — customers who can get a refund easily are less likely to file a dispute\n• Use 3D Secure for high-risk transactions (Module 7) to get liability shift\n• Respond to customer service inquiries quickly — most disputes start as unresolved support tickets\n\nStripe also provides Radar rules (covered in the Fraud workshop) to block likely-fraudulent payments before they become disputes.`,
        callouts: [
          {
            kind: 'stripe-fact' as CalloutKind,
            text: `Stripe provides a pre-dispute mechanism called an Early Fraud Warning. When a cardholder reports their card as lost or stolen, Stripe fires an early_fraud_warning.created event before a formal dispute is filed. Proactively refunding these charges can prevent the dispute entirely.`,
          },
          {
            kind: 'tip' as CalloutKind,
            text: `Monitor the charge.dispute.created webhook closely. Responding within 24 hours of a dispute gives your team maximum time to gather evidence. Set up alerts so disputes never go unanswered past the deadline.`,
          },
        ],
      },
    ],
    doneLabel: `I've processed refunds, understood disputes, and learned prevention strategies`,
  },

  // ── MODULE 10 ─────────────────────────────────────────────────────────
  {
    id: 'going-live-checklist',
    number: 10,
    title: 'Going Live Checklist',
    estMinutes: 8,
    intro: `Your integration is built and tested. Before flipping the switch from test mode to live mode, there is a checklist of items to verify. Skipping any of these can result in failed payments, security vulnerabilities, or compliance issues that are much harder to fix once real customers are affected. This module walks through every step of going live.`,
    narrative: `NovaMart's integration is ready. The CTO wants to launch next Monday. Before that happens, you need to run through the go-live checklist and make sure nothing is missing. Once real money is flowing, fixing bugs becomes a lot more stressful.`,
    overviewAddition: `The final review before real money starts flowing through your integration.`,
    steps: [
      {
        title: 'Swap test keys for live keys',
        body: `Open your API keys page in the Dashboard. Switch the "Test mode" toggle off to view your live keys. Your live publishable key starts with pk_live_ and your live secret key starts with sk_live_.\n\nUpdate your environment configuration:\n\n• Frontend: replace pk_test_ with pk_live_ in your Stripe.js initialization\n• Backend: replace sk_test_ with sk_live_ in your server's Stripe client\n• Webhook endpoint: create a new webhook endpoint for your production URL (or update the existing one) and use the new webhook signing secret\n\nNever hardcode API keys in your source code. Use environment variables or a secrets manager. Your deployment pipeline should inject the correct keys per environment.`,
        dashboardLink: { label: 'API Keys', url: 'https://dashboard.stripe.com/apikeys' },
        callouts: [
          {
            kind: 'warning' as CalloutKind,
            text: `Double-check that no test keys leaked into production code and no live keys leaked into your test environment. A live key in test code could accidentally create real charges. A test key in production will cause all payments to fail silently.`,
          },
        ],
        gif: {
          caption: 'Record: switching from test mode to live mode in the Dashboard and viewing live API keys.',
          screen: 'Dashboard → Developers → API Keys → Live mode',
        },
      },
      {
        title: 'Use restricted API keys',
        body: `Your secret key (sk_live_) has full access to your Stripe account — it can create charges, issue refunds, delete customers, and modify settings. For production, create restricted keys that only have the permissions your application needs.\n\nOpen the API keys page and click "Create restricted key". Give it a name like "NovaMart Production Server" and grant only the permissions your code uses:\n\n• PaymentIntents: Write (to create and confirm payments)\n• Customers: Write (to create and manage customer records)\n• Refunds: Write (to process refunds)\n• Webhooks: Read (to verify webhook signatures)\n\nLeave all other permissions as "None". If your key is compromised, the damage is limited to only what the key can access.`,
        dashboardLink: { label: 'API Keys', url: 'https://dashboard.stripe.com/apikeys' },
        callouts: [
          {
            kind: 'tip' as CalloutKind,
            text: `Create separate restricted keys for different services. Your main server, your refund processing worker, and your analytics pipeline should each have their own key with only the permissions they need. This is the principle of least privilege.`,
          },
        ],
      },
      {
        title: 'Verify your webhook endpoint',
        body: `Your production webhook endpoint must be:\n\n• HTTPS — Stripe will not deliver live-mode webhooks to HTTP URLs\n• Publicly accessible — Stripe's servers need to reach it from the internet\n• Responsive — must return a 2xx within 30 seconds\n• Idempotent — must handle duplicate event delivery safely\n\nIn the Dashboard, open your webhook endpoint and check the "Recent deliveries" tab. Verify that events are being delivered successfully with 200 status codes. If you see failures, fix the underlying issue before going live.\n\nAlso ensure you have subscribed to all the event types your integration needs. At minimum: payment_intent.succeeded, payment_intent.payment_failed, charge.refunded, and charge.dispute.created.`,
        dashboardLink: { label: 'Webhooks', url: 'https://dashboard.stripe.com/webhooks' },
        callouts: [
          {
            kind: 'info' as CalloutKind,
            text: `Consider setting up a secondary webhook endpoint as a fallback. If your primary endpoint goes down, the secondary can catch events. Stripe supports multiple endpoints per account, each subscribed to different (or overlapping) event types.`,
          },
        ],
      },
      {
        title: 'Complete your account activation',
        body: `Before you can process live payments, Stripe requires some business information. Open your account settings and check for any activation requirements:\n\n• Business details: legal name, address, tax ID\n• Bank account: where Stripe deposits your payouts\n• Identity verification: personal details of the account representative\n• Website: a URL where Stripe can verify your business is real\n\nStripe reviews this information and may ask follow-up questions. Start the activation process early — it can take 1-3 business days, and you cannot process live payments until it is complete.`,
        dashboardLink: { label: 'Settings', url: 'https://dashboard.stripe.com/settings/account' },
        callouts: [
          {
            kind: 'warning' as CalloutKind,
            text: `If your account activation is incomplete, live API calls will return an error: "Your account cannot currently make live charges." Complete all activation requirements before your launch date to avoid a last-minute blocker.`,
          },
        ],
        gif: {
          caption: 'Record: the account settings page showing activation requirements and completion status.',
          screen: 'Dashboard → Settings → Account → Activation',
        },
      },
      {
        title: 'Final integration review',
        body: `Before launch, run through this final checklist:\n\n• Error handling: every Stripe API call is wrapped in a try/catch with appropriate error handling\n• Idempotency keys: all write operations (create, update) include idempotency keys\n• Webhook verification: your endpoint verifies webhook signatures and rejects unsigned requests\n• Amount validation: your server validates order amounts before creating PaymentIntents (never trust amounts from the frontend)\n• Statement descriptor: set to a recognizable business name\n• Metadata: all PaymentIntents include order IDs and customer references in metadata for traceability\n• Logging: your application logs Stripe API responses and webhook events for debugging\n• Monitoring: you have alerts for webhook failures, high decline rates, and dispute notifications\n\nMake one final test payment with a real card in live mode (refund it immediately after) to confirm the full end-to-end flow works with live keys.`,
        callouts: [
          {
            kind: 'stripe-fact' as CalloutKind,
            text: `Stripe processes live payments with 99.999% uptime. Your integration's reliability depends on your own server uptime, webhook handling, and error recovery. Build with the assumption that any individual API call might fail, and your system remains consistent.`,
          },
          {
            kind: 'tip' as CalloutKind,
            text: `After your first live payment succeeds, keep the Payments page and your webhook logs open for the first hour. Watch for any unexpected behaviors and verify that your order fulfillment pipeline processes the webhook correctly with real data.`,
          },
        ],
      },
    ],
    doneLabel: `I've completed the go-live checklist and am ready to accept real payments`,
  },
]

export const ONLINE_PAYMENTS_SCORED_MODULES = ONLINE_PAYMENTS_WORKSHOP_MODULES.filter(
  (m) => !m.isPrerequisite
)
