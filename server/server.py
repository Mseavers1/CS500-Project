import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import Database
from models.email_model import EmailSend
from models.recovery_email_model import RecoveryEmail
from models.recovery_verify import RecoveryVerify

from models.user_create_model import UserCreate
from models.user_exists_model import UserExists
from models.user_login_model import UserLogin
from models.user_register_model import UserRegister

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

import secrets
import string


def generate_code(length: int = 5) -> str:
    characters = string.ascii_letters + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))


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

        @self.app.post("/api/users/register/")
        async def user_register(user: UserRegister):

            # Check if parameters are empty
            if not ([user.email, user.username, user.password, user.user_type]):
                raise HTTPException(status_code=400, detail="All fields must not be left blank except phone number.")

            if user.phone == "":
                user.phone = None

            msg = await self.database.add_user(user.email, user.username, user.password, user.phone, user.user_type)

            if "message" in msg:
                return msg

            # If there’s an unexpected failure
            raise HTTPException(status_code=500, detail="An unexpected error occurred during registration.")

        @self.app.post("/api/users/")
        async def user_exist_post(user: UserExists):

            # Check if parameters are empty
            if not any([user.user_id, user.email, user.username, user.phone]):
                raise HTTPException(status_code=400, detail="At least one field must be provided")

            # Attempt to look up user
            user = await self.database.get_user(user_id=user.user_id, email=user.email, phone=user.phone,
                                                username=user.username)

            if user is not None:
                return {"found_user": True}

            return {"founder_user": False}

        @self.app.post("/api/recovery/verify")
        async def verify_recovery_code(code: RecoveryVerify):

            # Check if code is provided
            if not code.code:
                raise HTTPException(status_code=400, detail="A code must be provided.")

            # Check if user identification is empty
            if not any[code.email, code.username, code.phone]:
                raise HTTPException(status_code=400, detail="Username, phone, or email must be provided.")

            # Get user
            user = await self.database.get_user(email=code.email, username=code.username, phone=code.phone)

            result = await self.database.validate_recovery_code(user, code.code)

            print(result)

        @self.app.post("/api/recovery/email")
        async def send_recovery_email(email: RecoveryEmail):

            # Check if parameters are empty
            if not ([email.emailTo, email.recoveryType]):
                raise HTTPException(status_code=400, detail="All fields must be provided")

            em = os.getenv("EMAIL_ADDRESS")

            # Create Email Message
            msg = MIMEMultipart()
            msg["From"] = f"M.A.P <{em}>"
            msg["To"] = email.emailTo
            msg["Subject"] = "Account Recovery"

            code = generate_code(8)

            body = f"""
                <html>
                    <body>
                        <p>Thank you for using our website! Below is your recovery code. Type it exactly into the recovery box on the website for your recovery details.</p>
                        <h2>Code: <b>{code}</b></h2>
                    </body>
                    
                    <footer>
                        <p>Did not request a recovery? We recommend updating your passwords and keep an eye on your account. Do not ever give away your credentials to anyone! </p>
                    </footer>
                </html>
            """

            msg.attach(MIMEText(body, "html"))

            success = False

            try:
                # Connect to SMTP Server
                smtp_server = smtplib.SMTP(os.getenv("SMTP_SERVER"), int(os.getenv("SMTP_PORT")))
                smtp_server.starttls()
                smtp_server.login(em, os.getenv("GMAIL_CODE"))

                # Send Email
                smtp_server.sendmail(em, email.emailTo, msg.as_string())

                # Get user
                user = await self.database.get_user(email=email.emailTo)

                if user:

                    # Save code in database
                    response = await self.database.add_recovery_code(user["user_id"], code, email.recoveryType)

                    # Check if the response contains an error
                    if "error" in response or response is None:
                        raise HTTPException(status_code=500, detail="Failed to save recovery code")
                else:
                    raise HTTPException(status_code=500, detail="Failed to find the user.")

                print("Email sent successfully!")
                success = True
            except Exception as e:
                print(f"Error: {e}")
            finally:
                smtp_server.quit()

            return {"success": success}

        @self.app.post("/api/email/")
        async def send_email(email: EmailSend):

            # Check if parameters are empty
            if not ([email.emailTo, email.subject, email.body]):
                raise HTTPException(status_code=400, detail="All fields must be provided")

            em = os.getenv("EMAIL_ADDRESS")

            # Create Email Message
            msg = MIMEMultipart()
            msg["From"] = f"M.A.P <{em}>"
            msg["To"] = email.emailTo
            msg["Subject"] = email.subject
            msg.attach(MIMEText(email.body, "html"))

            success = False

            try:
                # Connect to SMTP Server
                smtp_server = smtplib.SMTP(os.getenv("SMTP_SERVER"), int(os.getenv("SMTP_PORT")))
                smtp_server.starttls()
                smtp_server.login(em, os.getenv("GMAIL_CODE"))

                # Send Email
                smtp_server.sendmail(em, email.emailTo, msg.as_string())

                print("Email sent successfully!")
                success = True
            except Exception as e:
                print(f"Error: {e}")
            finally:
                smtp_server.quit()

            return {"success": success}

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


# Requires to be outside for FastAPI
server = ServerAPI()
app = server.app
