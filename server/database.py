import sqlite3


# Class that creates and controls the database
class Database:

    def __init__(self):
        self.conn = sqlite3.connect('cs500.db')
        self.cur = self.conn.cursor()

        self.create_all_tables()

    # Closes database connection
    def close(self):
        self.conn.close()

    def create_all_tables(self):
        self.create_users_table()

    def create_users_table(self):
        self.cur.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY,
                email TEXT NOT NULL,
                username TEXT NOT NULL,
                password TEXT NOT NULL,
                phone CHAR(10),
                user_type TEXT NOT NULL
            )
        ''')

    def create_user(self, email, username, password, user_type, phone=""):
        self.cur.execute('''
            INSERT INTO users (email, username, password, phone, user_type) 
            VALUES (?, ?, ?, ?, ?)
        ''', (email, username, password, phone, user_type))

    # Checks to see if a user exists with conditions
    def user_exists(self, email="", username="", password="", phone="", user_type="", user_id=""):
        query = "SELECT * FROM users WHERE "
        conditions = []
        values = []

        if email:
            conditions.append("email = ?")
            values.append(email)
        if username:
            conditions.append("username = ?")
            values.append(username)
        if password:
            conditions.append("password = ?")
            values.append(password)
        if phone:
            conditions.append("phone = ?")
            values.append(phone)
        if user_type:
            conditions.append("user_type = ?")
            values.append(user_type)
        if user_id:
            conditions.append("id = ?")
            values.append(user_id)

        # Return false if no parameters selected
        if not conditions:
            return False

        # Join conditions with 'AND'
        query += " AND ".join(conditions)

        # Execute query
        self.cur.execute(query, tuple(values))
        user = self.cur.fetchone()

        # Return True if user exists, otherwise False
        return user is not None



