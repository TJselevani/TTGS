from flask import Flask, jsonify, redirect
from pulp import *
import pymongo
# import mongoose

app = Flask(__name__)

# Establish a connection to the MongoDB database
client = pymongo.MongoClient("mongodb://127.0.0.1:27017/")

# Select the database and collection
db = client["TTMS"]
unitsCollection = db["units"]
lecturersCollection = db["lecturers"]
timetableCollection = db["timetables"]
classroomsCollection = db["classrooms"]

# Define the classes for storing subject, lecturer, and classroom details
class Unit:
    def __init__(self, unitCode, unitName, semester, course, lecturer, classroom, substitute):
        self.unitCode = unitCode
        self.unitName = unitName
        self.semester = semester
        self.course = course
        self.lecturer = lecturer
        self.classroom = classroom
        self.substitute = substitute

class Lecturer:
    def __init__(self, lecturerCode, lecturerName, days, room):
        self.lecturerCode = lecturerCode
        self.lecturerName = lecturerName
        self.days = [days]#self.days = []
        self.room = [room]#self.room = []

class Classroom:
    def __init__(self, classroomName, classroomCapacity):
        self.classroomName = classroomName
        self.classroomCapacity = classroomCapacity

# Retrieve all units from the collection and store them in an array of Unit objects
def get_units():
    units = []
    for unit in unitsCollection.find():
        # Create a new Unit object for each unit fetched from the database
        temp = Unit(
            unitCode = unit["code"],
            unitName = unit["name"],
            semester = unit["semester"],
            course = unit["course"],
            lecturer = unit["lecturer"],
            classroom = [],
            substitute = unit["substitute"],
        )
        units.append(temp)
    return units

# Retrieve all lecturers from the collection and store them in an array of Lecturer objects
def get_lecturers():
    lecturers = []
    for lecturer in lecturersCollection.find():
        # Create a new Unit object for each unit fetched from the database
        temp = Lecturer(
            lecturerCode = lecturer["lecID"],
            lecturerName = lecturer["name"],
            days = [],
            room = [],
        )
        lecturers.append(temp)
    return lecturers

# Retrieve all classrooms from the collection and store them in an array of Classroom objects
def get_classrooms():
    classrooms = []
    for classroom in classroomsCollection.find():
        temp = Classroom(
            classroomName = classroom["name"],
            classroomCapacity = classroom["capacity"],
        )
        classrooms.append(temp)
    return classrooms

# ************************************************************************************* ROUTES **************************************************************************************************************

@app.route('/', methods=['GET'])
def indexx():
    return redirect('/index', code=302)

@app.route('/index', methods=['GET'])
def hello_wrl():
    return "Flask Server Running xx"

@app.route('/test', methods=['POST'])
def hello():
    return jsonify("Hello, Test Server Working")

# Define the endpoint for generating the timetable
@app.route('/timetable', methods=['POST'])
def generateTimetable():
    # Retrieve units, lecturers, and classrooms
    units = get_units()
    lecturers = get_lecturers()
    classrooms = get_classrooms()

    # Get the number of instances of the Unit class
    # num_units = len(units)

    # Get the number of instances of the Lecturer class
    # num_lecturers = len(lecturers)

    # Get the number of instances of the Lecturer class
    # num_classrooms = len(classrooms)

    # Define the variables
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    periods = ['1','2','3']
    semesters = ['1','2','3','4','5','6','7','8']

    # Define the problem
    prob = LpProblem("Timetable Problem", LpMinimize)

    # Define the decision variables
    assignments = LpVariable.dicts("Assignment", ((semester, unit, classroom, day, period) for semester in semesters for unit in units for classroom in classrooms for day in days for period in periods), cat='Binary')

    # Define the objective function (minimize the number of empty slots)
    prob += lpSum([assignments[(semester, unit, classroom, day, period)] for semester in semesters for unit in units for classroom in classrooms for day in days for period in periods])

    # Add the constraints

    #Each unit must be in its semester
    for semester in semesters:
        for unit in units:
            if unit.semester != semester:
                prob += lpSum([assignments[(semester, unit, classroom, day, period)] for classroom in classrooms for day in days for period in periods ]) == 0

    # Each unit must be scheduled only once a week
    for unit in units:
        prob += lpSum([assignments[(semester, unit, classroom, day, period)] for classroom in classrooms for semester in semesters for period in periods for day in days]) == 1

    # Each classroom can only be assigned to one slot per week
    for classroom in classrooms:
        for day in days:
            for period in periods:
                prob += lpSum([assignments[(semester, unit, classroom, day, period)] for semester in semesters for unit in units]) <= 1

    # Each lecturer can only teach one class at a time
    for day in days:
        for period in periods:
            for lecturer in lecturers:
                prob += lpSum([assignments[(semester, unit, classroom, day, period)] for semester in semesters for unit in units if unit.lecturer == lecturer]) <= 1

    # Each period can only have one unit
    for day in days:
        for period in periods:
            for unit in units:
                prob += lpSum([assignments[(semester, unit, classroom, day, period)] for semester in semesters for unit in units]) <= 1

    # Each class can only take one unit at a time
    for day in days:
        for period in periods:
            for classroom in classrooms:
                prob += lpSum([assignments[(semester, unit, classroom, day, period)] for semester in semesters for unit in units]) <= 1

    # Each classroom can only accommodate a limited number of learners
    for classroom in classrooms:
        for day in days:
            for period in periods:
                prob += lpSum([assignments[(semester, unit, classroom, day, period)] for semester in semesters for unit in units if classroom in unit.classroom]) <= 1000

    # #no 2 units can have the same period
    # for day in days:
    #     for period in periods:
    #         for unit1 in units:
    #             for unit2 in units:
    #                 if unit1 != unit2:
    #                     prob += lpSum([assignments[(semester, unit1, classroom, day, period)] for semester in semesters for classroom in classrooms]) + lpSum([assignments[(semester, unit2, classroom, day, period)] for semester in semesters for classroom in classrooms]) <= 1


    # Solve the problem
    prob.solve()

    tt = []

    for semester in semesters:
        solution = {}
        unitss = []
        solution["semester"] = semester
        for unit in units:
            for classroom in classrooms:
                for day in days:
                    for period in periods:
                        if value(assignments[(semester, unit, classroom, day, period)]) == 1:
                            unitss = [*unitss, {"unitCode": unit.unitCode, "unitName": unit.unitName, "unitLecturer": unit.lecturer, "classroom": classroom.classroomName, "day": day, "period": period }]
        
        solution["unitss"] = unitss 
        print(solution)
        tt = [*tt, solution]
    return jsonify(tt)




app.run(host='0.0.0.0', port=5000, debug=True)
