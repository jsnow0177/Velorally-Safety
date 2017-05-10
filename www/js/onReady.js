var onReady = (function(){

    var ready = false,
        queue = [];
    
    onDeviceReady(function(){
        $(document).ready(function(){
            ready = true;
            while(queue.length > 0){
                var handler = queue.shift();
                setTimeout(function(handler){
                    handler.apply(null, [$]);
                }.bind(null, handler), 1);
            }
        });
    });

    return function(callback){
        if(!ready){
            queue.push(callback);
        }else{
            setTimeout(function(){
                callback.apply(null, [$]);
            }, 1);
        }
    };

}());