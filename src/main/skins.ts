const skincss = document.getElementById("skincss") as HTMLLinkElement;
const skinmenu = document.getElementById("skinmenu") as HTMLSelectElement;

function setdivskin() {
  skincss.href = skinmenu.value;
  console.info("setdivskin", { skincss: skincss.href });
  location.assign("#");
}

function loadSkins() {
  skincss.href = localStorage.getItem("skin");
  console.info("loadSkins", { skincss: skincss.href });

  fetch("skins/skins.json")
    .then((response) => response.json())
    .then((json) => json.skins)
    .then((skins) =>
      skins.forEach((skin) => {
        skinmenu.insertAdjacentHTML(
          "beforeend",
          '<option value="' +
            skin.path +
            '" onclick="setdivskin()"> ' +
            skin.name +
            " </option>"
        );
      })
    );
}
