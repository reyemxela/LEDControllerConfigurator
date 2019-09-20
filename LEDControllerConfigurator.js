let ledsize = 8;

let layouts;
let curLayout;

let font;
let scaleW;
let scaleH;
let wingSlider, wingNavSlider, noseSlider, fuseSlider, tailSlider;
let wingCheck, wingNavCheck, noseCheck, fuseCheck, tailCheck, nosefuseJoinCheck;
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
  createCanvas(700, 700);
  stroke(255);

  scaleW = width/100;
  scaleH = height/100;

  curLayout = new Layout(layouts["Radian"]);

  let sliderX = 20;
  let sliderY = 480;

  layoutSelect = createSelect();
  layoutSelect.position(sliderX, sliderY-40);
  layoutSelect.option('Radian');
  layoutSelect.option('Wing');
  layoutSelect.option('Generic');
  layoutSelect.changed(changeLayout);
  
  nosefuseJoinCheck = createCheckbox('', curLayout.nosefuseJoined);
  nosefuseJoinCheck.position(sliderX+280, sliderY+75);

  wingCheck = createCheckbox('', curLayout.Right.reversed);
  wingCheck.position(sliderX+200, sliderY);
  wingNavCheck = createCheckbox('', true);
  wingNavCheck.position(sliderX+500, sliderY);
  noseCheck = createCheckbox('', curLayout.Nose.reversed);
  noseCheck.position(sliderX+200, sliderY+30);
  fuseCheck = createCheckbox('', curLayout.Fuse.reversed);
  fuseCheck.position(sliderX+200, sliderY+60);
  tailCheck = createCheckbox('', curLayout.Tail.reversed);
  tailCheck.position(sliderX+200, sliderY+90);

  wingSlider = createSlider(0, 100, curLayout.Right.count);
  wingSlider.position(sliderX, sliderY);
  wingNavSlider = createSlider(0, 100, curLayout.wingNavLEDs);
  wingNavSlider.position(sliderX+280, sliderY);
  noseSlider = createSlider(0, 100, curLayout.Nose.count);
  noseSlider.position(sliderX, sliderY+30);
  fuseSlider = createSlider(0, 100, curLayout.Fuse.count);
  fuseSlider.position(sliderX, sliderY+60);
  tailSlider = createSlider(0, 100, curLayout.Tail.count);
  tailSlider.position(sliderX, sliderY+90);
  
  // noLoop();
}

function draw() {
  background(50);
  image(curLayout.image, 0, 0, width, height);
  
  curLayout.Right.count = wingSlider.value();
  curLayout.Left.count = wingSlider.value();
  curLayout.Nose.count = noseSlider.value();
  curLayout.Fuse.count = fuseSlider.value();
  curLayout.Tail.count = tailSlider.value();

  curLayout.Right.reversed = wingCheck.checked();
  curLayout.Left.reversed = wingCheck.checked();
  curLayout.Nose.reversed = noseCheck.checked();
  curLayout.Fuse.reversed = fuseCheck.checked();
  curLayout.Tail.reversed = tailCheck.checked();

  curLayout.nosefuseJoined = nosefuseJoinCheck.checked();
  curLayout.wingNavLEDs = wingNavSlider.value();
  curLayout.wingNavPoint = curLayout.Right.count - (wingNavCheck.checked() ? curLayout.wingNavLEDs : 0);

  wingNavSlider.elt.max = wingSlider.value();

  text('wing (' + curLayout.Right.count + ')', wingSlider.x + wingSlider.width, wingSlider.y+7);
  text('nose (' + curLayout.Nose.count + ')', noseSlider.x + noseSlider.width, noseSlider.y+7);
  text('fuse (' + curLayout.Fuse.count + ')', fuseSlider.x + fuseSlider.width, fuseSlider.y+7);
  text('tail (' + curLayout.Tail.count + ')', tailSlider.x + tailSlider.width, tailSlider.y+7);

  text('Navlights (' + curLayout.wingNavLEDs + ')', wingNavSlider.x + wingNavSlider.width, wingNavSlider.y+7);
  text('show?', wingNavCheck.x + 15, wingNavCheck.y+6);

  text('rev?', wingCheck.x + 15, wingCheck.y+6);
  text('rev?', noseCheck.x + 15, noseCheck.y+6);
  text('rev?', fuseCheck.x + 15, fuseCheck.y+6);
  text('rev?', tailCheck.x + 15, tailCheck.y+6);
  text('Nose/Fuse joined?', nosefuseJoinCheck.x + 15, nosefuseJoinCheck.y+6);
  
  rainbow();

  if (wingNavCheck.checked()) {
    navlights();
  }

  drawStrip(curLayout.Right);
  drawStrip(curLayout.Left);
  drawStrip(curLayout.Nose);
  drawStrip(curLayout.Fuse);
  drawStrip(curLayout.Tail);
}



class Strip {
  constructor(label, info, position) {
    this.leds = [];
    this.label = label; // '>  ' + label + '  >';
    this.count = info.count;
    this.reversed = info.reversed;
    this.startpos = createVector(position.start[0], position.start[1]);
    this.endpos = createVector(position.end[0], position.end[1]);
    for (this.i = 0; this.i < this.count; this.i++) { this.leds[this.i] = color(0, 0, 0); }
  }
}

class Layout {
  constructor(data) {
    this.Right = new Strip('Right', data.wing, data.rightpos);
    this.Left = new Strip('Left', data.wing, data.leftpos);
    this.Nose = new Strip('Nose', data.nose, data.nosepos);
    this.Fuse = new Strip('Fuse', data.fuse, data.fusepos);
    this.Tail = new Strip('Tail', data.tail, data.tailpos);
    this.nosefuseJoined = data.nosefuseJoined;
    this.wingNavLEDs = data.wingNavLEDs;
    this.wingNavPoint = data.wing.count - this.wingNavLEDs;
    this.image = loadImage(String(data.image));
  }
}

function changeLayout() {
  curLayout = new Layout(layouts[layoutSelect.value()]);
  loadValues();
}

function loadValues() {
  wingSlider.value(curLayout.Right.count);
  noseSlider.value(curLayout.Nose.count);
  fuseSlider.value(curLayout.Fuse.count);
  tailSlider.value(curLayout.Tail.count);

  wingNavSlider.value(curLayout.wingNavLEDs);

  wingCheck.checked(curLayout.Right.reversed);
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

function setBothWings(led, color) {
  if (led < curLayout.wingNavLEDs) {
    curLayout.Left.leds[curLayout.wingNavPoint - led - 1] = color;
  } else {
    curLayout.Fuse.leds[led - curLayout.wingNavPoint] = color;
  }
}

function drawStrip(strip) {
  if (strip.count < 1) { return; }

  push();

  let startpos = createVector(strip.startpos.x * scaleW, strip.startpos.y * scaleH);
  let endpos = createVector(strip.endpos.x * scaleW, strip.endpos.y * scaleH);

  let label;
  if (strip.reversed) { label = '<<< ' + strip.label + ' <<<'; }
  else {                label = '>>> ' + strip.label + ' >>>'; }

  for (i = 0; i < strip.count; i++) {
    let diff = p5.Vector.sub(endpos, startpos).div(((strip.count > 1) ? (strip.count-1) : (1))).mult(i);
    let pos = p5.Vector.add(startpos, diff);
    fill(strip.leds[i]);
    ellipse(pos.x, pos.y, ledsize, ledsize);
  }

  fill(0);
  let midpos = p5.Vector.sub(endpos, startpos).div(2).add(startpos);
  let rot = p5.Vector.sub(endpos, startpos).heading();
  if (rot > HALF_PI) { rot -= PI; } // keep text "upright"

  translate(midpos.x, midpos.y);
  rotate(rot);

  textAlign(CENTER);
  textSize(14);
  textFont(font);

  // text bounding box background
  strokeWeight(0);
  fill(255);
  let bbox = font.textBounds(label, 0, -5, textSize());
  rect(bbox.x, bbox.y, bbox.w, bbox.h);

  // text
  strokeWeight(2);
  fill(0);
  text(label, 0, -5); 

  pop();
}

let navCounter = 0;
let navStep = 0;
function navlights() {
  navCounter += deltaTime;
  if (navCounter > 60) {
    navCounter = 0;
    navStep += 1;
  }

  push();
  colorMode(RGB, 255);

  switch (navStep) {
    case 25:
      // strobe 1
      setNavLights(color(255, 255, 255), color(255, 255, 255));
      break;
    case 27:
      // strobe 2
      setNavLights(color(255, 255, 255), color(255, 255, 255));
      break;
    case 28:
      // red/green, loop around
      setNavLights(color(255, 0, 0), color(0, 255, 0));
      navStep = 0;
      break;
    default:
      // red/green
      setNavLights(color(255, 0, 0), color(0, 255, 0));
      break;
  }
  pop();
}

function setNavLights(lcolor, rcolor) {
  for (i = curLayout.wingNavPoint; i < curLayout.Right.count; i++) {
    curLayout.Left.leds[i] = lcolor;
    curLayout.Right.leds[i] = rcolor;
  }
}

function rainbow() {
  colorMode(HSB, 255);
  for (i = 0; i < curLayout.wingNavPoint; i++) {
    curLayout.Right.leds[i] = color((frameCount + (i * 10))%255, 255, 255);
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

function generateConfig() {
return `// number of LEDs in specific strings
#define WING_LEDS ${curLayout.Right.count} // total wing LEDs
#define NOSE_LEDS ${curLayout.Nose.count} // total nose LEDs
#define FUSE_LEDS ${curLayout.Fuse.count} // total fuselage LEDs
#define TAIL_LEDS ${curLayout.Tail.count} // total tail LEDs

// strings reversed?
#define WING_REV ${curLayout.Right.reversed}
#define NOSE_REV ${curLayout.Nose.reversed}
#define FUSE_REV ${curLayout.Fuse.reversed}
#define TAIL_REV ${curLayout.Tail.reversed}

#define NOSE_FUSE_JOINED ${curLayout.nosefuseJoined} // are the nose and fuse strings joined?
#define WING_NAV_LEDS ${curLayout.wingNavLEDs} // wing LEDs that are navlights
`
}