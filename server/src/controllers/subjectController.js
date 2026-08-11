const asyncHandler = require('../utils/asyncHandler');
const Subject = require('../models/Subject');
const User = require('../models/User');

// @desc    Get all subjects with optional filtering
// @route   GET /api/subjects
// @access  Private
const getSubjects = asyncHandler(async (req, res) => {
  const { department, course, teacherId, search } = req.query;
  const filter = {};

  if (department) filter.department = department;
  if (course) filter.course = course;
  if (teacherId) filter.instructorId = teacherId;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { code: { $regex: search, $options: 'i' } }
    ];
  }

  const subjects = await Subject.find(filter)
    .populate('instructorId', 'name email designation department')
    .populate('assignedStudents', 'name email rollNo department')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: subjects.length,
    data: subjects
  });
});

// @desc    Get single subject
// @route   GET /api/subjects/:id
// @access  Private
const getSubjectById = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id)
    .populate('instructorId', 'name email designation department')
    .populate('assignedStudents', 'name email rollNo department');

  if (!subject) {
    res.status(404);
    throw new Error('Subject not found');
  }

  res.json({
    success: true,
    data: subject
  });
});

// @desc    Create subject
// @route   POST /api/subjects
// @access  Private/Admin
const createSubject = asyncHandler(async (req, res) => {
  const { name, code, department, course, instructorId, totalClasses, color } = req.body;

  if (!name || !code) {
    res.status(400);
    throw new Error('Please provide subject name and code');
  }

  const existingSubject = await Subject.findOne({ code: code.toUpperCase() });
  if (existingSubject) {
    res.status(400);
    throw new Error('Subject with this code already exists');
  }

  let instructorName = '';
  if (instructorId) {
    const teacher = await User.findById(instructorId);
    if (teacher) {
      instructorName = teacher.name;
    }
  }

  const subject = await Subject.create({
    name,
    code: code.toUpperCase(),
    department: department || 'Computer Science',
    course: course || '',
    instructor: instructorName,
    instructorId: instructorId || null,
    totalClasses: totalClasses || 30,
    color: color || '#6366f1'
  });

  // If instructor was assigned during creation, update teacher's assignedSubjects array
  if (instructorId) {
    await User.findByIdAndUpdate(instructorId, {
      $addToSet: { assignedSubjects: subject._id }
    });
  }

  res.status(201).json({
    success: true,
    data: subject
  });
});

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private/Admin
const updateSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);

  if (!subject) {
    res.status(404);
    throw new Error('Subject not found');
  }

  subject.name = req.body.name || subject.name;
  subject.code = req.body.code ? req.body.code.toUpperCase() : subject.code;
  subject.department = req.body.department || subject.department;
  subject.course = req.body.course !== undefined ? req.body.course : subject.course;
  subject.totalClasses = req.body.totalClasses || subject.totalClasses;
  subject.color = req.body.color || subject.color;

  if (req.body.instructorId !== undefined) {
    // Remove subject from previous teacher
    if (subject.instructorId) {
      await User.findByIdAndUpdate(subject.instructorId, {
        $pull: { assignedSubjects: subject._id }
      });
    }

    if (req.body.instructorId) {
      const teacher = await User.findById(req.body.instructorId);
      if (teacher) {
        subject.instructorId = teacher._id;
        subject.instructor = teacher.name;
        await User.findByIdAndUpdate(teacher._id, {
          $addToSet: { assignedSubjects: subject._id }
        });
      }
    } else {
      subject.instructorId = null;
      subject.instructor = '';
    }
  }

  const updatedSubject = await subject.save();

  res.json({
    success: true,
    data: updatedSubject
  });
});

// @desc    Assign Teacher to Subject
// @route   POST /api/subjects/:id/assign-teacher
// @access  Private/Admin
const assignTeacherToSubject = asyncHandler(async (req, res) => {
  const { teacherId } = req.body;
  const subject = await Subject.findById(req.params.id);

  if (!subject) {
    res.status(404);
    throw new Error('Subject not found');
  }

  // Remove subject from previous teacher if any
  if (subject.instructorId) {
    await User.findByIdAndUpdate(subject.instructorId, {
      $pull: { assignedSubjects: subject._id }
    });
  }

  if (teacherId) {
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      res.status(400);
      throw new Error('Valid teacher profile not found');
    }

    subject.instructorId = teacher._id;
    subject.instructor = teacher.name;
    await subject.save();

    await User.findByIdAndUpdate(teacher._id, {
      $addToSet: { assignedSubjects: subject._id }
    });
  } else {
    subject.instructorId = null;
    subject.instructor = '';
    await subject.save();
  }

  res.json({
    success: true,
    message: 'Teacher assigned successfully',
    data: subject
  });
});

// @desc    Assign Students to Subject
// @route   POST /api/subjects/:id/assign-students
// @access  Private/Admin
const assignStudentsToSubject = asyncHandler(async (req, res) => {
  const { studentIds } = req.body; // array of student ObjectIds
  const subject = await Subject.findById(req.params.id);

  if (!subject) {
    res.status(404);
    throw new Error('Subject not found');
  }

  if (!Array.isArray(studentIds)) {
    res.status(400);
    throw new Error('studentIds must be an array');
  }

  subject.assignedStudents = studentIds;
  await subject.save();

  // Add subject to assignedSubjects array for all specified students
  await User.updateMany(
    { _id: { $in: studentIds } },
    { $addToSet: { assignedSubjects: subject._id } }
  );

  res.json({
    success: true,
    message: 'Students assigned to subject successfully',
    data: subject
  });
});

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private/Admin
const deleteSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);

  if (!subject) {
    res.status(404);
    throw new Error('Subject not found');
  }

  if (subject.instructorId) {
    await User.findByIdAndUpdate(subject.instructorId, {
      $pull: { assignedSubjects: subject._id }
    });
  }

  await subject.deleteOne();

  res.json({
    success: true,
    message: 'Subject removed successfully'
  });
});

module.exports = {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  assignTeacherToSubject,
  assignStudentsToSubject,
  deleteSubject
};
