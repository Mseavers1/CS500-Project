from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


# How to run server, use this in console: uvicorn server:app --reload
class ServerAPI:

    def __init__(self):
        self.app = FastAPI()
        self.setup_cors()
        self.setup_routes()

    # CORES
    def setup_cors(self):
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["http://localhost:3000"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    # Routes
    def setup_routes(self):
        @self.app.get("/")
        def read_root():
            return {"message": "Hello from FastAPI!"}

        @self.app.get("/api/data")
        def get_data():
            return {"data": "This is data from the backend"}


# Requires to be outside for FastAPI
server = ServerAPI()
app = server.app
