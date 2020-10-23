Students: Thomas Soubliere 101144900, Wenyu Zhang 100941511
Project: Movie Database

Running instructions:
    requires node and pug
    $ npm install pug express body-parser   //to install node modules
    $ npm run start  //should start the server on localhost port 3000

functionality:
    user login: localhost:3000/users/login
    user register: localhost:3000/users/register
    one can create an account, then sign in, a home page will be redrirected

Files:
    js files:
        server.js - file to start node.js server
        server-model.js - js for functionality of pages
        /routes/users.js    - js for users login

    pug files:
        addMovie.pug - page where new movie data will be entered
        addPerson.pug - page where new person data will be entered
        forgotPassword.pug - page where user will recover password using username
        home.pug - home page where movie list will be displayed
        homeStyle.css - css style for addPerson.pug
        login.pug - user login page
        movieView.pug - page displaying info of selected movie
        personView.pug - page displaying info of selected person
        server.js - file to start node.js server
        server-model.js - js for functionality of pages
        register.pug - page where new users will be created
        userProfile.pug - page for viewing/editing profile of the current user (logged in)
        userView.pug - page displaying info of a selected user

    json files:
        users.json
        people.json
        reviews.json
        movie.json
        movie-data.json
        movie-data-short.json
