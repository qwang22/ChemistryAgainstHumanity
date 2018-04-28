function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data));
}



//Modal Popup Instructions Functions
$(function(){ 
    $('.inst_button ').on('click',function(){
        $('.inst').css({
            'transform':'translateY(0)','z-index':'999'
        });

     $('body').addClass('overlay');


     $(this).css({
        'z-index':'-1'
     });

    $('.inst > .close').on('click',function(){
        $(this).parent().css({
            'transform':'translateY(-300%)'
        });

        $('body').removeClass('overlay');
            $(this).parent().siblings('.btn').css({
                'z-index':'1'
            });
    });
    });
});

//Modal Leaderboard button: 
$(function(){ 
    $('.lead_button').on('click',function(){
        $('.lead').css({
            'transform':'translateY(-125%)','z-index':'800'
        });

     $('body').addClass('overlay');


     $(this).css({
        'z-index':'-1'
     });

    $('.lead > .close').on('click',function(){
        $(this).parent().css({
            'transform':'translateY(-400%)'
        });

        $('body').removeClass('overlay');
            $(this).parent().siblings('.btn').css({
                'z-index':'1'
            });
    });
    });
});

//End draft

$(document).ready(function() {

    var deck;
    var solutions;
    var nextToDraw = 16; //index of next card to draw
    var score = 0.0; //current points
    var gameOver = false;
    var practiceMode;

    //if user is logged in
    if ($('#username').html().length > 0) {
        practiceMode = false;
    } else {
        practiceMode = true;
    }

    let c = $(".card"); //flipping the images
    c.flip({axis:'y', trigger:'click'});

    let c1 = $(".card1");
      c.flip({axis:'y', trigger:'click'});
    //test 2nd column 

    var getOriginalPosition = function() {
        $('#div1 img').each( function() {
            //original position = row#column#
            var op = $(this).parent().closest('th').attr('id');
            $(this).attr('data-op', op);
        });
    }

    var shuffle = function(deck) {
        for (var i=0; i<deck.length; i++) {
            var shuffle_pos = Math.floor((deck.length - i) * Math.random()) + i;
            var tmp = deck[i];
            deck[i] = deck[shuffle_pos];
            deck[shuffle_pos] = tmp;
        }
    }

    var drawCards = function(numToDraw) {
        //if no cards left
        if (nextToDraw == deck.length) {
            return;
        }
        //if less than 3 cards left in deck
        if (nextToDraw + numToDraw > deck.length) {
            numToDraw = deck.length - nextToDraw;
        }
        var drawnCards = [];
        for (var i=0; i<numToDraw; i++) {
            drawnCards.push(deck[nextToDraw]);
            nextToDraw++;
        }
        return drawnCards;
    }

    var makeCard = function(card) {
        return $("<img id=" + card['_id'] + " src=" + card['front'] + 
                " alt='" +card['back'] + "' draggable='true' ondragstart='drag(event)'>");
    }

    //should use this function, but cards css is not applied
    var makeCard2 = function(card) {
        return $("<div class='card'>" + 
                    "<div class='front'>" + 
                        "<img id=" + card['_id'] + " data-rid=" + card['rid'] + 
                        " data-type=" + card['type'] + " src=" + card['front'] + 
                        " alt=" + card['back'] + " draggable='true' ondragstart='drag(event)'>" + 
                    "</div>" +
                    "<div class='back'>" + 
                        "<p>" + card['back'] + "</p>" + 
                    "</div>" + 
                "</div>");
    }

    //update UI with cards
    var updateGameboard = function() {
        var row_num = 1;
        var col_num = 1;
        for (var i = 0;i < 16;i++) {
            //table_pos = r#c#
            var table_pos = 'r' + row_num + 'c' + col_num;
            //$('#div1 th#' + table_pos).append(makeCard2(deck[i]));
            $('#div1 th#' + table_pos + ' .card .front').append(makeCard(deck[i]));
            $('#div1 th#' + table_pos + ' .card .back').append($("<p>" + deck[i]['back'] + "</p>"));
            col_num++;
            if (col_num == 5) {
                col_num = 1;
                row_num++;
            }
        }
        getOriginalPosition();
        console.log(deck.slice(0,16));
    }

    var initializeGame = function() {

        $('#div1').show();
        $('#div2').show();
        $('#submit').show();
        $('#labels').show();
        $('#start_game').hide();

        $.ajax({
            url: "/generateSolutions",
            data: {request: "req"},
            method: "POST",
            error: function(response) {
                console.log("error generating solutions");
                console.log(response);
            }
        }).then( function(response) {
            solutions = JSON.parse(response);

            if (typeof(solutions) != "undefined" && typeof(deck) != "undefined") {
                console.log("solutionExists", solutionExists(deck.slice(0,16)));
            }
        });

        $.ajax({
            url: '/generateCards',
            data: {request: "req"},
            method: 'POST',
            error: function(response) {
                console.log("error in ajax call")
                console.log(response)
            }
        }).then( function(response) {
            //response is json object of all cards from db
            deck = JSON.parse(response);
            shuffle(deck);

            if (typeof(solutions) != "undefined") {
                while (!solutionExists(deck.slice(0,16))) {
                    shuffle(deck);
                }
                if (solutionExists(deck.slice(0,16))) {
                    console.log("solutionExists", solutionExists(deck.slice(0,16)));
                    handleDuplicates(deck.slice(0,16));
                    updateGameboard();
                }

            }
        });

    }

    //accepts JSON obj of cards {id:..., front:..., back:...}
    var solutionExists = function(card_objs) {

        var cards = new Array();
        for (var i=0;i<card_objs.length;i++) {
            cards.push(card_objs[i]['back']);
        }

        for (var i=0;i<solutions.length;i++) {
            if (cards.includes(solutions[i]['reactant']) && 
                cards.includes(solutions[i]['reagent']) &&
                cards.includes(solutions[i]['product'])) {
                    return true;
                }
        }
        return false;
    }

    //check if the drawn 16 cards contain duplicates and move to bottom of deck
    var handleDuplicates = function(cards) {

        var unique = new Array(); //array of all unique cards
        var indexOfDuplicates = new Array(); //deck index position of duplicate cards
        $.each(cards, function(i, card) {
            if ($.inArray(card['back'], unique) === -1) {
                unique.push(card['back'])
            } else {
                indexOfDuplicates.push(i);
                console.log("duplicate", card['back']);
            }
        });

        console.log("duplicates found at index", indexOfDuplicates);

        //move duplicate cards to bottom of deck ------- not 100% functional
        for (var i=0;i<indexOfDuplicates.length;i++) {
            deck = deck.concat(deck.splice(indexOfDuplicates[i], 1));
        }
    }

    var submitAnswerHandler = function() {
        //remove previous answer check
        $('#result').empty();
        $('#score').empty();

        var answer = {
            reactant: $('#reactant').children('img').attr('alt'),
            reagent: $('#reagent').children('img').attr('alt'),
            product: $('#product').children('img').attr('alt')
        }

        // if correct
        if (checkAnswer(answer)) {
            score++;
            $('#score').append("<p>Score: "+score+"</p>")
            $('#result').append("<p>Correct</p>")
            //draw new cards to replace
            var newCards = drawCards(3);
            console.log("newCards", newCards);
            var j = 0;
            //append new cards to grid and clear old cards
            setTimeout(function() {
                if (typeof(newCards) != "undefined") {
                    $('#div2 img').each( function() {
                        $('#' + $(this).attr('data-op') + ' .card .back').empty();
                        if (j < newCards.length) {
                            //$('#' + $(this).attr('data-op')).append(makeCard2(newCards[j]));
                            $('#' + $(this).attr('data-op') + ' .card .front').append(makeCard(newCards[j]));
                            // $('#' + $(this).attr('data-op') + ' .card .back').empty();
                            $('#' + $(this).attr('data-op') + ' .card .back').append($("<p>" + newCards[j]['back'] + "</p>"));
                        j++;
                        }
                    });
                    getOriginalPosition();
                }
                $('#div2 .sub_box').empty();
                $('#result').empty()}, 1500);
        } else {
            score = score - 0.5;
            $('#score').append("<p>Score: "+score+"</p>");
            $('#result').append("<p>Incorrect</p>");
            //$('#clear_answers').show();
        }
    }

    var returnToOriginalPosition = function() {
        //returns cards to previous positions (row#column#)
        $('#div2 img').each( function() {
            $('#' + $(this).attr('data-op') + ' .front').append($(this));
        });
        //initialize buttons
        $('#result').empty();
    }

    var checkAnswer = function(answer) {

        console.log("user answer", answer);
        console.log("solution set", solutions);

        for (var i=0;i<solutions.length;i++) {
            if (answer['reactant'] == solutions[i]['reactant'] &&
            answer['reagent'] == solutions[i]['reagent'] &&
            answer['product'] == solutions[i]['product']) {
                solutions.splice(i, 1); //remove reaction from list of solutions
                if (solutions.length == 0) {
                    gameOver = true;
                }
                return true;
            }
        }
        return false;
    }

    var generateLeaderboard = function() {
        
        //clear leaderboard except 1st row
        $('table.leaderB tr').slice(1).remove();

        $.ajax({
            url: '/getLeaderboard',
            data: {request: 'req'},
            method: 'GET',
            error: function(response) {
                alert("error retrieving leaderboard");
            }
        }).then(function(response) {
            var users = JSON.parse(response);

            for (var i=0;i<users.length;i++) {
                var rank = i + 1;
                $(".leaderB").append($("<tr>" +
                    "<th>" + rank + "</th>" +
                    "<th>" + users[i]["onyen"] + "</th>" +
                    "<th>" + users[i]["points"] + "</th></tr>"));
            }
        });
    }

    //update leaderboard every 5 mins
    if (!practiceMode) {
        console.log("in-class mode");
        var updateLeaderboard = setInterval(function() {

            $.ajax({
                url: '/updateLeaderboard',
                data: {
                    onyen: $('#username').html(),
                    points: score
                },
                method: 'POST',
                error: function(response) {
                    console.log('error updating leaderboard');
                }
            }).then(function(response) {
                console.log("leaderboard updated");
            });

            if (gameOver) {
                setTimeout(function() {
                    clearInterval(updateLeaderboard);
                }, 300000);
            }
        }, 300000);
}

    $('#start_game').on("click", function(e) {
        e.preventDefault();
        initializeGame();
    });

    $('#check').on("click", function(e) {
        e.preventDefault();
        submitAnswerHandler();
    });

    $('#clear_answers').on("click", function(e) {
        e.preventDefault();
        returnToOriginalPosition();
    });

    $('.lead_button').on("click", function(e) {
        e.preventDefault();
        generateLeaderboard();
    });

});