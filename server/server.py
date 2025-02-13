from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import Database

from models.user_create_model import UserCreate
from models.user_exists_model import UserExists
from models.user_login_model import UserLogin


# How to run server, use this in console: uvicorn server:app --reload
class ServerAPI:

    def __init__(self):
        self.app = FastAPI()
        self.setup_cors()
        self.setup_routes()
        self.database = Database()

        @self.app.on_event("startup")
        async def startup():
            await self.database.create_tables()

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

        @self.app.post("/api/users/login/")
        async def user_login(user: UserLogin):

            # Check if parameters are empty
            if not any([user.email, user.username, user.phone]):
                raise HTTPException(status_code=400, detail="At least one field must be provided")

            user = await self.database.validate_login(user.password, user.email, user.username, user.phone)

            if user is not None:
                return {"message": f"Login Successful."}

            return {"message": "Login Failed."}

        @self.app.get("/api/users/")
        async def user_exists(user: UserExists):

            # Check if parameters are empty
            if not any([user.user_id, user.email, user.username, user.phone]):
                raise HTTPException(status_code=400, detail="At least one field must be provided")

            # Attempt to look up user
            user = await self.database.get_user(user_id=user.user_id, email=user.email, phone=user.phone,
                                                username=user.username)

            if user is not None:
                return {"message": f"Found User"}

            return {"message": "User does not exist"}

        @self.app.post("/api/users/")
        async def create_user(user: UserCreate):
            try:
                # Await the asynchronous add_user function
                await self.database.add_user(user.email, user.username, user.password, user.phone, user.user_type)

                return {"message": "User created successfully"}
            except Exception as e:
                raise HTTPException(status_code=500, detail=str(e))


# Requires to be outside for FastAPI
server = ServerAPI()
app = server.app
