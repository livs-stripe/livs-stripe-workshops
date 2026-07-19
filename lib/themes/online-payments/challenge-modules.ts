export type StepType = 'read' | 'action' | 'rule' | 'verify' | 'fire'

export type ChallengeStep = {
  stepNumber: number
  type: StepType
  title: string
  content?: string
  instruction?: string
  dashboardLink?: string
  checkboxLabel?: string
  ruleCode?: string
  ruleExplanation?: string
  checklist?: string[]
  fireTitle?: string
  fireDescription?: string
  expectedCharges?: number
  warningText?: string
}

export type ChallengeModule = {
  number: number
  id: string
  title: string
  tagline: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  expectedCharges: number
  maxExposureCents: number
  steps: ChallengeStep[]
  chargeConfig: {
    count: number
    amountMinCents: number
    amountMaxCents: number
    testCard?: string
    metadata: Record<string, string>
    sameCard?: boolean
  }[]
}

export const ONLINE_PAYMENTS_STARTING_BALANCE_CENTS = 500_000 // $5,000

export const ONLINE_PAYMENTS_CHALLENGE_MODULES: ChallengeModule[] = [
  // MODULE 1: Create a PaymentIntent
  {
    number: 1,
    id: 'create_payment_intent',
    title: 'Create a PaymentIntent',
    tagline: 'Build the server endpoint that starts every payment.',
    difficulty: 'Beginner',
    expectedCharges: 5,
    maxExposureCents: 25000,
    steps: [
      {
        stepNumber: 1,
        type: 'read',
        title: 'What is a PaymentIntent?',
        content:
          'A PaymentIntent represents a single payment attempt. You create one on your server with an amount and currency, then pass its client_secret to the frontend so the customer can confirm the payment. It tracks every state transition, from creation to success or failure, giving you a complete audit trail. Every modern Stripe integration starts here.',
      },
      {
        stepNumber: 2,
        type: 'action',
        title: 'Open your Stripe Dashboard',
        instruction:
          'Open the Stripe Dashboard and go to Developers > API keys. Confirm you can see your test mode publishable key (pk_test_...) and secret key (sk_test_...). You\'ll need these to create PaymentIntents.',
        dashboardLink: '/apikeys',
        checkboxLabel: 'I can see my test mode API keys',
      },
      {
        stepNumber: 3,
        type: 'action',
        title: 'Create a PaymentIntent via the API',
        instruction:
          'Use the Stripe API or your server-side code to create a PaymentIntent with amount: 2000 (that\'s $20.00), currency: "usd", and automatic_payment_methods enabled. Check that the response contains a client_secret and the status is "requires_payment_method".',
        dashboardLink: '/test/payments',
        checkboxLabel: 'I have created a PaymentIntent and can see it in the Dashboard',
      },
      {
        stepNumber: 4,
        type: 'verify',
        title: 'Check your PaymentIntent',
        checklist: [
          'The PaymentIntent appears in the Dashboard under Payments',
          'The status shows "Incomplete" (requires_payment_method)',
          'The amount is $20.00 USD',
          'automatic_payment_methods is enabled',
        ],
      },
      {
        stepNumber: 5,
        type: 'fire',
        title: 'Payment Creation Test',
        fireTitle: 'Payment Creation Test',
        fireDescription:
          '5 test charges will be created to verify your payment endpoint is correctly configured and accepting payments.',
        expectedCharges: 5,
        warningText:
          'These charges use the standard test Visa card (4242 4242 4242 4242). All 5 should succeed.',
      },
    ],
    chargeConfig: [
      {
        count: 5,
        amountMinCents: 1500,
        amountMaxCents: 5000,
        testCard: 'pm_card_visa',
        metadata: { challenge_type: 'payment_intent_creation', step: 'basics' },
      },
    ],
  },

  // MODULE 2: Mount the Payment Element
  {
    number: 2,
    id: 'mount_payment_element',
    title: 'Mount the Payment Element',
    tagline: 'Give customers a beautiful, secure way to pay.',
    difficulty: 'Beginner',
    expectedCharges: 10,
    maxExposureCents: 50000,
    steps: [
      {
        stepNumber: 1,
        type: 'read',
        title: 'The Payment Element',
        content:
          'The Payment Element is a prebuilt, embeddable UI component from Stripe that securely collects payment details. It automatically shows the payment methods you\'ve enabled in your Dashboard: cards, wallets, bank debits, and more. It handles input validation, error messaging, and localization. Because Stripe hosts it, your server never touches raw card numbers, which simplifies PCI compliance.',
      },
      {
        stepNumber: 2,
        type: 'action',
        title: 'Enable payment methods',
        instruction:
          'Open your Stripe Dashboard and go to Settings > Payment methods. Make sure at least "Cards" is enabled. You can also enable Apple Pay, Google Pay, or Link for a richer checkout experience.',
        dashboardLink: '/settings/payment_methods',
        checkboxLabel: 'I have confirmed Cards is enabled as a payment method',
      },
      {
        stepNumber: 3,
        type: 'action',
        title: 'Initialize Stripe.js and Elements',
        instruction:
          'In your frontend code, load Stripe.js with your publishable key, create an Elements instance using the client_secret from your PaymentIntent, and mount the Payment Element to a DOM container. You should see a card input form render on the page.',
        checkboxLabel: 'The Payment Element is rendering on my page',
      },
      {
        stepNumber: 4,
        type: 'verify',
        title: 'Verify the Payment Element works',
        checklist: [
          'The Payment Element renders a card number, expiry, and CVC input',
          'I can type the test card 4242 4242 4242 4242 into the card field',
          'Input validation shows errors for invalid entries (e.g. past expiry date)',
          'The form is connected to a valid PaymentIntent (no "Invalid client_secret" error)',
        ],
      },
      {
        stepNumber: 5,
        type: 'fire',
        title: 'Payment Element Test',
        fireTitle: 'Payment Element Test',
        fireDescription:
          '10 test charges using various test cards to verify your Payment Element is correctly integrated and rendering.',
        expectedCharges: 10,
        warningText:
          'A mix of successful and declined cards will be sent. Your integration should handle both outcomes gracefully.',
      },
    ],
    chargeConfig: [
      {
        count: 7,
        amountMinCents: 2000,
        amountMaxCents: 8000,
        testCard: 'pm_card_visa',
        metadata: { challenge_type: 'payment_element', outcome: 'success' },
      },
      {
        count: 3,
        amountMinCents: 1000,
        amountMaxCents: 5000,
        testCard: 'pm_card_chargeDeclined',
        metadata: { challenge_type: 'payment_element', outcome: 'declined' },
      },
    ],
  },

  // MODULE 3: Handle Confirmation
  {
    number: 3,
    id: 'handle_confirmation',
    title: 'Handle Confirmation',
    tagline: 'Confirm the payment and handle every outcome.',
    difficulty: 'Intermediate',
    expectedCharges: 15,
    maxExposureCents: 75000,
    steps: [
      {
        stepNumber: 1,
        type: 'read',
        title: 'The confirmation flow',
        content:
          'After the customer fills in the Payment Element, you call stripe.confirmPayment() on the client side. This triggers the actual charge attempt. The result can be a success, a decline, a redirect (for 3DS or bank authentication), or a network error. Your frontend needs to handle all four outcomes. On success, redirect to a confirmation page. On decline, show the error message from Stripe. For redirects, Stripe handles the flow and returns the customer to your return_url.',
      },
      {
        stepNumber: 2,
        type: 'action',
        title: 'Set up your return URL',
        instruction:
          'When calling stripe.confirmPayment(), pass a return_url where the customer gets redirected after authentication (e.g. 3DS). Set this to your order confirmation page. Stripe appends the PaymentIntent ID and status as query parameters so you can display the result.',
        checkboxLabel: 'I have configured a return_url in my confirmPayment call',
      },
      {
        stepNumber: 3,
        type: 'action',
        title: 'Handle confirmation outcomes',
        instruction:
          'Update your frontend to handle the three possible outcomes of confirmPayment(): (1) error, display error.message to the customer; (2) requires_action, Stripe handles the redirect automatically; (3) success, redirect to your confirmation page. Then check the PaymentIntent status on your confirmation page by retrieving it with the payment_intent query parameter.',
        dashboardLink: '/test/payments',
        checkboxLabel: 'My frontend handles success, decline, and redirect outcomes',
      },
      {
        stepNumber: 4,
        type: 'verify',
        title: 'Test all confirmation paths',
        checklist: [
          'Test card 4242 4242 4242 4242 results in a successful payment',
          'Test card 4000 0000 0000 0002 shows a decline error message',
          'Test card 4000 0027 6000 3184 triggers a 3DS redirect flow',
          'My confirmation page correctly reads payment_intent status from the URL',
        ],
      },
      {
        stepNumber: 5,
        type: 'fire',
        title: 'Confirmation Flow Test',
        fireTitle: 'Confirmation Flow Test',
        fireDescription:
          '15 charges testing various confirmation outcomes: successful payments, declines, and 3DS-required cards.',
        expectedCharges: 15,
        warningText:
          'Your integration should correctly handle all outcomes. Successful charges proceed, declines show errors, and 3DS challenges complete authentication.',
      },
    ],
    chargeConfig: [
      {
        count: 8,
        amountMinCents: 2000,
        amountMaxCents: 10000,
        testCard: 'pm_card_visa',
        metadata: { challenge_type: 'confirmation', scenario: 'success' },
      },
      {
        count: 4,
        amountMinCents: 1500,
        amountMaxCents: 6000,
        testCard: 'pm_card_chargeDeclined',
        metadata: { challenge_type: 'confirmation', scenario: 'declined' },
      },
      {
        count: 3,
        amountMinCents: 3000,
        amountMaxCents: 8000,
        testCard: 'pm_card_threeDSecure2Required',
        metadata: { challenge_type: 'confirmation', scenario: '3ds_required' },
      },
    ],
  },

  // MODULE 4: Webhook Verification
  {
    number: 4,
    id: 'webhook_verification',
    title: 'Webhook Verification',
    tagline: 'Trust no event until you verify its signature.',
    difficulty: 'Intermediate',
    expectedCharges: 15,
    maxExposureCents: 90000,
    steps: [
      {
        stepNumber: 1,
        type: 'read',
        title: 'Why webhooks matter',
        content:
          'Client-side confirmation isn\'t enough on its own. Network issues, browser crashes, or mobile app backgrounding can prevent your frontend from receiving the result. Webhooks are your source of truth. Stripe sends a signed HTTP POST to your server for every event. The payment_intent.succeeded webhook is how you should fulfill orders, not the client-side callback. Always verify the webhook signature using your endpoint signing secret (whsec_...) to make sure the event is authentic.',
      },
      {
        stepNumber: 2,
        type: 'action',
        title: 'Create a webhook endpoint',
        instruction:
          'Open your Stripe Dashboard and navigate to Developers > Webhooks. Click "Add endpoint" and set the URL to your server\'s webhook route (e.g. https://yoursite.com/api/webhooks/stripe). Subscribe to at least: payment_intent.succeeded, payment_intent.payment_failed, and charge.refunded.',
        dashboardLink: '/test/webhooks',
        checkboxLabel: 'I have created a webhook endpoint in the Dashboard',
      },
      {
        stepNumber: 3,
        type: 'action',
        title: 'Implement signature verification',
        instruction:
          'In your webhook handler, call stripe.webhooks.constructEvent(body, sig, endpointSecret) to verify the signature. The body needs to be the raw request body (not parsed JSON). The sig is the Stripe-Signature header, and the endpointSecret is your webhook signing secret (whsec_...). If verification fails, return a 400 status code.',
        checkboxLabel: 'My webhook handler verifies signatures with constructEvent()',
      },
      {
        stepNumber: 4,
        type: 'verify',
        title: 'Verify webhook handling',
        checklist: [
          'My webhook endpoint returns 200 for valid events',
          'My webhook endpoint returns 400 for invalid signatures',
          'I handle payment_intent.succeeded by fulfilling the order',
          'I handle payment_intent.payment_failed by notifying the customer',
          'My handler is idempotent (processing the same event twice is safe)',
        ],
      },
      {
        stepNumber: 5,
        type: 'fire',
        title: 'Webhook Delivery Test',
        fireTitle: 'Webhook Delivery Test',
        fireDescription:
          '15 charges that will each trigger webhook events. Your endpoint must receive, verify, and process them correctly.',
        expectedCharges: 15,
        warningText:
          'Check your webhook logs in the Dashboard after the test. All events should show a 200 response from your endpoint.',
      },
    ],
    chargeConfig: [
      {
        count: 10,
        amountMinCents: 3000,
        amountMaxCents: 12000,
        testCard: 'pm_card_visa',
        metadata: { challenge_type: 'webhook_verify', scenario: 'success' },
      },
      {
        count: 5,
        amountMinCents: 2000,
        amountMaxCents: 8000,
        testCard: 'pm_card_chargeDeclined',
        metadata: { challenge_type: 'webhook_verify', scenario: 'failed' },
      },
    ],
  },

  // MODULE 5: Handle Declines & 3DS
  {
    number: 5,
    id: 'handle_declines_3ds',
    title: 'Handle Declines & 3DS',
    tagline: 'Not every payment succeeds. Handle failures like a pro.',
    difficulty: 'Advanced',
    expectedCharges: 20,
    maxExposureCents: 120000,
    steps: [
      {
        stepNumber: 1,
        type: 'read',
        title: 'Decline codes and 3D Secure',
        content:
          'Payments fail for many reasons: insufficient funds, expired cards, incorrect CVC, fraud blocks, and more. Each failure returns a specific decline code (e.g. "insufficient_funds", "card_declined", "expired_card"). Your integration needs to interpret these codes and show actionable messages to the customer. Some cards also require 3D Secure authentication, and if the customer fails or abandons 3DS, the payment stays incomplete. Use test cards to simulate every scenario: 4000 0000 0000 9995 (insufficient funds), 4000 0000 0000 0069 (expired card), 4000 0027 6000 3184 (3DS required).',
      },
      {
        stepNumber: 2,
        type: 'action',
        title: 'Map decline codes to user-friendly messages',
        instruction:
          'In your payment error handler, map Stripe decline codes to human-readable messages. For example: "insufficient_funds" → "Your card doesn\'t have enough funds. Try a different card." "expired_card" → "Your card has expired. Please update your card details." "incorrect_cvc" → "The CVC you entered is incorrect. Double-check and try again."',
        checkboxLabel: 'I map at least 3 decline codes to user-friendly messages',
      },
      {
        stepNumber: 3,
        type: 'action',
        title: 'Handle 3D Secure challenges',
        instruction:
          'Make sure your integration handles the 3DS flow end-to-end. When confirmPayment() returns a requires_action status, Stripe.js automatically opens the 3DS modal or redirects the customer. After authentication, the payment either succeeds or fails. Test this with card 4000 0027 6000 3184.',
        dashboardLink: '/test/payments',
        checkboxLabel: 'I have tested the 3DS authentication flow with a test card',
      },
      {
        stepNumber: 4,
        type: 'verify',
        title: 'Verify decline handling',
        checklist: [
          'Insufficient funds (4000 0000 0000 9995) shows a clear error message',
          'Expired card (4000 0000 0000 0069) shows a clear error message',
          '3DS required (4000 0027 6000 3184) opens the authentication challenge',
          'Generic decline (4000 0000 0000 0002) is handled gracefully',
          'Successful 3DS authentication results in a completed payment',
        ],
      },
      {
        stepNumber: 5,
        type: 'fire',
        title: 'Decline & 3DS Gauntlet',
        fireTitle: 'Decline & 3DS Gauntlet',
        fireDescription:
          '20 charges using a mix of successful cards, various decline scenarios, and 3DS-required cards. Your integration must handle every outcome.',
        expectedCharges: 20,
        warningText:
          'Expect a wide mix of outcomes. Successful charges should complete, declines should show errors, and 3DS challenges should authenticate.',
      },
    ],
    chargeConfig: [
      {
        count: 8,
        amountMinCents: 2000,
        amountMaxCents: 10000,
        testCard: 'pm_card_visa',
        metadata: { challenge_type: 'decline_3ds', scenario: 'success' },
      },
      {
        count: 4,
        amountMinCents: 1500,
        amountMaxCents: 6000,
        testCard: 'pm_card_chargeDeclinedInsufficientFunds',
        metadata: { challenge_type: 'decline_3ds', scenario: 'insufficient_funds' },
      },
      {
        count: 3,
        amountMinCents: 2000,
        amountMaxCents: 8000,
        testCard: 'pm_card_chargeDeclinedExpiredCard',
        metadata: { challenge_type: 'decline_3ds', scenario: 'expired_card' },
      },
      {
        count: 5,
        amountMinCents: 3000,
        amountMaxCents: 12000,
        testCard: 'pm_card_threeDSecure2Required',
        metadata: { challenge_type: 'decline_3ds', scenario: '3ds_required' },
      },
    ],
  },

  // MODULE 6: Full Checkout Flow
  {
    number: 6,
    id: 'full_checkout_flow',
    title: 'Full Checkout Flow',
    tagline: 'Everything together. Build a production-ready checkout.',
    difficulty: 'Expert',
    expectedCharges: 30,
    maxExposureCents: 200000,
    steps: [
      {
        stepNumber: 1,
        type: 'read',
        title: 'Putting it all together',
        content:
          'A production-ready checkout combines everything from Modules 1 through 5: server-side PaymentIntent creation, the Payment Element for secure input, client-side confirmation with return_url handling, webhook-based fulfillment, comprehensive decline handling, and 3DS support. In this final challenge, your integration gets tested with a realistic mix of payment scenarios including successes, declines, 3DS challenges, and edge cases. The goal is a checkout that handles every scenario gracefully.',
      },
      {
        stepNumber: 2,
        type: 'action',
        title: 'Review your complete integration',
        instruction:
          'Walk through your entire payment flow end-to-end: (1) your server creates a PaymentIntent, (2) the frontend mounts the Payment Element with the client_secret, (3) the customer fills in their card details, (4) the frontend calls confirmPayment() with a return_url, (5) your webhook receives payment_intent.succeeded and fulfills the order, (6) the confirmation page reads the status from the URL.',
        dashboardLink: '/test/payments',
        checkboxLabel: 'I have walked through my complete payment flow',
      },
      {
        stepNumber: 3,
        type: 'action',
        title: 'Check your webhook endpoint health',
        instruction:
          'Navigate to Developers > Webhooks and check your endpoint\'s recent deliveries. Make sure there are no persistent failures (4xx or 5xx responses). Every event should show a 200 status. If you see failures, check your server logs and fix the issue before moving on.',
        dashboardLink: '/test/webhooks',
        checkboxLabel: 'My webhook endpoint shows healthy delivery status',
      },
      {
        stepNumber: 4,
        type: 'verify',
        title: 'Production readiness checklist',
        checklist: [
          'PaymentIntents are created server-side with amount, currency, and automatic_payment_methods',
          'The Payment Element renders and collects card details securely',
          'confirmPayment() passes a return_url for redirect-based flows',
          'Decline errors are caught and displayed as user-friendly messages',
          '3D Secure authentication completes without breaking the flow',
          'Webhooks are verified with constructEvent() and handler is idempotent',
          'Confirmation page retrieves PaymentIntent status from URL parameters',
        ],
      },
      {
        stepNumber: 5,
        type: 'fire',
        title: 'FINAL CHALLENGE: Full Checkout Gauntlet',
        fireTitle: 'FINAL CHALLENGE: Full Checkout Gauntlet',
        fireDescription:
          '30 charges simulating a realistic day of transactions: successful payments, various decline types, 3DS challenges, and edge cases, all hitting your checkout at once.',
        expectedCharges: 30,
        warningText:
          'This is the final test of your integration. Handle every outcome correctly. Successful charges should complete, declines should fail gracefully, and 3DS should authenticate.',
      },
    ],
    chargeConfig: [
      {
        count: 12,
        amountMinCents: 2000,
        amountMaxCents: 15000,
        testCard: 'pm_card_visa',
        metadata: { challenge_type: 'full_checkout', scenario: 'success' },
      },
      {
        count: 4,
        amountMinCents: 1000,
        amountMaxCents: 5000,
        testCard: 'pm_card_chargeDeclined',
        metadata: { challenge_type: 'full_checkout', scenario: 'generic_decline' },
      },
      {
        count: 3,
        amountMinCents: 1500,
        amountMaxCents: 8000,
        testCard: 'pm_card_chargeDeclinedInsufficientFunds',
        metadata: { challenge_type: 'full_checkout', scenario: 'insufficient_funds' },
      },
      {
        count: 2,
        amountMinCents: 2000,
        amountMaxCents: 6000,
        testCard: 'pm_card_chargeDeclinedExpiredCard',
        metadata: { challenge_type: 'full_checkout', scenario: 'expired_card' },
      },
      {
        count: 5,
        amountMinCents: 3000,
        amountMaxCents: 12000,
        testCard: 'pm_card_threeDSecure2Required',
        metadata: { challenge_type: 'full_checkout', scenario: '3ds_required' },
      },
      {
        count: 4,
        amountMinCents: 5000,
        amountMaxCents: 20000,
        testCard: 'pm_card_visa',
        metadata: { challenge_type: 'full_checkout', scenario: 'high_value_success' },
      },
    ],
  },
]
