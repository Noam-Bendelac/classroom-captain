import requests
import unittest
import sys

url = sys.argv[2]


class TestClassroomCaptain(unittest.TestCase):
    def test_api_endpoint(self):
        api_url = f"{url}/test"
        # TODO this will need some work when the /test endpoint is implemented
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
        api_url = f"{url}/classrooms"
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
        teacher_session.close()
        return classroom_code

    def test_classroom_join_valid_code(self):
        classroom_code = self.classroom_create()
        api_url = f"{url}/classrooms/{classroom_code}/students"
        student_session = requests.Session()
        response = student_session.post(api_url)
        self.assertEqual(response.status_code, requests.codes.ok)
        expected_body = {}
        self.assertEqual(response.json(), expected_body)
        cookies = student_session.cookies.get_dict()
        self.assertTrue("tempId" in cookies)
        self.assertIsInstance(cookies["tempId"], str)
        student_session.close()

    def test_classroom_join_invalid_code(self):
        classroom_code = "ThisIsInvalidCode"
        api_url = f"{url}/classrooms/{classroom_code}/students"
        response = requests.post(api_url)
        self.assertEqual(response.status_code, requests.codes.not_found)
        expected_body = {}
        self.assertEqual(response.json(), expected_body)


if __name__ == "__main__":
    unittest.main()
