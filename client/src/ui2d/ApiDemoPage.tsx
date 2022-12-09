import { useState } from 'react'


const timed = (func: () => void) => () => {
  setTimeout(func, 120)
}

export function ApiDemoPage() {
  // const [createClassroomResp, setCreateClassroomResp] = useState<{body: string, cookie: string} | null>(null)
  const [teacherReq1Sent, setTeacherReq1Sent] = useState(false)
  const [teacherReq2Sent, setTeacherReq2Sent] = useState(false)
  const [studentReq1Sent, setStudentReq1Sent] = useState(false)
  const [studentReq2Sent, setStudentReq2Sent] = useState(false)
  const [messages, setMessages] = useState<string[]>([])
  
  return <div style={{ font: 'var(--cabin-24)', padding: '30px', display: 'flex', gap: '130px' }}>
    <style>{`
      button {
        background: lightgray;
        border: 1px solid black;
        margin: 5px;
      }
      button:active {
        background: darkgray;
      }
    `}</style>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h1>Teacher</h1>
      
      <div>
        Create classroom<br />
        <button onClick={timed(() => { setTeacherReq1Sent(true) })}>POST /classrooms</button><br />
        
        { teacherReq1Sent && <>
          Request: <br />
          body: {'{ }'}<br />
          Response:<br />
          body: {'{ classroomCode: "72843" }'}<br/>
          cookie: tempId=19218
        </>
        }
      </div>
      
      <div>
        Create websocket connection<br />
        <button onClick={timed(() => { setTeacherReq2Sent(true) })}>ws:// GET /</button><br />
        
        { teacherReq2Sent && <>
          Request: <br/>
          body: {'{ }'}<br />
          cookie: tempId={ teacherReq1Sent ? '19218' : ''}
          {/* Response:<br />
          body: {'{ classroomCode: "72843" }'}<br/>
          cookie: tempId=19218 */}
        </>
        }
      </div>
      
      <div>
        Send websocket message<br />
        <button onClick={timed(() => { setMessages(m => [...m, '{ "mode": "captain" }']) })}>{'{ "mode": "captain" }'}</button><br />
        <button onClick={timed(() => { setMessages(m => [...m, '{ "topic": "multivar" }']) })}>{'{ "topic": "multivar" }'}</button><br />
        <button onClick={timed(() => { setMessages(m => [...m, '{ "camera": [5, 4, 3] }']) })}>{'{ "camera": [5, 4, 3] }'}</button><br />
        <button onClick={timed(() => { setMessages(m => [...m, '{ "func": "0.2(x^2+y^2)" }']) })}>{'{ "func": "0.2(x^2+y^2)" }'}</button><br />
        <button onClick={timed(() => { setMessages(m => [...m, '{ "x": "4.3" }']) })}>{'{ "x": "4.3" }'}</button><br />
        <button onClick={timed(() => { setMessages(m => [...m, '{ "y": "1.2" }']) })}>{'{ "y": "1.2" }'}</button><br />
        
        {/*  */}
      </div>
      
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h1>Student</h1>
      
      <div>
        Join classroom<br />
        <button onClick={timed(() => { setStudentReq1Sent(true) })}>POST /classrooms/{teacherReq1Sent ? '72843' : ':code'}/students</button><br />
        
        { studentReq1Sent && <>
          Request: <br />
          body: {'{ }'}<br />
          Response:<br />
          body: {'{ }'}<br/>
          cookie: tempId=57826
        </>
        }
      </div>
      
      <div>
        Create websocket connection<br />
        <button onClick={timed(() => { setStudentReq2Sent(true) })}>ws:// GET /</button><br />
        
        { studentReq2Sent && <>
          Request: <br/>
          body: {'{ }'}<br />
          cookie: tempId={ studentReq1Sent ? '57826' : ''}
          
        </>
        }
      </div>
      
      <div>
        Received websocket messages<br />
        {messages.map(m => <>{m}<br/></>)}
        
        {/*  */}
      </div>
      
    </div>
  </div>
}