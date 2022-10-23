import requests
import unittest
import sys

url = sys.argv[2]


class TestClassroomCaptain(unittest.TestCase):
    def test_api_endpoint(self):
        api_url = f"{url}/test"
        session = requests.Session()
        cookies = session.cookies.get_dict()
        data = {key: "value"}
        response = requests.post(api_url, cookies=cookies, data=data)
        assert response.status_code == response.codes.ok
        expected_body = {response: "value", old_cookies: cookies}
        assert response.body == expected_body
        expected_cookies = {my_id: "value"}
        assert session.cookies.get_dict() == expected_cookies

    def classroom_create(self):
        api_url = f"{url}/classrooms"
        response = requests.post(api_url)
        assert response.status_code == requests.codes.ok
        assert len(response.body) == 1
        assert "classroomCode" in response.body
        classroom_code = response.body["classroomCode"]
        assert isinstance(classrooom_code, str)
        session = requests.Session()
        cookies = session.cookies.get_dict()
        assert "tempId" in cookies
        assert isinstance(cookies["tempId"], str)
        return classroom_code

    def test_classroom_join_valid_code(self):
        classroom_code = self.classroom_create()
        api_url = f"{url}/classrooms/{classroom_code}/students"
        response = requests.post(api_url)
        assert response.status_code == response.codes.ok
        exepected_body = {}
        assert response.body == expected_body
        session = requests.Session()
        cookies = session.cookies.get_dict()
        assert "tempId" in cookies
        assert isinstance(cookies["tempId"], str)

    def test_classroom_join_invalid_code(self):
        classroom_code = "ThisIsInvalidCode"
        api_url = f"{url}/classrooms/{classroom_code}/students"
        response = requests.post(api_url)
        assert response.status_code == response.codes.not_found
        exepected_body = {}
        assert response.body == expected_body


if __name__ == "__main__":
    unittest.main()
