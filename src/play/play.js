loadSkin();
loadLevel();

const NORTH = 0;
const EAST = 100;
const SOUTH = 200;
const WEST = 300;
const LEFT = -100;
const RIGHT = 100;

function loadSkin() {
  const href = GameConfiguration.skinUrl;
  if (href) {
    const skin = document.querySelector("link#skin");
    skin.href = decodeURIComponent(href);
  }
}

function loadLevel() {
  const src = GameConfiguration.levelUrl;

  if (!src) {
    alert("No level selected :(");
    throw new Error("No level! :?");
  }

  const levelScript = Object.assign(document.createElement("script"), {
    src,
  });
  document.body.appendChild(levelScript);
}

function play(floorPlan) {
  const body = document.querySelector("body");
  body.classList.replace("status=loading", "status=playing");

  const room = { floorPlan };

  const battery = new Battery({
    capacity: 100,
    charge: Infinity,
  });

  const memory = new Ram({
    size: GameConfiguration.memorySize,
  });

  const sensor = Sensor.create(GameConfiguration.sensorType);

  const robot = Robot.create({
    battery,
    memory,
    room,
    sensor,
  });
  const input = new Input({ robot });

  const ui = new Ui({
    robot,
    room,
  });

  tino = robertino = roberto = robot;

  run();

  function run() {
    ui.render();

    robot.suck();
    robot.look();

    input.run();

    requestAnimationFrame(run);
  }
}
