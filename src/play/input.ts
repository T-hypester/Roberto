enum Motion {
  LEFT = -100,
  FORWARD = +1,
  RIGHT = 100,
  BACK = -1,
}

class KeyboardInput implements Component {
  robot: Robot;

  private input?: number;

  constructor(ctx: { robot: any }) {
    Object.assign(this, ctx);
    window.addEventListener("keydown", this.onKeyDown);
  }

  run(): void {
    if (this.robot.moving) return;
    const dir = this.input;
    this.input = undefined;
    if (!dir) return;
    switch (dir) {
      case Motion.FORWARD:
      case Motion.BACK:
        this.robot.move(dir);
        break;
      case Motion.LEFT:
      case Motion.RIGHT:
        this.robot.rotate(dir);
        break;
    }
  }

  private onKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "ArrowRight":
        this.input = Motion.RIGHT;
        break;
      case "ArrowLeft":
        this.input = Motion.LEFT;
        break;
      case "ArrowUp":
        this.input = Motion.FORWARD;
        break;
      case "ArrowDown":
        this.input = Motion.BACK;
        break;
      default:
        this.input = undefined;
        return;
    }
    event.preventDefault();
  };
}
