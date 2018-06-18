
const mustacheExpress = require('mustache-express')
const bodyParser = require('body-parser')
const session = require('express-session')

var express = require('express')
var app = express()

var http = require('http').Server(app);

// io is socket.io instance
var io = require('socket.io')(http)


let currentUser = {} 
let userArray = []
let connections = []

//init session
app.use(session({
    secret: 'TripsInfo',
    resave: false,
    saveUninitialized: false
  }))


app.engine('mustache',mustacheExpress())
app.set('views','./views')
app.set('view engine','mustache')

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static('public'))


app.get('/register',function(req,res){
    res.render('register')
})

app.get('/',function(req,res){

    res.render('home')

})
app.post('/homeregister',function(req,res){
    res.render('register')
})

app.post('/homelogin',function(req,res){
    res.render('login')
})
app.post('/register',function(req,res){


    let username = req.body.userName.toLowerCase()
    let userpassword = req.body.userPassword.toLowerCase()

    let user = { name : username , password : userpassword, trips : []}

    userArray.push(user)

    //res.send('registered')
    res.redirect('login')
})   

app.get('/login',function(req,res){
    res.render('login')
})


app.post('/login',function(req,res){

    
    let loginName = req.body.loginName.toLowerCase()
    let loginPassword = req.body.loginPassword.toLowerCase()

     // get the user out of the array 
     // matching username and password 
    currentUser = userArray.find(function(user){
        return user.name == loginName && user.password == loginPassword
    })

    console.log(currentUser)

    if(currentUser) {
        if(req.session) { 
            req.session.username = loginName  
            //setting the expiration date for the cookie    
            var hour = 3600000
            req.session.cookie.expires = new Date(Date.now() + hour)
            req.session.cookie.maxAge = hour
            }
        res.redirect('admin/index')    
    }
    else {
        
        res.redirect('register')
       
    }   
  

})   

function validateLogin(req,res,next) {

        if(req.session.username) {
          next()
        } else {
          res.redirect('/')
        }
      
      }
app.all('/admin/*',validateLogin,function(req,res,next){
        next()
    })
          
 
app.get('/admin/index',function(req,res){

     res.render('admin/index',{username : req.session.username})    
})


app.post('/admin/trips',function(req,res){

    console.log(req.body.tripImageUrl)
    let tripName = req.body.tripName
    let tripImageUrl = req.body.tripImageUrl
    let departureDate = req.body.dateDepature
    let returnDate = req.body.dateReturn
                
    if(req.session) {

        currentUser.trips.push({
            tripId : guid(),
            tripName : tripName,
            tripImageUrl:tripImageUrl,
            departureDate: departureDate,
            returnDate: returnDate
        })
        
    }            
  
    
    res.render('admin/trips',{tripList : currentUser.trips})
  
})

app.get("/admin/trips",function(req,res){
    res.render('admin/trips',{tripList : currentUser.trips})
})

app.post('/deleteTrip',function(req,res){
    let tripId = req.body.tripId

    let trips = currentUser.trips 

    currentUser.trips = trips.filter(function(trip){
        return trip.tripId != tripId
    })
    
    res.redirect('admin/trips')
})

app.post('/logout',function(req,res){
    req.session.destroy()
    currentUser={}
    res.redirect('/login')
})


function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
      }


//user chat app
let sessionUser = ""
app.post('/chat',function(req,res){
    sessionUser = req.session.username
     res.sendFile(__dirname + '/chat.html')
})
 
io.sockets.on('connection',function(socket){

    console.log('USER IS CONNECTED!!!')
    connections.push(socket)
    console.log("Connected: %s sockets connected",connections.length)
    
    
        //Disconnect
    socket.on('disconnect',function(){
        connections.splice(connections.indexOf(socket),1)
        console.log('Disconnected: %s sockets connected',connections.length)
    
    })
    socket.username = sessionUser

    socket.on('change_username',function(data){

             socket.username = data.username
        })  

    socket.on('send message',function(data){
        
        io.sockets.emit('new message',{msg:data,username:socket.username,usersConnected:connections.length})

    })

    // socket.on('typing',function(data){
    //     socket.broadcast.emit('typing',)
    // })

    
    
    })
    
    
    

//app.listen(3000,function(){
 //   console.log('app listening on port 3000')
//})

http.listen(3000,function(){
    console.log('app listening on port 3000')
})