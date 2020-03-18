const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('graceful-fs');

const config = JSON.parse(fs.readFileSync('ref/config.json'));
client.login(config.login);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', (msg) => {
    const message = msgprecon(msg);
    if(message == null) return;
    if(message == 'test'){
        //msg.reply(`\`\`\`I here you loud and clear!\`\`\``);
    }
    else if(message.substring(0, message.indexOf(' ')).toLowerCase() == 'roll'){
        roll(msg, message.substring(5, message.indexOf('d')), message.substring(message.indexOf('d')+1));
    }
    else if(message.toLowerCase() == 'roll'){
        msg.reply(`you need to specify a number of dice and sides (i.e. 1d6).`);
    }
});

client.on('messageDelete', (msg) => {
    const channel = msg.guild.channels.cache.get(config.logging_channel);
    if(!loggingChannelBlacklist(msg)) return;
    channel.send(`**DELETED:**
    Message by \`${msg.author.username}#${msg.author.discriminator}\` in <#${msg.channel.id}>:
    \`${msg.content}\`
    `);
});

client.on('messageUpdate', (msg) => {
    const channel = msg.guild.channels.cache.get(config.logging_channel);
    if(!loggingChannelBlacklist(msg)) return;
    channel.send(`**EDITED:**
    Message by \`${msg.author.username}#${msg.author.discriminator}\` in <#${msg.channel.id}>:
    was: \`${msg.content}\`
    now: \`${msg.channel.messages.cache.get(msg.id).content}\`
    `)
});

function loggingChannelBlacklist(msg){
    for(let k = 0; k < config.logging_channel_blacklist.length; k++){
        if(msg.channel.id == config.logging_blacklist[k])
            return true;
    }
    return false;
}

function loggingUserBlacklist(msg){
    for(let k = 0; k < config.logging_user_blacklist.length; k++){
        if(msg.channel.id == config.logging_blacklist[k])
            return true;
    }
    return false;
}

function msgprecon(msg){
    msg.content = msg.content.trim();
    if(msg.content.charAt(0) != '$') return null;
        return msg.content.substring(1);
}

function roll(msg, numofdice, numofsides){
    //console.log(`Number of dice: ${numofdice}`);
    //console.log(`Number of sides: ${numofsides}`);
    numofdice = new Number(numofdice);
    numofsides = new Number(numofsides);
    var result = 0;
    try{
        var resultarr = new Array(numofdice);
    }
    catch{
        msg.channel.send('ERR too many dice!');
        return;
    }
    try{
        for(let roll = 1; roll <= numofdice; roll++){
          resultarr[roll] = randomnum(1, numofsides);
          //console.log(resultarr[roll]);
          result += resultarr[roll];
        }
    }
    catch{
        msg.channel.send('ERR too many sides!');
        return;
    }
    result = 'Total: ' + result + '     Rolls: '
    for(let roll = 1; roll <= numofdice; roll++){
        if(roll != numofdice){
            result = result + resultarr[roll] + ', ';
        }
        else{
            result = result + resultarr[roll];
        }
    }
    //console.log(result);
    msg.channel.send(result.toString());
}

function randomnum(min, max){
    return Math.floor(Math.random()*(max-min+1))+min;
}