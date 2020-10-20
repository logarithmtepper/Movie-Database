$(document).ready(() => {
  $('#searchForm').on('submit', (e) => {
    let searchText = $('#searchText').val();
    searchMovies(searchText);
    e.preventDefault();
  });
});

function searchMovies(searchText){
  console.log(searchText);
}
