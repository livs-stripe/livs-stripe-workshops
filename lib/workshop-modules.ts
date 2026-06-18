// Full content for the document-style Workshop participant experience.
// Educational tone, no gamification. Each module has ordered steps; steps may
// carry a dashboard "GIF" walkthrough and one or more callouts. Authored from
// the workshop spec. All copy uses template literals to avoid quote escaping.

export type CalloutKind =
  | 'info'
  | 'tip'
  | 'warning'
  | 'explanation'
  | 'fraud-fact'

export type Callout = {
  kind: CalloutKind
  text: string
}

export type WorkshopGif = {
  caption: string
  screen: string // dashboard path, e.g. "Radar → Rules"
}

export type WorkshopStep = {
  title: string
  body?: string
  gif?: WorkshopGif
  callouts?: Callout[]
}

export type WorkshopModule = {
  id: string
  number: number
  title: string
  estMinutes: number
  intro: string
  steps: WorkshopStep[]
  doneLabel: string
}

export const WORKSHOP_MODULES: WorkshopModule[] = [
  {
    id: 'orientation',
    number: 1,
    title: 'Getting Oriented in Stripe Radar',
    estMinutes: 5,
    intro:
      `Stripe Radar is built into every Stripe account — no setup required. Before writing any rules, let's explore what it shows you and understand how it evaluates payments.`,
    steps: [
      {
        title: 'Open Radar',
        body: `In your Stripe Dashboard left sidebar, click Radar. If you don't see it, look under "More" in the navigation. You'll land on the Radar overview page showing recent charge activity and block rates.`,
        gif: {
          caption: 'Navigating to Radar in the Stripe Dashboard',
          screen: 'Sidebar → Radar',
        },
        callouts: [
          {
            kind: 'info',
            text: `Radar is active on your account from day one. Even before you write any rules, Stripe's ML model is already scoring every payment.`,
          },
        ],
      },
      {
        title: 'Read the overview metrics',
        body: `On the Radar overview, note three numbers: your total charge volume, your block rate percentage, and your review rate. These are your baselines.`,
        gif: {
          caption: 'The Radar overview dashboard with key metrics',
          screen: 'Radar → Overview',
        },
        callouts: [
          {
            kind: 'tip',
            text: `Most accounts start with a block rate of 0% and a review rate of 0% — you haven't written any rules yet. By the end of today, these numbers will be meaningful.`,
          },
        ],
      },
      {
        title: `Find a payment's risk score`,
        body: `Go to Payments in the sidebar. Click on any charge. Scroll down to the Radar section on the right side. You'll see a risk score (0-100) and a risk level label: normal, elevated, or highest.`,
        gif: {
          caption: 'Finding the Radar risk score on a payment detail page',
          screen: 'Payments → Charge detail → Radar section',
        },
        callouts: [
          {
            kind: 'explanation',
            text: `The risk score is a percentile — a score of 72 means Stripe considers this payment riskier than 72% of all payments it sees globally. Stripe's model is trained on hundreds of billions of dollars of payment data across millions of businesses.`,
          },
        ],
      },
      {
        title: 'Expand the risk factors',
        body: `On the same charge detail, find "Risk factors" below the score. Click "Show all" to see the full list of signals that contributed to this score.`,
        gif: {
          caption:
            'Expanding risk factors on a charge to see what drove the score',
          screen: 'Charge detail → Risk factors',
        },
        callouts: [
          {
            kind: 'explanation',
            text: `Each factor shown here is an attribute Radar evaluated. Things like "IP address associated with prior fraud", "Card used from unusual location", or "First transaction on this card" all contribute. There are over 1,000 signals Stripe evaluates per payment.`,
          },
        ],
      },
      {
        title: 'Browse the Attributes library',
        body: `In Radar → Rules, click "New rule". In the rule editor, open the Attributes panel on the right. Browse through the available attributes — note the categories: card, customer, IP, payment, velocity.`,
        gif: {
          caption: 'Browsing the Radar attributes library in the rule editor',
          screen: 'Radar → Rules → New rule → Attributes panel',
        },
        callouts: [
          {
            kind: 'fraud-fact',
            text: `Did you know: Stripe can detect whether a card is being used from an anonymous proxy or VPN, the number of times a card has been charged in the last 24 hours across ALL Stripe merchants (not just yours), and whether the billing address matches the card issuer's records — all without you collecting any of this data yourself.`,
          },
        ],
      },
    ],
    doneLabel: `I've explored the Radar overview and found a payment's risk score`,
  },
  {
    id: 'first-block-rule',
    number: 2,
    title: 'Your First Block Rule',
    estMinutes: 10,
    intro:
      `Radar lets you write rules that automatically block, review, or allow payments based on any combination of attributes. Let's start with the most fundamental rule: blocking payments that Stripe's own model has already identified as highest risk.`,
    steps: [
      {
        title: 'Open the Rules page',
        body: `In Radar, click Rules in the left submenu. You'll see three sections: Block, Review, and Allow. Rules in each section evaluate top-to-bottom — the first matching rule wins.`,
        gif: {
          caption:
            'The Radar Rules page showing Block, Review, and Allow sections',
          screen: 'Radar → Rules',
        },
        callouts: [
          {
            kind: 'info',
            text: `Block rules decline the payment immediately. Review rules flag it for manual inspection but let it through (or hold it, depending on your settings). Allow rules bypass all other matching rules — useful for trusted customers.`,
          },
        ],
      },
      {
        title: 'Create your first Block rule',
        body: `In the Block section, click Add rule. In the rule editor, type: risk_level = 'highest' — then click Add rule. Confirm the prompt that appears.`,
        gif: {
          caption: 'Writing and saving a block rule for highest risk payments',
          screen: 'Radar → Rules → New block rule',
        },
        callouts: [
          {
            kind: 'warning',
            text: `Stripe defines "highest" risk as their top confidence tier for fraud. This level is intentionally conservative — false positive rates at this tier are very low. It's one of the safest first rules to deploy.`,
          },
        ],
      },
      {
        title: 'Understand what you just built',
        body: `"highest" risk level captures roughly the top 1-2% of payments by fraud likelihood. For most businesses this rule blocks around 0.3-0.8% of all payment volume. The tradeoff: some legitimate payments with unusual signals (international card, new customer, high amount) may have elevated scores — but "highest" is specifically the tier where Stripe's confidence in fraud is greatest.`,
        callouts: [
          {
            kind: 'tip',
            text: `You can always review the payments a rule has blocked by going to Payments → filtering by Blocked → and checking which rule triggered the decline.`,
          },
        ],
      },
      {
        title: 'Add a Review rule for elevated risk',
        body: `In the Review section, click Add rule. Type: risk_level = 'elevated'`,
        gif: {
          caption: 'Adding a review rule for elevated risk payments',
          screen: 'Radar → Rules → New review rule',
        },
        callouts: [
          {
            kind: 'explanation',
            text: `"Elevated" is the medium tier — payments Stripe thinks are worth a second look but hasn't determined are definitely fraud. Putting these in review means they process normally, but you'll see them flagged in your dashboard for manual inspection.`,
          },
        ],
      },
      {
        title: 'Test your rules against historical data',
        body: `Back on the Rules page, click the three-dot menu on your new block rule. Select "See payments this rule would have affected". Radar will show you which historical charges this rule would have blocked.`,
        gif: {
          caption: `Using "See affected payments" to audit a rule's impact`,
          screen: 'Radar → Rules → Rule options → See affected payments',
        },
        callouts: [
          {
            kind: 'fraud-fact',
            text: `Did you know: The average fraud rate for online merchants is around 0.9% of transactions. For sports betting and gambling platforms it's significantly higher — often 2-4% — because the instant-settlement nature of deposits makes them attractive to fraudsters.`,
          },
        ],
      },
    ],
    doneLabel: `I've created my first block rule and a review rule`,
  },
  {
    id: 'velocity-rules',
    number: 3,
    title: 'Velocity Rules — Stopping Repeat Offenders',
    estMinutes: 12,
    intro:
      `One of the most reliable fraud signals is repetition — the same card, IP address, or email appearing an unusual number of times in a short window. Velocity rules let you count these occurrences and block when they exceed a normal threshold. They're especially effective against automated bot attacks and card testing.`,
    steps: [
      {
        title: 'Understand velocity attributes',
        body: `In Radar → Rules → New rule, open the Attributes panel. Search for "total_charges". Note all the attributes that appear — they all follow the pattern: total_charges_per_[thing]_[window].`,
        gif: {
          caption: 'Searching for velocity attributes in the Radar attributes panel',
          screen: `Radar → Rules → Attributes → search 'total_charges'`,
        },
        callouts: [
          {
            kind: 'explanation',
            text: `Stripe tracks charge counts per card number, per IP address, per email address, and per customer — across daily, weekly, and all-time windows. These counts are global across all Stripe merchants, not just your account. So if a card has been used 50 times today across different businesses, you can see that.`,
          },
        ],
      },
      {
        title: 'Write a card velocity rule',
        body: `Create a new Block rule: total_charges_per_card_number_daily > 5`,
        gif: {
          caption: 'Writing a card velocity block rule',
          screen: 'Radar → Rules → New block rule',
        },
        callouts: [
          {
            kind: 'explanation',
            text: `This blocks any card that has been charged more than 5 times today across all Stripe merchants. Legitimate customers rarely deposit more than 2-3 times per day. Fraudsters testing stolen card batches may make 50+ attempts.`,
          },
          {
            kind: 'warning',
            text: `Setting this threshold too low (e.g. > 1) would block legitimate customers who make multiple deposits in a day. Start at 5, monitor for false positives, and adjust.`,
          },
        ],
      },
      {
        title: 'Write an IP velocity rule',
        body: `Create a new Block rule: total_charges_per_ip_daily > 15`,
        gif: {
          caption: 'Adding an IP velocity rule to the block rules list',
          screen: 'Radar → Rules → Block rules',
        },
        callouts: [
          {
            kind: 'explanation',
            text: `Why 15 and not 5? Shared IP addresses are common — office networks, university WiFi, and some ISPs use the same IP for many users. A coffee shop with 20 BetFlow customers all depositing from the same IP is legitimate. But 15 deposits from a single IP in a day starts to look unusual even accounting for shared networks.`,
          },
        ],
      },
      {
        title: 'Add AND conditions to be more precise',
        body: `Edit your IP velocity rule. After total_charges_per_ip_daily > 15, add: and is_anonymous_ip = true — the full rule reads: total_charges_per_ip_daily > 15 and is_anonymous_ip = true`,
        gif: {
          caption: 'Adding an AND condition to an existing rule',
          screen: 'Radar → Rules → Edit rule',
        },
        callouts: [
          {
            kind: 'explanation',
            text: `is_anonymous_ip is true for traffic from VPNs, proxies, and Tor exit nodes. Combining the velocity threshold with anonymous IP detection makes this rule much more surgical — it catches automated attacks routing through proxies without penalising customers on legitimate shared networks.`,
          },
        ],
      },
      {
        title: 'Use metadata for custom velocity tracking',
        body: `BetFlow's PaymentIntents include a metadata field called source_ip. You can reference any metadata field in Radar using double-colon syntax. Create a Block rule: ::source_ip:: = '198.51.100.42'`,
        gif: {
          caption: 'Writing a metadata rule using double-colon syntax',
          screen: 'Radar → Rules → New rule → metadata attribute',
        },
        callouts: [
          {
            kind: 'info',
            text: `Double-colon syntax (::field_name::) accesses PaymentIntent metadata. Any data BetFlow passes in the metadata object on a charge is available as a rule attribute. This is how you build business-specific rules that go beyond Stripe's standard attributes — customer tiers, KYC status, account verification flags, and more.`,
          },
        ],
      },
      {
        title: 'Check rule order',
        body: `On the Rules page, drag your new block rules so card velocity sits above IP velocity. Order matters when you have rules that could affect the same payment.`,
        gif: {
          caption: 'Drag-and-drop reordering of Radar rules',
          screen: 'Radar → Rules → Drag to reorder',
        },
      },
    ],
    doneLabel: `I've written velocity rules for cards and IPs, and used metadata syntax`,
  },
  {
    id: 'custom-lists',
    number: 4,
    title: 'Custom Lists',
    estMinutes: 8,
    intro:
      `Rules catch patterns. Lists catch individuals. When you have specific cards, IP addresses, email addresses, or customers you want to always block (or always allow), lists give you that control without modifying your rule logic.`,
    steps: [
      {
        title: 'Explore the Lists page',
        body: `Go to Radar → Lists. You'll see Stripe's built-in global lists and a section for your custom lists. Note that Stripe maintains global blocklists of known-bad cards and IPs — you benefit from these automatically.`,
        gif: {
          caption: 'The Radar Lists page showing global and custom lists',
          screen: 'Radar → Lists',
        },
      },
      {
        title: 'Create an email blocklist',
        body: `Click New list. Name it "Blocked Email Domains", type: email. Add the following values, one per line: yopmail.com, mailinator.com, guerrillamail.com, tempmail.com, 10minutemail.com`,
        gif: {
          caption: 'Creating a custom email blocklist and adding values',
          screen: 'Radar → Lists → New list → Add values',
        },
        callouts: [
          {
            kind: 'explanation',
            text: `Disposable email addresses are strongly associated with bonus abuse and fake account creation. People creating fake accounts to claim multiple sign-up bonuses almost always use throwaway email services. This list stops those payments at the payment layer.`,
          },
        ],
      },
      {
        title: 'Write a rule that references your list',
        body: `In Radar → Rules → Block, add: email in 'Blocked Email Domains'`,
        gif: {
          caption: 'Creating a rule that uses a custom list',
          screen: 'Radar → Rules → New rule → list reference',
        },
      },
      {
        title: 'Create a VIP allow list',
        body: `Create another list called "Verified VIP Customers", type: email. Add a test email address.`,
        gif: {
          caption: 'Creating an allow list for trusted customers',
          screen: 'Radar → Lists → New list',
        },
      },
      {
        title: 'Create the allow rule',
        body: `In Rules → Allow, add: email in 'Verified VIP Customers'. Drag this allow rule to sit ABOVE your block rules.`,
        gif: {
          caption: 'Adding an allow rule and positioning it above block rules',
          screen: 'Radar → Rules → Allow section → reorder',
        },
        callouts: [
          {
            kind: 'tip',
            text: `Allow rules only work if they're evaluated before any matching block rule would fire. Always check rule order after adding allow rules. The priority is: Allow rules first, then Block, then Review.`,
          },
        ],
      },
    ],
    doneLabel: `I've created a blocklist, an allow list, and rules for both`,
  },
  {
    id: 'three-d-secure',
    number: 5,
    title: '3D Secure — Adding Smart Friction',
    estMinutes: 10,
    intro:
      `Blocking payments is a blunt instrument. Sometimes you want to add a verification step rather than decline outright — especially for higher-value payments where the friction is worth it. 3D Secure (3DS) does exactly this: it asks the cardholder to authenticate through their bank, which both catches fraudsters and shifts fraud liability away from BetFlow.`,
    steps: [
      {
        title: 'Understand what 3DS does',
        body: `In Stripe Dashboard, go to any successful payment and look for the 3D Secure authentication section. Note whether authentication was attempted and what the outcome was.`,
        gif: {
          caption: 'Finding 3D Secure status on a charge detail page',
          screen: 'Charge detail → 3D Secure section',
        },
        callouts: [
          {
            kind: 'info',
            text: `When 3DS authentication succeeds, fraud liability shifts from the merchant to the card issuer. This means even if a fraudulent payment gets through, BetFlow won't be held liable for the resulting chargeback — the card issuer absorbs the loss. This is called "liability shift" and it's one of the most valuable protections available.`,
          },
        ],
      },
      {
        title: 'Find the Request 3DS section in Rules',
        body: `In Radar → Rules, scroll below the Block and Review sections. You'll see a third section: Request 3DS. This is separate from Block and Review.`,
        gif: {
          caption: 'The Request 3DS section in Radar Rules',
          screen: 'Radar → Rules → Request 3DS section',
        },
      },
      {
        title: 'Create a 3DS rule for elevated risk',
        body: `In Request 3DS, click Add rule. Type: risk_level = 'elevated'`,
        gif: {
          caption: 'Adding a Request 3DS rule for elevated risk payments',
          screen: 'Radar → Rules → New 3DS rule',
        },
        callouts: [
          {
            kind: 'explanation',
            text: `Instead of blocking elevated-risk charges, you're requesting additional authentication. Genuine cardholders complete 3DS in about 10 seconds via an SMS code or biometric in their banking app. Fraudsters who stole a card number don't have access to the cardholder's phone and can't complete authentication — so the payment declines at the authentication step, not the payment step.`,
          },
        ],
      },
      {
        title: 'Add a 3DS rule for high-value new customers',
        body: `Add another Request 3DS rule: is_new_customer = true and amount > 20000`,
        gif: {
          caption:
            'Creating a 3DS rule targeting new customers with high deposit amounts',
          screen: 'Radar → Rules → 3DS rules',
        },
        callouts: [
          {
            kind: 'warning',
            text: `Stripe amounts are in the smallest currency unit — cents for AUD. 20000 cents = $200.00 AUD. Double-check your amounts when writing rules.`,
          },
        ],
      },
      {
        title: 'Test with a 3DS test card',
        body: `Use Stripe's 3DS test card number 4000 0025 0000 3155 to make a test payment. You'll see the 3DS authentication popup appear.`,
        gif: {
          caption: 'Completing a 3DS authentication prompt during checkout',
          screen: 'Test checkout → 3DS popup',
        },
        callouts: [
          {
            kind: 'tip',
            text: `In production, 3DS completion rates are typically 80-95% depending on the country and bank. For most customers it's a minor inconvenience. For fraudsters it's an insurmountable barrier.`,
          },
        ],
      },
    ],
    doneLabel: `I've created 3DS rules for elevated risk and high-value new customers`,
  },
  {
    id: 'disputes',
    number: 6,
    title: 'Handling Disputes',
    estMinutes: 12,
    intro:
      `Disputes (also called chargebacks) happen when a cardholder tells their bank a charge was unauthorised. The bank immediately reverses the funds and gives the merchant a window to respond with evidence. Understanding the dispute process and knowing how to fight disputes is as important as preventing fraud in the first place.`,
    steps: [
      {
        title: 'Find the Disputes section',
        body: `Go to Payments → Disputes. Browse the list — note the columns: amount, reason code, status, and response deadline.`,
        gif: {
          caption: 'The Disputes list in Stripe Dashboard',
          screen: 'Payments → Disputes',
        },
        callouts: [
          {
            kind: 'info',
            text: `Dispute reason codes tell you why the cardholder disputed. "Fraudulent" means they claim they didn't make the charge. "Product not received" or "Subscription cancelled" are different reasons requiring different evidence. Always read the reason code first — it determines your defence strategy.`,
          },
        ],
      },
      {
        title: 'Open a dispute and understand the timeline',
        body: `Click on any dispute. Note: the date the dispute was opened, the response deadline, and the dispute amount (which may include a dispute fee on top of the original charge amount).`,
        gif: {
          caption: 'Opening a dispute to see the timeline and response deadline',
          screen: 'Dispute detail → Timeline',
        },
        callouts: [
          {
            kind: 'warning',
            text: `Dispute deadlines are hard cutoffs. Miss the deadline and you automatically lose — there's no extension. Stripe sends email notifications for new disputes, but also consider setting up Stripe webhooks or the Stripe mobile app to get real-time alerts.`,
          },
        ],
      },
      {
        title: 'Review the evidence fields',
        body: `Scroll down to the Evidence section of the dispute. Read through the available fields: customer email, IP address, transaction date, customer activity, terms acceptance. Note which fields BetFlow could populate.`,
        gif: {
          caption: 'The dispute evidence submission form with all available fields',
          screen: 'Dispute → Evidence section',
        },
        callouts: [
          {
            kind: 'explanation',
            text: `The strongest evidence for a sports betting platform dispute: (1) proof the account was KYC verified before the deposit, (2) login records showing the customer authenticated from their usual device, (3) proof the deposited funds were used to place bets, (4) signed terms of service acceptance. This combination demonstrates the cardholder knowingly made the deposit and used the funds.`,
          },
        ],
      },
      {
        title: 'Submit evidence',
        body: `Fill in the available evidence fields using the test data provided, then click Submit evidence. Note that once submitted, evidence can't be changed.`,
        gif: {
          caption: 'Filling in and submitting evidence for a dispute',
          screen: 'Dispute → Evidence → Submit',
        },
      },
      {
        title: 'Write prevention rules',
        body: `Back in Radar, create a Review rule: is_new_customer = true and amount > 10000 — This flags large first-time deposits for manual review before the money moves.`,
        gif: {
          caption: 'Adding a review rule to flag suspicious new customer deposits',
          screen: 'Radar → Rules → New review rule',
        },
        callouts: [
          {
            kind: 'tip',
            text: `The best dispute strategy is prevention. Reviewing large deposits from new customers costs a few seconds of manual effort. Losing a dispute costs the full deposit amount plus fees plus your time filing evidence.`,
          },
        ],
      },
      {
        title: 'Understand dispute outcomes',
        body: `In Disputes, use the Status filter to view Won and Lost disputes. Open a won dispute — note what evidence was submitted.`,
        gif: {
          caption: 'Filtering disputes by outcome and reviewing a won dispute',
          screen: 'Disputes → Filter by Won',
        },
        callouts: [
          {
            kind: 'fraud-fact',
            text: `Did you know: Merchants who submit thorough, well-organised evidence win approximately 40-45% of fraud disputes. Merchants who don't respond lose 100% of them. The evidence submission step is literally the difference between recovering your money and not.`,
          },
        ],
      },
    ],
    doneLabel: `I've reviewed a dispute, submitted evidence, and written a prevention rule`,
  },
  {
    id: 'allow-rules',
    number: 7,
    title: 'Allow Rules & False Positives',
    estMinutes: 10,
    intro:
      `The hidden cost of fraud prevention is legitimate customers getting incorrectly blocked. Every time a real customer's deposit is declined, BetFlow loses that revenue and risks losing the customer permanently. This module covers how to protect your best customers from your own fraud rules using allow rules and precise rule conditions.`,
    steps: [
      {
        title: 'Understand false positive cost',
        body: `In Radar → Overview, look at your block rate. Now consider: if 0.5% of blocked charges are legitimate customers, what is the revenue impact per month at BetFlow's deposit volumes?`,
        gif: {
          caption: 'Block rate metrics in the Radar Overview dashboard',
          screen: 'Radar → Overview → Metrics',
        },
        callouts: [
          {
            kind: 'info',
            text: `Industry research suggests the average false positive rate for online fraud detection is around 1.3% — meaning roughly 1 in 75 declined payments is a legitimate customer. For a sports betting platform where customers have many alternatives, a declined deposit very often means they simply open a competitor's app.`,
          },
        ],
      },
      {
        title: 'Create a metadata-based allow rule',
        body: `BetFlow's PaymentIntents include a metadata field kyc_verified set to 'true' for all identity-verified accounts. Create an Allow rule: ::kyc_verified:: = 'true'`,
        gif: {
          caption: 'Creating a metadata allow rule using double-colon syntax',
          screen: 'Radar → Rules → New allow rule',
        },
        callouts: [
          {
            kind: 'explanation',
            text: `KYC-verified customers have proven their identity — they're a known person with a real card linked to a verified account. Running them through aggressive velocity and IP rules creates unnecessary friction. This allow rule bypasses your block rules for verified customers while still protecting against the highest-risk signals.`,
          },
        ],
      },
      {
        title: 'Position the allow rule correctly',
        body: `Drag your allow rule to the top of the Allow section. Verify it appears BEFORE any matching block rules in the evaluation order.`,
        gif: {
          caption: 'Reordering rules to ensure the allow rule fires first',
          screen: 'Radar → Rules → Drag reorder',
        },
      },
      {
        title: 'Create a risk-specific exception',
        body: `Create another Allow rule for repeat customers: customer_transaction_count > 20 and risk_score < 65 — This passes through established customers who are below the risk threshold.`,
        gif: {
          caption: 'Adding a compound allow rule for established customers',
          screen: 'Radar → Rules → New allow rule with AND condition',
        },
      },
      {
        title: 'Test your allow rules',
        body: `Use Stripe's rule tester to check a payment from a long-standing customer. Confirm the allow rule fires before any block rules would have triggered.`,
        gif: {
          caption:
            'Testing that an allow rule overrides a block rule for a specific payment',
          screen: 'Radar → Rules → Test rule',
        },
      },
      {
        title: 'Calculate your precision',
        body: `Look at your Radar Overview. Note your block rate and your fraud rate. A healthy ratio is fraud rate significantly lower than block rate — if they're close, your rules may be too aggressive or catching too much legitimate traffic.`,
        gif: {
          caption: 'Comparing block rate to fraud rate in the Radar Overview',
          screen: 'Radar → Overview → Metrics comparison',
        },
        callouts: [
          {
            kind: 'tip',
            text: `Target precision formula: fraud_blocked ÷ (fraud_blocked + legit_blocked). Above 0.85 (85%) is considered good. Above 0.95 is excellent. Below 0.70 means you're hurting legitimate revenue significantly.`,
          },
        ],
      },
    ],
    doneLabel: `I've created allow rules for verified customers and reviewed my block precision`,
  },
  {
    id: 'putting-together',
    number: 8,
    title: 'Putting It All Together',
    estMinutes: 8,
    intro:
      `You've built individual rules and lists throughout this workshop. This final module is about stepping back and thinking about your complete Radar strategy — how the rules interact, what order they run in, and how to maintain and evolve them over time.`,
    steps: [
      {
        title: 'Audit your complete rule set',
        body: `Go to Radar → Rules and look at everything you've built today. You should have: Block rules (risk_level, velocity, IP, lists), Review rules (elevated risk, new customer), Request 3DS rules, Allow rules (KYC, repeat customers).`,
        gif: {
          caption: 'Full view of a completed Radar rule set',
          screen: 'Radar → Rules → Complete rule list',
        },
      },
      {
        title: 'Check the overall rule order',
        body: `Verify your rules follow this general priority: Allow rules first → Block rules → Review rules. Radar evaluates top-to-bottom within each category — the first match wins.`,
        gif: {
          caption: 'Verifying rule order across all three Radar rule categories',
          screen: 'Radar → Rules → Full view',
        },
        callouts: [
          {
            kind: 'info',
            text: `Rule order edge cases: an Allow rule ABOVE a Block rule means the allow fires first and the payment bypasses the block. An Allow rule BELOW a Block rule means the block fires first — the allow never gets evaluated. Always sanity-check order when adding new rules.`,
          },
        ],
      },
      {
        title: 'Use the rule evaluator for a final audit',
        body: `In Radar → Rules, use "Test rule" on your most important block rule. Run it against 5 different payments from your history — a mix of clearly legitimate and flagged charges.`,
        gif: {
          caption: 'Running the rule evaluator on multiple historical payments',
          screen: 'Radar → Rules → Test rule → multiple payments',
        },
      },
      {
        title: 'Set up a Stripe webhook for dispute alerts',
        body: `In Developers → Webhooks, add an endpoint. In the events list, select: charge.dispute.created — this will notify your system any time a new dispute is filed.`,
        gif: {
          caption: 'Creating a webhook for dispute created events',
          screen: 'Developers → Webhooks → New endpoint',
        },
        callouts: [
          {
            kind: 'tip',
            text: `For a production BetFlow setup, the dispute.created webhook triggers an internal alert so your team responds within hours rather than days. Fast response times significantly improve dispute win rates.`,
          },
        ],
      },
      {
        title: 'Review the Radar ML model block (optional read)',
        body: `In Radar → Overview, click "Stripe ML" in the block breakdown chart. This shows how many charges were blocked by Stripe's ML model vs your custom rules.`,
        gif: {
          caption: 'Stripe ML vs custom rules breakdown in Radar Overview',
          screen: 'Radar → Overview → Block breakdown',
        },
        callouts: [
          {
            kind: 'explanation',
            text: `Stripe's ML model and your custom rules work in parallel. The ML model handles signals you haven't written rules for. Your rules handle business-specific logic Stripe's model can't know (like which customers are KYC-verified, or which IPs are your own QA testing). Both are active simultaneously.`,
          },
        ],
      },
    ],
    doneLabel: `I've audited my full rule set and set up a dispute webhook`,
  },
]

export const WORKSHOP_MODULE_COUNT = WORKSHOP_MODULES.length
