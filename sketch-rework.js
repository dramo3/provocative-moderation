// ml5.js: Object Detection with COCO-SSD (Webcam Persistance)
// The Coding Train / Daniel Shiffman
// https://thecodingtrain.com/learning/ml5/1.3-object-detection.html
// https://youtu.be/QEzRxnuaZCk

// p5.js Web Editor - Image: https://editor.p5js.org/codingtrain/sketches/ZNQQx2n5o
// p5.js Web Editor - Webcam: https://editor.p5js.org/codingtrain/sketches/VIYRpcME3
// p5.js Web Editor - Webcam Persistence: https://editor.p5js.org/codingtrain/sketches/Vt9xeTxWJ

// let img;
let emoNeu;
let emoPos;
let emoNeg;
let capture;
let feed;
let detector;
let detections = {};
let idCount = 0;
let title = [0, 0, 0];

function preload() {
  emoNeu = loadImage('emoNeu.png');
  emoPos = loadImage('emoPos.png');
  emoNeg = loadImage('emoNeg.png');
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



function setup() {

  // Dont remove or change anything from the function below. This is what you need to set any ratio
  // Webcam footage, ideal resolution settings (1024, 540), 
  createCanvas((window.innerWidth/3)*2, window.innerHeight);
  const constraints = {
    video: { 
  facingMode: "user", frameRate: 3, width:1024, height: 540},
    // frameRate is not showing any effect...
    //facingMode: { exact: "environment" },
    //facingMode: { exact: "environment" },
  };

  

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => (video.srcObject = stream))
    .then(() => new Promise((resolve) => (video.onloadedmetadata = resolve)))
    .then(() => log(video.videoWidth + "x" + video.videoHeight))
    .catch((e) => {});

  capture = createCapture(constraints);
  capture.size(1024, 540);
  //capture.translate(-1,1);
  //capture.hide()

 // Creating feed from harddrive 
 /*
 feed = createVideo(
  ['FB_Feed_v1_1.mp4', 'assets/small.ogv', 'assets/small.webm'],
  vidLoad
);
*/

 // Alternatively: create feed from iFrames 


  //Styling video element[0] = webcam and video element[1] = feed

  let videoEl=document.querySelectorAll("video")[0];
  videoEl.style.position="absolute";
  videoEl.style.left="0px";
  videoEl.style.top="0";
  videoEl.style.zIndex="-1";
  videoEl.style.width=window.innerWidth/3*2 + "px";
  videoEl.style.height=window.innerHeight + "px";
  videoEl.style.margin="80px 0px 80px 50px";
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
  let iframeEl=document.querySelector("iframe");
  iframeEl.style.position="absolute";
  iframeEl.style.left= ((window.innerWidth/3)*2 + 50 + "px");
  iframeEl.style.top="0";
  iframeEl.style.zIndex="-1";
  iframeEl.style.width=(window.innerWidth/3) -100 + "px";
  iframeEl.style.height=window.innerHeight + "px";
  iframeEl.style.margin="80px 50px 80px 0px";

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
  //push();
  //translate(960,0);
  //scale(-1.0,1.0);
  //image(capture, 0, 0, 1024, 560);
  //pop();  

  let labels = Object.keys(detections);
  for (let label of labels) {
    let objects = detections[label];
    for (let i = objects.length - 1; i >= 0; i--) {
      let object = objects[i];
      if (object.label == 'person') {
        if (object.x <= 320) {
        //fill('rgba(0,255,0, 0)');
        push();
        //translate(960,0);
        //scale(-1.0,1.0);      
        image(emoNeg, object.x + 10, object.y + 30);
        noFill();
        stroke(0);
        strokeWeight(3);
        rect(object.x, object.y, object.width, object.height);
        pop();
        // push();
        // translate(960,0);
        // //scale(-1.0,1.0); 
        // noStroke();
        // fill(0, 0, 0);
        // //strokeWeight(3);
        // text(object.label, object.x + 10, object.y + 24);
        // textSize(28);
        // pop();
        }
        if (object.x > 320 && object.x <= 640) {
         //fill(0, 255, 0, object.timer);
        push();
        //translate(960,0);
        //scale(-1.0,1.0);
        image(emoNeu, object.x + 10, object.y + 30);
        noFill();
        stroke(0);
        strokeWeight(3);
        rect(object.x, object.y, object.width, object.height);
        pop();
        // noStroke();
        // fill(0, 0, 0);
        // text(object.label, object.x + 10, object.y + 24);
        // textSize(28);
      }
      if (object.x > 640 && object.x <= 960) {
        //fill(0, 255, 0, object.timer);
       push();
       //translate(960,0);
       //scale(-1.0,1.0);
       image(emoPos, object.x + 10, object.y + 30);
       noFill();
       stroke(0);
       strokeWeight(3);
       rect(object.x, object.y, object.width, object.height);
       pop();
    //    noStroke();
    //    fill(0, 0, 0);
    //    text(object.label, object.x + 10, object.y + 24);
    //    textSize(28);
     }
     //pop();
      }
      object.timer -= 2;
      if (object.timer < 0) {
        objects.splice(i, 1);
      }

    }
  }  
}

// function mousePressed() {
//   feed.time(0);
//   feed.play();
//   feed.noLoop();
// }