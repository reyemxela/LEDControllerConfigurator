let ledsize = 8;

let layouts;
let curLayout;

let font;
let scaleW;
let scaleH;
let rightSlider, leftSlider, noseSlider, fuseSlider, tailSlider;
let rightCheck, leftCheck, noseCheck, fuseCheck, tailCheck, nosefuseJoinCheck;
let layoutSelect;

function preload() {
  layouts = {
    Radian: loadJSON('layouts/Radian.json'),
    Wing: loadJSON('layouts/Wing.json'),
    Generic: loadJSON('layouts/Generic.json')
  };
  font = loadFont('./assets/Roboto-Regular.ttf');
}

function setup() {
  createCanvas(600, 600);
  stroke(255);

  scaleW = width/100;
  scaleH = height/100;

  curLayout = new Layout(layouts["Radian"]);

  let sliderX = 20;
  let sliderY = 450;

  layoutSelect = createSelect();
  layoutSelect.position(sliderX, sliderY-40);
  layoutSelect.option('Radian');
  layoutSelect.option('Wing');
  layoutSelect.option('Generic');
  layoutSelect.changed(changeLayout);
  
  nosefuseJoinCheck = createCheckbox('', curLayout.nosefuseJoined);
  nosefuseJoinCheck.position(sliderX+280, sliderY+75);

  rightCheck = createCheckbox('', curLayout.Right.reversed);
  rightCheck.position(sliderX+220, sliderY);
  leftCheck = createCheckbox('', curLayout.Left.reversed);
  leftCheck.position(sliderX+220, sliderY+30);
  noseCheck = createCheckbox('', curLayout.Nose.reversed);
  noseCheck.position(sliderX+220, sliderY+60);
  fuseCheck = createCheckbox('', curLayout.Fuse.reversed);
  fuseCheck.position(sliderX+220, sliderY+90);
  tailCheck = createCheckbox('', curLayout.Tail.reversed);
  tailCheck.position(sliderX+220, sliderY+120);

  rightSlider = createSlider(0, 100, curLayout.Right.count);
  rightSlider.position(sliderX, sliderY);
  leftSlider = createSlider(0, 100, curLayout.Left.count);
  leftSlider.position(sliderX, sliderY+30);
  noseSlider = createSlider(0, 100, curLayout.Nose.count);
  noseSlider.position(sliderX, sliderY+60);
  fuseSlider = createSlider(0, 100, curLayout.Fuse.count);
  fuseSlider.position(sliderX, sliderY+90);
  tailSlider = createSlider(0, 100, curLayout.Tail.count);
  tailSlider.position(sliderX, sliderY+120);
  
  img = loadImage(curLayout.image);
  
  // noLoop();
}

function draw() {
  background(50);
  image(img, 0, 0, width, height);
  
  curLayout.Right.count = rightSlider.value();
  curLayout.Left.count = leftSlider.value();
  curLayout.Nose.count = noseSlider.value();
  curLayout.Fuse.count = fuseSlider.value();
  curLayout.Tail.count = tailSlider.value();

  curLayout.Right.reversed = rightCheck.checked();
  curLayout.Left.reversed = leftCheck.checked();
  curLayout.Nose.reversed = noseCheck.checked();
  curLayout.Fuse.reversed = fuseCheck.checked();
  curLayout.Tail.reversed = tailCheck.checked();

  curLayout.nosefuseJoined = nosefuseJoinCheck.checked();

  text('right (' + curLayout.Right.count + ')', rightSlider.x * 2 + rightSlider.width, rightSlider.y+7);
  text('left (' + curLayout.Left.count + ')', leftSlider.x * 2 + leftSlider.width, leftSlider.y+7);
  text('nose (' + curLayout.Nose.count + ')', noseSlider.x * 2 + noseSlider.width, noseSlider.y+7);
  text('fuse (' + curLayout.Fuse.count + ')', fuseSlider.x * 2 + fuseSlider.width, fuseSlider.y+7);
  text('tail (' + curLayout.Tail.count + ')', tailSlider.x * 2 + tailSlider.width, tailSlider.y+7);

  text('rev?', rightCheck.x + 15, rightCheck.y+6);
  text('rev?', leftCheck.x + 15, leftCheck.y+6);
  text('rev?', noseCheck.x + 15, noseCheck.y+6);
  text('rev?', fuseCheck.x + 15, fuseCheck.y+6);
  text('rev?', tailCheck.x + 15, tailCheck.y+6);
  text('Nose/Fuse joined?', nosefuseJoinCheck.x + 15, nosefuseJoinCheck.y+6);
  
  rainbow();
  drawStrip(curLayout.Right);
  drawStrip(curLayout.Left);
  drawStrip(curLayout.Nose);
  drawStrip(curLayout.Fuse);
  drawStrip(curLayout.Tail);
}



class Strip {
  constructor(label, info, position) {
    this.leds = [];
    this.label = '>  ' + label + '  >';
    this.count = info.count;
    this.reversed = info.reversed;
    this.startpos = createVector(position.start[0], position.start[1]);
    this.endpos = createVector(position.end[0], position.end[1]);
    for (this.i = 0; this.i < this.count; this.i++) { this.leds[this.i] = color(0, 0, 0); }
  }
}

class Layout {
  constructor(data) {
    this.Right = new Strip('Right', data.right, data.rightpos);
    this.Left = new Strip('Left', data.left, data.leftpos);
    this.Nose = new Strip('Nose', data.nose, data.nosepos);
    this.Fuse = new Strip('Fuse', data.fuse, data.fusepos);
    this.Tail = new Strip('Tail', data.tail, data.tailpos);
    this.nosefuseJoined = data.nosefuseJoined;
    this.image = data.image;
  }
}

function changeLayout() {
  curLayout = new Layout(layouts[layoutSelect.value()]);
  loadValues();
}

function loadValues() {
  rightSlider.value(curLayout.Right.count);
  leftSlider.value(curLayout.Left.count);
  noseSlider.value(curLayout.Nose.count);
  fuseSlider.value(curLayout.Fuse.count);
  tailSlider.value(curLayout.Tail.count);

  rightCheck.checked(curLayout.Right.reversed);
  leftCheck.checked(curLayout.Left.reversed);
  noseCheck.checked(curLayout.Nose.reversed);
  fuseCheck.checked(curLayout.Fuse.reversed);
  tailCheck.checked(curLayout.Tail.reversed);

  nosefuseJoinCheck.checked(curLayout.nosefuseJoined);
}

function setNoseFuse(led, color) {
  if (led < curLayout.Nose.count) {
    curLayout.Nose.leds[led] = color;
  } else {
    curLayout.Fuse.leds[led - curLayout.Nose.count] = color;
  }
}


function drawStrip(strip) {
  if (strip.count < 1) { return; }

  push();

  for (i = 0; i < strip.count; i++) {
    let diff = p5.Vector.sub(strip.endpos, strip.startpos).div(((strip.count > 1) ? (strip.count-1) : (1))).mult(i);
    let pos = p5.Vector.add(strip.startpos, diff);
    pos.x *= scaleW;
    pos.y *= scaleH;
    fill(strip.leds[i]);
    ellipse(pos.x, pos.y, ledsize, ledsize);
  }

  fill(0);
  let midpos = p5.Vector.sub(strip.endpos, strip.startpos).div(2).add(strip.startpos);
  let rot = p5.Vector.sub(strip.endpos, strip.startpos).heading();
  if (strip.reversed) { rot += PI};
  midpos.x *= scaleW;
  midpos.y *= scaleH;

  translate(midpos.x, midpos.y);
  rotate(rot);

  textAlign(CENTER);
  textSize(14);
  textFont(font);

  // text bounding box background
  strokeWeight(0);
  fill(255);
  let bbox = font.textBounds(strip.label, 0, -5, textSize());
  rect(bbox.x, bbox.y, bbox.w, bbox.h);

  // text
  strokeWeight(2);
  fill(0);
  text(strip.label, 0, -5);

  pop();
}

function rainbow() {
  colorMode(HSB, 255);
  for (i = 0; i < curLayout.Right.count; i++) {
    curLayout.Right.leds[i] = color((frameCount + (i * 10))%255, 255, 255);
  }
  for (i = 0; i < curLayout.Left.count; i++) {
    curLayout.Left.leds[i] = color((frameCount + (i * 10))%255, 255, 255);
  }
  if (curLayout.nosefuseJoined) {
    for (i = 0; i < (curLayout.Nose.count + curLayout.Fuse.count); i++) {
      setNoseFuse(i, color((frameCount + (i * 10))%255, 255, 255));
    }
  } else {
    for (i = 0; i < curLayout.Nose.count; i++) {
      curLayout.Nose.leds[i] = color((frameCount + (i * 10))%255, 255, 255);
    }
    for (i = 0; i < curLayout.Fuse.count; i++) {
      curLayout.Fuse.leds[i] = color((frameCount + (i * 10))%255, 255, 255);
    }
  }
  for (i = 0; i < curLayout.Tail.count; i++) {
    curLayout.Tail.leds[i] = color((frameCount + (i * 10))%255, 255, 255);
  }
}
