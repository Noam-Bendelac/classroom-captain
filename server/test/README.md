# Tests
This directory contains code for testing the application.

## Install Python and Pip
- https://www.python.org/downloads/
- https://pip.pypa.io/en/stable/installation/

## Install Dependencies
- Replace `<path_to_project>` with the path of the project.
```
cd <path_to_project>/server/test
pip install -r requirements.txt
```

## Run Tests
- Edit following variables in test.py: `url` (website's url), `student_websocket_url` and `teacher_websocket_url`.
- Replace `<path_to_project>` with the path of the project.
```
cd <path_to_project>/server/test
python -m unittest test.py
```
