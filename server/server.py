from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import Database

from models.user_create_model import UserCreate
from models.user_exists_model import UserExists


# How to run server, use this in console: uvicorn server:app --reload
class ServerAPI:

    def __init__(self):
        self.app = FastAPI()
        self.setup_cors()
        self.setup_routes()
        self.database = Database()

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

        @self.app.get("/api/users/")
        def user_exists(user: UserExists):

            if not any([user.user_id, user.email, user.username, user.password, user.phone, user.user_type]):
                raise HTTPException(status_code=400, detail="At least one field must be provided")

            return {"exists": self.database.user_exists(user.email, user.username, user.password, user.phone,
                                                        user.user_type, user.user_id)}

        @self.app.post("/api/users/")
        def create_user(user: UserCreate):
            try:
                self.database.create_user(user.email, user.username, user.password, user.user_type, user.phone)

                return {"message": "User created successfully"}
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))


# Requires to be outside for FastAPI
server = ServerAPI()
app = server.app
