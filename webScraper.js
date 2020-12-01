const fetch = require("node-fetch");

fetchMovieInfo("https://www.imdb.com/title/tt0443453/?ref_=fn_al_tt_1");
fetchMovieInfo("https://www.imdb.com/title/tt1345836/?ref_=fn_ft_tt_5");
fetchMovieInfo("https://www.imdb.com/title/tt0145487/?ref_=fn_al_tt_1");

function fetchMovieInfo(url){
  fetch(url)
    .then(res => res.text())
    .then(rawHtml => {

      movie = {}

      // Disgusting regex to find movie title
      try{
        let rawMovieTitle = rawHtml.match('(<div\\sclass="title_wrapper">\\n.+&nbsp;)')[0]
        rawMovieTitle = rawMovieTitle.substring(27, rawMovieTitle.length);
        let movieTitleStart = rawMovieTitle.match('(>)')['index'];
        let movieTitle = rawMovieTitle.substring(movieTitleStart+1, rawMovieTitle.length-6);
        movie.movieTitle = movieTitle;

        // Unset & delete
        rawMovieTitle, movieTitleStart, movieTitle = undefined;
        delete(rawMovieTitle, movieTitleStart, movieTitle);

      }catch {
        movie.movieTitle = "N/A";
      };

      // Disgusting regex to find movie release year
      try{
        let rawMovieYear = rawHtml.match('(<span\\sid="titleYear">)')['index'];
        let movieYear = rawHtml.substring(rawMovieYear+60, rawMovieYear+64);
        movie.movieYear = movieYear;

        // Unset & delete
        rawMovieYear, movieYear = undefined;
        delete(rawMovieYear, movieYear);

      }catch {
        movie.movieYear = "N/A";
      };

      // Disgusting regex to find age rated
      try{
        let rawMovieAge = rawHtml.match('(<time\\sdatetime="PT)')['index'];
        let movieAge = rawHtml.substring(rawMovieAge-150, rawMovieAge-53);
        let movieAgeStart = movieAge.match('(\\s{20}.{1,10})')['index'];
        movieAge = movieAge.substring(movieAgeStart+21, movieAge.length);
        movie.movieAge = movieAge;

        // Unset & delete
        rawMovieAge, movieAge, movieAgeStart = undefined;
        delete(rawMovieAge, movieAge, movieAgeStart);

      }catch {
        movie.movieAge = "N/A";
      }

      // Disgusting regex to find runtime
      try{
        let rawMovieRuntime = rawHtml.match('([0-9]min)')['index'];
        let movieRuntimeStart = rawHtml.substring(rawMovieRuntime-50, rawMovieRuntime+20).match('(\\s{24})')['index'];
        let movieRuntime = rawHtml.substring(rawMovieRuntime-25+movieRuntimeStart, rawMovieRuntime+4);
        movie.movieRuntime = movieRuntime;

        // Unset & delete
        rawMovieRuntime, movieRuntimeStart, movieRuntime = undefined;
        delete(rawMovieRuntime, movieRuntimeStart, movieRuntime);

      }catch {
        movie.movieRuntime = "N/A";
      }

      // Disgusting regex to find genre
      try{
        let movieGenres = [];
        let rawMovieGenres = rawHtml.matchAll('(\\/search\\/title\\?genres[^&]+&)');
        for(const genre of rawMovieGenres){
          movieGenreEnd = rawHtml.substring(genre['index'], genre['index']+40).match('(&)');
          movieGenres.push(rawHtml.substring(genre['index']+21, genre['index']+movieGenreEnd['index']));
        };
        movieGenres = movieGenres.splice(0, Math.floor(movieGenres.length / 2));
        movie.movieGenre = movieGenres;

        // Unset & delete
        movieGenres, rawMovieGenres, movieGenreEnd = undefined;
        delete(movieGenres, rawMovieGenres, movieGenreEnd);

      }catch {
        movie.movieGenre = "N/A";
      }

      // Disgusting regex to find director
      try{
        let rawMovieDirector = rawHtml.match('"inline">Director')['index'];
        let movieDirectorEnd = rawHtml.substring(rawMovieDirector, rawMovieDirector+150).match('<\\/a>')['index'];
        movie.movieDirector = rawHtml.substring(rawMovieDirector+66, rawMovieDirector+movieDirectorEnd);

        // Unset & delete
        rawMovieDirector, movieDirectorEnd = undefined;
        delete(rawMovieDirector, movieDirectorEnd);

      }catch {
        movie.movieDirector = "N/A";
      }

      // Disgusting regex to find writers
      try{
        let movieWriters = [];
        let movieWritersStart = rawHtml.match('(Writers)')['index'];
        let movieWritersEnd = rawHtml.substring(movieWritersStart, movieWritersStart+200).match('(ghost)')['index'];
        let people = rawHtml.substring(movieWritersStart, movieWritersStart+movieWritersEnd);
        people = people.matchAll('(tt_ov_wr"\\n>[^<]+)');
        for(const person of people){
          movieWriters.push(person[0].substring(11, person[0].length));
        };
        movie.movieWriters = movieWriters;

        // Unset & delete
        movieWriters, movieWritersStart, movieWritersEnd, people = undefined;
        delete(movieWriters, movieWritersStart, movieWritersEnd, people);
      }catch {
        movie.movieWriters = "N/A";
      }

      // Disgusting regex to find actors
      try{
        let movieActors = [];
        let movieActorsStart = rawHtml.match('(Stars)')['index'];
        let movieActorsEnd = rawHtml.substring(movieActorsStart, movieActorsStart+400).match('(ghost)')['index'];
        let people = rawHtml.substring(movieActorsStart, movieActorsStart+movieActorsEnd);
        people = people.matchAll('(tt_ov_st_sm"\\n>[^<]+)');
        for(const person of people){
          movieActors.push(person[0].substring(14, person[0].length));
        };
        movie.movieActors = movieActors;

        // Unset & delete
        movieActors, movieActorsStart, movieActorsEnd, people = undefined;
        delete(movieActors, movieActorsStart, movieActorsEnd, people);

      }catch {
        movie.movieActors = "N/A";
      }

      // Disgusting regex to find plot
      try {
        let movie_plot_start = rawHtml.match('(summary_text)')['index'];
        let movie_plot_end = rawHtml.substring(movie_plot_start, movie_plot_start+500).match('(<\/div>)')['index'];
        let movie_plot = rawHtml.substring(movie_plot_start+35, movie_plot_start+movie_plot_end-13);
        let cleaned_plot = "";
        let add_letters = true;

        // Clean out the html tags
        movie_plot.split('').forEach(c => {
          if(c == '<'){
            add_letters = false;
          };
          if(add_letters) {
            cleaned_plot += c;
          };
          if(c == '>'){
            add_letters = true;
          };

        });
        movie.movie_plot = cleaned_plot;

        // Unset & delete
        movie_plot_start, movie_plot_end, movie_plot, cleaned_plot, add_letters = undefined;
        delete(movie_plot_start, movie_plot_end, movie_plot, cleaned_plot, add_letters);

      }catch {
        movie.movie_plot = "N/A";
      }

      // Disgusting regex to find poster
      try{
        let movie_poster_start = rawHtml.match('(class=\"poster\")')['index'];
        let movie_poster_end = rawHtml.substring(movie_poster_start, movie_poster_start+400).match('(\\.jpg)')['index'];
        let movie_poster_start_2 = rawHtml.substring(movie_poster_start, movie_poster_start+movie_poster_end+4).match('(src=\")')['index'];
        let movie_poster = rawHtml.substring(movie_poster_start+movie_poster_start_2+5, movie_poster_start+movie_poster_end+4);
        movie.movie_poster = movie_poster;

        // Unset & delete
        movie_poster_start, movie_poster_end, movie_poster_start_2, movie_poster = undefined;
        delete(movie_poster_start, movie_poster_end, movie_poster_start_2, movie_poster);

      }catch {
        movie.movie_poster = "N/A";
      }

      // Disgusting regex to find ratings
      try{
        let movie_metascore_start = rawHtml.match('(\"metacriticScore score_favorable titleReviewBarSubItem)')['index'];
        let movie_metascore_end = rawHtml.substring(movie_metascore_start, movie_metascore_start+400).match('(</span>)')['index'];
        let movie_metascore = rawHtml.substring(movie_metascore_start+63, movie_metascore_start + movie_metascore_end);
        movie.movie_metascore = movie_metascore

        // Unset & delete
        movie_metascore_start, movie_metascore_end, movie_metascore = undefined;
        delete(movie_metascore_start, movie_metascore_end, movie_metascore);

      }catch{
        movie.movie_metascore = "N/A";
      }

      // Disgusting regex to find movie rating
      try {
        let raw_rating = rawHtml.match('(itemprop="ratingValue")')['index'];
        let movie_rating = rawHtml.substring(raw_rating+23, raw_rating+26);
        movie.movie_rating = movie_rating
      }catch {
        movie.movie_rating = "N/A"
      }


      console.log(movie);
    });
}
