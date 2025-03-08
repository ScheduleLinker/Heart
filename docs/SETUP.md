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
- Response 200: 
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

