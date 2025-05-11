const mongoose = require('mongoose');

const driveSchema = new mongoose.Schema({
  vaccineName:     { type: String, required: true },
  date:            { type: Date,   required: true },
  dosesAvailable:  { type: Number, required: true },
  applicableClasses: [String],
  status:          { type: String, enum: ['scheduled','completed','expired'], default: 'scheduled' },
}, { timestamps: true });

module.exports = mongoose.model('Drive', driveSchema);
