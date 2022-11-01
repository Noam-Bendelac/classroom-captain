const express = require("express");


const bodyParser = require("body-parser")
  
// Setting up the server
var app = express()

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.use(express.json());
const cookieParser = require('cookie-parser'); // in order to read cookie sent from client
// Creating session 
app.use(cookieParser('sanath'));
app.use(bodyParser.urlencoded({
  extended: true
}));
const port = 1234;


// "type definitions" of records, and tables of records:

class Teacher {
  // string
  id = generateId()
  // websocket connection instance
  connection = null
  
  constructor() {
    teachers.set(this.id, this)
  }
}
// teachers: Map<teacher id -> Teacher>
var teachers = new Map()

class Student {
  // string
  id = generateId()
  // websocket connection instance
  connection = null
  
  constructor() {
    students.set(this.id, this)
  }
}
// students: Map<student id -> Student>
var students = new Map();

// Classroom has a dependency on teacher and students, so it manages the indexes
// indexTeacherToClassroom and indexStudentToClassroom
class Classroom {
  // string
  id = generateId()
  // string
  teacherId
  // string[]
  studentIds = []
  
  constructor(teacherId) {
    this.teacherId = teacherId
    classrooms.set(this.id, this)
    indexTeacherToClassroom.set(this.teacherId, this.id)
  }
  addStudent(studentId) {
    this.studentIds.push(studentId)
    indexStudentToClassroom.set(studentId, this.id)
  }
}
// classrooms: Map<classroom id -> Classroom>
var classrooms = new Map();


// additional indexes for accessing records from ids
var indexTeacherToClassroom = new Map();
var indexStudentToClassroom = new Map();


function generateId() {
  return Math.floor(Math.random() * (99999 - 10000) + 10000).toString()
}


// views for debugging
app.get("/", (req, res) => {
  res.render('index.html');
});

app.get("/join", (req, res) => {
  res.render('join.html');
});


// api

app.post('/classrooms', (req,res)=>{
  
  const teacher = new Teacher()
  const classroom = new Classroom(teacher.id)
  
  console.log(classrooms)
  
  res.cookie('tempId', teacher.id, {
    maxAge: 1000 * 60 * 60 * 24 // expire after 24 hours
  })
  
  res.status(201).json({ classroomCode: classroom.id })
})


app.post("/classrooms/:classroomId/students", (req, res) => {
  // console.log(req.params.classroomId, classrooms, classrooms.has(req.params.classroomId))
  
  const classroom = classrooms.get(req.params.classroomId)
  
  if (classroom !== undefined) {
    
    const student = new Student()
    classroom.addStudent(student.id)
    
    res.cookie('tempId', student.id, {
      maxAge: 1000 * 60 * 60 * 24 // expire after 24 hours
    })
    
    res.status(200).json({})
  }
  else {
    res.status(404).json({})
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
