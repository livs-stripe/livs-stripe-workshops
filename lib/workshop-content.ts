// Static definitions for the Stripe fraud-defense workshop curriculum.
// Modules are worked through by participants; each has a short briefing and a
// graded challenge. Attack waves are fired by the SA during a live event.

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

export const MODULES: WorkshopModule[] = [
  {
    id: 'radar-fundamentals',
    order: 1,
    title: 'Radar Fundamentals',
    tagline: 'How Stripe scores risk on every payment',
    briefing: [
      'Stripe Radar evaluates every payment in real time using machine learning trained across millions of businesses on the Stripe network.',
      'Each charge receives a risk score from 0 to 100. Higher scores mean a higher likelihood of fraud. Radar then takes an action: allow, review, or block.',
      'Your job as a defender is to understand how these signals combine so you can tune the system without blocking legitimate customers.',
    ],
    objectives: [
      'Explain what a Radar risk score represents',
      'Identify the three outcomes Radar can assign to a payment',
      'Recognize which signals feed the model',
    ],
    points: 100,
    questions: [
      {
        id: 'q1',
        prompt: 'What does a Radar risk score of 85 indicate?',
        options: [
          { id: 'a', text: 'The payment is 85% complete' },
          { id: 'b', text: 'A high likelihood that the payment is fraudulent' },
          { id: 'c', text: 'The customer has 85 prior purchases' },
          { id: 'd', text: 'The charge will settle in 85 hours' },
        ],
        correctOptionId: 'b',
        explanation:
          'Risk scores range 0–100; higher values signal a greater likelihood of fraud.',
      },
      {
        id: 'q2',
        prompt: 'Which is NOT one of Radar\u2019s possible outcomes for a payment?',
        options: [
          { id: 'a', text: 'Allow' },
          { id: 'b', text: 'Place in review' },
          { id: 'c', text: 'Block' },
          { id: 'd', text: 'Refund automatically' },
        ],
        correctOptionId: 'd',
        explanation:
          'Radar can allow, review, or block. Refunding is a separate, manual or rule-driven action.',
      },
      {
        id: 'q3',
        prompt: 'Why is Stripe\u2019s network data valuable for fraud detection?',
        options: [
          { id: 'a', text: 'It lets merchants see each other\u2019s customers' },
          {
            id: 'b',
            text: 'Patterns seen across millions of businesses help spot fraud no single merchant could',
          },
          { id: 'c', text: 'It reduces processing fees' },
          { id: 'd', text: 'It guarantees zero chargebacks' },
        ],
        correctOptionId: 'b',
        explanation:
          'A card flagged as fraudulent elsewhere on the network can be caught before it ever hits your business.',
      },
    ],
  },
  {
    id: 'rules-and-scores',
    order: 2,
    title: 'Rules & Risk Thresholds',
    tagline: 'Writing custom rules that fit your business',
    briefing: [
      'Radar lets you layer custom rules on top of the ML model. Rules use attributes like amount, country, card type, and risk score.',
      'A good rule set blocks clear fraud, reviews the gray area, and gets out of the way for trusted customers. Overly aggressive rules cause false positives and lost revenue.',
      'Rules are evaluated in order: block rules first, then review rules, then allow rules.',
    ],
    objectives: [
      'Write a rule using risk score thresholds',
      'Balance blocking fraud against false positives',
      'Understand rule evaluation order',
    ],
    points: 120,
    questions: [
      {
        id: 'q1',
        prompt:
          'A rule blocks every payment with risk score above 50. What is the most likely side effect?',
        options: [
          { id: 'a', text: 'All fraud stops with no downside' },
          {
            id: 'b',
            text: 'A spike in false positives, blocking legitimate customers',
          },
          { id: 'c', text: 'Lower Stripe fees' },
          { id: 'd', text: 'Faster settlement times' },
        ],
        correctOptionId: 'b',
        explanation:
          'A threshold of 50 is aggressive — many legitimate payments score above it, so you would block real revenue.',
      },
      {
        id: 'q2',
        prompt: 'Which rule belongs in the "review" category rather than "block"?',
        options: [
          { id: 'a', text: 'Card previously confirmed as stolen' },
          { id: 'b', text: 'High-value order from a new customer in a new country' },
          { id: 'c', text: 'Risk score of 99 with mismatched CVC' },
          { id: 'd', text: 'Ten failed card attempts in one minute' },
        ],
        correctOptionId: 'b',
        explanation:
          'It is suspicious but not certainly fraud — a human review balances risk and customer experience.',
      },
      {
        id: 'q3',
        prompt: 'In what order does Radar evaluate rules?',
        options: [
          { id: 'a', text: 'Allow, then review, then block' },
          { id: 'b', text: 'Block, then review, then allow' },
          { id: 'c', text: 'Random order each time' },
          { id: 'd', text: 'Alphabetical by rule name' },
        ],
        correctOptionId: 'b',
        explanation:
          'Block rules take precedence, then review, then allow — the safest outcome wins.',
      },
    ],
  },
  {
    id: 'authentication-3ds',
    order: 3,
    title: '3D Secure & SCA',
    tagline: 'Shifting liability with strong authentication',
    briefing: [
      '3D Secure (3DS) adds an authentication step where the cardholder verifies the purchase with their bank, often via a one-time code.',
      'When 3DS succeeds, liability for fraudulent chargebacks usually shifts from the merchant to the card issuer. This is a powerful defense for high-risk payments.',
      'Strong Customer Authentication (SCA) regulations in Europe require 3DS for many transactions. Radar can trigger 3DS dynamically only when risk is elevated.',
    ],
    objectives: [
      'Describe how 3D Secure authenticates a cardholder',
      'Explain liability shift',
      'Know when to request 3DS dynamically',
    ],
    points: 120,
    questions: [
      {
        id: 'q1',
        prompt: 'What is the main fraud benefit of a successful 3D Secure authentication?',
        options: [
          { id: 'a', text: 'It lowers the transaction amount' },
          {
            id: 'b',
            text: 'Liability for fraudulent chargebacks typically shifts to the issuing bank',
          },
          { id: 'c', text: 'It removes the need for a CVC' },
          { id: 'd', text: 'It guarantees instant settlement' },
        ],
        correctOptionId: 'b',
        explanation:
          'A successful 3DS check generally moves chargeback liability away from the merchant.',
      },
      {
        id: 'q2',
        prompt: 'What is a smart way to use 3D Secure without hurting conversion?',
        options: [
          { id: 'a', text: 'Require it on every single payment' },
          { id: 'b', text: 'Never use it' },
          {
            id: 'c',
            text: 'Trigger it dynamically only when Radar flags elevated risk',
          },
          { id: 'd', text: 'Only use it for refunds' },
        ],
        correctOptionId: 'c',
        explanation:
          'Dynamic 3DS applies friction only where it is warranted, protecting both revenue and security.',
      },
    ],
  },
  {
    id: 'manual-review',
    order: 4,
    title: 'Reviewing Suspicious Payments',
    tagline: 'Making the call on gray-area charges',
    briefing: [
      'Payments placed in review need a human decision. Reviewers weigh signals: IP geolocation vs billing address, email age, order contents, and velocity.',
      'Good reviewers look for corroborating evidence rather than a single red flag. Context matters — a large order is not fraud by itself.',
      'Every decision you make trains your intuition and feeds back into better rules.',
    ],
    objectives: [
      'Weigh multiple signals to reach a decision',
      'Avoid over-indexing on a single flag',
      'Decide when to approve, refund, or block',
    ],
    points: 140,
    questions: [
      {
        id: 'q1',
        prompt:
          'A $40 order matches billing and shipping, uses an established email, but ships to a different state. Best action?',
        options: [
          { id: 'a', text: 'Block immediately — different state is fraud' },
          {
            id: 'b',
            text: 'Approve — a gift or travel easily explains a different shipping state',
          },
          { id: 'c', text: 'Refund without contacting the customer' },
          { id: 'd', text: 'Report the customer to their bank' },
        ],
        correctOptionId: 'b',
        explanation:
          'A single benign signal (different shipping state) with otherwise strong indicators does not justify blocking.',
      },
      {
        id: 'q2',
        prompt: 'Which combination is the strongest indicator of likely fraud?',
        options: [
          { id: 'a', text: 'Returning customer buying their usual item' },
          {
            id: 'b',
            text: 'Brand-new email, mismatched IP country, high-value order, and rushed shipping',
          },
          { id: 'c', text: 'A large but in-state corporate order with a PO' },
          { id: 'd', text: 'Customer used a saved card from last month' },
        ],
        correctOptionId: 'b',
        explanation:
          'Multiple correlated high-risk signals together are far more telling than any one alone.',
      },
    ],
  },
  {
    id: 'attack-response',
    order: 5,
    title: 'Defending Attack Waves',
    tagline: 'Responding when fraud spikes in real time',
    briefing: [
      'Fraud rarely arrives evenly. Attackers probe in bursts — card testing, account takeover attempts, bot-driven checkout floods.',
      'When your instructor fires an attack wave, you need to identify the attack type and choose the right countermeasure quickly. The faster and more accurate your response, the more points you score.',
      'Rate limiting, dynamic 3DS, blocklists, and review queues are all tools in your kit. The right tool depends on the attack.',
    ],
    objectives: [
      'Identify common live attack patterns',
      'Match each attack to an effective countermeasure',
      'Respond under time pressure',
    ],
    points: 160,
    questions: [
      {
        id: 'q1',
        prompt:
          'You see thousands of tiny $1 authorizations across many cards in minutes. What attack is this?',
        options: [
          { id: 'a', text: 'Chargeback fraud' },
          { id: 'b', text: 'Card testing' },
          { id: 'c', text: 'Friendly fraud' },
          { id: 'd', text: 'Refund abuse' },
        ],
        correctOptionId: 'b',
        explanation:
          'Card testing uses small charges to validate stolen card numbers before larger fraud.',
      },
      {
        id: 'q2',
        prompt: 'Best first countermeasure against a card-testing wave?',
        options: [
          { id: 'a', text: 'Lower your prices' },
          {
            id: 'b',
            text: 'Rate limit attempts and add Radar rules to block rapid-fire low-value tries',
          },
          { id: 'c', text: 'Disable your store for a week' },
          { id: 'd', text: 'Refund every charge manually' },
        ],
        correctOptionId: 'b',
        explanation:
          'Velocity-based rate limiting plus targeted rules chokes off card testing without harming real customers.',
      },
      {
        id: 'q3',
        prompt:
          'During an account-takeover wave, logins succeed but shipping addresses suddenly change. Strong response?',
        options: [
          { id: 'a', text: 'Ignore it — logins are valid' },
          {
            id: 'b',
            text: 'Require step-up authentication (3DS / re-verification) on changed shipping details',
          },
          { id: 'c', text: 'Email all customers a coupon' },
          { id: 'd', text: 'Increase order limits' },
        ],
        correctOptionId: 'b',
        explanation:
          'Step-up auth on sensitive changes stops attackers who have valid credentials but not the cardholder\u2019s device.',
      },
    ],
  },
]

export const TOTAL_POSSIBLE_SCORE = MODULES.reduce((sum, m) => sum + m.points, 0)

export function getModule(moduleId: string): WorkshopModule | undefined {
  return MODULES.find((m) => m.id === moduleId)
}

// --- Attack waves ----------------------------------------------------------

export type AttackWaveType = {
  id: string
  label: string
  description: string
  defense: string
}

export const ATTACK_WAVE_TYPES: AttackWaveType[] = [
  {
    id: 'card_testing',
    label: 'Card Testing',
    description: 'A flood of tiny authorizations validating stolen card numbers.',
    defense: 'Rate limit attempts; block rapid low-value tries.',
  },
  {
    id: 'account_takeover',
    label: 'Account Takeover',
    description: 'Valid logins followed by suspicious shipping or detail changes.',
    defense: 'Require step-up authentication on sensitive changes.',
  },
  {
    id: 'chargeback',
    label: 'Chargeback Surge',
    description: 'A spike in disputes on previously completed orders.',
    defense: 'Gather evidence; enable 3DS to shift liability.',
  },
  {
    id: 'bot_attack',
    label: 'Bot Checkout Flood',
    description: 'Automated agents hammering checkout at high volume.',
    defense: 'Deploy bot detection and velocity limits.',
  },
]

export function getAttackWaveType(id: string): AttackWaveType | undefined {
  return ATTACK_WAVE_TYPES.find((t) => t.id === id)
}
