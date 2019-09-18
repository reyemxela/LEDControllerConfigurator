class Strip {
    constructor(count, startpos, endpos) {
      this.leds = [];
      this.count = count;
      this.startpos = createVector(startpos[0], startpos[1]);
      this.endpos = createVector(endpos[0], endpos[1]);
      for (this.i = 0; this.i < this.count; this.i++) { this.leds[this.i] = color(0, 0, 0); }
    }
}

class Layout {
  constructor(data) {
    this.Right = new Strip(data.rightcount, data.rightpos.start, data.rightpos.end);
    this.Left = new Strip(data.leftcount, data.leftpos.start, data.leftpos.end);
    this.Nose = new Strip(data.nosecount, data.nosepos.start, data.nosepos.end);
    this.Fuse = new Strip(data.fusecount, data.fusepos.start, data.fusepos.end);
    this.Tail = new Strip(data.tailcount, data.tailpos.start, data.tailpos.end);
    this.image = data.image;
  }
}

let scaleW;
let scaleH;

let ledsize = 8;

let curLayout;

function setup() {
  createCanvas(600, 600);
  strokeWeight(0.5);
  stroke(255);
  angleMode(RADIANS);

  scaleW = width/100;
  scaleH = height/100;

  curLayout = new Layout(JSON.parse(Radian));

  radianImg = loadImage(curLayout.image);
}

function drawString(strip) {
  resetMatrix();
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
  let rot = strip.endpos.angleBetween(strip.startpos);
  midpos.x *= scaleW;
  midpos.y *= scaleH;
  translate(midpos.x, midpos.y);
  rotate(rot);
  text('testing', 0, 0);
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

function draw() {
  background(50);
  image(radianImg, 0, 0, width, height);
  rainbow(curLayout);
  drawString(curLayout.Right);
  drawString(curLayout.Left);
  drawString(curLayout.Nose);
  drawString(curLayout.Fuse);
  drawString(curLayout.Tail);
}