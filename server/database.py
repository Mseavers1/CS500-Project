import asyncio
import base64
import os
from datetime import datetime

from dotenv import load_dotenv
from sqlalchemy import and_, distinct
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, joinedload
from cryptography.fernet import Fernet
import bcrypt
from sqlalchemy.future import select
from contextlib import asynccontextmanager

from base import Base
from models.database.user_model_db import UserTable
from models.database.user_recovery_code_model_db import UserRecoveryCode
from models.database.topic_db import TopicTable
from models.database.rule_db import RuleTable
from models.database.question_type_db import QuestionTypeTable
from models.database.question_db import QuestionTable
from models.database.transaction_log_db import TransactionLogTable

load_dotenv()


# PostgreSQL

def hash_data(data: str) -> str:
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(data.encode('utf-8'), salt)
    return hashed.decode('utf-8')


class Database:
    def __init__(self):
        # Get the database URL from the environment
        self.DATABASE_URL = os.getenv("DATABASE_URL")

        # Get & Set Encryption Key
        self.ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
        self.fernet = Fernet(self.ENCRYPTION_KEY)

        # Ensure the DATABASE_URL is not None
        if not self.DATABASE_URL:
            raise ValueError("DATABASE_URL is not set in the environment variables.")

        # Create async engine
        self.engine = create_async_engine(self.DATABASE_URL, echo=True)

        # Create session factory
        self.AsyncSessionLocal = sessionmaker(bind=self.engine, class_=AsyncSession, expire_on_commit=False)

    # Grabs the database for fastapi
    @asynccontextmanager
    async def get_db(self):
        async with self.AsyncSessionLocal() as session:
            yield session

    # Creates all tables that do not exist
    async def create_tables(self):
        async with self.engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

        print("Tables created successfully if they didn't exist!")

    def encrypt_data(self, data: str) -> str:
        encrypted = self.fernet.encrypt(data.encode())
        return base64.b64encode(encrypted).decode('utf-8')

    def decrypt_data(self, data: str) -> str:
        encrypted_bytes = base64.b64decode(data.encode('utf-8'))
        decrypted = self.fernet.decrypt(encrypted_bytes)
        return decrypted.decode('utf-8')

    async def get_all_logged_data(self):

        try:
            async with self.get_db() as session:
                result = await session.execute(
                    select(TransactionLogTable)
                )

                matches = result.scalars().all()

            return {"successful": True, "matches": matches}

        except Exception as e:
            return {"successful": False, "message": str(e)}


    async def log_data(self, user_id, topic_id, question_type_id, timestamp, dif, is_correct, time_taken, attempts,
                       skipped):
        try:
            async with self.get_db() as session:

                data = TransactionLogTable(
                    user_id=user_id,
                    topic_id=topic_id,
                    question_type_id=question_type_id,
                    timestamp=timestamp,
                    difficulty=dif,
                    is_correct=is_correct,
                    time_taken=time_taken,
                    attempts=attempts,
                    skipped=skipped
                )

                session.add(data)
                await session.commit()

            return {"successful": True}

        except Exception as e:
            print(e)
            return {"successful": False, "message": str(e)}

    async def add_topic(self, topic_name: str):

        try:
            async with self.get_db() as session:

                # Check if topic already exists
                result = await session.execute(
                    select(TopicTable).where(TopicTable.topic_name == topic_name)
                )
                existing_topic = result.scalar_one_or_none()

                if existing_topic:
                    return {"successful": False, "message": "Topic already exists"}

                # Add new topic
                new_topic = TopicTable(
                    topic_name=topic_name
                )

                session.add(new_topic)
                await session.commit()
            return {"successful": True}

        except Exception as e:
            return {"successful": False, "message": str(e)}

    async def get_topics(self):
        try:
            async with self.get_db() as session:
                result = await session.execute(select(TopicTable.topic_name))
                topics = result.scalars().all()
                return topics
        except Exception as e:
            print("Error retrieving topics:", e)
            return []

    async def del_topic(self, topic_name: str):
        try:
            async with self.get_db() as session:
                result = await session.execute(
                    select(TopicTable).where(TopicTable.topic_name == topic_name)
                )
                topic = result.scalar_one_or_none()

                if topic:
                    await session.delete(topic)
                    await session.commit()
                    return {"successful": True}
                else:
                    return {"successful": False, "message": "Topic not found"}

        except Exception as e:
            return {"successful": False, "message": str(e)}

    async def get_rules(self, topic_name, type_name):

        try:
            async with self.get_db() as session:

                result = await session.execute(
                    select(QuestionTable)
                    .join(QuestionTable.topic)
                    .join(QuestionTable.question_type)
                    .where(
                        and_(
                            TopicTable.topic_name == topic_name,
                            QuestionTypeTable.type_name == type_name
                        )
                    )
                )

                matches = result.scalars().all()

                rules = [match.rule.to_dict() for match in matches]

                print(f"matches: {rules}, topic_name: {topic_name}, type_name: {type_name}")

            return {"successful": True, "matches": rules}

        except Exception as e:
            return {"successful": False, "message": str(e)}

    async def add_question(self, topic_name: str, type_name: str, rule_id: int):

        try:
            async with self.get_db() as session:

                # Get topic_id
                result = await session.execute(
                    select(TopicTable.topic_id).where(TopicTable.topic_name == topic_name)
                )

                topic_id = result.scalar()
                if topic_id is None:
                    raise ValueError(f"Topic '{topic_name}' not found.")

                # Get type_id
                result = await session.execute(
                    select(QuestionTypeTable.type_id).where(QuestionTypeTable.type_name == type_name)
                )

                type_id = result.scalar()
                if type_id is None:
                    raise ValueError(f"Type '{type_name}' not found.")

                # Check if question already exists
                result = await session.execute(
                    select(QuestionTable).where(
                        and_(
                            QuestionTable.rule_id == rule_id,
                            QuestionTable.question_type_id == type_id,
                            QuestionTable.topic_id == topic_id
                        )
                    )
                )

                existing = result.scalar_one_or_none()

                if existing:
                    return {"successful": False, "message": "Already exists"}

                # Add question
                new_q = QuestionTable(
                    rule_id=rule_id,
                    question_type_id=type_id,
                    topic_id=topic_id
                )

                session.add(new_q)
                await session.commit()
            return {"successful": True}

        except Exception as e:
            return {"successful": False, "message": str(e)}

    async def get_question_types_with_rules(self):
        try:
            async with self.get_db() as session:
                result = await session.execute(
                    select(
                        distinct(QuestionTypeTable.type_name),
                        TopicTable.topic_name
                    )
                    .join(QuestionTable, QuestionTable.question_type_id == QuestionTypeTable.type_id)
                    .join(RuleTable, RuleTable.rule_id == QuestionTable.rule_id)
                    .join(TopicTable, TopicTable.topic_id == QuestionTable.topic_id)
                )

                type_topic_pairs = [{"type_name": row[0], "topic_name": row[1]} for row in result.all()]
                return {"successful": True, "types": type_topic_pairs}

        except Exception as e:
            return {"successful": False, "message": str(e)}

    async def delete_all_rules_by_topic_and_type(self, topic_name: str, type_name: str):
        try:
            async with self.get_db() as session:
                # Step 1: Get all matching QuestionTable entries
                result = await session.execute(
                    select(QuestionTable)
                    .options(joinedload(QuestionTable.rule))  # preload rule relationship
                    .join(TopicTable, QuestionTable.topic_id == TopicTable.topic_id)
                    .join(QuestionTypeTable, QuestionTable.question_type_id == QuestionTypeTable.type_id)
                    .where(
                        and_(
                            TopicTable.topic_name == topic_name,
                            QuestionTypeTable.type_name == type_name
                        )
                    )
                )
                questions_to_delete = result.scalars().all()

                # Collect all associated rule_ids
                rule_ids = {q.rule_id for q in questions_to_delete}

                # Step 2: Delete matching QuestionTable entries
                for question in questions_to_delete:
                    await session.delete(question)

                # Step 3: Check if each rule is still referenced by other topic/type combinations
                for rule_id in rule_ids:
                    # Check if the rule is associated with any other question
                    result = await session.execute(
                        select(QuestionTable).where(QuestionTable.rule_id == rule_id)
                    )
                    still_exists = result.scalar_one_or_none()

                    if not still_exists:
                        # If rule is no longer associated with any questions, delete it from RuleTable
                        rule = await session.get(RuleTable, rule_id)
                        if rule:
                            # Step 4: Check if the rule is associated with any other topic/type combination
                            result = await session.execute(
                                select(QuestionTable)
                                .join(TopicTable, QuestionTable.topic_id == TopicTable.topic_id)
                                .join(QuestionTypeTable, QuestionTable.question_type_id == QuestionTypeTable.type_id)
                                .where(QuestionTable.rule_id == rule_id)
                            )
                            if result.scalar_one_or_none() is None:
                                await session.delete(rule)

                await session.commit()
                return {"successful": True}

        except Exception as e:
            return {"successful": False, "message": str(e)}

    async def del_rule(self, rule_id: int, topic_name: str, type_name: str):
        try:
            async with self.get_db() as session:
                # Get topic and type from names
                topic = await session.scalar(
                    select(TopicTable).where(TopicTable.topic_name == topic_name)
                )

                qtype = await session.scalar(
                    select(QuestionTypeTable).where(QuestionTypeTable.type_name == type_name)
                )

                if not topic or not qtype:
                    return {"successful": False, "message": "Topic or type not found."}

                # Find the QuestionTable row
                question_entry = await session.scalar(
                    select(QuestionTable).where(
                        and_(
                            QuestionTable.topic_id == topic.topic_id,
                            QuestionTable.question_type_id == qtype.type_id,
                            QuestionTable.rule_id == rule_id
                        )
                    )
                )

                if not question_entry:
                    return {"successful": False, "message": "Question entry not found."}

                # Delete the question entry
                await session.delete(question_entry)
                await session.commit()

                # Check if this rule is still used elsewhere
                remaining_refs = await session.execute(
                    select(QuestionTable).where(QuestionTable.rule_id == rule_id)
                )
                remaining = remaining_refs.scalars().all()

                # If none, delete rule
                if not remaining:
                    rule_entry = await session.scalar(
                        select(RuleTable).where(RuleTable.rule_id == rule_id)
                    )
                    if rule_entry:
                        await session.delete(rule_entry)
                        await session.commit()

                return {"successful": True}

        except Exception as e:
            return {"successful": False, "message": str(e)}

    async def add_rule(self, variable: str, rule: str, weight: float, priority: float, cost: float):
        try:
            async with self.get_db() as session:

                # Check if rule already exists
                result = await session.execute(
                    select(RuleTable).where(
                        and_(
                            RuleTable.rule_variable == variable,
                            RuleTable.rule_ruleset == rule
                        )
                    )
                )

                existing = result.scalar_one_or_none()

                if existing:
                    return {"successful": False, "message": "Rule already exists"}

                # Add new rule
                new_rule = RuleTable(
                    rule_variable=variable,
                    rule_ruleset=rule,
                    rule_weight=weight,
                    rule_cost=cost,
                    rule_priority=priority
                )

                session.add(new_rule)
                await session.commit()
            return {"successful": True, "id": new_rule.rule_id}

        except Exception as e:
            return {"successful": False, "message": str(e)}

    async def add_question_types(self, question_type_name: str):

        try:
            async with self.get_db() as session:

                # Check if topic already exists
                result = await session.execute(
                    select(QuestionTypeTable).where(QuestionTypeTable.type_name == question_type_name)
                )
                existing_topic = result.scalar_one_or_none()

                if existing_topic:
                    return {"successful": False, "message": "Question Type already exists"}

                # Add new topic
                new_topic = QuestionTypeTable(
                    type_name=question_type_name
                )

                session.add(new_topic)
                await session.commit()
            return {"successful": True}

        except Exception as e:
            return {"successful": False, "message": str(e)}

    async def get_question_types(self):
        try:
            async with self.get_db() as session:
                result = await session.execute(select(QuestionTypeTable.type_name))
                types = result.scalars().all()
                return types
        except Exception as e:
            print("Error retrieving question types:", e)
            return []

    async def del_question_types(self, question_type_name: str):
        try:
            async with self.get_db() as session:
                result = await session.execute(
                    select(QuestionTypeTable).where(QuestionTypeTable.type_name == question_type_name)
                )
                type_o = result.scalar_one_or_none()

                if type_o:
                    await session.delete(type_o)
                    await session.commit()
                    return {"successful": True}
                else:
                    return {"successful": False, "message": "Topic not found"}

        except Exception as e:
            return {"successful": False, "message": str(e)}

    async def validate_login(self, password: str, email: str = "", username: str = "", phone: str = ""):

        # Get user
        user = await self.get_user(username=username, phone=phone, email=email)

        # If user was not found
        if user is None:
            return None

        if bcrypt.checkpw(password.encode(), user["user_password"].encode()):
            return user
        else:
            return None

    # Gets a user by parameters
    async def get_user(self, user_id: int = -1, email: str = "", phone: str = "", username: str = ""):
        async with self.get_db() as session:
            query = select(UserTable)

            if user_id is not None and user_id > 0:
                query = query.filter(UserTable.id == user_id)

            result = await session.execute(query)
            users = result.scalars().all()  # Fetch all potential matches
            u = None

            for user in users:
                if email and self.decrypt_data(user.user_email) == email:
                    u = user
                if phone is not None:
                    if user.user_phone is None:
                        continue
                    elif self.decrypt_data(user.user_phone) == phone:
                        u = user
                if username and self.decrypt_data(user.user_username) == username:
                    u = user

            if u:
                return {
                    "user_id": user.id,
                    "user_email": self.decrypt_data(user.user_email),
                    "user_username": self.decrypt_data(user.user_username),
                    "user_password": user.user_password,
                    "user_phone": self.decrypt_data(user.user_phone),
                    "user_type": user.user_type
                }

            return None  # No match found

    async def validate_recovery_code(self, user_id: int, code: str):
        hashed_code = hash_data(code)

        try:
            async with self.get_db() as session:
                # Check if the user has a recovery code
                result = await session.execute(select(UserRecoveryCode).where(UserRecoveryCode.user_id == user_id))
                existing_code = result.scalars().first()

                if existing_code:
                    # Check if the code matches
                    if bcrypt.checkpw(hashed_code.encode(), existing_code.code.encode()):

                        # Delete the entry if the code matches
                        await session.delete(existing_code)
                        await session.commit()
                        return {"validate": True}
                    else:
                        return {"error": "Recovery code is incorrect.", "validate": False}
                else:
                    return {"error": "No recovery code found for this user.", "validate": False}

        except SQLAlchemyError as e:
            return {"error": "An unexpected error occurred.", "details": str(e)}

    async def add_recovery_code(self, user_id: int, code: str, recovery_type: str):
        hashed_code = hash_data(code)

        try:
            async with self.get_db() as session:
                # Check if the user already has a recovery code
                result = await session.execute(select(UserRecoveryCode).where(UserRecoveryCode.user_id == user_id))
                existing_code = result.scalars().first()

                if existing_code:
                    # Update existing entry
                    existing_code.code = hashed_code
                    existing_code.recovery_type = recovery_type
                    existing_code.date_generated = datetime.utcnow()
                else:
                    # Create a new entry
                    new_code = UserRecoveryCode(user_id=user_id, code=hashed_code, recovery_type=recovery_type)
                    session.add(new_code)

                await session.commit()
                return {"message": "Recovery Code saved successfully!", "user_id": user_id}

        except SQLAlchemyError as e:
            return {"error": "An unexpected error occurred.", "details": str(e)}

    # Adds a user to the User table
    async def add_user(self, email: str, username: str, password: str, phone: str or None, u_type: str = 'student'):

        # Encrypt data
        email = self.encrypt_data(email)
        username = self.encrypt_data(username)

        if phone is not None:
            phone = self.encrypt_data(phone)

        # Hash data
        password = hash_data(password)

        # Create a new user instance
        new_user = UserTable(
            user_email=email,
            user_username=username,
            user_password=password,
            user_phone=phone,
            user_type=u_type
        )

        try:
            async with self.get_db() as session:
                session.add(new_user)
                await session.commit()
            return {"message": "User created successfully!", "user_id": new_user.id}

        except Exception as e:
            return {"error": "An unexpected error occurred.", "details": str(e)}
