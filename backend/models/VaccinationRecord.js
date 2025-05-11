const { Schema, model } = require('mongoose');

const recordSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  drive: { type: Schema.Types.ObjectId, ref: 'Drive', required: true },
  vaccinatedAt: { type: Date, default: Date.now }
});

module.exports = model('VaccinationRecord', recordSchema);
