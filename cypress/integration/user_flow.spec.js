// cypress/integration/user_flow.spec.js

describe('Full User Flow', () => {
    it('should allow a user to sign up, add a lead, and check the email event', () => {
      // Visit sign up page
      cy.visit('/signup');
      cy.get('input[name="email"]').type('test@example.com');
      cy.get('input[name="password"]').type('password123');
      cy.get('button[type="submit"]').click();
  
      // Add lead
      cy.visit('/dashboard');
      cy.get('input[name="leadName"]').type('Test Lead');
      cy.get('input[name="email"]').type('lead@example.com');
      cy.get('input[name="followUpDate"]').type('2025-05-06T10:00:00Z');
      cy.get('button').contains('Add Lead').click();
  
      // Check email event
      cy.visit('/emails');
      cy.contains('Lead Added');
    });
  });
  