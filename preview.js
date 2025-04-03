document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const imageUrl = urlParams.get("image");
    const imageTitle = urlParams.get("title");
    const imageDesc = urlParams.get("desc");

    if (imageUrl) {
        document.getElementById("preview-image").src = decodeURIComponent(imageUrl);
        document.getElementById("bg").src = decodeURIComponent(imageUrl);
        document.getElementById("imageTitle").innerText = decodeURIComponent(imageTitle) || "Unknown Title";
        document.getElementById("imageDesc").innerText = decodeURIComponent(imageDesc) || "No description available.";
        document.getElementById("download-btn").href = decodeURIComponent(imageUrl);
    } else {
        document.body.innerHTML = "<h2>Image not found!</h2>";
    }

    // ✅ Fix Swipe Navigation (Avoids Conflicts)
    let touchStartX = 0, touchEndX = 0;
    const previewImage = document.getElementById("preview-image");
    const images = JSON.parse(localStorage.getItem("wallpapers")) || [];
    let currentIndex = images.findIndex(img => img.src === imageUrl);

    function showImage(index) {
        if (index >= 0 && index < images.length) {
            const nextImage = images[index];
            previewImage.src = nextImage.src;
            document.getElementById("imageTitle").innerText = nextImage.name;
            document.getElementById("imageDesc").innerText = nextImage.description;
            document.getElementById("download-btn").href = nextImage.src;
            document.getElementById("bg").src = nextImage.src;
            currentIndex = index;
            updateLikeButton(nextImage.src);
        }
    }

    document.addEventListener("touchstart", (event) => {
        if (event.target.closest(".like-btn") || event.target.closest(".save-btn")) return; // ✅ Ignore Like & Save Button
        touchStartX = event.touches[0].clientX;
    });

    document.addEventListener("touchmove", (event) => {
        touchEndX = event.touches[0].clientX;
    });

    document.addEventListener("touchend", () => {
        if (touchStartX === 0 || touchEndX === 0) return;
        let swipeDistance = touchEndX - touchStartX;
        if (swipeDistance > 50) {
            showImage(currentIndex - 1);
        } else if (swipeDistance < -50) {
            showImage(currentIndex + 1);
        }
        touchStartX = touchEndX = 0;
    });

    // ✅ Fetch & Load Images from JSON
    fetch("data.json")
        .then(response => response.json())
        .then(data => {
            const jsonGallery = document.getElementById("jsonGallery");
            jsonGallery.innerHTML = ""; // Clear previous content

            data.forEach(item => {
                let wallpaperDiv = document.createElement("div");
                wallpaperDiv.classList.add("wallpaper");

                wallpaperDiv.innerHTML = `
                    <img src="${item.src}" alt="${item.name}">
                    <button class="like-btn" data-src="${item.src}" data-liked="false">❤️ <span>0</span></button>
                    <button class="save-btn" data-src="${item.src}">💾 Save</button>
                `;

                jsonGallery.appendChild(wallpaperDiv);
            });

            updateLikeButtons();
            updateSavedImages();
        })
        .catch(error => console.error("Error loading images:", error));

    // ✅ Like Button Event Delegation (Fixed)
    document.getElementById("jsonGallery").addEventListener("click", function (event) {
        if (event.target.classList.contains("like-btn")) {
            event.stopPropagation(); // ✅ Prevent swipe triggering
            let likeBtn = event.target;
            let likeCount = likeBtn.querySelector("span");
            let imageSrc = likeBtn.getAttribute("data-src");
            let isLiked = likeBtn.getAttribute("data-liked") === "true";
            let likes = JSON.parse(localStorage.getItem("likes")) || {};

            if (isLiked) {
                likes[imageSrc] = Math.max((likes[imageSrc] || 1) - 1, 0);
                likeBtn.setAttribute("data-liked", "false");
            } else {
                likes[imageSrc] = (likes[imageSrc] || 0) + 1;
                likeBtn.setAttribute("data-liked", "true");
            }

            likeCount.textContent = likes[imageSrc];
            localStorage.setItem("likes", JSON.stringify(likes));
        }
    });

    // ✅ Save Button Event Delegation (Fixed)
    document.getElementById("jsonGallery").addEventListener("click", function (event) {
        if (event.target.classList.contains("save-btn")) {
            event.stopPropagation(); // ✅ Prevent accidental swipe
            let saveBtn = event.target;
            let imageSrc = saveBtn.getAttribute("data-src");

            let savedImages = JSON.parse(localStorage.getItem("savedImages")) || [];

            if (savedImages.includes(imageSrc)) {
                savedImages = savedImages.filter(img => img !== imageSrc);
                saveBtn.textContent = "💾 Save";
            } else {
                savedImages.push(imageSrc);
                saveBtn.textContent = "✅ Saved";
            }

            localStorage.setItem("savedImages", JSON.stringify(savedImages));
        }
    });

    // ✅ Update Save Buttons (After Refresh)
    function updateSavedImages() {
        let savedImages = JSON.parse(localStorage.getItem("savedImages")) || [];
        document.querySelectorAll(".save-btn").forEach(btn => {
            let imageSrc = btn.getAttribute("data-src");
            if (savedImages.includes(imageSrc)) {
                btn.textContent = "✅ Saved";
            }
        });
    }

    // ✅ Update Like Button UI from LocalStorage
    function updateLikeButtons() {
        let likes = JSON.parse(localStorage.getItem("likes")) || {};
        document.querySelectorAll(".like-btn").forEach(btn => {
            let imageSrc = btn.getAttribute("data-src");
            let likeCount = btn.querySelector("span");
            if (likes[imageSrc]) {
                likeCount.textContent = likes[imageSrc];
                btn.setAttribute("data-liked", "true");
            }
        });
    }
});
