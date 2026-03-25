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

router.get('/search', async (req, res) => {
  try {
    const { q, specialty } = req.query
    const filter = {}
    if (q) filter.$or = [
      { firstName: { $regex: q, $options: 'i' } },
      { lastName:  { $regex: q, $options: 'i' } },
      { specialty: { $regex: q, $options: 'i' } },
      { location:  { $regex: q, $options: 'i' } },
    ]
    if (specialty && specialty !== 'All') filter.specialty = { $regex: specialty, $options: 'i' }
    const doctors = await Doctor.find(filter, '-__v').limit(30)
    res.json(doctors)
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
