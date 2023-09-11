interface Component {
  robot: Robot;
}

var GameConfiguration = {
  levelUrl: localStorage.getItem("level"),
  memorySize: parseInt(localStorage.getItem("ram")),
  sensorType: localStorage.getItem("sensor"),
  skinUrl: localStorage.getItem("skin"),
};

var game: Game;

class Game {
  private input: KeyboardInput;
  private room = { floorPlan: undefined };
  private ui: Ui;

  private battery: Battery;
  private memory: Ram;
  private sensor: LaserSensor | BasicSensor;
  private robot: Robot;

  private running = false;

  static start(floorPlan) {
    game = new Game({ room: { floorPlan } });
    game.play();
  }

  private constructor(conf: unknown) {
    Object.assign(this, conf);

    this.battery = new Battery({
      capacity: 100,
      charge: Infinity,
    });

    this.memory = new Ram({
      size: GameConfiguration.memorySize,
    });

    this.sensor = Sensor.create(GameConfiguration.sensorType);

    this.robot = Robot.create({
      battery: this.battery,
      memory: this.memory,
      room: this.room as any,
      sensor: this.sensor,
    });

    this.input = new KeyboardInput({ robot: this.robot });

    this.ui = new Ui({
      robot: this.robot,
      room: this.room,
    });
  }

  play() {
    this.running = true;
    this.onAnimationFrame();
  }

  pause() {
    this.running = false;
  }

  private onAnimationFrame = () => {
    this.ui.render();

    this.robot.suck();
    this.robot.look();

    this.input.run();

    if (this.running) requestAnimationFrame(this.onAnimationFrame);
  };
}
