var Core = (function(){

    let initHandlers = [],
        initialized  = false,
        defaultObj = {},
        core = {

        };
    
    function onInit(callback){
        if(!initialized){
            initHandlers.push(callback);
        }else{
            callback.apply(null, [core]);
        }
    }

    document.addEventListener('deviceready', function(){
        if(!initialized){
            initialized = true;
            if(initHandlers.length > 0){
                for(let i = 0; i < initHandlers.length; i++){
                    initHandlers[i].apply(null, core);
                    defaultObj = core;
                    defaultObj.onInit = onInit;
                }
            }
        }
    }, false);

    defaultObj.onInit = onInit;

    // Основные методы

    

    // ---

    return defaultObj;

}());