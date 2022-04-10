$(function(){
    if (!window.EventSource) {
        alert("No EventSource!")
        return
    }

    var $chatlog = $('#chat-log')
    var $chatmsg = $('#chat-msg')

    var isBlank = function(string) {
        return string == null || string.trim() === "";
    };
    var username;
    while (isBlank(username)) {
        username = prompt("닉네임은?");
        // if (!isBlank(username)) {
        //     $('#user-name').html('<b>' + username + '이 입장했습니다.</b>');
        // }
    }

    //채팅보낸다.
    $('#input-form').on('submit', function(e){
        $.post('/messages', {
            msg: $chatmsg.val(),
            name: username
        });
        $chatmsg.val("");
        $chatmsg.focus();
        return false;
    });

    // es.onmessage -> 채팅로그에 이름과 채팅내용이 보여진다.
    var addMessage = function(data) {
        var text = "";
        if (!isBlank(data.name)) {
            text = '<strong>' + data.name + ':</strong> ';
        }
        text += data.msg;
        $chatlog.prepend('<div><span>' + text + '</span></div>');
    };

    var es = new EventSource('/stream');
    console.log("eventSource", es)
    es.onopen = function(e) {
        console.log("es.onopen")
        $.post('users/', {
            name: username
        });
    }
    es.onmessage = function(e) {
        console.log("es.onmessage")
        var msg = JSON.parse(e.data);
        addMessage(msg);
    };

    window.onbeforeunload = function() {
        console.log("window.onbeforeunload")
        $.ajax({
            url: "/users?username=" + username,
            type: "DELETE"
        });
        es.close()
    };

})