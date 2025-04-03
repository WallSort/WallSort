function loadSavedImages() {
    let userSession = localStorage.getItem("userSession");

    if (!userSession) {
        document.getElementById("savedGallery").innerHTML = "<p>No saved images.</p>";
        return;
    }

    let savedImages = JSON.parse(localStorage.getItem(userSession)) || [];
    let gallery = document.getElementById("savedGallery");

    gallery.innerHTML = ""; // Clear before loading

    savedImages.forEach(url => {
        let imgContainer = document.createElement("div");
        imgContainer.className = "image-container";

        let img = document.createElement("img");
        img.src = url;
        img.className = "saved-img";

        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "select-checkbox";
        checkbox.value = url;

        imgContainer.appendChild(checkbox);
        imgContainer.appendChild(img);
        gallery.appendChild(imgContainer);
    });
}

function deleteSelectedImages() {
    let userSession = localStorage.getItem("userSession");
    let savedImages = JSON.parse(localStorage.getItem(userSession)) || [];

    let selectedCheckboxes = document.querySelectorAll(".select-checkbox:checked");
    selectedCheckboxes.forEach(checkbox => {
        savedImages = savedImages.filter(img => img !== checkbox.value);
    });

    localStorage.setItem(userSession, JSON.stringify(savedImages));
    loadSavedImages(); // Reload the gallery
}

function clearSavedImages() {
    let userSession = localStorage.getItem("userSession");
    if (userSession) {
        localStorage.removeItem(userSession);
        alert("All saved images cleared!");
        location.reload();
    }
}

// Load saved images when the page loads
window.onload = loadSavedImages;