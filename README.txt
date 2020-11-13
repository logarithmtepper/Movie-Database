Students: Thomas Soubliere 101144900, Wenyu Zhang 100941511
Project: Movie Database

Running instructions:
    requires node and pug
    $ npm install       //to install node modules
    $ npm run start     //should start the server on localhost port 3000

functionality:
    user login: localhost:3000/users/login
    user register: localhost:3000/users/register
    one can create an account, then sign in, a home page will be redrirected
    one can follow/unfollow any user on the user page
    movie in the database will be listed
    one can add and edit selected movie, if they are contributing user
    
Files:
    js files:
        server.js - file to start node.js server
        database-generator.js   -file to generate database
        /routes
            users.js        - js for users login
            movies.js       - js for displaying movies
            people.js       - js for showing people 
            reviews.js      - js for showing reviews
        /models
            users.js        - js for users login
            movies.js       - js for displaying movies
            people.js       - js for showing people 
            reviews.js      - js for showing reviews


    pug files:
        views\pages\addMovie.pug        - page where new movie data will be entered
        views\pages\addPerson.pug       - page where new person data will be entered
        views\pages\editMovie.pug       - edit movie
        views\pages\followedView.pug    
        views\pages\forgotPassword.pug  - page where user will recover password using username
        views\pages\home.pug            - home page where movie list will be displayed
        views\pages\login.pug           - user login page
        views\pages\movieList.pug       
        views\pages\movieView.pug       - page displaying info of selected movie
        views\pages\personList.pug      
        views\pages\personView.pug      - page displaying info of selected person
        views\pages\register.pug        - page where new users will be created
        views\pages\userList.pug        
        views\pages\userProfile.pug     - page for viewing/editing profile of the current user (logged in)
        views\pages\userView.pug        - page displaying info of a selected user

    json files:
        people.json
        movie-data.json
        movie-data-short.json
