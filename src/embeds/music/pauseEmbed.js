export default (songTitle, userNickname) => {
  return {
    embeds: [
      {
        footer: {
          text: `paused by: ${userNickname}.`,
          icon_url: "",
        },
        author: {
          name: "Slay_404",
          icon_url: "",
        },
        color: 15418782,
        type: "rich",
        description: `⏸️ | The song **${songTitle}** has been paused!`,
        title: "Meowdy Partner - Music",
      },
    ],
  };
};
