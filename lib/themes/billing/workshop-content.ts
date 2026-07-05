export type QuizOption = { id: string; text: string }
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

export const BILLING_MODULES: WorkshopModule[] = [
  {
    id: 'billing-fundamentals',
    order: 1,
    title: 'Billing Fundamentals',
    tagline: 'Master the building blocks of Stripe Billing',
    briefing: [
      'Stripe Billing is built on a hierarchy of objects: Products, Prices, Subscriptions, and Invoices.',
      'Products represent what you sell, Prices define how much and how often to charge, Subscriptions manage the recurring relationship, and Invoices track each billing cycle.',
    ],
    objectives: [
      'Understand the relationship between Products and Prices',
      'Know the difference between recurring and one-time Prices',
      'Identify how Subscriptions and Invoices connect',
    ],
    points: 100,
    questions: [
      {
        id: 'bf-q1',
        prompt: 'In Stripe Billing, what is the relationship between a Product and a Price?',
        options: [
          { id: 'a', text: 'A Product can only have one Price attached to it' },
          { id: 'b', text: 'A Product can have multiple Prices (e.g. monthly, yearly, different currencies)' },
          { id: 'c', text: 'Prices exist independently and are not linked to Products' },
          { id: 'd', text: 'A Price can belong to multiple Products simultaneously' },
        ],
        correctOptionId: 'b',
        explanation: 'A single Product can have many Prices, allowing you to offer different billing intervals, currencies, or tiers for the same product.',
      },
      {
        id: 'bf-q2',
        prompt: 'Which pricing model charges customers based on the quantity of units they consume each period?',
        options: [
          { id: 'a', text: 'Flat-rate pricing' },
          { id: 'b', text: 'Tiered pricing' },
          { id: 'c', text: 'Metered (usage-based) pricing' },
          { id: 'd', text: 'Package pricing' },
        ],
        correctOptionId: 'c',
        explanation: 'Metered pricing charges based on reported usage during the billing period, with usage records submitted via the API.',
      },
      {
        id: 'bf-q3',
        prompt: 'When a Subscription is created, what does Stripe automatically generate?',
        options: [
          { id: 'a', text: 'A PaymentIntent only' },
          { id: 'b', text: 'An Invoice that attempts payment collection' },
          { id: 'c', text: 'A Charge object with no invoice' },
          { id: 'd', text: 'A SetupIntent for future payments' },
        ],
        correctOptionId: 'b',
        explanation: 'Stripe generates an Invoice for each billing cycle, which then creates a PaymentIntent to collect payment from the customer.',
      },
    ],
  },
  {
    id: 'subscription-lifecycle',
    order: 2,
    title: 'Subscription Lifecycle',
    tagline: 'Navigate status transitions, trials, and cancellations',
    briefing: [
      'Subscriptions move through several statuses: incomplete, active, past_due, canceled, and unpaid.',
      'Trials allow customers to use a service before being charged, and cancellation can happen immediately or at period end.',
    ],
    objectives: [
      'Understand all subscription statuses and their transitions',
      'Configure free trials correctly',
      'Handle cancellation scenarios gracefully',
    ],
    points: 120,
    questions: [
      {
        id: 'sl-q1',
        prompt: 'What status does a Subscription enter if the first payment fails during creation?',
        options: [
          { id: 'a', text: 'past_due' },
          { id: 'b', text: 'canceled' },
          { id: 'c', text: 'incomplete' },
          { id: 'd', text: 'unpaid' },
        ],
        correctOptionId: 'c',
        explanation: 'A subscription enters "incomplete" if the initial payment fails, giving you 23 hours to collect payment before it becomes "incomplete_expired".',
      },
      {
        id: 'sl-q2',
        prompt: 'When setting up a free trial on a Subscription, what happens at the trial end?',
        options: [
          { id: 'a', text: 'The subscription is automatically canceled' },
          { id: 'b', text: 'Stripe generates an invoice and attempts to charge the customer' },
          { id: 'c', text: 'The customer must manually reactivate the subscription' },
          { id: 'd', text: 'The subscription pauses until the customer confirms' },
        ],
        correctOptionId: 'b',
        explanation: 'At trial end, Stripe creates an invoice for the first regular billing period and attempts payment using the customer\'s payment method on file.',
      },
      {
        id: 'sl-q3',
        prompt: 'What is the difference between canceling a subscription immediately vs. at period end?',
        options: [
          { id: 'a', text: 'There is no difference; both stop access immediately' },
          { id: 'b', text: 'At period end keeps the subscription active until the current period expires; immediate cancellation stops it now' },
          { id: 'c', text: 'Immediate cancellation triggers a refund; at period end does not' },
          { id: 'd', text: 'At period end is only available for annual subscriptions' },
        ],
        correctOptionId: 'b',
        explanation: 'Canceling at period end sets cancel_at_period_end=true, keeping the subscription active until the paid period expires, while immediate cancellation changes the status to canceled right away.',
      },
    ],
  },
  {
    id: 'invoices-payments',
    order: 3,
    title: 'Invoices & Payments',
    tagline: 'Understand invoice finalization, collection, and dunning',
    briefing: [
      'Invoices in Stripe go through a lifecycle: draft → open → paid (or void/uncollectible).',
      'Dunning is the process of retrying failed payments using Smart Retries and email reminders to recover revenue.',
    ],
    objectives: [
      'Explain the invoice lifecycle and statuses',
      'Configure payment collection behavior',
      'Understand dunning and retry logic',
    ],
    points: 120,
    questions: [
      {
        id: 'ip-q1',
        prompt: 'What is the purpose of the "draft" status on a Stripe Invoice?',
        options: [
          { id: 'a', text: 'It means payment has already been attempted and failed' },
          { id: 'b', text: 'It allows you to add/remove line items before the invoice is finalized and sent' },
          { id: 'c', text: 'It indicates the invoice is waiting for customer approval' },
          { id: 'd', text: 'It means the invoice is a recurring template' },
        ],
        correctOptionId: 'b',
        explanation: 'Draft invoices can be edited freely—adding items, coupons, or metadata—before being finalized, at which point they become immutable and payment is attempted.',
      },
      {
        id: 'ip-q2',
        prompt: 'Which collection_method on a Subscription Invoice sends an invoice to the customer to pay manually?',
        options: [
          { id: 'a', text: 'charge_automatically' },
          { id: 'b', text: 'send_invoice' },
          { id: 'c', text: 'manual_payment' },
          { id: 'd', text: 'customer_action' },
        ],
        correctOptionId: 'b',
        explanation: 'The send_invoice collection method emails the invoice to the customer with a link to pay, rather than automatically charging their payment method.',
      },
      {
        id: 'ip-q3',
        prompt: 'In Stripe\'s dunning configuration, what happens after all retry attempts are exhausted?',
        options: [
          { id: 'a', text: 'The subscription is always immediately canceled' },
          { id: 'b', text: 'The invoice is marked void and no further action is taken' },
          { id: 'c', text: 'The subscription transitions based on your configured setting: cancel, mark unpaid, or leave past_due' },
          { id: 'd', text: 'Stripe automatically issues a refund' },
        ],
        correctOptionId: 'c',
        explanation: 'You configure the end-of-dunning behavior in subscription settings—the subscription can be canceled, marked as unpaid, or left in past_due status.',
      },
    ],
  },
  {
    id: 'customer-portal',
    order: 4,
    title: 'Customer Portal & Self-Service',
    tagline: 'Empower customers to manage their own billing',
    briefing: [
      'The Stripe Customer Portal is a prebuilt, hosted page that lets customers manage subscriptions, update payment methods, and view invoices.',
      'You configure what customers can do via Portal Settings, then create portal sessions to redirect them.',
    ],
    objectives: [
      'Configure the Customer Portal for plan changes',
      'Understand proration behavior during upgrades/downgrades',
    ],
    points: 140,
    questions: [
      {
        id: 'cp-q1',
        prompt: 'Which of the following can customers do in the Stripe Customer Portal by default?',
        options: [
          { id: 'a', text: 'Create new subscriptions to additional products' },
          { id: 'b', text: 'Update their payment method and view invoice history' },
          { id: 'c', text: 'Issue refunds to themselves' },
          { id: 'd', text: 'Modify product prices' },
        ],
        correctOptionId: 'b',
        explanation: 'The Customer Portal allows customers to update payment methods, view/download invoices, and manage existing subscriptions—but not create new ones or issue refunds.',
      },
      {
        id: 'cp-q2',
        prompt: 'When a customer upgrades their plan mid-cycle through the portal, how does Stripe handle the price difference?',
        options: [
          { id: 'a', text: 'The customer is charged the full new price starting next period only' },
          { id: 'b', text: 'Stripe creates a prorated invoice crediting unused time and charging for the new plan\'s remaining time' },
          { id: 'c', text: 'The upgrade is queued until the next billing period' },
          { id: 'd', text: 'The customer must pay both the old and new price for the current period' },
        ],
        correctOptionId: 'b',
        explanation: 'By default, Stripe prorates plan changes—crediting the customer for unused time on the old plan and charging the difference for the new plan.',
      },
    ],
  },
  {
    id: 'revenue-recovery-analytics',
    order: 5,
    title: 'Revenue Recovery & Analytics',
    tagline: 'Recover failed payments and track key metrics',
    briefing: [
      'Smart Retries use machine learning to determine the optimal time to retry failed payments, significantly improving recovery rates.',
      'Key billing metrics include MRR (Monthly Recurring Revenue), churn rate, and ARPU (Average Revenue Per User).',
    ],
    objectives: [
      'Understand how Smart Retries work',
      'Calculate and interpret MRR and churn metrics',
      'Identify strategies to reduce involuntary churn',
    ],
    points: 160,
    questions: [
      {
        id: 'rr-q1',
        prompt: 'How do Stripe Smart Retries differ from a fixed retry schedule?',
        options: [
          { id: 'a', text: 'They retry exactly every 24 hours for 7 days' },
          { id: 'b', text: 'They use machine learning to pick the optimal retry time based on signals like card network data and time of day' },
          { id: 'c', text: 'They only retry once and then give up' },
          { id: 'd', text: 'They require the customer to manually approve each retry attempt' },
        ],
        correctOptionId: 'b',
        explanation: 'Smart Retries analyze signals across the Stripe network to choose the best time to retry, recovering more revenue than fixed schedules.',
      },
      {
        id: 'rr-q2',
        prompt: 'What does MRR (Monthly Recurring Revenue) represent in Stripe Billing?',
        options: [
          { id: 'a', text: 'Total revenue including one-time charges' },
          { id: 'b', text: 'The normalized monthly value of all active recurring subscriptions' },
          { id: 'c', text: 'Revenue from the previous month only' },
          { id: 'd', text: 'Projected revenue for the next 12 months divided by 12' },
        ],
        correctOptionId: 'b',
        explanation: 'MRR normalizes all recurring subscription revenue to a monthly figure—annual plans are divided by 12, weekly plans multiplied by ~4.33.',
      },
      {
        id: 'rr-q3',
        prompt: 'What is "involuntary churn" in the context of subscription billing?',
        options: [
          { id: 'a', text: 'Customers who actively decide to cancel their subscriptions' },
          { id: 'b', text: 'Revenue lost due to failed payments and expired cards rather than customer choice' },
          { id: 'c', text: 'Customers who downgrade to a lower-priced plan' },
          { id: 'd', text: 'Free trial users who never convert to paid plans' },
        ],
        correctOptionId: 'b',
        explanation: 'Involuntary churn occurs when subscriptions end due to payment failures (expired cards, insufficient funds) rather than deliberate cancellation by the customer.',
      },
    ],
  },
]

export const BILLING_TOTAL_SCORE = BILLING_MODULES.reduce((sum, m) => sum + m.points, 0)
