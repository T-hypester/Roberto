interface Sensor {
  look();
}

class SensorFactory {
  static create(type: string) {
    switch (type) {
      case "laser":
        return new LaserSensor();
      default:
      case "base":
        return new BasicSensor();
    }
  }
}

class BasicSensor implements Sensor {
  robot: any;

  look() {
    const position = [...this.robot.position];

    const self = document.querySelector(`.x${position[0]}.y${position[1]}`);
    self.classList.remove("fow");

    const north = document.querySelector(
      `.x${position[0]}.y${position[1] - 1}`
    );
    if (north && [0, 100, 300].includes(this.robot.direction)) {
      north.classList.remove("fow");
    }
    const east = document.querySelector(`.x${position[0] + 1}.y${position[1]}`);
    if (east && [0, 100, 200].includes(this.robot.direction)) {
      east.classList.remove("fow");
    }
    const south = document.querySelector(
      `.x${position[0]}.y${position[1] + 1}`
    );
    if (south && [100, 200, 300].includes(this.robot.direction)) {
      south.classList.remove("fow");
    }
    const west = document.querySelector(`.x${position[0] - 1}.y${position[1]}`);
    if (west && [0, 200, 300].includes(this.robot.direction)) {
      west.classList.remove("fow");
    }
  }
}

class LaserSensor implements Sensor {
  robot: any;

  look() {
    const position = [...this.robot.position];
    const startTile = document.querySelector(
      `.x${position[0]}.y${position[1]}`
    );
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
