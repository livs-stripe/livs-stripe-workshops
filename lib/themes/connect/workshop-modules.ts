import type {
  CalloutKind,
  Callout,
  WorkshopGif,
  DashboardUrl,
  WorkshopStep,
  WorkshopModule,
} from '@/lib/workshop-modules'

// ---------------------------------------------------------------------------
// Module 0 - Getting Started (prerequisite)
// ---------------------------------------------------------------------------

export const CONNECT_GETTING_STARTED_MODULE: WorkshopModule = {
  id: 'connect-getting-started',
  number: 0,
  title: 'Getting Started',
  estMinutes: 5,
  isPrerequisite: true,
  intro: `Welcome to the Stripe Connect workshop. Before diving into platform architecture, take five minutes to open your Stripe test account and locate the Connect section. Everything in this workshop happens inside that account.`,
  narrative: `You've just been hired as the lead engineer at TaskFlow, a freelancer marketplace. The company needs to onboard service providers, process payments from clients, collect a platform fee, and pay out freelancers. Your Stripe account is set up and ready to go.`,
  steps: [
    {
      title: 'Open your Stripe Dashboard',
      body: `Click the button below to open your Stripe Dashboard. The link generates a fresh session each time, so don't worry about bookmarking it.\n\nThis is your starting point for everything in the workshop. You'll come back to this Dashboard constantly as you explore Connect's features and test your integration.`,
      renderDashboardButton: true,
    },
    {
      title: 'Sign in with your credentials',
      body: `Use the credentials shown on the card below to sign in to your Stripe test account. These are pre-provisioned workshop credentials, so you don't need to create a new account.\n\nMake sure you're in test mode. You'll see a "Test mode" toggle or banner in the Dashboard. All Connect operations in this workshop use test mode data.`,
      renderCredentialsCard: true,
    },
    {
      title: 'Navigate to the Connect section',
      body: `Find the Connect section in the left sidebar of your Dashboard. This is where all your connected accounts will live once you start onboarding freelancers.\n\nThe Connect section shows an overview of your connected accounts, their verification status, and aggregate metrics. Right now it should be empty or show a getting-started guide. By the end of this workshop, you'll have a deep understanding of every part of this section.\n\nTake a moment to click around and familiarize yourself with the layout. You'll see subsections for Accounts, Transfers, and more.`,
      gif: {
        caption:
          'Record: Dashboard home showing Connect section in left sidebar',
        screen: 'Dashboard → Connect',
      },
    },
    {
      title: 'Keep the Dashboard open',
      body: `Leave the Dashboard open in a separate browser tab. You'll reference it throughout the workshop as you explore connected accounts, charge flows, and payout operations.\n\nHaving the Dashboard side-by-side with the workshop content makes it much easier to follow along and verify what you're learning against real Stripe data.`,
    },
  ],
  doneLabel: `I've set up my Stripe Dashboard and found the Connect section`,
}

// ---------------------------------------------------------------------------
// Module 1 - The Connect Mental Model
// ---------------------------------------------------------------------------

const MODULE_1_CONNECT_MENTAL_MODEL: WorkshopModule = {
  id: 'connect-mental-model',
  number: 1,
  title: 'The Connect Mental Model',
  estMinutes: 8,
  intro: `Connect is not just a payments API extension. It's a platform operating model. Before writing any code, you need to understand the three-party relationship between Stripe, your platform, and your connected accounts, and why that relationship determines every architecture decision that follows.`,
  narrative: `TaskFlow needs to move money from clients to freelancers while taking a platform fee. Before you build anything, you need to understand how Connect models this relationship and what your options are.`,
  overviewAddition: `The conceptual foundation for every Connect decision you'll make.`,
  steps: [
    {
      title: 'The three-party model',
      body: `In a standard Stripe integration, there are two parties: you (the merchant) and Stripe (the infrastructure). You process charges, you receive funds, you handle disputes. Connect introduces a third party: the connected account.\n\nFor TaskFlow, the platform sits in the middle of every transaction. A client pays for a project, but the freelancer is the one who earned the money. Connect separates who processes the payment from who receives the funds. Your platform orchestrates the flow, collecting a fee along the way.\n\nThis three-party model is what makes Connect fundamentally different from adding a payment form to your website. You're not just accepting payments. You're routing them between parties with different financial relationships to the transaction.`,
      callouts: [
        {
          kind: 'explanation' as CalloutKind,
          text: `Think of it like a payment orchestrator. In a standard integration, you're both the store and the cashier. With Connect, you're the mall, the freelancers are the stores, and Stripe is the underlying payment infrastructure that makes it all work.`,
        },
      ],
    },
    {
      title: 'Platform liability spectrum',
      body: `Connect places platforms on a spectrum of financial and compliance responsibility. At one end, Standard accounts are nearly self-managed by the connected account. Your platform has minimal compliance exposure. At the other end, Custom accounts make the platform the de facto merchant of record for KYC, compliance, and fraud.\n\nThis choice is architectural and difficult to change later. It's the most important decision a platform makes. For TaskFlow, choosing Custom means you're responsible for collecting freelancer identity documents, handling verification failures, and managing ongoing compliance. Choosing Standard means freelancers manage their own Stripe relationship.\n\nThe account type decision ripples through your entire codebase: onboarding flows, webhook handlers, payout logic, dispute management, and tax reporting all change based on where you sit on this spectrum.`,
      callouts: [
        {
          kind: 'warning' as CalloutKind,
          text: `Account type is not easily migrated. Choosing Custom for speed of onboarding without understanding the compliance burden has caused significant problems for platforms at scale. Architect this decision before your first connected account is created.`,
        },
      ],
    },
    {
      title: 'The four charge types and where money flows',
      body: `Connect offers four charge types: Direct, Destination, Separate Charges and Transfers, and Transfer-only. Each determines a different answer to three critical questions: Who appears on the cardholder's statement? Who holds funds first? Where does fraud and dispute liability sit?\n\nFor TaskFlow, this means deciding whether "TaskFlow" or "Jane's Design Studio" appears on the client's credit card statement, and who handles the dispute if the client files one. Module 6 covers each in depth.\n\nHere the goal is to establish that this is a consequential choice, not a styling preference. The charge type you pick affects your financial exposure, your customer experience, and your operational burden. Getting it wrong means restructuring your payment flow later, which is one of the most disruptive changes a platform can make.`,
      gif: {
        caption:
          'Record: diagram showing money flow for each charge type, platform vs connected account as charge owner',
        screen: 'Connect → Charge Types Overview',
      },
    },
    {
      title: 'Connect in the Stripe Dashboard',
      body: `When Connect is enabled, your Stripe Dashboard gains an entirely new section. The Connect tab shows your connected accounts, their capability status, and the ability to view activity on their behalf.\n\nPay attention to the distinction between the platform's own balance and the funds held in connected accounts. These are separate. Your platform balance shows application fees you've collected and any direct charges to your account. Connected account balances show funds pending transfer or payout to each individual account.\n\nFor TaskFlow, you'll see your platform balance (application fees collected from freelancer transactions) separately from each freelancer's pending balance (funds waiting to be paid out to their bank account).`,
      gif: {
        caption:
          'Record: Stripe Dashboard Connect tab showing connected accounts list with capability status and balance columns',
        screen: 'Dashboard → Connect',
      },
      dashboardLink: {
        label: 'Open Connect',
        url: '/connect/accounts',
      },
    },
    {
      title: 'Key API concepts: the Stripe-Account header',
      body: `Most Connect API calls require specifying which connected account you're acting on behalf of. You do this with the Stripe-Account header, passing the connected account's ID (which starts with acct_).\n\nThere's an important distinction between platform-level calls (using just your secret key) and connected-account-level calls (your key plus the Stripe-Account header). Platform-level calls manage your own account. Connected-account-level calls let you create charges, retrieve data, and manage resources as if you were that connected account.\n\nFor TaskFlow, when you create a charge for a client that pays a freelancer, you'll use this header to tell Stripe which freelancer's account should receive the funds. This header is the primary mechanism for the platform to operate across the entire network of connected accounts.`,
      callouts: [
        {
          kind: 'tip' as CalloutKind,
          text: `The Stripe-Account header uses the connected account's ID (starts with acct_). You never need the connected account's own API keys. Your platform's secret key plus the header is all you need.`,
        },
      ],
    },
  ],
  doneLabel: `I understand the Connect mental model and how it applies to TaskFlow`,
}

// ---------------------------------------------------------------------------
// Module 2 - Choosing Your Account Type
// ---------------------------------------------------------------------------

const MODULE_2_ACCOUNT_TYPES: WorkshopModule = {
  id: 'account-types',
  number: 2,
  title: 'Choosing Your Account Type',
  estMinutes: 10,
  intro: `Standard, Express, and Custom accounts represent fundamentally different contracts between your platform, your users, and Stripe. The right choice depends on your regulatory risk appetite, the UX control you need, and how much compliance infrastructure you're willing to build and maintain.`,
  narrative: `TaskFlow needs to onboard freelancers. Should you let them manage their own Stripe accounts? Should Stripe handle the KYC? Or should TaskFlow own the entire onboarding experience? Each path has real consequences for your engineering team and your legal exposure.`,
  overviewAddition: `The most consequential architecture decision you'll make.`,
  steps: [
    {
      title: 'Standard accounts: maximum autonomy, minimum platform burden',
      body: `Standard accounts have a full Stripe relationship independent of your platform. They complete Stripe's own onboarding, manage their own Dashboard, and Stripe handles all KYC. Platforms connect via OAuth.\n\nThis is the right choice when your users are sophisticated merchants who already have (or can manage) their own Stripe accounts. It's ideal for B2B marketplaces, agency platforms, or any model where the connected account is a business that wants to own its Stripe relationship.\n\nFor TaskFlow, choosing Standard would mean freelancers set up their own Stripe accounts and connect them to your platform. You never touch their identity data. Your compliance exposure is nearly zero, but you also give up control over the onboarding experience.`,
      callouts: [
        {
          kind: 'tip' as CalloutKind,
          text: `Standard is underused by platforms that assume they need more control. If your sellers are businesses who can handle their own Stripe relationship, Standard significantly reduces your regulatory surface area.`,
        },
      ],
    },
    {
      title: 'Express accounts: the balanced middle ground',
      body: `Express accounts are Stripe-hosted but platform-created. Stripe handles KYC, identity verification, and compliance. Your platform controls the onboarding entry point and branding. Users interact with the Express Dashboard, which is limited to payouts and tax documents.\n\nThe tradeoff is clear: you get controlled onboarding UX without building KYC infrastructure, but you give up some UI flexibility compared to Custom. For most marketplaces and gig platforms, this is the sweet spot.\n\nFor TaskFlow, Express is often the best starting point. Freelancers see a polished, branded onboarding experience, but Stripe handles all the compliance heavy lifting. Your engineering team doesn't need to build identity verification, document collection, or compliance event management from scratch.`,
      callouts: [
        {
          kind: 'stripe-fact' as CalloutKind,
          text: `Express accounts are the most commonly used account type among Connect platforms. They offer the best balance of platform control and compliance delegation for most marketplace and platform use cases.`,
        },
      ],
    },
    {
      title: 'Custom accounts: maximum control, maximum responsibility',
      body: `Custom accounts are fully owned by the platform. Stripe is invisible to the end user. Your platform collects all identity information, presents it to Stripe via API, and is responsible for the compliance experience.\n\nStripe still performs the underlying KYC, but your platform is accountable for collecting the right data, surfacing verification failures, and managing the ongoing compliance lifecycle. This is not a feature you toggle on. It's a regulated financial operations responsibility that requires dedicated engineering and legal resources.\n\nChoosing Custom because you want pixel-perfect onboarding UI without understanding the compliance obligations is one of the most common and costly mistakes platforms make. It works beautifully in a demo. It creates real operational pain at scale.`,
      callouts: [
        {
          kind: 'warning' as CalloutKind,
          text: `Platforms running Custom accounts must treat account verification, capability management, and compliance event handling as first-class engineering systems, not afterthoughts. Failing to handle account.updated webhooks correctly has caused platforms to unknowingly process payments for accounts with outstanding compliance requirements.`,
        },
      ],
    },
    {
      title: 'Decision framework',
      body: `Walk through this decision as a structured framework. First: who bears compliance risk, you or your user? If you want zero compliance exposure, choose Standard. Second: do your users need a standalone Stripe relationship? If yes, Standard. If no, Express or Custom.\n\nThird: how much onboarding UX control do you need? If branded but Stripe-hosted is fine, Express. If you need full UI ownership, Custom. Fourth: do you have engineering capacity to maintain a compliance event pipeline? Custom requires ongoing compliance operations, not just an initial build.\n\nFor TaskFlow, Express is the recommended starting point. Freelancers get a clean onboarding experience, Stripe handles compliance, and TaskFlow controls the brand. You can always evaluate Custom later if you need more UI control, but starting with Express lets you validate your marketplace model without building compliance infrastructure.`,
      gif: {
        caption:
          'Record: Decision tree diagram showing Standard vs Express vs Custom with decision nodes for compliance ownership, UX control, and operational capacity',
        screen: 'Connect → Account Type Decision',
      },
    },
    {
      title: 'Account type comparison table',
      body: `Here's a direct comparison across key dimensions.\n\nFor KYC completion: Standard accounts have the user complete KYC directly with Stripe. Express uses a Stripe-hosted flow triggered by the platform. Custom requires the platform to collect all information via API or Account Tokens.\n\nFor Dashboard experience: Standard accounts get the full Stripe Dashboard. Express accounts get a limited Dashboard for payouts and tax documents. Custom accounts get no Stripe Dashboard at all, so the platform must build its own UI.\n\nFor payout control: Standard accounts manage their own payouts. Express allows either platform or user control. Custom gives the platform full control over payout scheduling and triggers.\n\nFor platform fee flexibility: Standard and Express use application_fee_amount. Custom supports any fee structure including implicit fees via transfer amount differences.\n\nFor API implementation effort: Standard is lowest (OAuth integration). Express is moderate (account creation plus hosted onboarding). Custom is highest (full account management, person creation, document handling).\n\nFor ongoing compliance burden: Standard is zero. Express is minimal. Custom is significant and ongoing.`,
    },
    {
      title: 'Restrictions and country availability',
      body: `Custom accounts aren't available in all countries, and Express availability also varies by market. Platforms building internationally must account for this in their architecture.\n\nA Custom-first strategy may not be viable in all target markets. Some platforms use a hybrid approach: Custom in their primary market where they've built the compliance infrastructure, and Express in secondary markets where they want to expand without the operational overhead.\n\nFor TaskFlow, if you plan to onboard freelancers in APAC or LATAM, check Stripe's current country matrix before committing to Custom as your primary account type. Building a Custom onboarding flow and then discovering it's not supported in a target market is wasted engineering effort.`,
      callouts: [
        {
          kind: 'info' as CalloutKind,
          text: `Custom accounts are available in a smaller set of countries than Express. If you're building for APAC or LATAM, verify country support before choosing Custom as your primary account type.`,
        },
      ],
    },
  ],
  doneLabel: `I've evaluated account types and know which fits TaskFlow`,
}

// ---------------------------------------------------------------------------
// Module 3 - OAuth & Standard Account Onboarding
// ---------------------------------------------------------------------------

const MODULE_3_OAUTH_STANDARD: WorkshopModule = {
  id: 'oauth-standard-onboarding',
  number: 3,
  title: 'OAuth & Standard Account Onboarding',
  estMinutes: 10,
  intro: `Connecting Standard accounts via OAuth is the most straightforward Connect integration, but it has nuances around scope, token storage, and revocation that matter at production scale.`,
  narrative: `TaskFlow's enterprise tier allows established agencies to connect their existing Stripe accounts. Here's how the OAuth flow works and what you need to handle when an agency decides to disconnect.`,
  overviewAddition: `How to connect existing Stripe accounts to your platform.`,
  steps: [
    {
      title: 'The OAuth flow for Connect',
      body: `Your platform redirects the user to Stripe's authorization URL with your client_id and requested scope. The user logs in (or creates a Stripe account), and Stripe redirects back with an authorization code. Your backend exchanges that code for an access_token and the connected account's stripe_user_id.\n\nYou must store the stripe_user_id. It's the permanent identifier for this relationship. Even if the access token changes, the stripe_user_id stays the same. This is the ID you'll use in Stripe-Account headers and to look up the connected account in your database.\n\nFor TaskFlow's enterprise tier, an agency clicks "Connect your Stripe account," completes the OAuth flow, and their existing Stripe account is linked to your platform. From that point on, you can create charges on their behalf using the Stripe-Account header.`,
    },
    {
      title: 'Scopes: read_only vs read_write',
      body: `OAuth scopes control what your platform can do with the connected account. read_only lets you retrieve account data and view charges but not create charges or issue refunds. read_write lets you create charges, issue refunds, and manage resources on the connected account.\n\nMost platforms need read_write because they're processing payments. read_only makes sense for analytics integrations, financial reporting tools, or any use case where you're observing transaction data without creating new transactions.\n\nFor TaskFlow, you'll need read_write because you're creating charges on behalf of the agency's connected account. A reporting-only integration that just displays the agency's revenue dashboard could use read_only.`,
      callouts: [
        {
          kind: 'tip' as CalloutKind,
          text: `Request only the scope you actually need. If you're building a reporting integration that just reads transaction data, use read_only. Requesting read_write when you don't need it raises questions during Stripe's platform review.`,
        },
      ],
    },
    {
      title: 'Building the authorization URL',
      body: `Construct the OAuth URL with your client_id, scope, redirect_uri, state parameter, and optional prefill parameters like stripe_user_email and suggested_capabilities.\n\nThe state parameter is not optional in production. It prevents CSRF attacks by tying the OAuth callback to the user's authenticated session. Generate a unique, unguessable value, store it server-side tied to the session, and verify it when the callback arrives.\n\nPrefill parameters improve conversion by pre-populating known information. For TaskFlow, you'd prefill the agency's email address so they don't have to type it again during the Stripe OAuth flow. Small UX touches like this reduce drop-off in the connection flow.`,
      callouts: [
        {
          kind: 'warning' as CalloutKind,
          text: `The state parameter must be a unique, unguessable value tied to the user's session. Without it, an attacker could trick a user into connecting someone else's Stripe account to their TaskFlow profile. This is a real security vulnerability, not a theoretical one.`,
        },
      ],
    },
    {
      title: 'Exchanging the code and storing credentials',
      body: `POST to Stripe's token endpoint with the authorization code to receive the access_token, token_type, stripe_publishable_key, scope, livemode, and stripe_user_id.\n\nPersist the stripe_user_id in your database. It's the durable identifier for this connection. The access_token is effectively your platform's API key for that connected account. Store it as a secret in your credential store. Never expose it client-side, in logs, or in error messages.\n\nFor Standard accounts, the access_token doesn't expire, but it can be revoked by the connected account at any time. This means your system must gracefully handle the case where a previously valid token stops working.`,
      callouts: [
        {
          kind: 'warning' as CalloutKind,
          text: `access_tokens for Standard accounts don't expire but can be revoked by the connected account at any time. Your platform must handle account.application.deauthorized webhook events and gracefully revoke access on your side.`,
        },
      ],
    },
    {
      title: 'Deauthorization and account disconnection',
      body: `Connected Standard accounts can revoke access at any time from their own Stripe Dashboard. When they do, Stripe sends an account.application.deauthorized event to your webhook endpoint.\n\nYour platform must handle this webhook by marking the account as disconnected in your database, canceling any pending operations for that account, and stopping all API calls using their credentials. Don't just log it. Take action.\n\nFor TaskFlow, this means the agency's connection is severed. Any pending payouts or transfers to that account will fail. Any background jobs or cron tasks that make calls on behalf of this account will get authentication errors. Build your handler to gracefully deactivate the entire relationship and notify the agency that they've been disconnected.`,
      callouts: [
        {
          kind: 'info' as CalloutKind,
          text: `After deauthorization, any API calls using the revoked access_token will return authentication errors. If you have background jobs or cron tasks that make calls on behalf of connected accounts, make sure they check the account's connection status before attempting API calls.`,
        },
      ],
    },
  ],
  doneLabel: `I understand OAuth onboarding and deauthorization handling`,
}

// ---------------------------------------------------------------------------
// Module 4 - Express & Custom Account Creation
// ---------------------------------------------------------------------------

const MODULE_4_EXPRESS_CUSTOM_CREATION: WorkshopModule = {
  id: 'express-custom-creation',
  number: 4,
  title: 'Express & Custom Account Creation',
  estMinutes: 12,
  intro: `For Express and Custom accounts, your platform creates accounts via API and owns the onboarding funnel. Getting this right means understanding Stripe's capabilities model, how verification requirements vary by country, and how to build an onboarding experience that doesn't leave accounts stuck in an incomplete state.`,
  narrative: `TaskFlow's primary onboarding uses Express accounts. Let's walk through creating one, generating an onboarding link, and handling the verification lifecycle.`,
  overviewAddition: `Building your platform's account creation and onboarding flow.`,
  steps: [
    {
      title: 'Creating an account via API',
      body: `The accounts.create call accepts type: 'express' or type: 'custom' along with key parameters: country, email, business_type, and capabilities. Request the right capabilities upfront rather than adding them later, as this reduces friction in the verification loop.\n\nRequesting capabilities you don't need adds unnecessary compliance burden. Each additional capability may trigger more verification requirements, which means more friction for your users during onboarding.\n\nFor TaskFlow, you'll request card_payments and transfers for every freelancer account. That's the minimum set needed to accept client payments and send money to the freelancer's bank account. Don't request additional capabilities like us_bank_account_ach_payments unless you actually plan to use them.`,
      callouts: [
        {
          kind: 'tip' as CalloutKind,
          text: `Always set business_type at creation time if you know it. Changing business_type after creation can trigger additional verification requirements that feel surprising to the user.`,
        },
      ],
    },
    {
      title: 'The capabilities model',
      body: `Capabilities (card_payments, transfers, us_bank_account_ach_payments, and others) are what allow a connected account to actually process payments and receive funds. Each has a status: active, inactive, pending, or unrequested.\n\nA capability being inactive doesn't block account creation, but it blocks the associated action. An account without active transfers capability can't receive payouts regardless of whether the payment processed successfully. This is a critical distinction that catches many platforms in production.\n\nFor TaskFlow, both card_payments and transfers must be active before a freelancer can fully participate. If card_payments is active but transfers is inactive, you can create charges, but the freelancer can't receive the money.`,
      callouts: [
        {
          kind: 'warning' as CalloutKind,
          text: `A common production bug is routing money to an account with inactive transfers capability. The charge succeeds (card_payments is active on the platform) but the transfer to the connected account fails. Always verify the connected account's capability status before creating charges that involve fund movement.`,
        },
      ],
    },
    {
      title: 'Express onboarding: hosted onboarding links',
      body: `For Express, generate an Account Link with type: 'account_onboarding' and redirect the user to Stripe's hosted flow. Stripe collects identity, business information, and bank account details for payouts.\n\nBoth refresh_url and return_url are required, and the distinction matters. refresh_url is where Stripe sends the user if the link expires or they need to re-enter the flow. return_url is where Stripe redirects after the user completes onboarding or abandons it. Your return_url should check the account's status, not assume onboarding is complete, because users can abandon the flow.\n\nFor TaskFlow, the return_url would be your freelancer dashboard. On that page, check the account's requirements to determine whether onboarding is actually complete or whether the freelancer left early.`,
      callouts: [
        {
          kind: 'tip' as CalloutKind,
          text: `Account Links expire after a short window. Don't generate them ahead of time and cache them. Generate on-demand, immediately before redirect. If a freelancer clicks the link an hour after you generated it, they'll get an error.`,
        },
      ],
      gif: {
        caption:
          'Record: generating an Account Link and being redirected to the Stripe-hosted Express onboarding flow',
        screen: 'Connect → Account Links',
      },
    },
    {
      title: 'Custom onboarding: collecting information via Account Tokens',
      body: `For Custom accounts, your UI collects the information and submits it via Account Tokens (for sensitive PII like SSN and date of birth) or directly via accounts.update for non-sensitive fields.\n\nAccount Tokens exist so the frontend can pass sensitive identity data directly to Stripe without it touching your servers. This keeps your platform out of PCI and data-handling scope for this information. You'd use Stripe.js on the frontend to create the token, then pass the token ID to your backend, which sends it to Stripe via accounts.update.\n\nThis architecture is intentional. It mirrors how Stripe.js handles card numbers: sensitive data flows from the browser directly to Stripe, and your servers only ever see opaque token IDs.`,
      callouts: [
        {
          kind: 'warning' as CalloutKind,
          text: `Never collect SSN, full date of birth, or ID document numbers and transmit them through your own backend. Use Account Tokens to ensure this data flows directly from browser to Stripe. Handling this data yourself puts you in scope for additional regulatory requirements.`,
        },
      ],
    },
    {
      title: 'Handling verification requirements dynamically',
      body: `The requirements object on an Account has four arrays. currently_due contains items that must be provided before the deadline or capabilities are disabled. eventually_due contains items that must be provided at some point. past_due contains items where the deadline has passed and the capability is already disabled. pending_verification contains items that have been submitted and are being reviewed by Stripe.\n\nBuild your onboarding UI to surface currently_due items prominently. This is the most common reason accounts get stuck in an incomplete state. If you ignore these requirements, the account's capabilities will degrade and transactions will fail.\n\nFor TaskFlow, if a freelancer's account has items in currently_due, show them a prominent banner on their dashboard linking back to the onboarding flow. Don't bury it in a settings page they'll never visit.`,
      gif: {
        caption:
          'Record: Account detail in Dashboard showing requirements section with currently_due vs eventually_due fields populated',
        screen: 'Dashboard → Connect → Account Detail',
      },
    },
    {
      title: 'Persons and the business structure',
      body: `For businesses (not individuals), many capabilities require information about Persons: owners, directors, executives, and the representative completing onboarding. Use the persons API to create Person objects with ownership and relationship information.\n\nFailing to complete person requirements is one of the top causes of accounts being stuck in pending verification. Every Custom account needs a designated representative. If the business has owners with 25% or more ownership, those owners must also be registered as Persons.\n\nFor TaskFlow, if a freelancer registers as an LLC, you'll need to collect information about the business owners in addition to the representative. Your onboarding flow needs to handle both individual and business account types gracefully.`,
    },
    {
      title: 'Testing verification states locally',
      body: `Use Stripe's test-mode tokens to simulate different verification outcomes without real identity documents. SSN last four digits of 0000 triggers instant successful verification. 3333 triggers a verification failure. These let you exercise all three paths: success, needs-more-info, and failure.\n\nBuild a test onboarding scenario that exercises all three paths. The success path is easy to test. The failure path is where most platforms discover gaps in their UX.\n\nFor TaskFlow, this means you can test the entire freelancer onboarding flow without real identity documents, including the edge case where Stripe requests additional documentation or where verification fails outright.`,
      callouts: [
        {
          kind: 'tip' as CalloutKind,
          text: `Test the failure path thoroughly. Many platforms build a happy-path onboarding flow and discover in production that they have no UI for handling verification failures. The user gets stuck with no way to resolve the issue.`,
        },
      ],
    },
  ],
  doneLabel: `I can create and onboard connected accounts for TaskFlow`,
}

// ---------------------------------------------------------------------------
// Module 5 - Capabilities, Requirements & the Compliance Lifecycle
// ---------------------------------------------------------------------------

const MODULE_5_CAPABILITIES_COMPLIANCE: WorkshopModule = {
  id: 'capabilities-compliance',
  number: 5,
  title: 'Capabilities, Requirements & the Compliance Lifecycle',
  estMinutes: 10,
  intro: `Compliance is not a one-time event. It's an ongoing operational loop. Accounts that were once fully verified can re-enter a requirements state due to regulatory changes, document expiry, or business changes. Platforms that treat onboarding as a funnel rather than a lifecycle will encounter production incidents.`,
  narrative: `TaskFlow has freelancers onboarded and processing payments. Now you need to handle the ongoing compliance lifecycle. Stripe will periodically request updated information, and your platform needs to respond.`,
  overviewAddition: `Managing the ongoing compliance lifecycle after onboarding.`,
  steps: [
    {
      title: 'Capability statuses and what they mean operationally',
      body: `Map each status to a concrete consequence. Active means fully functional: charges, transfers, and payouts work as expected. Pending means the capability was recently requested and Stripe is processing it. Inactive means the capability is blocked, so don't attempt transactions that depend on it. Unrequested means the capability isn't available until you explicitly request it.\n\nA charge processing successfully doesn't guarantee transfers will succeed. They're gated by different capabilities. Your platform needs to check both before initiating a two-sided transaction.\n\nFor TaskFlow, check both card_payments and transfers status before routing a client payment to a freelancer. If either is inactive, surface the issue to the freelancer and queue the payment for retry once the capability is restored.`,
      callouts: [
        {
          kind: 'warning' as CalloutKind,
          text: `A common production bug is routing money to an account with inactive transfers capability. The charge succeeds (card_payments is active) but the payout to the connected account fails silently. Always verify both capabilities for two-sided transactions.`,
        },
      ],
    },
    {
      title: 'Handling account.updated webhooks',
      body: `This is the most important webhook in a Connect integration. Every change to an account's requirements, capabilities, or verification status fires an account.updated event. Your platform must process this event and act on it.\n\nThe response depends on what changed. If capabilities degraded, block transactions and notify the account owner. If new requirements appeared in currently_due, trigger a re-verification flow. If requirements were satisfied and capabilities became active, re-enable transaction processing for that account.\n\nFor TaskFlow, when a freelancer's account.updated event arrives with new items in currently_due, send them an email with a link to complete the updated requirements. If their card_payments capability becomes inactive, stop routing new client payments to them until it's restored.`,
      callouts: [
        {
          kind: 'stripe-fact' as CalloutKind,
          text: `account.updated is the highest-volume webhook in most Connect integrations. It fires not just for requirement changes but also for any account property update. Build your handler to efficiently check what actually changed rather than reprocessing everything on every event.`,
        },
      ],
    },
    {
      title: 'Designing the re-verification flow',
      body: `When account.updated indicates new requirements, your platform needs to re-enter the account into an onboarding flow. For Express accounts, generate a new Account Link with type: 'account_onboarding'. For Custom accounts, present the specific fields from requirements.currently_due in your own UI.\n\nIgnoring these events is not an option. Capabilities will degrade on a timeline, and the platform will see failed payouts or blocked charges. The re-verification flow should feel natural to the user, not like a punitive experience.\n\nFor TaskFlow, build a "Complete your profile" flow that's triggered by the webhook and shows the freelancer exactly what Stripe needs. Frame it as a quick update, not a restart of onboarding.`,
    },
    {
      title: 'Eventual requirements and grace periods',
      body: `The difference between eventually_due and currently_due matters operationally. eventually_due means Stripe will need this information before a future date, and if you don't provide it by then, the item moves to currently_due with a tighter deadline. currently_due means collect it now or capabilities will degrade.\n\nStripe gives platforms advance notice via eventually_due before an item becomes currently_due. Build monitoring for eventually_due items as a proactive step. Waiting until they become currently_due means your users are already on a countdown to capability degradation.\n\nFor TaskFlow, set up a weekly job that checks all freelancer accounts for eventually_due items and sends gentle reminder emails before the deadline. This keeps freelancers earning without interruption and reduces the volume of urgent "your account is about to be restricted" emails.`,
      callouts: [
        {
          kind: 'tip' as CalloutKind,
          text: `Treat eventually_due as an early warning system, not something to ignore. By the time an item moves to currently_due, you're already on a countdown to capability degradation. Proactive collection keeps your freelancers earning without interruption.`,
        },
      ],
    },
    {
      title: 'Risk holds and restricted accounts',
      body: `Stripe may place restrictions on an account due to risk signals: elevated dispute rates, suspicious activity, or incomplete compliance documentation. The platform can see restricted capabilities and reason codes in the requirements object.\n\nThe platform can't override Stripe's risk decisions. The resolution path involves supporting the connected account through Stripe's process and providing evidence if applicable. This requires a support workflow, not just a technical integration.\n\nFor TaskFlow, if a freelancer's account is restricted, you need a support workflow that helps them understand what happened and what they need to provide. Don't just show a generic "account restricted" message. Surface the specific reason codes and guide them through the resolution steps.`,
    },
  ],
  doneLabel: `I understand the compliance lifecycle and how to handle it`,
}

// ---------------------------------------------------------------------------
// Module 6 - Charge Types: Directing Money Flows
// ---------------------------------------------------------------------------

const MODULE_6_CHARGE_TYPES: WorkshopModule = {
  id: 'charge-types-money-flows',
  number: 6,
  title: 'Charge Types: Directing Money Flows',
  estMinutes: 12,
  intro: `The charge type you choose determines statement descriptors, dispute liability, fund flow timing, and your platform's relationship to each transaction. Choosing the wrong charge type is an architectural decision that's expensive to undo.`,
  narrative: `TaskFlow needs to decide how money flows from clients to freelancers. This module covers each charge type, when to use it, and the production consequences of each choice.`,
  overviewAddition: `How money actually moves through your platform.`,
  steps: [
    {
      title: 'Direct charges',
      body: `The charge is created directly on the connected account using the Stripe-Account header. The connected account's name appears on the cardholder's statement, not the platform's. Funds land in the connected account's balance first. Dispute liability sits with the connected account. Stripe fees are charged to the connected account.\n\nThe platform collects its fee via application_fee_amount, which is withheld from the charge and credited to the platform's balance. Best for marketplaces where the seller has an established brand and should own the customer relationship.\n\nFor TaskFlow, this means "Jane's Design Studio" appears on the client's credit card statement, and Jane handles any disputes. TaskFlow collects its 15% via application_fee_amount. This works well when freelancers have their own brand identity and want customers to recognize them on their statement.`,
      callouts: [
        {
          kind: 'explanation' as CalloutKind,
          text: `Direct charges work like subletting. The freelancer is the landlord (merchant of record), you're the property manager (platform collecting a fee), and Stripe is the building owner (infrastructure). The tenant (customer) has a relationship with the landlord, not you.`,
        },
      ],
    },
    {
      title: 'Destination charges',
      body: `The charge is created on the platform, but a destination connected account is specified via transfer_data.destination. Funds land in the platform's account first, then Stripe automatically creates a Transfer to the destination account.\n\nThe platform's name appears on the statement. Dispute liability stays with the platform. This is the most common choice for platforms that own the customer experience and want the statement descriptor to reflect their brand rather than the individual connected account.\n\nFor TaskFlow, this means "TaskFlow" appears on the client's statement, and TaskFlow handles disputes. The freelancer receives their share via automatic transfer. This works well when the client's relationship is with TaskFlow as a brand, not with the individual freelancer.`,
      callouts: [
        {
          kind: 'info' as CalloutKind,
          text: `With destination charges, the platform is the merchant of record. This has tax and compliance implications. Consult with your legal and finance team on whether this is appropriate for your business model.`,
        },
      ],
    },
    {
      title: 'Separate charges and transfers',
      body: `The charge and the transfer are completely decoupled. Create the charge on the platform, then create one or more Transfers at any point in time. This is the most flexible model.\n\nYou can split a single charge across multiple connected accounts, delay payouts until business conditions are met, or conditionally transfer based on custom logic. The downside is more complexity: you manage the charge-to-transfer relationship yourself, and refunds require manual transfer reversal.\n\nFor TaskFlow, if a project involves two freelancers collaborating, you can charge the client once and split the payout between both freelancers at project completion. Or you can hold funds in an escrow-like pattern until the client approves the deliverables.`,
    },
    {
      title: 'Transfer-only (top-ups and manual transfers)',
      body: `This covers scenarios where no Connect charge is involved. The platform uses its own Stripe balance to fund transfers to connected accounts. No customer-facing payment is created.\n\nUse cases include paying out connected accounts for work done offline, promotional credits, referral bonuses, or correcting an underpayment from a previous transaction. The platform's balance must have sufficient funds to cover the transfer.\n\nFor TaskFlow, you might use this to pay a freelancer a bonus for hitting a performance milestone, issue a promotional credit for referring new freelancers, or correct an underpayment from a previous project. These are platform-initiated fund movements, not customer-facing charges.`,
    },
    {
      title: 'The statement descriptor matrix',
      body: `Statement descriptors determine what appears on the cardholder's credit card or bank statement. They vary by charge type. Direct charges use the connected account's descriptor. Destination charges use the platform's descriptor with an optional suffix from the connected account. Custom accounts let the platform set the descriptor explicitly.\n\nDescriptors affect dispute rates. A customer who doesn't recognize the charge descriptor is significantly more likely to file a dispute. This is not a cosmetic decision.\n\nFor TaskFlow, if you use destination charges, make sure "TaskFlow" is recognizable to clients. Consider adding the freelancer's name as a suffix (e.g., "TASKFLOW* Jane D.") so the client can associate the charge with the specific project.`,
      gif: {
        caption:
          'Record: Table showing statement descriptor ownership by charge type with examples',
        screen: 'Connect → Statement Descriptors',
      },
    },
    {
      title: 'Refunds across charge types',
      body: `Refunds differ significantly by charge type. Direct charge refunds are initiated on the connected account using the Stripe-Account header. Destination charge refunds go through the platform and must reverse the transfer if funds have already moved to the connected account.\n\nSeparate charges and transfers require manual reversal of the transfer before issuing the refund on the charge. This is one of the most common operational pain points for platforms. If you don't reverse the transfer first, the connected account may end up with a negative balance.\n\nBuild your refund flows with the charge type in mind from the start. Retrofitting refund logic after launch is both technically complex and operationally risky.`,
      callouts: [
        {
          kind: 'warning' as CalloutKind,
          text: `Initiating a refund on a destination charge without first reversing the transfer can result in a negative balance on the connected account. Handle transfer reversals explicitly. This is one of the top reasons Connect platforms contact Stripe support.`,
        },
      ],
    },
  ],
  doneLabel: `I understand charge types and can choose the right one for TaskFlow`,
}

// ---------------------------------------------------------------------------
// Module 7 - Application Fees & Platform Revenue
// ---------------------------------------------------------------------------

const MODULE_7_APPLICATION_FEES: WorkshopModule = {
  id: 'application-fees-revenue',
  number: 7,
  title: 'Application Fees & Platform Revenue',
  estMinutes: 10,
  intro: `Connect gives platforms multiple mechanisms to collect revenue from transactions. Understanding the difference between application fees, transfer amounts, and platform-level charges is essential for building a fee structure that's both flexible and auditable.`,
  narrative: `TaskFlow needs a revenue model. This module covers how to collect platform fees, who pays Stripe's processing costs, and what happens to your fees when things go wrong.`,
  overviewAddition: `Building your platform's revenue model on Connect.`,
  steps: [
    {
      title: 'application_fee_amount: the primary fee mechanism',
      body: `For direct and destination charges, application_fee_amount is the amount (in the smallest currency unit, like cents) that Stripe withholds from the transaction and credits to the platform's balance before transferring the remainder to the connected account. It's declared at charge creation time and is atomic with the charge.\n\nIf the charge succeeds, the fee is collected. There's no separate billing step, no delayed collection, and no reconciliation gap. This makes it the cleanest revenue mechanism in Connect.\n\nFor TaskFlow, a $100 project with a 15% platform fee means application_fee_amount: 1500 (cents), and the freelancer receives $85. The fee is collected the instant the charge succeeds.`,
      callouts: [
        {
          kind: 'stripe-fact' as CalloutKind,
          text: `Application fees are the cleanest revenue mechanism in Connect because they're atomic with the charge. There's no separate billing step, no delayed collection, and no reconciliation gap. The fee is collected the instant the charge succeeds.`,
        },
      ],
    },
    {
      title: 'Calculating fees: flat, percentage, and tiered',
      body: `Three common fee structures work well with Connect. Flat per-transaction fees ($2.00 per transaction) are simple to implement and predictable for users. Percentage of transaction value (10% of each charge) scales with transaction size. Tiered models (15% for the first $1,000 and 10% after) incentivize higher-value transactions.\n\napplication_fee_amount must be an integer in the smallest currency unit, so floating-point arithmetic must be handled carefully. Use Math.round() consistently and document your rounding convention.\n\nFor TaskFlow, you might charge 15% on projects under $500 and 10% on projects over $500 to incentivize higher-value work. Calculate fees server-side to prevent manipulation, and always verify the fee amount before creating the charge.`,
      callouts: [
        {
          kind: 'tip' as CalloutKind,
          text: `Always round fees using Math.floor or Math.round consistently. Rounding inconsistencies compound at scale and create reconciliation headaches. Pick one method and use it everywhere.`,
        },
      ],
    },
    {
      title: 'Transfer amounts in separate charges',
      body: `When using separate charges and transfers, the fee is implicit. It's the difference between what you charged and what you transferred. There's no application_fee_amount parameter. This gives maximum flexibility but requires more careful bookkeeping.\n\nYour platform must track the intended fee separately because there's no Stripe object that explicitly labels the difference as a platform fee. You charged $100 and transferred $85, but only your system knows the $15 was intentional, not a calculation error.\n\nFor TaskFlow, if you use separate charges and transfers for complex multi-party payouts, build a fee ledger in your own database. Record the intended fee, actual fee, charge ID, and transfer IDs for every transaction. You'll need this for financial reporting and dispute resolution.`,
    },
    {
      title: 'Who pays Stripe processing fees',
      body: `Three configurations determine who absorbs Stripe's processing costs. First, the connected account pays (default for direct charges): Stripe's fee is deducted from the connected account's share. Second, the platform pays (default for destination charges): Stripe's fee comes out of the platform's revenue. Third, a split arrangement where the platform covers the processing fee but the connected account absorbs refund and dispute fees.\n\nThis has a direct impact on unit economics. For TaskFlow, if you use destination charges, you're paying Stripe's 2.9% + 30 cents on every transaction. If your platform fee is 15% on a $100 charge, you collect $15 in application fees but pay roughly $3.20 in processing, leaving $11.80 in actual margin.\n\nModel your unit economics before choosing a charge type, especially for small transactions where fixed costs dominate.`,
      callouts: [
        {
          kind: 'info' as CalloutKind,
          text: `Model your unit economics before choosing a charge type. If your platform fee is 5% and you're paying Stripe's 2.9% + 30 cents processing fee (as the default for destination charges), your actual margin is much thinner than you think, especially on small transactions.`,
        },
      ],
    },
    {
      title: 'Recovering fees on refunds',
      body: `When a charge is refunded, the application fee is also refunded by default. This means your platform's revenue reverses along with the payment. For partial refunds, or when the platform has earned its fee regardless of the refund, the refund_application_fee parameter controls this behavior.\n\nSet refund_application_fee to false to retain the platform fee even when the charge is refunded. Consider when this makes sense and the UX implications. Users may feel charged unfairly if they're refunded the charge amount but not the platform fee.\n\nFor TaskFlow, you might retain the fee on cancellations after work has started (the freelancer delivered partial value) but refund it fully for cancellations before any work is delivered. Document this policy clearly in your terms of service.`,
    },
    {
      title: 'Negative balances and platform liability',
      body: `If a connected account's balance goes negative due to refunds, disputes, or Stripe fees that exceed available funds, and the account can't cover the deficit, Stripe will look to the platform to cover the shortfall.\n\nUnderstand the reserve account mechanism, how to monitor connected account balances, and how to build early-warning systems for accounts trending toward negative. This is not a theoretical risk. It's a real financial exposure that has caught early-stage marketplaces off guard.\n\nFor TaskFlow, if a freelancer's account goes negative due to a dispute on a large project, TaskFlow's platform balance is debited to cover the shortfall. If this happens across multiple freelancers simultaneously, it can create a serious cash flow problem for your platform.`,
      callouts: [
        {
          kind: 'warning' as CalloutKind,
          text: `Negative balance exposure is one of the top financial risks for Connect platforms. Implement balance monitoring and consider whether your platform agreement should include reserve requirements for high-risk categories of connected accounts. This has caught early-stage marketplaces off guard.`,
        },
      ],
    },
  ],
  doneLabel: `I've designed TaskFlow's revenue model and fee structure`,
}

// ---------------------------------------------------------------------------
// Module 8 - Payouts: Timing, Control & Failure Handling
// ---------------------------------------------------------------------------

const MODULE_8_PAYOUTS: WorkshopModule = {
  id: 'payouts-timing-control',
  number: 8,
  title: 'Payouts: Timing, Control & Failure Handling',
  estMinutes: 12,
  intro: `Payouts are where Connect platforms most often encounter production incidents. The combination of bank routing variability, payout schedule options, and Instant Payout eligibility requirements creates a surface area that requires deliberate design.`,
  narrative: `TaskFlow's freelancers want to get paid. This module covers how payout schedules work, how to handle failures, and how to offer premium payout features.`,
  overviewAddition: `Getting money to your connected accounts reliably.`,
  steps: [
    {
      title: 'How payouts work in Connect',
      body: `The payout lifecycle has three phases. First, funds arrive in the connected account's Stripe balance from transfers or direct charges. Second, funds accumulate until the payout schedule triggers. Third, Stripe sends the funds to the connected account's external bank account or debit card.\n\nFor Custom accounts, the platform controls the payout schedule. For Express, the user controls it via the Express Dashboard. For Standard, the connected account manages it entirely through their own Stripe Dashboard.\n\nFor TaskFlow using Express, freelancers choose their own payout frequency through the Express Dashboard, but you can set a reasonable default (like weekly) at account creation time.`,
    },
    {
      title: 'Payout schedules and manual payouts',
      body: `Three schedule modes are available. Automatic daily sends payouts every business day. Automatic weekly or monthly sends payouts on a fixed schedule. Manual payouts give the platform maximum control: funds stay in the Stripe balance until your platform explicitly calls payouts.create.\n\nManual payouts are essential for escrow models, dispute hold periods, or any scenario where funds shouldn't flow immediately. The platform decides exactly when each payout happens.\n\nFor TaskFlow, you might use manual payouts for projects with a review period, holding funds until the client approves the deliverables. Once approved, your backend triggers the payout. This protects both the client (who can dispute before payout) and the platform (which avoids negative balance risk on disputed projects).`,
      callouts: [
        {
          kind: 'tip' as CalloutKind,
          text: `Manual payout schedules are the safest starting point for new platforms. You can always relax to automatic daily payouts later, but switching from automatic to manual after freelancers are used to daily payouts creates friction and support tickets.`,
        },
      ],
    },
    {
      title: 'Instant Payouts',
      body: `Stripe supports Instant Payouts to eligible debit cards and bank accounts, settling within 30 minutes. Eligibility requirements include the connected account having a linked eligible debit card or bank account that supports instant transfers.\n\nThere's an additional fee for Instant Payouts (typically 1% with a minimum and maximum). Check eligibility before surfacing the option in your UI. Don't show a "Get paid instantly" button to users who aren't eligible.\n\nFor TaskFlow, Instant Payouts could be a premium feature. Freelancers who want their money today pay a small fee for the speed. This is a common monetization strategy for gig platforms and marketplaces.`,
      callouts: [
        {
          kind: 'info' as CalloutKind,
          text: `Instant Payout eligibility varies by account and can change. Always check the instant_available field at payout time rather than assuming eligibility from a one-time check.`,
        },
      ],
    },
    {
      title: 'Payout failure modes and remediation',
      body: `The four most common failure reasons are: incorrect bank account details (account_closed, no_account), bank-side blocks (debit_not_authorized), Stripe-side holds (account_unverified, could_not_process), and card payouts rejected by the issuer.\n\nFor each failure, a payout.failed webhook fires with a failure_code and failure_message. Your platform must map the failure code to a user-facing message and trigger re-entry into the bank account update flow. Generic error messages like "payout failed" don't help the user fix the problem.\n\nFor TaskFlow, a failed payout means a freelancer didn't get paid. Your support team needs to know immediately. Build a notification system that alerts both your operations team and the affected freelancer the moment a payout.failed event arrives.`,
      callouts: [
        {
          kind: 'warning' as CalloutKind,
          text: `Payout failures are the number one source of support tickets for Connect platforms. Build a robust notification system that alerts both your operations team and the affected freelancer the moment a payout.failed event arrives. Don't wait for the freelancer to notice they didn't get paid.`,
        },
      ],
    },
    {
      title: 'Bank account and debit card management',
      body: `Add and update external accounts (bank accounts and debit cards) for Custom connected accounts via the external_accounts API. For bank accounts, there's a verification flow: micro-deposits for ACH accounts (two small deposits that the user verifies), or instant verification for supported banks via financial connections.\n\nSet default_for_currency when an account has multiple external accounts. This determines which account receives payouts for each currency.\n\nFor TaskFlow with Express accounts, freelancers manage their own bank accounts through the Express Dashboard. But your platform should still handle the edge case where a freelancer hasn't added a bank account. Check for the presence of an external account before attempting payouts, and prompt them to complete setup if it's missing.`,
    },
    {
      title: 'Payout reconciliation',
      body: `At scale, platforms need to reconcile payouts by mapping each payout to the underlying charges and transfers it covers. The Balance Transactions API is the primary reconciliation tool. Every payout has associated balance transactions that show its composition: which charges, transfers, fees, and adjustments contributed to the payout amount.\n\nFor higher-volume platforms, Stripe Sigma provides SQL access to the full transaction history. The Reporting API can generate scheduled reports in CSV or other formats for automated processing.\n\nFor TaskFlow's finance team, this is how you build the monthly report showing which client payments funded which freelancer payouts, what platform fees were collected, and where any discrepancies exist. Get reconciliation right early. Retroactively building it after months of transactions is painful.`,
    },
  ],
  doneLabel: `I understand payout operations and failure handling`,
}

// ---------------------------------------------------------------------------
// Module 9 - The Connect Dashboard & Account Management
// ---------------------------------------------------------------------------

const MODULE_9_DASHBOARD_MANAGEMENT: WorkshopModule = {
  id: 'dashboard-account-management',
  number: 9,
  title: 'The Connect Dashboard & Account Management',
  estMinutes: 8,
  intro: `Stripe provides platform-level tooling for monitoring connected accounts, but production platforms at scale need to augment this with their own account management workflows. This module covers what's available out of the box and where you need to build.`,
  narrative: `TaskFlow has dozens of freelancer accounts now. Let's explore how to manage them operationally using the Dashboard and API.`,
  overviewAddition: `Operational tools for managing connected accounts.`,
  steps: [
    {
      title: "The platform's Connect Dashboard",
      body: `The Connect section of the Dashboard is your primary operational visibility tool during early-stage operation. It shows your accounts list with filtering by capability status, the ability to view activity on behalf of a connected account, and overview metrics.\n\nPay attention to the distinction between the platform's own balance view and the aggregate view of connected account balances. These are different pools of money with different owners. Your platform balance shows application fees you've collected. Connected account balances show funds pending transfer or payout.\n\nFor TaskFlow, use this to spot freelancers with pending requirements or inactive capabilities before they affect client payments. Filter by capability status to find accounts that need attention.`,
      gif: {
        caption:
          'Record: Stripe Dashboard Connect accounts list with capability status column, filtered to show accounts with inactive capabilities',
        screen: 'Dashboard → Connect → Accounts',
      },
      dashboardLink: {
        label: 'Open Connect accounts',
        url: '/connect/accounts',
      },
    },
    {
      title: 'The Express Dashboard for connected accounts',
      body: `Express accounts get a Stripe-hosted dashboard for payout management, tax forms, and transaction history. They can view their balance and payout history, update their bank account, and download 1099s. They can't see full charge detail or manage their Stripe integration directly.\n\nGenerate Express Dashboard login links via the API for seamless access from your platform. Each link is single-use and expires quickly, so generate them on-demand when the user clicks.\n\nFor TaskFlow, embed a "View your payouts" button in the freelancer dashboard that generates a fresh login link each time the freelancer clicks it. This gives freelancers self-service access to their payout details without you building a custom payout history UI.`,
    },
    {
      title: 'Acting as a connected account',
      body: `Your platform can use the Stripe-Account header to make API calls as if you were the connected account. This is how you retrieve their charges, create payouts, or inspect their balance. It's the same mechanism used for creating charges but applied to read operations and account management.\n\nOnly use this for legitimate operational reasons. Build an audit log of all administrative actions taken on behalf of connected accounts. This is both a security best practice and a requirement for many regulatory frameworks.\n\nFor TaskFlow, you'd use this to build a freelancer earnings dashboard showing their payment history. Query their charges, transfers, and payouts using the Stripe-Account header and present the data in your own UI.`,
      callouts: [
        {
          kind: 'warning' as CalloutKind,
          text: `The Stripe-Account header gives your platform full access to the connected account's Stripe resources. Treat this like any privileged credential. Log all administrative actions taken on behalf of connected accounts and restrict access to authorized personnel and automated systems only.`,
        },
      ],
    },
    {
      title: 'Account metadata and your data model',
      body: `The Account object supports a metadata hash with up to 50 keys. Store your platform's internal identifiers on the Stripe Account object: user ID, org ID, service tier, or operational flags.\n\nThis makes it significantly easier to correlate Stripe webhook events back to your data model without a separate database lookup. When an account.updated event arrives, the metadata is included in the payload, so you can immediately identify which internal user it belongs to.\n\nFor TaskFlow, store the freelancer's internal user ID and their service category in metadata at account creation time. This means every webhook handler can route the event to the right freelancer record without querying your database first.`,
      callouts: [
        {
          kind: 'tip' as CalloutKind,
          text: `Store your platform's user_id in metadata at account creation time. Every webhook that includes the Account object will carry this identifier, making event routing in your webhook handler trivially easy.`,
        },
      ],
    },
    {
      title: 'Searching and listing accounts at scale',
      body: `The accounts.list API supports filtering but not full-text search. At small scale, paginating through the API is fine. At thousands of accounts, it becomes a performance bottleneck and a rate limit risk.\n\nThe production pattern is to mirror relevant account data into your own database. Subscribe to account.updated webhooks, persist capability status, requirements, payout schedule, and balance flags locally, and query your own database for account list views. This is eventually consistent, and your UI should reflect that.\n\nFor TaskFlow at 10,000+ freelancers, querying the Stripe API for every account list view would hit rate limits and add latency. Mirror account data locally and keep it synchronized via webhooks. Your admin dashboard queries your database, not Stripe's API.`,
    },
  ],
  doneLabel: `I can manage TaskFlow's connected accounts operationally`,
}

// ---------------------------------------------------------------------------
// Module 10 - Webhooks in a Connect Integration
// ---------------------------------------------------------------------------

const MODULE_10_CONNECT_WEBHOOKS: WorkshopModule = {
  id: 'connect-webhooks',
  number: 10,
  title: 'Webhooks in a Connect Integration',
  estMinutes: 10,
  intro: `Connect introduces webhook patterns that differ meaningfully from standard Stripe webhooks. Getting this right is not optional. Missed or mis-routed events cause real production failures.`,
  narrative: `TaskFlow needs to respond to events across all freelancer accounts in real time. This module covers how Connect webhooks work and the critical events you must handle.`,
  overviewAddition: `Event-driven architecture for your Connect platform.`,
  steps: [
    {
      title: 'Two types of Connect webhooks',
      body: `Connect has two webhook delivery modes. Platform-level webhooks are sent to your endpoint for events on your own account and for all connected accounts. Account-level webhooks are registered on individual connected accounts and receive events scoped only to that account.\n\nMost platforms use platform-level webhooks with the connect option enabled in the webhook endpoint configuration. This gives you a single stream of events from all connected accounts, which is simpler to manage than registering individual webhooks on each of your connected accounts.\n\nFor TaskFlow, one webhook endpoint handles events from every freelancer account. You configure it once in your Dashboard with Connect events enabled, and Stripe delivers events from all connected accounts to that single endpoint.`,
      callouts: [
        {
          kind: 'stripe-fact' as CalloutKind,
          text: `Platform-level Connect webhooks with connect: true are the recommended approach for most platforms. They give you a single stream of events from all connected accounts, which is simpler to manage than registering individual webhooks on each account.`,
        },
      ],
    },
    {
      title: 'Identifying the source account in webhook payloads',
      body: `When a platform webhook receives an event from a connected account, the event object includes an account field containing the connected account's ID (starting with acct_). Your handler must read this field and route the event to the correct account context in your system.\n\nIf the account field is absent, the event is for your platform's own account. If it's present, it's for the connected account specified. This routing logic is the first thing your webhook handler should do.\n\nFor TaskFlow, when you receive a payout.failed event, you check event.account to determine which freelancer's payout failed, look up their internal user ID from your database (or from account metadata), and trigger the appropriate notification and remediation flow.`,
    },
    {
      title: 'Critical events to handle',
      body: `Here's the minimum viable event set for a production Connect platform. account.updated: capability changes, requirement changes, and verification status. This is your compliance lifecycle driver. account.application.deauthorized: a Standard account disconnected from your platform.\n\npayment_intent.succeeded and payment_intent.payment_failed: charge outcomes for transactions involving connected accounts. transfer.created and transfer.failed: fund movement to connected accounts. payout.paid and payout.failed: payout outcomes for connected accounts. capability.updated: status changes for specific capabilities.\n\nFor each of these, consider the production consequence of not handling it. Missing account.updated means you won't know when a freelancer's capabilities degrade. Missing payout.failed means freelancers discover they weren't paid by checking their bank account, not by a notification from your platform.`,
      callouts: [
        {
          kind: 'warning' as CalloutKind,
          text: `Not handling payout.failed means freelancers discover they weren't paid by checking their bank account, not by a notification from your platform. This destroys trust faster than almost any other operational failure. Handle this event on day one.`,
        },
      ],
    },
    {
      title: 'Idempotency in Connect webhook handlers',
      body: `At scale, Stripe delivers events at-least-once. Your handlers must be idempotent. Processing the same event twice must produce the same result as processing it once.\n\nUse the event ID as an idempotency key. Before processing, check if the event ID exists in your processed_events table. If it does, return 200 immediately. If it doesn't, insert it, process the event, then return 200. This prevents duplicate processing without complex distributed locking.\n\nFor TaskFlow, if a payout.paid event is delivered twice, you shouldn't send the freelancer two "you got paid" emails or credit their account balance twice. The idempotency check catches the duplicate and skips processing.`,
      callouts: [
        {
          kind: 'tip' as CalloutKind,
          text: `A simple idempotency pattern: before processing any event, check if event.id exists in your processed_events table. If it does, return 200 immediately. If it doesn't, insert it, process the event, then return 200. This prevents duplicate processing without complex locking.`,
        },
      ],
    },
    {
      title: 'Testing Connect webhooks locally',
      body: `Use the Stripe CLI to forward connected account events to a local endpoint: stripe listen --forward-connect-to localhost:3000/webhook. The distinction between --forward-to (platform events) and --forward-connect-to (connected account events) matters. They're different event streams.\n\nDuring local development, you need both running to test your full webhook handler. Platform events include things like your own balance changes. Connected account events include charge outcomes, payout statuses, and capability changes for your connected accounts.\n\nFor TaskFlow, run two terminal sessions during development: one forwarding platform events and one forwarding connected account events. Many Connect bugs are caused by developers only testing one event stream and missing events from the other.`,
      callouts: [
        {
          kind: 'tip' as CalloutKind,
          text: `Run both --forward-to and --forward-connect-to in separate terminal sessions during Connect development. Many Connect bugs are caused by developers only testing one event stream.`,
        },
      ],
    },
  ],
  doneLabel: `I can build and test a production Connect webhook handler`,
}

// ---------------------------------------------------------------------------
// Module 11 - Risk, Disputes & Platform Liability
// ---------------------------------------------------------------------------

const MODULE_11_RISK_DISPUTES: WorkshopModule = {
  id: 'risk-disputes-liability',
  number: 11,
  title: 'Risk, Disputes & Platform Liability',
  estMinutes: 10,
  intro: `Connect platforms carry financial exposure that standard Stripe integrations don't. Understanding where dispute liability sits, how to manage platform-level fraud controls, and what happens when connected accounts fail is essential before going live.`,
  narrative: `TaskFlow is processing real money now. This module covers the financial risks you need to manage and the controls available to protect your platform.`,
  overviewAddition: `Managing financial risk across your connected accounts.`,
  steps: [
    {
      title: 'Dispute liability by charge type',
      body: `Dispute liability maps directly to charge type. Direct charges: the connected account is liable, and the dispute is their responsibility to handle. Destination charges: the platform is liable, and the platform must submit evidence and manage the dispute. Separate charges and transfers: the platform is liable for the charge portion.\n\nThis is not just a technical distinction. It determines your chargeback rate exposure, your financial risk model, and who your operations team needs to support. For destination charges, every disputed freelancer project becomes the platform's problem.\n\nFor TaskFlow, if you use destination charges, your dispute rate is calculated across all charges, not per freelancer. One freelancer with a high dispute rate affects your entire platform's standing with the card networks.`,
      gif: {
        caption:
          'Record: Dispute detail in Dashboard showing platform vs connected account liability indicator',
        screen: 'Dashboard → Disputes → Detail',
      },
      callouts: [
        {
          kind: 'info' as CalloutKind,
          text: `Your platform's dispute rate is calculated across all charges you're liable for. If you use destination charges and one connected account generates many disputes, it affects your platform's overall dispute rate with the card networks, not just that one account's rate.`,
        },
      ],
    },
    {
      title: 'Platform-level Stripe Radar',
      body: `Platforms can apply Radar rules at the platform level that apply to all charges processed through the platform. This gives you a first line of defense against fraud across your connected accounts, regardless of whether individual accounts have their own fraud controls.\n\nKey use cases include blocking high-risk card BINs across the platform, requiring 3D Secure for charges above a threshold, and implementing velocity checks that span multiple connected accounts (e.g., the same card used across different freelancers in a short period).\n\nFor TaskFlow, you might block cards from countries where you don't operate, require 3D Secure for charges over $500, or flag transactions where the same card is used with multiple freelancers in a 24-hour window.`,
    },
    {
      title: 'Account-level fraud controls and reviews',
      body: `For Custom accounts, the platform can configure Radar rules and manual review queues on behalf of connected accounts. This is appropriate for platforms that want consistent fraud controls across their merchant base, particularly marketplaces where connected accounts may not have fraud operations capability.\n\nYou can set different Radar rule sets for different categories of connected accounts. High-risk categories (digital services, high-value transactions) might get stricter rules than established, low-risk merchants.\n\nFor TaskFlow, if certain freelancer categories like digital design or consulting have higher dispute rates than physical service categories, you could apply stricter Radar rules to charges in those categories. This is a data-driven decision that you refine over time.`,
    },
    {
      title: 'Negative balance protection and reserves',
      body: `When a connected account has more disputes or refunds than available balance, the platform is exposed to that negative balance. Stripe's reserve account mechanism lets you hold a percentage of each connected account's funds as a buffer against this risk.\n\nMonitor for accounts approaching negative states. Build a monitoring job that alerts your team when a connected account's balance falls below a configurable threshold. Track dispute rates per connected account and flag accounts that exceed your risk tolerance.\n\nFor TaskFlow, a freelancer who delivers poor work and generates multiple disputes can cost your platform money directly. Implement per-account dispute rate monitoring and consider suspending accounts that exceed a threshold (e.g., 1% dispute rate over a rolling 90-day window).`,
      callouts: [
        {
          kind: 'warning' as CalloutKind,
          text: `Stripe will debit the platform for connected account negative balances. This is not a hypothetical. It's a real financial exposure that has caught early-stage marketplaces off guard. Size your reserve strategy before onboarding high-volume or high-risk merchants.`,
        },
      ],
    },
    {
      title: 'Account deactivation and fund recovery',
      body: `When Stripe restricts or deactivates a connected account, the platform may no longer be able to initiate payouts to that account. Capabilities are disabled, and in-flight payments may be held by Stripe pending review.\n\nThe process involves communicating with the affected account, handling refund requests from their customers, and working with Stripe's support team on fund recovery where applicable. This requires a documented runbook, not ad-hoc troubleshooting.\n\nFor TaskFlow, if a freelancer's account is deactivated due to fraud, you need a plan for handling pending client payments and in-progress projects. Do you refund the clients? Do you reassign the projects? Do you hold the funds pending resolution? Document these decisions before you encounter the situation.`,
    },
  ],
  doneLabel: `I understand the risk landscape for TaskFlow as a platform`,
}

// ---------------------------------------------------------------------------
// Module 12 - Scaling Your Platform
// ---------------------------------------------------------------------------

const MODULE_12_SCALING: WorkshopModule = {
  id: 'scaling-platform',
  number: 12,
  title: 'Scaling Your Platform',
  estMinutes: 10,
  intro: `The operational demands of a Connect platform change significantly between 10 connected accounts and 10,000. This module covers the architectural patterns that distinguish platforms that scale cleanly from those that hit operational ceilings.`,
  narrative: `TaskFlow is growing. What worked with 50 freelancers won't work with 5,000. Here are the patterns you need to adopt before you hit the wall.`,
  overviewAddition: `Architecture patterns for growing your platform.`,
  steps: [
    {
      title: 'Rate limits and batching strategy',
      body: `Stripe's API rate limits apply per platform account. At scale, platforms processing high volumes of account updates, transfers, or payout triggers can hit these limits. The rate limit structure for Connect has both account-level and platform-level limits.\n\nImplement exponential backoff with jitter. Without jitter, all your retries happen at the same time, creating a "thundering herd" that hits the rate limit again. Random jitter spreads retries across a time window.\n\nFor TaskFlow, if you process 1,000 freelancer payouts at the end of each day, batch them with staggered timing rather than firing all 1,000 API calls simultaneously. Spread them over a 30-minute window with randomized start times within each batch.`,
      callouts: [
        {
          kind: 'tip' as CalloutKind,
          text: `Add jitter to your exponential backoff. Without jitter, all your retries happen at the same time, creating a "thundering herd" that hits the rate limit again. Random jitter spreads retries across a time window.`,
        },
      ],
    },
    {
      title: 'Account mirroring and local state',
      body: `At thousands of accounts, real-time API calls for every account-related query become a performance bottleneck and a rate limit risk. The production pattern is to mirror account state locally.\n\nSubscribe to account.updated webhooks, persist capability status, requirements, and balance flags in your database, and query locally for all read operations. This is eventually consistent. Your UI should communicate that account status may be slightly delayed rather than presenting stale data as current.\n\nFor TaskFlow, your freelancer management dashboard should query your local database, not the Stripe API, for account status. Build a background sync job that periodically reconciles your local state with Stripe as a safety net for any missed webhook events.`,
    },
    {
      title: 'Reporting with Balance Transactions and Sigma',
      body: `The Balance Transactions API is the canonical source for platform-level financial reporting. Every credit and debit to the platform's balance (charges, application fees, transfers, refunds, disputes, payouts) generates a balance transaction with a detailed type and source.\n\nFor higher volume, Stripe Sigma provides SQL access to the full transaction history. You can write queries that join charges, transfers, and application fees across connected accounts. The Reporting API can automate scheduled report generation.\n\nFor TaskFlow's finance team, this is how you generate monthly revenue reports, reconcile application fees against expected platform fees, and track platform-level financial health. Build these reports early, even if you only have a handful of transactions.`,
    },
    {
      title: 'Tax reporting obligations (1099s)',
      body: `For US platforms, Stripe can generate and file 1099-K and 1099-NEC forms for connected accounts that meet IRS thresholds. This requires Tax Identification Number (TIN) collection from connected accounts during or shortly after onboarding.\n\nConfigure this early. It's a compliance requirement, not optional for platforms above the threshold. Retroactively collecting TINs from thousands of active freelancers is operationally painful and creates compliance risk if you miss the filing deadline.\n\nFor TaskFlow, build TIN collection into your onboarding flow from day one. Even if you're below the filing threshold now, you'll grow into it, and having TINs already collected saves a massive operational headache later.`,
      callouts: [
        {
          kind: 'info' as CalloutKind,
          text: `Stripe's 1099 filing service requires TIN collection from connected accounts. Build TIN collection into your onboarding flow, not as an afterthought. Retroactively collecting TINs from active freelancers is operationally painful and creates compliance risk.`,
        },
      ],
    },
    {
      title: 'Multi-currency and international platforms',
      body: `Stripe handles multi-currency in Connect with some important constraints. Connected accounts have separate balances per currency. Transfers must be currency-matched, meaning you can't transfer USD from the platform to a GBP balance. Payout currencies are determined by the connected account's bank account.\n\nUnderstand the presentment vs settlement currency distinction. The customer may pay in USD (presentment), but the connected account may settle in EUR. Stripe handles conversion, but at Stripe's exchange rate plus a spread. At volume, these conversion costs can be material.\n\nFor TaskFlow expanding internationally, if a UK freelancer earns GBP, their transfers must be in GBP, and their payouts go to a GBP bank account. If the client pays in USD, Stripe converts at the time of transfer. Consider whether you want to present prices in the freelancer's local currency or the platform's base currency.`,
      callouts: [
        {
          kind: 'stripe-fact' as CalloutKind,
          text: `Stripe handles currency conversion automatically in many cases, but the conversion happens at Stripe's exchange rate plus a spread. If your platform operates across many currencies, the conversion costs can be material. Consider whether you want to present prices in the connected account's local currency or the platform's base currency.`,
        },
      ],
    },
    {
      title: 'Production readiness checklist',
      body: `Before going live, walk through this checklist. All critical webhooks are implemented and idempotent. Your account type decision is documented and reviewed with legal and compliance. Negative balance monitoring is in place. Your reserve policy is defined.\n\nTax reporting is configured with TIN collection in the onboarding flow. Rate limit handling with exponential backoff and jitter is implemented. Your local account state mirror is running and synchronized via webhooks. The onboarding re-entry flow is tested for all three paths: success, needs-more-info, and failure. Your dispute handling process is documented for each charge type you use.\n\nFor TaskFlow, walk through this checklist with your engineering and legal teams before flipping the switch to live mode. Run a full end-to-end simulation in test mode covering account creation, verification, charge processing, application fee collection, payout triggering, payout failure, and dispute handling.`,
      callouts: [
        {
          kind: 'tip' as CalloutKind,
          text: `Run a full end-to-end simulation in test mode before going live. Create a connected account, simulate verification, process a charge, collect an application fee, trigger a payout, simulate a payout failure, and simulate a dispute. Connect has too many moving parts to rely on component testing alone.`,
        },
      ],
    },
  ],
  doneLabel: `I've prepared TaskFlow for production scale`,
}

// ---------------------------------------------------------------------------
// Exported module arrays
// ---------------------------------------------------------------------------

export const CONNECT_WORKSHOP_MODULES: WorkshopModule[] = [
  CONNECT_GETTING_STARTED_MODULE,
  MODULE_1_CONNECT_MENTAL_MODEL,
  MODULE_2_ACCOUNT_TYPES,
  MODULE_3_OAUTH_STANDARD,
  MODULE_4_EXPRESS_CUSTOM_CREATION,
  MODULE_5_CAPABILITIES_COMPLIANCE,
  MODULE_6_CHARGE_TYPES,
  MODULE_7_APPLICATION_FEES,
  MODULE_8_PAYOUTS,
  MODULE_9_DASHBOARD_MANAGEMENT,
  MODULE_10_CONNECT_WEBHOOKS,
  MODULE_11_RISK_DISPUTES,
  MODULE_12_SCALING,
]

export const CONNECT_SCORED_MODULES = CONNECT_WORKSHOP_MODULES.filter(
  (m) => !m.isPrerequisite,
)
