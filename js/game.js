
var aiSequence = [];
var playerSequence = [];
var currentLevel = 0;
var highestLevel = 0;
var difficulty = 'normal';
var currentColor;
var currentSound;
var timeoutLength;
var speed;
var turn = 'computer';


//Possible colors
var colors = [
	'red',
	'blue',
	'green',
	'yellow'
];

//Possible sounds
var sounds = [
	new Audio('https://s3.amazonaws.com/freecodecamp/simonSound1.mp3'),
	new Audio('https://s3.amazonaws.com/freecodecamp/simonSound2.mp3'),
	new Audio('https://s3.amazonaws.com/freecodecamp/simonSound3.mp3'),
	new Audio('https://s3.amazonaws.com/freecodecamp/simonSound4.mp3')
];

$(document).ready( function() {

	//Lets user change difficulty level
	$('#difficulty').click( function() {
		if (difficulty === 'normal') {
			difficulty = 'strict';
		} else if (difficulty === 'strict') {
			difficulty = 'normal';
		}
	});

	//Flashes a color
	function flashColor(color) {
		$('#' + color).addClass(color + '-flash');
		setTimeout(function() {
			$('#' + color).removeClass(color + '-flash');
		}, 300);
	}

	//Plays a sound
	function playSound(sound) {
		sound.play();
	}

	//Creates a random sequence of color flashes and sounds
	function makeRandomSequence() {
		if (turn === 'computer') {
			//Make a random number (1-4)
			var random = (Math.floor(Math.random() * 4) + 1);

			//Add that random number to the aiSequence
			aiSequence.push(random);
			console.log(aiSequence);

			displayAISequence();
		}
	}

	//For each number in aiSequence array, flash the color and make sound for that number
	function displayAISequence() {
		console.log('Begin displaying aiSequence ' + aiSequence);
		if (currentLevel < 5) {
			speed = 900;
		} else if (currentLevel < 10) {
			speed = 700;
		} else if (currentLevel < 15) {
			speed = 600;
		} else {
			speed = 500;
		}
		
		//Delay the Sequence so the buttons don't all flash at once
		function delaySequence(index, delay){
			setTimeout(function(){
				displayCurrentColorAndSound(aiSequence[index]);
			}, delay);
		}

		function displayCurrentColorAndSound(val) {
			currentColor = colors[val - 1];
			currentSound = sounds[val - 1];
			
			playSound(currentSound);
			flashColor(currentColor);
		}

		for (var i = 0; i < aiSequence.length; i++) {
			timeoutLength = speed + (i * speed);
			//Let time pass before displaying next color
			delaySequence(i, timeoutLength);
		}

		//Start accepting the player sequence after the aiSequence has been displayed
		timeoutLength = speed + (speed * aiSequence.length);
		setTimeout(function() {
			turn = 'player';
		}, timeoutLength);
	}
		
	// Gets the players inputed sequence and converts it to an array
	function addToPlayerSequence(colorNum) {
		if (turn === 'player') {
			var playerPickedColor = colors[colorNum - 1];
			var playerPickedSound = sounds[colorNum - 1];

			//add move to playerSequence
			playerSequence.push(colorNum);
			console.log(playerSequence);

			//Display colors and play sounds as user picks them
			playSound(playerPickedSound);
			flashColor(playerPickedColor);
			
			//Check if the player has entered a long enough sequence
			console.log('playerSequence length is ' + playerSequence.length + ', aiSequence.length is ' + aiSequence.length);
			if (playerSequence.length === aiSequence.length) {
				//stop user entering more colors
				turn = 'computer';
				
				//check if sequences match
				var correct = playerSequence.every(function(val, index) {
					return val === aiSequence[index];
				});

				//if they match, return pass
				if (correct) {
					//update current level and check for win
					getResult('pass');
				} else {
					//display fail alert for difficulty selected
					getResult('fail');
				}

			//If not long enough, check if the last color entered is correct	
			} else if (playerSequence.length < aiSequence.length) {
				var correctColor = playerSequence.every(function(val, index) {
					var sliceOfAISequence = aiSequence.slice(0, index + 1);
					return val === sliceOfAISequence[index];
				});

				//Let user know if they input an incorrect color, otherwise listen for more clicks
				if (!correctColor) {
					//display fail alert for difficulty selected
					getResult('fail');
				}
			}
		}
	}

	//Listen for player input
	$('#red').click(function() {
		addToPlayerSequence(1);
	});
	$('#blue').click(function() {
		addToPlayerSequence(2);
	});
	$('#green').click(function() {
		addToPlayerSequence(3);
	});
	$('#yellow').click(function() {
		addToPlayerSequence(4);
	});

	function getResult(outcome) {

		//if correct sequence, increase level and check for win
		if (outcome === 'pass') {
			//update the score
			console.log('passed');
			currentLevel++;
			$('#currentLevel').html('Current Level: ' + currentLevel);

			checkWin();

		} else if (outcome === 'fail') {
			console.log('failed');
			if (difficulty === 'normal') {
				//Display alert to let user know they got it wrong and to try again
				sweetAlert({
					title: 'Oops, that wasn\'t right',
					text: 'Would you like to try again?',
					type: 'warning',
					showCancelButton: true,
					confirmButtonColor: '#6BE2F9',
					confirmButtonText: 'Yes',
					cancelButtonText: 'No',
					closeOnConfirm: true,
					closeOnCancel: true,
					customClass: 'simonAlert'
				}, function(confirmed) {
					if (confirmed) {
						//reset playerSequence
						playerSequence = [];

						//replay the same aiSequence
						turn = 'computer';
						displayAISequence();

					} else {
						//check for high score
						isHighScore();
						
						//reset the game, but don't start
						playerSequence = [];
						aiSequence = [];
						currentLevel = 0;
					}
				});

			} else if (difficulty === 'strict') {
				//Display alert letting user know they lost, ask if they want to play again,
				sweetAlert({
					title: 'Sorry you lose :(',
					text: 'Would you like to play again?',
					type: 'error',
					showCancelButton: true,
					confirmButtonColor: '#6BE2F9',
					confirmButtonText: 'Yes',
					cancelButtonText: 'No',
					closeOnConfirm: true,
					closeOnCancel: true,
					customClass: 'simonAlert'
				}, function(confirmed) {
					if (confirmed) {
						//check if it's the new high score
						isHighScore();
						
						//reset game
						resetGame();
					} else {
						//check if it's the new high score
						isHighScore();
						
						//reset the game, but don't start
						playerSequence = [];
						aiSequence = [];
						currentLevel = 0;
					}
				});
			}
		}
	}

	//Checks for high score
	function isHighScore() {
		if (currentLevel > highestLevel) {
			highestLevel = currentLevel;
			$('#highLevel').html('High Score: ' + highestLevel);
		}
	}

	//Checks if user has won (reached level 20) 
	function checkWin() {
		if (currentLevel === 20) {
			//alert user they've won and restart the game
			sweetAlert({
				title: 'You\'ve Won!',
				text: 'Would you like to play again?',
				type: 'success',
				showCancelButton: true,
				confirmButtonColor: '#6BE2F9',
				confirmButtonText: 'Yes',
				cancelButtonText: 'No',
				closeOnConfirm: true,
				closeOnCancel: true,
				customClass: 'simonAlert'
			}, function(confirmed) {
				if (confirmed) {
					//check if it's the new high score
					isHighScore();
					//reset the game
					resetGame();
				} else {
					//check if it's the new high score
					isHighScore();
					
					//reset the game, but don't start
					playerSequence = [];
					aiSequence = [];
					currentLevel = 0;
				}
			});

		} else {
			//reset playerSequence
			playerSequence = [];

			//continue adding moves
			turn = 'computer';
			makeRandomSequence();
		}
	}

	function resetGame() {
		aiSequence = [];
		playerSequence = [];
		currentLevel = 0;
		turn = 'computer';
		$('#currentLevel').html('Current Score: ' + currentLevel);
		//start new round
		makeRandomSequence();
	}

	//Allows player to reset the game themselves
	$('#reset').click( function() {
		resetGame();
	});

	function startGame() {
		//show alert to choose difficulty level
		sweetAlert({
			title: 'Let\'s Play!',
			text: 'Choose your difficulty level',
			type: 'info',
			showCancelButton: true,
			confirmButtonColor: '#6BE2F9',
			confirmButtonText: 'Strict',
			cancelButtonText: 'Normal',
			closeOnConfirm: true,
			closeOnCancel: true,
			customClass: 'simonAlert'
		}, function(confirmed) {
			if (confirmed) {
				//change difficulty to strict
				difficulty = 'strict';
			}

			//start new round
			makeRandomSequence();
		});
	}

	$('#start').click(function() {
		if (aiSequence.length === 0) {
			startGame();
		}
	});

}); //end document.ready




