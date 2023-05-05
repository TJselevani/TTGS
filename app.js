const express = require('express');
const mongoose = require("mongoose");
const AdminMDL = require('./models/admin');
const LecturerMDL = require('./models/lecturer');
const UnitMDL = require('./models/unit');
const ClassroomMDL = require('./models/classroom');
const TimetableMDL = require('./models/timetable');
const cookieParser = require('cookie-parser');
const session = require('express-session'); 
const axios = require('axios');
// const store = new session.MemoryStore()

//express app
const app = express();

const dbURI = "mongodb://localhost:27017/TTGS";
mongoose.connect(dbURI, {useNewUrlParser:true, useUnifiedTopology: true})
    .then((result) => app.listen(3000, () => {console.log('connected to db')})) 
    .catch((err) => console.log(err))
mongoose.set('strictQuery', false);

//Regiser View engine
app.set('view engine', 'ejs');
 
// middleware & static files
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'my-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 ,secure: false }
  }));

// add middleware to parse JSON request bodies
app.use(express.json()); 
app.use(cookieParser());

// Route to set a session variable and save it in a cookie
app.get('/setcookie', (req, res) => {    
    // Save the session ID in a cookie
    res.cookie(`Cookie token name`,`encrypted cookie string Value`,{
        maxAge: 5000,
        // expires works the same as the maxAge
        expires: new Date('01 12 2071'),
        secure: true,
        httpOnly: true,
        sameSite: 'lax'
    });
    console.log('Cookies have been saved successfully');
  
    // Send a response to confirm that the session variable has been set
    res.send('Session variable has been set.');
  });
  
// Route to retrieve a session variable
app.get('/getcookie', (req, res) => {
    // Retrieve the session variable
    const username = req.session.username;
  
    // Send the session variable in the response
    console.log(username )
    console.log(req.cookies)
    res.send(req.cookies);
});
app.get('/deletecookie', (req, res) => {
    //show the saved cookies
    res.clearCookie()
    res.send('Cookie has been deleted successfully');
});


// **************************************************************************************** Index ********************************************************
app.get('/', (req, res) => {
    res.redirect('/index');
})

app.get('/index', (req, res) => {
    res.render('index', {title: 'Home'});
})

// **************************************************************************************** Lecturer Login ********************************************************

app.post('/lecturer', async (req, res) => {
    const lecID = req.body.lecturerId
    try{
        const user = await LecturerMDL.findOne( {lecID} );
        if (user) {
            console.log('Login successful!')
            req.session.user = user;
            lec = req.session.user.name.trim();

            const lecid = req.session.user._id
            const lecUnits = await LecturerMDL.findById(lecid)
            const tTable = await TimetableMDL.find({})
            const filteredUnits = tTable.map(doc => ({...doc.toObject(), unitss: doc.unitss.filter(unit => unit.unitLecturer === lec) }));

            res.cookie('sessionID', req.sessionID, { maxAge: 3600000 });
            res.render('lecturer', {docs: lecUnits.unit, title: 'Lecturer', name: req.session.user.name, message: '',  timetableData: filteredUnits });
        } else {
            console.log('Invalid, User not Found !!')
            res.redirect('/')
        }
    }catch(err){
        console.log(err)
    }
})

app.get('/lecturer', async (req, res) => {
    if (req.session.user) {
        const lecid = req.session.user._id
        lec = req.session.user.name.trim();
        const lecUnits = await LecturerMDL.findById(lecid) 
        const tTable = await TimetableMDL.find({})
        const filteredUnits = tTable.map(doc => ({...doc.toObject(), unitss: doc.unitss.filter(unit => unit.unitLecturer === lec) }));
        res.render('lecturer', {docs: lecUnits.unit, title: 'Lecturer', name: req.session.user.name, message: '',  timetableData: filteredUnits });
    } else {
    console.log('Invalid, User not logged in !! :(')
    res.redirect('/');
    }
});

app.delete('/dropUnit/:id', async (req, res) => {
    const id = req.params.id;
    const lec = req.session.user.name

    try {
        const document = await LecturerMDL.findById(id);
        const names = document.unit;

        const index = names.indexOf({unitCode});
        if (index !== -1) {
            names.splice(index, 1);
        }

        document.unit = names;
        await document.save();

        res.redirect('/lecturer');
    } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while droping the unit');
    }
});

// ***************************************************************************** Lecturer Select ******************************************************************
app.get('/select', async (req, res) => {
    if (req.session.user) {
        const tTable = await TimetableMDL.find()
        const result = await UnitMDL.find()
        const filteredUnits = tTable.map(doc => ({...doc.toObject(), unitss: doc.unitss.filter(unit => unit.unitLecturer === req.session.user.name) }));
        res.render('select', {unitInfo: result, title: 'Lecturer-select', name: req.session.user.name, timetableData: filteredUnits});//tTable ? tTable.unitss : [] 
    
    } else {
    console.log('Invalid, User not logged in !! :(')
    res.redirect('/');
    }
})

app.post('/select', async (req, res) => {
    const lec = req.session.user.name.trim();
    const lecId = req.session.user._id;
    const lecID = req.session.user.lecID;
    console.log(lec)

    // Get the list of selected units from the request body
    const selectedItems = req.body.selected;
    console.log(selectedItems)

    try 
    {
        // const myArray = selectedItems.map(value => ({value}))
        const lecDoc = await LecturerMDL.findById(lecId)

        const promises = selectedItems.map(item => {      
            const units = item.trim().split('|');
            const unitCode = units[0];
            const unitName = units[1];
            return { unitCode, unitName }
        })
        console.log(promises)
        lecDoc.unit = [...lecDoc.unit, ...promises]
        lecDoc.save()

        // Update each unit's lecturer field to the current lecturer's name
        for (const unit of promises) {
            await UnitMDL.findOneAndUpdate(
                { code: unit.unitCode },
                { $set: { lecturer: lecDoc.name, isAssigned: true } }
            )
        }

        await Promise.all(promises);
        
        console.log(`${selectedItems.length} Units Successfully Selected`);
        const tTable = await TimetableMDL.find()
        const filteredUnits = tTable.map(doc => ({...doc.toObject(), unitss: doc.unitss.filter(unit => unit.unitLecturer === lec) }));
        res.redirect('/lecturer', 301, {title: 'Lecturer', name: req.session.user.name,  timetableData: filteredUnits})// tTable ? tTable.unitss : []
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal server error');
    }
})
// **************************************************************************************** Student Login ********************************************************
app.get('/student', async (req, res) => {
    const tTable = await TimetableMDL.findOne({ semester: 1 })
    res.render('student', {title: 'student', timetableData: tTable ? tTable.unitss : []});
})
app.post('/student-timetable', async (req, res) => {
    const sem = req.body.semester;
    const tTable = await TimetableMDL.findOne({ semester: sem })
    res.render('student', {title: 'student', timetableData: tTable ? tTable.unitss : []});
})
// **************************************************************************************** Admin Login ********************************************************
app.post('/admin', async (req, res) => {
    const name = req.body.adminName
    const password = req.body.password
    try{
        const user = await AdminMDL.findOne({name, password});
        if (user) {
            console.log('Login successful!')
            req.session.user = user;
            res.cookie('sessionID', req.sessionID, { maxAge: 3600000 });
            const lecInfo = await LecturerMDL.find()
            const tTable = await TimetableMDL.findOne({ semester: 1 })
            res.render('admin', {title: 'Admin', name: req.session.user.name, message: 'Admin Login Successful :)', lecturerInfo: lecInfo, timetableData: tTable ? tTable.unitss : []});
        } else {
            console.log('Invalid, User not Found !!')
            res.redirect('/')
        }
    }catch{
        console.log(err)
        res.redirect('/')
    }
})

app.get('/admin', async (req, res) => {
    if (req.session.user) {
        const lecInfo = await LecturerMDL.find()
        const tTable = await TimetableMDL.findOne({ semester: 1 })
        res.render('admin', {title: 'Admin', name: req.session.user.name, message: '', lecturerInfo: lecInfo, timetableData: tTable ? tTable.unitss : []});
        
    } else {
        console.log('Invalid, User not Logged in !! :(')
        res.redirect('/');
    }
})

app.post('/get-semester', async (req, res) => {
    if (req.session.user) {
        const sem = req.body.semester;
        console.log(sem)
        const lecInfo = await LecturerMDL.find()
        const tTable = await TimetableMDL.findOne({ semester: sem })
        res.render('admin', {title: 'Admin', name: req.session.user.name, message: '', lecturerInfo: lecInfo, timetableData: tTable ? tTable.unitss : []});  
    } else {
        console.log('Invalid, User not Logged in !! :(')
        res.redirect('/');
    }
})
// ****************************************************************************************Lecs********************************************************
app.get('/manageLecturers', async (req, res) => {
    const lecIn = await LecturerMDL.find()
    res.render('manageLecturers', {lecturerInfo: lecIn, title: 'admin-lecturers'});
        
})
app.post('/addlecturer', (req, res) => {
    const lecturer = new LecturerMDL(req.body);
  
    lecturer.save()
      .then(result => {
        res.redirect('/manageLecturers');
      })
      .catch(err => {
        console.log(err);
      });
  });

app.delete('/deleteLecturer/:id', (req, res) => {
const id = req.params.id;

LecturerMDL.findByIdAndDelete(id)
    .then(result => {
        res.json({ redirect: '/manageLecturers' });
    })
    .catch(err => {
        console.log(err);
    });
});
// ****************************************************************************************Units********************************************************
app.get('/manageUnits', async(req, res) => {
    
    const result = await UnitMDL.find()
    res.render('manageUnits', {unitInfo: result, title: 'admin-units'});
        
})
app.post('/addUnit', (req, res) => {
    const unit = new UnitMDL(req.body);
  
    unit.save()
      .then(result => {
        res.redirect('/manageUnits');
      })
      .catch(err => {
        console.log(err);
      });
  });
app.delete('/deleteUnit/:id', (req, res) => {
    const id = req.params.id;

    UnitMDL.findByIdAndDelete(id)
        .then(result => {
            res.json({ redirect: '/manageUnits' });
        })
        .catch(err => {
            console.log(err);
        });
});
// ****************************************************************************************Class********************************************************
app.get('/manageclassrooms', async(req, res) => {
    const result = await ClassroomMDL.find()
    res.render('manageClassrooms', {classroomInfo: result, title: 'admin-classrooms'});
        
})
app.post('/addClassroom', (req, res) => {
    const classroom = new ClassroomMDL(req.body);
  
    classroom.save()
      .then(result => {
        res.redirect('/manageClassrooms');
      })
      .catch(err => {
        console.log(err);
      });
  });
app.delete('/deleteClassroom/:id', (req, res) => {
    const id = req.params.id;

    ClassroomMDL.findByIdAndDelete(id)
        .then(result => {
            res.json({ redirect: '/manageClassrooms' });
        })
        .catch(err => {
            console.log(err);
        });
});

// **************************************************************************************** Timetable ********************************************************
app.get('/allocation', async (req, res) => {
    const result = await TimetableMDL.find()
    res.render('allocation', {title: 'admin-allot', timetableData: result});
            
})

// ****************************************************************************************Lecturer Unit Assignment ********************************************************
app.get('/allocateUnits', async (req, res) => {
    const units = await UnitMDL.find()
    res.render('allocateUnits', {title: 'admin-allot-Units', unitInfo: units});

})

// ****************************************************************************************Allocate Classroom********************************************************
app.get('/allocateClassrooms', async (req, res) => {
    const unitIn = await UnitMDL.find()
    const classInfo = await ClassroomMDL.find()
    res.render('allocateClassrooms', {title: 'admin-allot-Classes', unitInfo: unitIn, classroomInfo: classInfo}); 
})

// ****************************************************************************************Generate********************************************************
app.get('/generateTimetable', (req, res) => {
    res.render('generateTimetable', {title: 'admin-generate'});
})
app.post('/test', (req, res) => {
    const options = {
        url: 'http://localhost:5000/test',
        port: 5000,
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
    }; 
    
    // Send the HTTP request
    axios(options)
    .then(response => {
        // Process the response data
        const prediction = response.data;
        res.send(prediction)
    })
    .catch(error => {
        console.error(error);
    });
})

app.post('/generate', (req, res) => {
    // Define the request data

    // Set the request options
    const options = {
        url: 'http://localhost:5000/timetable',
        port: 5000,
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
    }; 
    
    // Send the HTTP request
    axios(options)
    .then(response => {
        // Process the response data
        const prediction = response.data;//
        res.send(prediction)
        console.log(prediction)
        console.log(prediction[0])
        // console.log(prediction.JSON.semester)

        //  Define the timetable data
        prediction.map(async item => {
            // Create a new instance of the Timetable model and pass the data object
            const timetable = TimetableMDL(item)
            // Save the new timetable instance to the database
            const fin = await timetable.save()
        })

    })
    .catch(error => {
        console.error(error);
    });
});

app.use((req, res) => {
    res.status(404).render('404', {title: '404'});
})


