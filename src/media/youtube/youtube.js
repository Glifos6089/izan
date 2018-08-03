const Discord = require("discord.js");
var queue = [];
var isPlaying = false;
var dispatcher = null;
var voiceChannel = null;
var textChannel = null;
var listenConnection = null;
var listenReceiver = null;
var listenStreams = new Map();
var skipReq = 0;
var skippers = [];
var listening = false;
module.exports = class Youtube {

    constructor() {
    }
    isYoutube(arg) {
        if (arg.toLowerCase().indexOf("youtube.com") > -1) {
            return true;
        }
        else {
            return false;
        }
    }
    play(arg,message) {
        if (this.isYoutube(arg)) {
            message.channel.send("si es youtube papa ty");
        }
        else {
            message.channel.send("No valid search criteria");
        }
    }
    
}