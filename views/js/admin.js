Dropzone.autoDiscover = false;
$(document).ready(function() {

    $('#depiction > div').each( function() {
        var dropzone = new Dropzone('#' + this.id, {
            url: '/',
            uploadMultiple: false,
            acceptedFiles: '.png',
            dictDefaultMessage: 'Drag and drop or click to choose file'
        });
    });

    $('#nameToDepiction').on('submit', function(e) {
        e.preventDefault();            

        var data = {
            reactant: {
            name: $('#reactant').val(),
            depiction: $('#depiction #reactant-img img').attr('src')
       },
            reagent: {
                name: $('#reagent').val(),
                depiction: $('#depiction #reagent-img img').attr('src')
                },
            product: {
                name: $('#product').val(),
                depiction: $('#depiction #product-img img').attr('src')
            }
        }

        $.ajax({
            url:'/getImage',
            data: data,
            method: 'POST',
            error: function(response) {
                console.log("error in ajax call");
            }
        }).then(function(response) {

            //Append depictions to page
            var json_obj = JSON.parse(response);
            //if currently no depiction is displayed
            if ($('#reactant-img').children().length == 2) {
                $('#reactant-img .dz-message').hide();
                $('#reactant-img').append($("<img id='reactant_src'src=" + json_obj['reactant']['depiction'] + " alt=" + "'" + json_obj['reactant']['name'] + "'>"));
            }
            if ($('#reagent-img').children().length == 2) {
                $('#reagent-img .dz-message').hide();
                $('#reagent-img').append($("<img id='reagent_src'src=" + json_obj['reagent']['depiction'] + " alt=" + "'" + json_obj['reagent']['name'] + "'>"));
            }
            if ($('#product-img').children().length == 2) {
                $('#product-img .dz-message').hide();
                $('#product-img').append($("<img id='product_src'src=" + json_obj['product']['depiction'] + " alt=" + "'" + json_obj['product']['name'] + "'>"));
            }

            //show the "confirm reaction" button for database upload
            $('#confirm').show();
            $('#clear').show();
        });
                    
    });

    //Save depictions to database
    $('#confirm').click( function(e) {
        e.preventDefault();
                    
        var auth_prompt = window.prompt("Enter password");

        var encrypted = CryptoJS.AES.encrypt(auth_prompt, "pw");
        var decrypted = CryptoJS.AES.decrypt(encrypted, "pw");
                    
        //only allow upload to database if correct pw is entered
        if (decrypted.toString() == "61646d696e") {
            console.log("password correct");

            var cards = {
                reactant: {
                    front: $('#reactant-img img').attr('src'),
                    back: $('#reactant').val().toLowerCase()
                },
                reagent: {
                    front: $('#reagent-img img').attr('src'),
                    back: $('#reagent').val().toLowerCase()
                },
                product: {
                    front: $('#product-img img').attr('src'),
                    back: $('#product').val().toLowerCase()
                }
            }

            $.ajax({
                url: '/addReaction',
                data: cards,
                method: 'POST',
                error: function(response) {
                    console.log('error in ajax call');
                }
            }).then( function(response) {
                $('#confirm').hide();
            });

            alert("Reaction uploaded");
            $('#depiction img').remove();
            $('#depiction .dz-preview').remove();
            $('#depiction .dropzone').removeClass("dz-started");
            $('#depiction .dz-message').show()
            $('#confirm').hide();
            $('#clear').hide();
            $('#nameToDepiction')[0].reset();
        } else {
            alert("Password incorrect.  Upload failed.");
        }
    });

    $('#clear').click( function(e) {
        e.preventDefault();
        $('#depiction img').remove();
        $('#depiction .dz-preview').remove();
        $('#depiction .dropzone').removeClass("dz-started");
        $('#depiction .dz-message').show();
        $('#confirm').hide()
        $('#nameToDepiction')[0].reset();
        $(this).hide();
    });

    $('button.x').click( function(e) {
        e.preventDefault();
        var parent = $(this).parent().attr('id');
        $('#' + parent + ' img').remove();
        $('#' + parent).removeClass('dz-started');
        $('#' + parent + ' .dz-preview').remove();
        $('#' + parent + ' .dz-message').show();
    });

    $('button#exportReactions').click( function(e) {
        e.preventDefault();
        $.ajax({
            url: '/exportReactions',
            data: {req: 'req'},
            method: 'GET',
            error: function(response) {
                alert("error exporting reactions");
            }
        }).then( function(response) {
            $('#downloadReactions').show();
            $('#downloadReactions').click( function(e) {
                $(this).hide();
            });
        });
    });

    $('button#exportPoints').click(function(e) {
        e.preventDefault();
        $.ajax({
            url: '/exportPoints',
            data: {req: 'req'},
            method: 'GET',
            error: function(response) {
                alert("error exporting points");
            }
        }).then(function(response) {
            $('#downloadPoints').show();
            $('#downloadPoints').click(function(e) {
                $(this).hide();
            });
        });
    })

    $('button#resetPoints').click(function(e) {
        if (confirm("Are you sure you wish to reset all points? You will not be able to export them later.")) {
            e.preventDefault();
            $.ajax({
                url: '/resetPoints',
                data: {req: 'req'},
                method: 'GET',
                error: function(response) {
                    alert("error resetting points");
                    console.log(response);
                }
            }).then(function(response) {
                alert("All users points have been reset to 0")
                console.log(response);
            });
        }
    });

});