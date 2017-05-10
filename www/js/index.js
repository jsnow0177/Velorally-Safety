onReady(function(){

    var $button = $('#help'),
        $helpStr = $('#help_str'),
        helpStrT = 0,
        PARTICIPANT_NUMBER = -1;

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

    //Functions
    function onOnline(){
        $('.network_status').removeClass('text-danger').addClass('text-success')
        .find('i').removeClass('glyphicon-ban-circle').addClass('glyphicon-ok-circle');
    }

    function onOffline(){
        $('.network_status').removeClass('text-success').addClass('text-danger')
        .find('i').removeClass('glyphicon-ok-circle').addClass('glyphicon-ban-circle');
    }

    function onPingServerResponseOk(){
        $('.server_status').removeClass('text-danger').addClass('text-success')
        .find('i').removeClass('glyphicon-ban-circle').addClass('glyphicon-ok-circle');
    }

    function onPingServerResponseFail(){
        $('.server_status').removeClass('text-success').addClass('text-danger')
        .find('i').removeClass('glyphicon-ok-circle').addClass('glyphicon-ban-circle');
    }

    function onPingServerResponse(response){
        //console.log('[' + (new Date()).toLocaleTimeString() + '] Response: ' + response);
        if(response !== undefined){
            if(response === 'ok'){
                onPingServerResponseOk();
                setTimeout(ping, VLR_HLPR_PING_TIMEOUT);
                return;
           }
        }

        onPingServerResponseFail();
        setTimeout(ping, VLR_HLPR_PING_TIMEOUT);
        return;
    }

    function ping(){
        request('main/ping', {}, onPingServerResponse, onPingServerResponse);
    }

    function requestHelp(){
        $button.hide();
        var h_err = 0;
        $helpStr.text('Отправляем запрос о помощи...');
        //Get GPS-coordinates
        getGPSCoordinates(function(latLng){
            //Send request to the server
            request('help/get', {
                lat: latLng.lat,
                lng: latLng.lng,
                number: PARTICIPANT_NUMBER,
                secret: VLR_HLPR_APP_SECRET
            }, function(){
                $helpStr.text('Запрос о помощи отправлен.');
                clearTimeout(helpStrT);
                $button.show();
            }, function(){
                clearTimeout(helpStrT);
                h_err++;
                if(h_err > 5){
                    $helpStr.text('Попробуйте повторить запрос вручную.');
                    $button.show();
                }else{
                    $helpStr.text('Не удалось запросить помощь. Повтор...');
                    //Request help once more after timeout
                    setTimeout(requestHelp, VLR_HLPR_HELP_REQUEST_TIMEOUT);
                }
            });
        });

    }

    //Register events
    document.addEventListener('online', onOnline, false);
    document.addEventListener('offline', onOffline, false);
    
    //Immediately fire <<online>> or <<offline>> event
    ((navigator.connection.type!==Connection.NONE?onOnline:onOffline)).apply(null, []);

    //Immediately start the ping
    ping();

    // ---
    var $number1 = $('#number_box1'),
        $number2 = $('#number_box2'),
        $number3 = $('#number_box3'),
        $view1  = $('#view1'),
        $view2  = $('#view2'),
        $view3  = $('#view3'),
        $btn1   = $('#btn1'),
        $btn1_5 = $('#btn1_5'),
        $btn2   = $('#btn2');

    //Try to load number
    var number = window.localStorage.getItem("number");
    console.log(number);

    if(number !== undefined && number !== null){
        PARTICIPANT_NUMBER = number;
        $number3.parent().show();
        $number3.text(number);
        $view3.show();
    }else{
        $view1.show();
        $btn1.on('click', function(e){
            e.preventDefault();
            if($number1.val() !== ''){
                $number2.text($number1.val());
                $view1.hide();
                $view2.show();
            }
        });

        $btn1_5.on('click', function(e){
            e.preventDefault();
            $view2.hide();
            $number1.val('');
            $view1.show();
        });

        $btn2.on('click', function(e){
            e.preventDefault();
            var num = parseInt($number1.val());
            window.localStorage.setItem('number', num);
            PARTICIPANT_NUMBER = num;
            $view2.hide();
            $number3.text(num);
            $number3.parent().show();
            $view3.show();
        });
    }

    $button.on('click', requestHelp);
});