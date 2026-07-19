// Resolves theme-specific content for workshop and challenge modes.
// Each theme has its own content files; this module provides a single
// lookup point so components don't need to know the file layout.

import type { WorkshopModule } from '@/lib/workshop-modules'
import type { ChallengeModule } from '@/lib/challenge-modules'

type WorkshopContent = {
  workshopModules: WorkshopModule[]
  scoredModules: WorkshopModule[]
}

type ChallengeContent = {
  challengeModules: ChallengeModule[]
  startingBalanceCents: number
}

type QuizModule = {
  id: string
  order: number
  title: string
  tagline: string
  briefing: string[]
  objectives: string[]
  points: number
  questions: {
    id: string
    prompt: string
    options: { id: string; text: string }[]
    correctOptionId: string
    explanation: string
  }[]
}

type QuizContent = {
  modules: QuizModule[]
  totalScore: number
}

export function getWorkshopContent(themeId: string): WorkshopContent | null {
  switch (themeId) {
    case 'fraud_radar': {
      const { WORKSHOP_MODULES, SCORED_MODULES } = require('@/lib/workshop-modules')
      return { workshopModules: WORKSHOP_MODULES, scoredModules: SCORED_MODULES }
    }
    case 'online_payments': {
      const {
        ONLINE_PAYMENTS_WORKSHOP_MODULES,
        ONLINE_PAYMENTS_SCORED_MODULES,
      } = require('@/lib/themes/online-payments/workshop-modules')
      return {
        workshopModules: ONLINE_PAYMENTS_WORKSHOP_MODULES,
        scoredModules: ONLINE_PAYMENTS_SCORED_MODULES,
      }
    }
    case 'billing': {
      const {
        BILLING_WORKSHOP_MODULES,
        BILLING_SCORED_MODULES,
      } = require('@/lib/themes/billing/workshop-modules')
      return {
        workshopModules: BILLING_WORKSHOP_MODULES,
        scoredModules: BILLING_SCORED_MODULES,
      }
    }
    case 'connect': {
      const {
        CONNECT_WORKSHOP_MODULES,
        CONNECT_SCORED_MODULES,
      } = require('@/lib/themes/connect/workshop-modules')
      return {
        workshopModules: CONNECT_WORKSHOP_MODULES,
        scoredModules: CONNECT_SCORED_MODULES,
      }
    }
    default:
      return null
  }
}

export function getChallengeContent(themeId: string): ChallengeContent | null {
  switch (themeId) {
    case 'fraud_radar': {
      const { CHALLENGE_MODULES, STARTING_BALANCE_CENTS } = require('@/lib/challenge-modules')
      return { challengeModules: CHALLENGE_MODULES, startingBalanceCents: STARTING_BALANCE_CENTS }
    }
    case 'online_payments': {
      const {
        ONLINE_PAYMENTS_CHALLENGE_MODULES,
        ONLINE_PAYMENTS_STARTING_BALANCE_CENTS,
      } = require('@/lib/themes/online-payments/challenge-modules')
      return {
        challengeModules: ONLINE_PAYMENTS_CHALLENGE_MODULES,
        startingBalanceCents: ONLINE_PAYMENTS_STARTING_BALANCE_CENTS,
      }
    }
    case 'billing': {
      const {
        BILLING_CHALLENGE_MODULES,
        BILLING_STARTING_BALANCE_CENTS,
      } = require('@/lib/themes/billing/challenge-modules')
      return {
        challengeModules: BILLING_CHALLENGE_MODULES,
        startingBalanceCents: BILLING_STARTING_BALANCE_CENTS,
      }
    }
    case 'connect': {
      const {
        CONNECT_CHALLENGE_MODULES,
        CONNECT_STARTING_BALANCE_CENTS,
      } = require('@/lib/themes/connect/challenge-modules')
      return {
        challengeModules: CONNECT_CHALLENGE_MODULES,
        startingBalanceCents: CONNECT_STARTING_BALANCE_CENTS,
      }
    }
    default:
      return null
  }
}

export function getQuizContent(themeId: string): QuizContent | null {
  switch (themeId) {
    case 'fraud_radar': {
      const { MODULES, TOTAL_POSSIBLE_SCORE } = require('@/lib/workshop-content')
      return { modules: MODULES, totalScore: TOTAL_POSSIBLE_SCORE }
    }
    case 'online_payments': {
      const {
        ONLINE_PAYMENTS_MODULES,
        ONLINE_PAYMENTS_TOTAL_SCORE,
      } = require('@/lib/themes/online-payments/workshop-content')
      return {
        modules: ONLINE_PAYMENTS_MODULES,
        totalScore: ONLINE_PAYMENTS_TOTAL_SCORE,
      }
    }
    case 'billing': {
      const {
        BILLING_MODULES,
        BILLING_TOTAL_SCORE,
      } = require('@/lib/themes/billing/workshop-content')
      return {
        modules: BILLING_MODULES,
        totalScore: BILLING_TOTAL_SCORE,
      }
    }
    case 'connect': {
      const {
        CONNECT_MODULES,
        CONNECT_TOTAL_SCORE,
      } = require('@/lib/themes/connect/workshop-content')
      return {
        modules: CONNECT_MODULES,
        totalScore: CONNECT_TOTAL_SCORE,
      }
    }
    default:
      return null
  }
}
