const { TOKEN, GUILD_IDS, CLIENT_ID } = require('../config.json');
const { REST,  } = require('@discordjs/rest');
const { Routes, ApplicationCommandOptionType } = require('discord-api-types/v10');
const commands = [
    {
       name: 'generate',
       description: 'Generates an AI image based on JWST data',
        options: [
            {
                name: 'description',
                description: 'The image to generate',
                type: ApplicationCommandOptionType.String,
                required: true
            }
        ],
    }, 
    {
        name: 'about',
        description: 'Information on author and project',
     }
]

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log("Started refreshing application (/) commands.");
        for (const guildId of GUILD_IDS) {
            await rest.put(
                Routes.applicationGuildCommands(CLIENT_ID, guildId),
                { body: commands }
            )
            console.log(`Successfully registered application commands for guild ${guildId}.`);
        }
        console.log('Successfully registered application commands.');
    } catch(error) {
        console.log(`Error: ${error}`)
    }
})();
