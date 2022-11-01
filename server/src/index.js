const express = require("express");

// // Importing express-session module
const session = require("express-session")

const path = require("path")

const bodyParser = require("body-parser")
  
// Setting up the server
var app = express()
const router = express.Router();
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

var classrooms = new Map();

var teachers = [];
var students = [];
var classes = [];


app.get("/", (req, res) => {
  res.render('index.html');
});

app.get('/classroom', (req,res)=>{
  let options = {
    maxAge: 1000 * 60 * 15, // would expire after 15 minutes
    httpOnly: true, // The cookie only accessible by the web server
    signed: true // Indicates if the cookie should be signed
  }

  // Set cookie
  
  const cid = Math.floor(Math.random() * (99999 - 10000) + 10000)  
  const tid = Math.floor(Math.random() * (99999 - 10000) + 10000)
    
  res.setHeader('Set-Cookie', ['tempid=' + tid])
  classroom = class Classroom {
    constructor(cid, tid) {
      this.cid = cid;
      this.tid = tid;
      this.sid = []
    }
  }
  classrooms.set(tid, classroom)
  console.log(classrooms)
  teachers.push(tid)
  classes.push(cid)
  res.send("Classroom Created! Classroom ID is: "+ cid)
  // return res.render('classroom.html');
})

app.get("/join", (req, res) => {
  res.render('classroom.html');
});

app.post("/join", (req, res) => {
  console.log(req.body.cid, classes, classes.includes(parseInt(req.body.cid)))
  if(classes.includes(parseInt(req.body.cid))){
    let options = {
      maxAge: 1000 * 60 * 15, // would expire after 15 minutes
      httpOnly: true, // The cookie only accessible by the web server
      signed: true // Indicates if the cookie should be signed
    }
  
    // Set cookie
    
    const sid = Math.floor(Math.random() * (99999 - 10000) + 10000)  
    res.setHeader('Set-Cookie', ['tempid=' + sid])
    // classroom = class Classroom {
    //   constructor(cid, tid) {
    //     this.cid = cid;
    //     this.tid = tid;
    //     this.sid = []
    //   }
    // }
    // classrooms.set(tid, classroom)
    // console.log(classrooms)
    students.push(sid)

    res.send("Entered Classroom: "+ req.body.cid)
  }
  else{
    res.send("Invalid Classroom!")
  }
});
// app.post('/classroom', (req,res)=>{
//   console.log()   
//       if(req.body.tid=="123"){
//         console.log(req.cookies) 

      
//       // console.log(res.cookies.foo)
//     }
//     else{
//       res.send("Not A Teacher!")
//     }
//     // read cookies
    

// })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
