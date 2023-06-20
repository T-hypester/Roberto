const level = document.getElementById("level");
function saveSettings() {
    console.info('saveSettings', { skinmenu: skinmenu.value, lelvel: level.value });
    localStorage.setItem("skin", skinmenu.value);
    localStorage.setItem("level", level.value);
}
function loadSettings() {
    level.value = localStorage.getItem("level");
    skinmenu.value = localStorage.getItem("skin");
    console.info('loadSettings', { skinmenu: skinmenu.value, lelvel: level.value });
}
const skincss = document.getElementById("skincss");
const skinmenu = document.getElementById("skinmenu");
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
        .then((skins) => skins.forEach((skin) => {
        skinmenu.insertAdjacentHTML("beforeend", '<option value="' +
            skin.path +
            '" onclick="setdivskin()"> ' +
            skin.name +
            " </option>");
    }));
}
