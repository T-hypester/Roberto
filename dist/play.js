class Battery {
    constructor(props) {
        this.charge = 0;
        Object.assign(this, props);
    }
    use(amt = 0.1) {
        if (this.charge <= 0) {
            const roberto = document.getElementById("roberto");
            roberto.classList.add("battery");
            this.robot.emote("X(");
            throw new Error("No battery! X(");
        }
        this.charge = Math.max(this.charge - amt, 0);
    }
}
const GameConfiguration = {
    levelUrl: localStorage.getItem("level"),
    memorySize: parseInt(localStorage.getItem("ram")),
    sensorType: localStorage.getItem("sensor"),
    skinUrl: localStorage.getItem("skin"),
};
class Input {
    constructor(ctx) {
        this.onKeyDown = (event) => {
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
                    this.input = undefined;
                    return;
            }
            //this.keyUp = false;
            event.preventDefault();
        };
        Object.assign(this, ctx);
        window.addEventListener("keydown", this.onKeyDown);
        //window.addEventListener("keyup", this.onKeyUp);
    }
    run() {
        if (this.robot.moving)
            return;
        const dir = this.input;
        this.input = undefined;
        if (!dir)
            return;
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
}
Input.LEFT = -100;
Input.FORWARD = +1;
Input.RIGHT = 100;
Input.BACK = -1;
class Ram {
    constructor(props) {
        this.size = 8;
        this.size = Math.min(48, Math.max(8, props.size));
    }
}
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
    const robot = {
        battery: undefined,
        dustbox: {
            capacity: Infinity,
            amount: 0,
        },
        memory: undefined,
        sensor: undefined,
        direction: 100,
        moving: false,
        position: [1, 1],
        rotation: 100,
        connect(devices) {
            Object.entries(devices).forEach(([bay, device]) => {
                device.robot = this;
                this[bay] = device;
            });
        },
        emote(text) {
            const tino = document.querySelector("#roberto .status");
            const glyph = tino.innerText;
            if (text == glyph)
                return;
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
            this.sensor.look();
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
            if (floorPlan[newPosition[1]][newPosition[0]] < 0) {
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
            let value = floorPlan[y][x];
            value -= 0.1;
            if (value >= 0) {
                this.dustbox.amount += 0.1;
                floorPlan[y][x] = value;
            }
            else {
                floorPlan[y][x] = 0;
            }
        },
    };
    setupRobot(robot);
    // Globally visible aliases for interacting with the robot
    // via the browser's console
    tino = robertino = roberto = robot;
    const input = new Input({ robot });
    run();
    function run() {
        renderRoom();
        renderRobot();
        renderStats();
        tino.suck();
        tino.look();
        input.run();
        requestAnimationFrame(run);
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
        const tileSize = getTileSize();
        const roberto = document.getElementById("roberto");
        roberto.style.width = `${tileSize}vmin`;
        roberto.style.height = `${tileSize}vmin`;
        roberto.style.left = `${tino.position[0] * tileSize}vmin`;
        roberto.style.top = `${tino.position[1] * tileSize}vmin`;
        const rect = roberto.getBoundingClientRect();
        const dX = rect.left - window.innerWidth + rect.right;
        const dY = rect.top - window.innerHeight + rect.bottom;
        const viewport = document.getElementById("viewport");
        viewport.scrollBy(dX / 10, dY / 10);
    }
    function renderRoom() {
        const tileSize = getTileSize();
        const room = document.getElementById("room");
        room.style.height = `${floorPlan.length * tileSize}vmin`;
        room.style.width = `${floorPlan[0].length * tileSize}vmin`;
        for (const y in floorPlan) {
            const row = floorPlan[y];
            for (const x in row) {
                setRobotPosition(parseInt(x), parseInt(y));
                drawTile(x, y);
                drawDirt(x, y);
            }
        }
        function setRobotPosition(x, y) {
            const value = floorPlan[y][x];
            if (value === "S") {
                robot.position = [x, y];
                floorPlan[y][x] = 0;
            }
        }
        function drawTile(x, y) {
            const value = floorPlan[y][x];
            let tile = document.querySelector(`.tile.x${x}.y${y}`);
            if (tile)
                return;
            const tileSize = getTileSize();
            tile = document.createElement("div");
            tile.classList.add("tile", `x${x}`, `y${y}`, "fow");
            tile.style.width = `${tileSize}vmin`;
            tile.style.height = `${tileSize}vmin`;
            tile.style.left = `${x * tileSize}vmin`;
            tile.style.top = `${y * tileSize}vmin`;
            if (value >= 0) {
                tile.classList.add("floor");
                tile.style.backgroundPositionY = `${Math.floor(Math.random() * 5) * tileSize - 1}px`;
            }
            else
                tile.classList.add("wall");
            room.appendChild(tile);
        }
        function drawDirt(x, y) {
            const value = floorPlan[y][x];
            const tile = document.querySelector(`.tile.x${x}.y${y}`);
            let dirt = tile.querySelector(".tile .dirt");
            if (dirt) {
                if (value > 0)
                    dirt.style.opacity = value;
                return;
            }
            dirt = document.createElement("div");
            dirt.classList.add("dirt");
            tile.appendChild(dirt);
            //tile.classList.add("dirty");
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
        }
    }
    function getTileSize() {
        return Math.floor(100 / getTilesPerSide());
    }
    function getTilesPerSide() {
        let val = Math.floor(Math.sqrt(tino.memory.size + 1));
        return val + 1 - (val % 2);
    }
}
function setupRobot(robot) {
    const battery = new Battery({
        capacity: 100,
        charge: Infinity,
    });
    const memory = new Ram({
        size: GameConfiguration.memorySize,
    });
    const sensor = SensorFactory.create(GameConfiguration.sensorType);
    robot.connect({ battery, memory, sensor });
}
class SensorFactory {
    static create(type) {
        switch (type) {
            case "laser":
                return new LaserSensor();
            default:
            case "base":
                return new BasicSensor();
        }
    }
}
class BasicSensor {
    look() {
        const position = [...this.robot.position];
        const self = document.querySelector(`.x${position[0]}.y${position[1]}`);
        self.classList.remove("fow");
        const north = document.querySelector(`.x${position[0]}.y${position[1] - 1}`);
        if (north && [0, 100, 300].includes(this.robot.direction)) {
            north.classList.remove("fow");
        }
        const east = document.querySelector(`.x${position[0] + 1}.y${position[1]}`);
        if (east && [0, 100, 200].includes(this.robot.direction)) {
            east.classList.remove("fow");
        }
        const south = document.querySelector(`.x${position[0]}.y${position[1] + 1}`);
        if (south && [100, 200, 300].includes(this.robot.direction)) {
            south.classList.remove("fow");
        }
        const west = document.querySelector(`.x${position[0] - 1}.y${position[1]}`);
        if (west && [0, 200, 300].includes(this.robot.direction)) {
            west.classList.remove("fow");
        }
    }
}
class LaserSensor {
    look() {
        const position = [...this.robot.position];
        const startTile = document.querySelector(`.x${position[0]}.y${position[1]}`);
        startTile.classList.remove("fow");
        var tmpPos = [...position];
        var tile = startTile;
        tmpPos = [...position];
        tile = startTile;
        let ymax = Infinity;
        let ymin = -Infinity;
        while (!tile.classList.contains("wall")) {
            let tmpPosI = [...tmpPos];
            let tileI = tile;
            while (!tileI.classList.contains("wall") && tmpPosI[1] < ymax) {
                tmpPosI = [tmpPosI[0], tmpPosI[1] + 1];
                tileI = document.querySelector(`.x${tmpPosI[0]}.y${tmpPosI[1]}`);
                tileI.classList.remove("fow");
            }
            ymax = Math.min(ymax, tmpPosI[1]);
            tmpPosI = [...tmpPos];
            tileI = tile;
            while (!tileI.classList.contains("wall") && tmpPosI[1] > ymin) {
                tmpPosI = [tmpPosI[0], tmpPosI[1] - 1];
                tileI = document.querySelector(`.x${tmpPosI[0]}.y${tmpPosI[1]}`);
                tileI.classList.remove("fow");
            }
            ymin = Math.max(ymin, tmpPosI[1]);
            tmpPos = [tmpPos[0] + 1, tmpPos[1]];
            var tile = document.querySelector(`.x${tmpPos[0]}.y${tmpPos[1]}`);
            tile.classList.remove("fow");
        }
        tmpPos = [...position];
        tile = startTile;
        ymax = Infinity;
        ymin = -Infinity;
        while (!tile.classList.contains("wall")) {
            let tmpPosI = [...tmpPos];
            let tileI = tile;
            while (!tileI.classList.contains("wall") && tmpPosI[1] < ymax) {
                tmpPosI = [tmpPosI[0], tmpPosI[1] + 1];
                tileI = document.querySelector(`.x${tmpPosI[0]}.y${tmpPosI[1]}`);
                tileI.classList.remove("fow");
            }
            ymax = Math.min(ymax, tmpPosI[1]);
            tmpPosI = [...tmpPos];
            tileI = tile;
            while (!tileI.classList.contains("wall") && tmpPosI[1] > ymin) {
                tmpPosI = [tmpPosI[0], tmpPosI[1] - 1];
                tileI = document.querySelector(`.x${tmpPosI[0]}.y${tmpPosI[1]}`);
                tileI.classList.remove("fow");
            }
            ymin = Math.max(ymin, tmpPosI[1]);
            tmpPos = [tmpPos[0] - 1, tmpPos[1]];
            var tile = document.querySelector(`.x${tmpPos[0]}.y${tmpPos[1]}`);
            tile.classList.remove("fow");
        }
    }
}
