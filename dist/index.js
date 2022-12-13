window.addEventListener("load", main)

function main () {
    const splash = document.getElementById("splash")
    splash.addEventListener("click", () => {
        splash.classList.add("clicked")
    })
}