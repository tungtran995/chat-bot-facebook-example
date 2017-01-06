var http = require('http');
var logger = require('morgan');
var bodyParser = require('body-parser');
var express = require('express');
var request = require('request');


var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
var server = http.createServer(app);

var tokenPage='EAACCZAsKUw8EBAA4mnkRL2PZBAXT8MCynf9nBAwcCoaflMPQ3XDdNvpIbag4EkFz1yBC6nuFDohcIUyZAzE2ZC7HBBG1s0ZCpmZBo2iSIlwH9m1jo9cuWZC3AtWf1k4EQF3mMMONIHt5OoX2U4lkLoRmNxzL1JfijQHncYkdu9eGAZDZD';




app.get('/', (req, res) => {
  res.send("Home page. Server running okay.");
});

app.get('/webhook', function(req, res) {
  if (req.query['hub.verify_token'] === '1111') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
});

app.post('/webhook', function(req, res) {
  var entries = req.body.entry;
  for (var entry of entries) {
    
    var messaging = entry.messaging;
    for (var message of messaging) {
      var senderId = message.sender.id;
      if (message.message) {
        // If user send text
        if (message.message.text) {
          sendTextMessage(senderId,message.message.text);
        }
        // If user send attachment
        else if (message.message.attachments) {
          //bot.sendAttachmentBack(senderId, message.message.attachments[0]);
          if (message.message.attachments[0].payload != null) {
            
            sendTextMessage(senderId,'Ko biết..');
          }
        }
      }
      // If user click button
      else if (message.postback) {
        
        sendTextMessage(senderId,'Ko biết..');
      }
    }
  }

  res.status(200).send("OK");
});




function sendTextMessage(recipientId, messageText) {
  var senderID = recipientId;
  var messageData = {
    recipient: {
      id: recipientId
    },
    message: {
      text: messageText,
      metadata: "DEVELOPER_DEFINED_METADATA"
    }
  };

  callSendAPI(messageData,senderID);
}





function callSendAPI(messageData,senderID) {
  
  
  request({
      uri: 'https://graph.facebook.com/v2.6/me/messages',
      qs: { access_token: tokenPage },
      method: 'POST',
      json: messageData
  
    }, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var recipientId = body.recipient_id;
        var messageId = body.message_id;
  
        if (messageId) {
          console.log("Successfully sent message with id %s to recipient %s", 
            messageId, recipientId);
        } else {
        console.log("Successfully called Send API for recipient %s", 
          recipientId);
        }
      } else {
        console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
      }
    }); 
    
  
}





app.set('port', process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3003);
app.set('ip', process.env.OPENSHIFT_NODEJS_IP || process.env.IP || "127.0.0.1");

server.listen(app.get('port'), app.get('ip'), function() {
  console.log("Express server listening at %s:%d ", app.get('ip'), app.get('port'));
});