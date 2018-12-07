$(function(){
    $('#frmICO #amount_coin').on('input propertychange', function(){
        $('#frmICO #amount_btc').val('');
       
        delay(function(){
            $.ajax({
                url: "/ico/get-price-ico",
                data: {
                   'amount_coin' : $('#frmICO  #amount_coin').val()
                },
                type: "POST",
                beforeSend: function() {

                },
                error: function(data) {

                },
                success: function(data) {
                    $('#frmICO #amount_btc').val(data.result);
                }   
            });
        }, 600 );
    })


    
    $('#frmICO').on('submit', function(){
      
        $('#frmICO .alert').hide().html('');
        $(this).ajaxSubmit({
            beforeSend: function() {
                grecaptcha.reset();
                $('#frmICO .alert').hide();
                $('#frmICO button[type="submit"]').button('loading');
            },
            error: function(result) 
            {
                
                var message = result.responseJSON.message;
                $('#frmICO .alert').show().html(message);
                $('#frmICO button[type="submit"]').button('reset');
            },
            success: function(result) 
            {
                grecaptcha.reset();
                $('#ModalICO .modal-body').html('<div class="text-center"><img src="/static/img/success-icon-10.png" width="200" style="margin: 0 auto"><h3>Successful transaction</h3></div>');
            
                setTimeout(function(){ location.reload(true); }, 2000);
            }
        });
        return false;
    });

    $('#ModalSendBTC').on('hidden.bs.modal', function () {
        location.reload(true);
    });

})


var delay = (function(){
  var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();


$(function(){
  var deadline_start = new Date(Date.parse("Sat Dec 30 2017 22:00:00") + 2 * 24 * 60 * 60 * 1000);
  initializeClock('clockdiv_ico_end', deadline_start);
});

$(function(){
  var deadline_start = new Date($('#date_start_ico').val());
  initializeClock('clockdiv_ico_day', deadline_start);
});

function getTimeRemaining(endtime) {
  var t = Date.parse(endtime) - Date.parse(new Date());
  var seconds = Math.floor((t / 1000) % 60);
  var minutes = Math.floor((t / 1000 / 60) % 60);
  var hours = Math.floor((t / (1000 * 60 * 60)) % 24);
  var days = Math.floor(t / (1000 * 60 * 60 * 24));
  return {
    'total': t,
    'days': days,
    'hours': hours,
    'minutes': minutes,
    'seconds': seconds
  };
}

function initializeClock(id, endtime) {
  var clock = document.getElementById(id);
  var daysSpan = clock.querySelector('.days');
  var hoursSpan = clock.querySelector('.hours');
  var minutesSpan = clock.querySelector('.minutes');
  var secondsSpan = clock.querySelector('.seconds');

  function updateClock() {
    var t = getTimeRemaining(endtime);

    daysSpan.innerHTML = t.days;
    hoursSpan.innerHTML = ('0' + t.hours).slice(-2);
    minutesSpan.innerHTML = ('0' + t.minutes).slice(-2);
    secondsSpan.innerHTML = ('0' + t.seconds).slice(-2);

    if (t.total <= 0) {
      clearInterval(timeinterval);
    }
  }

  updateClock();
  var timeinterval = setInterval(updateClock, 1000);
}