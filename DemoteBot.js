/*
>====>                                          >=>             >=>>=>                 >=>   
>=>   >=>                                       >=>             >>   >=>               >=>   
>=>    >=>   >==>    >===>>=>>==>     >=>     >=>>==>   >==>    >>    >=>    >=>     >=>>==> 
>=>    >=> >>   >=>   >=>  >>  >=>  >=>  >=>    >=>   >>   >=>  >==>>=>    >=>  >=>    >=>   
>=>    >=> >>===>>=>  >=>  >>  >=> >=>    >=>   >=>   >>===>>=> >>    >=> >=>    >=>   >=>   
>=>   >=>  >>         >=>  >>  >=>  >=>  >=>    >=>   >>        >>     >>  >=>  >=>    >=>   
>====>      >====>   >==>  >>  >=>    >=>        >=>   >====>   >===>>=>     >=>        >=>  
                                                                                             
*/
// This was a joke but it still works

const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');


// CONFIG
// NOTE: Bot must have administrator permissions and be the highest role in the server
const applicationID = '' // Your bot application ID
const rolesToRemove = ['']; // Roles to take away during demotion
const roleToGive = '' // Roles to give when demoting (do not make higher than demoting roles)
const rolesToPromote = [''] // Roles to give when promoting
const guildID = '' // Your server ID DemoteBot will be running in
const botToken = '' // Your bot token

//////////////////////////////
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});
const commands = [
    new SlashCommandBuilder().setName('demote').setDescription('Demote a user'),
    new SlashCommandBuilder().setName('promote').setDescription('Promote a user'),
];
const rest = new REST({ version: '9' }).setToken(botToken);
const Demoted = [];
const demoteCooldown = new Map();
function Demote(ID) {
    Demoted.push(ID);
}
function IsDemoted(ID) {
    if (Demoted.includes(ID)) {
        return true;
    } else {
        return false;
    }
}
client.once('ready', async () => {
    console.log('Ready!');
    client.user.setPresence({
        activity: {
            name: 'oihan get demoted',
            type: 'WATCHING'
        },
        status: 'idle'
    });
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(applicationID, guildID),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;
    const filter = (m) => m.author.id === interaction.user.id;
    if (commandName === 'demote') {

        const now = Date.now();
        if (demoteCooldown.has(interaction.user.id)) {
            const lastUseTime = demoteCooldown.get(interaction.user.id);
            const timeRemaining = 5 * 60 * 1000 - (now - lastUseTime);
            const embed = new EmbedBuilder()
                .setColor('#ec1313')
                .setTitle('cooldown')
                .setDescription(`hey IDIOT!! you're ${timeRemaining / 1000} seconds too early, try again later`);
            await interaction.reply({ embeds: [embed] });
            return
        }
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('DemoteBot')
            .setDescription(`who do you wanna demote today? mention them pls`);

        await interaction.reply({ embeds: [embed] });
        const collector = interaction.channel.createMessageCollector({ filter, time: 15000 });

        collector.on('collect', async (m) => {
            const member = m.mentions.members.first();

            if (!member) {
                const embed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('error')
                    .setDescription(`that's not actually a person you idiot`);

                await interaction.followUp({ embeds: [embed] });
                collector.stop();
                return;
            }
            /*
            if (m.author.id !== '449950252397494274') {
              const embed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('didn\'t work + ratio')
                .setDescription('hey NERD!!!! you can\'t actually demote people hat\'s reserveed for peixlez lololol');
      
              await interaction.followUp({ embeds: [embed] });
              return;
            }
            */

            try {
                await member.roles.remove(rolesToRemove);
                const newRole = interaction.guild.roles.cache.find(role => role.id === roleToGive);
                if (newRole) {
                    await member.roles.add(newRole);
                }
                Demote(member.id)
                const embed = new EmbedBuilder()
                    .setColor('#00ff00')
                    .setTitle('Success')
                    .setDescription(`Successfully demoted ${member.user.username}.`);
                demoteCooldown.set(m.author.id, now);
                setTimeout(() => {
                    demoteCooldown.delete(m.author.id);
                }, 300000);

                await interaction.followUp({ embeds: [embed] });
                collector.stop();
            } catch (error) {
                const embed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('Error')
                    .setDescription(`Failed to remove roles: ${error}`);

                await interaction.followUp({ embeds: [embed] });
                collector.stop();
            }
        });

        collector.on('end', async () => {
            await interaction.followUp('hey NERD you axctually have to MMENTION somebody next time lol olo lg');
        });
    }
    if (commandName === 'promote') {
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('DemoteBot')
            .setDescription(`who will be promoted? they have to have been demoted before`);

        await interaction.reply({ embeds: [embed] });

        const filter = m => m.author.id === interaction.user.id;
        const collector = interaction.channel.createMessageCollector({ filter, time: 15000 });

        collector.on('collect', async message => {
            const member = message.mentions.members.first();
            if (!member) return;

            const isDemoted = IsDemoted(member.id);
            if (isDemoted) {
                await member.roles.add(rolesToPromote);
                const embed = new EmbedBuilder()
                    .setColor('#ec1313')
                    .setTitle('pormoten')
                    .setDescription(`i promoted that user, soon to be demoted again `);

                await interaction.followUp({ embeds: [embed] });
            } else {
                const embed = new EmbedBuilder()
                    .setColor('#ec1313')
                    .setTitle('lol')
                    .setDescription(`hey IDIOT!!!1 this person has to have been demoted before you absoloute NENrd`);

                await interaction.followUp({ embeds: [embed] });
            }

            collector.stop();
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.followUp('Command timed out. Please try again.');
            }
        });
    }
});

///////

client.login(botToken);