var bots = [];
var users = [];
var triviaUrl = ""

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
      seed: Math.floor(Math.random() * 1000000) + 1,
      interval: null,
      answered: false
    };
    newBot.url = genBotAvatar(newBot.seed);
    bots.push(newBot);
  }
}

/* Creates a new user, adds it to the list of users, and returns the
   index of the new user */
function addUser(name) {
  var newUser = {
    name: name,
    seed: Math.floor(Math.random() * 1000000) + 1,
    history: []
  }
  newUser.avatarURL = genUserAvatar(name + newUser.seed);
  users.push(newUser);
  saveUsers();

  return users.length - 1;
}

/* Saves all users to local storage */
function saveUsers() {
  localStorage.setItem("trivia-users", JSON.stringify(users));
}

/* Loads users from local storage */
function loadUsers() {
  var loadedUsers = JSON.parse(localStorage.getItem("trivia-users"));

  if (loadedUsers) {
    users = loadedUsers;
  }
}

/* TODO: Renders answer to front end */
function renderAnswer(imgURL, answer) {
  console.log("Render: ", imgURL, answer);
}

/* TODO: Checks if a bot answer is correct and moves the game forward */
function processBotAnswer(answer) {
  console.log("Process Bot Answer: ", answer);
}

/* Callback function to handle bot behavior at set interval */
function botHandler(botIdx) {
  var answerChance = 0.25; // Probability that bot will answer

  /* Check if bot will answer */
  if (!bots[botIdx].answered && (Math.random() < answerChance)) {
    var botAnswer;
    var answerArray;

    bots[botIdx].answered = true;

    /* TODO: Get array of answers for current question */
    answerArray = ["A", "B", "C", "D"]; // TEMP

    /* Randomly select an answer */
    botAnswer = answerArray[Math.floor(Math.random() * answerArray.length)];

    /* Render answer */
    renderAnswer(bots[botIdx].url, botAnswer);

    /* Process if answer is correct */
    processBotAnswer(botAnswer);
  }
}

/* Starts up the bot engine for all bots */
function startBotEngine() {
  var botTimer = 4000; // base ms timer for each bot

  for (var i = 0; i < bots.length; i++) {
    var timerRand = Math.floor(Math.random() * 1000);

    bots[i].answered = false;
    bots[i].interval = setInterval(botHandler, botTimer + timerRand, i);
  }
}

/* Stops bot engine for all bots */
function stopBotEngine() {
  for (var i = 0; i < bots.length; i++) {
    clearInterval(bots[i]);
  }
}

/*get the trivial url based on selections from user */
function getTriviaUrl() {
  var difficulty = $("#difficulty").val()
  var category = $("#category").val()
  var questionAmount = $("#questionAmount").val()

  if (difficulty === "" && category === "") {
    triviaUrl = "https://opentdb.com/api.php?amount=" + questionAmount + "&type=multiple"
  }
  else if (difficulty !== "" && category === "") {
    triviaUrl = "https://opentdb.com/api.php?amount=" + questionAmount + "&difficulty=" + difficulty + "&type=multiple"
  }
  else if (difficulty === "" && category !== "") {
    triviaUrl = "https://opentdb.com/api.php?amount=" + questionAmount + "&category=" + category + "&type=multiple"
  }
  else {
    triviaUrl = "https://opentdb.com/api.php?amount=" + questionAmount + "&category=" + category + "&difficulty=" + difficulty + "&type=multiple"
  }
  return triviaUrl;
}

/* Initialization items */
loadUsers();