var bots = [];
var users = [];
var triviaUrl = ""
var currentQuestionIndex = 0;
var allQuestions = [];
var availableAnswers;

var currentGameData = {
  difficulty: "",
  category: "",
  questions: -1,
  score: -1
};

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

/* Callback function to handle bot behavior at set interval */
function botHandler(botIdx) {
  var answerChance = 0.25; // Probability that bot will answer

  /* Check if bot will answer */
  if (!bots[botIdx].answered && (Math.random() < answerChance)) {
    var botAnswer;
    var answerIndex = Math.floor(Math.random() * availableAnswers.length);

    bots[botIdx].answered = true;

    /* Randomly select an answer */
    botAnswer = availableAnswers[answerIndex];

    /* Remove selected answer from available answers */
    availableAnswers.splice(answerIndex, 1);

    /* Render answer */
    renderAnswer(bots[botIdx].url, botAnswer);

    /* Process if answer is correct */
    processBotAnswer(botAnswer);
  }
}

/* Starts up the bot engine for all bots */
function startBotEngine() {
  var botTimer = 4000; // base ms timer for each bot

  availableAnswers = allQuestions[currentQuestionIndex].answers;
  for (var i = 0; i < bots.length; i++) {
    var timerRand = Math.floor(Math.random() * 1000);

    bots[i].answered = false;
    bots[i].interval = setInterval(botHandler, botTimer + timerRand, i);
  }
}

/* Stops bot engine for all bots */
function stopBotEngine() {
  for (var i = 0; i < bots.length; i++) {
    clearInterval(bots[i].interval);
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
  // var triviaUrl = "https://opentdb.com/api.php?amount=10&type=multiple"

  setCurrentGameData();
  $.ajax({
    url: triviaUrl,
    method: "GET"
  }).then(startGame);


});

/*Starts the game */
function startGame(response) {
  // console.log(response)
  //store required data to global
  for (var i = 0; i < response.results.length; i++) {
    var newQuestion = {
      question: response.results[i].question,
      answers: putAnswersArray(response, i),
      correctAnswer: response.results[i].correct_answer
    }
    allQuestions.push(newQuestion)
  }
  // console.log(allQuestions)

  initializeBots(4);
  renderQuestion();
  startBotEngine();
}

function renderQuestion() {
  $("#questionDisplay").html(allQuestions[currentQuestionIndex].question)
  $("#answerDisplay").empty()
  //display answers
  for (var i = 0; i < allQuestions[currentQuestionIndex].answers.length; i++) {
    var answerBtn = $("<button>")
    answerBtn.html(allQuestions[currentQuestionIndex].answers[i])
    $("#answerDisplay").append(answerBtn)
    answerBtn.on("click", function () {
      processAnswer(allQuestions[currentQuestionIndex].answers[i])
    })
  }
}

function processAnswer(answer) {
  if (answer === allQuestions[currentQuestionIndex].correctAnswer) {
    score++;
    $("#correctAnswerDiv").removeClass("hidden")
  }
  else {
    $("#wrongAnswerDiv").removeClass("hidden")
    $("#wrongAnswerDiv").html("Correct Answer: " + allQuestions[currentQuestionIndex].correctAnswer)
  }
  finishQuestion();
}

/* Checks if a bot answer is correct and halts current question if it is*/
function processBotAnswer(answer) {
  if (answer === allQuestions[currentQuestionIndex].correctAnswer) {
    $("#botAnswerDiv").html("An opponent answered first: " + allQuestions[currentQuestionIndex].correctAnswer);
    $("#botAnswerDiv").removeClass("hidden");
    finishQuestion();
  }
}


$("#next-button").on("click", function () {
  $("#correctAnswerDiv").addClass("hidden");
  $("#wrongAnswerDiv").addClass("hidden");
  $("#botAnswerDiv").addClass("hidden");
  currentQuestionIndex++;
  $("#questionDisplay").removeClass("hidden")
  $("#answerDisplay").removeClass("hidden")
  renderQuestion();
  startBotEngine();
})

function displayQuestion(response) {
  $("#questionDiv").text(response.results[currentQuestionIndex].question)
}


function putAnswersArray(response, i) {
  var CurrentAnswerArray = response.results[i].incorrect_answers.concat(response.results[i].correct_answer)
  // console.log(answerArray)
  shuffle(CurrentAnswerArray);
  return CurrentAnswerArray;
}

/* Sets the global current game data */
function setCurrentGameData() {
  currentGameData.difficulty = $("#difficulty").val();
  currentGameData.category = $("#category").val();
  currentGameData.questions = parseInt($("#questionAmount").val());
  currentGameData.score = 0;
}

/* Saves game data to user history */
function saveGameHistory(userIdx) {
  var newHistory = {
    date: dayjs().format("MM/DD/YYYY"),
    time: dayjs().format("h:mmA"),
    difficulty: currentGameData.difficulty,
    category: currentGameData.category,
    score: currentGameData.score + "/" + currentGameData.questions
  };

  users[userIdx].history.push(newHistory);
  saveUsers();
}

function finishQuestion() {
  $("#questionDisplay").addClass("hidden")
  $("#answerDisplay").addClass("hidden")
  $("#next-button").removeClass("hidden")
  stopBotEngine()
}

/* Initialization items */
loadUsers();
