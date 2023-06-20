function setdivskin(){
    document.getElementById("skincss").href = document.getElementById("skinmenu").value
    location.href='#'
  }

async function loadSkins(){
    const response = await fetch("skins/skins.json");
    const data = (await response.json()).skins;
    data.forEach(function(item) {
      document.getElementById('skinmenu').insertAdjacentHTML("beforeend",'<option value="'+item.path+'" onclick="setdivskin()"> '+item.name+' </option>');
    });
    document.getElementById("skincss").href = localStorage.getItem("skin");
  }