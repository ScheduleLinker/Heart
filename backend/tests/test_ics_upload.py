from fastapi.testclient import TestClient
from backend.ics_upload.ics_upload import ics_router
from backend.models.enums import IcsUploadMessages, Status
from io import BytesIO


"""
Testing ics_upload function
"""

# Create FastAPI test client
client = TestClient(ics_router)

# Sample valid ICS content
VALID_ICS_CONTENT = b"""BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:Test Event
DTSTART:20250401T120000Z
DTEND:20250401T130000Z
END:VEVENT
END:VCALENDAR"""

def test_valid_ics_upload():
    """Test successful ICS file upload."""
    files = {"ics_files": ("event.ics", BytesIO(VALID_ICS_CONTENT), "text/calendar")}
    
    response = client.post("/api/ics-upload", files=files)
    
    assert response.status_code == 200
    json_response = response.json()

    assert isinstance(json_response, list)  # Should return a list of responses
    assert json_response[0]["status"] == Status.Success.value
    assert json_response[0]["message"] == IcsUploadMessages.IcsUploadSuccess.value
    assert "events" in json_response[0]["data"]

#test invalid file types
def test_invalid_file_type():
    """Test rejection of non-ICS file types."""
    files = {"ics_files": ("invalid.txt", BytesIO(b"Not an ICS file"), "text/plain")}
    
    response = client.post("/api/ics-upload", files=files)
    
    assert response.status_code == 200  # FastAPI handles this as a valid request
    json_response = response.json()

    # Access first item in the response list
    assert json_response[0]["status"] == Status.Error.value
    assert json_response[0]["message"] == IcsUploadMessages.NotAIcs.value


#test file size larger than 5MB
def test_large_ics_file():
    """Test rejection of ICS files exceeding 5MB size limit."""
    large_content = b"BEGIN:VCALENDAR\n" + (b"X-DUMMY-DATA:A\n" * (5 * 1024 * 1024)) + b"END:VCALENDAR"
    files = {"ics_files": ("large.ics", BytesIO(large_content), "text/calendar")}
    
    response = client.post("/api/ics-upload", files=files)
    
    assert response.status_code == 200  # FastAPI doesn't return 413, but we handle it
    json_response = response.json()

    # Access first item in the response list
    assert json_response[0]["status"] == Status.Error.value
    assert json_response[0]["message"] == IcsUploadMessages.TooLarge.value



def test_multiple_ics_upload():
    """Test handling multiple valid ICS files in one request."""
    files = [
        ("ics_files", ("event1.ics", BytesIO(VALID_ICS_CONTENT), "text/calendar")),
        ("ics_files", ("event2.ics", BytesIO(VALID_ICS_CONTENT), "text/calendar")),
    ]
    
    response = client.post("/api/ics-upload", files=files)
    
    assert response.status_code == 200
    json_response = response.json()

    assert isinstance(json_response, list)
    assert len(json_response) == 2  # Two files uploaded
    assert all(resp["status"] == Status.Success.value for resp in json_response)