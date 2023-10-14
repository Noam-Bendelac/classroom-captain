const express = require("express")

const https = require('https')
const http = require('http')
const fs = require('fs')
const path = require('path')

const ws = require('ws')

require('dotenv').config()


const bodyParser = require("body-parser")

const cors = require('cors')
  
// Setting up the server
var app = express()

const httpsOptions = process.env.NODE_TLS_CERT_PATH !== undefined && {
  key: fs.readFileSync(path.join(process.env.NODE_TLS_CERT_PATH, 'privkey.pem')),
  cert: fs.readFileSync(path.join(process.env.NODE_TLS_CERT_PATH, 'fullchain.pem')),
}

app.use(cors({
  origin: process.env.NODE_CORS_ORIGINS.split(','),
  // https://stackoverflow.com/questions/43772830/access-control-allow-credentials-header-in-the-response-is-which-must-be-t
  credentials: true,
}))

app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.use(express.json());
const cookieParser = require('cookie-parser'); // in order to read cookie sent from client
const cookie = require('cookie')
// Creating session 
app.use(cookieParser('sanath'));
app.use(bodyParser.urlencoded({
  extended: true
}));


// class definitions of records with jsdoc type definitions for vscode
// autocomplete, and tables and indexes of records:

class Teacher {
  /** @type {string} */
  id = generateId()
  /** @type {ws.WebSocket | null} */
  connection = null
  
  constructor() {
    teachers.set(this.id, this)
  }
}
/** @type {Map<string, Teacher>} */
var teachers = new Map()

class Student {
  /** @type {string} */
  id = generateId()
  /** @type {ws.WebSocket | null} */
  connection = null
  
  constructor() {
    students.set(this.id, this)
  }
}
/** @type {Map<string, Student>} */
var students = new Map();

// Classroom has a dependency on teacher and students, so it manages the indexes
// indexTeacherToClassroom and indexStudentToClassroom
class Classroom {
  /** @type {string} */
  id = generateId()
  /** @type {string} */
  teacherId
  /** @type {string[]} */
  studentIds = []
  
  /** @type {'explorer' | 'captain'} */
  mode = 'explorer'
  /** @type {string} */
  topic = 'magnetism'
  /** @type {[number, number, number]} */
  camera = [1,1,1]
  /** @type {string} */
  func = '0.2(x^2+y^2)'
  /** @type {number} */
  x = 0
  /** @type {number} */
  y = 0
  
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
/** @type {Map<string, Classroom>} */
var classrooms = new Map();


// additional indexes for accessing records from ids
/** @type {Map<string, string>} */
var indexTeacherToClassroom = new Map();
/** @type {Map<string, string>} */
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


// HTTP REST api

app.post('/classrooms', (req,res)=>{
  
  const teacher = new Teacher()
  const classroom = new Classroom(teacher.id)
  
  console.log(classroom)
  
  res.cookie('tempId', teacher.id, {
    sameSite: 'none',
    secure: true,
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
    
    console.log(classroom)
    
    res.cookie('tempId', student.id, {
      sameSite: 'none',
      secure: true,
      maxAge: 1000 * 60 * 60 * 24 // expire after 24 hours
    })
    
    res.status(200).json({})
  }
  else {
    res.status(404).json({})
  }
});

const httpServer = httpsOptions ? https.createServer(httpsOptions, app) : http.createServer(app)
httpServer.listen(process.env.NODE_PORT, () => {
  console.log(`Protocol: ${httpsOptions ? 'https' : 'http'}`)
  console.log(`Classroom Captain app listening on port ${process.env.NODE_PORT}!`);
})


function tryExpr(block) {
  let ret = null
  try {
    ret = block()
  }
  catch {
    // no op
  }
  return ret
}


// websocket api

const wsServer = new ws.WebSocketServer({ server: httpServer })

wsServer.on('connection', (connection, req) => {
  const cookies = cookie.parse(req.headers.cookie || '')
  console.log('connection', cookies)
  
  const teacher = teachers.get(cookies.tempId)
  if (teacher) {
    connection.send(JSON.stringify({ comment: 'you are a teacher' }))
    
    const classroom = classrooms.get(indexTeacherToClassroom.get(teacher.id))
    const echoMessage = (sendText) => {
      classroom.studentIds.forEach(studentId => {
        const student = students.get(studentId)
        if (student.connection) {
          student.connection.send(sendText)
        }
      })
    }
    connection.on('message', (data, isBinary) => {
      if (!isBinary) {
        const text = data.toString()
        console.log(text)
        /** @type Record<string, any> | null */
        const message = tryExpr(() => JSON.parse(text))
        
        if (message.mode && (message.mode === 'captain' || message.mode === 'explorer')) {
          classroom.mode = message.mode
          // send entire current state of classroom
          if (classroom.mode === 'captain') {
            echoMessage(JSON.stringify({
              mode: classroom.mode,
              topic: classroom.topic,
              camera: classroom.camera,
              func: classroom.func,
              x: classroom.x,
              y: classroom.y,
            }))
          } else {
            // switch back to explorer
            echoMessage(text)
          }
        } else if (message.topic) {
          classroom.topic = message.topic
          if (classroom.mode === 'captain') {
            echoMessage(text)
          }
        } else if (message.camera) {
          classroom.camera = message.camera
          if (classroom.mode === 'captain') {
            echoMessage(text)
          }
        } else if (message.func) {
          classroom.func = message.func
          if (classroom.mode === 'captain') {
            echoMessage(text)
          }
        } else if (message.x) {
          classroom.x = message.x
          if (classroom.mode === 'captain') {
            echoMessage(text)
          }
        } else if (message.y) {
          classroom.y = message.y
          if (classroom.mode === 'captain') {
            echoMessage(text)
          }
        }
      }
    })
  }
  else {
    const student = students.get(cookies.tempId)
    if (student) {
      connection.send(JSON.stringify({ comment: 'you are a student' }))
      // allow teacher's message handler to echo messages to this student
      // connection by storing it on the student object
      student.connection = connection
    }
    else {
      // unauthenticated user
      connection.terminate()
    }
  }
})

