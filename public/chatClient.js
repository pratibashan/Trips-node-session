
let socket = io()

//let btnSend = document.getElementById("btnSend")

let chatDiv = $("#chatDiv")
let usersDiv = $("#usersDiv")
let sendMessageForm = $("#sendMessageForm")
let textMessage = $("#textMessage")

$(document).ready(function(){

    sendMessageForm.submit(function(e){
        e.preventDefault()
    
    //sending to the channel/room
        socket.emit('send message',textMessage.val())
        textMessage.val("")

    })

    // textMessage.addEventListener('keypress',function(data){
    //     socket.emit('typing',data.username)
    // })
    socket.on('new message',function(data){
    console.log(data)
    
    usersDiv.html("Number of users connected:"+ data.usersConnected)
    //let userChatMessageTable ="<tablee>"
    //chatDiv.append(`<table class="w3-table w3-striped"><tr><td>${data.username}:&nbsp&nbsp&nbsp${data.msg}</td></tr></table>`)
    chatDiv.append(data.username + ":"+ data.msg + "<br/>")
  })

socket.on('users',function(data){
    console.log(data)
})

})