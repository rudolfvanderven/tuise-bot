/* global webkitSpeechRecognition:true */

function kickoff() {
  var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition || null;

  // create web audio api context
  var audioCtx = new(window.AudioContext || window.webkitAudioContext)();

  // server address
  var address = window.location.href;

  var triggers = ['dude', 'hey dude', 'hey mate', 'ok dude', 'okay dude'];
  var commands = {
    "echo": {
      "triggers": ['echo', 'repeat'],
      "message": false
    }
  };

  // ----------------- GET/POST ---------------------

  function request(method, url, data, callback){
    var xhr = new XMLHttpRequest();
    url = address + url;
    xhr.open(method, url);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function() {
        if (xhr.status === 200) {
          console.log("response:", xhr.responseText);
          if(callback) callback(JSON.parse(xhr.responseText));
        }
    };
    if(data) xhr.send(JSON.stringify(data));
    else xhr.send();
  }

  function setTriggers(triggers_obj) {
    // get the triggers array
    triggers = triggers_obj["triggers"] || triggers;
    console.log("triggers set:", triggers);
  }

  function setCommands(commands_obj) {
    // set the commands object
    commands = commands_obj || commands;
    console.log("commands set:", commands);
  }

  request('GET', 'available-triggers', null, setTriggers);
  request('GET', 'commands', null, setCommands);

  // ------------------------ WEB SPEECH API --------------------------

  function startSpeechRecognier(auto){
    var state = {
      "triggered": false,
      "listening": false,
      "waiting": false
    };
    var recognizer = new SpeechRecognition();

    if (recognizer.continuous) {
      recognizer.continuous = true;
    }
    recognizer.interimResults = true; // we want partial result
    recognizer.lang = 'en-US'; // set language
    recognizer.maxAlternatives = 5;

    recognizer.onstart = function() {
      // listening started
      console.log("started");
    };

    recognizer.onend = function() {
      // listening ended
      console.log("ended");
      if(state.listening) {
        recognizer.start();
      }
    };

    recognizer.onerror = function(error) {
      // an error occured
      console.log(error);
    };

    recognizer.onspeechstart = function() {
      console.log('Speech has been detected');
    }

    recognizer.onspeechend = function() {
      console.log('Speech has stopped being detected');
    }


    recognizer.onresult = function(event) {
      // the event holds the results

      if (typeof(event.results) === 'undefined') { //Something is wrong…
          recognizer.stop();
          return;
      }

      for (var i = event.resultIndex; i < event.results.length; ++i) {
        if(event.results[i].isFinal) {
          // get all the final words into array
          var finalText = [];
          for(var j = 0; j < event.results[i].length; ++j) {
            finalText.push(event.results[i][j].transcript);
          }

          // if triggered call detected command else try to detect trigger
          if(state.triggered) {
            Object.keys(commands).forEach(function(key) {
              var key_trigger = commands[key]["triggers"];
              var commandDetected;
              if(key_trigger) {
                commandDetected = key_trigger.some(function(word) {
                  return finalText.join(', ').toLowerCase().indexOf(word.toLowerCase()) !== -1;
                });
              }
              if(commandDetected) {
                callCommand(key);

                state.triggered = false;
                state.waiting = false;
              }
            });

            if (!state.waiting)
              setTimeout(function(){
                state.triggered = false;
                state.waiting = false;
              },4000);

            state.waiting = true;
          } else {
            state.triggered = triggers.some(function(word) {
              return finalText.join(', ').toLowerCase().indexOf(word.toLowerCase()) !== -1;
            });
            if(state.triggered) {
              document.getElementById("on").play();
              request('GET', 'trigger', null, showResult);
              console.log("TRIGGER DETECTED", finalText);
            }
          }

          console.log("final result:", finalText);
        }
      }

      if (state.triggered) {
        // mic on 😃
      } else {
        // mic off 😣
      }

    };

    if(auto) {
      try {
        state.listening = true;
        recognizer.start();
      } catch(ex) {
        console.log('Recognition error: ' + ex.message);
      }
    }
  }

  function showResult(resp){
    var finals = document.getElementsByClassName("bot_text")[0];
    finals.innerHTML = resp.message.replace(/\n/g, "<br />") || "";
  }

  function callCommand(command) {
    request('POST', 'execute', {"command": command, "message": ""}, showResult);
  }

  // ---------------------------- WEB AUDIO ---------------------------

  var audioSource, gainNode, analyser;

  function getUserVoice() {
    if (!navigator.mediaDevices.getUserMedia) {
      alert('Your browser does not support the Media Stream API');
    } else {
      var canvas = document.getElementById("canvas_audio");
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      var constraints = { audio: true, video: false };

      navigator.mediaDevices.getUserMedia(constraints)
      .then(function(mediaStream) {
        audioSource = audioCtx.createMediaStreamSource(mediaStream);
        gainNode = audioCtx.createGain();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 2048;
        audioSource.connect(gainNode);
        gainNode.connect(analyser);
        // uncomment so that audio will come from the speakers
        // analyser.connect(audioCtx.destination);
        gainNode.gain.value = 1;
        animateVoice();
      })
      .catch(function(err) { console.log(err.name + ": " + err.message); }); // always check for errors at the end.
    }
  }

  function animateVoice() {
    var canvas = document.getElementById("canvas_audio");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    var WIDTH = canvas.width;
    var HEIGHT = canvas.height;
    var ctx = canvas.getContext("2d");
    var centerX = WIDTH / 2.0;
    var centerY = HEIGHT / 2.0;

    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);
    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgb(2, 254, 255)';

    ctx.beginPath();

    var x = 0, y = 0, radius = 150;

    for (var i = 0; i < bufferLength; i++) {
        var rads = Math.PI * 2 / bufferLength;
        var v = dataArray[i] / 10.0;

        var vx = centerX + Math.cos(rads * i) * (radius + v);
        var vy = centerY + Math.sin(rads * i) * (radius + v);

        if (i === 0) {
            x = vx, y = vy;
            ctx.moveTo(x, y);
        } else {
          ctx.lineTo(vx, vy);
        }

        if(i === bufferLength -1 ) {
          ctx.lineTo(x, y);
        }
    }

    ctx.stroke();

    window.requestAnimationFrame(animateVoice);
  }

  // ----------------- INIT -------------------------

  if(SpeechRecognition === null){
    alert("Web Speech API is not supported.");
  } else {
    startSpeechRecognier(true);
    getUserVoice();
  }
}

window.addEventListener('load', kickoff, false);
