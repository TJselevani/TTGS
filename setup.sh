#!/bin/bash

# chmod +x setup.sh
# run this command in the terminal to update permission settings to run the script below

# Update package list and install Python and pip
sudo apt update
sudo apt install python3 python3-pip -y

# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
source venv/bin/activate

# Install required Python packages
pip install Flask pulp pymongo python-dotenv numpy scikit-learn
