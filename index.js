
// Function to show the loader
function showLoader() {
    document.getElementById("loader").style.display = "flex";
}

// Function to hide the loader
function hideLoader() {
    document.getElementById("loader").style.display = "none";
}

// ✅ Search Function with Keyword Filtering
function searchWallpapers() {
    let input = document.getElementById('searchBar').value.toLowerCase();
    let wallpapers = document.querySelectorAll('.wallpaper');

    showLoader(); // Show loading animation

    setTimeout(() => {
        wallpapers.forEach(wallpaper => {
            let name = wallpaper.getAttribute('data-name') || "";
            let desc = wallpaper.getAttribute('data-desc') || "";
            let keywords = wallpaper.getAttribute('data-keywords') || "";

            if (name.includes(input) || desc.includes(input) || keywords.includes(input)) {
                wallpaper.style.display = "block";
            } else {
                wallpaper.style.display = "none";
            }
        });

        hideLoader(); // Hide loader after search
    }, 500); // Simulated delay for smooth effect
}

// ✅ Trigger search function on input change
document.getElementById('searchBar').addEventListener('input', searchWallpapers);

// ✅ Enable horizontal scrolling with mouse wheel
const scrollContainer = document.getElementById("gallery");
scrollContainer.addEventListener("wheel", (evt) => {
    evt.preventDefault();
    scrollContainer.scrollLeft += evt.deltaY;
});

// ✅ Fetch & Display JSON Data with Keywords Support
document.addEventListener("DOMContentLoaded", function () {
    fetch("data.json") // Load JSON file
        .then(response => response.json())
        .then(data => {
            const jsonGallery = document.getElementById("jsonGallery");

            data.forEach(item => {
                let wallpaperDiv = document.createElement("div");
                wallpaperDiv.classList.add("wallpaper");
                wallpaperDiv.setAttribute("data-name", item.name.toLowerCase());
                wallpaperDiv.setAttribute("data-desc", item.description ? item.description.toLowerCase() : "");
                wallpaperDiv.setAttribute("data-keywords", item.keywords ? item.keywords.join(" ").toLowerCase() : "");

                wallpaperDiv.innerHTML = `
                    <img src="${item.src}" alt="${item.name}">
                `;

                // ✅ Redirect to preview page when clicked
                wallpaperDiv.addEventListener("click", function () {
                    let encodedSrc = encodeURIComponent(item.src);
                    let encodedTitle = encodeURIComponent(item.name);
                    let encodedDesc = encodeURIComponent(item.description || "");

                    window.location.href = `preview.html?image=${encodedSrc}&title=${encodedTitle}&desc=${encodedDesc}`;
                });

                jsonGallery.appendChild(wallpaperDiv);
            });
        })
        .catch(error => console.error("Error loading images:", error));
});

// ✅ Search by Category (Clicking a Tag)
function searchByCategory(category) {
    document.getElementById('searchBar').value = category;
    searchWallpapers();
}
document.addEventListener("DOMContentLoaded", function () {
    fetch("data.json") // Load JSON file
        .then(response => response.json())
        .then(data => {
            const jsonGallery = document.getElementById("jsonGallery");

            data.forEach(item => {
                let wallpaperDiv = document.createElement("div");
                wallpaperDiv.classList.add("wallpaper");
                wallpaperDiv.setAttribute("data-name", item.name.toLowerCase());

                wallpaperDiv.innerHTML = `
                    <img src="${item.src}" alt="${item.name}">
                `;

                jsonGallery.appendChild(wallpaperDiv);
            });

            // Add long press effect after images are loaded
            addLongPressEffect();
        })
        .catch(error => console.error("Error loading images:", error));
});

// Function to apply long press effect
function addLongPressEffect() {
    let longPressTimer;

    document.querySelectorAll(".wallpaper img").forEach(img => {
        img.addEventListener("touchstart", function () {
            longPressTimer = setTimeout(() => {
                this.classList.add("anim"); // Apply animation on long press
            }, 500); // 500ms long press
        });

        img.addEventListener("touchend", function () {
            clearTimeout(longPressTimer);
            this.classList.remove("anim"); // Remove animation on release
        });

        img.addEventListener("touchcancel", function () {
            clearTimeout(longPressTimer);
            this.classList.remove("anim");
        });
    });
}

document.addEventListener("DOMContentLoaded", function () {
    fetch("data.json")
        .then(response => response.json())
        .then(data => {
            const jsonGallery = document.getElementById("jsonGallery");

            data.forEach(item => {
                let wallpaperDiv = document.createElement("div");
                wallpaperDiv.classList.add("wallpaper");
                wallpaperDiv.setAttribute("data-name", item.name.toLowerCase());

                wallpaperDiv.innerHTML = `

                `;

                // When an image is clicked, show loading animation and then redirect
                wallpaperDiv.addEventListener("click", function () {
                    // Create and show the loading screen
                    let loadingScreen = document.createElement("div");
                    loadingScreen.id = "loader";
                    // Wait a moment before redirecting (smooth effect)
                    setTimeout(() => {
                        window.location.href = `preview.html?image=${encodeURIComponent(item.src)}&title=${encodeURIComponent(item.name)}&desc=${encodeURIComponent(item.desc)}`;
                    }, 1000);
                });

                jsonGallery.appendChild(wallpaperDiv);
            });
        })
        .catch(error => console.error("Error loading images:", error));
});

//prevent lomg press
document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("img").forEach(img => {
        // Disable right-click
        img.addEventListener("contextmenu", (e) => e.preventDefault());

        // Disable drag-and-drop
        img.addEventListener("dragstart", (e) => e.preventDefault());

        // Disable long press (on mobile)
        let touchTimer;
        img.addEventListener("touchstart", () => {
            touchTimer = setTimeout(() => {
                alert("Long press is disabled.");
            }, 500); // 500ms delay (adjust if needed)
        });

        img.addEventListener("touchend", () => clearTimeout(touchTimer));
    });
});

//saving img fo rrederection
fetch("data.json")
    .then(response => response.json())
    .then(data => {
        localStorage.setItem("wallpapers", JSON.stringify(data)); // Save wallpapers list
    });

    /// long press effect
    document.addEventListener("DOMContentLoaded", function () {
    let popupMenu = document.getElementById("popupMenu");
    let overlay = document.querySelector(".popup-overlay");
    let longPressTimeout;
    let selectedImage = null;

    fetch("data.json")
        .then(response => response.json())
        .then(data => {
            const jsonGallery = document.getElementById("jsonGallery");

            data.forEach(item => {
                let wallpaperDiv = document.createElement("div");
                wallpaperDiv.classList.add("wallpaper");

                wallpaperDiv.innerHTML = `
                    <img src="${item.src}" alt="${item.name}">
                `;

                jsonGallery.appendChild(wallpaperDiv);
            });

            // Attach event listeners after images load
            addLongPressEvents();
        })
        .catch(error => console.error("Error loading images:", error));

    function addLongPressEvents() {
        document.querySelectorAll(".wallpaper img").forEach(img => {
            img.addEventListener("touchstart", (e) => {
                longPressTimeout = setTimeout(() => {
                    selectedImage = img.src;
                    showPopup(e.touches[0].clientX, e.touches[0].clientY);
                }, 1110);
            });

            img.addEventListener("touchend", () => clearTimeout(longPressTimeout));
            img.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                selectedImage = img.src;
                showPopup(e.clientX, e.clientY);
            });
        });
    }

    function showPopup(x, y) {
        popupMenu.style.left = `${x}px`;
        popupMenu.style.top = `${y + window.scrollY}px`; // Add scroll position
        popupMenu.style.display = "block";
        overlay.style.display = "block";
    }
    
    overlay.addEventListener("click", () => {
        popupMenu.style.display = "none";
        overlay.style.display = "none";
    });

    document.addEventListener("click", function (event) {
        if (event.target.classList.contains("save-btn")) {
            let imgSrc = event.target.closest(".image-container").querySelector("img").src;
            let savedImages = JSON.parse(localStorage.getItem("savedImages")) || [];
            savedImages.push(imgSrc);
            localStorage.setItem("savedImages", JSON.stringify(savedImages));
            alert("Image saved!");
        }
    
        if (event.target.classList.contains("share-btn")) {
            let imgSrc = event.target.closest(".image-container").querySelector("img").src;
            if (navigator.share) {
                navigator.share({
                    title: "Check out this wallpaper!",
                    url: imgSrc
                }).catch(err => console.error("Error sharing:", err));
            } else {
                prompt("Copy this link to share:", imgSrc);
            }
        }
    });
});    
// Color dropdown menu
// Selecting elements
const colorPicker = document.getElementById("colorPicker");
const colorDropdown = document.getElementById("colorDropdown");
const colorOptions = document.querySelectorAll(".color-option");
const clearFilter = document.getElementById("clearFilter");

// Toggle dropdown on click
colorPicker.addEventListener("click", () => {
    colorDropdown.classList.toggle("show-dropdown");
});

// Handle color selection
colorOptions.forEach(option => {
    option.addEventListener("click", () => {
        let selectedColor = option.getAttribute("data-color");

        if (selectedColor) {
            colorPicker.style.backgroundColor = selectedColor; // Change main circle color
            filterByColor(selectedColor); // Call correct function
        } else {
            resetWallpapers();
        }
        
        colorDropdown.classList.remove("show-dropdown"); // Close dropdown
    });
});



// Reset filter when grey circle (X) is clicked
clearFilter.addEventListener("click", () => {
    colorPicker.style.backgroundColor = "grey"; // Reset to default
    resetWallpapers();
    colorDropdown.classList.remove("show-dropdown");
});

// Fetch and filter wallpapers by color
async function filterWallpapers(color) {
    const response = await fetch("data.json");
    const wallpapers = await response.json();

    // Filter wallpapers based on color
    const filteredWallpapers = wallpapers.filter(wallpaper => wallpaper.color === color);

    // Call function to update the display
    displayWallpapers(filteredWallpapers);
}
colorOptions.forEach(option => {
    option.addEventListener("click", () => {
        let selectedColor = option.getAttribute("data-color");

        if (selectedColor) {
            colorPicker.style.backgroundColor = selectedColor; // Change main circle color
            filterWallpapers(selectedColor); // Now correctly updates display
        } else {
            resetWallpapers(); // Reset to all wallpapers if no color is selected
        }

        colorDropdown.classList.remove("show-dropdown"); // Close dropdown
    });
});

// Function to reset wallpapers
async function resetWallpapers() {
    const response = await fetch("data.json");
    const wallpapers = await response.json();
    
    displayWallpapers(wallpapers); // Show all wallpapers again
}

function searhColor() {
    let input = document.getElementById('searchBar').value.toLowerCase();
    let wallpapers = document.querySelectorAll('.wallpaper');

    showLoader(); // Show loading animation

    setTimeout(() => {
        wallpapers.forEach(wallpaper => {
            let color = wallpaper.getAttribute('data-color') || "";

            if (color.includes(input) ) {
                wallpaper.style.display = "block";
            } else {
                wallpaper.style.display = "none";
            }
        });

        hideLoader(); // Hide loader after search
    }, 500); // Simulated delay for smooth effect
}




//serch button
document.querySelector(".srcs").addEventListener("click", function () {
    let searchBar = document.querySelector(".searchBar");
    searchBar.scrollIntoView({ behavior: "smooth" });
    searchBar.focus();
});




    