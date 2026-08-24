const AcademicYear = require('../models/AcademicYear');
const Semester = require('../models/Semester');
const Division = require('../models/Division');
const StudentEnrollment = require('../models/StudentEnrollment');
const User = require('../models/User');
const Department = require('../models/Department');
const Subject = require('../models/Subject');
const asyncHandler = require('../utils/asyncHandler');

// ==========================================
// ACADEMIC YEAR CONTROLLERS
// ==========================================

// @desc    Get all Academic Years
// @route   GET /api/academic/years
// @access  Private
exports.getAcademicYears = asyncHandler(async (req, res) => {
  const years = await AcademicYear.find().sort({ startDate: -1 });

  // Enrich with semester count and division count
  const enrichedYears = await Promise.all(
    years.map(async (year) => {
      const semesterCount = await Semester.countDocuments({ academicYear: year._id });
      const divisionCount = await Division.countDocuments({ academicYear: year._id });
      return {
        ...year.toObject(),
        semesterCount,
        divisionCount
      };
    })
  );

  res.json({
    success: true,
    count: enrichedYears.length,
    data: enrichedYears
  });
});

// @desc    Create Academic Year
// @route   POST /api/academic/years
// @access  Private/Admin
exports.createAcademicYear = asyncHandler(async (req, res) => {
  const { yearName, startDate, endDate, isCurrent, status, description } = req.body;

  const yearExists = await AcademicYear.findOne({ yearName });
  if (yearExists) {
    res.status(400);
    throw new Error(`Academic Year '${yearName}' already exists.`);
  }

  const academicYear = await AcademicYear.create({
    yearName,
    startDate,
    endDate,
    isCurrent: isCurrent || false,
    status: status || 'Active',
    description: description || ''
  });

  res.status(201).json({
    success: true,
    message: `Academic Year '${yearName}' created successfully.`,
    data: academicYear
  });
});

// @desc    Update Academic Year
// @route   PUT /api/academic/years/:id
// @access  Private/Admin
exports.updateAcademicYear = asyncHandler(async (req, res) => {
  let academicYear = await AcademicYear.findById(req.params.id);

  if (!academicYear) {
    res.status(404);
    throw new Error('Academic Year not found.');
  }

  academicYear = await AcademicYear.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.json({
    success: true,
    message: 'Academic Year updated successfully.',
    data: academicYear
  });
});

// @desc    Set current Active Academic Year
// @route   PATCH /api/academic/years/:id/set-current
// @access  Private/Admin
exports.setCurrentAcademicYear = asyncHandler(async (req, res) => {
  const academicYear = await AcademicYear.findById(req.params.id);

  if (!academicYear) {
    res.status(404);
    throw new Error('Academic Year not found.');
  }

  // Deactivate all others
  await AcademicYear.updateMany({}, { $set: { isCurrent: false } });

  academicYear.isCurrent = true;
  academicYear.status = 'Active';
  await academicYear.save();

  res.json({
    success: true,
    message: `Academic Year '${academicYear.yearName}' set as current active year.`,
    data: academicYear
  });
});

// @desc    Delete Academic Year
// @route   DELETE /api/academic/years/:id
// @access  Private/Admin
exports.deleteAcademicYear = asyncHandler(async (req, res) => {
  const academicYear = await AcademicYear.findById(req.params.id);

  if (!academicYear) {
    res.status(404);
    throw new Error('Academic Year not found.');
  }

  await Semester.deleteMany({ academicYear: academicYear._id });
  await Division.deleteMany({ academicYear: academicYear._id });
  await academicYear.deleteOne();

  res.json({
    success: true,
    message: `Academic Year '${academicYear.yearName}' and associated semesters/divisions removed.`
  });
});

// ==========================================
// SEMESTER CONTROLLERS
// ==========================================

// @desc    Get Semesters
// @route   GET /api/academic/semesters
// @access  Private
exports.getSemesters = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.academicYear) {
    filter.academicYear = req.query.academicYear;
  }

  const semesters = await Semester.find(filter)
    .populate('academicYear', 'yearName isCurrent')
    .sort({ semesterNumber: 1 });

  res.json({
    success: true,
    count: semesters.length,
    data: semesters
  });
});

// @desc    Create Semester
// @route   POST /api/academic/semesters
// @access  Private/Admin
exports.createSemester = asyncHandler(async (req, res) => {
  const { name, semesterNumber, academicYear, startDate, endDate, isCurrent, status } = req.body;

  if (!academicYear) {
    res.status(400);
    throw new Error('Please specify Academic Year ID for the semester.');
  }

  const semester = await Semester.create({
    name,
    semesterNumber: Number(semesterNumber),
    academicYear,
    startDate,
    endDate,
    isCurrent: isCurrent || false,
    status: status || 'Active'
  });

  const populatedSemester = await Semester.findById(semester._id).populate('academicYear', 'yearName');

  res.status(201).json({
    success: true,
    message: `Semester '${name}' created successfully.`,
    data: populatedSemester
  });
});

// @desc    Update Semester
// @route   PUT /api/academic/semesters/:id
// @access  Private/Admin
exports.updateSemester = asyncHandler(async (req, res) => {
  let semester = await Semester.findById(req.params.id);

  if (!semester) {
    res.status(404);
    throw new Error('Semester not found.');
  }

  semester = await Semester.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('academicYear', 'yearName');

  res.json({
    success: true,
    message: 'Semester updated successfully.',
    data: semester
  });
});

// @desc    Delete Semester
// @route   DELETE /api/academic/semesters/:id
// @access  Private/Admin
exports.deleteSemester = asyncHandler(async (req, res) => {
  const semester = await Semester.findById(req.params.id);

  if (!semester) {
    res.status(404);
    throw new Error('Semester not found.');
  }

  await Division.deleteMany({ semester: semester._id });
  await semester.deleteOne();

  res.json({
    success: true,
    message: `Semester '${semester.name}' removed.`
  });
});

// ==========================================
// DIVISION / CLASS SECTION CONTROLLERS
// ==========================================

// @desc    Get Divisions
// @route   GET /api/academic/divisions
// @access  Private
exports.getDivisions = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.academicYear) filter.academicYear = req.query.academicYear;
  if (req.query.semester) filter.semester = req.query.semester;
  if (req.query.department) filter.department = req.query.department;

  const divisions = await Division.find(filter)
    .populate('academicYear', 'yearName')
    .populate('semester', 'name semesterNumber')
    .sort({ department: 1, name: 1 });

  // Update actual student counts per division dynamically
  const enrichedDivisions = await Promise.all(
    divisions.map(async (div) => {
      const studentCount = await User.countDocuments({
        role: 'student',
        $or: [{ divisionId: div._id }, { divisionName: div.name }]
      });
      return {
        ...div.toObject(),
        studentsCount: studentCount
      };
    })
  );

  res.json({
    success: true,
    count: enrichedDivisions.length,
    data: enrichedDivisions
  });
});

// @desc    Create Division
// @route   POST /api/academic/divisions
// @access  Private/Admin
exports.createDivision = asyncHandler(async (req, res) => {
  const { name, section, department, academicYear, semester, capacity } = req.body;

  const division = await Division.create({
    name,
    section: section.toUpperCase(),
    department,
    academicYear,
    semester,
    capacity: capacity || 60
  });

  const populated = await Division.findById(division._id)
    .populate('academicYear', 'yearName')
    .populate('semester', 'name');

  res.status(201).json({
    success: true,
    message: `Division '${name}' created successfully.`,
    data: populated
  });
});

// @desc    Delete Division
// @route   DELETE /api/academic/divisions/:id
// @access  Private/Admin
exports.deleteDivision = asyncHandler(async (req, res) => {
  const division = await Division.findById(req.params.id);

  if (!division) {
    res.status(404);
    throw new Error('Division not found.');
  }

  await division.deleteOne();

  res.json({
    success: true,
    message: `Division '${division.name}' deleted.`
  });
});

// ==========================================
// HIERARCHY TREE CONTROLLER
// ==========================================

// @desc    Get complete Academic Hierarchy Tree
// @route   GET /api/academic/hierarchy
// @access  Private
exports.getAcademicHierarchy = asyncHandler(async (req, res) => {
  // Find current or all academic years
  const academicYears = await AcademicYear.find().sort({ startDate: -1 });
  const currentYear = academicYears.find((y) => y.isCurrent) || academicYears[0];

  const departments = await Department.find().sort({ name: 1 });
  const deptList = departments.map(d => d.code || d.name);
  if (!deptList.includes('IT')) deptList.push('IT');
  if (!deptList.includes('CSE')) deptList.push('CSE');

  const hierarchy = await Promise.all(
    academicYears.map(async (year) => {
      const semesters = await Semester.find({ academicYear: year._id }).sort({ semesterNumber: 1 });

      const semesterTrees = await Promise.all(
        semesters.map(async (sem) => {
          const divisions = await Division.find({ semester: sem._id });

          // Group divisions by department
          const deptGroups = {};

          divisions.forEach((div) => {
            const deptKey = div.department || 'General';
            if (!deptGroups[deptKey]) deptGroups[deptKey] = [];
            deptGroups[deptKey].push(div);
          });

          // Fetch subjects linked to this semester
          const subjects = await Subject.find({
            $or: [{ semesterRef: sem._id }, { course: sem.name }]
          });

          return {
            _id: sem._id,
            name: sem.name,
            semesterNumber: sem.semesterNumber,
            status: sem.status,
            departments: Object.keys(deptGroups).map((deptName) => ({
              name: deptName,
              divisions: deptGroups[deptName].map((d) => ({
                _id: d._id,
                name: d.name,
                section: d.section,
                capacity: d.capacity,
                studentsCount: d.studentsCount
              }))
            })),
            subjectsCount: subjects.length,
            subjects: subjects.map(s => ({
              _id: s._id,
              code: s.code,
              name: s.name,
              instructor: s.instructor
            }))
          };
        })
      );

      return {
        _id: year._id,
        yearName: year.yearName,
        startDate: year.startDate,
        endDate: year.endDate,
        isCurrent: year.isCurrent,
        status: year.status,
        semesters: semesterTrees
      };
    })
  );

  res.json({
    success: true,
    data: hierarchy
  });
});

// ==========================================
// STUDENT PROMOTION & ENROLLMENT ENGINE
// ==========================================

// @desc    Batch Student Promotion
// @route   POST /api/academic/promote
// @access  Private/Admin
exports.promoteStudents = asyncHandler(async (req, res) => {
  const { studentIds, targetAcademicYearId, targetSemesterId, targetDivisionId, remarks } = req.body;

  if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
    res.status(400);
    throw new Error('Please select at least one student to promote.');
  }

  const targetYear = await AcademicYear.findById(targetAcademicYearId);
  const targetSemester = await Semester.findById(targetSemesterId);
  const targetDivision = targetDivisionId ? await Division.findById(targetDivisionId) : null;

  if (!targetYear || !targetSemester) {
    res.status(400);
    throw new Error('Invalid target Academic Year or Semester.');
  }

  let promotedCount = 0;

  for (const studentId of studentIds) {
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') continue;

    // Create historical enrollment record
    const enrollment = await StudentEnrollment.create({
      student: student._id,
      academicYear: targetYear._id,
      semester: targetSemester._id,
      department: student.department || 'Computer Science',
      division: targetDivision ? targetDivision._id : null,
      divisionName: targetDivision ? targetDivision.name : (student.divisionName || ''),
      status: 'Promoted',
      promotedAt: new Date(),
      remarks: remarks || `Promoted to ${targetSemester.name} (${targetYear.yearName})`
    });

    // Update active student profile
    student.academicYearId = targetYear._id;
    student.semesterId = targetSemester._id;
    student.semester = targetSemester.name;
    if (targetDivision) {
      student.divisionId = targetDivision._id;
      student.divisionName = targetDivision.name;
    }
    await student.save();

    promotedCount++;
  }

  res.json({
    success: true,
    message: `Successfully promoted ${promotedCount} student(s) to ${targetSemester.name} (${targetYear.yearName}).`,
    promotedCount
  });
});

// @desc    Batch Student Enrollment
// @route   POST /api/academic/enroll
// @access  Private/Admin
exports.enrollStudents = asyncHandler(async (req, res) => {
  const { studentIds, academicYearId, semesterId, divisionId, department } = req.body;

  if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
    res.status(400);
    throw new Error('Please select at least one student.');
  }

  const year = await AcademicYear.findById(academicYearId);
  const semester = await Semester.findById(semesterId);
  const division = divisionId ? await Division.findById(divisionId) : null;

  let enrolledCount = 0;

  for (const studentId of studentIds) {
    const student = await User.findById(studentId);
    if (!student) continue;

    student.academicYearId = year._id;
    student.semesterId = semester._id;
    student.semester = semester.name;
    if (department) student.department = department;
    if (division) {
      student.divisionId = division._id;
      student.divisionName = division.name;
    }

    await student.save();

    await StudentEnrollment.create({
      student: student._id,
      academicYear: year._id,
      semester: semester._id,
      department: student.department,
      division: division ? division._id : null,
      divisionName: division ? division.name : '',
      status: 'Enrolled'
    });

    enrolledCount++;
  }

  res.json({
    success: true,
    message: `Enrolled ${enrolledCount} student(s) into ${semester.name}.`,
    enrolledCount
  });
});

// @desc    Allocate Subject to Dynamic Academic Hierarchy
// @route   POST /api/academic/allocations
// @access  Private/Admin
exports.allocateSubject = asyncHandler(async (req, res) => {
  const { subjectId, academicYearId, semesterId, divisionId, instructorId } = req.body;

  const subject = await Subject.findById(subjectId);
  if (!subject) {
    res.status(404);
    throw new Error('Subject not found.');
  }

  if (academicYearId) subject.academicYearRef = academicYearId;
  if (semesterId) {
    const semester = await Semester.findById(semesterId);
    if (semester) {
      subject.semesterRef = semester._id;
      subject.course = semester.name;
    }
  }
  if (divisionId) {
    const div = await Division.findById(divisionId);
    if (div) {
      subject.divisionRef = div._id;
      subject.divisionName = div.name;
    }
  }
  if (instructorId) {
    const teacher = await User.findById(instructorId);
    if (teacher) {
      subject.instructorId = teacher._id;
      subject.instructor = teacher.name;
    }
  }

  await subject.save();

  res.json({
    success: true,
    message: `Subject '${subject.name}' allocated successfully.`,
    data: subject
  });
});
