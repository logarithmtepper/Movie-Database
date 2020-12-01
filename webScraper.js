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
        let rawMovieRating = rawHtml.match('(<time\\sdatetime="PT)')['index'];
        let movieRating = rawHtml.substring(rawMovieRating-150, rawMovieRating-53);
        let movieRatingStart = movieRating.match('(\\s{20}.{1,10})')['index'];
        movieRating = movieRating.substring(movieRatingStart+21, movieRating.length);
        movie.movieRating = movieRating;

        // Unset & delete
        rawMovieRating, movieRating, movieRatingStart = undefined;
        delete(rawMovieRating, movieRating, movieRatingStart);

      }catch {
        movie.movieRating = "N/A";
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
        let moviePlotStart = rawHtml.match('(summary_text)')['index'];
        let moviePlotEnd = rawHtml.substring(moviePlotStart, moviePlotStart+500).match('(<\/div>)')['index'];
        let moviePlot = rawHtml.substring(moviePlotStart+35, moviePlotStart+moviePlotEnd-13);
        let cleanedPlot = "";
        let addLetters = true;

        // Clean out the html tags
        moviePlot.split('').forEach(c => {
          if(c == '<'){
            addLetters = false;
          };
          if(addLetters) {
            cleanedPlot += c;
          };
          if(c == '>'){
            addLetters = true;
          };

        });
        movie.moviePlot = cleanedPlot;

        // Unset & delete
        moviePlotStart, moviePlotEnd, moviePlot, cleanedPlot, addLetters = undefined;
        delete(moviePlotStart, moviePlotEnd, moviePlot, cleanedPlot, addLetters);

      }catch {
        movie.moviePlot = "N/A";
      }

      // Disgusting regex to find poster
      try{
        let moviePosterStart = rawHtml.match('(class=\"poster\")')['index'];
        let moviePosterEnd = rawHtml.substring(moviePosterStart, moviePosterStart+400).match('(\\.jpg)')['index'];
        let moviePosterStart2 = rawHtml.substring(moviePosterStart, moviePosterStart+moviePosterEnd+4).match('(src=\")')['index'];
        let moviePoster = rawHtml.substring(moviePosterStart+moviePosterStart2+5, moviePosterStart+moviePosterEnd+4);
        movie.moviePoster = moviePoster;

        // Unset & delete
        moviePosterStart, moviePosterEnd, moviePosterStart2, moviePoster = undefined;
        delete(moviePosterStart, moviePosterEnd, moviePosterStart2, moviePoster);

      }catch {
        movie.moviePoster = "N/A";
      }

      // Disgusting regex to find ratings
      try{
        let movieMetascoreStart = rawHtml.match('(\"metacriticScore score_favorable titleReviewBarSubItem)')['index'];
        let movieMetascoreEnd = rawHtml.substring(movieMetascoreStart, movieMetascoreStart+400).match('(</span>)')['index'];
        let movieMetascore = rawHtml.substring(movieMetascoreStart+63, movieMetascoreStart + movieMetascoreEnd);
        movie.movieMetascore = movieMetascore

        // Unset & delete
        movieMetascoreStart, movieMetascoreEnd, movieMetascore = undefined;
        delete(movieMetascoreStart, movieMetascoreEnd, movieMetascore);

      }catch{
        movie.movieMetascore = "N/A";
      }

      // Disgusting regex to find movie rating
      try {
        let rawImdbRating = rawHtml.match('(itemprop="ratingValue")')['index'];
        let movieImdbRating = rawHtml.substring(rawImdbRating+23, rawImdbRating+26);
        movie.movieImdbRating = movieImdbRating
      }catch {
        movie.movieImdbRating = "N/A"
      }

      console.log(movie);
    });
}
