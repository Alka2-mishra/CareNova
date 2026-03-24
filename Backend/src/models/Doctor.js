const mongoose = require('mongoose')

const doctorSchema = new mongoose.Schema({
  clerkId:     { type: String, required: true, unique: true },
  firstName:   { type: String, required: true },
  lastName:    { type: String, required: true },
  email:       { type: String, required: true, unique: true },
  title:       { type: String, default: '' },       // Dr., Prof., etc.
  designation: { type: String, default: '' },       // Senior Consultant, etc.
  specialty:   { type: String, default: '' },
  experience:  { type: Number, default: 0 },        // years
  location:    { type: String, default: '' },
  phone:       { type: String, default: '' },
  bio:         { type: String, default: '' },
  profileImage:{ type: String, default: '' },       // base64 or URL
  availability: [{
    day:         { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] },
    startTime:   { type: String },
    endTime:     { type: String },
    isAvailable: { type: Boolean, default: true },
  }],
}, { timestamps: true })

module.exports = mongoose.model('Doctor', doctorSchema)
