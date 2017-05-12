var VersionControl = (function(){

    var APP_VERSION = '1.1.5';

    function checkUpdate(callback){
        request('update/check', {version: APP_VERSION}, function(result){
            if(result.response !== undefined){
                var response = result.response;
                if(callback !== undefined){
                    callback.apply(null, [false, response]);
                }
            }else{
                callback.apply(null, [true, {}]);
            }
        });
    }

    return {
        getVersion: function(){
            return APP_VERSION;
        },
        checkUpdate: checkUpdate
    };

}());