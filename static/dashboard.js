$(document).ready(function(){
    dashboard_update();

});
    function dashboard_update(){
        update_hot();
        update_collection();
    }

    function update_hot(){

        //Remove old information
        $("#hot_table tbody tr").remove();

         //Append first row
        $('<tr>').append(
            $('<th>').text(''),
            $('<th class="text-center">').text('Rank'),
            $('<th>').text('Name'),
            $('<th class="text-center">').text('Year'),
            $('<th>').text('')
        ).appendTo('#hot_table');

        //Add row with loading animation
        $('<tr>').append(
            $('<td colspan="5" id="loading_hot_row">').html('<img class="img-responsive center-block" id="loading_search_gif" alt="Searching" src="static/img/processing_search_bar.gif">'),
        ).appendTo('#hot_table');

        //Append data from ajax to #hot_table
        $.getJSON( "http://127.0.0.1:5000/hot", function dashboard_update( data ) {
            $.each( data, function( i, item ) {
                var thumbnail;
                if (item.thumbnail == null) {
                    thumbnail = "<img class='img-responsive img-rounded img-hot-list' src='static/img/no-image-available2.jpg'>";
                } else {
                    thumbnail = "<img class='img-responsive img-rounded img-hot-list' src='" + item.thumbnail + "' />";
                }
                $('<tr>').append(
                $('<td>').html(thumbnail),
                $('<td class="text-center">').text(item.rank),
                $('<td>').text(item.name),
                $('<td class="text-center">').text(item.yearpublished),
                $('<td>').html('<div><button class = "btn btn-success btn-sm buttonAdd btn-block" value="'+ item.id + '">Add</button></div>')
                ).appendTo('#hot_table');

                //Load only first 10 boardgames from the hot list and remove loading gif
                if (i == 9) {
                return false;
                }
            });
            //Add button in hot table
            $('.buttonAdd').on('click', function(){
                var button = this;
                $.get('/collection', {option: "add_game", id: button.value}, function(result){
                    if (result == '0'){
                        $(button).text('Added').attr('disabled', 'disabled');
                        update_collection();
                    }else{
                        $('[data-toggle="' + button.value + '"]').popover('show');
                        $(button).attr('disabled', 'disabled');
                    }
                }).fail(function(){
                    console.log("error");
                });
            });
            $('#loading_hot_row').empty();
        });
    }

    function update_collection(){

        //Remove old information
        $("#dash_collection_table tbody tr").remove();

        //Append first row
        $('<tr>').append(
            $('<th>').text(''),
            $('<th  class="text-center">').text('Rank'),
            $('<th  class="text-center">').text('Id'),
            $('<th>').text('Name'),
            $('<th class="text-center">').text('Lend'),
            $('<th>').text('')
        ).appendTo('#dash_collection_table');

        //Add row with loading gif
        $('<tr>').append(
            $('<td colspan="6" id="loading_collection_row">').html('<img class="img-responsive center-block" id="loading_search_gif" alt="Searching" src="static/img/processing_search_bar.gif">'),
        ).appendTo('#dash_collection_table');

        //Append data from user collection
        $.getJSON( 'http://127.0.0.1:5000/collection?option=user_collection', function( data ) {
            if (data["collection"] == "empty"){
                $('#loading_collection_row').empty();
                $('<tr>').append(
                    $('<td colspan="6" id="no_collection" class = "text-center">').html('<h3>Your collection is empty</h3>'),
                ).appendTo('#dash_collection_table');
            }else{
                $.each( data, function( i, item ) {
                    var thumbnail, status, btnLendText;

                    if (item.thumbnail == null) {
                        thumbnail = "<img class='img-responsive img-rounded img-hot-list' src='static/img/no-image-available2.jpg' />";
                    } else {
                        thumbnail = "<img class='img-responsive img-rounded img-hot-list' src='" + item.thumbnail + "' />";
                    }

                    if (item.game_lend == 1) {
                        status = '<input type="checkbox" disabled="disabled" checked>';
                        btnLendText = "Return";
                    }else{
                        status = '<input type="checkbox" disabled="disabled">';
                        btnLendText = "Lend";
                    }
                    $('<tr>').append(
                    $('<td>').html(thumbnail),
                    $('<td class="text-center">').text(item.stats.ranks["0"].value),
                    $('<td class="text-center">').text(item.id),
                    $('<td>').text(item.name),
                    $('<td class="text-center">').html(status),
                    $('<td class="text-center">').html('<div><button class = "btn btn-warning btn-sm buttonLend btn-block btn-margin" value="'+ item.id + '">' + btnLendText + '</button></div><div><button class = "btn btn-danger btn-sm buttonRemove btn-block btn-margin" value="'+ item.id + '">Remove</button></div>')
                ).appendTo('#dash_collection_table');
                });
                //Lend/Return button in collection table
                $('.buttonLend').on('click', function(){
                    var button = this;
                    $.get('/collection', {option: "lend_game", id: button.value}, function(result){
                        if (result != '0'){
                            update_collection();
                        }else{
                            console.log('Lend/Return game error');
                        }
                    }).fail(function(){
                        console.log("error");
                    });
                });
                //Remove button in collection table
                $('.buttonRemove').on('click', function(){
                    var button = this;
                    $.get('/collection', {option: "remove_game", id: button.value}, function(result){
                        if (result != '0'){
                            update_collection();
                        }else{
                            console.log('Remove game error');
                        }
                    }).fail(function(){
                        console.log("error");
                    });
                });
                $('#loading_collection_row').empty();
            }
        });
        }