function request(route, params, onSuccess, onError){

    $.ajax({
        type: 'POST',
        url: 'http://100.velorally.ua/?_r=' + route,
        data: params,
        cache: false,
        success: function(response){
            //console.log('response', response);
            if(onSuccess !== undefined && typeof(onSuccess) === 'function'){
                onSuccess.apply(null, [response]);
            }
        },
        error: function(){
            //console.log('error');
            if(onError !== undefined && typeof(onError) === 'function'){
                onError.apply(null, []);
            }
        }
    });

}