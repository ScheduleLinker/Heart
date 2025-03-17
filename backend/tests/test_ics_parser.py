import pytest
from backend.ics_upload.ics_upload_controller import parse_ics
from pathlib import Path

#ICS file path
TEST_ICS_FILE = Path("backend/tests/event.ics")

#using the test ics file "event.ics"
@pytest.fixture
def ics_content():
    """FIxture to read the dummy ICS file for testing"""
    with open(TEST_ICS_FILE, "rb") as file: #Open the ics file in binary mode
        return file.read()

def test_ics_parse(ics_content):
    """Test the parse_ics function with a sample ICS file"""
    ics_uid, parsed_data = parse_ics(ics_content)

    #Ensure the UID is not empty
    assert isinstance(ics_uid, str)
    assert ics_uid != ""

    #Ensure events exist in the parsed data
    assert "events" in parsed_data
    assert isinstance(parsed_data["events"], list)
    assert len(parsed_data["events"]) > 0 #At least one event must be present

    #Validate an event structure
    first_event = parsed_data["events"][0]
    assert "summary" in first_event
    assert "description" in first_event
    assert "start" in first_event
    assert "end" in first_event
    assert "location" in first_event
    assert "recurrence" in first_event
    assert isinstance(first_event["summary"], str)
    assert isinstance(first_event["description"], dict)
    assert isinstance(first_event["start"], str)
    assert isinstance(first_event["end"], str)
    assert isinstance(first_event["location"], str)
    assert first_event["recurrence"] is None or isinstance(first_event["recurrence"], dict) #Either None or dict
