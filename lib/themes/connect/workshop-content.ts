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

export const CONNECT_MODULES: WorkshopModule[] = [
  {
    id: 'connect-mental-model',
    order: 1,
    title: 'The Connect Mental Model',
    tagline:
      'Understand the three-party model and how Connect differs from standard Stripe',
    briefing: [
      'Connect introduces a three-party relationship between your platform, your connected accounts (sellers/providers), and Stripe as infrastructure.',
      'The charge type and account type you choose determine statement descriptors, dispute liability, and fund flow.',
    ],
    objectives: [
      'Explain the three-party Connect model',
      'Distinguish platform-level from account-level API calls',
      'Identify the four charge types and their fund flow differences',
    ],
    points: 100,
    questions: [
      {
        id: 'cm-q1',
        prompt:
          'In the Connect three-party model, what does the Stripe-Account header specify?',
        options: [
          { id: 'a', text: "The platform's own account ID" },
          {
            id: 'b',
            text: 'Which connected account the API call is acting on behalf of',
          },
          { id: 'c', text: "The customer's payment method" },
          { id: 'd', text: 'The webhook endpoint to notify' },
        ],
        correctOptionId: 'b',
        explanation:
          "The Stripe-Account header tells Stripe which connected account you're acting on behalf of. Your platform uses its own API key plus this header to make calls in the context of a specific connected account.",
      },
      {
        id: 'cm-q2',
        prompt:
          "Which charge type results in the platform's name appearing on the cardholder's statement?",
        options: [
          { id: 'a', text: 'Direct charges' },
          { id: 'b', text: 'Destination charges' },
          { id: 'c', text: 'Transfer-only' },
          { id: 'd', text: 'All charge types show the platform name' },
        ],
        correctOptionId: 'b',
        explanation:
          "Destination charges are created on the platform account with a connected account as the destination. Since the platform is the merchant of record, the platform's name appears on the statement.",
      },
      {
        id: 'cm-q3',
        prompt: 'What separates Connect from a standard Stripe integration?',
        options: [
          { id: 'a', text: 'Connect uses a different API version' },
          {
            id: 'b',
            text: 'Connect separates who processes the payment from who receives the funds',
          },
          {
            id: 'c',
            text: 'Connect only works with subscription billing',
          },
          { id: 'd', text: 'Connect requires a different SDK' },
        ],
        correctOptionId: 'b',
        explanation:
          'The key insight of Connect is separating payment processing from fund distribution, enabling money to flow through your platform to multiple parties in a single transaction.',
      },
    ],
  },
  {
    id: 'account-types',
    order: 2,
    title: 'Choosing Your Account Type',
    tagline:
      'Evaluate Standard, Express, and Custom accounts for your platform',
    briefing: [
      'Each account type represents a different contract between your platform, your users, and Stripe.',
      'The choice determines who handles KYC, who owns the Dashboard experience, and how much compliance infrastructure you need to build.',
    ],
    objectives: [
      'Compare compliance burden across account types',
      'Identify when Standard accounts are the right choice',
      'Understand Custom account responsibilities',
    ],
    points: 100,
    questions: [
      {
        id: 'at-q1',
        prompt:
          'Which account type gives the platform zero compliance burden for identity verification?',
        options: [
          { id: 'a', text: 'Custom' },
          { id: 'b', text: 'Express' },
          { id: 'c', text: 'Standard' },
          {
            id: 'd',
            text: 'All account types require platform-managed KYC',
          },
        ],
        correctOptionId: 'c',
        explanation:
          "Standard accounts have a full, independent Stripe relationship. The connected account completes Stripe's own onboarding and Stripe handles all KYC and compliance directly.",
      },
      {
        id: 'at-q2',
        prompt:
          'What can Express account holders do in their Express Dashboard?',
        options: [
          {
            id: 'a',
            text: 'Manage their full Stripe integration and API keys',
          },
          {
            id: 'b',
            text: 'View payouts, update bank details, and download tax forms',
          },
          { id: 'c', text: 'Configure Radar fraud rules' },
          { id: 'd', text: 'Create charges and refunds directly' },
        ],
        correctOptionId: 'b',
        explanation:
          "The Express Dashboard is intentionally limited. Account holders can manage payouts, update their bank account, and access tax documents, but they can't see full charge details or manage the Stripe integration.",
      },
      {
        id: 'at-q3',
        prompt:
          'Why is Custom account type selection described as an "architectural decision that\'s difficult to change"?',
        options: [
          { id: 'a', text: 'Stripe charges a migration fee' },
          {
            id: 'b',
            text: "Account types can't be changed after creation, and each type requires fundamentally different integration code and compliance infrastructure",
          },
          {
            id: 'c',
            text: 'Custom accounts use a different API endpoint',
          },
          { id: 'd', text: 'Standard accounts are being deprecated' },
        ],
        correctOptionId: 'b',
        explanation:
          "Migrating between account types requires rebuilding onboarding flows, compliance pipelines, and often renegotiating your platform's relationship with Stripe. The integration code differs significantly between types.",
      },
      {
        id: 'at-q4',
        prompt:
          'When is mixing account types on the same platform appropriate?',
        options: [
          {
            id: 'a',
            text: 'Never, Stripe only allows one account type per platform',
          },
          {
            id: 'b',
            text: 'When different user segments have different compliance and UX needs, though it adds operational complexity',
          },
          {
            id: 'c',
            text: 'Only during migration from one type to another',
          },
          {
            id: 'd',
            text: 'When the platform operates in multiple countries',
          },
        ],
        correctOptionId: 'b',
        explanation:
          'Hybrid approaches work when different user segments genuinely need different levels of platform control, but they add operational complexity because each type requires its own onboarding and compliance flows.',
      },
    ],
  },
  {
    id: 'oauth-onboarding',
    order: 3,
    title: 'OAuth & Standard Account Onboarding',
    tagline:
      'Connect existing Stripe accounts to your platform via OAuth',
    briefing: [
      'Standard accounts connect to your platform through an OAuth flow where the user authorizes your platform to access their Stripe account.',
      'Proper token storage, scope selection, and deauthorization handling are essential for production.',
    ],
    objectives: [
      'Implement the Connect OAuth flow',
      'Choose the right OAuth scope',
      'Handle account disconnection gracefully',
    ],
    points: 100,
    questions: [
      {
        id: 'oa-q1',
        prompt:
          'What is the permanent identifier for a connected Standard account relationship?',
        options: [
          { id: 'a', text: 'The access_token' },
          { id: 'b', text: 'The stripe_user_id' },
          { id: 'c', text: 'The authorization code' },
          { id: 'd', text: 'The client_id' },
        ],
        correctOptionId: 'b',
        explanation:
          'The stripe_user_id is the permanent identifier. Even if access tokens change or are revoked, the stripe_user_id remains the same for that connected account relationship.',
      },
      {
        id: 'oa-q2',
        prompt:
          'Why is the state parameter required in the OAuth authorization URL?',
        options: [
          {
            id: 'a',
            text: 'It specifies which capabilities to request',
          },
          {
            id: 'b',
            text: 'It prevents CSRF attacks by tying the authorization to a specific user session',
          },
          { id: 'c', text: 'It sets the redirect URL' },
          { id: 'd', text: 'It identifies the platform to Stripe' },
        ],
        correctOptionId: 'b',
        explanation:
          "The state parameter is a unique, session-tied value that prevents cross-site request forgery. Without it, an attacker could trick a user into connecting someone else's account.",
      },
      {
        id: 'oa-q3',
        prompt:
          'What happens when a Standard connected account deauthorizes your platform?',
        options: [
          {
            id: 'a',
            text: 'Nothing, the platform retains full access',
          },
          {
            id: 'b',
            text: 'Stripe sends an account.application.deauthorized event and all API calls using the revoked token will fail',
          },
          {
            id: 'c',
            text: 'The connected account is automatically deleted',
          },
          {
            id: 'd',
            text: 'Stripe sends an email to the platform admin',
          },
        ],
        correctOptionId: 'b',
        explanation:
          'When a Standard account revokes access, Stripe sends an account.application.deauthorized webhook. Your platform must handle this by marking the account as disconnected and stopping all API calls.',
      },
    ],
  },
  {
    id: 'account-creation',
    order: 4,
    title: 'Express & Custom Account Creation',
    tagline:
      'Create accounts via API and manage the onboarding funnel',
    briefing: [
      'Express and Custom accounts are created by your platform via the API, giving you control over the onboarding entry point.',
      'Understanding capabilities, Account Links, Account Tokens, and the requirements lifecycle is essential for a smooth onboarding experience.',
    ],
    objectives: [
      'Create Express and Custom accounts with appropriate capabilities',
      'Use Account Links for Express onboarding',
      'Handle verification requirements dynamically',
    ],
    points: 100,
    questions: [
      {
        id: 'ac-q1',
        prompt:
          'Why do Account Tokens exist for Custom account onboarding?',
        options: [
          { id: 'a', text: 'They make API calls faster' },
          {
            id: 'b',
            text: 'They allow sensitive identity data (SSN, date of birth) to flow directly from browser to Stripe without touching your servers',
          },
          {
            id: 'c',
            text: 'They are required for all account types',
          },
          { id: 'd', text: 'They replace the need for API keys' },
        ],
        correctOptionId: 'b',
        explanation:
          "Account Tokens keep sensitive PII out of your platform's servers. The frontend sends the data directly to Stripe via Stripe.js, keeping you out of scope for additional data-handling regulations.",
      },
      {
        id: 'ac-q2',
        prompt:
          "What does the currently_due array in an account's requirements represent?",
        options: [
          {
            id: 'a',
            text: 'Optional information that might be needed later',
          },
          {
            id: 'b',
            text: 'Fields that must be provided before the deadline or capabilities will be disabled',
          },
          {
            id: 'c',
            text: 'Information that Stripe is currently reviewing',
          },
          { id: 'd', text: 'Fields that were already submitted' },
        ],
        correctOptionId: 'b',
        explanation:
          'currently_due contains fields that must be provided before a specific deadline. If the deadline passes without submission, the affected capabilities become inactive.',
      },
      {
        id: 'ac-q3',
        prompt:
          'Why does every Custom connected account need a designated representative Person?',
        options: [
          {
            id: 'a',
            text: "It's optional for sole proprietors",
          },
          {
            id: 'b',
            text: "Stripe requires someone to be accountable for the account's compliance, and the representative is that person",
          },
          {
            id: 'c',
            text: 'Representatives receive payout notifications',
          },
          { id: 'd', text: "It's only required in the US" },
        ],
        correctOptionId: 'b',
        explanation:
          "The representative is the person authorized to agree to Stripe's terms on behalf of the business. Every Custom account needs one to satisfy regulatory requirements.",
      },
      {
        id: 'ac-q4',
        prompt:
          'What happens if you generate an Account Link and cache it for later use?',
        options: [
          { id: 'a', text: 'It works indefinitely' },
          {
            id: 'b',
            text: 'The link will likely expire before the user clicks it, causing an error',
          },
          { id: 'c', text: 'Stripe automatically refreshes it' },
          {
            id: 'd',
            text: 'It redirects to the Dashboard instead',
          },
        ],
        correctOptionId: 'b',
        explanation:
          'Account Links expire after a short window. Always generate them on-demand, immediately before redirecting the user, to avoid expired link errors.',
      },
    ],
  },
  {
    id: 'capabilities-compliance',
    order: 5,
    title: 'Capabilities & Compliance Lifecycle',
    tagline:
      'Manage the ongoing compliance loop for connected accounts',
    briefing: [
      'Compliance is not a one-time event. Accounts that were verified can re-enter a requirements state.',
      'The account.updated webhook is the most important event in a Connect integration, driving capability status and requirement changes.',
    ],
    objectives: [
      'Map capability statuses to operational consequences',
      'Build a re-verification flow triggered by webhooks',
      'Distinguish between currently_due and eventually_due',
    ],
    points: 100,
    questions: [
      {
        id: 'cc-q1',
        prompt:
          'What happens if a connected account has active card_payments but inactive transfers capability?',
        options: [
          { id: 'a', text: 'All transactions are blocked' },
          {
            id: 'b',
            text: 'Charges succeed but payouts to the connected account fail',
          },
          {
            id: 'c',
            text: 'The account is automatically deactivated',
          },
          {
            id: 'd',
            text: 'Stripe converts the account to Standard type',
          },
        ],
        correctOptionId: 'b',
        explanation:
          "Capabilities are independent. A charge can succeed because card_payments is active on the platform, but the transfer to the connected account will fail because transfers is inactive. Always check both.",
      },
      {
        id: 'cc-q2',
        prompt:
          'What is the most important webhook event in a Connect integration?',
        options: [
          { id: 'a', text: 'payment_intent.succeeded' },
          { id: 'b', text: 'customer.created' },
          { id: 'c', text: 'account.updated' },
          { id: 'd', text: 'invoice.paid' },
        ],
        correctOptionId: 'c',
        explanation:
          "account.updated fires on every change to a connected account's requirements, capabilities, or verification status. It's the primary signal for capability degradation, new requirements, and compliance state changes.",
      },
      {
        id: 'cc-q3',
        prompt:
          "What's the difference between eventually_due and currently_due requirements?",
        options: [
          {
            id: 'a',
            text: 'eventually_due items are optional, currently_due are required',
          },
          {
            id: 'b',
            text: 'eventually_due is an early warning, currently_due means the deadline is imminent or passed',
          },
          {
            id: 'c',
            text: 'They are different names for the same thing',
          },
          {
            id: 'd',
            text: 'eventually_due applies to Express, currently_due to Custom',
          },
        ],
        correctOptionId: 'b',
        explanation:
          'eventually_due gives advance notice. Items move from eventually_due to currently_due as the deadline approaches. Proactive collection while items are in eventually_due prevents capability degradation.',
      },
    ],
  },
  {
    id: 'charge-types',
    order: 6,
    title: 'Charge Types: Directing Money Flows',
    tagline: 'Choose how money moves through your platform',
    briefing: [
      'The charge type determines statement descriptors, dispute liability, and fund flow timing.',
      'Each type encodes a different relationship between the platform, the connected account, and the customer.',
    ],
    objectives: [
      'Compare dispute liability across charge types',
      'Know when to use separate charges and transfers',
      'Understand refund implications for each charge type',
    ],
    points: 100,
    questions: [
      {
        id: 'ct-q1',
        prompt:
          'Who is liable for disputes on a destination charge?',
        options: [
          { id: 'a', text: 'The connected account' },
          { id: 'b', text: 'The platform' },
          { id: 'c', text: 'Stripe' },
          { id: 'd', text: "The customer's bank" },
        ],
        correctOptionId: 'b',
        explanation:
          'With destination charges, the platform is the merchant of record. The charge is created on the platform account, so dispute liability sits with the platform, not the connected account.',
      },
      {
        id: 'ct-q2',
        prompt:
          'When should you use separate charges and transfers instead of destination charges?',
        options: [
          {
            id: 'a',
            text: 'When you want Stripe to handle fund routing automatically',
          },
          {
            id: 'b',
            text: 'When you need to split a single charge across multiple connected accounts or delay transfers',
          },
          {
            id: 'c',
            text: "When you want the connected account's name on the statement",
          },
          { id: 'd', text: 'For all charges over $1,000' },
        ],
        correctOptionId: 'b',
        explanation:
          'Separate charges and transfers decouple the charge from fund movement. This is the only pattern that supports splitting one charge to multiple recipients, delaying transfers, or conditionally routing funds.',
      },
      {
        id: 'ct-q3',
        prompt:
          'What risk does initiating a refund on a destination charge without reversing the transfer create?',
        options: [
          {
            id: 'a',
            text: 'The refund is blocked automatically',
          },
          {
            id: 'b',
            text: "The connected account's balance can go negative",
          },
          {
            id: 'c',
            text: 'The platform pays double the refund amount',
          },
          {
            id: 'd',
            text: 'The customer receives the refund twice',
          },
        ],
        correctOptionId: 'b',
        explanation:
          "If you refund a destination charge without explicitly reversing the transfer first, the refund debits the connected account's balance. If there aren't enough funds, the balance goes negative and the platform is exposed.",
      },
      {
        id: 'ct-q4',
        prompt:
          'How do statement descriptors differ between direct and destination charges?',
        options: [
          {
            id: 'a',
            text: "They're always the same regardless of charge type",
          },
          {
            id: 'b',
            text: "Direct charges show the connected account's descriptor; destination charges show the platform's descriptor",
          },
          {
            id: 'c',
            text: "Both show the platform's descriptor",
          },
          {
            id: 'd',
            text: "Both show the connected account's descriptor",
          },
        ],
        correctOptionId: 'b',
        explanation:
          "Direct charges are created on the connected account, so their descriptor appears. Destination charges are created on the platform, so the platform's descriptor appears, optionally with a suffix from the connected account.",
      },
    ],
  },
  {
    id: 'platform-revenue',
    order: 7,
    title: 'Application Fees & Platform Revenue',
    tagline: 'Build a sustainable fee model for your platform',
    briefing: [
      'application_fee_amount is the primary mechanism for collecting platform revenue on Connect charges.',
      'Understanding who pays processing fees, how refunds affect fees, and negative balance exposure is critical for unit economics.',
    ],
    objectives: [
      'Implement application_fee_amount correctly',
      'Handle fee rounding at scale',
      'Understand negative balance liability',
    ],
    points: 100,
    questions: [
      {
        id: 'pr-q1',
        prompt:
          'What happens to the application fee by default when a charge is refunded?',
        options: [
          {
            id: 'a',
            text: 'The platform keeps the fee regardless',
          },
          {
            id: 'b',
            text: 'The application fee is also refunded by default',
          },
          { id: 'c', text: 'Half the fee is refunded' },
          {
            id: 'd',
            text: 'The connected account absorbs the fee refund',
          },
        ],
        correctOptionId: 'b',
        explanation:
          'By default, refunding a charge also refunds the application fee. Use the refund_application_fee parameter set to false if you want to retain the fee on refund.',
      },
      {
        id: 'pr-q2',
        prompt:
          'Why must fee calculations use integer arithmetic instead of floating point?',
        options: [
          {
            id: 'a',
            text: "Stripe's API doesn't accept decimals",
          },
          {
            id: 'b',
            text: 'application_fee_amount must be an integer in the smallest currency unit, and floating point rounding errors compound at scale',
          },
          { id: 'c', text: 'Floating point is slower' },
          {
            id: 'd',
            text: "It's a JavaScript-specific limitation",
          },
        ],
        correctOptionId: 'b',
        explanation:
          'application_fee_amount is specified in cents (smallest currency unit) and must be an integer. Floating point arithmetic can produce values like 10.000000001, which rounds unpredictably. Use Math.round() consistently.',
      },
      {
        id: 'pr-q3',
        prompt:
          "Who pays Stripe's processing fees by default on destination charges?",
        options: [
          { id: 'a', text: 'The connected account' },
          { id: 'b', text: 'The platform' },
          { id: 'c', text: 'The customer' },
          { id: 'd', text: 'Fees are split evenly' },
        ],
        correctOptionId: 'b',
        explanation:
          "On destination charges, the platform is the merchant of record, so Stripe's processing fees are deducted from the platform's portion by default. This directly impacts your unit economics.",
      },
    ],
  },
  {
    id: 'payouts',
    order: 8,
    title: 'Payouts',
    tagline:
      'Get money to your connected accounts reliably',
    briefing: [
      "Payouts move funds from a connected account's Stripe balance to their external bank account or debit card.",
      'Payout schedule control, failure handling, and reconciliation are the most common sources of production incidents for Connect platforms.',
    ],
    objectives: [
      'Configure payout schedules for different use cases',
      'Handle payout failures with user-facing notifications',
      'Reconcile payouts using Balance Transactions',
    ],
    points: 100,
    questions: [
      {
        id: 'po-q1',
        prompt:
          'What advantage do manual payouts give a platform?',
        options: [
          { id: 'a', text: 'Lower Stripe fees' },
          {
            id: 'b',
            text: "Funds stay in the Stripe balance until the platform explicitly triggers a payout, enabling escrow and hold patterns",
          },
          {
            id: 'c',
            text: 'Faster settlement to bank accounts',
          },
          {
            id: 'd',
            text: 'Manual payouts bypass bank verification',
          },
        ],
        correctOptionId: 'b',
        explanation:
          "Manual payouts give the platform maximum control over fund flow timing. Funds don't move until you call payouts.create, which is essential for escrow, dispute holds, or approval-based release.",
      },
      {
        id: 'po-q2',
        prompt:
          'What should your platform do when a payout.failed event arrives?',
        options: [
          { id: 'a', text: 'Retry the payout immediately' },
          {
            id: 'b',
            text: 'Map the failure_code to a user-facing message and prompt the connected account to update their bank details',
          },
          { id: 'c', text: 'Delete the connected account' },
          {
            id: 'd',
            text: 'Ignore it, Stripe retries automatically',
          },
        ],
        correctOptionId: 'b',
        explanation:
          "Payout failures need immediate attention. Map the failure code to a helpful message, notify the affected account, and guide them to update their bank details if needed. Don't retry without fixing the underlying issue.",
      },
      {
        id: 'po-q3',
        prompt:
          'How do you reconcile which charges funded a specific payout?',
        options: [
          { id: 'a', text: "Check the payout's metadata" },
          {
            id: 'b',
            text: 'Use the Balance Transactions API to find transactions associated with the payout',
          },
          {
            id: 'c',
            text: 'Payouts are always 1:1 with charges',
          },
          {
            id: 'd',
            text: 'Query the Charges API with the payout ID',
          },
        ],
        correctOptionId: 'b',
        explanation:
          'The Balance Transactions API shows every credit and debit that composed a payout. Each payout has associated balance transactions that reveal the underlying charges, fees, and transfers.',
      },
    ],
  },
  {
    id: 'account-management',
    order: 9,
    title: 'Dashboard & Account Management',
    tagline:
      'Operational tools for managing connected accounts at scale',
    briefing: [
      'The Connect Dashboard provides visibility into connected account status, but production platforms need their own management workflows.',
      'Account metadata, local mirroring, and Express Dashboard login links are key operational patterns.',
    ],
    objectives: [
      'Use the Connect Dashboard for operational monitoring',
      'Store platform identifiers in account metadata',
      'Mirror account state locally for query performance',
    ],
    points: 100,
    questions: [
      {
        id: 'am-q1',
        prompt:
          'What can Express account holders NOT do in their Express Dashboard?',
        options: [
          { id: 'a', text: 'View payout history' },
          {
            id: 'b',
            text: 'See full charge details or manage API keys',
          },
          { id: 'c', text: 'Update their bank account' },
          { id: 'd', text: 'Download tax forms' },
        ],
        correctOptionId: 'b',
        explanation:
          "The Express Dashboard is intentionally limited to payout management, bank account updates, and tax documents. Express account holders can't see full charge details, access API keys, or manage the Stripe integration.",
      },
      {
        id: 'am-q2',
        prompt:
          'Why should platforms store their internal user_id in account metadata at creation time?',
        options: [
          { id: 'a', text: 'Stripe requires it' },
          {
            id: 'b',
            text: 'Every webhook carrying the Account object will include this identifier, making event routing trivially easy',
          },
          { id: 'c', text: 'It improves payout speed' },
          { id: 'd', text: "It's needed for tax reporting" },
        ],
        correctOptionId: 'b',
        explanation:
          "Account metadata is included in webhook payloads. By storing your platform's user ID at creation time, you can route webhook events to the correct user context without a separate database lookup.",
      },
      {
        id: 'am-q3',
        prompt:
          'Why do platforms at scale mirror account data locally instead of querying the Stripe API?',
        options: [
          {
            id: 'a',
            text: "The Stripe API doesn't support account listing",
          },
          {
            id: 'b',
            text: 'Real-time API calls for every query hit rate limits and add latency at thousands of accounts',
          },
          {
            id: 'c',
            text: "Local data is more accurate than Stripe's",
          },
          { id: 'd', text: 'Stripe charges per API call' },
        ],
        correctOptionId: 'b',
        explanation:
          'At scale, querying the Stripe API for every account list or status check creates performance bottlenecks and risks hitting rate limits. Mirror state locally via account.updated webhooks and query your own database.',
      },
    ],
  },
  {
    id: 'connect-webhooks',
    order: 10,
    title: 'Connect Webhooks',
    tagline:
      'Event-driven architecture for your Connect platform',
    briefing: [
      'Connect webhooks differ from standard webhooks. Platform-level endpoints receive events from all connected accounts.',
      'Idempotent handlers, correct event routing via event.account, and testing both event streams are essential.',
    ],
    objectives: [
      'Configure platform-level Connect webhooks',
      'Route events using the event.account field',
      'Implement idempotent webhook handlers',
    ],
    points: 100,
    questions: [
      {
        id: 'cw-q1',
        prompt:
          'How do you identify which connected account generated a webhook event?',
        options: [
          { id: 'a', text: 'Check the webhook URL path' },
          {
            id: 'b',
            text: 'Read the event.account field in the event payload',
          },
          {
            id: 'c',
            text: 'The account ID is in the webhook signature',
          },
          {
            id: 'd',
            text: 'Each account has its own webhook URL',
          },
        ],
        correctOptionId: 'b',
        explanation:
          'When a platform webhook receives an event from a connected account, the event object includes an account field with the connected account\'s ID. Your handler must read this to route the event correctly.',
      },
      {
        id: 'cw-q2',
        prompt:
          "What's the difference between --forward-to and --forward-connect-to in the Stripe CLI?",
        options: [
          {
            id: 'a',
            text: "They're aliases for the same command",
          },
          {
            id: 'b',
            text: '--forward-to handles platform events, --forward-connect-to handles connected account events',
          },
          {
            id: 'c',
            text: '--forward-connect-to is for production only',
          },
          {
            id: 'd',
            text: '--forward-to sends events to multiple endpoints',
          },
        ],
        correctOptionId: 'b',
        explanation:
          'During local development, you need both flags running in separate terminals. --forward-to captures events on your platform account, while --forward-connect-to captures events from connected accounts.',
      },
      {
        id: 'cw-q3',
        prompt: 'Why must Connect webhook handlers be idempotent?',
        options: [
          {
            id: 'a',
            text: 'Stripe only sends each event once',
          },
          {
            id: 'b',
            text: 'Stripe delivers events at-least-once, so handlers may process the same event multiple times',
          },
          {
            id: 'c',
            text: 'Idempotency is a Stripe API requirement',
          },
          {
            id: 'd',
            text: 'It prevents webhook signature verification failures',
          },
        ],
        correctOptionId: 'b',
        explanation:
          'Stripe guarantees at-least-once delivery. Network retries or Stripe-side retries can deliver the same event multiple times. Your handler must produce the same result whether it processes an event once or ten times.',
      },
    ],
  },
  {
    id: 'risk-disputes',
    order: 11,
    title: 'Risk, Disputes & Platform Liability',
    tagline:
      'Managing financial risk across your connected accounts',
    briefing: [
      "Connect platforms carry financial exposure that standard integrations don't. Dispute liability varies by charge type.",
      'Negative balance exposure and account deactivation are real financial risks that require proactive management.',
    ],
    objectives: [
      'Map dispute liability to charge types',
      'Implement negative balance monitoring',
      'Understand account deactivation consequences',
    ],
    points: 100,
    questions: [
      {
        id: 'rd-q1',
        prompt:
          'For which charge type is the connected account liable for disputes?',
        options: [
          { id: 'a', text: 'Destination charges' },
          { id: 'b', text: 'Direct charges' },
          { id: 'c', text: 'Separate charges and transfers' },
          {
            id: 'd',
            text: 'All charge types make the platform liable',
          },
        ],
        correctOptionId: 'b',
        explanation:
          'With direct charges, the charge is created on the connected account, making them the merchant of record. Dispute liability follows the merchant of record, so the connected account handles the dispute.',
      },
      {
        id: 'rd-q2',
        prompt:
          "What happens when a connected account's balance goes negative due to disputes?",
        options: [
          { id: 'a', text: 'Stripe absorbs the loss' },
          {
            id: 'b',
            text: "Stripe debits the platform's balance to cover the shortfall",
          },
          {
            id: 'c',
            text: 'The connected account is automatically closed',
          },
          {
            id: 'd',
            text: 'The negative balance is forgiven after 30 days',
          },
        ],
        correctOptionId: 'b',
        explanation:
          "Stripe will debit the platform for connected account negative balances. This is a real financial exposure that requires proactive monitoring and reserve strategies.",
      },
      {
        id: 'rd-q3',
        prompt:
          'How can platforms apply fraud controls across all connected accounts?',
        options: [
          {
            id: 'a',
            text: 'Each connected account must configure its own Radar rules',
          },
          {
            id: 'b',
            text: 'Platforms can apply Radar rules at the platform level that apply to all charges processed through the platform',
          },
          {
            id: 'c',
            text: 'Fraud controls are only available for Custom accounts',
          },
          {
            id: 'd',
            text: 'Platforms must use a third-party fraud service',
          },
        ],
        correctOptionId: 'b',
        explanation:
          'Platform-level Radar rules apply to all charges across connected accounts, giving you a first line of defense even if individual accounts have no fraud rules configured.',
      },
    ],
  },
  {
    id: 'scaling-platform',
    order: 12,
    title: 'Scaling Your Platform',
    tagline:
      'Architecture patterns for growing your platform',
    briefing: [
      'The operational demands of a Connect platform change dramatically between 10 and 10,000 connected accounts.',
      'Rate limit management, account state mirroring, and tax reporting are table stakes at scale.',
    ],
    objectives: [
      'Implement rate limit handling with exponential backoff',
      'Mirror account state locally for performance',
      'Configure tax reporting for compliance',
    ],
    points: 100,
    questions: [
      {
        id: 'sp-q1',
        prompt:
          'Why is exponential backoff with jitter recommended for high-volume Stripe API calls?',
        options: [
          {
            id: 'a',
            text: "It's required by Stripe's terms of service",
          },
          {
            id: 'b',
            text: 'Without jitter, retries bunch together and re-trigger the same rate limit (thundering herd)',
          },
          {
            id: 'c',
            text: 'It makes individual calls faster',
          },
          {
            id: 'd',
            text: 'Jitter is only needed for webhook processing',
          },
        ],
        correctOptionId: 'b',
        explanation:
          'Without jitter, all retries happen at the same time, creating a "thundering herd" that hits the rate limit again. Random jitter spreads retries across a time window, giving each request a better chance of succeeding.',
      },
      {
        id: 'sp-q2',
        prompt:
          'What is the Balance Transactions API primarily used for in Connect?',
        options: [
          { id: 'a', text: 'Creating new charges' },
          {
            id: 'b',
            text: "Platform-level financial reporting, showing every credit and debit to the platform's balance",
          },
          {
            id: 'c',
            text: 'Managing connected account payouts',
          },
          { id: 'd', text: 'Configuring webhook endpoints' },
        ],
        correctOptionId: 'b',
        explanation:
          'The Balance Transactions API is the canonical source for financial reporting. Every charge, application fee, transfer, refund, and dispute generates a balance transaction, giving you a complete ledger.',
      },
      {
        id: 'sp-q3',
        prompt:
          'Why should TIN collection be built into the onboarding flow rather than added later?',
        options: [
          { id: 'a', text: 'TINs expire after 90 days' },
          {
            id: 'b',
            text: 'Retroactively collecting TINs from active accounts is operationally painful and creates compliance risk',
          },
          {
            id: 'c',
            text: 'Stripe requires TINs at account creation',
          },
          {
            id: 'd',
            text: 'TINs are needed for capability activation',
          },
        ],
        correctOptionId: 'b',
        explanation:
          'US platforms above IRS thresholds must file 1099s, which require TINs. Collecting this during onboarding is smooth. Asking thousands of active accounts to provide their TIN retroactively generates significant support burden and compliance gaps.',
      },
      {
        id: 'sp-q4',
        prompt:
          'What should a production readiness checklist for a Connect platform include?',
        options: [
          {
            id: 'a',
            text: 'Only webhook endpoint configuration',
          },
          {
            id: 'b',
            text: 'Idempotent webhooks, negative balance monitoring, tax reporting, rate limiting, account mirroring, and onboarding re-entry testing',
          },
          {
            id: 'c',
            text: 'Just the account type decision',
          },
          {
            id: 'd',
            text: 'Only charge type selection and statement descriptors',
          },
        ],
        correctOptionId: 'b',
        explanation:
          'Connect has many moving parts. A production readiness checklist should cover webhooks, compliance monitoring, financial risk controls, rate limiting, local state mirroring, tax reporting, and end-to-end testing.',
      },
    ],
  },
]

export const CONNECT_TOTAL_SCORE = CONNECT_MODULES.reduce(
  (sum, m) => sum + m.points,
  0,
)
