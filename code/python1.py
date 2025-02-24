from flask import Flask, jsonify, redirect
from pulp import *
import pymongo

app = Flask(__name__)

# Establish a connection to the MongoDB database
client = pymongo.MongoClient("mongodb://127.0.0.1:27017/")

# Select the database and collection
db = client["TTGS"]
unitsCollection = db["units"]
lecturersCollection = db["lecturers"]
timetableCollection = db["timetables"]
classroomsCollection = db["classrooms"]


# Define the classes for storing subject, lecturer, and classroom details
class Unit:
    def __init__(
        self, unitCode, unitName, semester, course, lecturer, classroom, substitute
    ):
        self.unitCode = unitCode
        self.unitName = unitName
        self.semester = semester
        self.course = course
        self.lecturer = lecturer  # This should be the LECTURER's NAME (string)
        self.classroom = classroom  # This should be the CLASSROOM's NAME (string)
        self.substitute = substitute


class Lecturer:
    def __init__(self, lecturerCode, lecturerName, days, room):
        self.lecturerCode = lecturerCode
        self.lecturerName = lecturerName
        self.days = [days]  # self.days = []
        self.room = [room]  # self.room = []


class Classroom:
    def __init__(self, classroomName, classroomCapacity):
        self.classroomName = classroomName
        self.classroomCapacity = classroomCapacity


# Retrieve all units from the collection and store them in an array of Unit objects
def get_units():
    units = []
    for unit in unitsCollection.find():
        temp = Unit(
            unitCode=unit["code"],
            unitName=unit["name"],
            semester=unit["semester"],
            course=unit["course"],
            lecturer=unit["lecturer"],  # Assuming this is the lecturer NAME
            classroom=unit["room"],  # Assuming this is the classroom NAME
            substitute=unit["substitute"],
        )
        units.append(temp)
    return units


# Retrieve all lecturers from the collection and store them in an array of Lecturer objects
def get_lecturers():
    lecturers = []
    for lecturer in lecturersCollection.find():
        temp = Lecturer(
            lecturerCode=lecturer["lecID"],
            lecturerName=lecturer["name"],
            days=[],
            room=[],
        )
        lecturers.append(temp)
    return lecturers


# Retrieve all classrooms from the collection and store them in an array of Classroom objects
def get_classrooms():
    classrooms = []
    for classroom in classroomsCollection.find():
        temp = Classroom(
            classroomName=classroom["name"],
            classroomCapacity=classroom["capacity"],
        )
        classrooms.append(temp)
    return classrooms


@app.route("/", methods=["GET"])
def indexx():
    return redirect("/index", code=302)


@app.route("/index", methods=["GET"])
def hello_wrl():
    return "Flask Server Running xx"


@app.route("/test", methods=["POST"])
def hello():
    return jsonify("Hello, Test Server Working")


@app.route("/timetable", methods=["POST"])
def generateTimetable():
    units = get_units()
    lecturers = get_lecturers()
    classrooms = get_classrooms()

    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    periods = ["1", "2", "3"]
    semesters = ["1", "2", "3", "4", "5", "6", "7", "8"]

    # Problem definition
    prob = LpProblem("Timetable", LpMinimize)  # Or LpMinimize if you have an objective

    # Decision variables
    assignments = LpVariable.dicts(
        "Assignment",
        (
            (
                semester,
                unit.unitCode,
                classroom.classroomName,
                day,
                period,
            )  # Use strings for keys
            for semester in semesters
            for unit in units
            for classroom in classrooms
            for day in days
            for period in periods
        ),
        cat="Binary",
    )

    # Objective function (optional - minimize the number of assignments)
    # prob += lpSum(assignments.values())  # Minimize usage.  Could remove.

    # Constraints

    # Each unit must be in its semester
    for semester in semesters:
        for unit in units:
            if unit.semester == semester:  # Corrected condition
                prob += (
                    lpSum(
                        [
                            assignments[
                                (
                                    semester,
                                    unit.unitCode,
                                    classroom.classroomName,
                                    day,
                                    period,
                                )
                            ]  # String keys
                            for classroom in classrooms
                            for day in days
                            for period in periods
                        ]
                    )
                    == 1  # Each unit in a semester must be assigned ONCE
                )

    # Each unit must be scheduled only once a week (REDUNDANT - covered by semester constraint)
    # for unit in units:
    #    prob += (
    #        lpSum(
    #            [
    #                assignments[(semester, unit.unitCode, classroom.classroomName, day, period)] #String keys
    #                for classroom in classrooms
    #                for semester in semesters
    #                for period in periods
    #                for day in days
    #            ]
    #        )
    #        == 1
    #    )

    # Each classroom can only be assigned to one unit at a time
    for classroom in classrooms:
        for day in days:
            for period in periods:
                prob += (
                    lpSum(
                        [
                            assignments[
                                (
                                    semester,
                                    unit.unitCode,
                                    classroom.classroomName,
                                    day,
                                    period,
                                )
                            ]  # String keys
                            for semester in semesters
                            for unit in units
                        ]
                    )
                    <= 1
                )

    # Each lecturer can only teach one unit at a time
    for day in days:
        for period in periods:
            for lecturer in lecturers:
                prob += (
                    lpSum(
                        [
                            assignments[
                                (
                                    semester,
                                    unit.unitCode,
                                    classroom.classroomName,
                                    day,
                                    period,
                                )
                            ]  # String keys
                            for semester in semesters
                            for unit in units
                            if unit.lecturer
                            == lecturer.lecturerName  # Correct comparison
                        ]
                    )
                    <= 1
                )

    # Classroom capacity constraint (Check that learners < capacity for a room)
    for semester in semesters:
        for unit in units:
            for classroom in classrooms:
                if unit.classroom == classroom.classroomName:
                    for day in days:
                        for period in periods:
                            prob += (
                                assignments[
                                    semester,
                                    unit.unitCode,
                                    classroom.classroomName,
                                    day,
                                    period,
                                ]
                                <= classroom.classroomCapacity
                            )

    # Solve the problem
    prob.solve()

    print("Status:", LpStatus[prob.status])  # Print solver status

    tt = []

    for semester in semesters:
        solution = {}
        unitss = []
        solution["semester"] = semester
        for unit in units:
            for classroom in classrooms:
                for day in days:
                    for period in periods:
                        if (
                            value(
                                assignments[
                                    (
                                        semester,
                                        unit.unitCode,
                                        classroom.classroomName,
                                        day,
                                        period,
                                    )
                                ]
                            )
                            == 1
                        ):
                            unitss = [
                                *unitss,
                                {
                                    "unitCode": unit.unitCode,
                                    "unitName": unit.unitName,
                                    "unitLecturer": unit.lecturer,
                                    "classroom": classroom.classroomName,
                                    "day": day,
                                    "period": period,
                                },
                            ]

        solution["unitss"] = unitss
        print(solution)
        tt = [*tt, solution]
    return jsonify(tt)


app.run(host="0.0.0.0", port=5000, debug=True)
