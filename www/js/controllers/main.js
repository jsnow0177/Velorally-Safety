Core.defineController('main', function(){

    var ping_t = -1;

     var getGPSCoordinates = (function(){

        function getAccuratePosition(cb){
            navigator.geolocation.getCurrentPosition(function(position){
                cb.apply(null, [false, {lat: position.coords.latitude, lng: position.coords.longitude}]);
            }, function(error){
                cb.apply(null, [true, error]);
            }, {
                timeout: 5000,
                enableHighAccuracy: true
            });
        }

        return function(callback){
            getAccuratePosition(function(err, data){
                if(err){
                    callback.apply(null, [{lat: 0, lng: 0}]);
                }else{
                    callback.apply(null, [data]);
                }
            });
        };
    }());

    var h_err = 0;

    function requestHelp(number, phone){
        var $help_btn = $('#button-help'),
            $help_str = $('#help-string');
        $help_btn.hide();
        $help_str.show().text('Отправляем запрос о помощи...');

        // Get GPS-coordinates
        getGPSCoordinates(function(latLng){
            request('help/get', {
                lat: latLng.lat,
                lng: latLng.lng,
                number: number,
                phone: phone,
                secret: VLR_HLPR_APP_SECRET,
                version: VersionControl.getVersion()
            }, function(){
                $help_str.text('Запрос о помощи отправлен');
                $help_btn.show();
            }, function(){
                h_err++;
                if(h_err > 5){
                    $help_str.text('Попробуйте повторить запрос нажав на кнопку ещё раз.');
                    $help_btn.show();
                    h_err = 0;
                }else{
                    h_err = 0;
                    $help_str.text('Не удалось запросить помощь. Повтор...');
                    setTimeout(function(){requestHelp(number, phone);}, VLR_HLPR_HELP_REQUEST_TIMEOUT);
                }
            });
        });
    }

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
                ping_t = setTimeout(ping, VLR_HLPR_PING_TIMEOUT);
                return;
           }
        }

        onPingServerResponseFail();
        ping_t = setTimeout(ping, VLR_HLPR_PING_TIMEOUT);
        return;
    }

    function ping(){
        request('main/ping', {}, onPingServerResponse, onPingServerResponse);
    }

    return {
        onunload: function(next){
            clearTimeout(ping_t);
            document.removeEventListener('online', onOnline, false);
            document.removeEventListener('offline', onOffline, false);

            next();
        },
        main: function(args){
            Core.view('main', function(){
                var $edit_btn = $('#button-edit'),
                    $help_btn = $('#button-help');

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

                $help_btn.on('click', function(){
                    requestHelp(args.number, args.phone);
                });
            });
        }
    };

});