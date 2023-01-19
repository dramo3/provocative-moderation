// ml5.js: Object Detection with COCO-SSD (Webcam Persistance)
// The Coding Train / Daniel Shiffman
// https://thecodingtrain.com/learning/ml5/1.3-object-detection.html
// https://youtu.be/QEzRxnuaZCk

// p5.js Web Editor - Image: https://editor.p5js.org/codingtrain/sketches/ZNQQx2n5o
// p5.js Web Editor - Webcam: https://editor.p5js.org/codingtrain/sketches/VIYRpcME3
// p5.js Web Editor - Webcam Persistence: https://editor.p5js.org/codingtrain/sketches/Vt9xeTxWJ


let emoPos;
let emoNeu;
let emoNeg;
let video;
let feed;
let detector;
let detections = {};
let idCount = 0;
let title = [0, 0, 0];

function preload() {
  emoPos = loadImage('emoPos.png');
  emoNeu = loadImage('emoNeu.png');
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
  detector.detect(video, gotDetections);
}


function setup() {
  createCanvas(windowWidth, windowHeight);
  background(185);
  video = createCapture(VIDEO);
  video.size(AUTO, AUTO);
  video.hide();
  detector.detect(video, gotDetections); 
  feed = createVideo(
    ['FB_Feed_v2.mp4', 'assets/small.ogv', 'assets/small.webm'], vidLoad);
  feed.size(960, 720);
  //feed.position(960 + windowWidth/8, 390 + windowHeight/8);
}
  

// function windowResized() {
//   resizeCanvas(windowWidth, windowHeight);
//   // video.size(windowWidth - 200, windowHeight - 200);
// }


function mousePressed() {
	let fs = fullscreen();
	fullscreen(!fs);
}


function vidLoad() {
  feed.loop();
  feed.volume(0);
  //feed.position(960 + windowWidth/8, 390 + windowHeight/8);
}


function draw() {
  clear();
  image(video, windowWidth/8, windowHeight/8, 960, 720);
  //video.size(windowWidth - 200, windowHeight - 200);
  feed.position(720 + windowWidth/8, windowHeight/8);

  
  let labels = Object.keys(detections);
  for (let label of labels) {
    let objects = detections[label];
    for (let i = objects.length - 1; i >= 0; i--) {
      let object = objects[i];
      if (object.label === 'person') {
        if (object.x <= 320) {
        //fill('rgba(0,255,0, 0)');
        image(emoPos, object.x - 45, object.y + 35 - 30);
        noFill();
        stroke(85);
        strokeWeight(3);
        rect(object.x, object.y, object.width, object.height);
        //noStroke();
        //fill(0, 0, 0);
        //strokeWeight(3);
        //text(object.label + " No. " + object.id, object.x + 10, object.y + 30);
        //textSize(28);
        }
        if (object.x > 320 && object.x <= 640) {
         //fill(0, 255, 0, object.timer);
        image(emoNeu, object.x + 5, object.y + 35 -30);
        noFill();
        stroke(85);
        strokeWeight(3);
        rect(object.x, object.y, object.width, object.height);
        //noStroke();
        //fill(0, 0, 0);
        //text(object.label + " No. " + object.id, object.x + 10, object.y + 30);
        //textSize(28);
      }
      if (object.x > 640 && object.x <= 960) {
        //fill(0, 255, 0, object.timer);
       image(emoNeg, object.x +10, object.y + 35 - 30);
       noFill();
       stroke(85);
       strokeWeight(3);
       rect(object.x, object.y, object.width, object.height);
       //noStroke();
       //fill(0, 0, 0);
       //text(object.label + " No. " + object.id, object.x + 10, object.y + 24);
       //textSize(28);
     }
      }
      object.timer -= 2;
      if (object.timer < 0) {
        objects.splice(i, 1);
      }

    }
  }  
}