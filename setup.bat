@echo off

REM Update package list and install Python and pip
REM Note: Windows does not have apt; ensure Python is installed manually or via installer

REM Create a virtual environment
python -m venv venv

REM Activate the virtual environment
call venv\Scripts\activate

REM Install required Python packages
pip install Flask pulp pymongo python-dotenv numpy scikit-learn

echo Setup complete! Remember to activate your virtual environment with 'call venv\Scripts\activate' when you start a new terminal session.
