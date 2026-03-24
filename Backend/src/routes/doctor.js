const express = require('express')
const router = express.Router()
const { requireAuth } = require('../middleware/auth')
const { syncDoctor, getProfile, updateProfile, updateAvailability, getDashboardStats } = require('../controllers/doctorController')
const Doctor = require('../models/Doctor')
const Appointment = require('../models/Appointment')

// Debug route - no auth, confirms DB is working
router.get('/debug', async (req, res) => {
  try {
    const doctors = await Doctor.find({}, 'clerkId firstName lastName specialty')
    const apptCount = await Appointment.countDocuments()
    res.json({ doctors, appointmentCount: apptCount })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/sync',        syncDoctor)
router.get('/profile',      requireAuth, getProfile)
router.put('/profile',      requireAuth, updateProfile)
router.put('/availability', requireAuth, updateAvailability)
router.get('/dashboard',    requireAuth, getDashboardStats)

module.exports = router
