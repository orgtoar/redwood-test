/* eslint-disable no-undef, camelcase */
/// <reference types="cypress" />
import 'cypress-wait-until'

import path from 'path'

import { waitForApiSide } from '../01-tutorial/sharedTests'

import { setupLogger } from './codemods/Step1_1_Setup_Logger'
import Step1_2_Add_Logger from './codemods/Step1_2_Add_Logger_to_Posts'
import { setupPrismaLogger } from './codemods/Step2_1_Setup_Prisma_Logger'

const BASE_DIR = Cypress.env('RW_PATH')
const LOG_FILENAME = 'e2e.log'

describe('The Redwood Logger - Basic Scaffold CRUD Logging', () => {
  const LOG_PATH = path.join(BASE_DIR, LOG_FILENAME)

  it('1. Test Logging for CRUD', () => {
    // Empty log file.
    cy.writeFile(LOG_PATH, '')
    cy.task('log', 'wrote empty log path')

    cy.writeFile(
      path.join(BASE_DIR, 'api/src/lib/logger.js'),
      setupLogger(BASE_DIR, LOG_FILENAME)
    )
    cy.task('log', 'wrote logger.js')

    cy.writeFile(
      path.join(BASE_DIR, 'api/src/services/posts/posts.js'),
      Step1_2_Add_Logger
    )
    cy.task('log', 'wrote posts.js')

    cy.task('log', 'done waiting for api side')

    cy.visit('http://localhost:8910/blog-post/3')

    cy.visit('http://localhost:8910/posts')

    cy.contains('Edit')
    cy.contains('Loading...').should('not.exist')
    cy.task('log', "loading doesn't exist")

    cy.task('log', '1 --- Waiting...')
    cy.readFile(LOG_PATH).should('include', '> in posts()')

    // CREATE / SAVE
    cy.contains(' New Post').click()
    cy.get('input#title').type('First post')
    cy.get('input#body').type('Hello world!')
    cy.get('button').contains('Save').click()

    cy.task('log', '2 --- Waiting...')
    cy.readFile(LOG_PATH).should('include', '> in createPost()')

    // EDIT
    cy.contains('Edit').click()
    cy.get('input#body').clear().type('No, Margle the World!')
    cy.get('button').contains('Save').click()

    cy.task('log', '3 --- Waiting...')
    cy.readFile(LOG_PATH).should('include', '> in updatePost()')

    // DELETE
    cy.contains('Delete').click()

    cy.task('log', '4 --- Waiting...')
    cy.readFile(LOG_PATH).should('include', '> in deletePost()')
  })

  it('2. Test logging for Prisma', () => {
    // Without slow query logging.
    // Reset log file.
    cy.writeFile(LOG_PATH, '')

    cy.writeFile(
      path.join(BASE_DIR, 'api/src/lib/db.js'),
      setupPrismaLogger({ slowQueryThreshold: 9_999 })
    )

    cy.visit('http://localhost:8910/posts')

    cy.contains('Edit')
    cy.contains('Loading...').should('not.exist')

    cy.task('log', '1 --- Waiting...')
    cy.readFile(LOG_PATH).should('include', 'Query performed in ')
    cy.readFile(LOG_PATH).should('not.include', 'Slow Query performed in ')

    // With slow query logging.
    // Reset log file.
    cy.writeFile(LOG_PATH, '')

    cy.writeFile(
      path.join(BASE_DIR, 'api/src/lib/db.js'),
      setupPrismaLogger({ slowQueryThreshold: 0 })
    )

    waitForApiSide()

    cy.visit('http://localhost:8910/posts')

    cy.contains('Edit')
    cy.contains('Loading...').should('not.exist')

    cy.task('log', '2 --- Waiting...')
    cy.readFile(LOG_PATH).should('include', 'Slow Query performed in ')
  })
})
