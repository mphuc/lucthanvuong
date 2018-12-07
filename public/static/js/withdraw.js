'use strict';
$(function(){

	
	$('#frmWithdrawCOIN_Dashboard').on('submit', function(){

        $('#frmWithdrawCOIN_Dashboard .alert').hide().html('');
        $(this).ajaxSubmit({
            beforeSend: function() {
               
                $('#frmWithdrawCOIN_Dashboard .alert').hide();
                $('#frmWithdrawCOIN_Dashboard button[type="submit"]').button('loading');
            },
            error: function(result) 
            {
                
                var message = result.responseJSON.message;
                $('#frmWithdrawCOIN_Dashboard .alert').show().html(message);
                $('#frmWithdrawCOIN_Dashboard button[type="submit"]').button('reset');
            },
            success: function(result) 
            {
                var html = '<h3 style="color:orange" class="text-center">Withdraw Success</h3>';
				html += '<p class="text-center">The transaction has been successfully withdrawn</p>';
				html += '<p class="text-center">Please click on the link in the inbox for the transaction to take place. Thank you!</p>';
				$('#withdraw_coin_dashboard').html(html);
            	
            }
        });
        return false;
    });


	/*$('#send-usd-amount').on("change paste keyup", function() {
	    var btc_usd = $('#btc_usd').val();
	    if (parseFloat(btc_usd) < 50)
	    	return false;
	    var input_usd = $('#send-usd-amount').val();
	    var wallet = $('#send-btc-wallet').val();
	   	if (wallet == '' ){
	   		$('#send-btc-wallet').addClass('error').attr('placeholder', '');
	    	$('#send-btc-wallet').focus();
	    	$('#Error-send-btc-wallet').html('<p class="text-danger">Please enter Bitcoin wallet</p>');
	    	return false;
	   	}else{
	   		$('#send-btc-wallet').removeClass('error');
	    	$('#Error-send-btc-wallet').html('');

	   	}
	    if (parseFloat(input_usd) < 50 || isNaN(input_usd) || input_usd == '') {
	        $('#send-usd-amount').addClass('error').attr('placeholder', '');
	        $('#Error-send-btc').html('<p class="text-danger">Please enter a quantity greater than 50 USD</p>');
	        return false;
	    }else{
	    	$('#send-usd-amount').removeClass('error');
	    	$('#Error-send-btc').html('');
	    	var btc_send = parseFloat(input_usd)/parseFloat(btc_usd);
	    	btc_send = parseFloat(btc_send).toFixed(8)
	    	$('#send-btc-usd').val(parseFloat(btc_send));
	    }

	    


	});

	$('#SendBtcSubmit').click(function(e) {
		var btc_usd = $('#btc_usd').val();
	    if (parseFloat(btc_usd) < 50)
	    	return false;
	    var input_usd = $('#send-usd-amount').val();
	    var wallet = $('#send-btc-wallet').val();
	   	if (wallet == '' ){
	   		$('#send-btc-wallet').addClass('error').attr('placeholder', '');
	    	$('#send-btc-wallet').focus();
	    	$('#Error-send-btc-wallet').html('<p class="text-danger">Please enter Bitcoin wallet</p>');
	    	return false;
	   	}else{
	   		$('#send-btc-wallet').removeClass('error');
	    	$('#Error-send-btc-wallet').html('');

	   	}
	    if (parseFloat(input_usd) < 10 || isNaN(input_usd) || input_usd == '') {
	        $('#send-usd-amount').addClass('error').attr('placeholder', '');
	        $('#Error-send-btc').html('<p class="text-danger">Please enter a quantity greater than 50 USD</p>');
	        return false;
	    }else{
	    	$('#send-usd-amount').removeClass('error');
	    	$('#Error-send-btc').html('');
	    	var btc_send = parseFloat(input_usd)/parseFloat(btc_usd);
	    	btc_send = parseFloat(btc_send).toFixed(8)
	    	$('#send-btc-usd').val(parseFloat(btc_send));
	    }
	    	$.ajax({
		        url: "/account/send-btc",
		        data: {
		            amount_usd: input_usd,
		            wallet: wallet
		        },
		        type: "POST",
		        beforeSend: function() {
		            $('#SendBtcSubmit').button('loading');
		        },
		        error: function(data) {
		            var message = data.responseJSON.message;
		            showNotification('top', 'right', message, 'danger');
		            self.WithdrawSubmit.button('reset');
		            setTimeout(function() {
		                location.reload(true);
		            }, 1000);
		        },
		        success: function(data) {
		            swal({
		                title: "Withdraw Success",
		                text:"Please check your mailbox to complete withdraw!",
		                timer: 5000,
		                showConfirmButton: false
		            }).catch(swal.noop);
		            setTimeout(function() {
		                location.reload(true);
		            }, 6000);
		        }
		    });
	    })*/

});
