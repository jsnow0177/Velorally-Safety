Core.defineController('main', function(){

    return {
        main: function(){
            Core.view('main', function(){
                var $edit_btn = $('#button-edit');

                $edit_btn.on('click', function(){
                    Core.callController('index', {force: true});
                });
            });
        }
    };

});