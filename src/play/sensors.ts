class BasicSensor {
    robot: any

    look() {
        const position = [...this.robot.position];

        const self = document.querySelector(
          `.x${position[0]}.y${position[1]}`
        );
        self.classList.remove("fow");

        const north = document.querySelector(
          `.x${position[0]}.y${position[1] - 1}`
        );
        if (north && [0, 100, 300].includes(this.robot.direction)) {
          north.classList.remove("fow");
        }
        const east = document.querySelector(
          `.x${position[0] + 1}.y${position[1]}`
        );
        if (east && [0, 100, 200].includes(this.robot.direction)) {
          east.classList.remove("fow");
        }
        const south = document.querySelector(
          `.x${position[0]}.y${position[1] + 1}`
        );
        if (south && [100, 200, 300].includes(this.robot.direction)) {
          south.classList.remove("fow");
        }
        const west = document.querySelector(
          `.x${position[0] - 1}.y${position[1]}`
        );
        if (west && [0, 200, 300].includes(this.robot.direction)) {
          west.classList.remove("fow");
        }
      }
}