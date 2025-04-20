
    // --- Variables ---
    // Variable to store the array of images (assuming loaded from localStorage)
    // This array is used for swipe and preview navigation.
    // Ensure localStorage('wallpapers') contains an array of image objects
    // with at least a 'src' property (and 'name', 'description' if used).
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
    // Handles wrap-around navigation.
    function showImage(index) {
        // Ensure elements were found in the DOM
         if (!previewImage || !imageTitleElement || !imageDescElement || !downloadBtnElement || !bgElement || !prevImageElement || !nextImageElement) {
             console.error("One or more required elements not found in the DOM.");
             // Optionally display an error message to the user
             document.body.innerHTML = "<h2>Error loading page! Required elements are missing.</h2>";
             return; // Stop execution if essential elements are missing
         }


        // Ensure the images array is populated
        if (images.length === 0) {
             console.warn("No images available to display for navigation.");
             // Handle UI for no images case if needed after initial load fails
             return; // Cannot navigate if no images are loaded
        }

        // Calculate the new index with wrap-around logic
        // Ensures index stays within bounds [0, images.length - 1]
        const newIndex = (index % images.length + images.length) % images.length;
        const nextImage = images[newIndex]; // The image object to display

        // If the requested image is the same as the current one, do nothing except maybe update previews
        if (currentIndex === newIndex) {
            // console.log("Attempted to show the same image, updating previews.");
            // Just ensure previews are correct in case something was off (though showImage should handle this)
             if (images.length > 1) {
                 const prevIndex = (currentIndex - 1 + images.length) % images.length;
                 const nextIndex = (currentIndex + 1) % images.length;
                 if (prevImageElement) prevImageElement.src = images[prevIndex].src;
                 if (nextImageElement) nextImageElement.src = images[nextIndex].src;
            }
            return; // Stop further execution if the image is not changing
        }


        // --- Update the Main Image and Details ---
        // Set opacity to 0 BEFORE changing src if you want a fade effect
        // Note: If implementing fade transition, this part needs modification
        previewImage.src = nextImage.src;
        imageTitleElement.innerText = nextImage.name || "Unknown Title"; // Use || for fallback
        imageDescElement.innerText = nextImage.description || "No description available."; // Use || for fallback
        downloadBtnElement.href = nextImage.src; // Update download link
        bgElement.src = nextImage.src; // Assuming you want the background image to also update

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

        // --- Optional: Update Like Button Status and URL in Address Bar ---
        // updateLikeButton(nextImage.src); // Uncomment if you have this function

         // Update the URL in the address bar (optional, but good for sharing/bookmarking)
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
    // Needs to be defined outside DOMContentLoaded if called from event listeners outside.
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
     // Needs to be defined outside DOMContentLoaded if called from event listeners outside.
    function shareContent() {
        // Use the URL of the currently displayed image or the current page URL
        const urlToShare = window.location.href; // Shares the URL of the preview page
        // Or use the direct image URL if you prefer: const urlToShare = previewImage ? previewImage.src : null;

        // Get current title and description for sharing
        const currentTitle = imageTitleElement ? imageTitleElement.innerText : "Check this out!";
        const currentDesc = imageDescElement ? `"${imageDescElement.innerText}" - Check out this wallpaper!` : "I found this amazing wallpaper!";


        if (navigator.share) {
            navigator.share({
                title: currentTitle,
                text: currentDesc,
                url: urlToShare
            })
            .then(() => console.log("Shared successfully!"))
            .catch((error) => {
                 console.log("Error sharing:", error);
                 // User might have cancelled, no need for alert unless it's a real error
            });
        } else {
            alert("Sharing is not supported on this browser.");
        }
        // Optional: Trigger GA event for share
         if (typeof gtag === 'function') {
             gtag("event", "share_wallpaper", { image: previewImage ? previewImage.src : 'unknown' });
         }
    }

    // --- Your Existing loadSavedImages Function (Likely for a different page, but included here for completeness) ---
     // Needs to be defined outside DOMContentLoaded if called from event listeners outside.
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
     // Needs to be defined outside DOMContentLoaded if called from event listeners outside.
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
    // All code that needs to run after the page structure is loaded goes here.
    document.addEventListener("DOMContentLoaded", function () {

        // --- Get URL Parameters ---
        const urlParams = new URLSearchParams(window.location.search);
        const imageUrl = urlParams.get("image"); // The URL of the image to initially display

        // --- Find Starting Image Index ---
        // Find the index of the initially loaded image based on the URL parameter
        // Decode the URL parameter to match the src stored in localStorage
        const decodedImageUrl = decodeURIComponent(imageUrl);

        // Use findIndex to get the position of the image in the 'images' array loaded from localStorage
        let startingIndex = images.findIndex(img => img.src === decodedImageUrl);


        // --- Check for Missing Elements ---
        // Ensure all necessary HTML elements are found before proceeding
        if (!previewImage || !imageTitleElement || !imageDescElement || !downloadBtnElement || !bgElement || !prevImageElement || !nextImageElement) {
             console.error("One or more required preview page elements not found in the DOM.");
             document.body.innerHTML = "<h2>Error loading page! Some required elements are missing.</h2>";
             return; // Stop script execution if essential elements are missing
        }


        // --- Initial Page Load Logic ---
        if (imageUrl && startingIndex !== -1) { // Ensure image URL is present in the URL and found in the images array

            // Call showImage to display the initial image and set up previews.
            // The showImage function handles setting currentIndex.
            showImage(startingIndex);

            // ✅ Call swipe guide function if it exists
            if (typeof showSwipeGuideOnce === 'function') {
                showSwipeGuideOnce();
            }

        } else {
            // --- Handle Image Not Found or Data Missing ---
            console.error("Image URL missing from parameters or not found in localStorage('wallpapers'). URL:", imageUrl, "Starting Index:", startingIndex);
            document.body.innerHTML = "<h2>Image not found or data missing!</h2><p>Please ensure the URL is correct and the image data is in localStorage('wallpapers').</p>";
             // Hide preview images if the main image isn't found
             if (prevImageElement) prevImageElement.style.display = 'none';
             if (nextImageElement) nextImageElement.style.display = 'none';
        }


        // --- Swipe Navigation Logic (Event Listeners) ---
        // These event listeners are attached to the whole document for swiping anywhere
        document.addEventListener("touchstart", (event) => {
            // ✅ Ignore touch events on specific interactive buttons or elements
            // Add more selectors here if needed for other clickable elements
            if (event.target.closest("button") || event.target.closest("a") || event.target.closest("input") || event.target.closest(".no-swipe")) {
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

        // --- Click Listener for Previous/Next Preview Thumbnails ---
        // This allows clicking the small images to navigate directly
        if (prevImageElement) {
            prevImageElement.addEventListener("click", function() {
                // Calculate the index of the previous image
                const prevIndex = (currentIndex - 1 + images.length) % images.length;

                // Call the showImage function to display the previous image
                showImage(prevIndex);
                console.log("Clicked previous preview, showing index:", prevIndex); // Optional log
            });
        }

        if (nextImageElement) {
            nextImageElement.addEventListener("click", function() {
                // Calculate the index of the next image
                const nextIndex = (currentIndex + 1) % images.length;

                // Call the showImage function to display the next image
                showImage(nextIndex);
                console.log("Clicked next preview, showing index:", nextIndex); // Optional log
            });
        }


        // --- Attach Event Listeners for Save and Share Buttons ---
        // Assuming you have buttons with IDs like 'saveButton' and 'shareButton'
        const saveButton = document.getElementById('saveButton');
        if (saveButton) {
             saveButton.addEventListener('click', saveImage); // Ensure saveImage is defined
        }
        const shareButton = document.getElementById('shareButton');
        if (shareButton) {
             shareButton.addEventListener('click', shareContent); // Ensure shareContent is defined
        }

         // You might have a back button too
         const backButton = document.getElementById('backButton'); // Assuming a #backButton
         if(backButton){
             backButton.addEventListener('click', function() {
                 history.back(); // Go back to the previous page (gallery)
             });
         }


    }); // --- End of DOMContentLoaded ---


    // --- Functions Defined Outside DOMContentLoaded (if they need to be globally accessible or called before DOMContentLoaded - less common) ---
    // Based on your snippet, saveImage, shareContent, loadSavedImages, showSwipeGuideOnce were defined outside.
    // Ensure these are indeed defined outside the DOMContentLoaded function block.

    // function saveImage() { ... }
    // function shareContent() { ... }
    // function loadSavedImages() { ... } // If used on this page
    // function showSwipeGuideOnce() { ... } // If used on this page

    // --- Google Analytics Tracking Snippets (If they are not managed by a separate library like gtag.js in the head) ---
    // Place these appropriately if they are not included by a gtag script tag in your head
    // wallpaperDiv.addEventListener("click", function () { gtag("event", "wallpaper_click", { image: item.name }); }); // This belongs in index.html
    // gtag("event", "download_wallpaper", { image: imageUrl }); // Call this when the download button is clicked
    // gtag("event", "page_view", { page_title: "Wallpaper Preview", page_location: window.location.href, page_path: "/preview.html" }); // Called in showImage function now

