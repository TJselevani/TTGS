from flask import Flask, jsonify, redirect
from pymongo import MongoClient
import random
import numpy as np
from sklearn.utils import shuffle

app = Flask(__name__)

# MongoDB connection
client = MongoClient("mongodb://127.0.0.1:27017/")
db = client["TTGS"]
unitsCollection = db["units"]
lecturersCollection = db["lecturers"]
timetableCollection = db["timetables"]
classroomsCollection = db["classrooms"]

# Constants
DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
PERIODS = ["1", "2", "3"]
SEMESTERS = ["1", "2", "3", "4", "5", "6", "7", "8"]
POPULATION_SIZE = 100
GENERATIONS = 100
MUTATION_RATE = 0.1


class Unit:
    def __init__(
        self, unitCode, unitName, semester, course, lecturer, classroom, substitute
    ):
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
        self.days = [days]
        self.room = [room]


class Classroom:
    def __init__(self, classroomName, classroomCapacity):
        self.classroomName = classroomName
        self.classroomCapacity = classroomCapacity


def get_units():
    units = []
    for unit in unitsCollection.find():
        temp = Unit(
            unitCode=unit["code"],
            unitName=unit["name"],
            semester=unit["semester"],
            course=unit["course"],
            lecturer=unit["lecturer"],
            classroom=[],
            substitute=unit["substitute"],
        )
        units.append(temp)
    return units


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


def get_classrooms():
    classrooms = []
    for classroom in classroomsCollection.find():
        temp = Classroom(
            classroomName=classroom["name"],
            classroomCapacity=classroom["capacity"],
        )
        classrooms.append(temp)
    return classrooms


def generate_initial_timetable(units, classrooms):
    timetable = []
    for unit in units:
        day = random.choice(DAYS)
        period = random.choice(PERIODS)
        classroom = random.choice(classrooms)
        timetable.append(
            {"unit": unit, "day": day, "period": period, "classroom": classroom}
        )
    return timetable


def calculate_fitness(timetable):
    fitness_score = 0

    # Check for lecturer clashes
    for day in DAYS:
        for period in PERIODS:
            lecturers_at_time = []
            for entry in timetable:
                if entry["day"] == day and entry["period"] == period:
                    lecturers_at_time.append(entry["unit"].lecturer)
            fitness_score -= len(lecturers_at_time) - len(set(lecturers_at_time))

    # Check for classroom clashes
    for day in DAYS:
        for period in PERIODS:
            classrooms_at_time = []
            for entry in timetable:
                if entry["day"] == day and entry["period"] == period:
                    classrooms_at_time.append(entry["classroom"].classroomName)
            fitness_score -= len(classrooms_at_time) - len(set(classrooms_at_time))

    # Check semester constraints
    semester_units = {}
    for entry in timetable:
        semester = entry["unit"].semester
        if semester not in semester_units:
            semester_units[semester] = []
        semester_units[semester].append(entry)

    for semester, units in semester_units.items():
        overlapping_times = 0
        for day in DAYS:
            for period in PERIODS:
                units_at_time = sum(
                    1
                    for unit in units
                    if unit["day"] == day and unit["period"] == period
                )
                if units_at_time > 1:
                    overlapping_times += units_at_time - 1
        fitness_score -= overlapping_times

    return fitness_score


def crossover(parent1, parent2):
    crossover_point = random.randint(1, len(parent1) - 1)
    child = parent1[:crossover_point] + parent2[crossover_point:]
    return child


def mutate(timetable, classrooms):
    if random.random() < MUTATION_RATE:
        entry_to_mutate = random.choice(timetable)
        mutation_type = random.choice(["day", "period", "classroom"])

        if mutation_type == "day":
            entry_to_mutate["day"] = random.choice(DAYS)
        elif mutation_type == "period":
            entry_to_mutate["period"] = random.choice(PERIODS)
        else:
            entry_to_mutate["classroom"] = random.choice(classrooms)

    return timetable


def genetic_algorithm(units, classrooms):
    # Generate initial population
    population = [
        generate_initial_timetable(units, classrooms) for _ in range(POPULATION_SIZE)
    ]

    for generation in range(GENERATIONS):
        # Calculate fitness for each timetable
        fitness_scores = [calculate_fitness(timetable) for timetable in population]

        # Select best timetables
        sorted_population = [
            x
            for _, x in sorted(
                zip(fitness_scores, population), key=lambda pair: pair[0], reverse=True
            )
        ]

        # Keep best solutions (elitism)
        next_generation = sorted_population[: POPULATION_SIZE // 4]

        # Generate new solutions through crossover and mutation
        while len(next_generation) < POPULATION_SIZE:
            parent1, parent2 = random.sample(
                sorted_population[: POPULATION_SIZE // 2], 2
            )
            child = crossover(parent1, parent2)
            child = mutate(child, classrooms)
            next_generation.append(child)

        population = next_generation

        # Early stopping if we find a perfect solution
        best_fitness = max(fitness_scores)
        if best_fitness == 0:
            break

    return max(population, key=calculate_fitness)


@app.route("/", methods=["GET"])
def index():
    return redirect("/index", code=302)


@app.route("/index", methods=["GET"])
def hello_world():
    return "Flask Server Running"


@app.route("/timetable", methods=["POST"])
def generateTimetable():
    units = get_units()
    classrooms = get_classrooms()

    # Generate timetable using genetic algorithm
    best_timetable = genetic_algorithm(units, classrooms)

    # Format the result for JSON response
    formatted_timetable = []
    for semester in SEMESTERS:
        semester_schedule = {"semester": semester, "unitss": []}

        for entry in best_timetable:
            if entry["unit"].semester == semester:
                semester_schedule["unitss"].append(
                    {
                        "unitCode": entry["unit"].unitCode,
                        "unitName": entry["unit"].unitName,
                        "unitLecturer": entry["unit"].lecturer,
                        "classroom": entry["classroom"].classroomName,
                        "day": entry["day"],
                        "period": entry["period"],
                    }
                )

        formatted_timetable.append(semester_schedule)

    return jsonify(formatted_timetable)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
