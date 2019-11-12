var express = require('express');
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var MySQLStore = require('express-mysql-session')(session);
var favicon = require('express-favicon');

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

var dbconfig = {
    hostname: "localhost:3306",
    user: 'root',
    password: '1111',
    database: 'ssurbay',
    charset: 'utf8'
};

var conn;

function handleDisconnect(){

    conn = mysql.createConnection(dbconfig);

    conn.connect(function(err){
        if(err){
            console.log('error when connecting to db : ', err);
            setTimeout(handleDisconnect, 2000);
        }
    });

    conn.on('error', function(err){
        console.log('db error', err);
        if(err.code === 'PROTOCOL_CONNECTION_LOST'){
            handleDisconnect();
        }
        else{
            throw err;
        }
    });
}

handleDisconnect();

//바디파서 post방식 데이터 전달
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'));//css,js 적용할 수 있게 해줌//dir과 /지워도 작동함
app.use('/:id', express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.enable('trust proxy');

//favicon
app.use(favicon(__dirname + '/public/img/favicon.ico'));

//세션
var sessionStore = new MySQLStore(dbconfig);
app.use(session({
    secret: '!@#$fateflyys%^&*',
    resave: false,
    saveUninitialized: true,
    store: sessionStore
}));

//bodyparser설정의 위에 있으면 제대로 작동 안함
var router = require('./router/main.js')(app, conn);

//맨 위에 있던 코드 그냥 옮겨봄 **별 문제 없나보네
var port = 3000;
var server = app.listen(port, function () {
    console.log("Express server has started on port " + port)
});

//iptables -t nat -A PREROUTING -p tcp -d [serverip] --dport 80 -j REDIRECT --to-port 3000