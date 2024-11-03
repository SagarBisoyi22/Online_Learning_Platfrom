Running the Project
====================
To run the project, please follow these steps:

Step-1:
=========
1. Open MySQL Workbench and create a new database by entering your username and password.
2. Set the database name as "online_learning".

 Step-2:
 =========
Create the following 4 tables in the "online_learning" database:

CREATE DATABASE online_learning;

USE online_learning;

CREATE TABLE user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(80) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(200) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    video_url VARCHAR(255),
    pdf_path VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE enrollment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    user_id INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id),
    FOREIGN KEY (user_id) REFERENCES user(id)
);


Step-3:-
=======
1. In VS Code, navigate to the "backend" folder.
2. Inside the "backend" folder, locate the `config` folder, and then open the "db.js" file.
3. Update the username and password fields with your MySQL Workbench credentials.

Step-4:-
=======
1. Open a new terminal by pressing "Ctrl + ~".
2. If you're already in the backend folder path, start the server to connect to the database using:

        ==>npm start
   
3. If you're not in the backend folder path, navigate to it by typing:
   
       :> cd project/OnlineLearningPlatform121/OnlineLearningPlatform123/backend
   
   Then type:

      ==>npm start
   This will connect your code to the database.

Step-5:-
=======
1. Open the "index.html" page located inside the OnlineLearningPlatform folder.
2. Right-click the file and select Open with Live Server.
3. Perform all operations from there. Note: You must be logged in to enroll in any courses.

Step-6:-
=======
1. To access the admin page, manually insert an admin user into the database by running the following query:

   INSERT INTO admin (name, email, password) 
   VALUES ('Sagar Bisoyi', 'sagar123@gmail.com', 'Sagar@123');
 
2. Once inserted, log in using this email(sagar123@gmail.com) and password(Sagar@123) to access the admin page.

Note: Enter the name, email, and password of your choice. In the example, I have inserted my own details, 
but you can replace them with yours. 



I have made the instructions clearer and used consistent phrasing. Let me know if this works for you! or not .
