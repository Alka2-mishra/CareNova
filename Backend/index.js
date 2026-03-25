require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')

const doctorRoutes       = require('./src/routes/doctor')
const appointmentRoutes  = require('./src/routes/appointment')
const consultationRoutes = require('./src/routes/consultation')
const patientRoutes      = require('./src/routes/patient')
const cartRoutes         = require('./src/routes/cart')

const app = express()

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())

app.use('/api/doctors',       doctorRoutes)
app.use('/api/appointments',  appointmentRoutes)
app.use('/api/consultations', consultationRoutes)
app.use('/api/patients',      patientRoutes)
app.use('/api/cart',          cartRoutes)

app.get('/health', (_, res) => res.json({ status: 'ok' }))

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log(`MongoDB connected → ${mongoose.connection.name}`)
    app.listen(process.env.PORT, () => console.log(`Server running on port ${process.env.PORT}`))
  })
  .catch(err => { console.error('MongoDB connection error:', err.message); process.exit(1) })

mongoose.connection.on('disconnected', () => console.warn('MongoDB disconnected'))
mongoose.connection.on('reconnected',  () => console.log('MongoDB reconnected'))
