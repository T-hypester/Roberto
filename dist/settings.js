function saveSettings(){
    console.log("Saved settings")
    localStorage.setItem("skin", document.getElementById("skinmenu").value);
    localStorage.setItem("level", document.getElementById("level").value);
  }

  function loadSettings(){
    console.log("Loaded settings")
    document.getElementById("level").value = localStorage.getItem("level");
    document.getElementById("skinmenu").value = localStorage.getItem("skin");
  }