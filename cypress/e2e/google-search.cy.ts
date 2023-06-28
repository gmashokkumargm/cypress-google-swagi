describe('Google Search', () => {
    it('should search in google and open the tesla cars link', () => {
        cy.visit('https://www.google.com');
        cy.get('button').contains('Alle akzeptieren').click();
        cy.get('[type="search"]').type('Electric cars{enter}');
        cy.contains('www.tesla.com').click();
        cy.origin('https://www.tesla.com/', () => {
            cy.url().should('eq', 'https://www.tesla.com/');
        });
    });
});

