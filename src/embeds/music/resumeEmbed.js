export default (songTitle, userNickname) => {
  return {
    embeds: [
      {
        footer: {
          text: `Resumed by: ${userNickname}.`,
          icon_url: "",
        },
        author: {
          name: "Slay_404",
          icon_url: "",
        },
        color: 15418782,
        type: "rich",
        description: `▶️ | The song has been resumed.`,
        title: "Meowdy Partner - Music",
      },
    ],
  };
};
