// Don't worry about this code, it will ensure that your ajax calls are allowed by the browser
$.ajaxPrefilter(function(settings, _, jqXHR) {
  jqXHR.setRequestHeader("X-Parse-Application-Id", "voLazbq9nXuZuos9hsmprUz7JwM2N0asnPnUcI7r");
  jqXHR.setRequestHeader("X-Parse-REST-API-Key", "QC2F43aSAghM97XidJw8Qiy1NXlpL5LR45rhAVAf");
});

if(!/(&|\#)/.test(window.location.hash)){
  var newSearch = window.location.hash;
  if(newSearch !== '' & newSearch !== '?'){
    newSearch += '&';
  }
  window.username = prompt('What is your name?') || 'anonymous';
  //setting window.location.(search|href) refreshes window vars
  window.location.hash = window.username;
}
else {
  //remove the initial # or &
  username = window.location.hash.slice(1);
}

$(document).ready(function() {
  reloadData();
  setInterval(reloadData,1000);
  $('#submit').on('click', sendMessage);
  $('#submitRoom').on('click', createRoom);
  window.friends = {};
});

var reloadData = function() {
  //chat messages
  var data = {'order':'-createdAt'};
  if (window.roomname!==undefined) {
    data.where = JSON.stringify({"roomname":window.roomname});
  }

  $.ajax('https://api.parse.com/1/classes/messages', {
    data: data,
    contentType: 'application/json',
    success: loadChatSuccess
  });

  data.where = JSON.stringify({"roomname":{"$exists":true}});

  //chat rooms
  $.ajax('https://api.parse.com/1/classes/messages', {
    data: data,
    contentType: 'application/json',
    success: loadRoomSuccess
  });
};

var loadChatSuccess = function(data){
  var list = data.results;
  $('#chatlist').empty();
  for (var i = 0; i < list.length; i++) {
    var username = '';
    if(list[i]["username"]){
      username = list[i]["username"] + ": ";
    }

    var $textMsg = $("<li>").text(list[i].text);

    $textMsg.attr('data-username', username);
    if(window.friends[username]){
      $textMsg.css("font-weight","bold");
    }

    var $link = $('<a href="#">').text(username);
    $link.on("click", function(event){
      event.preventDefault();
      var username = $(this).text();
      var $chats = $('li[data-username="'+username +'"]');
      $chats.css("font-weight","bold");
      window.friends[username] = true;
    });

    $textMsg.prepend($link);
    $('#chatlist').append($textMsg);
  }
};

var loadRoomSuccess = function(data) {
  var list = data.results;
  var $chatrooms = $('#chatrooms');
  $chatrooms.empty();
  var chatroomList = {};
  for (var i = 0; i < list.length; i++) {
    var chatroomName = list[i].roomname;
    if (chatroomList[chatroomName]) {
      continue;
    }
    chatroomList[chatroomName] = true;
    var $chatroom = $("<li>");
    var $link = $('<a href="#">').text(chatroomName);

    $link.on("click", function(e){
      e.preventDefault();
      window.roomname = $(this).text();
      reloadData();
    });

    $chatroom.append($link);
    $chatrooms.append($chatroom);
  }
};

var createRoom = function() {
  window.roomname = $('#input-chatroom').val();
  reloadData();
};

var sendMessage = function(){
  var username = window.username;
  var text = $("#input-chat").val();
  if(!text || !username) {
    return;
  }

  var message = {
    'username': username,
    'text': text,
    'roomname': window.roomname || ''
  };

  $.ajax({
    type: 'POST',
    url:'https://api.parse.com/1/classes/messages',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function(data){
      reloadData();
    }
  });
};