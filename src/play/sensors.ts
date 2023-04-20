class Sensor {
  static create(type: string) {
    switch (type) {
      case "laser":
        return new LaserSensor();
      default:
      case "base":
        return new BasicSensor();
    }
  }

  detect() {}
}

class BasicSensor implements Sensor {
  robot: Robot;

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

class LaserSensor implements Sensor {
  robot: Robot;

  detect() {
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
