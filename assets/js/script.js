var bots = [];

/* Returns a link to a user avatar image */
function genUserAvatar(seed) {
  return "https://avatars.dicebear.com/api/gridy/" + seed + ".svg?colorful=1&deterministic=1";
}

/* Returns a link to a bot avatar image */
function genBotAvatar(seed) {
  return "https://avatars.dicebear.com/api/bottts/" + seed + ".svg?colorful=1&mouthChance=50&sidesChance=50&topChance=50";
}

/* Initializes the bots list with a set number of new bots */
function initializeBots(count) {
  bots = [];
  for (var i = 0; i < count; i++) {
    var newBot = {
      seed: Math.floor(Math.random() * 1000000) + 1
    };
    newBot.url = genBotAvatar(newBot.seed);
    bots.push(newBot);
  }
}