// backend/controllers/vaccinationController.js
const VaccinationRecord = require('../models/VaccinationRecord');
const Drive             = require('../models/Drive');

// POST /api/drives/:id/vaccinate
exports.vaccinate = async (req, res) => {
  const { studentId } = req.body;
  const driveId       = req.params.id;

  // 1) Load the drive
  const drive = await Drive.findById(driveId);
  if (!drive) {
    return res.status(404).json({ message: 'Drive not found' });
  }

  // 2) Ensure student hasn't already received this vaccine
  const existing = await VaccinationRecord
    .find({ student: studentId })
    .populate('drive', 'vaccineName');
  if (existing.some(r => r.drive.vaccineName === drive.vaccineName)) {
    return res.status(400).json({
      message: `Student already vaccinated with ${drive.vaccineName}`
    });
  }

  // 3) Ensure doses are available
  if (drive.dosesAvailable <= 0) {
    return res.status(400).json({ message: 'No doses available for this drive' });
  }

  // 4) Create the record
  const record = await VaccinationRecord.create({
    student:     studentId,
    drive:       driveId,
    vaccinatedAt: new Date()
  });

  // 5) Decrement doses & possibly mark completed
  drive.dosesAvailable -= 1;
  if (drive.dosesAvailable === 0) {
    drive.status = 'completed';
  }
  await drive.save();

  res.status(201).json({
    vaccineName: drive.vaccineName,
    vaccinatedAt: record.vaccinatedAt
  });
};
