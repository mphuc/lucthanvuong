function GetFormattedDate(todayTime) {
    var todayTime = new Date(todayTime);
    var month = (todayTime .getMonth() + 1);
    var day = (todayTime .getDate());
    var year = (todayTime .getFullYear());
    
    return month + "/" + day + "/" + year;
}
$(function(){

    load_withdraw_finish();
    load_withdraw_pendding();
    load_deposit_finish();
    load_deposit_pending();

   
    $('span[data-target="#modalDepositLEC"]').on('click',function(){
        $.ajax({
            url: "/account/balance/get-wallet",
            data: {
                type : 'LEC'
            },
            type: "POST",
            beforeSend: function() {
                
                $('#modalDepositLEC .modal-body .wallets').html('<img src="/static/img/ajax-loading.gif" alt="Amc loading" style="margin: 0;position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);">');
            },
            error: function(data) {
                $('span[data-target="#modalDepositLEC"]').button('reset');
                var message = data.responseJSON.message;
                showNotification('top', 'right', message, 'danger');
                $('#modalDepositLEC').modal('hide');
            },
            success: function(data) {
                setTimeout(function() {
                    $('span[data-target="#modalDepositLEC"]').button('reset');
                    $('#modalDepositLEC .modal-body .wallets').html('');
                    var html = ` <div class="address-wallet"> <div class="AccountDepositAddress"> <div class="box-center"> <div class="img-circle" id="address-qr"></div> <div class="input-group"> <span class="input-group-btn"> <button class="btn btn-social btn-fill btn-twitter copy" data-clipboard-action="copy" data-clipboard-target="#modalDepositLEC #inputaddress" type="button"> <div class="icon dripicons-copy"></div> Copy </button> </span> <input id="inputaddress" readonly="" type="text" value="" class="form-control"> </div> </div> </div> `;
                    $('#modalDepositLEC .modal-body .wallets').html(html);
                    $('#modalDepositLEC #inputaddress').val(data.wallet);
                }, 1000);
            }
        });
    });


    $('span[data-target="#modalDepositBCC"]').on('click',function(){
        $.ajax({
            url: "/account/balance/get-wallet",
            data: {
                type : 'BCC'
            },
            type: "POST",
            beforeSend: function() {
                
                $('#modalDepositBCC .modal-body .wallets').html('<img src="/static/img/ajax-loading.gif" alt="Amc loading" style="margin: 0;position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);">');
            },
            error: function(data) {
                $('span[data-target="#modalDepositBCC"]').button('reset');
                var message = data.responseJSON.message;
                showNotification('top', 'right', message, 'danger');
                $('#modalDepositBCC').modal('hide');
            },
            success: function(data) {
                setTimeout(function() {
                    $('span[data-target="#modalDepositBCC"]').button('reset');
                    $('#modalDepositBCC .modal-body .wallets').html('');
                    var html = ` <div class="address-wallet"> <div class="AccountDepositAddress"> <div class="box-center"> <div class="img-circle" id="address-qr"></div> <div class="input-group"> <span class="input-group-btn"> <button class="btn btn-social btn-fill btn-twitter copy" data-clipboard-action="copy" data-clipboard-target="#modalDepositBCC #inputaddress" type="button"> <div class="icon dripicons-copy"></div> Copy </button> </span> <input id="inputaddress" readonly="" type="text" value="" class="form-control"> </div> </div> </div> `;
                    $('#modalDepositBCC .modal-body .wallets').html(html);
                    $('#modalDepositBCC #inputaddress').val(data.wallet);
                }, 1000);
            }
        });
    });

    /*$('span[data-target="#modalDepositXVG"]').on('click',function(){
        $.ajax({
            url: "/account/balance/get-wallet",
            data: {
                type : 'XVG'
            },
            type: "POST",
            beforeSend: function() {
                
                $('#modalDepositXVG .modal-body .wallets').html('<img src="/static/img/ajax-loading.gif" alt="Amc loading" style="margin: 0;position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);">');
            },
            error: function(data) {
                $('span[data-target="#modalDepositXVG"]').button('reset');
                var message = data.responseJSON.message;
                showNotification('top', 'right', message, 'danger');
                $('#modalDepositXVG').modal('hide');
            },
            success: function(data) {
                setTimeout(function() {
                    $('span[data-target="#modalDepositXVG"]').button('reset');
                    $('#modalDepositXVG .modal-body .wallets').html('');
                    var html = ` <div class="address-wallet"> <div class="AccountDepositAddress"> <div class="box-center"> <div class="img-circle" id="address-qr"></div> <div class="input-group"> <span class="input-group-btn"> <button class="btn btn-social btn-fill btn-twitter copy" data-clipboard-action="copy" data-clipboard-target="#modalDepositXVG #inputaddress" type="button"> <div class="icon dripicons-copy"></div> Copy </button> </span> <input id="inputaddress" readonly="" type="text" value="" class="form-control"> </div> </div> </div> `;
                    $('#modalDepositXVG .modal-body .wallets').html(html);
                    $('#modalDepositXVG #inputaddress').val(data.wallet);
                }, 1000);
            }
        });
    });*/

    $('span[data-target="#modalDepositDASH"]').on('click',function(){
        $.ajax({
            url: "/account/balance/get-wallet",
            data: {
                type : 'DASH'
            },
            type: "POST",
            beforeSend: function() {
                
                $('#modalDepositDASH .modal-body .wallets').html('<img src="/static/img/ajax-loading.gif" alt="Amc loading" style="margin: 0;position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);">');
            },
            error: function(data) {
                $('span[data-target="#modalDepositDASH"]').button('reset');
                var message = data.responseJSON.message;
                showNotification('top', 'right', message, 'danger');
                $('#modalDepositDASH').modal('hide');
            },
            success: function(data) {
                setTimeout(function() {
                    $('span[data-target="#modalDepositDASH"]').button('reset');
                    $('#modalDepositDASH .modal-body .wallets').html('');
                    var html = ` <div class="address-wallet"> <div class="AccountDepositAddress"> <div class="box-center"> <div class="img-circle" id="address-qr"></div> <div class="input-group"> <span class="input-group-btn"> <button class="btn btn-social btn-fill btn-twitter copy" data-clipboard-action="copy" data-clipboard-target="#modalDepositDASH #inputaddress" type="button"> <div class="icon dripicons-copy"></div> Copy </button> </span> <input id="inputaddress" readonly="" type="text" value="" class="form-control"> </div> </div> </div> `;
                    $('#modalDepositDASH .modal-body .wallets').html(html);
                    $('#modalDepositDASH #inputaddress').val(data.wallet);
                }, 1000);
            }
        });
    });

    $('span[data-target="#modalDepositLTC"]').on('click',function(){
        $.ajax({
            url: "/account/balance/get-wallet",
            data: {
                type : 'LTC'
            },
            type: "POST",
            beforeSend: function() {
                
                $('#modalDepositLTC .modal-body .wallets').html('<img src="/static/img/ajax-loading.gif" alt="Amc loading" style="margin: 0;position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);">');
            },
            error: function(data) {
                $('span[data-target="#modalDepositLTC"]').button('reset');
                var message = data.responseJSON.message;
                showNotification('top', 'right', message, 'danger');
                $('#modalDepositLTC').modal('hide');
            },
            success: function(data) {
                setTimeout(function() {
                    $('span[data-target="#modalDepositLTC"]').button('reset');
                    $('#modalDepositLTC .modal-body .wallets').html('');
                    var html = ` <div class="address-wallet"> <div class="AccountDepositAddress"> <div class="box-center"> <div class="img-circle" id="address-qr"></div> <div class="input-group"> <span class="input-group-btn"> <button class="btn btn-social btn-fill btn-twitter copy" data-clipboard-action="copy" data-clipboard-target="#modalDepositLTC #inputaddress" type="button"> <div class="icon dripicons-copy"></div> Copy </button> </span> <input id="inputaddress" readonly="" type="text" value="" class="form-control"> </div> </div> </div> `;
                    $('#modalDepositLTC .modal-body .wallets').html(html);
                    $('#modalDepositLTC #inputaddress').val(data.wallet);
                }, 1000);
            }
        });
    });

    $('span[data-target="#modalDepositBTC"]').on('click',function(){
        $.ajax({
            url: "/account/balance/get-wallet",
            data: {
                type : 'BTC'
            },
            type: "POST",
            beforeSend: function() {
                
                $('#modalDepositBTC .modal-body .wallets').html('<img src="/static/img/ajax-loading.gif" alt="Amc loading" style="margin: 0;position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);">');
            },
            error: function(data) {
                $('span[data-target="#modalDepositBTC"]').button('reset');
                var message = data.responseJSON.message;
                showNotification('top', 'right', message, 'danger');
                $('#modalDepositBTC').modal('hide');
            },
            success: function(data) {
                setTimeout(function() {
                    $('span[data-target="#modalDepositBTC"]').button('reset');
                    $('#modalDepositBTC .modal-body .wallets').html('');
                    var html = ` <div class="address-wallet"> <div class="AccountDepositAddress"> <div class="box-center"> <div class="img-circle" id="address-qr"></div> <div class="input-group"> <span class="input-group-btn"> <button class="btn btn-social btn-fill btn-twitter copy" data-clipboard-action="copy" data-clipboard-target="#modalDepositBTC #inputaddress" type="button"> <div class="icon dripicons-copy"></div> Copy </button> </span> <input id="inputaddress" readonly="" type="text" value="" class="form-control"> </div> </div> </div> `;
                    $('#modalDepositBTC .modal-body .wallets').html(html);
                    $('#modalDepositBTC #inputaddress').val(data.wallet);
                    $('#modalDepositBTC #address-qr').html('<img src="https://chart.googleapis.com/chart?chs=200x200&amp;cht=qr&amp;chl=' + data.wallet + '" alt="">');
                }, 1000);
            }
        });
    });

    $('span[data-target="#modalDepositBCH"]').on('click',function(){
        $.ajax({
            url: "/account/balance/get-wallet",
            data: {
                type : 'BCH'
            },
            type: "POST",
            beforeSend: function() {
                
                $('#modalDepositBCH .modal-body .wallets').html('<img src="/static/img/ajax-loading.gif" alt="Amc loading" style="margin: 0;position: absolute;top: 50%;left: 50%;transform: translate(-50%, -50%);">');
            },
            error: function(data) {
                $('span[data-target="#modalDepositBCH"]').button('reset');
                var message = data.responseJSON.message;
                showNotification('top', 'right', message, 'danger');
                $('#modalDepositBCH').modal('hide');
            },
            success: function(data) {
                setTimeout(function() {
                    $('span[data-target="#modalDepositBCH"]').button('reset');
                    $('#modalDepositBCH .modal-body .wallets').html('');
                    var html = ` <div class="address-wallet"> <div class="AccountDepositAddress"> <div class="box-center"> <div class="img-circle" id="address-qr"></div> <div class="input-group"> <span class="input-group-btn"> <button class="btn btn-social btn-fill btn-twitter copy" data-clipboard-action="copy" data-clipboard-target="#modalDepositBCH #inputaddress" type="button"> <div class="icon dripicons-copy"></div> Copy </button> </span> <input id="inputaddress" readonly="" type="text" value="" class="form-control"> </div> </div> </div> `;
                    $('#modalDepositBCH .modal-body .wallets').html(html);
                    $('#modalDepositBCH #inputaddress').val(data.wallet);
                }, 1000);
            }
        });
    })
    
    $('#frmWihtdrawXZC').on('submit', function(){
        $('#modalWithdrawXZC').modal('toggle');

        $('#Confirm-Submit-XZC input[name="address"]').val($('#frmWihtdrawXZC #address').val());
        $('#Confirm-Submit-XZC input[name="amount"]').val($('#frmWihtdrawXZC #amount_withdraw').val());

        $('#modalWithdrawConfirmXZC').modal({
            show: 'true'
        }); 
        $('#modalWithdrawConfirmXZC .alert').hide();
        $('#Confirm-Submit-XZC').on('submit',function(){
            $('#modalWithdrawConfirmXZC .alert').hide();

            $(this).ajaxSubmit({
                beforeSend: function() {
                    $('.token_crt').val('');
                    $('#Confirm-Submit-XZC button[type="submit"]').button('loading');
                },
                error: function(result) 
                {
                    load_token();
                    if (result.responseJSON.message != 'Network Error')
                    {
                        $('#modalWithdrawConfirmXZC .alert').show().html(result.responseJSON.message);
                        $('#Confirm-Submit-XZC button[type="submit"]').button('reset');
                    }
                    else
                    {
                        setTimeout(function(){ location.reload(true); }, 4500);
                    }
                },
                success: function(result) 
                {
                    swal({
                    title: "Withdraw Success",
                        type: 'success',
                        text:"Please wait, your Withdrawal XZC is being processed.",
                        timer: 4000,
                        showConfirmButton: false
                    });
                    setTimeout(function() {
                        location.reload(true);
                    }, 5000);
                }
            });
            return false;
        })
        return false;
    });

    $('#frmWihtdrawETH').on('submit', function(){
        $('#modalWithdrawETH').modal('toggle');

        $('#Confirm-Submit-ETH input[name="address"]').val($('#frmWihtdrawETH #address').val());
        $('#Confirm-Submit-ETH input[name="amount"]').val($('#frmWihtdrawETH #amount_withdraw').val());

        $('#modalWithdrawConfirmETH').modal({
            show: 'true'
        }); 
        $('#modalWithdrawConfirmETH .alert').hide();
        $('#Confirm-Submit-ETH').on('submit',function(){
            $('#modalWithdrawConfirmETH .alert').hide();

            $(this).ajaxSubmit({
                beforeSend: function() {
                    $('.token_crt').val('');
                    $('#Confirm-Submit-ETH button[type="submit"]').button('loading');
                },
                error: function(result) 
                {
                    load_token();
                    if (result.responseJSON.message != 'Network Error')
                    {
                        $('#modalWithdrawConfirmETH .alert').show().html(result.responseJSON.message);
                        $('#Confirm-Submit-ETH button[type="submit"]').button('reset');
                    }
                    else
                    {
                        setTimeout(function(){ location.reload(true); }, 4500);
                    }
                },
                success: function(result) 
                {
                    swal({
                    title: "Withdraw Success",
                        type: 'success',
                        text:"Please wait, your Withdrawal ETH is being processed.",
                        timer: 4000,
                        showConfirmButton: false
                    });
                    setTimeout(function() {
                        location.reload(true);
                    }, 5000);
                }
            });
            return false;
        })
        return false;
    });

    $('#frmWihtdrawBTG').on('submit', function(){
        $('#modalWithdrawBTG').modal('toggle');

        $('#Confirm-Submit-BTG input[name="address"]').val($('#frmWihtdrawBTG #address').val());
        $('#Confirm-Submit-BTG input[name="amount"]').val($('#frmWihtdrawBTG #amount_withdraw').val());

        $('#modalWithdrawConfirmBTG').modal({
            show: 'true'
        }); 
        $('#modalWithdrawConfirmBTG .alert').hide();
        $('#Confirm-Submit-BTG').on('submit',function(){
            $('#modalWithdrawConfirmBTG .alert').hide();

            $(this).ajaxSubmit({
                beforeSend: function() {
                    $('.token_crt').val('');
                    $('#Confirm-Submit-BTG button[type="submit"]').button('loading');
                },
                error: function(result) 
                {
                    load_token();
                    if (result.responseJSON.message != 'Network Error')
                    {
                        $('#modalWithdrawConfirmBTG .alert').show().html(result.responseJSON.message);
                        $('#Confirm-Submit-BTG button[type="submit"]').button('reset');
                    }
                    else
                    {
                        setTimeout(function(){ location.reload(true); }, 4500);
                    }
                },
                success: function(result) 
                {
                    swal({
                    title: "Withdraw Success",
                        type: 'success',
                        text:"Please wait, your Withdrawal BTG is being processed.",
                        timer: 4000,
                        showConfirmButton: false
                    });
                    setTimeout(function() {
                        location.reload(true);
                    }, 5000);
                }
            });
            return false;
        })
        return false;
    });

    $('#frmWihtdrawBCC').on('submit', function(){
        
        $('#modalWithdrawBCC').modal('toggle');

        $('#Confirm-Submit-BCC input[name="address"]').val($('#frmWihtdrawBCC #address').val());
        $('#Confirm-Submit-BCC input[name="amount"]').val($('#frmWihtdrawBCC #amount_withdraw').val());

        $('#modalWithdrawConfirmBCC').modal({
            show: 'true'
        }); 
        $('#modalWithdrawConfirmBCC .alert').hide();
        $('#Confirm-Submit-BCC').on('submit',function(){
            $('#modalWithdrawConfirmBCC .alert').hide();

            $(this).ajaxSubmit({
                beforeSend: function() {
                    $('.token_crt').val('');
                    $('#Confirm-Submit-BCC button[type="submit"]').button('loading');
                },
                error: function(result) 
                {
                    load_token();
                    if (result.responseJSON.message != 'Network Error')
                    {
                        $('#modalWithdrawConfirmBCC .alert').show().html(result.responseJSON.message);
                        $('#Confirm-Submit-BCC button[type="submit"]').button('reset');
                    }
                    else
                    {
                        setTimeout(function(){ location.reload(true); }, 4500);
                    }
                },
                success: function(result) 
                {
                    swal({
                    title: "Withdraw Success",
                        type: 'success',
                        text:"Please wait, your Withdrawal BCC is being processed.",
                        timer: 4000,
                        showConfirmButton: false
                    });
                    setTimeout(function() {
                        location.reload(true);
                    }, 5000);
                }
            });
            return false;
        })
        return false;
    });

    $('#frmWihtdrawDASH').on('submit', function(){
        $('#modalWithdrawDASH').modal('toggle');

        $('#Confirm-Submit-DASH input[name="address"]').val($('#frmWihtdrawDASH #address').val());
        $('#Confirm-Submit-DASH input[name="amount"]').val($('#frmWihtdrawDASH #amount_withdraw').val());

        $('#modalWithdrawConfirmDASH').modal({
            show: 'true'
        }); 
        $('#modalWithdrawConfirmDASH .alert').hide();
        $('#Confirm-Submit-DASH').on('submit',function(){
            $('#modalWithdrawConfirmDASH .alert').hide();

            $(this).ajaxSubmit({
                beforeSend: function() {
                    $('.token_crt').val('');
                    $('#Confirm-Submit-DASH button[type="submit"]').button('loading');
                },
                error: function(result) 
                {
                    load_token();
                    if (result.responseJSON.message != 'Network Error')
                    {
                        $('#modalWithdrawConfirmDASH .alert').show().html(result.responseJSON.message);
                        $('#Confirm-Submit-DASH button[type="submit"]').button('reset');
                    }
                    else
                    {
                        setTimeout(function(){ location.reload(true); }, 4500);
                    }
                },
                success: function(result) 
                {
                    swal({
                    title: "Withdraw Success",
                        type: 'success',
                        text:"Please wait, your Withdrawal DASH is being processed.",
                        timer: 4000,
                        showConfirmButton: false
                    });
                    setTimeout(function() {
                        location.reload(true);
                    }, 5000);
                }
            });
            return false;
        })
        return false;
    });

    $('#frmWihtdrawLTC').on('submit', function(){
        $('#modalWithdrawLTC').modal('toggle');

        $('#Confirm-Submit-LTC input[name="address"]').val($('#frmWihtdrawLTC #address').val());
        $('#Confirm-Submit-LTC input[name="amount"]').val($('#frmWihtdrawLTC #amount_withdraw').val());

        $('#modalWithdrawConfirmLTC').modal({
            show: 'true'
        }); 
        $('#modalWithdrawConfirmLTC .alert').hide();
        $('#Confirm-Submit-LTC').on('submit',function(){
            $('#modalWithdrawConfirmLTC .alert').hide();

            $(this).ajaxSubmit({
                beforeSend: function() {
                    $('.token_crt').val('');
                    $('#Confirm-Submit-LTC button[type="submit"]').button('loading');
                },
                error: function(result) 
                {
                    load_token();
                    if (result.responseJSON.message != 'Network Error')
                    {
                        $('#modalWithdrawConfirmLTC .alert').show().html(result.responseJSON.message);
                        $('#Confirm-Submit-LTC button[type="submit"]').button('reset');
                    }
                    else
                    {
                        setTimeout(function(){ location.reload(true); }, 4500);
                    }
                },
                success: function(result) 
                {
                    swal({
                    title: "Withdraw Success",
                        type: 'success',
                        text:"Please wait, your Withdrawal LTC is being processed.",
                        timer: 4000,
                        showConfirmButton: false
                    });
                    setTimeout(function() {
                        location.reload(true);
                    }, 5000);
                }
            });
            return false;
        })
        return false;
    });


   
    $('#frmWihtdrawBCH').on('submit', function(){
        $('#modalWithdrawBCH').modal('toggle');

        $('#Confirm-Submit-BCH input[name="address"]').val($('#frmWihtdrawBCH #address').val());
        $('#Confirm-Submit-BCH input[name="amount"]').val($('#frmWihtdrawBCH #amount_withdraw').val());

        $('#modalWithdrawConfirmBCH').modal({
            show: 'true'
        }); 
        $('#modalWithdrawConfirmBCH .alert').hide();
        $('#Confirm-Submit-BCH').on('submit',function(){
            $('#modalWithdrawConfirmBCH .alert').hide();

            $(this).ajaxSubmit({
                beforeSend: function() {
                    $('.token_crt').val('');
                    $('#Confirm-Submit-BCH button[type="submit"]').button('loading');
                },
                error: function(result) 
                {
                    load_token();
                    if (result.responseJSON.message != 'Network Error')
                    {
                        $('#modalWithdrawConfirmBCH .alert').show().html(result.responseJSON.message);
                        $('#Confirm-Submit-BCH button[type="submit"]').button('reset');
                    }
                    else
                    {
                        setTimeout(function(){ location.reload(true); }, 4500);
                    }
                },
                success: function(result) 
                {
                    swal({
                    title: "Withdraw Success",
                        type: 'success',
                        text:"Please wait, your Withdrawal BCH is being processed.",
                        timer: 4000,
                        showConfirmButton: false
                    });
                    setTimeout(function() {
                        location.reload(true);
                    }, 5000);
                }
            });
            return false;
        })
        return false;
    });


    $('#frmWihtdrawBTC').on('submit', function(){
        $('#modalWithdrawBTC').modal('toggle');

        $('#Confirm-Submit-BTC input[name="address"]').val($('#frmWihtdrawBTC #address').val());
        $('#Confirm-Submit-BTC input[name="amount"]').val($('#frmWihtdrawBTC #amount_withdraw').val());

        $('#modalWithdrawConfirmBTC').modal({
            show: 'true'
        }); 
        $('#modalWithdrawConfirmBTC .alert').hide();
        $('#Confirm-Submit-BTC').on('submit',function(){
            $('#modalWithdrawConfirmBTC .alert').hide();
            $(this).ajaxSubmit({
                beforeSend: function() {
                    $('.token_crt').val('');
                    $('#Confirm-Submit-BTC button[type="submit"]').button('loading');
                },
                error: function(result) 
                {
                    load_token();
                    if (result.responseJSON.message != 'Network Error')
                    {
                        $('#modalWithdrawConfirmBTC .alert').show().html(result.responseJSON.message);
                        $('#Confirm-Submit-BTC button[type="submit"]').button('reset');
                    }
                    else
                    {
                        setTimeout(function(){ location.reload(true); }, 4500);
                    }
                },
                success: function(result) 
                {
                    swal({
                    title: "Withdraw Success",
                        type: 'success',
                        text:"Please wait, your Withdrawal BTC is being processed.",
                        timer: 4000,
                        showConfirmButton: false
                    });
                    setTimeout(function() {
                        location.reload(true);
                    }, 4500);
                }
            });
            return false;
        })
        return false;
    });

    $('#frmWihtdrawLEC').on('submit', function(){
        $('#modalWithdrawLEC').modal('toggle');
        $('#Confirm-Submit-LEC input[name="address"]').val($('#frmWihtdrawLEC #address').val());
        $('#Confirm-Submit-LEC input[name="amount"]').val($('#frmWihtdrawLEC #amount_withdraw').val());

        $('#modalWithdrawConfirmLEC').modal({
            show: 'true'
        }); 
        
        $('#modalWithdrawConfirmLEC .alert').hide();
        $('#Confirm-Submit-LEC').on('submit',function(){
            
            $('#modalWithdrawConfirmLEC .alert').hide();
           
            $('#Confirm-Submit-LEC').ajaxSubmit({

                beforeSend: function() {
                    $('.token_crt').val('');
                    $('#Confirm-Submit-LEC button[type="submit"]').button('loading');
                },
                error: function(result) 
                {
                    load_token();
                    if (result.responseJSON.message != 'Network Error')
                    {
                        $('#modalWithdrawConfirmLEC .alert').show().html(result.responseJSON.message);
                        $('#Confirm-Submit-LEC button[type="submit"]').button('reset');
                    }
                    else
                    {
                        setTimeout(function(){ location.reload(true); }, 4500);
                    }
                },
                success: function(result) 
                {
                    $('#Confirm-Submit-LEC button[type="submit"]').button('reset');
                    swal({
                    title: "Withdraw Success",
                        type: 'success',
                        text:"Please wait, your Withdrawal LEC is being processed.",
                        timer: 4000,
                        showConfirmButton: false
                    });
                    setTimeout(function() {
                        location.reload(true);
                    }, 5000)
                }
            });
            return false;
        })
        return false;
    });

$('#frmWihtdrawXVG').on('submit', function(){
        $('#modalWithdrawXVG').modal('toggle');
        $('#Confirm-Submit-XVG input[name="address"]').val($('#frmWihtdrawXVG #address').val());
        $('#Confirm-Submit-XVG input[name="amount"]').val($('#frmWihtdrawXVG #amount_withdraw').val());

        $('#modalWithdrawConfirmXVG').modal({
            show: 'true'
        }); 
        
        $('#modalWithdrawConfirmXVG .alert').hide();
        $('#Confirm-Submit-XVG').on('submit',function(){
            
            $('#modalWithdrawConfirmXVG .alert').hide();
           
            $('#Confirm-Submit-XVG').ajaxSubmit({

                beforeSend: function() {
                    $('.token_crt').val('');
                    $('#Confirm-Submit-XVG button[type="submit"]').button('loading');
                },
                error: function(result) 
                {
                    load_token();
                    if (result.responseJSON.message != 'Network Error')
                    {
                        $('#modalWithdrawConfirmXVG .alert').show().html(result.responseJSON.message);
                        $('#Confirm-Submit-XVG button[type="submit"]').button('reset');
                    }
                    else
                    {
                        setTimeout(function(){ location.reload(true); }, 4500);
                    }
                },
                success: function(result) 
                {
                    $('#Confirm-Submit-XVG button[type="submit"]').button('reset');
                    swal({
                    title: "Withdraw Success",
                        type: 'success',
                        text:"Please wait, your Withdrawal XVG is being processed.",
                        timer: 4000,
                        showConfirmButton: false
                    });
                    setTimeout(function() {
                        location.reload(true);
                    }, 5000)
                }
            });
            return false;
        })
        return false;
    });

    $('#modalWithdrawLEC #amount').on('input propertychange',function(){
        $('#modalWithdrawLEC #amount_withdraw').val(
            ((($('#modalWithdrawLEC #amount').val() * 100000000) - (0.001 * 100000000)) / 100000000).toFixed(8)
        );
    });

    $('#modalWithdrawBTC #amount').on('input propertychange',function(){
         $('#modalWithdrawBTC #amount_withdraw').val(
            ((($('#modalWithdrawBTC #amount').val() * 100000000) - (0.001 * 100000000)) / 100000000).toFixed(8)
        );
    });

    
    $('#modalWithdrawBTG #amount').on('input propertychange',function(){
         $('#modalWithdrawBTG #amount_withdraw').val(
            ((($('#modalWithdrawBTG #amount').val() * 100000000) - (0.001 * 100000000)) / 100000000).toFixed(8)
        );
    });

    $('#modalWithdrawBCH #amount').on('input propertychange',function(){
        $('#modalWithdrawBCH #amount_withdraw').val(
            ((($('#modalWithdrawBCH #amount').val() * 100000000) - (0.001 * 100000000)) / 100000000).toFixed(8)
        );
    });

    $('#modalWithdrawLTC #amount').on('input propertychange',function(){
        $('#modalWithdrawLTC #amount_withdraw').val(
            ((($('#modalWithdrawLTC #amount').val() * 100000000) - (0.01 * 100000000)) / 100000000).toFixed(8)
        );
    });

    $('#modalWithdrawDASH #amount').on('input propertychange',function(){
        $('#modalWithdrawDASH #amount_withdraw').val(
            ((($('#modalWithdrawDASH #amount').val() * 100000000) - (0.002 * 100000000)) / 100000000).toFixed(8)
        );
    });

    $('#modalWithdrawBCC #amount').on('input propertychange',function(){
        $('#modalWithdrawBCC #amount_withdraw').val(parseFloat($('#modalWithdrawBCC #amount').val())-0.001);
    });

    $('#modalWithdrawXVG #amount').on('input propertychange',function(){
        $('#modalWithdrawXVG #amount_withdraw').val(
            ((($('#modalWithdrawXVG #amount').val() * 100000000) - (0.2 * 100000000)) / 100000000).toFixed(8)
        );
    });

    $('#modalWithdrawXZC #amount').on('input propertychange',function(){
        $('#modalWithdrawXZC #amount_withdraw').val(
            ((($('#modalWithdrawXZC #amount').val() * 100000000) - (0.02 * 100000000)) / 100000000).toFixed(8)
        );
    });

    $('#modalWithdrawETH #amount').on('input propertychange',function(){
        $('#modalWithdrawETH #amount_withdraw').val(
            ((($('#modalWithdrawETH #amount').val() * 100000000) - (0.002 * 100000000)) / 100000000).toFixed(8)
        );
    });

    $('.withdraw_button').on('click',function(){
        load_token();
    });


    $('.reload_history_transaction').on('click',function(){
        $(this).addClass('active');
        var type = $(this).data('type');
        type === 'pending_deposit' && load_deposit_pending();
        type === 'finish_deposit' && load_deposit_finish();
        type === 'pending_withdraw' && load_withdraw_pendding();
        type === 'finish_withdraw' && load_withdraw_finish();
    })

})


function showNotification(from, align, msg, type) {
    var color = Math.floor((Math.random() * 6) + 1);
    $.notify({
        icon: "notifications",
        message: msg
    }, {
        type: type,
        timer: 3000,
        placement: {
            from: from,
            align: align
        }
    });
}

function load_token(){
    $.ajax({
        url: "/token_crt",
        data: {},
        type: "GET",
        beforeSend: function() {},
        error: function(data) {},
        success: function(data) {
            $('.token_crt').val(data.token);
        }
    });
}

function load_deposit_pending() {
    $.ajax({
        url: "/account/balance/history-deposit-pending",
        data: {},
        type: "GET",
        beforeSend: function() {
        },
        error: function() {},
        success: function(data) {
            $('.reload_history_transaction').removeClass('active');
            var html = `<div class="material-datatables"> <table id="list-yourinvestssss" class="table table-striped table-bordered table-hover" style="width:100%;cellspacing:0" > <thead> <tr> <th>Date</th>  <th>Amount </th> <th>Units</th><th>Confirmation</th><th>Tx id</th> </tr> </thead> <tbody> </tbody> </table> </div> `;
            $('#history-deposit-pending').html(html);
            $('#list-yourinvestssss').DataTable({
                "order": [
                    [0, "desc"]
                ],
                autoWidth: false,
                searching: false,
                ordering: true,
                responsive: true,
                lengthChange: false,
                destroy: true,
                paging: true,
                info: false,
                data: data.result,
                columns: [{
                    data: 'date'
                }, {
                    data: 'amount'
                }, {
                    data: 'type'
                },
                 {
                    data: 'confirm'
                }
                , {
                    data: 'txid'
                }]
            });
            
        }
    });
}

function load_deposit_finish() {
    $.ajax({
        url: "/account/balance/history-deposit-finish",
        data: {},
        type: "GET",
        beforeSend: function() {
        },
        error: function() {},
        success: function(data) {
            $('.reload_history_transaction').removeClass('active');
            var html = `<div class="material-datatables"> <table id="list-yourinvestsss" class="table table-striped table-bordered table-hover" style="width:100%;cellspacing:0" > <thead> <tr> <th>Date</th>  <th>Amount </th> <th>Units</th><th>Confirmation</th><th>Tx id</th> </tr> </thead> <tbody> </tbody> </table> </div> `;
            $('#history-deposit-finish').html(html);
            $('#list-yourinvestsss').DataTable({
                "order": [
                    [0, "desc"]
                ],
                autoWidth: false,
                searching: false,
                ordering: true,
                responsive: true,
                lengthChange: false,
                destroy: true,
                paging: true,
                info: false,
                data: data.result,
                columns: [{
                    data: 'date'
                }, {
                    data: 'amount'
                }, {
                    data: 'type'
                },
                 {
                    data: 'status'
                }
                , {
                    data: 'txid'
                }]
            });
            
        }
    });
}

function load_withdraw_finish() {
    $.ajax({
        url: "/account/balance/history-withdraw-finish",
        data: {},
        type: "GET",
        beforeSend: function() {
        },
        error: function() {},
        success: function(data) {
            $('.reload_history_transaction').removeClass('active');
            var html = `<div class="material-datatables"> <table id="list-yourinvests" class="table table-striped table-bordered table-hover" style="width:100%;cellspacing:0" > <thead> <tr> <th>Date</th>  <th>Amount </th> <th>Units</th><th>Status</th><th>Tx id</th> </tr> </thead> <tbody> </tbody> </table> </div> `;
            $('#history-withdraw-finish').html(html);
            $('#list-yourinvests').DataTable({
                "order": [
                    [0, "desc"]
                ],
                autoWidth: false,
                searching: false,
                ordering: true,
                responsive: true,
                lengthChange: false,
                destroy: true,
                paging: true,
                info: false,
                data: data.result,
                columns: [{
                    data: 'date'
                }, {
                    data: 'amount'
                }, {
                    data: 'type'
                },
                 {
                    data: 'status'
                }
                , {
                    data: 'txid'
                }]
            });
            
        }
    });
}

function load_withdraw_pendding() {
    $.ajax({
        url: "/account/balance/history-withdraw-pending",
        data: {},
        type: "GET",
        beforeSend: function() {
        },
        error: function() {},
        success: function(data) {
            $('.reload_history_transaction').removeClass('active');
            var html = `<div class="material-datatables"> <table id="list-yourinvestss" class="table table-striped table-bordered table-hover" style="width:100%;cellspacing:0" > <thead> <tr> <th>Date</th>  <th>Amount </th> <th>Units</th><th>Status</th><th><i class="fa fa-times"></i></th> </tr> </thead> <tbody> </tbody> </table> </div> `;
            $('#history-withdraw-pendding').html(html);
            $('#list-yourinvestss').DataTable({
                "order": [
                    [0, "desc"]
                ],
                autoWidth: false,
                searching: false,
                ordering: true,
                responsive: true,
                lengthChange: false,
                destroy: true,
                paging: true,
                info: false,
                data: data.result,
                columns: [{
                    data: 'date'
                }, {
                    data: 'amount'
                }, {
                    data: 'type'
                },
                 {
                    data: 'status'
                }
                , {
                    data: 'remove_order'
                }]
            });
             remove_order();
        }

    });
    
}

function remove_order(){
   
    $('.remove_order').on('click',function(){
        var id_withdraw = $(this).data('id');
        swal({
          title: "Confirm cancellation",
          text: "Are you sure you want to cancel the withdrawal?",
          type: "info",
          showCancelButton: true,
          closeOnConfirm: false,
          showLoaderOnConfirm: true
        }, function () {
            $.ajax({
                url: "/account/balance/remove-withdraw",
                data: {
                    'id' : id_withdraw
                },
                type: "POST",
                async : true,
                beforeSend: function() {
                },
                error: function(data) {
                },
                success: function(data) {
                    location.reload('true');
                }
            });
        })
    });
}