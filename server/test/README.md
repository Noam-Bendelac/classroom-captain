# Tests
This directory contains code for testing the application.

## Install Python and Pip
- https://www.python.org/downloads/
- https://pip.pypa.io/en/stable/installation/

## Install Dependencies
Replace <path_to_project> with the path of the project.
```
cd <path_to_project>/server/test
pip install -r requirements.txt
```

## Run Tests
Replace <path_to_project> with the path of the project and <URL> with the website's URL.
```
cd <path_to_project>/server/test
python -m unittest test.py <URL>
```
