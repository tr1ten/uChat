const express = require('express')
const path = require('path')
const { Server } = require("socket.io");
const mongoose = require('mongoose');
const session = require('express-session')
const MongoStore = require('connect-mongo');
const { User, UserMessage } = require('./modals/user')
if(typeof process.env.NODE_ENV ==="undefined"|| process.env.NODE_ENV=="development"){
    require('dotenv').config()
}

const app = express()
const dbUrl = process.env.ATLAS_URL;
console.log('db url ',dbUrl);
const port = process.env.PORT || 8080;
//Set up default mongoose connection
const chatrooms = ['private'];
mongoose.connect(dbUrl, { useNewUrlParser: true });
//Get the default connection
var db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
// setting session
const sessionMiddleware = session({
    secret: "meow",
    resave: false,
    saveUninitialized: false,
    // cookie: {
    //     maxAge: 24 * 60 * 60 * 1000
    // },
    store: MongoStore.create({ mongoUrl: dbUrl })

})
// setting up express configuration
app.use(sessionMiddleware);
app.set('views', path.join(__dirname, '/views'))
app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({ extended: true }));
// routes
app.get('/', async (req, res) => {
    if (req.session.username && req.session.rid) {
        // console.log('user exits', req.session.username);
        res.locals.askUname = false;
        const messages = await  UserMessage.find({room:req.session.rid}).populate('from');
    
        res.render('index', { 'askUname': false, 'rid': req.session.rid ,'messages':(typeof messages === "undefined" ? [] : messages)})

    }
    else {
        // console.log('user not exists');
        res.render('index', { 'askUname': true, 'rid': 'chat message','messages':[] })
    }

});
app.post('/', (req, res) => {
    console.log(req.body)
    req.session.username = req.body.username;
    req.session.rid = req.body.rid;
    res.cookie('roomid',req.body.rid)

    const user = new User({
        _id: req.session.id,
        username: req.session.username,
        rid: req.session.rid,
    })
    user.save().then(() => {
        console.log('user saved', req.body.username);
    })
    res.redirect('/')
})
// socket stuff~
const server = app.listen(port, () => console.log(`Example app listening on port ${port}`))
const io = new Server(server);
io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res, next);
})
io.on('connection', (socket) => {
    const rid = socket.request.session.rid;
    const username = socket.request.session.username;
    console.log(`${username} connected to ${rid}`);
    if (username) {
        io.emit(`join-user-${rid}`, username)
    }
    // if chatroom not exist then create one

    socket.on(rid, (message) => {
        const msg = new UserMessage({
            message: message,
            from: socket.request.session.id,
            room: rid,
        })
        msg.save();
        console.log(` ${username} message in ${rid}:`, message)
        io.emit(rid, `${username} : ` + message)
    })




    socket.on('disconnect', () => {
        console.log('user disconnected');
        if (username) {

            io.emit(`left-user-${rid}`, username)
        }
    });
}
);