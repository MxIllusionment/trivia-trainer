var bots = [];
var users = [];
var triviaUrl = ""
var currentQuestionIndex = 0;
var allQuestions = [];
var availableAnswers;
var currentUser = -1;


var currentGameData = {
  difficulty: "",
  category: "",
  questions: -1,
  score: -1
};


var categoryData = [
  {
    category: "General Knowledge",
    value: 9
  },
  {
    category: "Books",
    value: 10
  },
  {
    category: "Film",
    value: 11
  },
  {
    category: "Music",
    value: 12
  },
  {
    category: "Musicals and Theatre",
    value: 13
  },
  {
    category: "TV",
    value: 14
  },
  {
    category: "Video Games",
    value: 15
  },
  {
    category: "Board Games",
    value: 16
  },
  {
    category: "Science and Nature",
    value: 17
  },
  {
    category: "Computers",
    value: 18
  },
  {
    category: "Math",
    value: 19
  },
  {
    category: "Mythology",
    value: 20
  },
  {
    category: "Sports",
    value: 21
  },
  {
    category: "Geography",
    value: 22
  },
  {
    category: "History",
    value: 23
  },
  {
    category: "Politics",
    value: 24
  },
  {
    category: "Art",
    value: 25
  },
  {
    category: "Celebrities",
    value: 26
  },
  {
    category: "Animals",
    value: 27
  },
  {
    category: "Vehicles",
    value: 28
  },
  {
    category: "Comic Books",
    value: 29
  },
  {
    category: "Gadgets",
    value: 30
  },
  {
    category: "Anime",
    value: 31
  },
  {
    category: "Cartoons and Animation",
    value: 32
  },

]



/* Initialization and opening of start/user select page */
function openStartPage() {
  renderUsers();
  $(".start-screen").removeClass("hide");
  $("#setup-screen").addClass("hide");
  $("#quiz").addClass("hide");
  $("#history").addClass("hide");
}

/* Initialization and opening of game setup page */
function openSetupPage() {
  $(".start-screen").addClass("hide");
  $("#setup-screen").removeClass("hide");
  $("#quiz").addClass("hide");
  $("#history").addClass("hide");
}

/* Initialization and opening of quiz/game page */
function openQuizPage() {
  $(".start-screen").addClass("hide");
  $("#setup-screen").addClass("hide");
  $("#quiz").removeClass("hide");
  $("#history").addClass("hide");
}

//Initialization and opening of game history page
function openHistoryPage() {
  renderHistory();
  $(".start-screen").addClass("hide");
  $("#setup-screen").addClass("hide");
  $("#quiz").addClass("hide");
  $("#history").removeClass("hide");
}

//click function for navigation buttons
$(".new-user").on("click", function () {
  openStartPage()
})

$(".view-history").on("click", function () {
  openHistoryPage()
})

$(".header").on("click", function () {
  openStartPage()
})

$(".view-setup").on("click", function () {
  openSetupPage()
})

/* Returns a link to a user avatar image */
function genUserAvatar(seed) {
  return "https://avatars.dicebear.com/api/gridy/" + seed + ".svg?colorful=1&deterministic=1&w=100&h=100";
}

/* Returns a link to a bot avatar image */
function genBotAvatar(seed) {
  return "https://avatars.dicebear.com/api/bottts/" + seed + ".svg?colorful=1&mouthChance=50&sidesChance=50&topChance=50&w=100&h=100";
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

/* On-click function for user in list being clicked */
function clickUser() {
  var userIdx = parseInt($(this).attr("data-index"));

  currentUser = userIdx;

  openSetupPage();
}


$(".userButton").on("click", function (name) {
  name = $("#userInput").val()
  currentUser = addUser(name)
  $("#userInput").val("")
  openSetupPage()
})

/* Renders list of users to front end */
function renderUsers() {
  $("#users").empty();
  users.forEach(function (user, idx) {
    var newDiv = $("<div>");
    var newImg = $("<img>").attr("src", user.avatarURL);
    var newSpan = $("<span>").html(user.name);

    newImg.attr("data-index", idx);
    newImg.click(clickUser);

    newDiv.append(newImg);
    newDiv.append(newSpan);
    $("#users").append(newDiv);
  });
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

/* Renders bot answer to front end */
function renderBotAnswer(imgURL, answer) {
  var newBot = $("<div>");
  var newImg = $("<img>").attr("src", imgURL);
  var newSpan = $("<span>").html("answered '" + answer + "'");
  newBot.append(newImg);
  newBot.append(newSpan);
  $("#botDiv").append(newBot);
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
    renderBotAnswer(bots[botIdx].url, botAnswer);

    /* Process if answer is correct */
    processBotAnswer(botAnswer);
  }
}

/* Starts up the bot engine for all bots */
function startBotEngine() {
  var botTimer = 4000; // base ms timer for each bot

  availableAnswers = allQuestions[currentQuestionIndex].answers;
  $("#botDiv").empty();
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

console.log(getTriviaUrl())

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
$("#start-game").on("click", function (event) {

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
  openQuizPage();
  startBotEngine();
}

function renderQuestion() {
  $("#questionDisplay").html(allQuestions[currentQuestionIndex].question)
  $("#answerDisplay").empty()
  //display answers
  for (var i = 0; i < allQuestions[currentQuestionIndex].answers.length; i++) {
    var answerBtn = $("<button>")
    answerBtn.html(allQuestions[currentQuestionIndex].answers[i])
    answerBtn.attr("data-value", allQuestions[currentQuestionIndex].answers[i])
    $("#answerDisplay").append(answerBtn)
    answerBtn.on("click", function () {
      processAnswer($(this).attr("data-value"))
    })
  }
}

function processAnswer(answer) {
  if (answer === allQuestions[currentQuestionIndex].correctAnswer) {
    currentGameData.score++;
    $("#correctAnswerDiv").removeClass("hide")
  }
  else {
    $("#wrongAnswerDiv").removeClass("hide")
    $("#wrongAnswerDiv").html("Correct Answer: " + allQuestions[currentQuestionIndex].correctAnswer)
  }
  finishQuestion();
}

/* Checks if a bot answer is correct and halts current question if it is*/
function processBotAnswer(answer) {
  if (answer === allQuestions[currentQuestionIndex].correctAnswer) {
    $("#botAnswerDiv").html("An opponent answered first: " + allQuestions[currentQuestionIndex].correctAnswer);
    $("#botAnswerDiv").removeClass("hide");
    finishQuestion();
  }
}


$("#next-button").on("click", function () {
  $("#correctAnswerDiv").addClass("hide");
  $("#wrongAnswerDiv").addClass("hide");
  $("#botAnswerDiv").addClass("hide");
  $("#next-button").addClass("hide");
  currentQuestionIndex++;
  $("#questionDisplay").removeClass("hide")
  $("#answerDisplay").removeClass("hide")
  renderQuestion();
  startBotEngine();
})

// function displayQuestion(response) {
//   $("#questionDiv").text(response.results[currentQuestionIndex].question)
// }


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
  $("#questionDisplay").addClass("hide")
  $("#answerDisplay").addClass("hide")
  stopBotEngine()

  if (currentQuestionIndex === allQuestions.length - 1) {
    endGame()
  } else {
    $("#next-button").removeClass("hide");
  }
}

//function to render history
function renderHistory() {
  $("#past_records").empty()
  users[currentUser].history.forEach(function (history) {
    var newHistoryList = $("<li>")
    newHistoryList.text("Date: " + history.date + " , Time: " + history.time + " , Difficulty: " + history.difficulty + " , Category: " + history.category + " , Score: " + history.score)
    $("#past_records").prepend(newHistoryList)
    // console.log("this")
  })

}


//function to end game
function endGame() {
  //call savegamehistory
  saveGameHistory(currentUser)

  // Clear bot display
  $("botDiv").empty();

  //display game over screen with score
  var gameOverDisplay = $("#game-over")
  //display score on gameOverDisplay
  gameOverDisplay.removeClass("hide")
  gameOverDisplay.text("GAME OVER! Your score was: " + currentGameData.score)
  //button to move onto game history
  var gameOverBtn = $("<button>")
  gameOverBtn.text("Continue")
  gameOverDisplay.append(gameOverBtn)
  gameOverBtn.on("click", function () {
    openHistoryPage();
  })
}

/* Initialization items */
loadUsers();
openStartPage();
