$(document).ready(function () {
    //Initial Things
    updateSongTotal();

    //Search Parameters
    var searchType;
    $('.search-song').click(function () {
        $('#myModalLabel').text("Search Song");
        searchType = "songsearch";
    });
    
    $('.search-artist').click(function () {
        $('#myModalLabel').text("Search Artist");
        searchType = "artistsearch";
    });
    
    $('.search-album').click(function () {
        $('#myModalLabel').text("Search Album");
        searchType = "albumsearch";
    });

    //Close the navbar when it is clicked
    $('.collapse-buttons').click(function (event) {
        var toggle = $(".navbar-toggle").is(":visible");
        if (toggle) {
            $(".navbar-collapse").collapse('hide');
        }
    });

});

var listeningUsers = [];

function displayAllListeningUsers(){
    if(listeningUsers.length !== 0){
        listeningUsers.forEach(function(user) {

        });
    }
}

/********************************************************************************************************************/
/*********************************************** MUSIC PLAYER ANIMATION ******************************************/
var _pictureAnimationInterval;
var _currentPicturePosition = -50;
var inc = true;
var _animatePic = function(){
    if(inc){
        _currentPicturePosition = _currentPicturePosition + 0.2;
        if(_currentPicturePosition >= 5){
            inc = false;
        }
    } else {
        _currentPicturePosition = _currentPicturePosition - 0.2;
        if(_currentPicturePosition <= -50){
            inc = true;
        }
    }
    $('#now').css('top', _currentPicturePosition + '%');
};


/********************************************************************************************************************/
/*********************************************** AJAX PAGE BUILDING **********************************************/
    function loadPage(page){
        //Get the DOM object of the drawing section of the page
        var allContentWrapper = document.getElementById("insertHere");
        var allContent = document.getElementById("bodyContent");

        //On every page load, check for library length changes
        updateSongTotal();

        //Clear the content currently on the page
        $(allContentWrapper).empty();
        $(allContentWrapper).append("<div id='bodyContent'></div>");

        if(page === 'library'){
            //Turn on Loader
            $('#spinner').css("visibility", "visible");
            $("#spinner").toggleClass('spinner-disabled spinner');
            console.log("turning on spinner");

        $.get("library").done(function( data ) {
                createTable(JSON.parse(data));

            });

        function createTable(tabledata){
            //CREATE THE LIBRARY TABLE
            var html = "<table id='tracklist-table'><tr class='track-row'><th>Song</th><th>Artist</th><th>Album</th><th>Year</th></tr>";
                html += "<tbody>";
            $.each(tabledata, function(key, value){
                var TRACKID = value.TRACKID;
                var SONG = _safeProofTextUndo(value.SONG);
                var ARTIST = _safeProofTextUndo(value.ARTIST);
                var ALBUM = _safeProofTextUndo(value.ALBUM);
                var YEAR = _safeProofTextUndo(value.YEAR);

                html += "<tr class='track-row' onclick='songSelect(this," + TRACKID + ");' data-track-key='" + TRACKID + "'>";
                html += "<td class='name-time'><div class='play-track' style='cursor: pointer;'></div>" + SONG + "</td>";
                html += "<td class='track-artist'>" + ARTIST + "</td>";
                html += "<td class='track-album'>" + ALBUM + "</td>";
                html += "<td class='track-year'>" + YEAR + "</td></tr>";
            });
            html += "</tbody>";

            html += "<div class='progress'>";
            html += "<div class='progress-bar progress-bar-striped active this-progress-bar' role='progressbar' aria-valuemin='0' aria-valuemax='100' style='width:0%'>";
            html += "<span class='sr-only'></span></div></div>";


            //Put the table on the screen
            $('#bodyContent').append(html);

            //Reset Loader
            $("#spinner").fadeOut(500);
            $("#spinner").toggleClass('spinner spinner-disabled');
            resetLoader(300);
        }
        } else if(page === 'index'){
            $.ajax({
                url : "index",
                dataType: "text",
                success : function (data) {
                    var homeHtml = "<div class='container'>";
                    homeHtml += "<h1 style='font-family: 'Oswald', sans-serif;'>Welcome Home!</h1>";
                    homeHtml += "<p class='lead'><span class='glyphicon glyphicon-headphones' aria-hidden='true'></span> See what's being played around the house</p>";
                    homeHtml+= "</div>";
                    homeHtml+= "<div id='user-listening-list'>";
                    homeHtml+= " <div class='container' style='background-color: black; height:30px; overflow:hidden'>";
                    homeHtml+=" <h4 style='color: white;margin-top: 7px;'>Now Playing - <span style='color:grey'><small>Living Room [Station A], Khalil's Room [Station B], Study [Station D]</small></span></h4>";
                    homeHtml+= "</div>";
                    homeHtml+= "</div>";
                    homeHtml+= "</div>";

                    $('#bodyContent').append(homeHtml);
                    $('#user-listening-list').append(data);
                    displayAllListeningUsers();
                }
            });
            resetLoader(0);
        } else if(page === 'player'){
            $(allContentWrapper).empty();
            $.ajax({
                url : "player",
                dataType: "text",
                success : function (data) {
                    $('#insertHere').append(data);

                    //Place album artwork
                    $('#now-playing-artwork').attr("src", $('#small-album-artwork').attr("src"));

                    //Animate Album Artwork
                    stopPictureAnimationInterval();
                    _pictureAnimationInterval = setInterval(_animatePic, 250);
                    _pictureAnimationInterval();

                }
            });
            resetLoader(0);
        }
}
function resetLoader(timeout){
    setTimeout(function() {
        $('#spinner').css("visibility", "hidden");
        $('#spinner').css("display", "");
    },timeout);
}

function updateSongTotal(){
    $.ajax({
        url : "songsTotal",
        dataType: "json",
        success : function (numberOfSongs) {
            var parsedObj = JSON.parse(numberOfSongs);
            var value;
            for(var key in parsedObj) {
                value = parsedObj[key];
            }
            value = JSON.stringify(value);
            $('#librarySongCount').text(value.substring((value.indexOf(':') + 1), value.length - 1));
        }
    });
}

function _safeProofTextUndo(text){
    text = text + "";
    text = text.replace("**dbl**", '"');
    text = text.replace("**sgl**","'");
    text = text.replace("**op**","(");
    text = text.replace("**cl**",")");
    return text;
}

var stopPictureAnimationInterval = function(){
    if (_pictureAnimationInterval) {
        clearInterval(_pictureAnimationInterval);
        _pictureAnimationInterval = null;
    }
};

/*************************************************************************************************************/
/*********************************************** TEST FUNCTIONS **********************************************/
/************** (All functions are to start here before they are moved into their appropriate section) *******/

function broadcastSongDisplay(user, song, artist, album, key, progress, time, id){
    $('.progress-bar-users').css("width", progress + "%" ).attr( "aria-valuenow", time + "");
    $('.progress-bar-users').html(time);
}