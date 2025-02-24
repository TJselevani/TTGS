import random
import numpy as np
from sklearn.utils import shuffle

# Define the parameters for the timetable generation
NUM_CLASSES = 10  # Total number of classes to schedule
NUM_DAYS = 5  # Total number of days in the week
NUM_PERIODS = 3  # Total number of periods per day


# Class representing a single class with its attributes
class Class:
    def __init__(self, name, lecturer):
        self.name = name  # Name of the class
        self.lecturer = lecturer  # Lecturer assigned to the class


# Generate sample data for classes and lecturers
def generate_classes():
    lecturers = ["Lecturer A", "Lecturer B", "Lecturer C"]
    classes = [
        Class(f"Class {i}", random.choice(lecturers)) for i in range(NUM_CLASSES)
    ]
    return classes


# Fitness function to evaluate how well a timetable meets constraints
def calculate_fitness(timetable):
    fitness_score = 0

    # Check for clashes (same lecturer at same time)
    for day in range(NUM_DAYS):
        for period in range(NUM_PERIODS):
            lecturers_at_time = []
            for cls in timetable:
                if cls["day"] == day and cls["period"] == period:
                    lecturers_at_time.append(cls["class"].lecturer)
            # Count unique lecturers, penalty if more than one lecturer is found
            fitness_score -= len(set(lecturers_at_time)) - 1

    return fitness_score


# Generate an initial random timetable
def generate_initial_timetable(classes):
    timetable = []
    for cls in classes:
        day = random.randint(0, NUM_DAYS - 1)
        period = random.randint(0, NUM_PERIODS - 1)
        timetable.append({"class": cls, "day": day, "period": period})
    return timetable


# Genetic algorithm to evolve timetables towards better solutions
def genetic_algorithm(classes, population_size=100, generations=100):
    population = [generate_initial_timetable(classes) for _ in range(population_size)]

    for generation in range(generations):
        # Calculate fitness for each timetable in the population
        fitness_scores = [calculate_fitness(timetable) for timetable in population]

        # Select the best timetables based on fitness scores
        sorted_population = [
            x
            for _, x in sorted(
                zip(fitness_scores, population), key=lambda pair: pair[0]
            )
        ]

        # Keep a portion of the best solutions (elitism)
        next_generation = sorted_population[: population_size // 2]

        # Create new solutions through crossover and mutation
        while len(next_generation) < population_size:
            parent1, parent2 = random.sample(
                next_generation[:50], 2
            )  # Select parents from top half

            # Crossover: combine two parents to create a child
            child = []
            for i in range(len(parent1)):
                if random.random() < 0.5:
                    child.append(parent1[i])
                else:
                    child.append(parent2[i])

            # Mutation: randomly change some attributes of the child
            if random.random() < 0.1:  # Mutation chance
                mutation_index = random.randint(0, len(child) - 1)
                child[mutation_index]["day"] = random.randint(0, NUM_DAYS - 1)
                child[mutation_index]["period"] = random.randint(0, NUM_PERIODS - 1)

            next_generation.append(child)

        population = next_generation

    # Return the best solution from the final generation
    best_timetable = max(population, key=calculate_fitness)
    return best_timetable


# Main execution flow
if __name__ == "__main__":
    classes = generate_classes()  # Generate sample classes and lecturers
    best_timetable = genetic_algorithm(
        classes
    )  # Run genetic algorithm to find best timetable

    print("Best Timetable:")
    for entry in best_timetable:
        print(f"{entry['class'].name} - Day: {entry['day']}, Period: {entry['period']}")
