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

        function toggleLike() {
            const imageUrl = decodeURIComponent(new URLSearchParams(window.location.search).get("image"));
            let likes = JSON.parse(localStorage.getItem("likes")) || {};
            let likedImages = JSON.parse(localStorage.getItem("liked")) || [];
        
            const isLiked = likedImages.includes(imageUrl);
        
            if (isLiked) {
                likes[imageUrl] = Math.max((likes[imageUrl] || 1) - 1, 0);
                likedImages = likedImages.filter(img => img !== imageUrl);
                document.querySelector(".like-btn").innerHTML = `❤️ <span id="like-count">${likes[imageUrl]}</span>`;
            } else {
                likes[imageUrl] = (likes[imageUrl] || 0) + 1;
                likedImages.push(imageUrl);
                document.querySelector(".like-btn").innerHTML = `💖 <span id="like-count">${likes[imageUrl]}</span>`;
            }
        
            localStorage.setItem("likes", JSON.stringify(likes));
            localStorage.setItem("liked", JSON.stringify(likedImages));
        }
        
        // ✅ Load Like Count on Page Load
        document.addEventListener("DOMContentLoaded", function () {
            const imageUrl = decodeURIComponent(new URLSearchParams(window.location.search).get("image"));
            const likes = JSON.parse(localStorage.getItem("likes")) || {};
            const likedImages = JSON.parse(localStorage.getItem("liked")) || [];
        
            const count = likes[imageUrl] || 0;
            const isLiked = likedImages.includes(imageUrl);
        
            const likeBtn = document.querySelector(".like-btn");
            if (likeBtn) {
                likeBtn.innerHTML = `${isLiked ? "💖" : "❤️"} <span id="like-count">${count}</span>`;
            }
        });
        
    });
    //shere
    function shareContent() {
        if (navigator.share) {
            navigator.share({
                title: "Check this out!",
                text: "I found this amazing wallpaper!",
                url: window.location.href
            })
            .then(() => console.log("Shared successfully!"))
            .catch((error) => console.log("Error sharing:", error));
        } else {
            alert("Sharing is not supported on this browser.");
        }
    }
  function saveImage() {
    let imageUrl = document.getElementById("preview-image").src;

    // Create a unique session key for each user (if not created)
    if (!localStorage.getItem("userSession")) {
      localStorage.setItem("userSession", "user_" + Date.now()); // Unique ID
    }

    let userSession = localStorage.getItem("userSession"); // Get user session ID
    let savedImages = JSON.parse(localStorage.getItem(userSession)) || [];

    // Add new image
    savedImages.push(imageUrl);
    localStorage.setItem(userSession, JSON.stringify(savedImages));

    alert("Image saved to your collection!");
  }
