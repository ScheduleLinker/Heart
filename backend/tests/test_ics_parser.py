from backend.ics_upload.ics_upload_controller import parse_ics
import pytest
import json

def test_parse_ics():
    # Read the mock ICS file
    with open("backend/tests/event.ics", "rb") as f:
        mock_file_content = f.read()

    # Parse the ICS file
    ics_uid, ics_json = parse_ics(mock_file_content)

    # Assertions
    assert ics_uid is not None
    assert ics_json is not None

    # Validate JSON structure
    events = json.loads(ics_json)
    assert isinstance(events, list)
    if events:
        assert "summary" in events[0]
        assert "start" in events[0]
        assert "end" in events[0]

def test_parse_ics_no_events():
    # Test with an empty ICS file
    with pytest.raises(ValueError, match="No events found in ICS file."):
        parse_ics(b"BEGIN:VCALENDAR\nEND:VCALENDAR")

def test_parse_ics_invalid_file():
    # Test with an invalid ICS file
    with pytest.raises(ValueError, match="Error parsing ICS file:"):
        parse_ics(b"Invalid ICS content")