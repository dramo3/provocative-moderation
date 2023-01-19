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
let video;
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
  detector.detect(video, gotDetections);
}

function setup() {
  createCanvas(960, 720);
  video = createCapture(VIDEO);
  // Rahmen werden nicht mehr angezeigt, wenn .size auf AUTO
  //video.size(AUTO, AUTO);
  video.size(960, 720);
  video.hide();
  detector.detect(video, gotDetections);
  //vid = createVideo(
  //  ['FB_Feed_v1_1.mp4', 'assets/small.ogv', 'assets/small.webm'],
   // vidLoad);

  feed = createVideo(
    ['FB_Feed_v2.mp4', 'assets/small.ogv', 'assets/small.webm'],
    vidLoad
  );

  feed.size(AUTO, 720);
  feed.position(540, 0);
}



function vidLoad() {
  feed.loop();
  feed.volume(0);
}


function draw() {
  clear();
  push();
  translate(960,0);
  scale(-1.0,1.0);
  image(video, 0, 0, 960, 720);
  pop();

  let labels = Object.keys(detections);
  for (let label of labels) {
    let objects = detections[label];
    for (let i = objects.length - 1; i >= 0; i--) {
      let object = objects[i];
      if (object.label == 'person') {
        if (object.x <= 320) {
        //fill('rgba(0,255,0, 0)');
        push();
        translate(960,0);
        scale(-1.0,1.0);      
        image(emoNeg, object.x + 10, object.y + 30);
        noFill();
        stroke(235);
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
        translate(960,0);
        scale(-1.0,1.0);
        image(emoNeu, object.x + 10, object.y + 30);
        noFill();
        stroke(235);
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
       translate(960,0);
       scale(-1.0,1.0);
       image(emoPos, object.x + 10, object.y + 30);
       noFill();
       stroke(235);
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
