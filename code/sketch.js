// ml5.js: Object Detection with COCO-SSD (Webcam Persistance)
// The Coding Train / Daniel Shiffman
// https://thecodingtrain.com/learning/ml5/1.3-object-detection.html
// https://youtu.be/QEzRxnuaZCk

// p5.js Web Editor - Image: https://editor.p5js.org/codingtrain/sketches/ZNQQx2n5o
// p5.js Web Editor - Webcam: https://editor.p5js.org/codingtrain/sketches/VIYRpcME3
// p5.js Web Editor - Webcam Persistence: https://editor.p5js.org/codingtrain/sketches/Vt9xeTxWJ

// let img;
let video;
let detector;
let detections = {};
let idCount = 0;
let title = [0, 0, 0];

function preload() {
  // img = loadImage('dog_cat.jpg');
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
  createCanvas(640 + 540, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  detector.detect(video, gotDetections);
  //vid = createVideo(
  //  ['FB_Feed_v1_1.mp4', 'assets/small.ogv', 'assets/small.webm'],
   // vidLoad);
  
  feed = createVideo(
    ['IG_Feed_v1_2.mp4', 'assets/small.ogv', 'assets/small.webm'],
    vidLoad
  );

  feed.size(540, 480);
  feed.position(540, 0);
}
  


function vidLoad() {
  feed.loop();
  feed.volume(0);
}


function draw() {
  image(video, 0, 0);

  
  let labels = Object.keys(detections);
  for (let label of labels) {
    let objects = detections[label];
    for (let i = objects.length - 1; i >= 0; i--) {
      let object = objects[i];
      if (object.label == 'person') {
        if (object.x < 320) {
        //fill('rgba(0,255,0, 0)');
        noFill();
        stroke(255, 0, 0);
        strokeWeight(3);
        rect(object.x, object.y, object.width, object.height);
        noStroke();
        fill(0, 0, 0);
        //strokeWeight(3);
        text(object.label + " Opposing " + object.id, object.x + 10, object.y + 24);
        textSize(28);
        }
        if (object.x > 320) {
         //fill(0, 255, 0, object.timer);
        noFill();
        stroke(0, 255, 0);
        strokeWeight(3);
        rect(object.x, object.y, object.width, object.height);
        noStroke();
        fill(0, 0, 0);
        text(object.label + " Favouring " + object.id, object.x + 10, object.y + 24);
        textSize(28);
      }
      }
      object.timer -= 2;
      if (object.timer < 0) {
        objects.splice(i, 1);
      }

    }
  }  
}