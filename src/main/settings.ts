const level = document.getElementById("level") as HTMLSelectElement;

function saveSettings() {
  console.info('saveSettings', { skinmenu: skinmenu.value, level: level.value });
  localStorage.setItem("skin", skinmenu.value);
  localStorage.setItem("level", level.value);
}

function loadSettings() {
  level.value = localStorage.getItem("level");
  skinmenu.value = localStorage.getItem("skin");
  console.info('loadSettings', { skinmenu: skinmenu.value, level: level.value });
}
