const { Schema, model } = require('mongoose');

const driveSchema = new Schema({
  vaccineName: { type: String, required: true },
  date: { type: Date, required: true },
  dosesAvailable: { type: Number, required: true },
  applicableClasses: [String],
  status: { type: String, enum: ['scheduled','completed'], default: 'scheduled' }
});

module.exports = model('VaccinationDrive', driveSchema);
