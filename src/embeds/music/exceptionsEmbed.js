export function getQueueEmptyEmbed() {
  return {
    embeds: [
      {
        author: {
          name: "Slay_404",
          icon_url: "",
        },
        color: 15418782,
        type: "rich",
        description: `The playlist has come to an end.`,
        title: "Meowdy Partner - Music",
      },
    ],
  };
}

export function getCooldownEmbed() {
  return {
    embeds: [
      {
        author: {
          name: "Slay_404",
          icon_url: "",
        },
        color: 15418782,
        type: "rich",
        description: `Wait a few seconds before sending a new command !`,
        title: "Meowdy Partner - Music",
      },
    ],
    ephemeral: true
  };
}
