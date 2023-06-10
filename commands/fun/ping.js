const { SlashCommandBuilder } = require("discord.js");

function countNumberOfUpvotes(message) {
  const upvotes = Array.from(message.reactions.cache).reduce(
    (acc, reaction) => (reaction.includes("🔥") ? 1 : 0),
    0
  );

  // console.log("davor", message.reactions.cache);
  if (upvotes > 0) {
    console.log("reactions", upvotes, message);
  }

  return [upvotes, message];
}

function lastMessageIsNotInThisMonth(messages) {
  const lastMessage = messages[messages.length - 1];
  const lastMessageDate = new Date(lastMessage.createdTimestamp);
  const today = new Date();
  const thisMonth = today.getMonth();
  const thisYear = today.getFullYear();

  return (
    lastMessageDate.getMonth() !== thisMonth ||
    lastMessageDate.getFullYear() !== thisYear
  );
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!"),
  async execute(interaction) {
    await interaction.deferReply();

    let messages = [];
    let message = await interaction.channel.messages
      .fetch({ limit: 1 })
      .then((messagePage) =>
        messagePage.size === 1 ? messagePage.at(0) : null
      );
    while (message) {
      await interaction.channel.messages
        .fetch({ limit: 100, before: message.id })
        .then((messagePage) => {
          messagePage.forEach((msg) => messages.push(msg));

          // Update our message pointer to be last message in page of messages
          message =
            0 < messagePage.size ? messagePage.at(messagePage.size - 1) : null;
        });

      if (lastMessageIsNotInThisMonth(messagePage)) {
        message = null;
      }
    }

    const sortedMessages = messages
      .map((msg) => countNumberOfUpvotes(msg))
      .sort((a, b) => b[0] - a[0]);

    console.log("sortedMessages", sortedMessages);

    const winner = sortedMessages[0]?.[1];
    const secondPlace = sortedMessages[1]?.[1];
    const thirdPlace = sortedMessages[2]?.[1];

    thirdPlace &&
      thirdPlace.reply(
        `This post came in 3rd place with ${sortedMessages[2][0]} upvotes`
      );
    secondPlace &&
      secondPlace.reply(
        `This post came in 2nd place with ${sortedMessages[1][0]} upvotes`
      );
    winner &&
      winner.reply(
        `🔥 This post came in first place with ${sortedMessages[0][0]} upvotes 🔥`
      );

    await interaction.editReply(
      "🎊🎊🎊 Everybody please congratulate this month's winners! 🎊🎊🎊"
    );
  },
};
