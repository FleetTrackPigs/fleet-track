import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { authRouter } from './routes/auth'
import { vehiclesRouter } from './routes/vehicles'
import { driverRouter } from './routes/driverRoutes'
import { vehicleReviewsRouter } from './routes/vehicleReviewRoutes'
import { errorHandler } from './middleware/errorHandler'

// Load environment variables
dotenv.config()

// Create Express server
const app = express()
const port = process.env.PORT || 3000

// Apply middleware
app.use(helmet()) // Security headers
app.use(cors()) // CORS configuration
app.use(morgan('dev')) // Request logging
app.use(express.json()) // Parse JSON request bodies

// API routes
app.use('/api/auth', authRouter)
app.use('/api/vehicles', vehiclesRouter)
app.use('/api/drivers', driverRouter)
app.use('/api/vehicle-reviews', vehicleReviewsRouter)

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

// Error handling middleware
app.use(errorHandler)

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

export default app
