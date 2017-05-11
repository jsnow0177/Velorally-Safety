'use strict';
var Core = (function(){

    var initHandlers = [],
        initialized  = false,
        defaultObj = {},
        core = {

        };

    //region CController

    function CController(props){
        this._ = {
            ondefined: (props.ondefined!==undefined&&typeof(props.ondefined)==='function')?props.ondefined:function(){},
            onload: (props.onload!==undefined&&typeof(props.onload)==='function')?props.onload:function(next){next();},
            onunload: (props.onunload!==undefined&&typeof(props.onunload)==='function')?props.onunload:function(next){next();},
            main: (props.main!==undefined&&typeof(props.main)==='function')?props.main:function(){}
        };
    }

    CController.prototype.defined = function(){
        if(this._.ondefined !== undefined && typeof(this._.ondefined) === 'function'){
            this._.ondefined.apply(this, []);
        }
    };

    CController.prototype.load = function(next){
        if(this._.onload !== undefined && typeof(this._.onload) === 'function'){
            this._.onload.apply(this, [next]);
        }else{
            next();
        }
    };

    CController.prototype.main = function(args){
        if(args !== undefined && (Array.isArray(args) || typeof(args)!=='object')){
            args = {
                0: args
            };
        }

        if(args === undefined){
            args = {};
        }

        if(this._.main !== undefined && typeof(this._.main) === 'function'){
            this._.main.apply(this, [args]);
        }
    };

    CController.prototype.unload = function(next){
        if(this._.onunload !== undefined && typeof(this._.onunload) === 'function'){
            this._.onunload.apply(this, [next]);
        }else{
            next();
        }
    };

    //endregion
    
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
            for(var prop in core){
                defaultObj[prop] = core[prop];
            }
            if(initHandlers.length > 0){
                for(var i = 0; i < initHandlers.length; i++){
                    initHandlers[i].apply(null, [core]);
                }
            }
        }
    }, false);

    defaultObj.onInit = onInit;

    // Ядро

    var $applicationContainer,
        controllers = {},
        currentController = null,
        defaults = {
            callController: {}
        };

    /**
     * Устанавливает контейнер приложения
     * 
     * @param {object} container
     */
    core.setApplicationContainer = function(container){
        $applicationContainer = container;
    };
    
    /**
     * Определяет контроллер, если он ещё не определён
     */
    core.defineController = function(name, controllerObj){
        if(controllerObj === undefined || typeof(controllerObj) !== 'object'){
            throw new Error('controllerObj must be an object');
        }

        if(controllers[name] === undefined){
            controllers[name] = new CController(controllerObj);

            setTimeout(function(controller){
                controller.defined();
            }.bind(null, controllers[name]), 1);
        }
    };

    core.callController = (function(){

        function loadController(name, callback){
            if(controllers[name] === undefined){
                var script = document.createElement('script');
                script.type = 'text/javascript';
                script.src = 'js/controllers/' + name + '.js';

                script.onload = function(){
                    callback.apply(null, [false]);
                };

                script.onerror = function(){
                    callback.apply(null, [true]);
                };
            }else{
                callback.apply(null, [false]);
            }
        }
        
        function executeController(controller, args, options){
            controller.load(function(){
                currentController = controller;
                controller.main(args);
                if(options.after !== undefined && typeof(options.after) === 'function'){
                    options.after.call(options);
                }
            });
        }

        function call(name, args, options){
            if(options !== undefined && typeof(options) === 'function'){
                options = options.call(null);
            }

            if(options === undefined || typeof(options) !== 'object'){
                options = defaults.callController;
            }

            if(options.before !== undefined && typeof(options.before) === 'function'){
                options.before.call(options);
            }

            loadController(name, function(err){
                if(err || controllers[name] === undefined){
                    console.error('Controller not found');
                    if(options.onError !== undefined && typeof(options.onError) === 'function'){
                        options.onError.call(options);
                    }
                }else{
                    var controller = controllers[name];

                    // Unload previous controller
                    if(currentController !== null){
                        currentController.unload(function(controller, args, options){
                            currentController = null;
                            executeController(controller, args, options);
                        }.bind(null, controller, args, options));
                    }else{
                        currentController = null;
                        executeController(controller, args, options);
                    }
                }
            });
        };

        return call;
    }());

    // ---

    return defaultObj;

}());