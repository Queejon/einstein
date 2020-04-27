const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('graceful-fs');

const config = JSON.parse(fs.readFileSync('ref/config.json'));
client.login(config.login);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('guildMemberAdd', (mem) => {
    const channel = client.guilds.cache.get('698279564555583562').channels.cache.get('698279567885991979');
    channel.send(`
    Welcome <@${mem.user.id}>! Please tap/click on this --> <#698280079733555230> <-- for help on using Discord and the servers rules.
    For any further help please contact Jonah.
    `);
    mem.roles.add('702297377436074047');
    const logging_channel = mem.guild.channels.cache.get(config.logging_channel);
    channel.send(`
    **JOINED:**
        *User:* \`${mem.user.id}\`
        *Account Age:* \`${new Date(mem.user.createdTimestamp).toLocaleString()} ${((new Date()).toString().split('(')[1] || "").slice(0, -1)}\`
    `);
});

client.on('guildMemberRemove', (mem) => {
    const channel = client.guilds.cache.get('698279564555583562').channels.cache.get('698279567885991979');
    channel.send(`
    Goodbye <@${mem.user.id}>!
    `);

    const logging_channel = msg.guild.channels.cache.get(config.logging_channel);
    channel.send(`
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
                //msg.reply(`\`\`\`I here you loud and clear!\`\`\``);
            }
            else if(message.substring(0, message.indexOf(' ')).toLowerCase() == 'roll'){
                roll(msg, message.substring(5, message.indexOf('d')), message.substring(message.indexOf('d')+1));
            }
            else if(message.toLowerCase() == 'roll'){
                msg.reply(`you need to specify a number of dice and sides (i.e. 1d6).`);
            }
        }
        else{
            if(msg.deletable)
                msg.delete();
            msg.channel.send(`Message removed for foul language.`);
        }
});

client.on('messageDelete', (msg) => {
    const backup_channel = msg.guild.channels.cache.get(config.logging_channel_backup);
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

        const channel = msg.guild.channels.cache.get(config.logging_channel);
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

        const channel = msg.guild.channels.cache.get(config.logging_channel);
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
    const backup_channel = msg.guild.channels.cache.get(config.logging_channel_backup);
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

    const channel = msg.guild.channels.cache.get(config.logging_channel);
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

function randomnum(min, max){
    return Math.floor(Math.random()*(max-min+1))+min;
}