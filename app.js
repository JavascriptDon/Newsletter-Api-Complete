//jshint esversion: 6
// jshint esversion:8

const express = require("express");
const https = require("https");
const mailchimp = require('@mailchimp/mailchimp_marketing');
const dotenv = require("dotenv");
const async = require("async");
//start express application
const app = express();


// READING ENVIRONMENT VARIABLES
dotenv.config();

//Setting up our static path and Body Parser
app.use(express.static("Public"));
app.use(express.urlencoded({
  extended: true
}));

//Sending the signup page when someone comes to our website || setting up the home route to get requests
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/signup.html");
});

//This code comes from MailChimp's github and is required to set up Mailchimp Connection
mailchimp.setConfig({
  apikey: process.env.API_KEY,
  server: process.env.SERVER
});

//Our post function for after they hit submit.  Grabs the data they sent to us.
app.post("/", function(req, res) {
  const firstname = req.body.fName;
  const lastname = req.body.lName;
  const email = req.body.email;
  const listID = process.env.LIST_ID;
  console.log(firstname, lastname, email);

  var contactdata = {
    email_address: email,
    status: "subscribed",
    merge_fields: {
      FNAME: firstname,
      LNAME: lastname
    }
  };

  const jsonData = JSON.stringify(contactdata);
  const url = process.env.URL + listID + "/members";
  const options = {
    method: "POST",
    auth: process.env.AUTH
  }

  
  const request = https.request(url, options, function(response) {
    console.log(response.statusCode);
    response.on("data", function(contactdata) {
      console.log(JSON.parse(contactdata));
      const data_grab = JSON.parse(contactdata);
      if (data_grab.error_count === 0) {
        res.sendFile(__dirname + "/success.html")
      } else {
        res.sendFile(__dirname + "/failure.html")
      }
      console.log(data_grab.error_count);
    })
  });

  request.write(jsonData);
  request.end();
    //Just a quick response page
  res.sendFile(__dirname + "/success.html");
  // res.send("<h1> You've been successfully signed up to the newsletter, look forward to lots of regular updates! More content coming to you soon! </h1>");
});


//Failure route redirect to home page
app.post("/failure", function(req, res) {
  res.redirect("/");
});

//set up express server to listen to current port
const local_port = process.env.PORT_NUMBER;
app.listen(process.env.PORT || local_port, function(){
  console.log("Server is up and runing on port " + local_port);
});
