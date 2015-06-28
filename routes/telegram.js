var express = require('express');
var telegram = require('../helpers/telegram.js');
var yahoo = require('../helpers/yahoo.js');
var _ = require('underscore');
var router = express.Router();

router.post('/', function(req, res, next) {

    var telegramUpdate = req.body;

    // Message must start with '/weather'
    var telegramMessage = telegramUpdate.message.text;
    if (telegramMessage.lastIndexOf('/weather', 0) === 0) {

        // Get the chat id and message id to reply to
        var chat_id = telegramUpdate.message.chat.id;
        var reply_to_message_id = telegramUpdate.message.message_id;

        // Get location from the message and make sure it's at least 2 characters long
        var location = telegramMessage.slice(9);
        if (!_.isUndefined(location) && location.length > 2) {

            // Get the weather from Yahoo for the specified location
            yahoo.getWeather(location, function weatherCallback(weatherMessage) {

                // Send weather message with Telegram API
                telegram.sendMessage(chat_id, weatherMessage, reply_to_message_id);

            });

        } else {

                // Send invalid location message with Telegram API
                telegram.sendMessage(chat_id, 'Invalid location.', reply_to_message_id);

        }

    }

    // Send response to Telegram, always OK
    res.statusCode = 200;
    res.end();
});

module.exports = router;
