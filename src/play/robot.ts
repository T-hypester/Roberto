class Robot {
  battery: Battery;
  memory: Ram;
  sensor: Sensor;
  dustbox = {
    capacity: Infinity,
    amount: 0,
  };

  direction = 100;
  moving = false;
  position = [1, 1];
  rotation = 100;

  room: any;

  static create(components: Partial<Record<keyof Robot, Component>>) {
    const robot = new Robot();
    Object.entries(components).forEach(([connector, component]) => {
      component.robot = robot;
      robot[connector] = component;
    });
    return robot;
  }

  emote(text) {
    const status = document.querySelector("#roberto .status") as HTMLDivElement;
    const glyph = status.innerText;
    if (text == glyph) return;
    status.innerText = text;
    if (this.battery.charge > 0)
      setTimeout(() => {
        status.innerHTML = glyph;
      }, 500);
  }

  rotate(side) {
    this.moving = true;
    this.battery.use();
    switch (side) {
      case LEFT:
      case RIGHT:
        this.rotation += side;
        break;
    }
    this.direction = (this.rotation + 400) % 400;
    const roberto = document.getElementById("roberto");
    roberto.style.transform = `rotateZ(${this.rotation - 100}grad)`;
    setTimeout(() => {
      this.moving = false;
    }, 1000);
  }

  look() {
    this.sensor.detect();
  }

  move(amount = Input.FORWARD) {
    this.moving = true;
    this.battery.use();
    const newPosition = [...this.position];
    switch ((this.direction + 400) % 400) {
      case NORTH:
        newPosition[1] = this.position[1] - amount;
        break;
      case EAST:
        newPosition[0] = this.position[0] + amount;
        break;
      case SOUTH:
        newPosition[1] = this.position[1] + amount;
        break;
      case WEST:
        newPosition[0] = this.position[0] - amount;
        break;
    }
    if (this.room.floorPlan[newPosition[1]][newPosition[0]] < 0) {
      this.emote("X0");
      console.error("BUMP! XO");
      this.moving = false;
      return;
    }
    this.position = newPosition;
    setTimeout(() => {
      this.moving = false;
    }, 1000);
  }

  suck() {
    const [x, y] = this.position;
    let value = this.room.floorPlan[y][x];
    value -= 0.1;
    if (value >= 0) {
      this.dustbox.amount += 0.1;
      this.room.floorPlan[y][x] = value;
    } else {
      this.room.floorPlan[y][x] = 0;
    }
  }
}
