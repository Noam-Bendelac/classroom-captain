import requests
import unittest

# TODO replace this with actual url
url = ''


class TestClassroomCaptain(unittest.TestCase):
    def test_api_endpoint(self):
        api_url = f'{url}/test'
        session = requests.Session()
        cookies = session.cookies.get_dict()
        data = {key: 'value'}
        response = requests.post(api_url, cookies=cookies, data=data)
        expected_status = 200
        assert response.status == expected_status
        expected_body = {response: 'value', old_cookies: cookies}
        assert response.body == expected_body
        expected_cookies = {my_id: 'value'}
        assert session.cookies.get_dict == expected_cookies

    def classroom_create(self):
        api_url = f'{url}/classrooms'
        response = requests.post(api_url)
        expected_status = 200
        assert response.status == expected_status
        assert len(response.body) == 1
        assert 'classroomCode' in response.body
        classroom_code = response.body['classroomCode']
        assert isinstance(classrooom_code, str)
        session = requests.Session()
        cookies = session.cookies.get_dict()
        assert 'tempId' in cookies
        assert isinstance(cookies['tempId'], str)
        return classroom_code

    def test_classroom_join(self):
        classroom_code = self.classroom_create()
        api_url = f'{url}/classrooms/{classroom_code}/students'
        response = requests.post(api_url)
        expected_status = 200
        assert response.status == expected_status
        exepected_body = {}
        assert response.body == expected_body
        session = requests.Session()
        cookies = session.cookies.get_dict()
        assert 'tempId' in cookies
        assert isinstance(cookies['tempId'], str)

if __name__ == "__main__":
    unittest.main()
