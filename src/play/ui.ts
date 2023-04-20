class Ui {
  private robot: Robot;
  private room: any;

  constructor(ctx: {
    robot: Robot
    room: unknown
  }) {
    Object.assign(this, ctx)
  }

  render () {
    this.renderRoom();
    this.renderRobot();
    this.renderStats();
  }

  private renderStats() {
    const battery = document.getElementById("battery");

    const value =
      (this.robot.battery.charge * 100) / this.robot.battery.capacity;
    if (isNaN(value) || value < 0 || value >= Infinity)
      battery.style.display = "none";
    battery.innerText = `${value.toFixed(0)}%`;

    const points = document.getElementById("stats");
    points.innerText = `${this.robot.dustbox.amount.toFixed(0)}pt`;
  }

  private renderRobot() {
    const tileSize = this.getTileSize();
    const roberto = document.getElementById("roberto");
    roberto.style.width = `${tileSize}vmin`;
    roberto.style.height = `${tileSize}vmin`;
    roberto.style.left = `${this.robot.position[0] * tileSize}vmin`;
    roberto.style.top = `${this.robot.position[1] * tileSize}vmin`;

    const rect = roberto.getBoundingClientRect();
    const dX = rect.left - window.innerWidth + rect.right;
    const dY = rect.top - window.innerHeight + rect.bottom;

    const viewport = document.getElementById("viewport");
    viewport.scrollBy(dX / 10, dY / 10);
  }

  private renderRoom() {
    const tileSize = this.getTileSize();
    const html = document.getElementById("room");
    html.style.height = `${this.room.floorPlan.length * tileSize}vmin`;
    html.style.width = `${this.room.floorPlan[0].length * tileSize}vmin`;

    for (const y in this.room.floorPlan) {
      const row = this.room.floorPlan[y];
      for (const x in row) {
        this.setRobotPosition(parseInt(x), parseInt(y));
        this.drawTile(x, y);
        this.drawDirt(x, y);
      }
    }
  }

  private setRobotPosition(x, y) {
    const value = this.room.floorPlan[y][x];
    if (value === "S") {
      this.robot.position = [x, y];
      this.room.floorPlan[y][x] = 0;
    }
  }

  private drawTile(x, y) {
    const value = this.room.floorPlan[y][x];
    let tile = document.querySelector(`.tile.x${x}.y${y}`) as HTMLDivElement;
    if (tile) return;

    const html = document.getElementById("room");

    const tileSize = this.getTileSize();
    tile = document.createElement("div");
    tile.classList.add("tile", `x${x}`, `y${y}`, "fow");
    tile.style.width = `${tileSize}vmin`;
    tile.style.height = `${tileSize}vmin`;
    tile.style.left = `${x * tileSize}vmin`;
    tile.style.top = `${y * tileSize}vmin`;

    if (value >= 0) {
      tile.classList.add("floor");
      tile.style.backgroundPositionY = `${
        Math.floor(Math.random() * 5) * tileSize - 1
      }px`;
    } else tile.classList.add("wall");

    html.appendChild(tile);
  }

  private drawDirt(x, y) {
    const value = this.room.floorPlan[y][x];
    const tile = document.querySelector(`.tile.x${x}.y${y}`);
    let dirt = tile.querySelector<HTMLDivElement>(".tile .dirt");
    if (dirt) {
      if (value > 0) dirt.style.opacity = value;
      return;
    }

    dirt = document.createElement("div");
    dirt.classList.add("dirt");

    tile.appendChild(dirt);

    dirt.style.background = [
      [0, 0],
      [100, 0],
      [0, 100],
      [100, 100],
    ]
      .map(([bx, by]) => {
        const x = Math.floor(Math.random() * 10) - 5 + bx;
        const y = Math.floor(Math.random() * 10) - 5 + by;
        const width = Math.floor(Math.random() * 20) - 10 + 50;
        const height = Math.floor(Math.random() * 20) - 10 + 50;
        return `${x}% ${y}%/${width}% ${height}% radial-gradient(grey, transparent) no-repeat`;
      })
      .join(",");
  }

  private getTileSize() {
    return Math.floor(100 / this.getTilesPerSide());
  }

  private getTilesPerSide() {
    let val = Math.floor(Math.sqrt(this.robot.memory.size + 1));
    return val + 1 - (val % 2);
  }
}
