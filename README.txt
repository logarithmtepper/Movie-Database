Students: Thomas Soubliere 101144900, Wenyu Zhang 100941511
Project: Movie Database

Running instructions (type these commands in cmd):
	node database-generator
	node server

Most movies on IMDB are already in the database. Here are some new release urls to test the web scraper:
https://www.imdb.com/title/tt10833270/?pf_rd_m=A2FGELUUNOQJNL&pf_rd_p=&pf_rd_r=15FRR1SVS705V6XMRVPV&pf_rd_s=center-3&pf_rd_t=60601&pf_rd_i=&ref_=il_tl_li_tt
https://www.imdb.com/title/tt10054316/?pf_rd_m=A2FGELUUNOQJNL&pf_rd_p=&pf_rd_r=15FRR1SVS705V6XMRVPV&pf_rd_s=center-3&pf_rd_t=60601&pf_rd_i=&ref_=il_tl_li_tt
https://www.imdb.com/title/tt4353270/?pf_rd_m=A2FGELUUNOQJNL&pf_rd_p=&pf_rd_r=15FRR1SVS705V6XMRVPV&pf_rd_s=center-3&pf_rd_t=60601&pf_rd_i=&ref_=il_tl_li_tt


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
