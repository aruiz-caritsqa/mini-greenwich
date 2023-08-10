import Level from './Level.js';
import Player from './Player.js';
import Vec from './Vec.js'; 
import Coin from './Coin.js'; 
import Lava from './Lava.js'; 
import State from './State.js'; 
import GAME_LEVELS from './levels.js';
import CanvasDisplay from './CanvasDisplay.js';

// const { Level } = require('../Level');
// const { Player } = require('../Player');
// const { Vec } = require('../Vec');
// const { Coin } = require('../Coin');
// const { Lava } = require('../Lava');
// const { State } = require('../State');
// const { DOMDisplay } = require('../DOMDisplay');

const scale = 20;

// const simpleLevelPlan = `
// ......................
// ..#................#..
// ..#..............=.#..
// ..#.........o.o....#..
// ..#.@......#####...#..
// ..#####............#..
// ......#++++++++++++#..
// ......##############..
// ......................`;

// const simpleLevel = new Level(simpleLevelPlan);

// function drawGrid(level) {
//   return elt("table", {
//     class: "background",
//     style: `width: ${level.width * scale}px`
//   }, ...level.rows.map(row =>
//     elt("tr", {style: `height: ${scale}px`},
//         ...row.map(type => elt("td", {class: type})))
//   ));
// }

// function drawActors(actors) {
//   return elt("div", {}, ...actors.map(actor => {
//     let rect = elt("div", {class: `actor ${actor.type}`});
//     rect.style.width = `${actor.size.x * scale}px`;
//     rect.style.height = `${actor.size.y * scale}px`;
//     rect.style.left = `${actor.pos.x * scale}px`;
//     rect.style.top = `${actor.pos.y * scale}px`;
//     return rect;
//   }));
// }

// DOMDisplay.prototype.syncState = function(state) {
//   if (this.actorLayer) this.actorLayer.remove();
//   this.actorLayer = drawActors(state.actors);
//   this.dom.appendChild(this.actorLayer);
//   this.dom.className = `game ${state.status}`;
//   this.scrollPlayerIntoView(state);
// };

// DOMDisplay.prototype.scrollPlayerIntoView = function(state) {
//   let width = this.dom.clientWidth;
//   let height = this.dom.clientHeight;
//   let margin = width / 3;

//   // The viewport
//   let left = this.dom.scrollLeft, right = left + width;
//   let top = this.dom.scrollTop, bottom = top + height;

//   let player = state.player;
//   let center = player.pos.plus(player.size.times(0.5))
//                          .times(scale);

//   if (center.x < left + margin) {
//     this.dom.scrollLeft = center.x - margin;
//   } else if (center.x > right - margin) {
//     this.dom.scrollLeft = center.x + margin - width;
//   }
//   if (center.y < top + margin) {
//     this.dom.scrollTop = center.y - margin;
//   } else if (center.y > bottom - margin) {
//     this.dom.scrollTop = center.y + margin - height;
//   }
// };

function overlap(actor1, actor2) {
  return actor1.pos.x + actor1.size.x > actor2.pos.x
         && actor1.pos.x < actor2.pos.x + actor2.size.x
         && actor1.pos.y + actor1.size.y > actor2.pos.y
         && actor1.pos.y < actor2.pos.y + actor2.size.y;
}

Level.prototype.touches = function (pos, size, type) {
  const xStart = Math.floor(pos.x);
  const xEnd = Math.ceil(pos.x + size.x);
  const yStart = Math.floor(pos.y);
  const yEnd = Math.ceil(pos.y + size.y);

  for (let y = yStart; y < yEnd; y++) {
    for (let x = xStart; x < xEnd; x++) {
      const isOutside = x < 0 || x >= this.width
                      || y < 0 || y >= this.height;
      const here = isOutside ? 'wall' : this.rows[y][x];
      if (here === type) return true;
    }
  }
  return false;
};

State.prototype.update = function (time, keys) {
  const actors = this.actors
    .map((actor) => actor.update(time, this, keys));
  let newState = new State(this.level, actors, this.status);

  if (newState.status !== 'playing') return newState;

  const { player } = newState;
  if (this.level.touches(player.pos, player.size, 'lava')) {
    return new State(this.level, actors, 'lost');
  }

  for (const actor of actors) {
    if (actor !== player && overlap(actor, player)) {
      newState = actor.collide(newState);
    }
  }
  return newState;
};

Lava.prototype.collide = function (state) {
  return new State(state.level, state.actors, 'lost');
};

Coin.prototype.collide = function (state) {
  const filtered = state.actors.filter((a) => a !== this);
  let { status } = state;
  if (!filtered.some((a) => a.type === 'coin')) status = 'won';
  return new State(state.level, filtered, status);
};

Lava.prototype.update = function (time, state) {
  const newPos = this.pos.plus(this.speed.times(time));
  if (!state.level.touches(newPos, this.size, 'wall')) {
    return new Lava(newPos, this.speed, this.reset);
  } if (this.reset) {
    return new Lava(this.reset, this.speed, this.reset);
  }
  return new Lava(this.pos, this.speed.times(-1));
};

const wobbleSpeed = 8; const
  wobbleDist = 0.07;

Coin.prototype.update = function (time) {
  const wobble = this.wobble + time * wobbleSpeed;
  const wobblePos = Math.sin(wobble) * wobbleDist;
  return new Coin(
    this.basePos.plus(new Vec(0, wobblePos)),
    this.basePos,

    wobble,
  );
};

const playerXSpeed = 7;
const gravity = 30;
const jumpSpeed = 17;

Player.prototype.update = function (time, state, keys) {
  let xSpeed = 0;
  if (keys.ArrowLeft) xSpeed -= playerXSpeed;
  if (keys.ArrowRight) xSpeed += playerXSpeed;
  let { pos } = this;
  const movedX = pos.plus(new Vec(xSpeed * time, 0));
  if (!state.level.touches(movedX, this.size, 'wall')) {
    pos = movedX;
  }

  let ySpeed = this.speed.y + time * gravity;
  const movedY = pos.plus(new Vec(0, ySpeed * time));
  if (!state.level.touches(movedY, this.size, 'wall')) {
    pos = movedY;
  } else if (keys.ArrowUp && ySpeed > 0) {
    ySpeed = -jumpSpeed;
  } else {
    ySpeed = 0;
  }
  return new Player(pos, new Vec(xSpeed, ySpeed));
};

function trackKeys(keys) {
  const down = Object.create(null);
  function track(event) {
    if (keys.includes(event.key)) {
      down[event.key] = event.type === 'keydown';
      event.preventDefault();
    }
  }
  window.addEventListener('keydown', track);
  window.addEventListener('keyup', track);
  return down;
}

const arrowKeys = trackKeys(['ArrowLeft', 'ArrowRight', 'ArrowUp']);

function runAnimation(frameFunc) {
  let lastTime = null;
  function frame(time) {
    if (lastTime != null) {
      const timeStep = Math.min(time - lastTime, 100) / 1000;
      if (frameFunc(timeStep) === false) return;
    }
    lastTime = time;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function runLevel(level, Display) {
  const display = new Display(document.body, level);
  let state = State.start(level);
  let ending = 1;
  return new Promise((resolve) => {
    runAnimation((time) => {
      state = state.update(time, arrowKeys);
      display.syncState(state);
      if (state.status === 'playing') {
        return true;
      } if (ending > 0) {
        ending -= time;
        return true;
      }
      display.clear();
      resolve(state.status);
      return false;
    });
  });
}

async function runGame(plans, Display) {
  for (let level = 0; level < plans.length;) {
    const status = await runLevel(
      new Level(plans[level]),
      Display,
    );
    if (status === 'won') level++;
  }
  console.log("You've won!");
}

runGame(GAME_LEVELS, CanvasDisplay);
