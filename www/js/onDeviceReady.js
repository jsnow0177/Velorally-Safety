var onDeviceReady = (function(){

    var ready = false,
        queue = [];

    document.addEventListener('deviceready', function(){
        ready = true;
        while(queue.length > 0){
            var handler = queue.shift();
            setTimeout(function(handler){
                handler.apply(null, []);
            }.bind(null, handler), 1);
        }
    }, false);

    return function(callback){
        if(!ready){
            queue.push(callback);
        }else{
            setTimeout(function(){
                callback.apply(null, []);
            }, 1);
        }
    };

}());