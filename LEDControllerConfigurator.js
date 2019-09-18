class Strip {
  constructor(label, count, position) {
    this.leds = [];
    this.label = '>- ' + label + ' ->';
    this.count = count;
    this.startpos = createVector(position.start[0], position.start[1]);
    this.endpos = createVector(position.end[0], position.end[1]);
    for (this.i = 0; this.i < this.count; this.i++) { this.leds[this.i] = color(0, 0, 0); }
  }
}

class Layout {
  constructor(data) {
    this.Right = new Strip('Right', data.rightcount, data.rightpos);
    this.Left = new Strip('Left', data.leftcount, data.leftpos);
    this.Nose = new Strip('Nose', data.nosecount, data.nosepos);
    this.Fuse = new Strip('Fuse', data.fusecount, data.fusepos);
    this.Tail = new Strip('Tail', data.tailcount, data.tailpos);
    this.image = data.image;
  }
}

let scaleW;
let scaleH;

let ledsize = 8;

let curLayout;

function drawString(strip) {
  push();

  for (i = 0; i < strip.count; i++) {
    let diff = p5.Vector.sub(strip.endpos, strip.startpos).div(strip.count-1).mult(i);
    let pos = p5.Vector.add(strip.startpos, diff);
    pos.x *= scaleW;
    pos.y *= scaleH;
    fill(strip.leds[i]);
    ellipse(pos.x, pos.y, ledsize, ledsize);
  }

  fill(0);
  let midpos = p5.Vector.sub(strip.endpos, strip.startpos).div(2).add(strip.startpos);
  let rot = p5.Vector.sub(strip.endpos, strip.startpos).heading();
  midpos.x *= scaleW;
  midpos.y *= scaleH;
  translate(midpos.x, midpos.y);
  rotate(rot);
  textAlign(CENTER);
  text(strip.label, 0, -5);

  pop();
}

function rainbow(layout) {
  colorMode(HSB, 255);
  for (i = 0; i < layout.Right.count; i++) {
    layout.Right.leds[i] = color((frameCount + (i * 10))%255, 255, 255);
  }
  for (i = 0; i < layout.Left.count; i++) {
    layout.Left.leds[i] = color((frameCount + (i * 10))%255, 255, 255);
  }
  for (i = 0; i < layout.Nose.count; i++) {
    layout.Nose.leds[i] = color((frameCount + (i * 10))%255, 255, 255);
  }
  for (i = 0; i < layout.Fuse.count; i++) {
    layout.Fuse.leds[i] = color((frameCount + (i * 10))%255, 255, 255);
  }
  for (i = 0; i < layout.Tail.count; i++) {
    layout.Tail.leds[i] = color((frameCount + (i * 10))%255, 255, 255);
  }
}

function preload() {
  Radian = loadJSON('layouts/Radian.json');
}

function setup() {
  createCanvas(600, 600);
  stroke(255);

  scaleW = width/100;
  scaleH = height/100;

  curLayout = new Layout(Radian);

  img = loadImage(curLayout.image);

  // noLoop();
}

function draw() {
  background(50);
  image(img, 0, 0, width, height);
  rainbow(curLayout);
  drawString(curLayout.Right);
  drawString(curLayout.Left);
  drawString(curLayout.Nose);
  drawString(curLayout.Fuse);
  drawString(curLayout.Tail);
}