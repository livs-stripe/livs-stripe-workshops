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

export type DashboardUrl = {
  label: string
  url: string
}

export type WorkshopStep = {
  title: string
  body?: string
  gif?: WorkshopGif
  callouts?: Callout[]
  dashboardLink?: DashboardUrl
  /** Special rendering flags for Getting Started module */
  renderDashboardButton?: boolean
  renderCredentialsCard?: boolean
}

export type WorkshopModule = {
  id: string
  number: number
  title: string
  estMinutes: number
  intro: string
  narrative: string
  steps: WorkshopStep[]
  doneLabel: string
  /** If true, this module is a prerequisite and not counted in scored progress */
  isPrerequisite?: boolean
  /** Summary addition for overview page (story context) */
  overviewAddition?: string
}

export const GETTING_STARTED_MODULE: WorkshopModule = {
  id: 'getting-started',
  number: 0,
  title: 'Getting Started',
  estMinutes: 5,
  isPrerequisite: true,
  intro: `You have joined as a participant in this workshop. Before the first module, take five minutes to get your Stripe test account open and familiarise yourself with where things are. Everything in this workshop happens inside that account.`,
  narrative: `You joined BetFlow's payments team three days ago. The previous fraud analyst left without documentation. Your manager has pointed you at Stripe and told you to work out what is going on. This is your account.`,
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
      title: 'Get familiar with the Dashboard',
      body: `Once you are in, take a look around. The left sidebar is how you navigate. The main sections you will use today are Payments, Radar, and Disputes. You do not need to do anything yet — just make sure you can see them.`,
      gif: {
        caption: 'Record: the Stripe Dashboard home screen with the left sidebar visible, highlighting Payments, Radar, and Disputes in the navigation.',
        screen: 'Dashboard → Home',
      },
    },
    {
      title: 'Keep the Dashboard open',
      body: `Keep your Stripe Dashboard open in its own tab for the rest of the workshop. Each module will link directly to the relevant section, so you will not need to navigate manually — just click the link and it takes you straight there.`,
    },
  ],
  doneLabel: `I've set up my Stripe Dashboard and I'm ready to start`,
}

export const WORKSHOP_MODULES: WorkshopModule[] = [
  GETTING_STARTED_MODULE,
  {
    id: 'orientation',
    number: 1,
    title: 'Getting Oriented in Stripe Radar',
    estMinutes: 5,
    intro:
      `Stripe Radar is built into every Stripe account — no setup required. Before writing any rules, explore what it shows you and understand how it evaluates payments.`,
    narrative:
      `Before you can fix anything, you need to understand what you are looking at. BetFlow has been on Stripe for two years and nobody has ever looked at the Radar section. Start there.`,
    overviewAddition: `This is your first look at the data BetFlow has been generating for two years.`,
    steps: [
      {
        title: 'Open Radar',
        body: `Open Radar in your Dashboard. You will land on the overview page showing recent charge activity and block rates.`,
        dashboardLink: { label: 'Radar', url: 'https://dashboard.stripe.com/radar' },
        gif: {
          caption: 'Record: opening the Radar overview page in the Stripe Dashboard.',
          screen: 'Dashboard → Radar',
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
          caption: 'Record: the Radar overview dashboard highlighting charge volume, block rate, and review rate.',
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
        body: `Open Payments in your Dashboard. Click on any charge. Scroll down to the Radar section on the right side. You will see a risk score (0-100) and a risk level label: normal, elevated, or highest.`,
        dashboardLink: { label: 'Payments', url: 'https://dashboard.stripe.com/payments' },
        gif: {
          caption: 'Record: clicking a payment, scrolling to the Radar section, and highlighting the risk score.',
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
          caption: 'Record: expanding risk factors on a charge detail page to show the full signal list.',
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
        body: `Open Radar Rules in your Dashboard. Click "New rule". In the rule editor, open the Attributes panel on the right. Browse through the available attributes — note the categories: card, customer, IP, payment, velocity.`,
        dashboardLink: { label: 'Radar Rules', url: 'https://dashboard.stripe.com/radar/rules' },
        gif: {
          caption: 'Record: opening the rule editor and browsing the Attributes panel, showing card/customer/IP/velocity categories.',
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
      `Radar lets you write rules that automatically block, review, or allow payments based on any combination of attributes. Start with the most fundamental rule: blocking payments that Stripe's own model has already identified as highest risk.`,
    narrative:
      `You spent an hour reading through Stripe's payment history. About 2% of charges have a risk score above 85. None of them are being blocked. Your first job is to change that.`,
    overviewAddition: `The first concrete action you take as BetFlow's fraud analyst.`,
    steps: [
      {
        title: 'Open the Rules page',
        body: `Open Radar Rules in your Dashboard. You will see three sections: Block, Review, and Allow. Rules in each section evaluate top-to-bottom — the first matching rule wins.`,
        dashboardLink: { label: 'Radar Rules', url: 'https://dashboard.stripe.com/radar/rules' },
        gif: {
          caption: 'Record: the Radar Rules page showing the Block, Review, and Allow sections.',
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
          caption: 'Record: writing risk_level = \'highest\' in the block rule editor and saving.',
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
          caption: 'Record: adding a review rule for risk_level = \'elevated\' in the Review section.',
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
          caption: 'Record: clicking the three-dot menu on a rule and selecting "See payments this rule would have affected".',
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
    title: 'Velocity Rules',
    estMinutes: 12,
    intro:
      `One of the most reliable fraud signals is repetition — the same card, IP address, or email appearing an unusual number of times in a short window. Velocity rules let you count these occurrences and block when they exceed a normal threshold. They are especially effective against automated bot attacks and card testing.`,
    narrative:
      `One of your engineers flagged something this morning. Hundreds of small charges, all within a 20-minute window, all from the same two IP addresses. The card numbers are different but the pattern is clear. You need velocity rules.`,
    overviewAddition: `The same IP addresses are still active. Time to shut them down.`,
    steps: [
      {
        title: 'Understand velocity attributes',
        body: `Open Radar Rules in your Dashboard. Click "New rule" and open the Attributes panel. Search for "total_charges". Note all the attributes that follow the pattern: total_charges_per_[thing]_[window].`,
        dashboardLink: { label: 'Radar Rules', url: 'https://dashboard.stripe.com/radar/rules' },
        gif: {
          caption: 'Record: searching for "total_charges" in the Radar attributes panel.',
          screen: 'Radar → Rules → Attributes → search total_charges',
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
          caption: 'Record: writing total_charges_per_card_number_daily > 5 in the block rule editor.',
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
          caption: 'Record: adding total_charges_per_ip_daily > 15 as a block rule.',
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
          caption: 'Record: editing the IP velocity rule to add an AND condition with is_anonymous_ip.',
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
          caption: 'Record: writing a metadata rule using ::source_ip:: double-colon syntax.',
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
          caption: 'Record: drag-and-drop reordering of rules on the Radar Rules page.',
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
    narrative:
      `Your support inbox has three emails from real customers whose cards were charged without their knowledge. You have their card fingerprints and email addresses. The rules you have written will not stop these specific cards — lists will.`,
    overviewAddition: `Rules catch patterns. Lists catch the specific cards you already know are bad.`,
    steps: [
      {
        title: 'Explore the Lists page',
        body: `Open Radar Lists in your Dashboard. You will see Stripe's built-in global lists and a section for your custom lists. Note that Stripe maintains global blocklists of known-bad cards and IPs — you benefit from these automatically.`,
        dashboardLink: { label: 'Radar Lists', url: 'https://dashboard.stripe.com/radar/lists' },
        gif: {
          caption: 'Record: the Radar Lists page showing global and custom list sections.',
          screen: 'Radar → Lists',
        },
      },
      {
        title: 'Create an email blocklist',
        body: `Click New list. Name it "Blocked Email Domains", type: email. Add the following values, one per line: yopmail.com, mailinator.com, guerrillamail.com, tempmail.com, 10minutemail.com`,
        gif: {
          caption: 'Record: creating a new custom list named "Blocked Email Domains" and adding disposable email values.',
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
        body: `Open Radar Rules in your Dashboard. In the Block section, add: email in 'Blocked Email Domains'`,
        dashboardLink: { label: 'Radar Rules', url: 'https://dashboard.stripe.com/radar/rules' },
        gif: {
          caption: 'Record: creating a block rule that references the custom list using "email in \'Blocked Email Domains\'".',
          screen: 'Radar → Rules → New rule → list reference',
        },
      },
      {
        title: 'Create a VIP allow list',
        body: `Create another list called "Verified VIP Customers", type: email. Add a test email address.`,
        dashboardLink: { label: 'Radar Lists', url: 'https://dashboard.stripe.com/radar/lists' },
        gif: {
          caption: 'Record: creating a "Verified VIP Customers" allow list.',
          screen: 'Radar → Lists → New list',
        },
      },
      {
        title: 'Create the allow rule',
        body: `Open Radar Rules in your Dashboard. In the Allow section, add: email in 'Verified VIP Customers'. Drag this allow rule to sit ABOVE your block rules.`,
        dashboardLink: { label: 'Radar Rules', url: 'https://dashboard.stripe.com/radar/rules' },
        gif: {
          caption: 'Record: adding an allow rule and dragging it above the block rules.',
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
    title: '3D Secure',
    estMinutes: 10,
    intro:
      `Blocking payments is a blunt instrument. Sometimes you want to add a verification step rather than decline outright — especially for higher-value payments where the friction is worth it. 3D Secure (3DS) does exactly this: it asks the cardholder to authenticate through their bank, which both catches fraudsters and shifts fraud liability away from BetFlow.`,
    narrative:
      `Your block rate has improved but you are declining some payments that look borderline. A colleague suggests that instead of blocking them outright, you make those customers prove they are real. That is what 3D Secure is for.`,
    overviewAddition: `Some borderline payments deserve a second look, not an automatic decline.`,
    steps: [
      {
        title: 'Understand what 3DS does',
        body: `Open Payments in your Dashboard and click any successful payment. Look for the 3D Secure authentication section. Note whether authentication was attempted and what the outcome was.`,
        dashboardLink: { label: 'Payments', url: 'https://dashboard.stripe.com/payments' },
        gif: {
          caption: 'Record: finding the 3D Secure status section on a charge detail page.',
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
        body: `Open Radar Rules in your Dashboard. Scroll below the Block and Review sections. You will see a third section: Request 3DS. This is separate from Block and Review.`,
        dashboardLink: { label: 'Radar Rules', url: 'https://dashboard.stripe.com/radar/rules' },
        gif: {
          caption: 'Record: scrolling to the Request 3DS section below Block and Review on the Rules page.',
          screen: 'Radar → Rules → Request 3DS section',
        },
      },
      {
        title: 'Create a 3DS rule for elevated risk',
        body: `In Request 3DS, click Add rule. Type: risk_level = 'elevated'`,
        gif: {
          caption: 'Record: writing risk_level = \'elevated\' in the Request 3DS rule editor.',
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
          caption: 'Record: adding a 3DS rule for is_new_customer = true and amount > 20000.',
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
          caption: 'Record: making a test payment with the 3DS test card and completing the authentication popup.',
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
    narrative:
      `Four disputes came in overnight. BetFlow has never responded to a dispute before — the previous analyst did not know you could. You are about to find out how the process works and what happens when you actually submit evidence.`,
    overviewAddition: `BetFlow has been leaving money on the table every time a dispute went uncontested.`,
    steps: [
      {
        title: 'Find the Disputes section',
        body: `Open Disputes in your Dashboard. Browse the list — note the columns: amount, reason code, status, and response deadline.`,
        dashboardLink: { label: 'Disputes', url: 'https://dashboard.stripe.com/disputes' },
        gif: {
          caption: 'Record: the Disputes list in the Stripe Dashboard showing amount, reason, status, and deadline columns.',
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
          caption: 'Record: opening a dispute detail page showing the timeline and response deadline.',
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
          caption: 'Record: the dispute evidence submission form with all available fields visible.',
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
          caption: 'Record: filling in evidence fields and clicking Submit.',
          screen: 'Dispute → Evidence → Submit',
        },
      },
      {
        title: 'Write prevention rules',
        body: `Open Radar Rules in your Dashboard. Create a Review rule: is_new_customer = true and amount > 10000 — This flags large first-time deposits for manual review before the money moves.`,
        dashboardLink: { label: 'Radar Rules', url: 'https://dashboard.stripe.com/radar/rules' },
        gif: {
          caption: 'Record: adding a review rule for new customers with large deposit amounts.',
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
        body: `Open Disputes in your Dashboard. Use the Status filter to view Won and Lost disputes. Open a won dispute — note what evidence was submitted.`,
        dashboardLink: { label: 'Disputes', url: 'https://dashboard.stripe.com/disputes' },
        gif: {
          caption: 'Record: filtering disputes by Won status and opening a won dispute to see submitted evidence.',
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
    narrative:
      `Your head of growth sent you a message at 9am. Three of BetFlow's top customers had deposits declined last night. Your velocity rules caught them. You need to fix this without undoing everything you have built.`,
    overviewAddition: `Good fraud rules create false positives. Good fraud analysts fix them.`,
    steps: [
      {
        title: 'Understand false positive cost',
        body: `Open Radar in your Dashboard. Look at your block rate on the overview. Now consider: if 0.5% of blocked charges are legitimate customers, what is the revenue impact per month at BetFlow's deposit volumes?`,
        dashboardLink: { label: 'Radar', url: 'https://dashboard.stripe.com/radar' },
        gif: {
          caption: 'Record: the Radar overview showing block rate metrics.',
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
        body: `Open Radar Rules in your Dashboard. BetFlow's PaymentIntents include a metadata field kyc_verified set to 'true' for all identity-verified accounts. Create an Allow rule: ::kyc_verified:: = 'true'`,
        dashboardLink: { label: 'Radar Rules', url: 'https://dashboard.stripe.com/radar/rules' },
        gif: {
          caption: 'Record: creating an allow rule using ::kyc_verified:: = \'true\' metadata syntax.',
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
          caption: 'Record: dragging the allow rule to the top of the Allow section.',
          screen: 'Radar → Rules → Drag reorder',
        },
      },
      {
        title: 'Create a risk-specific exception',
        body: `Create another Allow rule for repeat customers: customer_transaction_count > 20 and risk_score < 65 — This passes through established customers who are below the risk threshold.`,
        gif: {
          caption: 'Record: adding a compound allow rule with customer_transaction_count > 20 and risk_score < 65.',
          screen: 'Radar → Rules → New allow rule with AND condition',
        },
      },
      {
        title: 'Test your allow rules',
        body: `Use Stripe's rule tester to check a payment from a long-standing customer. Confirm the allow rule fires before any block rules would have triggered.`,
        gif: {
          caption: 'Record: using the rule tester to verify an allow rule overrides a block rule for a specific payment.',
          screen: 'Radar → Rules → Test rule',
        },
      },
      {
        title: 'Calculate your precision',
        body: `Open Radar in your Dashboard. Note your block rate and your fraud rate. A healthy ratio is fraud rate significantly lower than block rate — if they're close, your rules may be too aggressive or catching too much legitimate traffic.`,
        dashboardLink: { label: 'Radar', url: 'https://dashboard.stripe.com/radar' },
        gif: {
          caption: 'Record: comparing block rate to fraud rate on the Radar Overview.',
          screen: 'Radar → Overview → Metrics comparison',
        },
        callouts: [
          {
            kind: 'tip',
            text: `Target precision formula: fraud_blocked / (fraud_blocked + legit_blocked). Above 0.85 (85%) is considered good. Above 0.95 is excellent. Below 0.70 means you're hurting legitimate revenue significantly.`,
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
      `You have built individual rules and lists throughout this workshop. This final module is about stepping back and thinking about your complete Radar strategy — how the rules interact, what order they run in, and how to maintain and evolve them over time.`,
    narrative:
      `It has been a full week. Your block rate is up, your dispute rate is down, and only one VIP customer complained. Before you write your end-of-week summary, step back and make sure the whole rule set makes sense and nothing obvious is missing.`,
    overviewAddition: `The goal is a rule set you can explain to your manager in five minutes.`,
    steps: [
      {
        title: 'Audit your complete rule set',
        body: `Open Radar Rules in your Dashboard. Look at everything you have built today. You should have: Block rules (risk_level, velocity, IP, lists), Review rules (elevated risk, new customer), Request 3DS rules, Allow rules (KYC, repeat customers).`,
        dashboardLink: { label: 'Radar Rules', url: 'https://dashboard.stripe.com/radar/rules' },
        gif: {
          caption: 'Record: full view of a completed Radar rule set with all sections visible.',
          screen: 'Radar → Rules → Complete rule list',
        },
      },
      {
        title: 'Check the overall rule order',
        body: `Verify your rules follow this general priority: Allow rules first, then Block rules, then Review rules. Radar evaluates top-to-bottom within each category — the first match wins.`,
        gif: {
          caption: 'Record: showing the full rules page with correct ordering across Allow, Block, and Review.',
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
        body: `In Radar Rules, use "Test rule" on your most important block rule. Run it against 5 different payments from your history — a mix of clearly legitimate and flagged charges.`,
        gif: {
          caption: 'Record: using the rule evaluator on multiple historical payments.',
          screen: 'Radar → Rules → Test rule → multiple payments',
        },
      },
      {
        title: 'Set up a Stripe webhook for dispute alerts',
        body: `Open Webhooks in your Dashboard. Add an endpoint. In the events list, select: charge.dispute.created — this will notify your system any time a new dispute is filed.`,
        dashboardLink: { label: 'Webhooks', url: 'https://dashboard.stripe.com/webhooks' },
        gif: {
          caption: 'Record: creating a webhook endpoint and subscribing to charge.dispute.created.',
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
        body: `Open Radar in your Dashboard. Click "Stripe ML" in the block breakdown chart. This shows how many charges were blocked by Stripe's ML model vs your custom rules.`,
        dashboardLink: { label: 'Radar', url: 'https://dashboard.stripe.com/radar' },
        gif: {
          caption: 'Record: clicking "Stripe ML" in the block breakdown chart to see ML vs custom rule blocks.',
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

export const SCORED_MODULES = WORKSHOP_MODULES.filter((m) => !m.isPrerequisite)
export const WORKSHOP_MODULE_COUNT = SCORED_MODULES.length
