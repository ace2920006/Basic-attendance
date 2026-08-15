const express = require('express');
const router = express.Router();
const {
  getTimetables,
  getTodayTimetable,
  getTomorrowTimetable,
  getWeeklyTimetable,
  createTimetable,
  updateTimetable,
  deleteTimetable
} = require('../controllers/timetableController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/today', getTodayTimetable);
router.get('/tomorrow', getTomorrowTimetable);
router.get('/weekly', getWeeklyTimetable);

router
  .route('/')
  .get(getTimetables)
  .post(authorize('teacher', 'admin'), createTimetable);

router
  .route('/:id')
  .put(authorize('teacher', 'admin'), updateTimetable)
  .delete(authorize('teacher', 'admin'), deleteTimetable);

module.exports = router;
