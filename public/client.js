var username = "";
var socket = io.connect();

$( function() {




  var dialog, form,

    // From http://www.whatwg.org/specs/web-apps/current-work/multipage/states-of-the-type-attribute.html#e-mail-state-%28type=email%29
    name = $( "#name" ),
    recep = $( "#rec" ),
    pass = $( "#pass" ),
    allFields = $( [] ).add( name ).add( recep ).add( pass ),
    tips = $( ".validateTips" );


  function addUser() {
    username = name.val();
    x = recep.val().split(":");
    var pass1 = pass.val()
    dialog.dialog( "close" );
    socket.emit('enter',{typerad: x[0], me: username, name:x[1],pass:pass1});

           // submit text message without reload/refresh the page
           $('form').submit(function(e){
               e.preventDefault(); // prevents page reloading
               socket.emit('chat_message', $('#txt').val());
               $('#txt').val('');
               return false;
           });
           // append the chat text message
           socket.on('chat_message', function(msg){
               $('#messages').append($('<li>').html(msg));
           });
           // append text if someone is online
           socket.on('is_online', function(username) {
               $('#messages').append($('<li>').html(username));
           });
           socket.on('auth_response',function(ans){
             if(ans == 'no'){
               alert('user did not exist and it was registered to the system');
             }else{
               if(ans == 'wrongpass'){
                 alert('wrong username/password combination');
               }
               else{
                 alert('user exists and you are logged in now');
               }
             }
           });

  }



  dialog = $( "#dialog-form" ).dialog({
    autoOpen: false,
    height: 400,
    width: 350,
    modal: true,
    buttons: {
      "Create an account": addUser,
      Cancel: function() {
        dialog.dialog( "close" );
      }
    },
    close: function() {
      form[ 0 ].reset();
      allFields.removeClass( "ui-state-error" );
    }
  });

  form = dialog.find( "form" ).on( "submit", function( event ) {
    event.preventDefault();
    addUser();
  });

  dialog.dialog( "open" );

} );
$('body').on('change', '#siofu_input', function(e) {
  console.log("heey")
  var data = e.originalEvent.target.files[0];
  readThenSendFile(data);
});
function readThenSendFile(data){
  console.log("hi")
    var reader = new FileReader();
    reader.onload = function(evt){
        var msg ={};
        msg.username = username;
        msg.file = evt.target.result;
        msg.fileName = data.name;
        socket.emit('base64 file', msg);
    };
    reader.readAsDataURL(data);
}
