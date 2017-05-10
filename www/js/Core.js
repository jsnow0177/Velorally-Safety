'use strict';
var Core = (function(){

    var initHandlers = [],
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
        currentController = null;

    /**
     * Устанавливает контейнер приложения
     * 
     * @param {object} container
     */
    core.setApplicationContainer = function(container){
        $applicationContainer = container;
    };
    
    /**
     * Регистрирует контроллер
     * 
     * @param {string} name
     * @param {Core.Controller|function} controller
     */
    core.registerController = function(name, controller){
        if(controllers[name] === undefined){
            controllers[name] = (typeof(controller) === 'function')?controller.apply(null, [core]):controller;
            controllers[name].getName = function(name){
                return name;
            };
            controllers[name].getName = controllers[name].getName.bind(null, name);
        }
    };

    /**
     * Загружает контроллер
     * 
     * @param {string} name
     */
    core.load = function(name, options){
        if(options === undefined || typeof(options) !== 'object'){
            options = {};
        }
        
        if(currentController !== null && currentController.getName() === name){
            return false;
        }

        var load = function(name, options){
            var controller = null;

            if(controllers[name] === undefined){
                // Загружаем контроллер
                try{
                    var script = document.createElement('script');
                    script.id = '_controller_script__' + name;
                    script.type = 'text/javascript';
                    script.src = 'js/controllers/' + name + '.js';
                    $('head').append(script);
                }catch(error){
                    // Не удалось загрузить контроллер
                    if(options.onError !== undefined && typeof(options.onError) === 'function'){
                        options.onError.apply(null, [error]);
                    }

                    return false;
                }
            }
            
            controller = controllers[name];

            var _load = function(name, options, controller){
                currentController = null;
                if(controller !== null){
                    var continueLoading = function(name, options, controller){
                        currentController = controller;
                        if(controller.init !== undefined && typeof(controller.init) === 'function'){
                            controller.init.apply(controller, []);
                        }
                        
                        if(options.after !== undefined && typeof(options.after) === 'function'){
                            options.after.apply(null, []);
                        }
                    }
                    continueLoading = continueLoading.bind(core, name, options, controller);

                    if(controller.before !== undefined && typeof(controller.before) === 'function'){
                        controller.before.apply(controller, [name, core, continueLoading]);
                    }else{
                        continueLoading();
                    }
                }
            }
            _load = _load.bind(core, name, options, controller);

            if(currentController !== null){
                if(currentController.unload !== undefined && typeof(currentController.unload) === 'function'){
                    currentController.unload.apply(currentController, [core, _load]);
                }else{
                    _load();
                }
            }else{
                _load();
            }
        }
        load = load.bind(core, name, options);

        if(options.before !== undefined && typeof(options.before) === 'function'){
            options.before.apply(null, [load]);
        }else{
            load();
        }
    };

    core.view = function(file, onload){
        $.ajax({
            type: 'GET',
            url: 'views/' + file + '.html',
            success: function(html){
                $applicationContainer.html(html);
                if(onload !== undefined && typeof(onload) === 'function'){
                    onload();
                }
            }
        });
    }

    // ---

    return defaultObj;

}());