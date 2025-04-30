# MAP - A Math Advancement Platform

## About
This project is for the CS500 class at Western Kentucky University under the direction of Dr. Zhonghang Xia. Currently, most platforms, such as Khan Academy, use question banks. Although their banks are massive, they are missing one key aspect to problem solving, the randomness and unexpectiveness that life brings. There will always be some problem missing,
regardless of its importance. Textbook questions are also limited. Not only is there a limited number of questions, but most of the time, most of the questions don't have any work on how to solve the questions, only the answer, if that. For this reason, auto-generating questions is highly sought after. Questions autogenered allow users to experience infinite possibilities and, if correctly developed, can be customized to fit the user in ways that question banks can not achieve. This project is the development of such a platform, MAP. MAP is a mathematic
question generator that allows students to solve problem sets and scales to the need of the student. The platform also gives students a complete solution with steps. In the future, I would like the project to scan handwritten solutions to analyse students' work and give feedback directly.

## Notice
Some lines of code have been generated using generative AI, mainly Oracle's ChatGPT (GPT 4 Turbo). Any lines that have been generated have been commented as such.

## How to Install
The following are the steps to install our system onto your machine and to run the code. 

1. Download the repository and code.
2. Install the database
     - We created our database onto our own machine rather than using a cloud solution.
     - Download PostgresSQL: https://www.postgresql.org/download/windows/
     - Follow the laucher by creating and setting up your database. Note: there is no special configeration we used but remember the                password you create as you will need it to log into the database.
     - Once installed, in cmd type: psql -U postgres. If installation was successful, you should see 'postgres=#'.
3. Install all python, tpyescript, and react dependencies. If you are using a IDE, this should be easy as it will do this for you or make it    easier to install them.
     - We attempted to make this easier in the requirements.txt file for the python dependencies. By doing 'pip install -r requirements.txt'      you will download all required dependencies. There might be some missing or extra needed for your system.
     - For web dependencies, all can be founded in the package.json file located in the APP folder.
4. Once all dependencies are downloaded, create a .env file. You will need two fields: DATABASE_URL and ENCRYPTION_KEY.
     - DATABASE_URL: postgresql+asyncpg://<username>:<password>@localhost/<database_name>
         - <username>: The username you entered during the creation of the database
         - <password>: The password you entered during the creation of the database
         - <database_name>: The name of your database (I used cs500database)
     - ENCRYPTION_KEY: You can either create your own or use 'kUM0rTRpQ6tl63wSmsKtOhol0qRwa0SnoFiLMw5WmPo='
         - Format:
         - ENCRYPTION_KEY=kUM0rTRpQ6tl63wSmsKtOhol0qRwa0SnoFiLMw5WmPo (no '')
5. Once this is all set, you should be able to run the server. In the terminal of your IDE or cmd, make sure you are in the server folder       and type 'uvicorn server:app --reload;' If done correctly, the console should say the server was started and all tables are generated.
6. In the app folder, run 'npm start' which will start and boot up the webpage.
7. Once the system is setup, you can create a admin by first making an account. Click 'create an account' link under password and follow the    steps. Afterwards, in your database console, follow these steps:
     - SELECT * FROM users; --> Find the id of the newly created user or user you want to make admin
     - UPDATE users SET user_type = 'admin' WHERE user.id = 1 -- Replace 1 with the user id you want to make admin
     - Once you do these steps, when you log into the page, you should see a new admin pannel page.
8. The default system is empty so you will need to manually add rules into the system.
     - As as admin, in the admin panel add 'Algrebra' as a topic, 'Linear Equations' as a subtopic, and select them in the rule generator           (last column). Add the following rules (S is the starting state):
          - S: E=E 1 1 0
          - E: T+E 1 1 1
          - 
