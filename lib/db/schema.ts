import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
} from 'drizzle-orm/pg-core'

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- App tables ------------------------------------------------------------
// Workshop platform tables. All SA-owned data is scoped by `saUserId`.

// A workshop event created and owned by a Solutions Architect (SA).
// Participants join via the 6-character access code.
export const events = pgTable('events', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  accessCode: text('access_code').notNull().unique(),
  saUserId: text('saUserId').notNull(),
  status: text('status').notNull().default('active'), // active | ended
  // Workshop = guided learning (no scoring). Challenge = gamified competition.
  eventType: text('eventType').notNull().default('challenge'), // workshop | challenge
  // Topic theme. Determines module content + participant experience.
  // fraud_radar | online_payments | disputes | connect | billing | radar_for_fraud_teams
  eventTheme: text('eventTheme').notNull().default('fraud_radar'),
  maxParticipants: integer('maxParticipants').notNull().default(25),
  durationMinutes: integer('durationMinutes').notNull().default(120),
  /** When the live session automatically closes (may be extended by the SA). */
  sessionEndsAt: timestamp('sessionEndsAt'),
  /** Set when the session ends (timer, SA action, or auto-close). */
  endedAt: timestamp('endedAt'),
  // Customer / facilitator metadata.
  customerName: text('customerName'),
  customerEmail: text('customerEmail'),
  facilitatorNotes: text('facilitatorNotes'),
  // Challenge-only config.
  balanceCurrency: text('balanceCurrency').notNull().default('AUD'),
  startingBalanceCents: integer('startingBalanceCents').notNull().default(100000),
  scoreIntervalSeconds: integer('scoreIntervalSeconds').notNull().default(20),
  leaderboardEnabled: boolean('leaderboardEnabled').notNull().default(true),
  projectorEnabled: boolean('projectorEnabled').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// A participant who joined an event. No auth account — identified by row id
// stored client-side after joining with the access code.
export const participants = pgTable('participants', {
  id: text('id').primaryKey(),
  eventId: text('eventId').notNull(),
  name: text('name').notNull(),
  email: text('email'),
  company: text('company'),
  score: integer('score').notNull().default(0),
  currentModule: integer('currentModule').notNull().default(0),
  joinedAt: timestamp('joinedAt').notNull().defaultNow(),
  lastActiveAt: timestamp('lastActiveAt').notNull().defaultNow(),
})

// Per-participant progress for each workshop module.
export const moduleProgress = pgTable('module_progress', {
  id: text('id').primaryKey(),
  participantId: text('participantId').notNull(),
  eventId: text('eventId').notNull(),
  moduleId: text('moduleId').notNull(),
  status: text('status').notNull().default('not_started'), // not_started | in_progress | completed
  score: integer('score').notNull().default(0),
  completedAt: timestamp('completedAt'),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// Per-participant progress for the document-style Workshop experience.
// `completedSteps` is a JSON array of step indices completed for the module.
export const workshopProgress = pgTable('workshop_progress', {
  id: text('id').primaryKey(),
  participantId: text('participantId').notNull(),
  eventId: text('eventId').notNull(),
  moduleId: text('moduleId').notNull(),
  completedSteps: text('completedSteps').notNull().default('[]'),
  moduleDone: boolean('moduleDone').notNull().default(false),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

// Stripe Connect accounts provisioned in advance, one per participant slot.
// The instructor can open each account's Stripe dashboard to demo as admin.
export const connectedAccounts = pgTable('connected_accounts', {
  id: text('id').primaryKey(),
  eventId: text('eventId').notNull(),
  stripeAccountId: text('stripeAccountId').notNull(),
  businessName: text('businessName').notNull(),
  slotNumber: integer('slotNumber').notNull(),
  participantId: text('participantId'), // claimed by a participant, or null
  status: text('status').notNull().default('active'), // active | failed
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

// Attack waves fired by the SA during a live event to challenge participants.
export const attackWaves = pgTable('attack_waves', {
  id: text('id').primaryKey(),
  eventId: text('eventId').notNull(),
  waveType: text('waveType').notNull(), // card_testing | account_takeover | chargeback | bot_attack
  intensity: integer('intensity').notNull().default(1),
  label: text('label').notNull(),
  firedAt: timestamp('firedAt').notNull().defaultNow(),
  firedBy: text('firedBy').notNull(),
  active: boolean('active').notNull().default(true),
})
