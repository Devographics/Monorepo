import express, { json } from "express"
import { getConfig } from "./config"
import { flyGenerator } from "./fly-generator"
import { localGenerator } from "./local-generator"
import { s3Generator } from "./s3-generator"

const app = express()
const { port } = getConfig()

app.use(json())


app.use("/local", localGenerator)
app.use("/fly", flyGenerator)
app.use("/cloud", s3Generator)

app.listen(port, () => {
    console.log(`Open Graph chart app listening on port ${port}`)
})