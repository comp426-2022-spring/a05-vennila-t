// Place your server entry point code here

// server.js file that takes an arbitrary port number as a command line argument (i.e. I should be able to run it with node server.js. The port should default to 5000 if no argument is given.
const args = require('minimist')(process.argv.slice(2));

// See what is stored in the object produced by minimist
console.log(args)
// Store help text
const help = (`
server.js [options]

--port	Set the port number for the server to listen on. Must be an integer
            between 1 and 65535.

--debug	If set to true, creates endlpoints /app/log/access/ which returns
            a JSON access log from the database and /app/error which throws
            an error with the message "Error test successful." Defaults to
            false.

--log		If set to false, no log files are written. Defaults to true.
            Logs are always written to database.

--help	Return this message and exit.
`)
// If --help or -h, echo help text to STDOUT and exit
if (args.help || args.h) {
    console.log(help)
    process.exit(0)
}

// Require Express.js
const express = require('express')
const app = express()
const db = require('./src/services/database.js')
const fs = require('fs')
const morgan = require('morgan')

// Serve static HTML files
app.use(express.static('./public'));

// Make Express use its own built-in body parser to handle JSON
app.use(express.json());

// Add cors dependency
const cors = require('cors')
// Set up cors middleware on all endpoints
app.use(cors())


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// define port variable
let port;

if (typeof args.port === "undefined") {
  port = 5000;
} else {
  port = args.port;
}

if(args.log == 'false') {
  console.log("Not creating a new access.log")
}
else {
  // Use morgan for logging to files
  // Create a write stream to append (flags: 'a') to a file
  const WRITESTREAM = fs.createWriteStream('access.log', { flags: 'a' })
  // Set up the access logging middleware
  app.use(morgan('combined', { stream: WRITESTREAM }))
}

// Start an app server
const server = app.listen(port, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%',port))
})


// Middleware
app.use( (req, res, next) => {
  let logdata = {
      remoteaddr: req.ip,
      remoteuser: req.user,
      time: Date.now(),
      method: req.method,
      url: req.url,
      protocol: req.protocol,
      httpversion: req.httpVersion,
      status: res.statusCode,
      referer: req.headers['referer'],
      useragent: req.headers['user-agent']
  }
  console.log(logdata)
  const stmt = db.prepare('INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referrer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
  const info = stmt.run(logdata.remoteaddr, logdata.remoteuser, logdata.time, logdata.method, logdata.url, logdata.protocol, logdata.httpversion, logdata.status, logdata.referrer, logdata.useragent)
  next();
  })

if(args.debug === true) {
  app.get('/app/log/access/', (req, res) => {
      const stmt = db.prepare("SELECT * FROM accesslog").all()
      res.status(200).json(stmt)
  });
  app.get('/app/error', (req, res) => {
      throw new Error('Error test successful.')
  });
}

//endpoints
// Check endpoint at /app/ that returns 200 OK.
app.get('/app/', (req, res) => {
// Respond with status 200
	res.status = 200;
// Respond with status message "OK"
    res.statusMessage = 'OK';
    res.writeHead( res.statusCode, { 'Content-Type' : 'text/plain' });
    res.end(res.statusCode+ ' ' +res.statusMessage)
})


// Endpoint /app/flip/ that returns JSON {"flip":"heads"}
// or {"flip":"tails"} corresponding to the results of the random coin flip.
app.get('/app/flip', (req, res) => {
    res.status(200).json({'flip' : coinFlip()})
})

// Endpoint /app/flips/:number that returns JSON including an array of the raw random flips and a summary.
app.get('/app/flips/:number', (req, res) => {
    const flips = coinFlips(req.body.number)
    res.status(200).json({"raw": flips,"summary": countFlips(flips)})
})

// Endpoint /app/flip/call/heads that returns the result of a random flip match against heads or tails as JSON.
app.get('/app/flip/call/:call', (req, res) => {
    res.status(200).json(flipACoin(req.body.call))
})

// Endpoint /app/flip/call/heads that returns the result of a random flip match against heads or tails as JSON.
app.get('/app/flip/call/:call', (req, res) => {
    res.status(200).json(flipACoin(req.body.call))
})

// Endpoint /app/flip/call/heads that returns the result of a random flip match against heads or tails as JSON.
app.get('/app/flip/call/:call', (req, res) => {
    res.status(200).json(flipACoin(req.body.call))
})

// Default API endpoint that returns 404 Not found for any endpoints that are not defined.
app.use(function(req, res){
  res.status(404).send('404 NOT FOUND')
  res.type("text/plain")
})


// functions
function coinFlip() {
  var coin = ["heads", "tails"];
  return coin[Math.floor(Math.random()*coin.length)];
}

function coinFlips(flips) {
    var i = 0;
    var results = new Array();
    while (i < flips) {
      results[i] = coinFlip();
      i++;
    }
    return results;
}

function countFlips(array) {
    if(array.length == 0){
      return;
    }
    var heads = 0;
    var tails = 0;

    for(var i = 0; i < array.length; i++){
      if(array[i] == "heads"){
        heads++;
      }
      else if(array[i] == "tails"){
        tails++;
      }
    }
    if(heads == 0){
      return "{ tails: "+tails+" }";
    }
    else if(tails == 0){
      return "{ heads: "+heads+" }";
    }
    return {"heads": heads, "tails": tails };
}

function flipACoin(call) {
  var flip = coinFlip();
  var result = "";
  if(call == flip){
    result = "win";
  }
  else{
    result = "lose";
  }
  return { "call": call, "flip": flip, "result": result };
}