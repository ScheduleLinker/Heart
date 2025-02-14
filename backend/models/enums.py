from enum import Enum


class Status(Enum):
    Success = "Success"
    Error = "Error"


class IcsUploadMessages(Enum):
    TooLarge = (
        "Your file size exceeds our 5 MB limit. Please try uploading a different file."
    )
    NotAIcs = "Invalid file type. Only ICS files are allowed."
    IcsUploadSuccess = "Ics file uploaded successfully."
