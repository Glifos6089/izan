const Discord = require("discord.js");
const fetchVideoInfo = require("youtube-info");
const ytdl = require("ytdl-core");
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
var YT_API_KEY = "";
module.exports = class Youtube {

    constructor(yt_api_key) {
        YT_API_KEY = yt_api_key;
    }
    isYoutube(arg) {
        if (arg.toLowerCase().indexOf("youtube.com") > -1) {
            return true;
        }
        else {
            return false;
        }
    }
    getID(str, cb) {
        if (this.isYoutube(str)) {
            cb(this.getYoutubeID(str));
        }
        else {
            this.search_video(str, function (id) {
                cb(id);
            });
        }
               
    }
    getID2(str) {
        let cb;
        if (this.isYoutube(str)) {
            cb=this.getYoutubeID(str);
        }
        else {
            this.search_video(str, function (id) {
                cb=id;
            });
        }
        return cb;
               
    }
    getIDModified(str){
        let id = this.getID2(str);
        if (id == null) {
            textChannel.send("Sorry, no search results turned up");
        }
        else {
            isPlaying = true;
            queue.push("placeholder");
            this.playMusic(id);
        }
    }
    search_video(query, callback) {
        request("https://www.googleapis.com/youtube/v3/search?part=id&type=video&q=" + encodeURIComponent(query) + "&key=" + YT_API_KEY, function (error, response, body) {
            var json = JSON.parse(body);
            if (json.items[0] == null) {
                callback(null);
            }
            else {
                callback(json.items[0].id.videoId);
            }
        });
    }
    reduceTrailingWhitespace(string) {
        for (var i = string.length - 1; i >= 0; i--) {
            if (string.charAt(i) == ' ') string = string.slice(0, i);
            else return string;
        }
        return string;
    }
    add_to_queue(strID) {
        if (this.isYoutube(strID)) {
            queue.push(this.getYoutubeID(strID));
        }
        else {
            queue.push(strID);
        }
    }
    play(message, args, member) {
        this.textChannel = message.channel;
        if (this.isYoutube(args)) {
            if (!member.voiceChannel) {
                return;
            }
            if (!voiceChannel) {
                voiceChannel = member.voiceChannel;
            }
            args = this.reduceTrailingWhitespace(args);
            if (args.length != 0) this.playRequest(args);
        }
        else {
            message.channel.send("No valid search criteria");
        }
    }
    playMusic(id) {
        console.log(id);
        //voiceChannel = message.member.voiceChannel;
        voiceChannel.join().then(function (connection) {
            console.log("playing");
            let stream = ytdl("https://www.youtube.com/watch?v=" + id, {
                filter: 'audioonly'
            });
            skipReq = 0;
            skippers = [];
            dispatcher = connection.playStream(stream);
            this.fetchVideoInfo(id, function (err, videoInfo) {
                if (err) throw new Error(err);
                textChannel.send("Now playing **" + videoInfo.title + "**");
            });
            dispatcher.on('end', function () {
                dispatcher = null;
                queue.shift();
                console.log("queue size: " + queue.length);
                if (queue.length === 0) {
                    queue = [];
                    isPlaying = false;
                }
                else {
                    setTimeout(function () {
                        playMusic(queue[0]);
                    }, 2000);
                }
            })
        });
    }
    playRequest(args) {
        if (queue.length > 0 || isPlaying) {
            this.getID(args, function (id) {
                if (id == null) {
                    textChannel.send("Sorry, no search results turned up");
                }
                else {
                    this.add_to_queue(id);
                    this.fetchVideoInfo(id, function (err, videoInfo) {
                        if (err) throw new Error(err);
                        textChannel.send("Added to queue **" + videoInfo.title + "**");
                    });
                }
            });
        }
        else {
            this.getIDModified(args);
        }
    }
    
    getYoutubeID(url) {
        var match = url.match(/v=([0-9a-z_-]{1,20})/i);
        console.log(match ? match['1'] : false)
        return (match ? match['1'] : false);
    }
}