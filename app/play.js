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
var GameConfiguration = {
    levelUrl: localStorage.getItem("level"),
    memorySize: parseInt(localStorage.getItem("ram")),
    sensorType: localStorage.getItem("sensor"),
    skinUrl: localStorage.getItem("skin"),
};
var game;
class Game {
    static start(floorPlan) {
        game = new Game({ room: { floorPlan } });
        game.play();
    }
    constructor(conf) {
        this.room = { floorPlan: undefined };
        this.running = false;
        this.onAnimationFrame = () => {
            this.ui.render();
            this.robot.suck();
            this.robot.look();
            this.input.run();
            if (this.running)
                requestAnimationFrame(this.onAnimationFrame);
        };
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
            room: this.room,
            sensor: this.sensor,
        });
        this.input = new Input({ robot: this.robot });
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
}
class Input {
    constructor(ctx) {
        this.onKeyDown = (event) => {
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
const body = document.querySelector("body");
body.classList.replace("status=loading", "status=playing");
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
window.addEventListener("keyup", (event) => {
    switch (event.key) {
        case "Escape":
            if (game.running) {
                game.pause();
                document.getElementById("menu").showModal();
            }
            else {
                game.play();
            }
            break;
    }
});
class Robot {
    constructor() {
        this.dustbox = {
            capacity: Infinity,
            amount: 0,
        };
        this.direction = 100;
        this.moving = false;
        this.position = [1, 1];
        this.rotation = 100;
    }
    static create(components) {
        const robot = new Robot();
        Object.entries(components).forEach(([connector, component]) => {
            component.robot = robot;
            robot[connector] = component;
        });
        return robot;
    }
    emote(text) {
        const status = document.querySelector("#roberto .status");
        const glyph = status.innerText;
        if (text == glyph)
            return;
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
        }
        else {
            this.room.floorPlan[y][x] = 0;
        }
    }
}
class Sensor {
    static create(type) {
        switch (type) {
            case "laser":
                return new LaserSensor();
            default:
            case "base":
                return new BasicSensor();
        }
    }
    detect() { }
}
class BasicSensor {
    detect() {
        const position = [...this.robot.position];
        for (let x = position[0] - 1; x <= position[0] + 1; x++) {
            for (let y = position[1] - 1; y <= position[1] + 1; y++) {
                const tile = document.querySelector(`.x${x}.y${y}`);
                tile.classList.remove("fow");
            }
        }
    }
}
class LaserSensor {
    detect() {
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
class Ui {
    constructor(ctx) {
        Object.assign(this, ctx);
    }
    render() {
        this.renderRoom();
        this.renderRobot();
        this.renderStats();
    }
    renderStats() {
        const battery = document.getElementById("battery");
        const value = (this.robot.battery.charge * 100) / this.robot.battery.capacity;
        if (isNaN(value) || value < 0 || value >= Infinity)
            battery.style.display = "none";
        battery.innerText = `${value.toFixed(0)}%`;
        const points = document.getElementById("stats");
        points.innerText = `${this.robot.dustbox.amount.toFixed(0)}pt`;
    }
    renderRobot() {
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
    renderRoom() {
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
    setRobotPosition(x, y) {
        const value = this.room.floorPlan[y][x];
        if (value === "S") {
            this.robot.position = [x, y];
            this.room.floorPlan[y][x] = 0;
        }
    }
    drawTile(x, y) {
        const value = this.room.floorPlan[y][x];
        let tile = document.querySelector(`.tile.x${x}.y${y}`);
        if (tile)
            return;
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
            tile.style.backgroundPositionY = `${Math.floor(Math.random() * 5) * tileSize - 1}px`;
        }
        else
            tile.classList.add("wall");
        html.appendChild(tile);
    }
    drawDirt(x, y) {
        const value = this.room.floorPlan[y][x];
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
    getTileSize() {
        return Math.floor(100 / this.getTilesPerSide());
    }
    getTilesPerSide() {
        let val = Math.floor(Math.sqrt(this.robot.memory.size + 1));
        return val + 1 - (val % 2);
    }
}
