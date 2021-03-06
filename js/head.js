require('dotenv').config();
require('datejs');
const db = require('./connection');
const express = require('express');
const routes = require('./router');
const bodyParser = require('body-parser');
const session = require('express-session');

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use('/assets', express.static(__dirname + '/public'));

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));
var port = process.env.PORT
if (!port) {
    port = 4000
}
app.use('/',routes);
db.connect(db.zoodis_mode, (err) =>{
    if(err) {
        console.error('Unable to Connect to MYSQL' + err);
        process.exit(1);
    }
    else {
        let server = app.listen(port,function(){
            console.log('[SERVER] Listening in port: ' + server.address().port);
        }).on('error',function(err){
            console.log('[SERVER] Network related error: Port must be in use.' + err );
            process.exit(1);
        });
    }
});