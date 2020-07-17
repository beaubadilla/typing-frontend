import io from 'socket.io-client';

// Assets
import carPink from './assets/PinkStrip.png';
import carBlack from './assets/BlackOut.png';
import carRed from './assets/RedStrip.png';
import carGreen from './assets/GreenStrip.png';
import carBlue from './assets/BlueStrip.png';
// JS Helper Files
import { roomPrefixList } from './roomPrefixList';
import fontSpacing from './fontSpacing';
import { addTGO } from './helper';

const CANVAS_WIDTH = 1300;
const CANVAS_HEIGHT = 600;

function getRandomRoomNumber() {
  return Math.floor(Math.random() * Math.floor(999));
}

function getRandomPrefix() {
  return roomPrefixList[Math.floor(Math.random() * Math.floor(roomPrefixList.length - 1))].toLowerCase();
}

class StartScene extends Phaser.Scene {
  constructor() {
    super("startScene");
    this.playerNumber = 0;
  }

  preload() {
    this.load.plugin('rexinputtextplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexinputtextplugin.min.js', true);
    this.load.image('car-black', carBlack);
    this.load.image('car-pink', carPink);
    this.load.image('car-red', carRed);
    this.load.image('car-blue', carBlue);
    this.load.image('car-green', carGreen);
  }

  create() {
    // Graphics object to draw shapes
    let graphics = this.add.graphics({ lineStyle: { width: 2 } });
    // Title
    this.add.text(475, 100, 'Racing Game', { fontSize: '50px' });
    this.add.image(400, 200, 'car-black');
    this.add.image(800, 200, 'car-pink');
    this.add.image(300, 300, 'car-red');
    this.add.image(600, 300, 'car-green');
    this.add.image(900, 300, 'car-blue');
    // Buttons
    let createRoomBtn = this.add.text(100, 400, 'Create a private room', { fontSize: '38px' });
    this.add.text(100, 435, 'and race against your friends!', {fontSize: '24px' });
    let joinRoomBtn = this.add.text(800, 400, 'Join a room', { fontSize: '38px' });

    // Handling create-room button events
    createRoomBtn.setInteractive();
    let isCreateRoomBtnClicked = false;
    let roomNameTGO, roomName;
    createRoomBtn.on('pointerdown', () => {
      roomName = `${getRandomPrefix()}-${getRandomRoomNumber()}`;
      this.scene.start('gameScene', { roomName, playerNumber: this.playerNumber });
    });
    createRoomBtn.on('pointerover', () => {
      createRoomBtn.setFill('green');
    });
    createRoomBtn.on('pointerout', () => {
      createRoomBtn.setFill('white');
    });

    // Handling join-room button events
    let isJoinRoomBtnClicked = false;
    let randomBTN, orTGO, enterRoomNameTGO, userInputRoomName, enterBTN;
    joinRoomBtn.setInteractive();
    joinRoomBtn.on('pointerup', () => {
      if (!isJoinRoomBtnClicked) {
        randomBTN = this.add.text(700, 450, 'RANDOM', { fontSize: '34px' });
        randomBTN.setInteractive()
        randomBTN.on('pointerdown', () => {
          this.scene.start('gameScene', { roomName: '', playerNumber: this.playerNumber });
        });
        randomBTN.on('pointerover', () => {
          randomBTN.setFill('pink');
        });
        randomBTN.on('pointerout', () => {
          randomBTN.setFill('white');
        });

        orTGO = this.add.text(750, 500, 'or', { fontSize: '30px' });

        // Enter room "component"
        enterRoomNameTGO = this.add.text(700, 550, "room name:", { fontSize: '24px' });
        userInputRoomName = this.add.rexInputText(1000, 560, 300, 70, { placeholder: 'animal-###', fontSize: '24px' });
        let line = new Phaser.Geom.Line(850, 575, 1150, 575);
        graphics.strokeLineShape(line);
        enterBTN = this.add.text(1175, 550, 'enter', { fontSize: '24px' });
        enterBTN.setInteractive()
        enterBTN.on('pointerdown', () => {
          this.scene.start('gameScene', { roomName: userInputRoomName.text, playerNumber: this.playerNumber });
        });
        enterBTN.on('pointerover', () => {
          enterBTN.setFill('pink');
        });
        enterBTN.on('pointerout', () => {
          enterBTN.setFill('white');
        });
      } else {
        console.log('destroy() and clear()');
        randomBTN.destroy();
        orTGO.destroy();
        enterRoomNameTGO.destroy();
        userInputRoomName.destroy();
        enterBTN.destroy();
        graphics.clear();
      }
      isJoinRoomBtnClicked = !isJoinRoomBtnClicked;
    });
    joinRoomBtn.on('pointerover', () => {
      joinRoomBtn.setFill('green');
    });
    joinRoomBtn.on('pointerout', () => {
      joinRoomBtn.setFill('white');
    });
  }

  update () {
  }
}

class GameScene extends Phaser.Scene {
  constructor() {
    super("gameScene");
  }
  
  //load assets
  preload(){
    this.load.image('car-black', carBlack);
    this.load.image('car-pink', carPink);
    // this.load.image('car-red', carRed);
    // this.load.image('car-blue', carBlue);
    // this.load.image('car-green', carGreen);
  }

  // data received from other scene
  init(data) {
    // Handler for users entering a random room where the room name does not matter, therefore not passed to this function
    this.roomName = data.roomName;
    this.playerNumber = data.playerNumber;
  }
  
  //init variables, define animations & sounds, and display assets
  create(){
    let socket = io('http://localhost:3000/');
    // let socket = io('https://floating-spire-65360.herokuapp.com/');

    // Flags
    let gameStart = true, isTimeRunning = false; // TODO: change gameStart to falsey, only truthy for testing

    // Styling
    const style = {
      fontFamily: 'Arial',
      fontSize: '40px',
      color: 'yellow',
    };
    const success = { color: 'green' };
    const fail = { color: 'red' };

    // Text Game Objects
    // this.add.text(0, 0, `Room: ${this.roomName}`, { fontSize: '30px' });
    // let timeStartTGO = this.add.text(((CANVAS_WIDTH/2) - 100), 0, `Starts in`);
    // let wpmTGO = this.add.text(1150, 0, 'WPM: -', { fontSize: '30px' });
    // let userInputTGO = this.add.text(0, 300, '', style);
    // // let timeStartTGO = {}, wpmTGO = {}, userInputTGO = {};
    let [timeStartTGO, wpmTGO, userInputTGO] = addTGO(this, timeStartTGO, wpmTGO, userInputTGO);

    // Image Game Objects
    let car = this.add.image(50, 500, 'car-pink');
    let carTwo = this.add.image(50, 550, 'car-black');
    
    // Start time
    let secondsUntilStart;
    socket.on('room-game-start', (payload) => {
      const startDO = new Date(payload.time);
      let msUntilStart = payload.time - Date.now();
      secondsUntilStart = Math.floor(msUntilStart/1000);
      let lastThreeDigits = msUntilStart % 1000;

      console.log(`Game starts precisely at ${startDO.getHours()}:${startDO.getMinutes()}:${startDO.getSeconds()}:${startDO.getMilliseconds()}`);
      console.log(`lastThreeDigts of ${msUntilStart} = ${lastThreeDigits}`);

      setTimeout(() => {
        console.log('setTimeout()');
        isTimeRunning = true;
        timeStartTGO.setText(`Starts in ${secondsUntilStart}`);

        let secondsSinceGameStart = 0;
        setInterval(() => {
          // console.log(`setInterval() with ${secondsSinceGameStart} seconds passed since game start`);
          // Update WPM
          if (gameStart) {
            secondsSinceGameStart += 1
            const AVERAGE_CHARS_PER_WORD = 5, SECONDS_IN_MIN = 60;
            let wpm = Math.round((charIndex/AVERAGE_CHARS_PER_WORD)/(secondsSinceGameStart/SECONDS_IN_MIN)).toString(); // here, charIndex represents how many characters the user has correctly typed
            wpmTGO.setText(`WPM: ${wpm}`);
          }

          // Update Countdown Timer
          if (isTimeRunning) {
            if (secondsUntilStart > 0) {
              secondsUntilStart -= 1;
              timeStartTGO.setText(`Starting in ${secondsUntilStart}`);
            } else {
              gameStart = true;
              isTimeRunning = false;
            }
          }
        }, 1000);
      }, lastThreeDigits);
    });
    
    socket.on('connect', () => {
      socket.emit('assign-room', { roomName: this.roomName });
    });

    // Error Logging
    socket.on('error', (error) => {
      console.log(`error: ${JSON.stringify(error)}`)
    });
    socket.on('connect_error', (error) => {
      console.log(`connect_error: ${JSON.stringify(error)}`)
    });
    socket.on('connect_timeout', (timeout) => {
      console.log(`connect_timeout: ${JSON.stringify(timeout)}`)
    });
    
    socket.on('player-assignment', (payload) => {
      this.playerNumber = payload.playerNumber;
    });

    socket.on('announcement', (message) => {
      console.log(message);
    });

    // Receive car position's of other participants to update
    socket.on('otherCarPosition', (payload) => {
      console.log(`received payload:${JSON.stringify(payload)}`);
      // carTwo.x = payload.x;
      if (payload.playerNumber === 1) { car.x = payload.x; }
      else if (payload.playerNumber === 2) { carTwo.x = payload.x; }
    })
    const acceptableKeys = [
      'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
      'A', 'B', 'C', 'D', 'E', 'F', 'G,', 'H', 'I,', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '/', '\'', ',', '.', '?', '<', '>', ':', ';', '\"', '{', '}', '[', ']', '-', '_', '+', '=', ' ', 'Backspace'
    ];



    let sentence = 'five years ago we lost all of us we lost friends we lost family we lost a part of ourselves today we have a chance';
    let x = 0;
    let y = 50;
    // Display sentence by character that resembles a normal sentence
    let sentenceByChar = [];
    [...sentence].forEach((c) => {
      // create and push Text Object into an array of objects to manipulate each character (especially style)
      sentenceByChar.push(this.add.text(x, y, c, { fontSize: '40px', fontFamily: 'Arial'}));
      // x += letterSpacing[c];
      x += fontSpacing.arial40[c];
      if (x > 1000) {
        x = 0;
        y += 50;
      }
    });

    // Handling keyboard input
    const maxDisplayUserInputSize = 20;
    let charIndex = 0;
    let firstIncorrect = { flag: false, index: 0 };
    let minDeleteIndex = 0;
    // *Must use document.addEventListener, instead of Phaser's keyboard.on(), because it handles fast typing elegantly
    document.addEventListener('keydown', (event) => {
      console.log(`key:${event.key}`);
      console.log('BEFORE');
      console.log(`charIndex:${charIndex}`);
      console.log(`firstIncorrect:${JSON.stringify(firstIncorrect)}`);
      console.log(`minDeleteIndex:${minDeleteIndex}`);
      let userKeyInput = event.key;
      
      // Only accept keyboard input of letters, numbers, and special characters
      if (acceptableKeys.includes(userKeyInput) && gameStart) {
        if (userKeyInput === 'Backspace') {
          // Delete last letter and update display
          let str = userInputTGO.text;
          str = str.substring(0, str.length - 1);
          userInputTGO.setText(str);

          // Update variables neccessary for tracking correctness
          if (charIndex > 0 && charIndex > minDeleteIndex) { charIndex -= 1; } // prevents Out of Bounds
          if (firstIncorrect.flag === false && firstIncorrect.index > minDeleteIndex) { firstIncorrect.index -= 1; }
        } else {
          if(userKeyInput === ' ') { event.preventDefault(); }; // prevents space from scrolling page
          // Write user's input to screen
          userInputTGO.setText(userInputTGO.text + userKeyInput);

          // // Splice beginning input for QoL
          // if (userInputTGO.text.length > maxDisplayUserInputSize) {
          //   let str = userInputTGO.text;
          //   str = str.substring(1, str.length);
          //   userInputTGO.setText(str);
          // }

          // Did user type the correct letter AND type in the right place?
          if (
            userKeyInput === sentence[charIndex]
            // && charIndex === firstIncorrect.index
            && charIndex <= firstIncorrect.index
          ) { // Correct user input
            if (userKeyInput === ' ') {
              userInputTGO.setText('');
              minDeleteIndex = charIndex + 1; // first character of next word
            }
            // Style and animate display
            sentenceByChar[charIndex].setFill(success.color);
            if (this.playerNumber === 1) {
              car.x = (((CANVAS_WIDTH - 100)/sentence.length) * (charIndex + 1) + 50);
              socket.emit('updateCarPosition', { x: car.x });
            }
            else if (this.playerNumber === 2) {
              carTwo.x = (((CANVAS_WIDTH - 100)/sentence.length) * (charIndex + 1) + 50);
              socket.emit('updateCarPosition', { x: carTwo.x });
            }

            // Update variables neccessary for tracking correctness
            firstIncorrect.index += 1;
            if (firstIncorrect.flag) { firstIncorrect.flag = false; } // reset to accurately track
          } else { // Incorrect user input
            // Style display
            sentenceByChar[charIndex].setFill(fail.color);

            // Update variables neccessary for tracking correctness
            if (firstIncorrect.flag === false) {
              firstIncorrect.index = charIndex;
              firstIncorrect.flag = true;
            }
          }
          charIndex += 1;
        }
      }
      console.log('AFTER');
      console.log(`charIndex:${charIndex}`);
      console.log(`firstIncorrect:${JSON.stringify(firstIncorrect)}`);
      console.log(`minDeleteIndex:${minDeleteIndex}`);
      console.log('----------------------------------------');
    });
  }

  //update the attributes of various game objects per game logic
  update(){
  }
  
}

let config = {
  width: CANVAS_WIDTH,
  height: CANVAS_HEIGHT,
  parent: "gameContainer",
  physics: {
    default: "arcade"
  },
  scene: [StartScene, GameScene],
  type: Phaser.AUTO,
  dom: {
    createContainer: true
  },
  backgroundColor: '0090de'
};
let game = new Phaser.Game(config);

/* Developer Notes
Acronyms:
  TGO - Text Game Object
  DO - Date Object
*/