export type QuizOption = {
  id: string
  text: string
}

export type QuizQuestion = {
  id: string
  prompt: string
  options: QuizOption[]
  correctOptionId: string
  explanation: string
}

export type WorkshopModule = {
  id: string
  order: number
  title: string
  tagline: string
  briefing: string[]
  objectives: string[]
  points: number
  questions: QuizQuestion[]
}

export const ONLINE_PAYMENTS_MODULES: WorkshopModule[] = [
  {
    id: 'payment-fundamentals',
    order: 1,
    title: 'Payment Fundamentals',
    tagline: 'How money moves from customer to merchant on the internet',
    briefing: [
      'Every online payment involves a chain of actors: the customer, the merchant, the payment processor (Stripe), the card network (Visa, Mastercard), and the issuing bank.',
      'When a customer submits their card details, Stripe tokenises the sensitive data, creates a charge request, and routes it through the appropriate network to the issuing bank for authorization.',
      'Understanding this flow is key to debugging failed payments, optimising conversion, and building a solid checkout experience.',
    ],
    objectives: [
      'Describe the lifecycle of an online payment from card entry to settlement',
      'Identify the key actors in the payment flow',
      'Understand the difference between authorization and capture',
    ],
    points: 100,
    questions: [
      {
        id: 'q1',
        prompt:
          'What happens first when a customer submits their card details through Stripe?',
        options: [
          { id: 'a', text: 'The funds are immediately transferred to the merchant' },
          { id: 'b', text: 'Stripe tokenises the card data and sends an authorization request to the issuing bank' },
          { id: 'c', text: 'The card network charges a processing fee' },
          { id: 'd', text: 'A refund hold is placed on the card' },
        ],
        correctOptionId: 'b',
        explanation:
          'Stripe first tokenises sensitive card data, then sends an authorization request through the card network to the issuing bank.',
      },
      {
        id: 'q2',
        prompt:
          'What is the difference between authorization and capture in a payment flow?',
        options: [
          { id: 'a', text: 'They are the same thing' },
          { id: 'b', text: 'Authorization verifies the card is valid; capture actually moves the funds' },
          { id: 'c', text: 'Authorization is for credit cards; capture is for debit cards' },
          { id: 'd', text: 'Capture happens before authorization' },
        ],
        correctOptionId: 'b',
        explanation:
          'Authorization confirms the cardholder has sufficient funds and places a hold; capture triggers the actual transfer of funds.',
      },
      {
        id: 'q3',
        prompt: 'Who is NOT involved in a typical card payment?',
        options: [
          { id: 'a', text: 'Issuing bank' },
          { id: 'b', text: 'Card network (e.g. Visa)' },
          { id: 'c', text: 'DNS registrar' },
          { id: 'd', text: 'Acquiring bank' },
        ],
        correctOptionId: 'c',
        explanation:
          'A DNS registrar manages domain names and is not part of the payment processing chain.',
      },
    ],
  },
  {
    id: 'payment-intents',
    order: 2,
    title: 'PaymentIntents & Confirmation',
    tagline: 'The API at the heart of every Stripe payment',
    briefing: [
      'The PaymentIntent object represents a single payment attempt in Stripe. It tracks the lifecycle from creation through confirmation to completion or failure.',
      'A PaymentIntent goes through states: requires_payment_method → requires_confirmation → requires_action (if 3DS) → processing → succeeded (or requires_payment_method on failure).',
      'Using PaymentIntents instead of the legacy Charges API gives you built-in support for SCA, 3D Secure, asynchronous payment methods, and automatic retries. It\'s the way to go for any new integration.',
    ],
    objectives: [
      'Create a PaymentIntent with the correct parameters',
      'Understand the PaymentIntent state machine',
      'Know when to confirm on the client vs the server',
    ],
    points: 120,
    questions: [
      {
        id: 'q1',
        prompt: 'Which parameter is required when creating a PaymentIntent?',
        options: [
          { id: 'a', text: 'customer_email' },
          { id: 'b', text: 'amount and currency' },
          { id: 'c', text: 'payment_method and return_url' },
          { id: 'd', text: 'description and statement_descriptor' },
        ],
        correctOptionId: 'b',
        explanation:
          'A PaymentIntent requires at minimum an amount (in smallest currency unit) and a currency code.',
      },
      {
        id: 'q2',
        prompt:
          'A PaymentIntent is in the "requires_action" status. What does this typically mean?',
        options: [
          { id: 'a', text: 'The payment has failed permanently' },
          { id: 'b', text: 'The customer needs to complete an additional step like 3D Secure authentication' },
          { id: 'c', text: 'Stripe is waiting for the merchant to ship the product' },
          { id: 'd', text: 'The refund is being processed' },
        ],
        correctOptionId: 'b',
        explanation:
          'The requires_action status indicates the customer must complete an additional authentication step, most commonly 3D Secure.',
      },
      {
        id: 'q3',
        prompt:
          'What is the client_secret on a PaymentIntent used for?',
        options: [
          { id: 'a', text: 'Authenticating server-side API calls' },
          { id: 'b', text: 'Encrypting the card number for storage' },
          { id: 'c', text: 'Allowing the frontend to confirm the payment without exposing the secret key' },
          { id: 'd', text: 'Generating webhook signatures' },
        ],
        correctOptionId: 'c',
        explanation:
          'The client_secret lets the frontend SDK confirm the PaymentIntent securely without needing the secret API key.',
      },
    ],
  },
  {
    id: 'webhooks-events',
    order: 3,
    title: 'Webhooks & Event Handling',
    tagline: 'Reacting to payment events in real time',
    briefing: [
      'Webhooks are HTTP callbacks that Stripe sends to your server when events occur: payments succeed, fail, get refunded, disputed, and more.',
      'Because network requests can fail, Stripe retries webhook deliveries for up to 3 days. Your endpoint needs to be idempotent, meaning processing the same event twice shouldn\'t cause duplicate side effects.',
      'Always verify webhook signatures using your endpoint secret to make sure events genuinely come from Stripe and haven\'t been tampered with.',
    ],
    objectives: [
      'Set up a webhook endpoint and handle events',
      'Verify webhook signatures for security',
      'Build idempotent event handlers',
    ],
    points: 120,
    questions: [
      {
        id: 'q1',
        prompt: 'Why must you verify the signature on incoming webhooks?',
        options: [
          { id: 'a', text: 'To speed up event processing' },
          { id: 'b', text: 'To confirm the event genuinely came from Stripe and was not tampered with' },
          { id: 'c', text: 'To decrypt the event payload' },
          { id: 'd', text: 'Stripe rejects the webhook if you do not verify it' },
        ],
        correctOptionId: 'b',
        explanation:
          'Signature verification ensures the event payload was sent by Stripe and has not been modified in transit.',
      },
      {
        id: 'q2',
        prompt: 'What does it mean for a webhook handler to be idempotent?',
        options: [
          { id: 'a', text: 'It processes events in parallel' },
          { id: 'b', text: 'Processing the same event multiple times produces the same result as processing it once' },
          { id: 'c', text: 'It only handles one event type' },
          { id: 'd', text: 'It responds within 100 milliseconds' },
        ],
        correctOptionId: 'b',
        explanation:
          'Idempotency means duplicate deliveries of the same event do not cause duplicate side effects like double-fulfilling an order.',
      },
      {
        id: 'q3',
        prompt:
          'Which HTTP status code should your webhook endpoint return to acknowledge successful receipt?',
        options: [
          { id: 'a', text: '301 Redirect' },
          { id: 'b', text: '200 OK' },
          { id: 'c', text: '401 Unauthorized' },
          { id: 'd', text: '500 Internal Server Error' },
        ],
        correctOptionId: 'b',
        explanation:
          'Returning a 2xx status code tells Stripe the event was received successfully; any other code triggers a retry.',
      },
    ],
  },
  {
    id: 'payment-methods-auth',
    order: 4,
    title: 'Payment Methods & Authentication',
    tagline: 'Cards, wallets, 3DS, and Strong Customer Authentication',
    briefing: [
      'Stripe supports dozens of payment methods: cards, wallets (Apple Pay, Google Pay), bank debits, buy-now-pay-later, and more. The Payment Element automatically renders the right UI for each.',
      '3D Secure (3DS) adds a cardholder verification step. When required (e.g. under European SCA regulations), the PaymentIntent moves to requires_action and the customer must authenticate with their bank.',
      'Strong Customer Authentication (SCA) is a European regulation requiring two-factor authentication for most online payments. Stripe handles SCA compliance automatically when you use PaymentIntents and the Payment Element.',
    ],
    objectives: [
      'Understand the difference between payment method types',
      'Know when and why 3D Secure is triggered',
      'Explain how SCA affects payment flows',
    ],
    points: 140,
    questions: [
      {
        id: 'q1',
        prompt: 'What Stripe test card number triggers a 3D Secure authentication flow?',
        options: [
          { id: 'a', text: '4242 4242 4242 4242' },
          { id: 'b', text: '4000 0027 6000 3184' },
          { id: 'c', text: '4000 0000 0000 0002' },
          { id: 'd', text: '5555 5555 5555 4444' },
        ],
        correctOptionId: 'b',
        explanation:
          '4000 0027 6000 3184 is Stripe\'s test card that requires 3D Secure authentication on every transaction.',
      },
      {
        id: 'q2',
        prompt: 'What does SCA (Strong Customer Authentication) require?',
        options: [
          { id: 'a', text: 'The customer must provide their Social Security number' },
          { id: 'b', text: 'Two independent authentication factors from: knowledge, possession, or inherence' },
          { id: 'c', text: 'The merchant must have an SSL certificate' },
          { id: 'd', text: 'Payments must be under €50' },
        ],
        correctOptionId: 'b',
        explanation:
          'SCA requires two of three factors: something the customer knows (password), has (phone), or is (biometric).',
      },
      {
        id: 'q3',
        prompt:
          'What advantage does the Payment Element have over manually building card forms?',
        options: [
          { id: 'a', text: 'It is free to use' },
          { id: 'b', text: 'It automatically handles multiple payment methods, 3DS, and SCA compliance' },
          { id: 'c', text: 'It bypasses PCI compliance requirements entirely' },
          { id: 'd', text: 'It guarantees a 100% authorization rate' },
        ],
        correctOptionId: 'b',
        explanation:
          'The Payment Element dynamically renders supported payment methods and handles authentication flows like 3DS and SCA out of the box.',
      },
    ],
  },
  {
    id: 'testing-go-live',
    order: 5,
    title: 'Testing & Going Live',
    tagline: 'From test mode to production with confidence',
    briefing: [
      'Stripe provides a full test mode environment with test API keys, test card numbers, and test clocks. Every integration should be thoroughly tested before going live.',
      'Test cards simulate different scenarios: successful payments, declines, authentication required, specific error codes, and more. Use them to verify every edge case in your flow.',
      'Going live requires switching to live API keys, verifying your webhook endpoints handle production events, and ensuring your error handling covers all decline codes and failure modes.',
    ],
    objectives: [
      'Use test cards to simulate various payment outcomes',
      'Know the key differences between test and live mode',
      'Prepare a checklist for production readiness',
    ],
    points: 160,
    questions: [
      {
        id: 'q1',
        prompt:
          'What happens when you use the test card 4000 0000 0000 9995 in test mode?',
        options: [
          { id: 'a', text: 'The payment succeeds normally' },
          { id: 'b', text: 'The payment is declined with an insufficient_funds error' },
          { id: 'c', text: 'The payment triggers 3D Secure' },
          { id: 'd', text: 'Stripe sends a dispute webhook' },
        ],
        correctOptionId: 'b',
        explanation:
          'The test card 4000 0000 0000 9995 simulates a decline with the insufficient_funds decline code.',
      },
      {
        id: 'q2',
        prompt:
          'What\'s critical to verify before switching from test mode to live mode?',
        options: [
          { id: 'a', text: 'Your website uses a .com domain' },
          { id: 'b', text: 'Webhook endpoints handle events idempotently and return 2xx status codes' },
          { id: 'c', text: 'All payments use the same currency' },
          { id: 'd', text: 'Your Stripe Dashboard is in dark mode' },
        ],
        correctOptionId: 'b',
        explanation:
          'Production webhook endpoints must be reliable, idempotent, and return success codes to avoid missed events and duplicate processing.',
      },
    ],
  },
]

export const ONLINE_PAYMENTS_TOTAL_SCORE = ONLINE_PAYMENTS_MODULES.reduce(
  (sum, m) => sum + m.points,
  0
)
