// ml5.js: Object Detection with COCO-SSD (Webcam Persistance)
// The Coding Train / Daniel Shiffman
// https://thecodingtrain.com/learning/ml5/1.3-object-detection.html
// https://youtu.be/QEzRxnuaZCk

// p5.js Web Editor - Image: https://editor.p5js.org/codingtrain/sketches/ZNQQx2n5o
// p5.js Web Editor - Webcam: https://editor.p5js.org/codingtrain/sketches/VIYRpcME3
// p5.js Web Editor - Webcam Persistence: https://editor.p5js.org/codingtrain/sketches/Vt9xeTxWJ

let emoNeu;
let emoPos;
let emoNeg;
let emoRes;
//emoOK original .png is mirrored
let emoOK;
let emoSize;
let emoCount = [0, 0, 0, 0];
let capture;
let feed;
let detector;
let detections = {};
let idCount = 0;
let title = [0, 0, 0];
let isAction = false;

function preload() {
  emoNeu = loadImage('emoNeu2.png');
  emoPos = loadImage('emoPos2.png');
  emoNeg = loadImage('emoNeg2.png');
  emoRes = loadImage('emoRes.png');
  emoOK = loadImage('emoOKmirrored.png');
detector = ml5.objectDetector('cocossd');
}


function gotDetections(error, results) {
  if (error) {
    console.error(error);
  }

  let labels = Object.keys(detections);
  for (let label of labels) {
    let objects = detections[label];
    for (let object of objects) {
      object.taken = false;
    }
  }

  for (let i = 0; i < results.length; i++) {
    let object = results[i];
    let label = object.label;

    if (detections[label]) {
      let existing = detections[label];
      if (existing.length == 0) {
        object.id = idCount;
        idCount++;
        existing.push(object);
        object.timer = 100;
      } else {
        // Find the object closest?
        let recordDist = Infinity;
        let closest = null;
        for (let candidate of existing) {
          let d = dist(candidate.x, candidate.y, object.x, object.y);
          if (d < recordDist && !candidate.taken) {
            recordDist = d;
            closest = candidate;
          }
        }
        if (closest) {
          // copy x,y,w,h
          let amt = 0.75; //0.75;
          closest.x = lerp(object.x, closest.x, amt);
          closest.y = lerp(object.y, closest.y, amt);
          closest.width = lerp(object.width, closest.width, amt);
          closest.height = lerp(object.height, closest.height, amt);
          closest.taken = true;
          closest.timer = 100;
        } else {
          object.id = idCount;
          idCount++;
          existing.push(object);
          object.timer = 100;
        }
      }
    } else {
      object.id = idCount;
      idCount++;
      detections[label] = [object];
      object.timer = 100;
    }
  }
  detector.detect(capture, gotDetections);
}


let factor=[];
function setup() {
  
  // Dont remove or change anything from the function below. This is what you need to set any ratio
  // Webcam footage, ideal resolution settings (1024, 540), facingMode: "user", "environment", 
  createCanvas((window.innerWidth/3)*2 - 50 * 2, (window.innerWidth/3*2) * 0.527);
  const constraints = {
    video: { 
  facingMode: "environment", frameRate: 3, width:1024, height: 540},

  };

  factor[0]=width / 1024;
  factor[1]=height / 540;
  emoSize1 = width / 7;
  emoSize2 = width / 4.5;

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => (video.srcObject = stream))
    .then(() => new Promise((resolve) => (video.onloadedmetadata = resolve)))
    .then(() => log(video.videoWidth + "x" + video.videoHeight))
    .catch((e) => {});

  capture = createCapture(constraints);
  capture.size(1024, 540);

 // Creating feed from harddrive 
 /*
 feed = createVideo(
  ['FB_Feed_v1_1.mp4', 'assets/small.ogv', 'assets/small.webm'],
  vidLoad
);
*/

 // Alternatively: create feed from iFrames 


  //Styling video element[0] = webcam and video element[1] = feed

  document.querySelectorAll("video")[0].id="capture";
  
/*
  let feedEl=document.querySelectorAll("video")[1];
  feedEl.style.position="absolute";
  feedEl.style.left= ((window.innerWidth/3)*2 + 50 + "px");
  feedEl.style.top="0";
  feedEl.style.zIndex="-1";
  feedEl.style.width=(window.innerWidth/3) -100 + "px";
  feedEl.style.height=window.innerHeight + "px";
  feedEl.style.margin="80px 50px 80px 0px";
*/

 // What was detector.detect again?
  detector.detect(capture, gotDetections);
 
}


/*
function vidLoad() {
  //feed.play();
  feed.noLoop();
  feed.volume(100);
}
*/

function draw() {

  // clears each loop of previously drawn frames
  clear();
  translate(width,0);
  scale(-1.0,1.0);
  if (isAction == false) {
    //stroke(255);
    //strokeWeight(5);
    push();
    //translate(0,height);
    //translate(width * -1, 0);
    //scale(1.0,-1.0);
    image(emoOK, 50, 50, emoSize1, emoSize1);
    pop();
    //rect(0, 0, width/8, height);
  } else if (document.querySelector(".overlay").style.display != "none") {
    document.querySelector(".overlay").style.display = "none";
    window.setTimeout(endScreen, 100000);
  }


  let labels = Object.keys(detections);
  for (let label of labels) {
    let objects = detections[label];
    for (let i = objects.length - 1; i >= 0; i--) {
      let object = objects[i];
      let posX=object.x*factor[0];
      let posY=object.y*factor[1];
      let objW=object.width*factor[0];
      let objH=object.height*factor[1];
      if (object.label == 'person') {
        if (posX + objW/2 <= width/3) {
          drawEmoji(emoNeg, posX, posY, objW, objH);
          emoCount[0] += 1;
        } else if (posX + objW/2 > width/3 && posX + objW/2 <= width/3*2) {
          drawEmoji(emoRes2, posX, posY, objW, objH);
          //emoCount[1] += 5;
          emoCount[1] += 2;
        } else if (posX + objW/2 > width/3*2 && posX + objW/2 <= width) {
          drawEmoji(emoPos, posX, posY, objW, objH);
          //emoCount[2] += 10;
          emoCount[2] += 3;
        }

        emoCount[3]++;

        if (document.querySelector(".overlay").style.display != "none") {
          if (posX < width/8) {
            isAction = true;
          } else {
            isAction = false;
          }
        }
        

      }
      object.timer -= 2;
      if (object.timer < 0) {
        objects.splice(i, 1);
      }
    }
  }  
}

//let myIframe = document.getElementById('iframe');
/*
let myIframe = document.querySelector("rightbox responsive-iframe");
myIframe.onload = function () {
    myIframe.contentWindow.scrollTo(0,10000);
}
*/

 document.getElementById('rightbox fakeiframe').scrollTo(0,20000);


function endScreen(){
  let average = (emoCount[0] + emoCount[1] + emoCount[2]) / emoCount[3];
  //let averageNeg = (emoCount[0] * 10) / emoCount[3];
  //let averageNeu = (emoCount[1] * 2) / emoCount[3];
  //let averagePos = (emoCount[2] * 1) / emoCount[3];
  let domEndScreen = document.querySelector(".endScreen");
  domEndScreen.style.display = "block";
  domEndScreen.innerHTML = average;
}

function drawEmoji(emo, x, y, w, h) {
  image(emo, x + w/2 - emoSize2/2, y, emoSize2, emoSize2);
  noFill();
  stroke(0);
  strokeWeight(3);
  rect(x, y, w, h);
}

// function mousePressed() {
//   feed.time(0);
//   feed.play();
//   feed.noLoop();
// }


