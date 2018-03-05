function menuToggle() {
    var topnav = document.getElementById("my-top-nav");
    if (topnav.className === "topnav") {
        topnav.className += " responsive";
    } else {
        topnav.className = "topnav";
    }
}
