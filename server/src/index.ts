import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import { authRouter } from './routes/auth'
import { vehiclesRouter } from './routes/vehicles'
import { driverRouter } from './routes/driverRoutes'
import vehicleReviewsRouter from './routes/vehicleReviewRoutes'
import incidentRouter from './routes/incidentRoutes'
import serviceRouter from './routes/serviceRoutes'
import { errorHandler } from './middleware/errorHandler'

// Load environment variables
dotenv.config()

// Create Express server
const app = express()
const port = process.env.PORT || 3000

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
console.log('CORS configured with origin:', corsOptions.origin)

// Apply middleware
app.use(helmet()) // Security headers
app.use(cors(corsOptions)) // CORS configuration with options
app.use(morgan('dev')) // Request logging
app.use(express.json()) // Parse JSON request bodies

// API routes
app.use('/api/auth', authRouter)
app.use('/api/vehicles', vehiclesRouter)
app.use('/api/drivers', driverRouter)
app.use('/api/vehicle-reviews', vehicleReviewsRouter)
app.use('/api/incidents', incidentRouter)
app.use('/api/services', serviceRouter)

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
