Core.registerController('index', function(){

    return {
        before: function(name, c, continueLoading){
            console.log('Index: before');
            continueLoading();
        },
        init: function(){
            console.log('Index: init');
        }
    };

});