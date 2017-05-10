Core.registerController('index', function(){

    var phone = '', number = '';

    function validateInputs($phone, $number){
        var phone  = $phone.val(),
            number = $number.val(),
            errors = [true, true];

        if(phone.indexOf('+') !== 0){
            phone = '+' + phone;
        }

        if(/\+\d{12,16}/.test(phone)){
            errors[0] = false;
        }else{
            errors[0] = 'Номер телефона должен быть в формате +380987654321';
        }

        if(number > 0 && number < 999999){
            errors[1] = false;
        }else{
            errors[1] = 'Номер участника должен быть в диапазоне от 0 до 999999';
        }

        $phone.parent().find('.help-block').remove();
        $number.parent().find('.help-block').remove();

        if(errors[0] !== false){
            $phone.parents('.form-group').removeClass('has-success').addClass('has-error');
            $phone.parent().append('<div class="help-block">' + errors[0] + '</div>');
        }else{
            $phone.parents('.form-group').removeClass('has-error').addClass('has-success');
        }

        if(errors[1] !== false){
            $number.parents('.form-group').removeClass('has-success').addClass('has-error');
            $number.parent().append('<div class="help-block">' + errors[1] + '</div>');
        }else{
            $number.parents('.form-group').removeClass('has-error').addClass('has-success');
        }

        return (errors[0]!==false || errors[1] !== false)?false:true;
    }

    return {
        before: function(name, c, continueLoading){
            // Check storage
            phone  = window.localStorage.getItem('participant_phone');
            number = window.localStorage.getItem('participant_number');

            if(phone !== null && number !== null){
                // Load next controller
                Core.load('main');
            }else{
                phone = (phone===null)?'':phone;
                number = (number===null)?'':number;
                continueLoading();
            }
        },
        init: function(){
            Core.view('index', function(){
                var $phone   = $('#input-phone'),
                    $number  = $('#input-number'),
                    $nextBtn = $('#next-btn');

                $phone.val(phone);
                $number.val(number);

                $nextBtn.on('click', function(){
                    $nextBtn.text('Далее...');
                    $nextBtn.attr('disabled', 'disabled');

                    var hasError = !validateInputs($phone, $number);
                    
                    if(!hasError){
                        // Save phone and number
                        window.localStorage.setItem('participant_phone', $phone.val());
                        window.localStorage.setItem('participant_number', $number.val());

                        // Navigate to next controller
                        Core.load('main');
                    }else{
                        $nextBtn.text('Далее');
                        $nextBtn.attr('disabled', '');
                    }
                });
            });
        }
    };

});