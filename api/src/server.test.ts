import supertest from "supertest"

test("server is running", async () => {
    const request = supertest('http://localhost:4030');
    await request.get("/").expect(200)
})