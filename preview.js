    // --- Variables ---
    // Variable to store the array of images (assuming loaded from localStorage)
    // Ensure localStorage('wallpapers') contains objects with at least a 'src' property.
    // Ideally, it should have the same structure as items in your data.json (src, name, description).
    const images = JSON.parse(localStorage.getItem("wallpapers")) || [];
    let currentIndex = -1; // Keep track of the index of the currently displayed image

    // Variables for swipe detection
    let touchStartX = 0;
    let touchEndX = 0;
    const swipeThreshold = 140; // Minimum swipe distance in pixels

    // Get references to the main image and the new preview image elements
    const previewImage = document.getElementById("preview-image");
    const prevImageElement = document.getElementById("prev-preview-image");
    const nextImageElement = document.getElementById("next-preview-image");

    // Get references to other elements updated by the script
    const bgElement = document.getElementById("bg"); // Assuming you have a background image element
    const imageTitleElement = document.getElementById("imageTitle");
    const imageDescElement = document.getElementById("imageDesc");
    const downloadBtnElement = document.getElementById("download-btn");


    // --- Functions ---

    // Function to update the main image, details, and the preview thumbnails
    function showImage(index) {
        // Ensure the index is within the bounds of the images array (handle wrap-around)
        if (images.length === 0) {
             console.warn("No images available to display.");
             // Handle UI for no images case
             if(previewImage) previewImage.src = ""; // Clear image
             if(imageTitleElement) imageTitleElement.innerText = "No Images";
             if(imageDescElement) imageDescElement.innerText = "";
             if(downloadBtnElement) downloadBtnElement.href = "#";
             if(bgElement) bgElement.src = "";
             if(prevImageElement) prevImageElement.style.display = 'none';
             if(nextImageElement) nextImageElement.style.display = 'none';
             return; // Exit function if no images
        }

        // Calculate the new index with wrap-around logic
        const newIndex = (index % images.length + images.length) % images.length;
        const nextImage = images[newIndex]; // The image object to display

        // --- Update the Main Image and Details ---
        if(previewImage) previewImage.src = nextImage.src;
        if(imageTitleElement) imageTitleElement.innerText = nextImage.name || "Unknown Title"; // Use || for fallback
        if(imageDescElement) imageDescElement.innerText = nextImage.description || "No description available."; // Use || for fallback
        if(downloadBtnElement) downloadBtnElement.href = nextImage.src; // Update download link
        // Assuming you want the background image to also update
        if(bgElement) bgElement.src = nextImage.src;

        // Update the current index
        currentIndex = newIndex;

        // --- Update the Previous and Next Preview Thumbnails ---
        if (images.length > 1) { // Only show previews if there's more than one image
             // Calculate the indices for the previous and next images with wrap-around
            const prevIndex = (currentIndex - 1 + images.length) % images.length;
            const nextIndex = (currentIndex + 1) % images.length;

            // Set the source of the preview image elements
            if (prevImageElement) {
                prevImageElement.src = images[prevIndex].src;
                prevImageElement.style.display = ''; // Ensure it's visible
            }
            if (nextImageElement) {
                nextImageElement.src = images[nextIndex].src;
                 nextImageElement.style.display = ''; // Ensure it's visible
            }

        } else {
             // Hide preview images if there's only one or zero images
            if (prevImageElement) prevImageElement.style.display = 'none';
            if (nextImageElement) nextImageElement.style.display = 'none';
        }

        // Add click listener to the previous preview image
    if (prevImageElement) {
        prevImageElement.addEventListener("click", function() {
            // Calculate the index of the previous image using wrap-around logic
            const prevIndex = (currentIndex - 1 + images.length) % images.length;
            
            // Call the showImage function to display the previous image and update previews
            showImage(prevIndex);
            console.log("Clicked previous preview, showing index:", prevIndex); // Optional log
        });
    }

    // Add click listener to the next preview image
    if (nextImageElement) {
        nextImageElement.addEventListener("click", function() {
            // Calculate the index of the next image using wrap-around logic
            const nextIndex = (currentIndex + 1) % images.length;
            
            // Call the showImage function to display the next image and update previews
            showImage(nextIndex);
            console.log("Clicked next preview, showing index:", nextIndex); // Optional log
        });
    }

        // --- Optional: Update Like Button Status and URL in Address Bar ---
        // updateLikeButton(nextImage.src); // Uncomment if you have this function
        // const newUrl = `${window.location.origin}${window.location.pathname}?image=${encodeURIComponent(nextImage.src)}&title=${encodeURIComponent(nextImage.name || '')}&desc=${encodeURIComponent(nextImage.description || '')}`;
        // history.replaceState(null, '', newUrl); // Use replaceState to not fill up history

         // --- Google Analytics Tracking for Page View (Moved here to track each image view) ---
         // Assuming gtag is defined globally elsewhere
         if (typeof gtag === 'function') {
             gtag("event", "page_view", {
                 page_title: nextImage.name || "Wallpaper Preview", // Use image name or default title
                 page_location: window.location.href, // Use current URL (consider updating it above)
                 page_path: "/preview.html" // Or a more specific path if you update the URL
             });
         }

    }

    // --- Your Existing Save Function ---
    function saveImage() {
        // Use the src of the currently displayed image
        let imageUrl = previewImage ? previewImage.src : null;

        if (!imageUrl) {
             alert("Could not get image URL to save.");
             return;
        }

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
         // Optional: Trigger GA event for save
         if (typeof gtag === 'function') {
             gtag("event", "save_wallpaper", { image: imageUrl });
         }
    }

    // --- Your Existing Share Function ---
    function shareContent() {
        // Use the URL of the currently displayed image or the current page URL
        const urlToShare = window.location.href; // Shares the URL of the preview page
        // Or use the direct image URL if you prefer: const urlToShare = previewImage ? previewImage.src : null;

        if (!urlToShare) {
             alert("Could not get URL to share.");
             return;
        }


        if (navigator.share) {
            navigator.share({
                title: imageTitleElement ? imageTitleElement.innerText : "Check this out!", // Use the current title
                text: imageDescElement ? `"${imageDescElement.innerText}" - Check out this wallpaper!` : "I found this amazing wallpaper!", // Use current desc
                url: urlToShare
            })
            .then(() => console.log("Shared successfully!"))
            .catch((error) => {
                 console.log("Error sharing:", error);
                 // User might have cancelled, no need for alert unless it's a real error
                 // alert("Error sharing.");
            });
        } else {
            alert("Sharing is not supported on this browser.");
        }
        // Optional: Trigger GA event for share
         if (typeof gtag === 'function') {
             gtag("event", "share_wallpaper", { image: previewImage ? previewImage.src : 'unknown' });
         }
    }

    // --- Your Existing loadSavedImages Function (Likely for a different page, but included) ---
    function loadSavedImages() {
    let userSession = localStorage.getItem("userSession");

    if (!userSession) {
        const savedGallery = document.getElementById("savedGallery");
         if(savedGallery) savedGallery.innerHTML = "<p>No saved images.</p>";
        const countElement = document.getElementById("count");
         if(countElement) countElement.textContent = 0;
        return;
    }

    let savedImages = JSON.parse(localStorage.getItem(userSession)) || [];

    const countElement = document.getElementById("count");
    if(countElement) countElement.textContent = savedImages.length; // ✅ update count

    let gallery = document.getElementById("savedGallery");
    if(!gallery) {
        console.error("Saved gallery element #savedGallery not found.");
        return;
    }
    gallery.innerHTML = ""; // Clear before loading

    if (savedImages.length === 0) {
        gallery.innerHTML = "<p>No saved images.</p>";
        return;
    }

    const fragment = document.createDocumentFragment(); // Use fragment for performance

    savedImages.forEach(url => {
        let imgContainer = document.createElement("div");
        imgContainer.className = "image-container";

        let img = document.createElement("img");
        img.src = url;
        img.className = "saved-img";
         img.loading = "lazy"; // Add lazy loading for saved images too

        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "select-checkbox";
        checkbox.value = url;

        imgContainer.appendChild(checkbox);
        imgContainer.appendChild(img);
        fragment.appendChild(imgContainer); // Append to fragment
    });

    gallery.appendChild(fragment); // Append fragment to gallery
}

    // ✅ Your Existing One-time swipe guide popup function
    function showSwipeGuideOnce() {
        if (!localStorage.getItem("swipeGuideShown")) {
            const guide = document.getElementById("swipeGuide"); // Assuming you have a #swipeGuide element
            if (guide) {
                guide.classList.add("show");

                setTimeout(() => {
                    guide.classList.remove("show");
                }, 10000); // Hide after 10 seconds

                localStorage.setItem("swipeGuideShown", "true"); // Don't show again
            }
        }
    }


    // --- Event Listener for DOM Content Loaded ---
    document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const imageUrl = urlParams.get("image");
    const imageTitle = urlParams.get("title");
    const imageDesc = urlParams.get("desc");

    // Find the index of the initially loaded image based on the URL parameter
    // Find based on the decoded URL to match localStorage content
    const decodedImageUrl = decodeURIComponent(imageUrl);
    // Use findIndex to get the position in the array
    let startingIndex = images.findIndex(img => img.src === decodedImageUrl);


    if (imageUrl && startingIndex !== -1) { // Ensure image URL is present and found in the images array

        // Use showImage to set the initial image AND update the previews
        showImage(startingIndex);

         // ✅ Call swipe guide function
        showSwipeGuideOnce();

    } else {
        // Handle case where imageUrl is missing or not found in localStorage
        console.error("Image URL missing or not found in localStorage('wallpapers'). URL:", imageUrl);
        document.body.innerHTML = "<h2>Image not found or data missing!</h2><p>Please ensure the URL is correct and the image data is in localStorage('wallpapers').</p>";
         // Hide preview images if the main image isn't found
         if (prevImageElement) prevImageElement.style.display = 'none';
         if (nextImageElement) nextImageElement.style.display = 'none';
    }


    // --- Swipe Navigation Logic (Event Listeners) ---
    // These event listeners are attached to the whole document for swiping anywhere
    document.addEventListener("touchstart", (event) => {
        // ✅ Ignore touch events on specific interactive buttons or elements
        if (event.target.closest("button") || event.target.closest("a") || event.target.closest("input")) {
             return;
        }
         // ✅ Also ignore if the target is one of the preview thumbnail images
         // This prevents tapping thumbnails from interfering with main swipe
         if (event.target === prevImageElement || event.target === nextImageElement) {
             return;
         }


        touchStartX = event.touches[0].clientX;
        touchEndX = 0; // Reset touchEndX on touch start
    });

    document.addEventListener("touchmove", (event) => {
         // Only track move if touch started on a valid area (touchStartX !== 0)
        if (touchStartX === 0) return;
        touchEndX = event.touches[0].clientX;
    });

    document.addEventListener("touchend", () => {
         // Only process swipe if a touch started (touchStartX !== 0) and moved (touchEndX !== 0)
        if (touchStartX === 0 || touchEndX === 0) return;

        let swipeDistance = touchEndX - touchStartX;

        // Process swipe only if the distance exceeds the threshold
        if (swipeDistance > swipeThreshold) {
             // Swiped right (show previous image)
            showImage(currentIndex - 1);
        } else if (swipeDistance < -swipeThreshold) {
             // Swiped left (show next image)
            showImage(currentIndex + 1);
        }

        // Reset touch points after swipe attempt
        touchStartX = 0;
        touchEndX = 0;
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

    });

    
