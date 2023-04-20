class Input implements Component {
  static LEFT = -100;
  static FORWARD = +1;
  static RIGHT = 100;
  static BACK = -1;

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
      case Input.FORWARD:
      case Input.BACK:
        this.robot.move(dir);
        break;
      case Input.LEFT:
      case Input.RIGHT:
        this.robot.rotate(dir);
        break;
    }
  }

  private onKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "ArrowRight":
        this.input = Input.RIGHT;
        break;
      case "ArrowLeft":
        this.input = Input.LEFT;
        break;
      case "ArrowUp":
        this.input = Input.FORWARD;
        break;
      case "ArrowDown":
        this.input = Input.BACK;
        break;
      default:
        this.input = undefined;
        return;
    }
    //this.keyUp = false;
    event.preventDefault();
  };
}
