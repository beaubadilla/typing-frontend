<br />
<p align="center">
  <h1 align="center">Typing Game Client-Side</h1>

  <p align="center">
    Solo personal project to learn more about webpack and websockets while practicing HTML, CSS, and JavaScript skills.
    <br />
    <a href="https://github.com/beaubadilla/typing-frontend/issues">Report Bug or Request Feature</a>
  </p>
</p>

## Table of Contents

* [About the Project](#about-the-project)
  * [Technologies](#technologies)
  * [Screenshots](#screenshots)
  * [Code Snippets](#code-snippets)
* [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
* [License](#license)
* [Contact](#contact)

## About the Project

This repository holds all the client-side files for the typing game I developed. The two main reasons for this project was to (1) learn ***webpack*** and ***websockets* and (2) create a more complete version of a typing game that expanded from the [typing game I contributed to for my front-end college course](https://github.com/beaubadilla/cpsc349_frontend_engineering). As of September 2020, this project's state is at a ***minimum viable product(MVP)*** level where all the core functionalities are implemented.

### Technologies
Languages: JavaScript, HTML, CSS

Libraries/Frameworks:
* [Phaser 3](https://phaser.io/phaser3)
* [Socket.io](https://socket.io/)

### Screenshots

![typing-frontend-1-screenshot][typing-frontend-1-screenshot]
![typing-frontend-2-screenshot][typing-frontend-2-screenshot]

### Code Snippets

/src/index.js: Using Socket.io client API to synchronize the game's starting time
```javascript
// Start time
let secondsUntilStart;
socket.on('room-game-start', (payload) => {
  const startDO = new Date(payload.time);
  let msUntilStart = payload.time - Date.now();
  secondsUntilStart = Math.floor(msUntilStart/1000);
  let lastThreeDigits = msUntilStart % 1000;

  setTimeout(() => {
    isTimeRunning = true;
    timeStartTGO.setText(`Starts in ${secondsUntilStart}`);

    let secondsSinceGameStart = 0;
    setInterval(() => {
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
          socket.emit('game-starting');
          gameStart = true;
          isTimeRunning = false;
        }
      }
    }, 1000);
  }, lastThreeDigits);
});
```

/src/index.js: Using Phaser 3's library to display a sentence across the browser's canvas
```javascript
let sentenceByChar = [];
[...sentence].forEach((c) => {
  // create and push Text Object into an array of objects to manipulate each character (especially style)
  sentenceByChar.push(this.add.text(x, y, c, { fontSize: '40px', fontFamily: 'Arial'}));
  
  x += fontSpacing.arial40[c];
  if (x > 1000) {
    x = 0;
    y += 50;
  }
});
```

## Getting Started

### Prerequisites

Install an internet browser. 
* Recommend [Google Chrome](https://www.google.com/chrome/) as it was the browser I developed with. 
* Other browsers: [Firefox](https://www.mozilla.org/en-US/firefox/browsers/), [Microsoft Edge](https://www.microsoft.com/en-us/edge), [Opera](https://www.opera.com/)

Install a package manager
* Recommend [NPM](https://www.npmjs.com/)

Optional: Local HTTP Server
* Python - [documentation](https://docs.python.org/3/library/http.server.html), [tutorial](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/set_up_a_local_testing_server)
* NPM - [GitHub repo](https://github.com/http-party/http-server)

### Installation

1. Clone the repo
```sh
git clone https://github.com/beaubadilla/typing-frontend.git
```
2. Change directory (```cd```) to /typing-frontend

3. Run ```npm install``` to download the dependecies

## License
[MIT](https://choosealicense.com/licenses/mit/)

## Contact

Beau Jayme De Guzman Badilla - beau.badilla@gmail.com - [LinkedIn](https://www.linkedin.com/in/beau-jayme-badilla/)


[typing-frontend-1-screenshot]: /readme-typing-frontend-1.jpg
[typing-frontend-2-screenshot]: /readme-typing-frontend-2.jpg
