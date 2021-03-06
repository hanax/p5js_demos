var input;
var analyzer;
var oils;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(0);
  fill(228,89,33);
  noStroke();
  ellipse(windowWidth/2, windowHeight/2, 400, 400);
  mic = new p5.AudioIn();

  mic.start();

  // reduce frame rate
  frameRate(500);

  oils = new Oils();
}

function draw() {
  fill(228,89,33);
  noStroke();
  ellipse(windowWidth/2, windowHeight/2, 400, 400);

  var vol = mic.getLevel(); // 0-1.0
  var vol_normed = map(vol, 0, 0.1, 0, 100);

  var dir;
  if (Math.random() < 0.5) {
    dir = 1;
  } else {
    dir = -1;
  }

  if (vol_normed > 1) {
    oils.add(
      /* position */
      createVector(Math.min(windowWidth*Math.random(), windowWidth/2 - 200), windowHeight*Math.random()),
      /* velocity */
      createVector(Math.max(1, vol_normed/10), vol_normed/10 * dir),
      /* size */
      createVector(vol_normed, vol_normed),
      /* floatness */
      Math.min(0.5, Math.random()),
      dir
    );
  }
  oils.update();
  oils.display();

}

function Oils() {
  this.oils = [];
}

Oils.prototype.add = function(position, velocity, size, floatness, direction) {
  this.oils.push(new Oil(position, velocity, size, floatness, direction));
}

Oils.prototype.update = function() {  
  for (var i = 0; i < this.oils.length; i++) {
    this.oils[i].update();
  }
}  

Oils.prototype.display = function() {
  for (var i = this.oils.length - 1; i >= 0; i--) {
    if (this.oils[i].position.x > windowWidth/2 + 300 || this.oils[i].size.x < 2 || this.oils[i].size.y < 2 || this.oils[i].alpha < 0.1) {
      this.oils.splice(i, 1);
    } else {
      this.oils[i].display();
    }
  }
}

function Oil(position, velocity, size, floatness, direction) {
  this.position = createVector(position.x, position.y);
  this.velocity = createVector(velocity.x, velocity.y);
  this.floatness = floatness;
  this.size = size;
  this.direction = direction;
  this.acc = 1;
  this.alpha = 1;
}

Oil.prototype.update = function() {
  if (Math.random() < this.floatness) {
    this.size.mult(0.98);
  } else {
    this.size = createVector(Math.min(150, this.size.x*1.005), Math.min(150, this.size.y*1.005))
  }
  if (createVector(this.position.x-mouseX, this.position.y-mouseY).mag() < this.size.x) {
    this.acc = -2;
  }

  var abs_velocity_y = Math.abs(this.velocity.y);
  if (abs_velocity_y < 0.1) {
    this.direction *= -1;
    this.acc = 1;
  }
  if (abs_velocity_y > Math.max(1, this.floatness * 4)) {
    this.acc = -1;
  }
  if (this.acc === 1) {
    this.velocity = createVector(this.velocity.x, (abs_velocity_y+0.1)*this.direction);
  } else if (this.acc === -1) {
    this.velocity = createVector(this.velocity.x, (abs_velocity_y-0.1)*this.direction);
  } else {
    this.velocity = createVector(this.velocity.x*0.9, (abs_velocity_y)*0.9*this.direction);
    this.alpha *= 0.92;
  }
  this.position.add(this.velocity);
}

Oil.prototype.display = function() {
  blendMode(OVERLAY);
  var fillColor = 'rgba(255,247,144,' + this.alpha + ')';
  fill(fillColor);
  var strockColor = 'rgba(50,50,50,' + this.alpha + ')';
  stroke(strockColor);

  ellipse(this.position.x, this.position.y, this.size.x, this.size.y);
}

$(document).ready(function() { 
  $('#btn-save').click(function() {
    saveCanvas(canvas,'demo','jpg');
  });
});
