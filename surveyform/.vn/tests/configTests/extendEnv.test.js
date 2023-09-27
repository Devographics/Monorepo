describe('Can access to env variables', () => {
    test('access to .env.test', () => {
        expect(process.env.NEXT_PUBLIC_GRAPHQL_URI).toBeDefined()
    })
})