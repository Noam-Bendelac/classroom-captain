import websocket
import requests
import unittest
import sys


class TestClassroomCaptain(unittest.TestCase):
    api_url = "https://www.google.com"
    websocket_url = "ws://echo.websocket.events"

    def test_api_endpoint(self):
        api_url = f"{self.api_url}/test"
        session = requests.Session()
        cookies = session.cookies.get_dict()
        data = {"key": "value"}
        response = requests.post(api_url, cookies=cookies, data=data)
        self.assertEqual(response.status_code, requests.codes.ok)
        expected_body = {"response": "value", "old_cookies": cookies}
        self.assertEqual(response.json(), expected_body)
        expected_cookies = {"my_id": "value"}
        self.assertEqual(session.cookies.get_dict(), expected_cookies)
        session.close()

    def classroom_create(self):
        api_url = f"{self.api_url}/classrooms"
        teacher_session = requests.Session()
        response = teacher_session.post(api_url)
        self.assertEqual(response.status_code, requests.codes.created)
        self.assertEqual(len(response.json()), 1)
        self.assertTrue("classroomCode" in response.json())
        classroom_code = response.json()["classroomCode"]
        self.assertIsInstance(classroom_code, str)
        cookies = teacher_session.cookies.get_dict()
        self.assertTrue("tempId" in cookies)
        self.assertIsInstance(cookies["tempId"], str)
        return (classroom_code, teacher_session)

    def test_classroom_join_valid_code(self):
        classroom_code, teacher_session = self.classroom_create()
        api_url = f"{self.api_url}/classrooms/{classroom_code}/students"
        student_session = requests.Session()
        response = student_session.post(api_url)
        self.assertEqual(response.status_code, requests.codes.ok)
        expected_body = {}
        self.assertEqual(response.json(), expected_body)
        cookies = student_session.cookies.get_dict()
        self.assertTrue("tempId" in cookies)
        self.assertIsInstance(cookies["tempId"], str)
        teacher_session.close()
        student_session.close()

    def test_classroom_join_invalid_code(self):
        classroom_code = "ThisIsInvalidCode"
        api_url = f"{self.api_url}/classrooms/{classroom_code}/students"
        response = requests.post(api_url)
        self.assertEqual(response.status_code, requests.codes.not_found)
        expected_body = {}
        self.assertEqual(response.json(), expected_body)

    def test_websocket_functionality(self):
        # TODO this will need some work after corresponding api is implemented
        classroom_code, teacher_session = self.classroom_create()
        student_api_url = f"{self.api_url}/classrooms/{classroom_code}/students"
        student_session = requests.Session()
        _ = student_session.post(student_api_url)
        teacher_temp_id = teacher_session.cookies.get_dict()["tempId"]
        student_temp_id = student_session.cookies.get_dict()["tempId"]
        teacher_websocket = websocket.create_connection(
            self.websocket_url, cookie=teacher_temp_id
        )
        student_websocket = websocket.create_connection(
            self.websocket_url, cookie=student_temp_id
        )
        teacher_send_message = "test message"
        teacher_websocket.send(teacher_send_message)
        student_recv_message = student_websocket.recv()
        self.assertEqual(student_recv_message, teacher_send_message)
        teacher_session.close()
        student_session.close()
        teacher_websocket.close()
        student_websocket.close()


if __name__ == "__main__":
    unittest.main()
