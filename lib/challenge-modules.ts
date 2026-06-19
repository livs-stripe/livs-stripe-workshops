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
  ruleAction?: 'block' | 'review'
  checklist?: string[]
  fireTitle?: string
  fireDescription?: string
  expectedCharges?: number
  warningText?: string
}

export type ChargeConfig = {
  count: number
  amountMinCents: number
  amountMaxCents: number
  testCard?: string
  metadata: Record<string, string>
  sameCard?: boolean
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
  chargeConfig: ChargeConfig[]
  bonusCents?: number
  bonusThreshold?: number
}

export const STARTING_BALANCE_CENTS = 1_000_000 // AUD $10,000
export const TOTAL_MODULES = 8

export const CHALLENGE_MODULES: ChallengeModule[] = [
  // MODULE 1 — Card Testing
  {
    number: 1,
    id: 'card_testing',
    title: 'Card Testing',
    tagline: 'Someone is using BetFlow to test stolen cards.',
    difficulty: 'Beginner',
    expectedCharges: 20,
    maxExposureCents: 18000,
    steps: [
      {
        stepNumber: 1,
        type: 'read',
        title: 'What is card testing?',
        content:
          'Card testing is when fraudsters use your payment form to test whether stolen card numbers are valid. They make small charges — typically $0.50 and $1.00 — because these are less likely to trigger alerts or be noticed by the cardholder. BetFlow is seeing a wave of micro-transactions from new accounts that have never placed a legitimate bet. These are not real customers — they are using your platform as a card validation service.',
      },
      {
        stepNumber: 2,
        type: 'action',
        title: 'Open your Radar Rules',
        instruction:
          'Open your Stripe Dashboard and navigate to the Radar Rules page. This is where you will create rules to block fraudulent transactions.',
        dashboardLink: '/radar/rules',
        checkboxLabel: 'I have the Radar Rules page open',
      },
      {
        stepNumber: 3,
        type: 'rule',
        title: 'Block micro-transactions from new customers',
        ruleCode: 'amount_in_cents < 200 AND is_new_customer = true',
        ruleExplanation:
          'This rule blocks any charge under $2.00 from a customer who has never successfully transacted with BetFlow before. Legitimate new customers rarely deposit less than $5, so this catches card testers without affecting real users.',
        ruleAction: 'block',
      },
      {
        stepNumber: 4,
        type: 'verify',
        title: 'Before you start — check your setup',
        checklist: [
          'I can see my new block rule in the Active Rules list',
          'The rule shows status: Active (not Draft)',
          'I understand that charges under $2.00 from new customers will now be declined',
        ],
      },
      {
        stepNumber: 5,
        type: 'fire',
        title: 'Card Testing Simulation',
        fireTitle: 'Card Testing Simulation',
        fireDescription:
          '20 charges incoming: 15 micro-transactions (card testing) and 5 normal deposits (legitimate customers).',
        expectedCharges: 20,
        warningText:
          'Your rule should block the 15 micro-transactions while allowing the 5 legitimate deposits through.',
      },
    ],
    chargeConfig: [
      {
        count: 15,
        amountMinCents: 50,
        amountMaxCents: 150,
        testCard: 'pm_card_visa',
        metadata: { fraud_type: 'card_testing', risk_level: 'medium' },
      },
      {
        count: 5,
        amountMinCents: 2000,
        amountMaxCents: 8000,
        testCard: 'pm_card_visa',
        metadata: { fraud_type: 'legitimate' },
      },
    ],
  },

  // MODULE 2 — Velocity Attack
  {
    number: 2,
    id: 'velocity_attack',
    title: 'Velocity Attack',
    tagline: 'One stolen card. Maximum extraction before it gets cancelled.',
    difficulty: 'Beginner',
    expectedCharges: 25,
    maxExposureCents: 125000,
    steps: [
      {
        stepNumber: 1,
        type: 'read',
        title: 'The velocity play',
        content:
          'A fraudster has obtained a single high-value stolen card. Their strategy is simple: charge it as many times as possible before the cardholder notices and cancels it. You will see rapid-fire charges of $30–$80 from the same card, spaced just 200ms apart. This is not a human betting pattern — it is automated extraction.',
      },
      {
        stepNumber: 2,
        type: 'action',
        title: 'Check your current payments',
        instruction:
          'Open the Payments page in your Stripe Dashboard. Look for repeated charges from the same card in quick succession.',
        dashboardLink: '/payments',
        checkboxLabel: 'I can see repeated charges from the same card',
      },
      {
        stepNumber: 3,
        type: 'rule',
        title: 'Add a card velocity rule',
        ruleCode: 'total_charges_per_card_daily > 3',
        ruleExplanation:
          'This rule blocks any card that has already been charged more than 3 times in a single day. Normal bettors rarely place more than 3 deposits per day.',
        ruleAction: 'block',
      },
      {
        stepNumber: 4,
        type: 'rule',
        title: 'Add a second velocity layer — IP address',
        ruleCode: 'total_charges_per_ip_daily > 10',
        ruleExplanation:
          'This adds a second layer of velocity protection. Even if a fraudster uses multiple cards, they often operate from the same IP address. Blocking IPs with more than 10 charges per day catches this pattern.',
        ruleAction: 'block',
      },
      {
        stepNumber: 5,
        type: 'verify',
        title: 'Verify both rules are active',
        checklist: [
          'Card velocity rule (total_charges_per_card_daily > 3) is Active',
          'IP velocity rule (total_charges_per_ip_daily > 10) is Active',
          'Both rules are set to Block (not Review)',
        ],
      },
      {
        stepNumber: 6,
        type: 'fire',
        title: 'Velocity Attack Simulation',
        fireTitle: 'Velocity Attack Simulation',
        fireDescription:
          '25 charges from the same card, spaced 200ms apart, ranging from $30–$80 each.',
        expectedCharges: 25,
        warningText:
          'Your card velocity rule should allow the first 3 charges and block the remaining 22.',
      },
    ],
    chargeConfig: [
      {
        count: 25,
        amountMinCents: 3000,
        amountMaxCents: 8000,
        testCard: 'pm_card_visa',
        sameCard: true,
        metadata: { fraud_type: 'velocity', source_ip: '203.0.113.42' },
      },
    ],
  },

  // MODULE 3 — High Risk Score
  {
    number: 3,
    id: 'high_risk_score',
    title: 'High Risk Score',
    tagline: "Stripe's AI flagged these. Do you trust it?",
    difficulty: 'Intermediate',
    expectedCharges: 30,
    maxExposureCents: 450000,
    steps: [
      {
        stepNumber: 1,
        type: 'read',
        title: "Stripe's risk scoring",
        content:
          "Stripe Radar assigns a risk score from 0 to 100 to every charge. This score is based on hundreds of signals — card velocity across the Stripe network, device fingerprinting, behavioural patterns, and more. A score of 75+ means Stripe's AI is highly confident this is fraud. A score of 50–74 means elevated risk. A wave of high-scoring cards is about to hit BetFlow.",
      },
      {
        stepNumber: 2,
        type: 'action',
        title: 'Find the risk score on a payment',
        instruction:
          'Open the Payments page and click on any payment. Look for the risk score field in the payment details panel.',
        dashboardLink: '/payments',
        checkboxLabel: 'I have found the risk score field on a payment',
      },
      {
        stepNumber: 3,
        type: 'rule',
        title: 'Block high risk score transactions',
        ruleCode: 'risk_score >= 75',
        ruleExplanation:
          'Charges with a risk score of 75 or above have been identified by Stripe as very likely fraudulent. Blocking these outright protects BetFlow from the highest-confidence fraud.',
        ruleAction: 'block',
      },
      {
        stepNumber: 4,
        type: 'rule',
        title: 'Send elevated risk to review',
        ruleCode: 'risk_score >= 50 AND risk_score < 75',
        ruleExplanation:
          'Charges in the 50–74 risk range are suspicious but not certain fraud. Sending them to manual review lets your team make a final call without auto-blocking potentially legitimate customers.',
        ruleAction: 'review',
      },
      {
        stepNumber: 5,
        type: 'verify',
        title: 'Check your rule coverage',
        checklist: [
          'Block rule covers risk_score >= 75',
          'Review rule covers risk_score 50-74',
          'I understand legitimate low-risk cards (score < 50) will still go through',
        ],
      },
      {
        stepNumber: 6,
        type: 'fire',
        title: 'High Risk Wave',
        fireTitle: 'High Risk Wave',
        fireDescription:
          '30 charges incoming: 20 high-risk fraudulent charges and 10 legitimate low-risk charges.',
        expectedCharges: 30,
        warningText:
          'Your block rule should catch the 20 high-risk charges. The 10 legitimate charges should pass through unaffected.',
      },
    ],
    chargeConfig: [
      {
        count: 20,
        amountMinCents: 10000,
        amountMaxCents: 50000,
        testCard: 'pm_card_chargeDeclinedFraudulent',
        metadata: { fraud_type: 'high_risk_score', risk_level: 'high' },
      },
      {
        count: 10,
        amountMinCents: 3000,
        amountMaxCents: 15000,
        testCard: 'pm_card_visa',
        metadata: { fraud_type: 'legitimate', risk_level: 'low' },
      },
    ],
  },

  // MODULE 4 — Anonymous IP Attack
  {
    number: 4,
    id: 'anonymous_ip',
    title: 'Anonymous IP Attack',
    tagline: 'They are hiding behind VPNs. Your rules need to see through it.',
    difficulty: 'Intermediate',
    expectedCharges: 30,
    maxExposureCents: 300000,
    steps: [
      {
        stepNumber: 1,
        type: 'read',
        title: 'Why fraudsters use VPNs',
        content:
          'Fraudsters use VPNs, Tor exit nodes, and datacenter proxies to hide their real location. A legitimate BetFlow customer in Sydney will have a residential Australian IP. A fraudster using stolen AU cards from overseas will route through a VPN — but Stripe can detect anonymous IPs, datacenter hosting, and Tor usage. These signals are available in your Radar rules.',
      },
      {
        stepNumber: 2,
        type: 'rule',
        title: 'Block anonymous IPs',
        ruleCode: 'is_anonymous_ip = true',
        ruleExplanation:
          'This rule blocks any charge originating from a known VPN, Tor exit node, or anonymous proxy. Legitimate customers betting from home will not be affected.',
        ruleAction: 'block',
      },
      {
        stepNumber: 3,
        type: 'rule',
        title: 'Block high IP risk score',
        ruleCode: 'ip_risk_score > 60',
        ruleExplanation:
          'Even IPs that are not flagged as anonymous can have elevated risk scores based on historical fraud patterns. This catches datacenter IPs and hosting providers commonly used for fraud.',
        ruleAction: 'block',
      },
      {
        stepNumber: 4,
        type: 'action',
        title: 'View an anonymous IP in your Dashboard',
        instruction:
          'Open the Payments page and look for the IP intelligence panel on a payment. This shows whether the IP is anonymous, its risk score, and geographic data.',
        dashboardLink: '/payments',
        checkboxLabel: 'I have seen the IP intelligence panel',
      },
      {
        stepNumber: 5,
        type: 'verify',
        title: 'Verify IP rules are active',
        checklist: [
          'is_anonymous_ip block rule is Active',
          'ip_risk_score > 60 block rule is Active',
          'I understand that legitimate customers on residential IPs are unaffected',
        ],
      },
      {
        stepNumber: 6,
        type: 'fire',
        title: 'Anonymous IP Simulation',
        fireTitle: 'Anonymous IP Simulation',
        fireDescription:
          '30 charges incoming: 20 from VPN/datacenter IPs and 10 from clean residential Australian IPs.',
        expectedCharges: 30,
        warningText:
          'Your anonymous IP rules should block the 20 VPN charges while allowing the 10 residential charges through.',
      },
    ],
    chargeConfig: [
      {
        count: 20,
        amountMinCents: 5000,
        amountMaxCents: 30000,
        testCard: 'pm_card_visa',
        metadata: {
          fraud_type: 'anonymous_ip',
          is_anonymous_ip: 'true',
          source_ip: '198.51.100.1',
        },
      },
      {
        count: 10,
        amountMinCents: 2000,
        amountMaxCents: 10000,
        testCard: 'pm_card_visa',
        metadata: {
          fraud_type: 'legitimate',
          is_anonymous_ip: 'false',
          source_ip: '61.9.22.15',
        },
      },
    ],
  },

  // MODULE 5 — Geographic Compliance Block
  {
    number: 5,
    id: 'geo_compliance',
    title: 'Geographic Compliance Block',
    tagline: 'BetFlow is AU/UK only. That is not a preference — it is the law.',
    difficulty: 'Intermediate',
    expectedCharges: 25,
    maxExposureCents: 200000,
    steps: [
      {
        stepNumber: 1,
        type: 'read',
        title: 'Licensing and geographic compliance',
        content:
          'BetFlow holds gambling licences in Australia (ACMA) and the United Kingdom (UKGC). Under these licences — and laws like the US Unlawful Internet Gambling Enforcement Act (UIGEA) — accepting bets from unlicensed jurisdictions is illegal. Cards issued in the US, China, Turkey, and South Korea must be blocked. This is not fraud prevention — it is legal compliance.',
      },
      {
        stepNumber: 2,
        type: 'rule',
        title: 'Block unlicensed geographies — US',
        ruleCode: "card_country = 'US'",
        ruleExplanation:
          'US-issued cards are blocked because online gambling is federally restricted under UIGEA. Accepting bets from US cardholders would violate BetFlow\'s licence conditions.',
        ruleAction: 'block',
      },
      {
        stepNumber: 3,
        type: 'rule',
        title: 'Block additional restricted markets',
        ruleCode: "card_country = 'CN' OR card_country = 'TR' OR card_country = 'KR'",
        ruleExplanation:
          'China, Turkey, and South Korea all prohibit online gambling. Cards issued in these countries must be blocked to maintain compliance.',
        ruleAction: 'block',
      },
      {
        stepNumber: 4,
        type: 'action',
        title: 'Confirm your geographic rules in Radar',
        instruction:
          'Open the Radar Rules page and confirm both geographic block rules are active and in the correct priority order.',
        dashboardLink: '/radar/rules',
        checkboxLabel: 'Geographic rules are active and in the correct order',
      },
      {
        stepNumber: 5,
        type: 'verify',
        title: 'Verify geographic compliance',
        checklist: [
          'US card block rule is Active',
          'CN/TR/KR block rule is Active',
          'I understand these rules block on card issuing country, not IP location',
        ],
      },
      {
        stepNumber: 6,
        type: 'fire',
        title: 'Geographic Compliance Simulation',
        fireTitle: 'Geographic Compliance Simulation',
        fireDescription:
          '25 charges from mixed card-issuing countries: US, CN, TR (restricted) and AU, GB (permitted).',
        expectedCharges: 25,
        warningText:
          'Your geographic rules should block the 15 charges from restricted countries while allowing the 10 AU/GB charges through.',
      },
    ],
    chargeConfig: [
      {
        count: 8,
        amountMinCents: 8000,
        amountMaxCents: 40000,
        testCard: 'pm_card_visa',
        metadata: { card_country: 'US', fraud_type: 'geo_compliance' },
      },
      {
        count: 4,
        amountMinCents: 5000,
        amountMaxCents: 20000,
        testCard: 'pm_card_visa',
        metadata: { card_country: 'CN', fraud_type: 'geo_compliance' },
      },
      {
        count: 3,
        amountMinCents: 5000,
        amountMaxCents: 15000,
        testCard: 'pm_card_visa',
        metadata: { card_country: 'TR', fraud_type: 'geo_compliance' },
      },
      {
        count: 5,
        amountMinCents: 3000,
        amountMaxCents: 10000,
        testCard: 'pm_card_visa',
        metadata: { card_country: 'AU', fraud_type: 'legitimate' },
      },
      {
        count: 5,
        amountMinCents: 3000,
        amountMaxCents: 10000,
        testCard: 'pm_card_visa',
        metadata: { card_country: 'GB', fraud_type: 'legitimate' },
      },
    ],
  },

  // MODULE 6 — Chargeback Fraud & Blocklists
  {
    number: 6,
    id: 'chargeback_fraud',
    title: 'Chargeback Fraud & Blocklists',
    tagline: 'They have done this before. Add them to the list.',
    difficulty: 'Advanced',
    expectedCharges: 20,
    maxExposureCents: 320000,
    steps: [
      {
        stepNumber: 1,
        type: 'read',
        title: 'Friendly fraud and repeat offenders',
        content:
          'A BetFlow customer deposits $500, loses it on bets, then files a chargeback claiming they "didn\'t recognise the charge." This is friendly fraud — and this particular customer has done it three times already. Their card fingerprint persists even when they get a new card number. You need to add them to a blocklist so they can never deposit again.',
      },
      {
        stepNumber: 2,
        type: 'action',
        title: 'Create a custom blocklist in Radar',
        instruction:
          'Navigate to Radar > Lists (Value Lists) and create a new list called "Confirmed Chargeback Fraudsters". Set the type to Card Fingerprint.',
        dashboardLink: '/radar/value_lists',
        checkboxLabel: 'I have created the blocklist',
      },
      {
        stepNumber: 3,
        type: 'action',
        title: "Add the bad actor's card fingerprint",
        instruction:
          'Add the fingerprint `frp_test_workshop_cbfraud_001` to your "Confirmed Chargeback Fraudsters" blocklist. This fingerprint belongs to the repeat chargeback offender.',
        dashboardLink: '/radar/value_lists',
        checkboxLabel: 'Fingerprint added to blocklist',
      },
      {
        stepNumber: 4,
        type: 'rule',
        title: 'Write the blocklist rule',
        ruleCode:
          "is_in('Confirmed Chargeback Fraudsters', card_fingerprint) = true",
        ruleExplanation:
          'This rule checks every incoming charge against your blocklist. If the card fingerprint matches any entry in "Confirmed Chargeback Fraudsters", the charge is automatically blocked.',
        ruleAction: 'block',
      },
      {
        stepNumber: 5,
        type: 'verify',
        title: 'Verify blocklist setup',
        checklist: [
          "Blocklist 'Confirmed Chargeback Fraudsters' exists in Radar Lists",
          'Fingerprint frp_test_workshop_cbfraud_001 is in the list',
          'Block rule using is_in() is Active',
          'I understand card fingerprint persists even when card number changes',
        ],
      },
      {
        stepNumber: 6,
        type: 'fire',
        title: 'Chargeback Fraud Simulation',
        fireTitle: 'Chargeback Fraud Simulation',
        fireDescription:
          '20 charges incoming: 12 from the blocklisted repeat offender and 8 from legitimate customers.',
        expectedCharges: 20,
        warningText:
          'Your blocklist rule should block the 12 charges with the known fingerprint while allowing the 8 legitimate charges through.',
      },
    ],
    chargeConfig: [
      {
        count: 12,
        amountMinCents: 15000,
        amountMaxCents: 80000,
        testCard: 'pm_card_visa',
        metadata: {
          card_fingerprint: 'frp_test_workshop_cbfraud_001',
          fraud_type: 'chargeback_repeat',
        },
      },
      {
        count: 8,
        amountMinCents: 5000,
        amountMaxCents: 20000,
        testCard: 'pm_card_visa',
        metadata: { fraud_type: 'legitimate', card_fingerprint: 'clean' },
      },
    ],
  },

  // MODULE 7 — Multi-Accounting & Bonus Abuse
  {
    number: 7,
    id: 'multi_accounting',
    title: 'Multi-Accounting & Bonus Abuse',
    tagline: 'One person. Eight accounts. Eight welcome bonuses.',
    difficulty: 'Advanced',
    expectedCharges: 30,
    maxExposureCents: 240000,
    steps: [
      {
        stepNumber: 1,
        type: 'read',
        title: 'The multi-accounting problem',
        content:
          'A single person has created 8 separate BetFlow accounts — each with a different email and name — but all using the same card. They have claimed the $50 welcome bonus 8 times, extracting $400 in free bets. The card fingerprint is the same across all accounts, which is the signal you need to catch this.',
      },
      {
        stepNumber: 2,
        type: 'action',
        title: 'Look at your customer list',
        instruction:
          'Open the Customers page in your Stripe Dashboard. Look for multiple customer records that share the same card.',
        dashboardLink: '/customers',
        checkboxLabel: 'I have reviewed the customers list',
      },
      {
        stepNumber: 3,
        type: 'rule',
        title: 'Flag multi-account card usage',
        ruleCode: 'total_charges_per_card_across_customers > 1',
        ruleExplanation:
          'This rule sends charges to review when a card has been used across more than one customer account. This catches the early stages of multi-accounting without blocking legitimate shared cards (e.g., family members).',
        ruleAction: 'review',
      },
      {
        stepNumber: 4,
        type: 'rule',
        title: 'Block high-confidence multi-accounting',
        ruleCode: 'total_charges_per_card_across_customers > 3',
        ruleExplanation:
          'When a card has been used across more than 3 different customer accounts, this is almost certainly bonus abuse. Block outright at this threshold.',
        ruleAction: 'block',
      },
      {
        stepNumber: 5,
        type: 'verify',
        title: 'Verify multi-accounting rules',
        checklist: [
          'Review rule (> 1 customer) is Active',
          'Block rule (> 3 customers) is Active',
          'I understand this catches multi-accounting without blocking legitimate shared cards',
        ],
      },
      {
        stepNumber: 6,
        type: 'fire',
        title: 'Bonus Abuse Simulation',
        fireTitle: 'Bonus Abuse Simulation',
        fireDescription:
          '30 charges from the same card across 8 fake customer accounts, all claiming welcome bonuses.',
        expectedCharges: 30,
        warningText:
          'Your multi-accounting rules should review the early charges and block once the card exceeds 3 customer accounts.',
      },
    ],
    chargeConfig: [
      {
        count: 30,
        amountMinCents: 5000,
        amountMaxCents: 20000,
        testCard: 'pm_card_visa',
        sameCard: true,
        metadata: { fraud_type: 'bonus_abuse' },
      },
    ],
  },

  // MODULE 8 — Boss Round: Full Assault
  {
    number: 8,
    id: 'boss_round',
    title: 'Boss Round: Full Assault',
    tagline: 'Everything. At once.',
    difficulty: 'Expert',
    expectedCharges: 50,
    maxExposureCents: 800000,
    bonusCents: 50000,
    bonusThreshold: 0.9,
    steps: [
      {
        stepNumber: 1,
        type: 'read',
        title: 'This is what a coordinated attack looks like',
        content:
          'An organised fraud ring is hitting BetFlow with everything simultaneously — card testing, velocity attacks, high-risk cards, anonymous IPs, cards from restricted countries, known chargeback offenders, and bonus abusers. This is the boss round. All your rules from Modules 1–7 need to work together. Some charges will get through — the goal is to minimise losses.',
      },
      {
        stepNumber: 2,
        type: 'action',
        title: 'Review your complete Radar ruleset',
        instruction:
          'Open the Radar Rules page and review every rule you have created across Modules 1–7. Ensure they are all Active and correctly configured.',
        dashboardLink: '/radar/rules',
        checkboxLabel: 'I have reviewed all my rules and they are all Active',
      },
      {
        stepNumber: 3,
        type: 'verify',
        title: 'Rule coverage check',
        checklist: [
          'Card testing rule active (amount < $2, new customer)',
          'Card velocity rule active (> 3 charges per card per day)',
          'High risk score block active (risk_score >= 75)',
          'Anonymous IP block active',
          'At least 2 geographic block rules active',
          'Chargeback blocklist rule active',
          'Multi-accounting block rule active',
        ],
      },
      {
        stepNumber: 4,
        type: 'action',
        title: 'Check your current balance before the final round',
        instruction:
          'Note your current balance. This is your last chance to review your setup before the final assault.',
        checkboxLabel: 'I have noted my pre-boss-round balance',
      },
      {
        stepNumber: 5,
        type: 'verify',
        title: 'Final readiness check',
        checklist: [
          'All rules are in Block or Review status (none are Draft)',
          'I have not removed any rules from earlier modules',
          'I accept that some charges will get through — the goal is to minimise losses',
          'I understand the 90% block rate bonus ($500 added to balance)',
        ],
      },
      {
        stepNumber: 6,
        type: 'fire',
        title: 'BOSS ROUND — Full Coordinated Assault',
        fireTitle: 'BOSS ROUND — Full Coordinated Assault',
        fireDescription:
          '50 charges of all fraud types hitting simultaneously. Card testing, velocity, high-risk scores, anonymous IPs, restricted geographies, chargeback offenders, and bonus abusers — all at once.',
        expectedCharges: 50,
        warningText:
          'This is the final test. If you block 90% or more of the fraudulent charges, you earn the $500 bonus. Good luck.',
      },
    ],
    chargeConfig: [
      {
        count: 7,
        amountMinCents: 50,
        amountMaxCents: 150,
        testCard: 'pm_card_visa',
        metadata: { fraud_type: 'card_testing' },
      },
      {
        count: 7,
        amountMinCents: 3000,
        amountMaxCents: 8000,
        testCard: 'pm_card_visa',
        sameCard: true,
        metadata: { fraud_type: 'velocity' },
      },
      {
        count: 7,
        amountMinCents: 10000,
        amountMaxCents: 50000,
        testCard: 'pm_card_chargeDeclinedFraudulent',
        metadata: { fraud_type: 'high_risk_score' },
      },
      {
        count: 6,
        amountMinCents: 5000,
        amountMaxCents: 30000,
        testCard: 'pm_card_visa',
        metadata: { fraud_type: 'anonymous_ip', is_anonymous_ip: 'true' },
      },
      {
        count: 6,
        amountMinCents: 5000,
        amountMaxCents: 40000,
        testCard: 'pm_card_visa',
        metadata: { fraud_type: 'geo_compliance', card_country: 'US' },
      },
      {
        count: 6,
        amountMinCents: 15000,
        amountMaxCents: 80000,
        testCard: 'pm_card_visa',
        metadata: {
          fraud_type: 'chargeback_repeat',
          card_fingerprint: 'frp_test_workshop_cbfraud_001',
        },
      },
      {
        count: 6,
        amountMinCents: 5000,
        amountMaxCents: 20000,
        testCard: 'pm_card_visa',
        sameCard: true,
        metadata: { fraud_type: 'bonus_abuse' },
      },
      {
        count: 5,
        amountMinCents: 3000,
        amountMaxCents: 15000,
        testCard: 'pm_card_visa',
        metadata: { fraud_type: 'legitimate', risk_level: 'low' },
      },
    ],
  },
]
