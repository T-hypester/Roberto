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
      } else {
        game.play();
      }
      break;
  }
});
