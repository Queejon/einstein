const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('graceful-fs');

const config = JSON.parse(fs.readFileSync('ref/config.json'));
client.login(config.login);

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', (msg) => {

});

client.on('messageDelete', (msg) => {
    const channel = msg.guild.channels.cache.get(config.logging_channel);
    channel.send(`**DELETED:**
    Message by \`${msg.author.username}#${msg.author.discriminator}\` in <#${msg.channel.id}>:
    \`${msg.content}\`
    `);
});

client.on('messageUpdate', (msg) => {
    const channel = msg.guild.channels.cache.get(config.logging_channel);
    channel.send(`**EDITED:**
    Message by \`${msg.author.username}#${msg.author.discriminator}\` in <#${msg.channel.id}>:
    was: \`${msg.content}\`
    now: \`${msg.channel.messages.cache.get(msg.id).content}\`
    `)
});