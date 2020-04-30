const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('graceful-fs');
const ytdl = require('ytdl-core');

let config = JSON.parse(fs.readFileSync('ref/config.json'));
client.login(config.login);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('guildMemberAdd', (mem) => {
    let config;
    if(fs.existsSync(`ref/servers/${mem.guild.name}.json`))
        config = JSON.parse(fs.readFileSync(`ref/servers/${mem.guild.name}.json`));
    else{
        fs.copyFileSync(`ref/config.json`, `ref/servers/${mem.guild.name}.json`);
        config = JSON.parse(fs.readFileSync(`ref/servers/${mem.guild.name}.json`));
    }
    const channel = client.guilds.cache.get(mem.guild.id).channels.cache.find((channel) => channel.name === config.welcome_channel);
    channel.send(`
    Welcome <@${mem.user.id}>! Please tap/click on this --> <#698280079733555230> <-- for help on using Discord and the servers rules.
    For any further help please contact Jonah.
    `);

    const logging_channel = mem.guild.channels.cache.find((channel) => channel.name === config.logging_channel);
    const logging_channel_backup = mem.guild.channels.cache.find((channel) => channel.name === config.logging_channel_backup);
    logging_channel.send(`
    **JOINED:**
        *User:* \`${mem.user.id}\`
        *Account Age:* \`${new Date(mem.user.createdTimestamp).toLocaleString()} ${((new Date()).toString().split('(')[1] || "").slice(0, -1)}\`
    `);
    logging_channel_backup.send(`
    **JOINED:**
        *User:* \`${mem.user.id}\`
        *Account Age:* \`${new Date(mem.user.createdTimestamp).toLocaleString()} ${((new Date()).toString().split('(')[1] || "").slice(0, -1)}\`
    `);
});

client.on('guildMemberRemove', (mem) => {
    let config;
    if(fs.existsSync(`ref/servers/${mem.guild.name}.json`))
        config = JSON.parse(fs.readFileSync(`ref/servers/${mem.guild.name}.json`));
    else{
        fs.copyFileSync(`ref/config.json`, `ref/servers/${mem.guild.name}.json`);
        config = JSON.parse(fs.readFileSync(`ref/servers/${mem.guild.name}.json`));
    }
    const channel = client.guilds.cache.get(mem.guild.id).channels.cache.find((channel) => channel.name === config.welcome_channel);
    channel.send(`
    Goodbye <@${mem.user.id}>!
    `);

    const logging_channel = mem.guild.channels.cache.find((channel) => channel.name === config.logging_channel);
    const logging_channel_backup = mem.guild.channels.cache.find((channel) => channel.name === config.logging_channel_backup);
    logging_channel.send(`
    **LEFT:**
        *User:* \`${mem.user.id}\`
        *Account Age:* \`${new Date(mem.user.createdTimestamp).toLocaleString()} ${((new Date()).toString().split('(')[1] || "").slice(0, -1)}\`
    `);
    logging_channel_backup(`
    **LEFT:**
        *User:* \`${mem.user.id}\`
        *Account Age:* \`${new Date(mem.user.createdTimestamp).toLocaleString()} ${((new Date()).toString().split('(')[1] || "").slice(0, -1)}\`
    `);
});

client.on('message', (msg) => {
    if(msg.author.id != "689553615068594277")
        if(!languageFilter(msg)){
            const message = msgprecon(msg);
            if(message == null) return;
            if(message == 'test'){
                msg.reply(`\`\`\`I here you loud and clear!\`\`\``);
            }
            //Dice Roll
            else if(message.substring(0, message.indexOf(' ')).toLowerCase() == 'roll'){
                roll(msg, message.substring(5, message.indexOf('d')), message.substring(message.indexOf('d')+1));
            }
            else if(message.toLowerCase() == 'roll'){
                msg.reply(`you need to specify a number of dice and sides (i.e. 1d6).`);
            }
            //Coin Flip
            else if(message.toLowerCase() == 'flip' || message.substring(0, message.indexOf(' ')).toLowerCase() == 'flip' ){
                coin(msg);
            }
            else if(message.toLowerCase() == 'coinflip' || message.substring(0, message.indexOf(' ')).toLowerCase() == 'coinflip'){
                coin(msg);
            }
            else if(message.toLowerCase() == 'flipcoin' || message.substring(0, message.indexOf(' ')).toLowerCase() == 'flipcoin'){
                coin(msg);
            }
            else if(message.toLowerCase() == 'help'){
                msg.reply(`
                **--HELP--**
                *-roll*: specify a number of dice, d, number of sides (i.e. 1d20)
                *-flip/coinflip/flipcoin*: heads or tails
                *-help*: here you are
                *-about*: a small blurb about this me (this bot)
                *-restart*: A command only usable by certain users which restarts the bot
                `);
            }
            else if(message.toLowerCase() == 'about' || message.substring(0, message.indexOf(' ').toLowerCase() == 'about')){
                msg.reply(`
                **--ABOUT--**
                -I am a simple moderation bot meant to aid in the monitoring and running of small Discord servers.
                -I was created by Jonah McConnell over the past few weeks, over the course of around 4 hours.
                -I log all events in the server such as edited messages, and new users. This is to ensure no false accusations make it far and to keep the server a safe place.
                -If you have any questions, please feel free to reach out to Jonah and ask him. He's usually not *too* busy (don't tell him I said that though).
                -For a list of commands and their basic usage, please use my help command.
                `);
            }
            //Restart
            else if(message.toLowerCase() == 'restart'){
                if(msg.author.id == '327925541556453398')
                    throw 'restart initiated';
            }
        }
        else{
            if(msg.deletable)
                msg.delete();
            msg.channel.send(`Message removed for foul language.`);
        }
});

client.on('messageDelete', (msg) => {
    let config;
    if(fs.existsSync(`ref/servers/${msg.guild.name}.json`))
        config = JSON.parse(fs.readFileSync(`ref/servers/${msg.guild.name}.json`));
    else{
        fs.copyFileSync(`ref/config.json`, `ref/servers/${msg.guild.name}.json`);
        config = JSON.parse(fs.readFileSync(`ref/servers/${msg.guild.name}.json`));
    }
    const backup_channel = msg.guild.channels.cache.find((channel) => channel.name === config.logging_channel_backup);
    if(!languageFilter(msg)){
        backup_channel.send(`**DELETED:**
        *Author:* \`${msg.author.username}#${msg.author.discriminator}\` 
        *Channel:* <#${msg.channel.id}> 
        *Creation Timestamp:* \`${new Date(msg.createdTimestamp).toLocaleString()} ${((new Date()).toString().split('(')[1] || "").slice(0, -1)}\`
        *Message:*
        
        /------------------------------------/
        ${msg.content}
        /------------------------------------/
        `);

        const channel = msg.guild.channels.cache.find((channel) => channel.name === config.logging_channel);
        if(loggingChannelBlacklist(msg)) return;
        if(loggingUserBlacklist(msg)) return;
        channel.send(`**DELETED:**
        *Author:* \`${msg.author.username}#${msg.author.discriminator}\` 
        *Channel:* <#${msg.channel.id}> 
        *Creation Timestamp:* \`${new Date(msg.createdTimestamp).toLocaleString()} ${((new Date()).toString().split('(')[1] || "").slice(0, -1)}\`
        *Message:*
        
        /------------------------------------/
        ${msg.content}
        /------------------------------------/
        `);
    }
    else{
        backup_channel.send(`**REMOVED(FOUL_LANGUAGE):**
        *Author:* \`${msg.author.username}#${msg.author.discriminator}\` 
        *Channel:* <#${msg.channel.id}> 
        *Creation Timestamp:* \`${new Date(msg.createdTimestamp).toLocaleString()} ${((new Date()).toString().split('(')[1] || "").slice(0, -1)}\`
        *Message:*
        
        /------------------------------------/
        ${msg.content}
        /------------------------------------/
        `);

        const channel = msg.guild.channels.cache.find((channel) => channel.name === config.logging_channel);
        if(loggingChannelBlacklist(msg)) return;
        if(loggingUserBlacklist(msg)) return;
        channel.send(`**REMOVED(FOUL_LANGUAGE):**
        *Author:* \`${msg.author.username}#${msg.author.discriminator}\` 
        *Channel:* <#${msg.channel.id}> 
        *Creation Timestamp:* \`${new Date(msg.createdTimestamp).toLocaleString()} ${((new Date()).toString().split('(')[1] || "").slice(0, -1)}\`
        *Message:*
        
        /------------------------------------/
        ${msg.content}
        /------------------------------------/
        `);
    }
});

client.on('messageUpdate', (msg) => {
    let config;
    if(fs.existsSync(`ref/servers/${msg.guild.name}.json`))
        config = JSON.parse(fs.readFileSync(`ref/servers/${msg.guild.name}.json`));
    else{
        fs.copyFileSync(`ref/config.json`, `ref/servers/${msg.guild.name}.json`);
        config = JSON.parse(fs.readFileSync(`ref/servers/${msg.guild.name}.json`));
    }
    const backup_channel = msg.guild.channels.cache.find((channel) => channel.name === config.logging_channel_backup);
    backup_channel.send(`**EDITED:**
    Message by \`${msg.author.username}#${msg.author.discriminator}\` in <#${msg.channel.id}>:
    
    
    *Was:* 
    
    /------------------------------------/
    ${msg.content}
    /------------------------------------/
    
    
    *Now:* 
    
    /------------------------------------/
    ${msg.channel.messages.cache.get(msg.id).content}
    /------------------------------------/
    `);

    const channel = msg.guild.channels.cache.find((channel) => channel.name === config.logging_channel);
    if(loggingChannelBlacklist(msg)) return;
    if(loggingUserBlacklist(msg)) return;
    channel.send(`**EDITED:**
    Message by \`${msg.author.username}#${msg.author.discriminator}\` in <#${msg.channel.id}>:
    
    
    *Was:* 
    
    /------------------------------------/
    ${msg.content}
    /------------------------------------/
    
    
    *Now:* 
    
    /------------------------------------/
    ${msg.channel.messages.cache.get(msg.id).content}
    /------------------------------------/
    `);
});

client.on('voiceStateUpdate', (oldState, newState) => {
    let config;
    if(fs.existsSync(`ref/servers/${newState.guild.name}.json`))
        config = JSON.parse(fs.readFileSync(`ref/servers/${newState.guild.name}.json`));
    else{
        fs.copyFileSync(`ref/config.json`, `ref/servers/${newState.guild.name}.json`);
        config = JSON.parse(fs.readFileSync(`ref/servers/${newState.guild.name}.json`));
    }
    const backup_channel = newState.guild.channels.cache.find((channel) => channel.name === config.logging_channel_backup);
    const channel = newState.guild.channels.cache.find((channel) => channel.name === config.logging_channel);

    if(oldState.channel === null && newState.channel != null){
        channel.send(`**VOICE_JOIN:**
        *User:* \`${newState.member.user.username}#${newState.member.user.discriminator}\`
        *Channel:* ${newState.channel}
        `);
        backup_channel.send(`**VOICE_JOIN:**
        *User:* \`${newState.member.user.username}#${newState.member.user.discriminator}\`
        *Channel:* ${newState.channel}
        `);
    }
    else if(oldState.channel != null && newState.channel != null){
        channel.send(`**VOICE_MOVE:**
        *User:* \`${newState.member.user.username}#${newState.member.user.discriminator}\`
        *From Channel:* ${oldState.channel}
        *To Channel:* ${newState.channel}
        `);
        backup_channel.send(`**VOICE_MOVE:**
        *User:* \`${newState.member.user.username}#${newState.member.user.discriminator}\`
        *From Channel:* ${oldState.channel}
        *To Channel:* ${newState.channel}
        `);
    }
    else if(oldState.channel != null && newState.channel == null){
        channel.send(`**VOICE_LEAVE:**
        *User:* \`${newState.member.user.username}#${newState.member.user.discriminator}\`
        *Channel:* ${oldState.channel}
        `);
        backup_channel.send(`**VOICE_LEAVE:**
        *User:* \`${newState.member.user.username}#${newState.member.user.discriminator}\`
        *Channel:* ${oldState.channel}
        `);
    }
    else{
        console.log(`Unknown Voice Event from user ${newState.member.user.username}${newState.member.user.discriminator}`);
    }
});

function loggingChannelBlacklist(msg){
    for(let k = 0; k < config.logging_channel_blacklist.length; k++){
        if(msg.channel.id == config.logging_channel_blacklist[k])
            return true;
    }
    return false;
}

function loggingUserBlacklist(msg){
    for(let k = 0; k < config.logging_user_blacklist.length; k++){
        if(msg.author.id == config.logging_user_blacklist[k])
            return true;
    }
    return false;
}

function msgprecon(msg){
    msg.content = msg.content.trim();
    if(msg.content.charAt(0) != '$') return null;
        return msg.content.substring(1);
}

function languageFilter(msg){
    msg.content = msg.content.toLowerCase();
    for(let k = 0; k < config.banned_words.length; k++)
        if(msg.content.indexOf(config.banned_words[k]) >= 0)
            return true;
    return false;
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

function coin(msg){
    if(randomnum(1,2) == 1)
        msg.reply(`Tails!`);
    else
        msg.reply(`Heads!`);
}

function randomnum(min, max){
    return Math.floor(Math.random()*(max-min+1))+min;
}