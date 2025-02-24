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
        self.semester = semester  # Ensure this is a string
        self.course = course
        self.lecturer = lecturer
        self.classroom = classroom
        self.substitute = substitute


def get_units():
    units = []
    for unit in unitsCollection.find():
        # Debug print
        print(f"Retrieved unit from DB: {unit}")
        temp = Unit(
            unitCode=unit["code"],
            unitName=unit["name"],
            semester=str(unit["semester"]),  # Convert to string explicitly
            course=unit["course"],
            lecturer=unit["lecturer"],
            classroom=[],
            substitute=unit["substitute"],
        )
        units.append(temp)
    print(f"Total units retrieved: {len(units)}")
    return units


class Classroom:
    def __init__(self, classroomName, classroomCapacity):
        self.classroomName = classroomName
        self.classroomCapacity = classroomCapacity


def get_classrooms():
    classrooms = []
    for classroom in classroomsCollection.find():
        temp = Classroom(
            classroomName=classroom["name"],
            classroomCapacity=classroom["capacity"],
        )
        classrooms.append(temp)
    print(f"Total classrooms retrieved: {len(classrooms)}")
    return classrooms


def generate_initial_timetable(units, classrooms):
    if not units or not classrooms:
        print("Warning: No units or classrooms available")
        return []

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
    if not timetable:
        return float("-inf")

    fitness_score = 0

    # Check for lecturer clashes
    for day in DAYS:
        for period in PERIODS:
            lecturers_at_time = []
            for entry in timetable:
                if entry["day"] == day and entry["period"] == period:
                    lecturers_at_time.append(entry["unit"].lecturer)
            fitness_score -= len(lecturers_at_time) - len(set(lecturers_at_time))

    return fitness_score


def genetic_algorithm(units, classrooms):
    if not units or not classrooms:
        print("Error: No units or classrooms available for timetable generation")
        return []

    # Generate initial population
    population = [
        generate_initial_timetable(units, classrooms) for _ in range(POPULATION_SIZE)
    ]

    best_timetable = None
    best_fitness = float("-inf")

    for generation in range(GENERATIONS):
        # Calculate fitness for each timetable
        fitness_scores = [calculate_fitness(timetable) for timetable in population]

        # Track best solution
        current_best_fitness = max(fitness_scores)
        if current_best_fitness > best_fitness:
            best_fitness = current_best_fitness
            best_timetable = population[fitness_scores.index(current_best_fitness)]

        print(f"Generation {generation}: Best fitness = {best_fitness}")

        # Select best timetables
        sorted_indices = np.argsort(fitness_scores)[::-1]
        sorted_population = [population[i] for i in sorted_indices]

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

    return best_timetable


def crossover(parent1, parent2):
    if not parent1 or not parent2:
        return parent1 or parent2

    crossover_point = random.randint(1, len(parent1) - 1)
    child = parent1[:crossover_point] + parent2[crossover_point:]
    return child


def mutate(timetable, classrooms):
    if not timetable:
        return timetable

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

    if not units or not classrooms:
        return jsonify({"error": "No units or classrooms found in database"})

    # Generate timetable using genetic algorithm
    best_timetable = genetic_algorithm(units, classrooms)

    if not best_timetable:
        return jsonify({"error": "Failed to generate timetable"})

    # Format the result for JSON response
    formatted_timetable = []
    for semester in SEMESTERS:
        semester_schedule = {"semester": semester, "unitss": []}

        # Debug print
        print(f"Processing semester {semester}")

        for entry in best_timetable:
            print(
                f"Checking entry - Unit semester: {entry['unit'].semester}, Current semester: {semester}"
            )
            if str(entry["unit"].semester) == str(semester):  # Ensure string comparison
                unit_data = {
                    "unitCode": entry["unit"].unitCode,
                    "unitName": entry["unit"].unitName,
                    "unitLecturer": entry["unit"].lecturer,
                    "classroom": entry["classroom"].classroomName,
                    "day": entry["day"],
                    "period": entry["period"],
                }
                semester_schedule["unitss"].append(unit_data)
                print(f"Added unit to semester {semester}: {unit_data}")

        formatted_timetable.append(semester_schedule)

    return jsonify(formatted_timetable)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
