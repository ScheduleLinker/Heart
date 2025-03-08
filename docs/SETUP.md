# Manual Start:
## How To Initialize And Run The FastAPI Endpoints

1. First you will need to initialize a local python environment in the root directory of the project. Run `python3 -m venv venv` while
   in <b>Heart</b> folder.
2. After initializing the virtual environment, it should create a folder in your directory called <b>venv</b>.
3. Next, if the virtual environment did not activate for you, run `source venv/bin/activate`.
4. In your cli, you should see <b>(venv)</b> at the beginning of the prompt.
5. Then, run `pip install -r requirements.txt`. This will install all the packages necessary to run the project.
6. To run the API, in your console type in `fastapi dev backend/app.py`. This should enable the FastAPI endpoints on port 8000. To see the swagger with all the explanation head to <b>localhost:8000/docs</b>.
### EndPoint:
- **Response 200 OK format**: 
```
{
  "uid": "string",
  "message": "string",
  "status": "string",
  "data": {}
}
```

- A local `storage.json` file is generated to store the parsed contents

![Screenshot from 2025-02-28 21-54-03](https://github.com/user-attachments/assets/31c26de6-e156-4e25-8057-efe9bc03fcf8)

- Result(200 Ok)-`/api/ics-upload`:
```
{
  "uid": "44ae5f88-520c-436b-8f64-3bd9b2fb1fa6",
  "message": "Ics file uploaded successfully.",
  "status": "Success",
  "data": {
    "events": [
      {
        "summary": "Oral Presentations COM 312 108",
        "description": {
          "CRN": "11827",
          "Credit Hours": "3.0",
          "Level": "Undergraduate",
          "Instructor": "Raufova, Nigora (Primary)"
        },
        "start": "2023-01-19T18:00:00-05:00",
        "end": "2023-01-19T20:50:00-05:00",
        "location": "Campus: Newark Building: Central King Building Room: 214"
      },
      {
        "summary": "Roadmap to Computing CS 100 012",
        "description": {
          "CRN": "11872",
          "Credit Hours": "3.0",
          "Level": "Undergraduate",
          "Instructor": "Islam, Akm Z (Primary)"
        },
        "start": "2023-01-18T13:00:00-05:00",
        "end": "2023-01-18T14:20:00-05:00",
        "location": "Campus: Newark Building: Central King Building Room: 212"
      },
      {
        "summary": "Scripting for System Administration IT 240 002",
        "description": {
          "CRN": "14057",
          "Credit Hours": "3.0",
          "Level": "Undergraduate",
          "Instructor": "Vohra, Rosemina A. (Primary)"
        },
        "start": "2023-01-18T10:00:00-05:00",
        "end": "2023-01-18T11:20:00-05:00",
        "location": "Campus: Newark Building: Kupfrian Hall Room: 106"
      },
      {
        "summary": "Computing &amp; Effective Com YWCC 207 022",
        "description": {
          "CRN": "15662",
          "Credit Hours": "1.0",
          "Level": "Undergraduate",
          "Instructor": "McCormick, Shanna A. (Primary)"
        },
        "start": "2023-01-19T11:30:00-05:00",
        "end": "2023-01-19T12:50:00-05:00",
        "location": "Campus: Newark Building: Central King Building Room: 206"
      }
    ]
  }
}
```

