loadSkin();
loadLevel();

const NORTH = 0;
const EAST = 100;
const SOUTH = 200;
const WEST = 300;
const LEFT = -100;
const RIGHT = 100;

function loadSkin() {
  const url = new URL(location);
  const skinOverride = url.searchParams.get("skin");
  if (skinOverride) {
    const skin = document.querySelector("link#skin");
    skin.href = decodeURIComponent(skinOverride);
  }
}

function loadLevel() {
  const url = new URL(location);
  const levelUrl = url.searchParams.get("level");

  if (!levelUrl) {
    alert("No level selected :(");
    throw new Error("No level! :?");
  }

  const levelScript = Object.assign(document.createElement("script"), {
    src: levelUrl,
  });
  document.body.appendChild(levelScript);
}

function play(level) {
  const body = document.querySelector("body");
  body.classList.remove("status=loading");
  body.classList.add("status=playing");

  tino =
    robertino =
    roberto =
      {
        battery: {
          capacity: 30,
          charge: Infinity,
          use(amt = 0.1) {
            if (this.charge <= 0) {
              const roberto = document.getElementById("roberto");
              roberto.classList.add("battery");
              tino.emote("X(");
              throw new Error("No battery! X(");
            }
            this.charge = Math.max(this.charge - amt, 0);
          },
        },

        dustbox: {
          capacity: Infinity,
          amount: 0,
        },

        direction: 100,
        moving: false,
        position: [1, 1],
        rotation: 100,

        emote(text) {
          const tino = document.querySelector("#roberto .status");
          const glyph = tino.innerText;
          if (text == glyph) return;
          tino.innerText = text;
          if (this.battery.charge > 0)
            setTimeout(() => {
              tino.innerHTML = glyph;
            }, 500);
        },

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
        },

        look() {
          const position = [...this.position];

          const self = document.querySelector(
            `.x${position[0]}.y${position[1]}`
          );
          self.classList.remove("fow");

          const north = document.querySelector(
            `.x${position[0]}.y${position[1] - 1}`
          );
          if (north && [0, 100, 300].includes(this.direction)) {
            north.classList.remove("fow");
          }
          const east = document.querySelector(
            `.x${position[0] + 1}.y${position[1]}`
          );
          if (east && [0, 100, 200].includes(this.direction)) {
            east.classList.remove("fow");
          }
          const south = document.querySelector(
            `.x${position[0]}.y${position[1] + 1}`
          );
          if (south && [100, 200, 300].includes(this.direction)) {
            south.classList.remove("fow");
          }
          const west = document.querySelector(
            `.x${position[0] - 1}.y${position[1]}`
          );
          if (west && [0, 200, 300].includes(this.direction)) {
            west.classList.remove("fow");
          }
        },

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
          if (level[newPosition[1]][newPosition[0]] < 0) {
            this.emote("X0");
            console.error("BUMP! XO");
            this.moving = false;
            return;
          }
          this.position = newPosition;
          setTimeout(() => {
            this.moving = false;
          }, 1000);
        },

        suck() {
          const [x, y] = this.position;
          let tile = level[y][x];
          tile -= 0.1;
          if (tile >= 0) {
            this.dustbox.amount += 0.1;
            level[y][x] = tile;
          } else {
            level[y][x] = 0;
          }
        },
      };

  const input = new Input({
    robot: tino,
  });

  render();
  function render() {
    renderRoom();
    renderRobot();
    renderStats();

    tino.suck();
    tino.look();

    input.run();

    requestAnimationFrame(render);
  }

  function renderStats() {
    const battery = document.getElementById("battery");
    with (tino.battery) {
      const value = (charge * 100) / capacity;
      if (isNaN(value) || value < 0 || value >= Infinity)
        battery.style.display = "none";
      battery.innerText = `${value.toFixed(0)}%`;
    }

    const points = document.getElementById("stats");
    points.innerText = `${tino.dustbox.amount.toFixed(0)}pt`;
  }

  function renderRobot() {
    const roberto = document.getElementById("roberto");
    roberto.style.left = `${tino.position[0] * 20}vmin`;
    roberto.style.top = `${tino.position[1] * 20}vmin`;

    const rect = roberto.getBoundingClientRect();
    const dX = rect.left - window.innerWidth + rect.right;
    const dY = rect.top - window.innerHeight + rect.bottom;

    const viewport = document.getElementById("viewport");
    viewport.scrollBy(dX / 10, dY / 10);
  }

  function renderRoom() {
    const room = document.getElementById("room");
    room.style.height = `${level.length * 20}vmin`;
    room.style.width = `${level[0].length * 20}vmin`;

    for (const y in level) {
      const row = level[y];
      for (const x in row) {
        const value = row[x];
        const tile = getTile(x, y, value);
        const dirt = getDirt(tile);
        if (value > 0) dirt.style.opacity = value;
        tile.classList.remove("dirty");
      }
    }

    function getTile(x, y, value) {
      let tile = document.querySelector(`.tile.x${x}.y${y}`);
      if (tile) return tile;

      tile = document.createElement("div");
      tile.classList.add("tile", `x${x}`, `y${y}`, "fow");
      tile.style.left = `${x * 20}vmin`;
      tile.style.top = `${y * 20}vmin`;

      if (value >= 0) {
        tile.classList.add("floor");
        tile.style.backgroundPositionY = `${
          Math.floor(Math.random() * 5) * 20 - 1
        }px`;
      } else tile.classList.add("wall");

      room.appendChild(tile);
      return tile;
    }

    function getDirt(tile) {
      let dirt = tile.querySelector(".tile .dirt");
      if (dirt) return dirt;

      dirt = document.createElement("div");
      dirt.classList.add("dirt");

      tile.appendChild(dirt);
      tile.classList.add("dirty");

      dirt.style.background = [
        [0, 0],
        [100, 0],
        [0, 100],
        [100, 100],
      ]
        .map(([bx, by]) => {
          with (Math) {
            const x = floor(random() * 10) - 5 + bx;
            const y = floor(random() * 10) - 5 + by;
            const width = floor(random() * 20) - 10 + 50;
            const height = floor(random() * 20) - 10 + 50;
            return `${x}% ${y}%/${width}% ${height}% radial-gradient(grey, transparent) no-repeat`;
          }
        })
        .join(",");

      return dirt;
    }
  }
}
