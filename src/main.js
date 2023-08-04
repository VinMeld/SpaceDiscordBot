const Discord = require("discord.js");
const axios = require("axios");
const cron = require("node-cron");
const {
  Client,
  IntentsBitField,
  EmbedBuilder,
  AttachmentBuilder,
} = require("discord.js");
const { TOKEN, GUILD_ID, API_KEY, JWST } = require("../config.json");
const fs = require("fs").promises;
const path = require("path");

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildIntegrations,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

client.on("ready", async () => {
  client.user.setActivity("To INFINITY and BEYOND!!");

  let channel = client.channels.cache.get("790773684616560671");

  cron.schedule(`0 7 * * *`, async () => {
    const response = await axios.get(
      `https://api.nasa.gov/planetary/apod?api_key=${API_KEY}`
    );
    const json = response.data;
    let embed = new EmbedBuilder() // Use MessageEmbed instead of EmbedBuilder
      .setColor("#0099ff") // Set a valid color
      .setTitle(json.title)
      .setImage(json.hdurl)
      .setDescription(json.explanation)
      .setFooter({
        text: `Date: ${json.date} \n Copyright: ${json.copyright}`,
      });
    channel.send({ embeds: [embed] });
  });
});

client.on("interactionCreate", async (interaction) => {
  if (interaction.commandName === "generate") {
    const description = interaction.options.get("description").value;
    console.log("space " + description);
    await interaction.deferReply();
    try {
      const prompt = "JWST " + description;
      const filePath = path.join(__dirname, "output_image.jpg");

      const response = await axios.post(
        "https://api-inference.huggingface.co/models/dallinmackay/JWST-Deep-Space-diffusion",
        { inputs: prompt, options: { wait_for_model: true } },
        {
          headers: { Authorization: `Bearer ${JWST}` },
          responseType: "arraybuffer",
        }
      );

      if (response.status === 200) {
        // Write the response data to a file
        await fs.writeFile(filePath, response.data);

        const attachment = new AttachmentBuilder(filePath).setName("output.jpg");
		let embed = new EmbedBuilder()
			.setTitle("Generated with prompt: " + description)

        await interaction.editReply({ files: [attachment] });
		await interaction.editReply({ embeds: [embed] });
      } else {
        console.error("Request failed with status code", response.status);
        await interaction.editReply({
          content:
            "Sorry, an error occurred while making the request to the API.",
        });
      }
    } catch (error) {
      console.error("Error occurred while generating image:", error);
      await interaction.editReply({
        content: "Sorry, an error occurred while generating the image.",
      });
    }
  } else if (interaction.commandName == "about") {
    await interaction.reply(
      "This bot was created by Vinay \n Sends NASA's APOD once a day and generates images based on JWST data"
    );
  }
});

client.login(TOKEN);
