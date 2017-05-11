Core.defineController('main', function(){

    var PING_TIMEOUT = 1000,
        ping_t = -1;

    function onOnline(){
        console.log('on online');
        $('#network-status').removeClass('text-danger').addClass('text-success').find('i').removeClass('glyphicon-circle-arrow-down').addClass('glyphicon-circle-arrow-up');
    }

    function onOffline(){
        console.log('on offline');
        $('#network-status').removeClass('text-success').addClass('text-danger').find('i').removeClass('glyphicon-circle-arrow-up').addClass('glyphicon-circle-arrow-down');
    }

    
    function onPingServerResponseOk(){
        $('#server-status').removeClass('text-danger').addClass('text-success')
        .find('i').removeClass('glyphicon-circle-arrow-down').addClass('glyphicon-circle-arrow-up');
    }

    function onPingServerResponseFail(){
        $('#server-status').removeClass('text-success').addClass('text-danger')
        .find('i').removeClass('glyphicon-circle-arrow-up').addClass('glyphicon-circle-arrow-down');
    }

    function onPingServerResponse(response){
        clearTimeout(ping_t);
        //console.log('[' + (new Date()).toLocaleTimeString() + '] Response: ' + response);
        if(response !== undefined){
            if(response === 'ok'){
                onPingServerResponseOk();
                ping_t = setTimeout(ping, PING_TIMEOUT);
                return;
           }
        }

        onPingServerResponseFail();
        ping_t = setTimeout(ping, PING_TIMEOUT);
        return;
    }

    function ping(){
        request('main/ping', {}, onPingServerResponse, onPingServerResponse);
    }

    return {
        onunload: function(next){
            document.removeEventListener('online', onOnline, false);
            document.removeEventListener('offline', onOffline, false);
            clearTimeout(ping_t);

            next();
        },
        main: function(){
            Core.view('main', function(){
                var $edit_btn = $('#button-edit');

                $edit_btn.on('click', function(){
                    Core.callController('index', {force: true});
                });

                //Register events
                document.addEventListener('online', onOnline, false);
                document.addEventListener('offline', onOffline, false);
                
                //Immediately fire <<online>> or <<offline>> event
                ((navigator.connection.type!==Connection.NONE?onOnline:onOffline)).apply(null, []);
                
                //Immediately start the ping
                ping();
            });
        }
    };

});