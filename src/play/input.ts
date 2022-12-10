class Input {
  static LEFT = -100;
  static FORWARD = +1;
  static RIGHT = 100;
  static BACK = -1;

  //private keyUp = true;
  private input?: number;
  private robot: any;

  constructor(ctx: { robot: any }) {
    Object.assign(this, ctx);
    window.addEventListener("keydown", this.onKeyDown);
    //window.addEventListener("keyup", this.onKeyUp);
  }

  run(): void {
    if (this.robot.moving) return;
    const dir = this.input;
    this.input = undefined
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
    //if (!this.keyUp) return;

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
        this.input = undefined
        return;
    }
    //this.keyUp = false;
    event.preventDefault();
  };

  /* private onKeyUp = () => {
    this.keyUp = true;
  }; */
}
