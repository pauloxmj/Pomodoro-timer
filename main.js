//Timer object: define the durations (in minutes) for 'pomodoro', 'shortBreak', and 'longBreak' sessions, along with the 'longBreakInterval'.
const timer = {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4,
};

let interval;

//Start and Stop Button Listeners, Play a sound if timer is started or stopped
const buttonSound = new Audio('button-sound.mp3');
const mainButton = document.getElementById('js-btn');
mainButton.addEventListener('click', () => {
  buttonSound.play();
  const { action } = mainButton.dataset;
  if (action === 'start') {
    startTimer();
  } else {
    stopTimer();
  }
});

//Event listener for when the button is clicked
const modeButtons = document.querySelector('#js-mode-buttons');
modeButtons.addEventListener('click', handleMode);

//Function that calculates and returns the remaining time (in seconds, minutes, and total) from the current time to the provided endTime
function getRemainingTime(endTime) {
    const currentTime = Date.parse(new Date());
    const difference = endTime - currentTime;

    const total = Number.parseInt(difference / 1000, 10);
    const minutes = Number.parseInt((total / 60) % 60, 10);
    const seconds = Number.parseInt(total % 60, 10);

    return {
        total,
        minutes,
        seconds
    };
}

//Define a startTimer function that sets up and starts the timer
function startTimer() {
    //Extract the total property from the remainingTime object
    let { total } = timer.remainingTime;
    //Calculates the endTime by adding the total number of seconds (converted to milliseconds by multiplying with 1000) to the current timestamp.
    const endTime = Date.parse(new Date()) + total * 1000;
    
    //If the timer is currently in the 'pomodoro' mode, it increments the sessions property by 1. The sessions property keeps track of the number of completed pomodoro sessions.
    if (timer.mode === 'pomodoro') timer.sessions++;
  
    //Update the button appearance
    mainButton.dataset.action = 'stop';
    mainButton.textContent = 'stop';
    mainButton.classList.add('active');
    
    //Sets up an interval that runs every 1000 milliseconds (1 second)
    interval = setInterval(function() {
      timer.remainingTime = getRemainingTime(endTime);
      updateClock();
    
      total = timer.remainingTime.total;
      //Checks if the remaining time has reached or gone below 0, indicating that the timer has reached its end
      if (total <= 0) {

        //Clear setInterval to stop countdown
        clearInterval(interval);

        //Switch statement to handle the behavior after the timer reaches 0, based on the current timer.mode:
        switch (timer.mode) {
            //checks if the number of completed sessions is a multiple of timer.longBreakInterval. If true, it switches to 'longBreak' mode; otherwise, it switches to 'shortBreak' mode. 
            //If the mode is not 'pomodoro', it switches back to 'pomodoro' mode.
          case 'pomodoro':
            if (timer.sessions % timer.longBreakInterval === 0) {
              switchMode('longBreak');
            } else {
              switchMode('shortBreak');
            }
            break;
          default:
            switchMode('pomodoro');
        }

        //Creates a notification in the browser
        if (Notification.permission === 'granted') {
          const text =
            timer.mode === 'pomodoro' ? 'Get back to work!' : 'Take a break!';
          new Notification(text);
        }

        //Play sound when switching modes
        document.querySelector(`[data-sound="${timer.mode}"]`).play();

        //Calls startTimer function to start a new timer session
        startTimer();
      }
    }, 1000);
  }
  
  //Stops (setInterval) used in startTimer
  function stopTimer() {
    clearInterval(interval);
  
    mainButton.dataset.action = 'start';
    mainButton.textContent = 'start';
    mainButton.classList.remove('active');
  }
  
  //Function to update the clock countdown
  function updateClock() {
    const { remainingTime } = timer;
    //pad the numbers so 1 looks like 01 for example
    const minutes = `${remainingTime.minutes}`.padStart(2, '0');
    const seconds = `${remainingTime.seconds}`.padStart(2, '0');
  
    //Updates interface timer
    const min = document.getElementById('js-minutes');
    const sec = document.getElementById('js-seconds');
    min.textContent = minutes;
    sec.textContent = seconds;
  
    
    const text =
      timer.mode === 'pomodoro' ? 'Get back to work!' : 'Take a break!';
    document.title = `${minutes}:${seconds} — ${text}`;
  
    const progress = document.getElementById('js-progress');
    progress.value = timer[timer.mode] * 60 - timer.remainingTime.total;
  }
  
  //Function to set the current mode of the timer (pomodoro, short break, long break)
  function switchMode(mode) {
    timer.mode = mode;
    timer.remainingTime = {
      //Total number of seconds remaining. Mode multiplied by 60.
      total: timer[mode] * 60,
      //Number of minutes of the mode
      minutes: timer[mode],
      //Always set seconds to 0 at the start of a session
      seconds: 0,
    };
  
    document
      .querySelectorAll('button[data-mode]')
      .forEach(e => e.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    document.body.style.backgroundColor = `var(--${mode})`;
    document
      .getElementById('js-progress')
      .setAttribute('max', timer.remainingTime.total);
  
    updateClock();
  }
  
  //Function to change the mode of the timer
  function handleMode(event) {
    const { mode } = event.target.dataset;
  
    if (!mode) return;
  
    switchMode(mode);
    stopTimer();
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    if ('Notification' in window) {
      if (
        Notification.permission !== 'granted' &&
        Notification.permission !== 'denied'
      ) {
        Notification.requestPermission().then(function(permission) {
          if (permission === 'granted') {
            new Notification(
              'Awesome! You will be notified at the start of each session'
            );
          }
        });
      }
    }
  
    switchMode('pomodoro');
  });