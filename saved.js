document.addEventListener("DOMContentLoaded", function () {
    const gallery = document.getElementById("savedGallery");
    let userSession = localStorage.getItem("userSession");
    if (!userSession) {
        gallery.innerHTML = "<p>No saved images.</p>";
        return;
    }

    let savedImages = JSON.parse(localStorage.getItem(userSession)) || [];

    if (savedImages.length === 0) {
        gallery.innerHTML = "<p>No saved wallpapers yet.</p>";
        return;
    }

    gallery.innerHTML = ""; // Clear before loading

    savedImages.forEach(imageUrl => {
        const imgContainer = document.createElement("div");
        imgContainer.classList.add("image-container");

        const img = document.createElement("img");
        img.src = imageUrl;
        img.classList.add("saved-img");

        // ✅ Redirect to preview.html with encoded data
        img.addEventListener("click", function () {
            const encodedSrc = encodeURIComponent(imageUrl);
            const title = encodeURIComponent("Saved Image");
            const desc = encodeURIComponent("This is your saved wallpaper.");
            window.location.href = `preview.html?image=${encodedSrc}&title=${title}&desc=${desc}`;
        });

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("select-checkbox");
        checkbox.value = imageUrl;

        imgContainer.appendChild(checkbox);
        imgContainer.appendChild(img);
        gallery.appendChild(imgContainer);
    });
});

function deleteSelectedImages() {
    let userSession = localStorage.getItem("userSession");
    let savedImages = JSON.parse(localStorage.getItem(userSession)) || [];

    const selected = document.querySelectorAll(".select-checkbox:checked");
    selected.forEach(checkbox => {
        savedImages = savedImages.filter(img => img !== checkbox.value);
    });

    localStorage.setItem(userSession, JSON.stringify(savedImages));
    location.reload();
}

function clearSavedImages() {
    let userSession = localStorage.getItem("userSession");
    if (userSession) {
        localStorage.removeItem(userSession);
        alert("All saved images cleared!");
        location.reload();
    }
}
