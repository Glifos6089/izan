const Discord = require("discord.js");
const SpeechService = require('ms-bing-speech-service');
const ytdl = require("ytdl-core");
const request = require("request");
const getYoutubeID = require("get-youtube-id");
const fetchVideoInfo = require("youtube-info");
const ffmpeg = require('fluent-ffmpeg');
const WitSpeech = require('node-witai-speech');
//const decode = require('../interpreter/decodeOpus.js');
const fs = require('fs');
const path = require('path');
/*const opus = require('node-opus');*/
const Youtube = require("../media/youtube/youtube.js")
const Inter= require("../interpreter/interpreter.js");
let interpreter = new Inter();

var voiceConnection;


// Loading the bot token and prefig
const config = require("./config.json");

let youtube = new Youtube(config.yt_api_key);

console.log("starting bot");
  // getting the service (bot)
const client = new Discord.Client();

console.log("starting bing speech service");
const recogniser = new SpeechService({
  language: 'es-COL',
  subscriptionKey: process.env.BING_SPEECH_API_KEY,
});

/*ffmpeg.setFfmpegPath(path.resolve(__dirname, 'node_modules', '.bin', 'ffmpeg'));
ffmpeg.setFfprobePath(
  path.resolve(__dirname, 'node_modules', '.bin', 'ffprobe')
);*/

async function main() {
//----------------------------------------------------------------------------administration commands--------------------------------------------------------------------------  
  client.on("ready", () => {
    // This event will run if the bot starts, and logs in, successfully.
    console.log(`Bot has started, with ${client.users.size} users, in ${client.channels.size} channels of ${client.guilds.size} guilds.`); 
    client.user.setActivity(`using ${client.guilds.size} servers to conquer the world`);
  });
  
  client.on("guildCreate", guild => {
    // This event triggers when the bot joins a guild.
    console.log(`New guild joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`);
    client.user.setActivity(`Serving ${client.guilds.size} servers`);
  });
  
  client.on("guildDelete", guild => {
    // this event triggers when the bot is removed from a guild.
    console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
    client.user.setActivity(`Serving ${client.guilds.size} servers`);
  });
  client.on("message", async message => {
    // This event will run on every single message received, from any channel or DM.
    if(message.author.bot) return;
  
    if(message.content.indexOf(config.prefix) !== 0) {
      interpreter.readPhrase(message);
    }
  
    // Here we separate our "command" name, and our "arguments" for the command. 
    // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
    // command = say
    // args = ["Is", "this", "the", "real", "life?"]
    
    const args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    
    // Let's go with a few common example commands!.
    
    if(command === "ping") {
      // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
      // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip)
      const m = await message.channel.send("Ping?");
      m.edit(`Pong! Latency is ${m.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(client.ping)}ms`);
    }
    
    if(command === "say") {
      // makes the bot say something and delete the message. As an example, it's open to anyone to use. 
      // To get the "message" itself we join the `args` back into a string with spaces: 
      const sayMessage = args.join(" ");
      // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
      message.delete().catch(O_o=>{}); 
      // And we get the bot to say the thing: 
      message.channel.send(sayMessage);
    }
    
    if(command === "kick") {
      // This command must be limited to mods and admins. In this example we just hardcode the role names.
      // Please read on Array.some() to understand this bit: 
      // https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Array/some?
      if(!message.member.roles.some(r=>["Administrator", "Moderator"].includes(r.name)) )
        return message.reply("Sorry, you don't have permissions to use this!");
      
      // Let's first check if we have a member and if we can kick them!
      // message.mentions.members is a collection of people that have been mentioned, as GuildMembers.
      // We can also support getting the member by ID, which would be args[0]
      let member = message.mentions.members.first() || message.guild.members.get(args[0]);
      if(!member)
        return message.reply("Please mention a valid member of this server");
      if(!member.kickable) 
        return message.reply("I cannot kick this user! Do they have a higher role? Do I have kick permissions?");
      
      // slice(1) removes the first part, which here should be the user mention or ID
      // join(' ') takes all the various parts to make it a single string.
      let reason = args.slice(1).join(' ');
      if(!reason) reason = "No reason provided";
      
      // Now, time for a swift kick in the nuts!
      await member.kick(reason)
        .catch(error => message.reply(`Sorry ${message.author} I couldn't kick because of : ${error}`));
      message.reply(`${member.user.tag} has been kicked by ${message.author.tag} because: ${reason}`);
  
    }
    
    if(command === "ban") {
      // Most of this command is identical to kick, except that here we'll only let admins do it.
      // In the real world mods could ban too, but this is just an example, right? ;)
      if(!message.member.roles.some(r=>["Administrator"].includes(r.name)) )
        return message.reply("Sorry, you don't have permissions to use this!");
      
      let member = message.mentions.members.first();
      if(!member)
        return message.reply("Please mention a valid member of this server");
      if(!member.bannable) 
        return message.reply("I cannot ban this user! Do they have a higher role? Do I have ban permissions?");
  
      let reason = args.slice(1).join(' ');
      if(!reason) reason = "No reason provided";
      
      await member.ban(reason)
        .catch(error => message.reply(`Sorry ${message.author} I couldn't ban because of : ${error}`));
      message.reply(`${member.user.tag} has been banned by ${message.author.tag} because: ${reason}`);
    }
    
    if(command === "purge") {
      // This command removes all messages from all users in the channel, up to 100.
      
      // get the delete count, as an actual number.
      const deleteCount = parseInt(args[0], 10);
      
      // Ooooh nice, combined conditions. <3
      if(!deleteCount || deleteCount < 2 || deleteCount > 100)
        return message.reply("Please provide a number between 2 and 100 for the number of messages to delete");
      
      // So we get our messages, and delete them. Simple enough, right?
      const fetched = await message.channel.fetchMessages({limit: deleteCount});
      message.channel.bulkDelete(fetched)
        .catch(error => message.reply(`Couldn't delete messages because of: ${error}`));
    }
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------- santiquiroz commands--------------------------------------------------------------
    if(command =="puto"){
      message.reply("el que lo lea");
    }
    if(command === "join"){
     var canal = message.member.voiceChannel;
     canal.join().then(conn => {
       voiceConnection = conn;
     });
    }
    if(command === "leave"){
      var canal = message.member.voiceChannel;
      canal.leave().then(conn => {
      });
    }
    if(command === "pcplay"){
      const broadcast = client.createVoiceBroadcast();
    broadcast.playFile('./02. us.mp3');
    // Play "music.mp3" in all voice connections that the client is in
    for (const connection of client.voiceConnections.values()) {
      connection.playBroadcast(broadcast);
    }
      const dispatcher = voiceConnection.playBroadcast('./02. us.mp3');
      message.channel.send(dispatcher);
    }
    if(command === "pcpause"){
      voiceConnection.pause();
    }
    if(command === "pcunpause"){
      voiceConnection.resume();
    }
    if(command === "pcstop"){
      voiceConnection.destroy();
    }
    if(command === "ytplay"){
      youtube.play(message,args[0],message.member);
    }
    if(command === "ytpause"){
      youtube.pause();
    }
    if(command === "ytunpause"){
      youtube.unpause();
    }
    if(command === "ytskip"){
      youtube.unpause();
    }
    
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------
//---------------------------------------------------------------------------------voice recognition commands-------------------------------------------------------------
  
  if (command === 'listen') {
    if (message.member.voiceChannel) {
      const channel = message.member.voiceChannel;
      const { name: channelName } = channel;
      const connection = await channel.join();

      if (connection) {
        message.react('👍');
        console.log(`>> Joined: ${channelName}`);

        connection.on('authenticated', console.log);
        connection.on('debug', console.log);
        connection.on('disconnect', console.log);
        connection.on('error', console.log);
        connection.on('failed', console.log);
        connection.on('newSession', console.log);
        connection.on('ready', console.log);
        connection.on('reconnecting', console.log);
        connection.on('warn', console.log);

        const receiver = connection.createReceiver();
        receiver.on('debug', console.log);

        const voiceStream = receiver.createOpusStream(message.member.user);
        voiceStream.on('data', chunk => {
          console.log(`Received ${chunk.length} bytes of data.`);
        });

        try {
          const out = fs.createWriteStream('./audio.wav');
          ffmpeg(voiceStream)
            .inputFormat('s32le')
            .audioFrequency(16000)
            .audioChannels(1)
            .audioCodec('pcm_s16le')
            .format('s16le')
            .on('error', console.error.bind(console))
            .pipe(out);
        } catch (error) {
          console.log(error);
        }
        // let utteranceStream;
        // let file;

        // connection.on('speaking', async (user, isSpeaking) => {
        // if (isSpeaking) {
        // console.log(`${user.tag} started speaking`);
        // // Create a temp stream to store the current utterance
        // // utteranceStream = new Transform({
        // // transform(chunk, encoding, callback) {
        // // this.push(chunk);
        // // callback();
        // // },
        // // });
        // file = fs.createWriteStream('./audiodata.pcm');
        // // Start sending the voice stream there
        // voiceStream.pipe(file);
        // } else {
        // console.log(`${user.tag} stopped speaking`);
        // if (file) {
        // voiceStream.unpipe(file);
        // file.end();
        // connection.playFile('./audiodata.pcm');
        // }
        // if (utteranceStream) {
        // // Stop sending the voice stream into the utterance
        // voiceStream.unpipe(utteranceStream);
        // // End the utterance stream
        // utteranceStream.end();

        // connection.playFile('./audiodata.pcm');

        // try {
        // const resp = await recogniser.sendStream(utteranceStream);
        // console.log('bing resp', resp);
        // // console.log(recogniser.telemetry);
        // } catch (err) {
        // console.log('bing err', err);
        // }
        // }
        // }
        // });
      } else {
        message.react('👎');
      }
    } else {
      message.react('👎');
    }
  }
  if (command === 'stopListening') {
    if (message.member.voiceChannel) {
      const channel = message.member.voiceChannel;
      const { name: channelName } = channel;
      console.log(`>> Leaving: ${channelName}`);
      channel.leave();
    }
  }
//---------------------------------------------------------------------------------------------------------------------------------------------------------------------
  
  });
  
  client.login(config.token);
}
main();



