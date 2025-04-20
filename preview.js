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
        if (swipeDistance > 140) {
            showImage(currentIndex - 1);
        } else if (swipeDistance < -140) {
            showImage(currentIndex + 1);
        }
        touchStartX = touchEndX = 0;
    });

});
    function saveImage() {
        let imageUrl = document.getElementById("preview-image").src;
    
        // Create a unique session key for each user (if not created)
        if (!localStorage.getItem("userSession")) {
            localStorage.setItem("userSession", "user_" + Date.now()); // Unique ID
        }
    
        let userSession = localStorage.getItem("userSession"); // Get session ID
        let savedImages = JSON.parse(localStorage.getItem(userSession)) || [];
    
        // Check if image already exists
        if (savedImages.includes(imageUrl)) {
            alert("Image already saved!");
            return; // Stop further execution
        }
    
        // Save image if not already saved
        savedImages.push(imageUrl);
        localStorage.setItem(userSession, JSON.stringify(savedImages));
    
        alert("Image saved to your collection!");
    }

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
    function loadSavedImages() {
    let userSession = localStorage.getItem("userSession");

    if (!userSession) {
        document.getElementById("savedGallery").innerHTML = "<p>No saved images.</p>";
        document.getElementById("count").textContent = 0;
        return;
    }

    let savedImages = JSON.parse(localStorage.getItem(userSession)) || [];

    document.getElementById("count").textContent = savedImages.length; // ✅ update count

    let gallery = document.getElementById("savedGallery");
    gallery.innerHTML = ""; // Clear before loading

    if (savedImages.length === 0) {
        gallery.innerHTML = "<p>No saved images.</p>";
        return;
    }

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
// ✅ One-time swipe guide popup
function showSwipeGuideOnce() {
    if (!localStorage.getItem("swipeGuideShown")) {
        const guide = document.getElementById("swipeGuide");
        guide.classList.add("show");

        setTimeout(() => {
            guide.classList.remove("show");
        }, 10000); // Hide after 4 seconds

        localStorage.setItem("swipeGuideShown", "true"); // Don't show again
    }
}

document.addEventListener("DOMContentLoaded", function () {
    showSwipeGuideOnce();
});
//analisys
wallpaperDiv.addEventListener("click", function () {
    gtag("event", "wallpaper_click", {
      image: item.name
    });
  });
//anlyse download
gtag("event", "download_wallpaper", {
    image: imageUrl
  });
    //s
    gtag("event", "page_view", {
        page_title: "Wallpaper Preview",
        page_location: window.location.href,
        page_path: "/preview.html"
      });  
