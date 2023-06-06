const express = require('express')
const router = express.Router()
const { adminLogin,
        adminPage,
        getSemesters,
        getLecturers,
        addLecturer,
        deleteLecturer,
        getUnits,
        addUnit,
        deleteUnit,
        getClassrooms,
        addClassroom,
        deleteClassroom,
        getTimetables ,
        allocateUnits,
        allocateClassrooms,
        timetablePage,
        testConnection,
        generateTimetable   } = require('../controllers/admin.controller')

// **************************************************************************************** Admin Login ********************************************************
router.get('/', adminPage)
router.post('/get-semester', getSemesters)
// *************************************************************************************** Manage Lectures ********************************************************
router.get('/manageLecturers', getLecturers)
router.post('/addLecturer', addLecturer);
router.delete('/deleteLecturer/:id', deleteLecturer);
// **************************************************************************************** Manage Units ********************************************************
router.get('/manageUnits', getUnits)
router.post('/addUnit', addUnit);
router.delete('/deleteUnit/:id', deleteUnit);
// **************************************************************************************** Manage Classrooms ********************************************************
router.get('/manageClassrooms', getClassrooms)
router.post('/addClassroom', addClassroom );
router.delete('/deleteClassroom/:id', deleteClassroom);
// **************************************************************************************** Timetable ********************************************************
router.get('/allocation', getTimetables)
// **************************************************************************************** Lecturer Unit Assignment ********************************************************
router.get('/allocateUnits', allocateUnits )
// **************************************************************************************** Allocate Classroom ********************************************************
router.get('/allocateClassrooms', allocateClassrooms)
// **************************************************************************************** Generate ********************************************************
router.get('/generateTimetable', timetablePage)
router.post('/test', testConnection)
router.post('/generate', generateTimetable);

module.exports = router
