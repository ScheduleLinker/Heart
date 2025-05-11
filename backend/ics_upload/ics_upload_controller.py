from pydantic import BaseModel
from backend.models.enums import *
from icalendar import Calendar
from typing import Optional, List, Tuple
from backend.models.temp_storage import TempStorage
from io import BytesIO
import json

"""
This file defines the FastAPI router and endpoint for handling ICS file uploads.
"""

class UploadResponse(BaseModel):
    uid: str
    message: str
    status: str
    data: dict


class EventDetails(BaseModel):
    summary: str
    description: Optional[dict] = None
    start: str
    end: str
    location: Optional[str] = None
    recurrence: Optional[dict] = None

# Function to parse the ICS file
def parse_ics(file_content: bytes) -> Tuple[str, dict]:
    from icalendar import Calendar
    import uuid
    from datetime import datetime

    print("parse_ics() called")
    print(f"First 100 bytes of file: {file_content[:100]}")

    try:
        calendar = Calendar.from_ical(file_content)
        events = []

        print("Parsing calendar components")

        for component in calendar.walk():
            print("Component name:", component.name)
            if component.name == "VEVENT":
                print("Found VEVENT")
                summary = str(component.get("SUMMARY"))
                start = component.get("DTSTART").dt
                end = component.get("DTEND").dt

                print("Summary:", summary)
                print("Start:", start)
                print("End:", end)

                events.append({
                    "summary": summary,
                    "start": start.isoformat() if isinstance(start, datetime) else str(start),
                    "end": end.isoformat() if isinstance(end, datetime) else str(end)
                })

        if not events:
            print("No events found")
            return "", {"error": "No events found in ICS file."}

        return str(uuid.uuid4()), {"events": events}

    except Exception as e:
        print("Error parsing ICS:", str(e))
        return "", {"error": f"Error parsing ICS file: {str(e)}"}
    

def parse_description(description_str: str) -> dict:
    """
    Parses the DESCRIPTION field and converts it into a dictionary.
    Expected format: "Key1: Value1\nKey2: Value2\nKey3: Value3"
    """
    description_dict = {}
    lines = description_str.strip().split("\n")

    for line in lines:
        if ": " in line:  # Ensure valid key-value format
            key, value = line.split(": ", 1)  # Split only on first ": "
            description_dict[key.strip()] = value.strip()

    return description_dict

def parse_recurrence(recurrence_str: str) -> dict:
    """
    Parses the RRUle field and coverts it into a dictionary
    Expected format: "FREQ=WEEKLY;BYDAY=MO,WE;UNTIL=20251231T235959Z"
    """
    recurrence_dict = {}
    
    # Ensure there's an actual recurrence rule
    if not recurrence_str.strip():
        return recurrence_dict
    
    # Split RRULE into key-value pairs
    parts = recurrence_str.strip().split(";")
    for part in parts:
        if "=" in part:
            key, value = part.split("=", 1)  # Split only at the first "="
            recurrence_dict[key.strip()] = value.strip()

    return recurrence_dict
