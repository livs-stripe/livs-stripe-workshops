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
  | 'stripe-fact'
  | 'billing-fact'

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
  /** Special rendering flags */
  renderDashboardButton?: boolean
  renderCredentialsCard?: boolean
  renderDdosPreview?: boolean
  renderDdosTrigger?: boolean
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
  intro: `You've joined as a participant in this workshop. Before the first module, take five minutes to get your Stripe test account open and familiarize yourself with where things are. Everything in this workshop happens inside that account.`,
  narrative: `You joined BetFlow's payments team three days ago. The previous fraud analyst left without documentation. Your manager has pointed you at Stripe and told you to work out what is going on. This is your account.`,
  steps: [
    {
      title: 'Open your Stripe Dashboard',
      body: `Click the "Open Stripe Dashboard" button in the left sidebar. It will open your account in a new tab. The link is generated fresh each time you click it.\n\nIf the link has expired (they last 5 minutes), just click it again and a new one will be generated.`,
      renderDashboardButton: true,
    },
    {
      title: 'Sign in with your credentials',
      body: `Your test account credentials are shown below. You'll need these if you're prompted to verify your identity or access the account directly at dashboard.stripe.com.`,
      renderCredentialsCard: true,
    },
    {
      title: 'Get familiar with the Dashboard',
      body: `Once you're in, take a look around. The left sidebar is how you navigate. The main sections you'll use today are Payments, Radar, and Disputes. You don't need to do anything yet, just make sure you can see them.`,
      gif: {
        caption: 'Record: the Stripe Dashboard home screen with the left sidebar visible, highlighting Payments, Radar, and Disputes in the navigation.',
        screen: 'Dashboard → Home',
      },
    },
    {
      title: 'Keep the Dashboard open',
      body: `Keep your Stripe Dashboard open in its own tab for the rest of the workshop. Each module will link directly to the relevant section, so you won't need to navigate manually. Just click the link and it takes you straight there.`,
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
      `Stripe Radar is built into every Stripe account with no setup required. Before writing any rules, explore what it shows you and understand how it evaluates payments.`,
    narrative:
      `Before you can fix anything, you need to understand what you're looking at. BetFlow has been on Stripe for two years and nobody has ever looked at the Radar section. Start there.`,
    overviewAddition: `This is your first look at the data BetFlow has been generating for two years.`,
    steps: [
      {
        title: 'Open Radar',
        body: `Open Radar in your Dashboard. You'll land on the overview page showing recent charge activity and block rates.`,
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
            text: `Most accounts start with a block rate of 0% and a review rate of 0% because you haven't written any rules yet. By the end of today, these numbers will be meaningful.`,
          },
        ],
      },
      {
        title: `Find a payment's risk score`,
        body: `Open Payments in your Dashboard. Click on any charge. Scroll down to the Radar section on the right side. You'll see a risk score (0-100) and a risk level label: normal, elevated, or highest.`,
        dashboardLink: { label: 'Payments', url: 'https://dashboard.stripe.com/payments' },
        gif: {
          caption: 'Record: clicking a payment, scrolling to the Radar section, and highlighting the risk score.',
          screen: 'Payments → Charge detail → Radar section',
        },
        callouts: [
          {
            kind: 'explanation',
            text: `The risk score is a percentile: a score of 72 means Stripe considers this payment riskier than 72% of all payments it sees globally. Stripe's model is trained on hundreds of billions of dollars of payment data across millions of businesses.`,
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
        body: `Open Radar Rules in your Dashboard. Click "New rule". In the rule editor, open the Attributes panel on the right. Browse through the available attributes and note the categories: card, customer, IP, payment, velocity.`,
        dashboardLink: { label: 'Radar Rules', url: 'https://dashboard.stripe.com/radar/rules' },
        gif: {
          caption: 'Record: opening the rule editor and browsing the Attributes panel, showing card/customer/IP/velocity categories.',
          screen: 'Radar → Rules → New rule → Attributes panel',
        },
        callouts: [
          {
            kind: 'fraud-fact',
            text: `Stripe can detect whether a card is being used from an anonymous proxy or VPN, the number of times a card has been charged in the last 24 hours across ALL Stripe merchants (not just yours), and whether the billing address matches the card issuer's records. All of this works without you collecting any of this data yourself.`,
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
        body: `Open Radar Rules in your Dashboard. You'll see three sections: Block, Review, and Allow. Rules in each section evaluate top-to-bottom, and the first matching rule wins.`,
        dashboardLink: { label: 'Radar Rules', url: 'https://dashboard.stripe.com/radar/rules' },
        gif: {
          caption: 'Record: the Radar Rules page showing the Block, Review, and Allow sections.',
          screen: 'Radar → Rules',
        },
        callouts: [
          {
            kind: 'info',
            text: `Block rules decline the payment immediately. Review rules flag it for manual inspection but let it through (or hold it, depending on your settings). Allow rules bypass all other matching rules, which is useful for trusted customers.`,
          },
        ],
      },
      {
        title: 'Create your first Block rule',
        body: `In the Block section, click Add rule. In the rule editor, type: risk_level = 'highest', then click Add rule. Confirm the prompt that appears.`,
        gif: {
          caption: 'Record: writing risk_level = \'highest\' in the block rule editor and saving.',
          screen: 'Radar → Rules → New block rule',
        },
        callouts: [
          {
            kind: 'warning',
            text: `Stripe defines "highest" risk as their top confidence tier for fraud. This level is intentionally conservative, so false positive rates at this tier are very low. It's one of the safest first rules to deploy.`,
          },
        ],
      },
      {
        title: 'Understand what you just built',
        body: `"highest" risk level captures roughly the top 1-2% of payments by fraud likelihood. For most businesses this rule blocks around 0.3-0.8% of all payment volume. The tradeoff: some legitimate payments with unusual signals (international card, new customer, high amount) may have elevated scores, but "highest" is specifically the tier where Stripe's confidence in fraud is greatest.`,
        callouts: [
          {
            kind: 'tip',
            text: `You can always review the payments a rule has blocked by going to **Payments > Blocked** and checking which rule triggered the decline.`,
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
            text: `"Elevated" is the medium tier: payments Stripe thinks are worth a second look but hasn't determined are definitely fraud. Putting these in review means they process normally, but you'll see them flagged in your dashboard for manual inspection.`,
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
            text: `The average fraud rate for online merchants is around 0.9% of transactions. For sports betting and gambling platforms it's significantly higher, often 2-4%, because the instant-settlement nature of deposits makes them attractive to fraudsters.`,
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
      `One of the most reliable fraud signals is repetition: the same card, IP address, or email appearing an unusual number of times in a short window. Velocity rules let you count these occurrences and block when they exceed a normal threshold. They're especially effective against automated bot attacks and card testing.`,
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
            text: `Stripe tracks charge counts per card number, per IP address, per email address, and per customer across daily, weekly, and all-time windows. These counts are global across all Stripe merchants, not just your account. So if a card has been used 50 times today across different businesses, you can see that.`,
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
            text: `Why 15 and not 5? Shared IP addresses are common: office networks, university WiFi, and some ISPs use the same IP for many users. A coffee shop with 20 BetFlow customers all depositing from the same IP is legitimate. But 15 deposits from a single IP in a day starts to look unusual even accounting for shared networks.`,
          },
        ],
      },
      {
        title: 'Add AND conditions to be more precise',
        body: `Edit your IP velocity rule. After total_charges_per_ip_daily > 15, add: and is_anonymous_ip = true. The full rule reads: total_charges_per_ip_daily > 15 and is_anonymous_ip = true`,
        gif: {
          caption: 'Record: editing the IP velocity rule to add an AND condition with is_anonymous_ip.',
          screen: 'Radar → Rules → Edit rule',
        },
        callouts: [
          {
            kind: 'explanation',
            text: `is_anonymous_ip is true for traffic from VPNs, proxies, and Tor exit nodes. Combining the velocity threshold with anonymous IP detection makes this rule much more surgical. It catches automated attacks routing through proxies without penalizing customers on legitimate shared networks.`,
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
            text: `Double-colon syntax (::field_name::) accesses PaymentIntent metadata. Any data BetFlow passes in the metadata object on a charge is available as a rule attribute. This is how you build business-specific rules that go beyond Stripe's standard attributes: customer tiers, KYC status, account verification flags, and more.`,
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
    id: 'ddos-simulation',
    number: 4,
    title: 'Under Siege: The Payment DDoS',
    estMinutes: 15,
    intro:
      `A payment DDoS is not a network attack. It's a coordinated flood of fraudulent payment attempts designed to overwhelm your fraud rules, find gaps in your coverage, and get as many charges through as possible before you respond. The attacker doesn't need every charge to succeed. They need enough to make it worthwhile, and they need to do it fast enough that you can't react in time.\n\nThe good news is that Radar can stop most of it automatically, if your rules are written correctly. The bad news is that the rules you've written so far aren't enough on their own. This module adds the missing layer.`,
    narrative:
      `Your engineer just called. Checkout is slowing down across BetFlow. The payments list is filling up with charges faster than you can read them. Someone is hammering the account with dozens of requests per second from rotating IPs and cards. This is a payment DDoS. You have about three minutes before real damage is done.`,
    overviewAddition: `The first time you face a live attack in progress. Speed matters more than perfection.`,
    steps: [
      {
        title: 'Watch it happen first',
        body: `Before writing any rules, click Start Attack below and watch what lands in your payments list. Open Payments in your Dashboard and refresh it. You'll see charges appearing rapidly.\n\nAfter firing: look at the charges. Notice the amounts, the card types, and in the metadata panel of any individual charge, the source_ip field. That's the signal you're going to use.`,
        dashboardLink: { label: 'Payments', url: 'https://dashboard.stripe.com/payments' },
        renderDdosPreview: true,
        gif: {
          caption: 'Record: the Stripe payments list populating rapidly with multiple charges in quick succession.',
          screen: 'Payments list during burst attack',
        },
      },
      {
        title: 'Why velocity rules alone are not enough',
        body: `You already have a velocity rule for IP addresses. But look at the IPs in the charges that just came in. The attacker is rotating across multiple IPs to stay under your threshold. A single IP velocity rule with a limit of 15 per day doesn't catch this because each IP only fires a fraction of the total volume.`,
        callouts: [
          {
            kind: 'explanation',
            text: `This is why experienced fraud teams combine velocity rules with risk score rules and metadata rules. Any single rule can be gamed by varying one parameter. Layered rules that each catch a different signal are much harder to route around.`,
          },
        ],
      },
      {
        title: 'Add a tighter velocity rule for burst detection',
        body: `Open Radar Rules and add a new Block rule:\n\ntotal_charges_per_ip_daily > 5 and is_anonymous_ip = true\n\nThis tightens your existing IP velocity threshold specifically for anonymous IPs. The attacker's rotating IPs are all datacenter addresses, which Stripe flags as anonymous. Legitimate customers rarely use anonymous IPs.`,
        dashboardLink: { label: 'Radar Rules', url: 'https://dashboard.stripe.com/radar/rules' },
        gif: {
          caption: 'Record: adding a tighter velocity rule combining IP count with anonymous IP flag.',
          screen: 'Radar Rules, adding compound block rule',
        },
      },
      {
        title: 'Block by metadata source IP',
        body: `BetFlow passes a source_ip metadata field on every PaymentIntent. The attacker's IPs are in the 198.51.100.x range. Add Block rules for the specific IPs you saw in the preview attack:\n\nBlock if ::source_ip:: = '198.51.100.42'\nBlock if ::source_ip:: = '203.0.113.99'\n\nIn a real incident you would add IPs as you identify them, or use a blocklist that your backend updates automatically.`,
        dashboardLink: { label: 'Radar Rules', url: 'https://dashboard.stripe.com/radar/rules' },
        gif: {
          caption: 'Record: writing a metadata block rule using double-colon source_ip syntax.',
          screen: 'Radar Rules, metadata rule editor',
        },
      },
      {
        title: 'Add a charge frequency rule using risk score',
        body: `High-volume burst attacks almost always involve cards with elevated risk scores because the cards are either stolen, prepaid, or have unusual transaction histories. Add:\n\nBlock if risk_score > 65 and amount < 5000\n\nThis catches high-risk small charges, which is the signature of a DDoS-style fraud burst, without affecting high-value legitimate transactions.`,
        dashboardLink: { label: 'Radar Rules', url: 'https://dashboard.stripe.com/radar/rules' },
        gif: {
          caption: 'Record: adding a compound risk score and amount block rule.',
          screen: 'Radar Rules, new block rule',
        },
      },
      {
        title: 'Fire the real attack',
        body: `Your rules are in place. Now fire the full simulation and see how many charges your ruleset blocks.`,
        renderDdosTrigger: true,
        callouts: [
          {
            kind: 'fraud-fact',
            text: `In 2023, one mid-sized e-commerce platform experienced a payment DDoS involving 8,400 charge attempts in 11 minutes. Their Radar rules blocked 94% of them automatically. The 6% that got through cost $3,200 before manual intervention. Without the rules, the estimated loss was $53,000.`,
          },
        ],
      },
    ],
    doneLabel: `I've defended against a payment DDoS and achieved a block rate above 80%`,
  },
  {
    id: 'custom-lists',
    number: 5,
    title: 'Custom Lists',
    estMinutes: 8,
    intro:
      `Rules catch patterns. Lists catch individuals. When you have specific cards, IP addresses, email addresses, or customers you want to always block (or always allow), lists give you that control without modifying your rule logic.`,
    narrative:
      `Your support inbox has three emails from real customers whose cards were charged without their knowledge. You have their card fingerprints and email addresses. The rules you've written won't stop these specific cards, but lists will.`,
    overviewAddition: `Rules catch patterns. Lists catch the specific cards you already know are bad.`,
    steps: [
      {
        title: 'Explore the Lists page',
        body: `Open Radar Lists in your Dashboard. You'll see Stripe's built-in global lists and a section for your custom lists. Stripe maintains global blocklists of known-bad cards and IPs, and you benefit from these automatically.`,
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
    number: 6,
    title: '3D Secure',
    estMinutes: 10,
    intro:
      `Blocking payments is a blunt instrument. Sometimes you want to add a verification step rather than decline outright, especially for higher-value payments where the friction is worth it. 3D Secure (3DS) does exactly this: it asks the cardholder to authenticate through their bank, which both catches fraudsters and shifts fraud liability away from BetFlow.`,
    narrative:
      `Your block rate has improved but you're declining some payments that look borderline. A colleague suggests that instead of blocking them outright, you make those customers prove they're real. That's what 3D Secure is for.`,
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
            text: `When 3DS authentication succeeds, fraud liability shifts from the merchant to the card issuer. This means even if a fraudulent payment gets through, BetFlow won't be held liable for the resulting chargeback. The card issuer absorbs the loss. This is called "liability shift" and it's one of the most valuable protections available.`,
          },
        ],
      },
      {
        title: 'Find the Request 3DS section in Rules',
        body: `Open Radar Rules in your Dashboard. Scroll below the Block and Review sections. You'll see a third section: Request 3DS. This is separate from Block and Review.`,
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
            text: `Instead of blocking elevated-risk charges, you're requesting additional authentication. Genuine cardholders complete 3DS in about 10 seconds via an SMS code or biometric in their banking app. Fraudsters who stole a card number don't have access to the cardholder's phone and can't complete authentication, so the payment declines at the authentication step, not the payment step.`,
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
            text: `Stripe amounts are in the smallest currency unit, which is cents for AUD. 20000 cents = $200.00 AUD. Double-check your amounts when writing rules.`,
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
    number: 7,
    title: 'Handling Disputes',
    estMinutes: 12,
    intro:
      `Disputes (also called chargebacks) happen when a cardholder tells their bank a charge was unauthorized. The bank immediately reverses the funds and gives the merchant a window to respond with evidence. Understanding the dispute process and knowing how to fight disputes is as important as preventing fraud in the first place.`,
    narrative:
      `Four disputes came in overnight. BetFlow has never responded to a dispute before because the previous analyst didn't know you could. You're about to find out how the process works and what happens when you actually submit evidence.`,
    overviewAddition: `BetFlow has been leaving money on the table every time a dispute went uncontested.`,
    steps: [
      {
        title: 'Find the Disputes section',
        body: `Open Disputes in your Dashboard. Browse the list and note the columns: amount, reason code, status, and response deadline.`,
        dashboardLink: { label: 'Disputes', url: 'https://dashboard.stripe.com/disputes' },
        gif: {
          caption: 'Record: the Disputes list in the Stripe Dashboard showing amount, reason, status, and deadline columns.',
          screen: 'Payments → Disputes',
        },
        callouts: [
          {
            kind: 'info',
            text: `Dispute reason codes tell you why the cardholder disputed. "Fraudulent" means they claim they didn't make the charge. "Product not received" or "Subscription cancelled" are different reasons requiring different evidence. Always read the reason code first because it determines your defense strategy.`,
          },
        ],
      },
      {
        title: 'Open a dispute and understand the timeline',
        body: `Click on any dispute. Note the date the dispute was opened, the response deadline, and the dispute amount (which may include a dispute fee on top of the original charge amount).`,
        gif: {
          caption: 'Record: opening a dispute detail page showing the timeline and response deadline.',
          screen: 'Dispute detail → Timeline',
        },
        callouts: [
          {
            kind: 'warning',
            text: `Dispute deadlines are hard cutoffs. Miss the deadline and you automatically lose with no extension. Stripe sends email notifications for new disputes, but also consider setting up Stripe webhooks or the Stripe mobile app to get real-time alerts.`,
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
        body: `Fill in the available evidence fields using the test data provided, then click Submit evidence. Once submitted, evidence can't be changed.`,
        gif: {
          caption: 'Record: filling in evidence fields and clicking Submit.',
          screen: 'Dispute → Evidence → Submit',
        },
      },
      {
        title: 'Write prevention rules',
        body: `Open Radar Rules in your Dashboard. Create a Review rule: is_new_customer = true and amount > 10000. This flags large first-time deposits for manual review before the money moves.`,
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
        body: `Open Disputes in your Dashboard. Use the Status filter to view Won and Lost disputes. Open a won dispute and note what evidence was submitted.`,
        dashboardLink: { label: 'Disputes', url: 'https://dashboard.stripe.com/disputes' },
        gif: {
          caption: 'Record: filtering disputes by Won status and opening a won dispute to see submitted evidence.',
          screen: 'Disputes → Filter by Won',
        },
        callouts: [
          {
            kind: 'fraud-fact',
            text: `Merchants who submit thorough, well-organized evidence win approximately 40-45% of fraud disputes. Merchants who don't respond lose 100% of them. The evidence submission step is literally the difference between recovering your money and not.`,
          },
        ],
      },
    ],
    doneLabel: `I've reviewed a dispute, submitted evidence, and written a prevention rule`,
  },
  {
    id: 'allow-rules',
    number: 8,
    title: 'Allow Rules & False Positives',
    estMinutes: 10,
    intro:
      `The hidden cost of fraud prevention is legitimate customers getting incorrectly blocked. Every time a real customer's deposit is declined, BetFlow loses that revenue and risks losing the customer permanently. This module covers how to protect your best customers from your own fraud rules using allow rules and precise rule conditions.`,
    narrative:
      `Your head of growth sent you a message at 9am. Three of BetFlow's top customers had deposits declined last night. Your velocity rules caught them. You need to fix this without undoing everything you've built.`,
    overviewAddition: `Good fraud rules create false positives. Good fraud analysts fix them.`,
    steps: [
      {
        title: 'Understand false positive cost',
        body: `Open Radar in your Dashboard. Look at your block rate on the overview. Now consider: if 0.5% of blocked charges are legitimate customers, what's the revenue impact per month at BetFlow's deposit volumes?`,
        dashboardLink: { label: 'Radar', url: 'https://dashboard.stripe.com/radar' },
        gif: {
          caption: 'Record: the Radar overview showing block rate metrics.',
          screen: 'Radar → Overview → Metrics',
        },
        callouts: [
          {
            kind: 'info',
            text: `Industry research suggests the average false positive rate for online fraud detection is around 1.3%, meaning roughly 1 in 75 declined payments is a legitimate customer. For a sports betting platform where customers have many alternatives, a declined deposit very often means they simply open a competitor's app.`,
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
            text: `KYC-verified customers have proven their identity, so they're a known person with a real card linked to a verified account. Running them through aggressive velocity and IP rules creates unnecessary friction. This allow rule bypasses your block rules for verified customers while still protecting against the highest-risk signals.`,
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
        body: `Create another Allow rule for repeat customers: customer_transaction_count > 20 and risk_score < 65. This passes through established customers who are below the risk threshold.`,
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
        body: `Open Radar in your Dashboard. Note your block rate and your fraud rate. A healthy ratio is fraud rate significantly lower than block rate. If they're close, your rules may be too aggressive or catching too much legitimate traffic.`,
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
    number: 9,
    title: 'Putting It All Together',
    estMinutes: 8,
    intro:
      `You've built individual rules and lists throughout this workshop. This final module is about stepping back and thinking about your complete Radar strategy: how the rules interact, what order they run in, and how to maintain and evolve them over time.`,
    narrative:
      `It's been a full week. Your block rate is up, your dispute rate is down, and only one VIP customer complained. Before you write your end-of-week summary, step back and make sure the whole rule set makes sense and nothing obvious is missing.`,
    overviewAddition: `The goal is a rule set you can explain to your manager in five minutes.`,
    steps: [
      {
        title: 'Audit your complete rule set',
        body: `Open Radar Rules in your Dashboard. Look at everything you've built today. You should have: Block rules (risk_level, velocity, IP, lists), Review rules (elevated risk, new customer), Request 3DS rules, Allow rules (KYC, repeat customers).`,
        dashboardLink: { label: 'Radar Rules', url: 'https://dashboard.stripe.com/radar/rules' },
        gif: {
          caption: 'Record: full view of a completed Radar rule set with all sections visible.',
          screen: 'Radar → Rules → Complete rule list',
        },
      },
      {
        title: 'Check the overall rule order',
        body: `Verify your rules follow this general priority: Allow rules first, then Block rules, then Review rules. Radar evaluates top-to-bottom within each category, and the first match wins.`,
        gif: {
          caption: 'Record: showing the full rules page with correct ordering across Allow, Block, and Review.',
          screen: 'Radar → Rules → Full view',
        },
        callouts: [
          {
            kind: 'info',
            text: `Rule order edge cases: an Allow rule ABOVE a Block rule means the allow fires first and the payment bypasses the block. An Allow rule BELOW a Block rule means the block fires first, and the allow never gets evaluated. Always sanity-check order when adding new rules.`,
          },
        ],
      },
      {
        title: 'Use the rule evaluator for a final audit',
        body: `In Radar Rules, use "Test rule" on your most important block rule. Run it against 5 different payments from your history, using a mix of clearly legitimate and flagged charges.`,
        gif: {
          caption: 'Record: using the rule evaluator on multiple historical payments.',
          screen: 'Radar → Rules → Test rule → multiple payments',
        },
      },
      {
        title: 'Set up a Stripe webhook for dispute alerts',
        body: `Open Webhooks in your Dashboard. Add an endpoint. In the events list, select: charge.dispute.created. This will notify your system any time a new dispute is filed.`,
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
  {
    id: 'ml-risk-scores',
    number: 10,
    title: 'How Radar ML Scores Work',
    estMinutes: 10,
    intro:
      `Every payment processed through Stripe gets a risk score from 0 to 100. This score comes from a machine learning model trained on data from millions of businesses. Understanding how the model works, what it sees, and where it has blind spots helps you write smarter rules and avoid fighting the model with your own logic.`,
    narrative:
      `Your manager asked a simple question at standup: "How does Radar actually decide what's risky?" You realized you've been writing rules on top of a system you don't fully understand. Time to look under the hood.`,
    overviewAddition: `Understanding the ML model means writing rules that complement it instead of duplicating it.`,
    steps: [
      {
        title: 'Understand the two-layer system',
        body: `Radar has two layers working in parallel. The first is Stripe's ML model, which scores every payment automatically. The second is your custom rules, which you've been writing throughout this workshop. Both evaluate every payment independently.\n\nThe ML model runs first and assigns a risk score. Your rules then evaluate using that score (and hundreds of other attributes). A payment can be blocked by the ML model alone, by your rules alone, or by both.`,
        dashboardLink: { label: 'Radar', url: 'https://dashboard.stripe.com/radar' },
        callouts: [
          {
            kind: 'explanation',
            text: `The ML model is trained on fraud patterns across all Stripe merchants globally. It sees signals you can't access in rules, like cross-merchant velocity patterns (how many times a card was declined at other businesses today) and issuer-level fraud trends. Your rules add business-specific logic the model can't learn on its own.`,
          },
        ],
      },
      {
        title: 'Explore the risk score distribution',
        body: `Go to **Radar > Overview** in your Dashboard. Look at the block breakdown chart. Click into the different score ranges to see how payments distribute across the 0-100 scale.\n\nMost legitimate payments cluster in the 0-20 range. Fraudulent payments tend to appear in the 65-100 range. The 20-65 range is where the most interesting decisions happen, as these are payments where the model isn't confident either way.`,
        dashboardLink: { label: 'Radar', url: 'https://dashboard.stripe.com/radar' },
        gif: {
          caption: 'Record: the Radar overview showing the risk score distribution chart.',
          screen: 'Radar → Overview → Score distribution',
        },
        callouts: [
          {
            kind: 'fraud-fact',
            text: `Stripe's ML model evaluates over 1,000 signals per payment, including card fingerprint behavior across the network, device fingerprinting signals, IP geolocation patterns, and transaction velocity across all Stripe merchants. No single merchant could build this dataset alone.`,
          },
        ],
      },
      {
        title: 'Read the risk insights on a payment',
        body: `Go to **Payments** and click on any payment with a risk score above 50. In the Radar section, expand "Risk insights" to see which specific signals drove the score up or down.\n\nEach insight shows a signal name and whether it increased or decreased risk. Signals like "Card used from a new country" increase risk. Signals like "Customer has a history of successful payments" decrease it.`,
        dashboardLink: { label: 'Payments', url: 'https://dashboard.stripe.com/payments' },
        gif: {
          caption: 'Record: expanding risk insights on a payment with an elevated score.',
          screen: 'Payment detail → Radar → Risk insights',
        },
      },
      {
        title: 'Understand model blind spots',
        body: `The ML model is powerful but it doesn't know everything about your business. It can't see:\n\n- Whether a customer passed your KYC checks\n- Whether a deposit is connected to a promotion or bonus\n- Whether an account was created today or six months ago in your system\n- Whether a customer's betting behavior looks unusual for their profile\n\nThis is exactly why custom rules and metadata exist. Your rules fill the gaps the model can't cover. The best fraud strategies use the model for broad pattern detection and custom rules for business-specific logic.`,
        callouts: [
          {
            kind: 'tip',
            text: `Avoid writing rules that duplicate what the model already does well. If you write a rule for "block if card country doesn't match IP country," you're likely catching payments the model already scores as high-risk. Instead, focus your rules on signals only you have access to, like metadata fields, customer tiers, and internal verification status.`,
          },
        ],
      },
      {
        title: 'Compare ML blocks vs rule blocks',
        body: `Go back to **Radar > Overview**. In the block breakdown chart, compare how many payments were blocked by Stripe's ML model versus your custom rules. A healthy split shows both contributing. If the ML model is blocking everything, your rules may be redundant. If your rules are blocking everything, you may be too aggressive and the model would have caught most of those anyway.`,
        dashboardLink: { label: 'Radar', url: 'https://dashboard.stripe.com/radar' },
        gif: {
          caption: 'Record: the block breakdown showing ML model vs custom rule contribution.',
          screen: 'Radar → Overview → Block breakdown',
        },
      },
    ],
    doneLabel: `I understand how Radar's ML scoring works and where custom rules add value`,
  },
  {
    id: 'review-queues',
    number: 11,
    title: 'Review Queue Workflows',
    estMinutes: 12,
    intro:
      `Blocking and allowing are binary decisions. Review rules create a third option: flag a payment for human inspection without declining it. For fraud teams handling volume, the review queue is where the most nuanced decisions happen. This module covers how to build an efficient review workflow.`,
    narrative:
      `BetFlow's support team has been complaining. They keep getting emails from customers whose deposits were blocked. Some are clearly fraudulent, but some look legitimate. Your manager wants you to set up a proper review process instead of just blocking everything above a threshold.`,
    overviewAddition: `Moving from "block everything suspicious" to "block the obvious, review the rest."`,
    steps: [
      {
        title: 'Find the Reviews section',
        body: `Go to **Radar > Reviews** in your Dashboard. This is where payments flagged by your Review rules appear. Each entry shows the payment amount, customer email, risk score, and the rule that triggered the review.`,
        dashboardLink: { label: 'Radar Reviews', url: 'https://dashboard.stripe.com/radar/reviews' },
        gif: {
          caption: 'Record: the Radar Reviews queue showing flagged payments.',
          screen: 'Radar → Reviews',
        },
        callouts: [
          {
            kind: 'info',
            text: `Payments in review are not held or delayed by default. The charge goes through normally, but it's flagged in your queue for inspection. If you determine it's fraud after review, you can refund it. This approach avoids blocking legitimate customers while still catching fraud that slips past your block rules.`,
          },
        ],
      },
      {
        title: 'Write targeted review rules',
        body: `Go to **Radar > Rules** and create Review rules that catch the gray area between "clearly legitimate" and "clearly fraud." Good review rule candidates:\n\n- \`risk_score > 50 and risk_score < 75\` (medium-risk payments)\n- \`is_new_customer = true and amount > 10000\` (large first-time deposits)\n- \`card_country != ip_country\` (geographic mismatch)\n\nThese rules flag payments worth a second look without blocking customers outright.`,
        dashboardLink: { label: 'Radar Rules', url: 'https://dashboard.stripe.com/radar/rules' },
        gif: {
          caption: 'Record: adding multiple review rules for different risk scenarios.',
          screen: 'Radar → Rules → Review section',
        },
      },
      {
        title: 'Review a flagged payment',
        body: `In the Reviews queue, click on a flagged payment. Look at the full picture: the risk score, risk insights, customer email, card details, IP location, and any metadata. Then make a decision: Approve (it's legitimate) or Refund (it's fraud).\n\nWhen reviewing, ask yourself:\n- Does the email look like a real person or a throwaway?\n- Does the card country match the IP country?\n- Is the amount unusual for this type of customer?\n- Are there multiple payments from the same card or email recently?`,
        gif: {
          caption: 'Record: reviewing a flagged payment and approving or refunding it.',
          screen: 'Radar → Reviews → Payment review',
        },
      },
      {
        title: 'Set up review SLAs',
        body: `For a real fraud operation, review queue discipline matters. Define a target response time for your team. For example:\n\n- High-value payments (over $500): review within 1 hour\n- Medium-value payments ($100-$500): review within 4 hours\n- Low-value payments (under $100): review within 24 hours\n\nUse the dispute webhook you set up earlier to get real-time alerts. Disputes have hard deadlines, and the faster you respond, the better your win rate.`,
        callouts: [
          {
            kind: 'tip',
            text: `If your review queue is consistently backed up, your review rules are probably too broad. Tighten the criteria to reduce volume and focus on the payments that genuinely need human judgment. A manageable queue size is 20-50 reviews per day per analyst.`,
          },
        ],
      },
      {
        title: 'Use review outcomes to improve rules',
        body: `After reviewing payments for a while, patterns emerge. If you consistently approve payments from a certain customer segment, add an Allow rule for that segment. If you consistently refund payments matching a pattern, add a Block rule.\n\nThe review queue is a feedback loop: it shows you where your rules have gaps and helps you calibrate the boundary between block and allow over time.`,
        callouts: [
          {
            kind: 'explanation',
            text: `The best fraud teams treat their review queue as a data source, not just a task list. Track your approve/refund ratio over time. If you're approving 90%+ of reviewed payments, your review rules are too aggressive and you're wasting analyst time. If you're refunding 50%+, consider converting some review rules to block rules.`,
          },
        ],
      },
    ],
    doneLabel: `I've set up review rules and understand the review queue workflow`,
  },
  {
    id: 'rule-strategy-at-scale',
    number: 12,
    title: 'Rule Strategy & Team Operations',
    estMinutes: 10,
    intro:
      `A handful of rules is easy to manage. Fifty rules written by three different analysts over six months is a maintenance problem. This module covers how fraud teams organize, version, test, and evolve their rule sets without breaking things.`,
    narrative:
      `BetFlow is hiring two more fraud analysts next month. Your manager asked you to document how the rules work so the new hires can contribute without accidentally blocking half the customer base. You need a system, not just rules.`,
    overviewAddition: `Scaling from one analyst to a team means building process around your rules.`,
    steps: [
      {
        title: 'Organize rules by purpose',
        body: `Go to **Radar > Rules** and look at your full rule set. Group your rules mentally into categories:\n\n- **Baseline rules**: risk_level = 'highest' and similar defaults that every account should have\n- **Velocity rules**: anything counting charges per card, IP, or email over time\n- **Identity rules**: KYC verification, email domain blocks, metadata checks\n- **Incident rules**: specific IPs or cards added during an active attack\n- **Exception rules**: allow rules for VIP customers or known-good patterns\n\nWhen a new analyst joins, they should be able to look at the rules page and understand the strategy without reading a separate document.`,
        dashboardLink: { label: 'Radar Rules', url: 'https://dashboard.stripe.com/radar/rules' },
        gif: {
          caption: 'Record: the full rules page organized by rule purpose categories.',
          screen: 'Radar → Rules → Full organized view',
        },
      },
      {
        title: 'Test before you deploy',
        body: `Before adding or changing a rule, always use "See payments this rule would have affected" from the three-dot menu. This shows you how many historical payments the rule would have blocked or reviewed.\n\nLook at the results carefully. If a new rule would have blocked 500 payments last month, check whether those were actually fraudulent. A rule that blocks 500 payments but only catches 50 fraudulent ones has a 90% false positive rate and will hurt your customers.`,
        gif: {
          caption: 'Record: testing a rule against historical data before deploying it.',
          screen: 'Radar → Rules → Test against history',
        },
        callouts: [
          {
            kind: 'warning',
            text: `Never deploy a rule during a live attack without testing it first. In the heat of an incident it's tempting to add aggressive rules quickly. Take 30 seconds to check the historical impact. A rule that blocks 2% of all traffic instead of just the attack traffic will cause more damage than the fraud itself.`,
          },
        ],
      },
      {
        title: 'Build a rule change process',
        body: `For a team environment, every rule change should follow a simple process:\n\n1. **Identify the problem**: what fraud pattern are you seeing?\n2. **Draft the rule**: write the rule in the editor but don't save yet\n3. **Test against history**: check what it would have caught and what it would have blocked incorrectly\n4. **Deploy**: save the rule and monitor the block rate for the next 24 hours\n5. **Review**: after a week, check the rule's impact on block rate, dispute rate, and false positives\n\nFor high-impact rules (anything expected to block more than 0.5% of traffic), get a second opinion from another analyst before deploying.`,
        callouts: [
          {
            kind: 'tip',
            text: `Keep a simple log of rule changes. Even a shared spreadsheet with date, analyst, rule description, and reason is better than nothing. When something goes wrong six months later, you'll want to know who added what and why.`,
          },
        ],
      },
      {
        title: 'Monitor rule performance over time',
        body: `Go to **Radar > Overview** in your Dashboard. Track these metrics weekly:\n\n- **Block rate**: percentage of payments blocked. Should be stable unless you change rules or face new attack patterns\n- **Dispute rate**: percentage of payments that result in disputes. Should decrease as your rules improve\n- **False positive rate**: estimated percentage of blocked payments that were legitimate. Hard to measure exactly, but customer complaints and support tickets are a proxy\n\nIf your block rate spikes without a corresponding attack, a rule is probably too broad. If your dispute rate spikes, your rules aren't catching enough.`,
        dashboardLink: { label: 'Radar', url: 'https://dashboard.stripe.com/radar' },
        gif: {
          caption: 'Record: Radar overview metrics showing block rate and dispute rate trends.',
          screen: 'Radar → Overview → Metrics trends',
        },
      },
      {
        title: 'Plan for incident response',
        body: `When an attack hits, your team needs a playbook:\n\n1. **Detect**: set up alerts via webhooks for unusual spike in charges or declines\n2. **Assess**: check Payments for the pattern. What do the charges have in common?\n3. **Respond**: add targeted block rules. Use metadata and IP rules for precision, not broad risk score thresholds\n4. **Clean up**: after the attack stops, review the rules you added. Keep the ones that have long-term value, remove the ones that were incident-specific\n5. **Debrief**: document what happened, what worked, and what you'd do differently\n\nThe DDoS simulation you ran earlier was practice for this exact scenario.`,
        callouts: [
          {
            kind: 'fraud-fact',
            text: `Fraud teams that have a documented incident response process resolve attacks 3x faster than those that improvise. The difference isn't skill, it's having a checklist to follow when adrenaline is high and thinking clearly is hard.`,
          },
        ],
      },
    ],
    doneLabel: `I understand how to organize rules, test changes, and run a fraud team operation`,
  },
]

export const SCORED_MODULES = WORKSHOP_MODULES.filter((m) => !m.isPrerequisite)
export const WORKSHOP_MODULE_COUNT = SCORED_MODULES.length
