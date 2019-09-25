let ledsize = 10;

let layouts;
let curLayout;

let currentPoints;

let font;
let scaleW;
let scaleH;
let wingSlider, wingNavSlider, noseSlider, fuseSlider, tailSlider;
let wingCheck, wingNavCheck, noseCheck, fuseCheck, tailCheck, nosefuseJoinCheck;
let layoutSelect;
let showSelect;

let exportTextArea;
let exportLayoutTextArea;
let exportButton;

function preload() {
  layouts = {
    Radian: loadJSON('layouts/Radian.json'),
    Wing: loadJSON('layouts/Wing.json'),
    Generic: loadJSON('layouts/Generic.json')
  };
  font = loadFont('./assets/Roboto-Regular.ttf');
}

function setup() {
  createCanvas(700, 600);
  stroke(255);

  scaleW = width/100;
  scaleH = width/100;

  curLayout = new Layout(layouts["Radian"]);

  let sliderX = 20;
  let sliderY = 480;

  layoutSelect = createSelect();
  layoutSelect.position(sliderX, sliderY-40);
  layoutSelect.option('Radian');
  layoutSelect.option('Wing');
  layoutSelect.option('Generic');
  layoutSelect.changed(changeLayout);

  showSelect = createSelect();
  showSelect.position(layoutSelect.x + 170, layoutSelect.y);
  showSelect.option('Rainbow');
  showSelect.option('Cylon');
  
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
  
  exportButton = createButton('Generate config');
  exportButton.mousePressed(generateConfig);
  exportButton.style('display', 'block');
  
  let div1 = createDiv('config.h <br />');
  let div2 = createDiv('Layout JSON <br />');
  div1.style('display', 'table-cell');
  div2.style('display', 'table-cell');

  exportTextArea = createElement('textArea');
  exportTextArea.elt.cols = 80;
  exportTextArea.elt.rows = 18;
  exportTextArea.elt.readOnly = true;
  exportTextArea.parent(div1);
  
  exportLayoutTextArea = createElement('textArea');
  exportLayoutTextArea.elt.cols = 65;
  exportLayoutTextArea.elt.rows = 18;
  exportLayoutTextArea.elt.readOnly = true;
  exportLayoutTextArea.parent(div2);

  // noLoop();
}

function draw() {
  background(50);
  image(curLayout.image, 0, 0, width, width);
  
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

  text('Model', layoutSelect.x + 70, layoutSelect.y+7);
  text('Show', showSelect.x + 75, showSelect.y+7);

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
  
  switch(showSelect.value()) {
    case 'Rainbow':
      rainbow();
      break;
      case 'Cylon':
        cylon();
        break;
  }
  // rainbow();
  // cylon();
  
  if (wingNavCheck.checked()) {
    navlights();
  }

  drawStrip(curLayout.Right);
  drawStrip(curLayout.Left);
  drawStrip(curLayout.Nose);
  drawStrip(curLayout.Fuse);
  drawStrip(curLayout.Tail);

  mouseHighlight();
}


class Strip {
  constructor(label, info, position) {
    this.leds = [];
    this.label = label; // '>  ' + label + '  >';
    this.count = info.count;
    this.reversed = info.reversed;
    this.startpos = {pos: createVector(position.start[0]*scaleW, position.start[1]*scaleH), dragging: false};
    this.endpos = {pos: createVector(position.end[0]*scaleW, position.end[1]*scaleH), dragging: false};
    for (this.i = 0; this.i < this.count; this.i++) { this.leds[this.i] = color(0, 0, 0); }
  }
  set(led, color) {
    if (led < this.count) {
      if (this.reversed) {
        this.leds[this.count - led - 1] = color;
      } else {
        this.leds[led] = color;
      }
    }
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
    this.imagePath = String(data.image);
    this.image = loadImage(String(data.image));
  }
  getStripPoints() {
    return [
      this.Right.startpos, this.Right.endpos,
      this.Left.startpos, this.Left.endpos,
      this.Nose.startpos, this.Nose.endpos,
      this.Fuse.startpos, this.Fuse.endpos,
      this.Tail.startpos, this.Tail.endpos,
    ];
  }
}

function mousePressed() {
  for (i of currentPoints) {
    let distance = dist(mouseX, mouseY, i.pos.x, i.pos.y);
    if (distance < ledsize) {
      i.dragging = true;
    } else {
      i.dragging = false;
    }
  }
}

function mouseDragged() {
  for (i of currentPoints) {
    if (i.dragging) {
      if ( mouseX > 0 && mouseX < width) {
        i.pos.x = mouseX;
      }
      if ( mouseY > 0 && mouseY < height) {
        i.pos.y = mouseY;
      }
    }
  }
}

function mouseHighlight() {
  push();
  currentPoints = curLayout.getStripPoints();
  for (i of currentPoints) {
    // console.log(i);
    let distance = dist(mouseX, mouseY, i.pos.x, i.pos.y);
    if (distance < ledsize) {
      fill(0, 0, 0, 0);
      stroke(0);
      ellipse(i.pos.x, i.pos.y, 12, 12);
    }
  }
  pop();
  // noLoop();
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
    curLayout.Nose.set(led, color);
  } else {
    curLayout.Fuse.set(led - curLayout.Nose.count, color);
  }
}

function setBothWings(led, color) {
  if (led < curLayout.wingNavPoint) {
    curLayout.Left.set(curLayout.wingNavPoint - led - 1, color);
  } else {
    curLayout.Right.set(led - curLayout.wingNavPoint, color);
  }
}

function drawStrip(strip) {
  if (strip.count < 1) { return; }

  push();

  strokeWeight(0);

  let startpos = strip.startpos.pos;
  let endpos = strip.endpos.pos;

  let label = strip.label;
  // if (strip.reversed) { label = '<<< ' + strip.label + ' <<<'; }
  // else {                label = '>>> ' + strip.label + ' >>>'; }

  for (i = 0; i < strip.count; i++) {
    let diff = p5.Vector.sub(endpos, startpos).div(((strip.count > 1) ? (strip.count-1) : (1))).mult(i);
    let pos = p5.Vector.add(startpos, diff);
    fill(strip.leds[i]);
    ellipse(pos.x, pos.y, ledsize, ledsize);
  }

  fill(0);
  let midpos = p5.Vector.sub(endpos, startpos).div(2).add(startpos);
  let rot = p5.Vector.sub(endpos, startpos).heading();

  strokeWeight(2);
  textAlign(CENTER);
  textSize(10);
  textFont(font);
  
  translate(startpos.x, startpos.y);
  rotate(rot-HALF_PI);
  text('-Start', 18, 5);
  resetMatrix();
  translate(endpos.x, endpos.y);
  rotate(rot-HALF_PI);
  text('-End', 18, 5);
  
  if (rot > HALF_PI) { rot -= PI; } // keep text "upright"
  resetMatrix();
  translate(midpos.x, midpos.y);
  rotate(rot);
  
  textSize(14);
  // text bounding box background
  strokeWeight(0);
  fill(255);
  let bbox = font.textBounds(label, 0, -10, textSize());
  rect(bbox.x-5, bbox.y-2, bbox.w+10, bbox.h+4);

  // text
  strokeWeight(2);
  fill(0);
  text(label, 0, -10);


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
    curLayout.Left.set(i, lcolor);
    curLayout.Right.set(i, rcolor);
  }
}

function rainbow() {
  colorMode(HSB, 255);
  for (i = 0; i < curLayout.wingNavPoint; i++) {
    curLayout.Right.set(i, color((frameCount + (i * 10))%255, 255, 255));
    curLayout.Left.set(i, color((frameCount + (i * 10))%255, 255, 255));
  }
  if (curLayout.nosefuseJoined) {
    for (i = 0; i < (curLayout.Nose.count + curLayout.Fuse.count); i++) {
      setNoseFuse(i, color((frameCount + (i * 10))%255, 255, 255));
    }
  } else {
    for (i = 0; i < curLayout.Nose.count; i++) {
      curLayout.Nose.set(i, color((frameCount + (i * 10))%255, 255, 255));
    }
    for (i = 0; i < curLayout.Fuse.count; i++) {
      curLayout.Fuse.set(i, color((frameCount + (i * 10))%255, 255, 255));
    }
  }
  for (i = 0; i < curLayout.Tail.count; i++) {
    curLayout.Tail.set(i, color((frameCount + (i * 10))%255, 255, 255));
  }
}

function saw(speed) {
  return abs(millis()*speed/50000 % 2.0 - 1.0);
}

function cylon() {
  push();
  colorMode(HSB);

  // let saw = abs(millis()/1000 % 2.0 - 1.0);
  // let saw = abs(millis()*0.0005 % 2.0 - 1.0);

  let x;
  for (i = 0; i < curLayout.wingNavPoint; i++) {
    x = i;
    if (curLayout.Right.reversed) { x = curLayout.Right.count - i - 1; }
    curLayout.Right.set(i, color(0, 255, curLayout.Right.leds[x]._getBrightness()*0.9));
    curLayout.Left.set(i, color(0, 255, curLayout.Left.leds[x]._getBrightness()*0.9));
  }
  for (i = 0; i < curLayout.Nose.count; i++) {
    x = i;
    if (curLayout.Nose.reversed) { x = curLayout.Nose.count - i - 1; }
    curLayout.Nose.set(i, color(0, 255, curLayout.Nose.leds[x]._getBrightness()*0.9));
  }
  for (i = 0; i < curLayout.Fuse.count; i++) {
    x = i;
    if (curLayout.Fuse.reversed) { x = curLayout.Fuse.count - i - 1; }
    curLayout.Fuse.set(i, color(0, 255, curLayout.Fuse.leds[x]._getBrightness()*0.9));
  }
  for (i = 0; i < curLayout.Tail.count; i++) {
    x = i;
    if (curLayout.Tail.reversed) { x = curLayout.Tail.count - i - 1; }
    curLayout.Tail.set(i, color(0, 255, curLayout.Tail.leds[x]._getBrightness()*0.9));
  }
  //scale down

  setBothWings(int(saw(30)*(curLayout.wingNavPoint*2)), color(0, 255, 255));
  if (curLayout.nosefuseJoined) {
    setNoseFuse(int(saw(30)*(curLayout.Nose.count+curLayout.Fuse.count)), color(0, 255, 255));
  } else {
    curLayout.Nose.set(int(saw(50)*curLayout.Nose.count), color(0, 255, 255));
    curLayout.Fuse.set(int(saw(30)*curLayout.Fuse.count), color(0, 255, 255));
  }
  curLayout.Tail.set(int(saw(50)*curLayout.Tail.count), color(0, 255, 255));
  pop();
}

function generateConfig() {
exportTextArea.html(`// number of LEDs in specific strings
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
`);
exportLayoutTextArea.html(`{
  "wing": { "count": ${curLayout.Right.count}, "reversed": ${curLayout.Right.reversed} },
  "nose": { "count": ${curLayout.Nose.count}, "reversed": ${curLayout.Nose.reversed} },
  "fuse": { "count": ${curLayout.Fuse.count}, "reversed": ${curLayout.Fuse.reversed} },
  "tail": { "count": ${curLayout.Tail.count}, "reversed": ${curLayout.Tail.reversed} },

  "nosefuseJoined": ${curLayout.nosefuseJoined},
  "wingNavLEDs": ${curLayout.wingNavLEDs},
  
  "rightpos": { "start": [${Math.round(curLayout.Right.startpos.pos.x/scaleW*10)/10}, ${Math.round(curLayout.Right.startpos.pos.y/scaleH*10)/10}], "end": [${Math.round(curLayout.Right.endpos.pos.x/scaleW*10)/10}, ${Math.round(curLayout.Right.endpos.pos.y/scaleH*10)/10}] },
  "leftpos":  { "start": [${Math.round(curLayout.Left.startpos.pos.x/scaleW*10)/10}, ${Math.round(curLayout.Left.startpos.pos.y/scaleH*10)/10}], "end": [${Math.round(curLayout.Left.endpos.pos.x/scaleW*10)/10}, ${Math.round(curLayout.Left.endpos.pos.y/scaleH*10)/10}] },
  "nosepos":  { "start": [${Math.round(curLayout.Nose.startpos.pos.x/scaleW*10)/10}, ${Math.round(curLayout.Nose.startpos.pos.y/scaleH*10)/10}], "end": [${Math.round(curLayout.Nose.endpos.pos.x/scaleW*10)/10}, ${Math.round(curLayout.Nose.endpos.pos.y/scaleH*10)/10}] },
  "fusepos":  { "start": [${Math.round(curLayout.Fuse.startpos.pos.x/scaleW*10)/10}, ${Math.round(curLayout.Fuse.startpos.pos.y/scaleH*10)/10}], "end": [${Math.round(curLayout.Fuse.endpos.pos.x/scaleW*10)/10}, ${Math.round(curLayout.Fuse.endpos.pos.y/scaleH*10)/10}] },
  "tailpos":  { "start": [${Math.round(curLayout.Tail.startpos.pos.x/scaleW*10)/10}, ${Math.round(curLayout.Tail.startpos.pos.y/scaleH*10)/10}], "end": [${Math.round(curLayout.Tail.endpos.pos.x/scaleW*10)/10}, ${Math.round(curLayout.Tail.endpos.pos.y/scaleH*10)/10}] },

  "image": "${curLayout.imagePath}"
}
`);
}