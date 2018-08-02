const Regex = require("regex");
const Discord = require("discord.js");
const regex = /no\slo\sse\srick/gm;
var guzmanmeter = 0;
module.exports = class Interpreter {
    constructor() {
    }
    readPhrase(message) {
        var str = message;
        let m;
//---------------------------------------------------------------------------santiquiroz regular expressions ----------------------------------------------------------------
        m = regex.exec(str);
        if (m !== null) {
            message.channel.send("parece falso");
        }
        const regex2 = /guzman/gm;
        m = regex2.exec(str);
        if (m !== null) {
            if (guzmanmeter == 0) {
                message.channel.send("Ha escrito el nombre del señor oscuro corran!!!!!");
            }
            else if (guzmanmeter == 1) {
                message.channel.send("Esta cerca!!!!!");
            }
            else if (guzmanmeter == 2) {
                message.channel.send("No mi PAPA no GUZMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA \n AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA \n AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAN");
            }
            else if (guzmanmeter == 3) {
                message.channel.send("AHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH\nAHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH\nAHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH");
            }
            else {
                guzmanmeter = guzmanmeter - 4;
            }
            guzmanmeter++;

        }
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    }
}
