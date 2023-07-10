describe('Default test (collocated with code)', () => {
    test.skip('Default test is run in a JSDOM environment', () => {
        // See jest.config.js for client code
        expect(window).toBeDefined()
    })
})