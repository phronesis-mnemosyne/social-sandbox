
// Dependencies
var es = require('elasticsearch'),
	_  = require('underscore')._;

// Express server
var express = require('express'),
    app     = express();
     server = require('http').createServer(app);

app.use(require('body-parser').json());
    
// Headers
app.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-Access-Token, Content-Type');
    res.header('Access-Control-Allow-Methods', 'POST, GET, DELETE');
    res.header('X-Content-Type-Options', 'nosniff');
    next();
});
        
// Static content (needs to be before authentication, otherwise it'll get blocked)
app.use('/', express.static('../web'));

app.post('/scrape', function(req, res) {

    var min_lat = req.body.leaflet_bounds._southWest.lat;
    var min_lon = req.body.leaflet_bounds._southWest.lng;
    var max_lat = req.body.leaflet_bounds._northEast.lat;
    var max_lon = req.body.leaflet_bounds._northEast.lng;
    var idx = req.body.name;
    var date = req.body.time.replace(/-/g,'') + '00'

    var spawn = require('child_process').spawn;

    var child = spawn('nohup',['python', '../python/realtimegeo.py',  '-key', '597532d92072442facbe9f8e9f11171a', 
      '-start_date', date,  '-bb', [min_lat,min_lon,max_lat,max_lon].join(','), '-es', 
    'http://10.1.94.103:9200/', '-es_index', idx]);

    child.stdout.on('data', function (data) {
      console.log('stdout: ' + data);
    });

    child.on('error', function (err) {
            console.log('config.launch_command error', err);
    });

    res.send({"sweet":"ok"});
});

    
// Setup routes
var config = {
	'es_path' : 'http://10.1.94.103:9200',
	'index'   : 'instagram_remap'
}

var client = new es.Client({hosts : [config.es_path]});

// require('./routes.js')(app, client, config);
require('./socket.js')(app, server, client, config);

server.listen(3000, function() {
  console.log("Started a server on port 3000");
});
