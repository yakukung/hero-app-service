import express from 'express'
import './src/utils/dotenv.utils.js'
import './src/configs/sequelize.configs.js'
import { router as authRouter } from './src/routes/auth.routes.js'

const app = express()
const PORT = process.env.PORT

app.get('/', (_req, res) => {
  res.json({ message: 'Hero app API running' })
})

app.use(express.json())
app.use('/auth', authRouter)

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})