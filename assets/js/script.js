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
      seed: Math.floor(Math.random() * 1000000) + 1
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

/*shuffles an array put into it */
function shuffle(array) {
  var currentIndex = array.length, tempValue, randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    tempValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = tempValue;
  }
  return array;
}


/*for when we click to play game, this gets the url */
$("#play-game").on("click", function (event) {

  var triviaUrl = getTriviaUrl();
  $.ajax({
    url: triviaUrl,
    method: "GET"
  }).then();
});
/* Initialization items */
loadUsers();
