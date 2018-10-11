$(document).ready(function(){

    $('#search_btn').click(function search(){
        if ($("#search_input").val()){
            var search_input = $("#search_input").val();
            //clean table & popover
            $('[data-toggle="popover"]').popover('destroy');
            $("#search_table tbody tr").remove();
            //Append data from game_list list to #search_table
            $('<tr>').append(
                    $('<th>').text(''),
                    $('<th>').text('Id'),
                    $('<th>').text('Name'),
                    $('<th>').text('Year'),
                    $('<th>').text('Rank'),
                    $('<th>').text('')
                ).appendTo('#search_table');
            $('<tr>').append(
                    $('<td colspan="5" id="loading_search_row">').html('<img class="img-responsive center-block" id="loading_search_gif" alt="Searching" src="static/img/processing_search_bar.gif">'),
                ).appendTo('#search_table');
            $('#search_table').removeClass('invisible');
            $.getJSON( "http://127.0.0.1:5000/search", {q: search_input}, function( data ) {
                $.each( data, function( i, item ) {
                    var thumbnail, year, rank;

                    if (item.thumbnail == null) {
                        thumbnail = "<img class='img-responsive img-thumbnail img-hot-list' src='static/img/no-image-available2.jpg' />";
                    } else {
                        thumbnail = "<img class='img-responsive img-thumbnail img-hot-list' src='" + item.thumbnail + "' />";
                    }
                    if (item.yearpublished == 0) {
                        year = "N/D";
                    }   else {
                        year = item.yearpublished;
                    }
                    if (item.stats.ranks[0].value == null){
                        rank ="N/D";
                    } else {
                        rank = item.stats.ranks[0].value;
                    }
                    $('<tr>').append(
                    $('<td>').html(thumbnail),
                    $('<td>').text(item.id),
                    $('<td>').text(item.name),
                    $('<td>').text(year),
                    $('<td>').text(rank),
                    $('<td>').html('<button class = "btn btn-success btn-sm btn-block buttonAdd" value="'+ item.id + '" data-toggle="' + item.id + '" data-content="You already owned this boardgame ">Add</button>')
                ).appendTo('#search_table');
                });
                $('#loading_search_row').empty();
            });
        }else{
            $('[data-toggle="popover"]').popover('show');
        }
    });

    //Add button in search table
    $('#search_table').on('click', '.buttonAdd', function(){
        var button = this;
        $.get('/collection', {option: "add_game", id: button.value}, function(result){
            if (result == "0"){
                $(button).text('Added').attr('disabled', 'disabled');
            }else{
                $('[data-toggle="' + button.value + '"]').popover('show');
                $(button).attr('disabled', 'disabled');
            }
        }).fail(function(){
            console.log("error");
        });
    });
});