// Function to show and hide loaders
function showLoader() {
    const loader = document.getElementById("loader");
    if (loader) {
        loader.style.display = "flex"; // Or 'block', depending on your CSS
    }
    const spinner = document.querySelector(".loader-spinner");
    if (spinner) {
        spinner.style.display = "block"; // Show the spinner too if you use it
    }
}

function hideLoader() {
    const loader = document.getElementById("loader");
    if (loader) {
        loader.style.display = "none";
    }
    const spinner = document.querySelector(".loader-spinner");
    if (spinner) {
        spinner.style.display = "none"; // Hide the spinner
    }
}

// Variable to store the fetched wallpaper data (useful for filtering)
let allWallpapersData = [];
// Variable to store the source of the image currently selected by the popup
let selectedImageSrc = null;
// Timer for long press
let longPressTimeout;


// Fetch & Display JSON Data and set up event listeners ONCE the DOM is ready
document.addEventListener("DOMContentLoaded", function () {
    showLoader(); // Show loader while fetching

    fetch("data.json") // Load JSON file
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            allWallpapersData = data; // Store the fetched data
            renderGallery(allWallpapersData); // Render the initial gallery

            hideLoader(); // Hide loader after gallery is built

        })
        .catch(error => {
            console.error("Error loading images:", error);
            hideLoader(); // Hide loader even on error
            // Optionally display an error message to the user in the UI
        });
});

// Function to render the wallpapers in the gallery
function renderGallery(wallpapersToRender) {
     const jsonGallery = document.getElementById("jsonGallery");
     if (!jsonGallery) {
         console.error("Gallery element #jsonGallery not found!");
         return;
     }

     // Clear existing content while preserving the element
     while (jsonGallery.firstChild) {
         jsonGallery.removeChild(jsonGallery.firstChild);
     }

     wallpapersToRender.forEach(item => {
         let wallpaperDiv = document.createElement("div");
         wallpaperDiv.classList.add("wallpaper");
         // Add data attributes for searching/filtering
         wallpaperDiv.setAttribute("data-name", item.name ? item.name.toLowerCase() : "");
         wallpaperDiv.setAttribute("data-desc", item.description ? item.description.toLowerCase() : "");
         wallpaperDiv.setAttribute("data-keywords", item.keywords ? item.keywords.join(" ").toLowerCase() : "");
         wallpaperDiv.setAttribute("data-color", item.color ? item.color.toLowerCase() : ""); // Assuming your JSON has a color property

         // Create and set up the image element
         const img = document.createElement("img");
         img.src = item.src;
         img.alt = item.name || "Wallpaper";
          // <<< ENSURED LAZY LOADING HERE >>>

         // Append the image to the wallpaper div
         wallpaperDiv.appendChild(img);

         // Add click event for redirection to preview page
         // This is separate from the long-press/context menu for the popup
         wallpaperDiv.addEventListener("click", function () {
             // Only redirect if the popup is not currently visible
             if (popupMenu.style.display !== "block") { // Use the global popupMenu variable
                 let encodedSrc = encodeURIComponent(item.src);
                 let encodedTitle = encodeURIComponent(item.name || "");
                 let encodedDesc = encodeURIComponent(item.description || "");

                 showLoader(); // Show loading animation before redirecting
                 setTimeout(() => {
                     window.location.href = `preview.html?image=${encodedSrc}&title=${encodedTitle}&desc=${encodedDesc}`;
                 }, 500); // Delay for smooth transition
             }
         });

         // Add long press/context menu events to the image
         img.addEventListener("touchstart", handleTouchStart);
         img.addEventListener("touchend", handleTouchEnd);
         img.addEventListener("touchcancel", handleTouchCancel);
         img.addEventListener("contextmenu", handleContextMenu);

         // Disable default browser behaviors for images
         img.addEventListener("contextmenu", (e) => e.preventDefault());
         img.addEventListener("dragstart", (e) => e.preventDefault());

         // Append the wallpaper div to the gallery
         jsonGallery.appendChild(wallpaperDiv);
     });

     // Update save button states if you have save buttons rendered per image
     // updateSavedImages(); // Uncomment and implement if needed per image
}

// --- Event Handlers for Long Press and Context Menu ---
function handleTouchStart(e) {
     // Clear any existing timer to prevent multiple popups
     clearTimeout(longPressTimeout);
     // Set a new timer
     longPressTimeout = setTimeout(() => {
         // More robust way to get image source
         const imageElement = e.target.closest('img');
         const imageSrc = imageElement ? imageElement.src : null;

         if (imageSrc) {
             showPopup(e.touches[0].clientX, e.touches[0].clientY, imageSrc);
         } else {
             console.error("handleTouchStart: Could not get image source from target or parent.");
         }
     }, 500); // 500ms long press duration
 }

 function handleTouchEnd() {
     clearTimeout(longPressTimeout);
 }

 function handleTouchCancel() {
     clearTimeout(longPressTimeout);
 }

 function handleContextMenu(e) {
     e.preventDefault(); // Prevent default context menu
     // More robust way to get image source
     const imageElement = e.target.closest('img');
     const imageSrc = imageElement ? imageElement.src : null;

     if (imageSrc) {
         showPopup(e.clientX, e.clientY, imageSrc);
     } else {
         console.error("handleContextMenu: Could not get image source from target or parent.");
     }
 }


// --- Popup Menu Logic ---
const popupMenu = document.getElementById("popupMenu");
const overlay = document.querySelector(".popup-overlay");
const saveBtn = document.getElementById("saveBtn");
const shareBtn = document.getElementById("shareBtn");

// Add event listeners to popup buttons ONCE when the DOM is ready
if (saveBtn) {
    saveBtn.addEventListener("click", saveImage);
}
if (shareBtn) {
    shareBtn.addEventListener("click", shareImage);
}
// Add event listener to overlay ONCE to close popup
if (overlay) {
    overlay.addEventListener("click", hidePopup);
}


// Function to show the popup menu
function showPopup(x, y, imageSrc) {
     if (!popupMenu || !overlay) {
         console.error("Popup elements not found!");
         return;
     }

     // Ensure imageSrc is valid before showing popup and setting the global variable
     if (!imageSrc || typeof imageSrc !== 'string') {
         console.error("showPopup called with invalid or empty imageSrc:", imageSrc);
         // Optionally alert the user or provide feedback
         // alert("Could not get image source for popup.");
         return; // Do not proceed if image source is invalid
     }

     // Store the selected image source in the global variable
     selectedImageSrc = imageSrc;

     // Position the popup
     // Basic positioning - consider viewport edge cases for better UX
     popupMenu.style.left = `${x}px`;
     // Add scroll position to y coordinate
     popupMenu.style.top = `${y + window.scrollY}px`;

     // Display the popup and overlay
     popupMenu.style.display = "block";
     overlay.style.display = "block";
 }

// Function to hide the popup menu
function hidePopup() {
    if (popupMenu) {
        popupMenu.style.display = "none";
    }
    if (overlay) {
        overlay.style.display = "none";
    }
    // Clear the selected image source when the popup is hidden
    selectedImageSrc = null;
}


// --- Save and Share Functionality ---
function saveImage() {
     // Check selectedImageSrc directly here - it should have been set by showPopup
     if (selectedImageSrc) {
         try {
             let savedImages = JSON.parse(localStorage.getItem("savedImages")) || [];

             if (!savedImages.includes(selectedImageSrc)) {
                 savedImages.push(selectedImageSrc);
                 localStorage.setItem("savedImages", JSON.stringify(savedImages));
                 alert("Image saved successfully!");
             } else {
                 alert("This image is already saved!");
             }
             hidePopup(); // Hide popup after action
         } catch (e) {
             console.error("Error saving image to localStorage:", e);
             alert("Could not save image. Local storage might be full or disabled.");
             hidePopup(); // Still hide popup on error
         }
     } else {
         // This alert indicates showPopup was likely not called with a valid source
         console.error("Save button clicked but selectedImageSrc is null.");
         alert("Could not get image source to save.");
         hidePopup(); // Still hide popup
     }
 }

 function shareImage() {
     // Check selectedImageSrc directly here
     if (selectedImageSrc) {
         if (navigator.share) {
             navigator.share({
                 title: "Check out this wallpaper",
                 url: selectedImageSrc
             }).catch((error) => {
                 console.error("Error sharing:", error);
                 alert("Error sharing the image.");
             });
         } else {
             alert("Share feature not supported on this device.");
             // Fallback: You could implement a copy-to-clipboard feature here
         }
         hidePopup(); // Hide popup after action
     } else {
          console.error("Share button clicked but selectedImageSrc is null.");
         alert("Could not get image source to share.");
         hidePopup(); // Still hide popup
     }
 }

// Function to update the "Saved" status on buttons (less relevant for a single popup)
// Remove or adapt if you don't have individual save buttons per image
// function updateSavedImages() {
//      let savedImages = JSON.parse(localStorage.getItem("savedImages")) || [];
//      // ... logic to update buttons ...
// }
// window.addEventListener("DOMContentLoaded", updateSavedImages); // Call if needed


// --- Filtering and Searching ---

// ✅ Search Function with Keyword Filtering
function searchWallpapers() {
    let input = document.getElementById('searchBar').value.toLowerCase();
    // Filter the original data based on the search input
    const filteredWallpapers = allWallpapersData.filter(item => {
        const name = item.name ? item.name.toLowerCase() : "";
        const desc = item.description ? item.description.toLowerCase() : "";
        const keywords = item.keywords ? item.keywords.join(" ").toLowerCase() : "";
        const color = item.color ? item.color.toLowerCase() : "";

        return name.includes(input) || desc.includes(input) || keywords.includes(input) || color.includes(input);
    });

    renderGallery(filteredWallpapers); // Render the filtered results
}

// ✅ Search by Category (Clicking a Tag) - uses the main search function
function searchByCategory(category) {
    document.getElementById('searchBar').value = category;
    searchWallpapers(); // Trigger the main search
}

// ✅ Trigger search function on input change
document.getElementById('searchBar').addEventListener('input', searchWallpapers);


// --- Color Dropdown Menu Logic ---
const colorPicker = document.getElementById("colorPicker");
const colorDropdown = document.getElementById("colorDropdown");
const colorOptions = document.querySelectorAll(".color-option");

// Toggle dropdown on click
if (colorPicker && colorDropdown) {
    colorPicker.addEventListener("click", (event) => {
        event.stopPropagation(); // Prevent clicks from closing immediately
        colorDropdown.classList.toggle("show-dropdown");
    });
}

// Close dropdown when clicking outside
document.addEventListener("click", (event) => {
    if (colorDropdown && !colorDropdown.contains(event.target) && event.target !== colorPicker) {
        colorDropdown.classList.remove("show-dropdown");
    }
});

// Handle color selection - Integrates with searchWallpapers
if (colorOptions) {
    colorOptions.forEach(option => {
        option.addEventListener("click", () => {
            let selectedColor = option.getAttribute("data-color");

            if (selectedColor && selectedColor !== 'gray') { // Assuming 'gray' is your clear filter option
                 // Set color circle background (optional, but good feedback)
                 const optionColor = option.style.backgroundColor || selectedColor; // Use computed style if available
                 colorPicker.style.backgroundColor = optionColor;
                 document.getElementById('searchBar').value = selectedColor; // Put color in search bar
                 searchWallpapers(); // Trigger search based on color keyword
            } else {
                // Handle 'gray' or clear filter
                 colorPicker.style.backgroundColor = "grey"; // Reset color circle
                 document.getElementById('searchBar').value = ''; // Clear search bar
                 searchWallpapers(); // Show all wallpapers
            }

            colorDropdown.classList.remove("show-dropdown"); // Close dropdown
        });
    });
}

// --- Other Functionality ---

// ✅ Enable horizontal scrolling with mouse wheel for the gallery container
const galleryScrollContainer = document.getElementById("gallery");
if (galleryScrollContainer) {
    galleryScrollContainer.addEventListener("wheel", (evt) => {
         // Adjust threshold as needed to differentiate between vertical and horizontal scrolling intentions
         if (Math.abs(evt.deltaY) > Math.abs(evt.deltaX) && Math.abs(evt.deltaY) > 10) {
             evt.preventDefault();
             galleryScrollContainer.scrollLeft += evt.deltaY; // Assuming vertical wheel maps to horizontal scroll
         }
    });
}


// Search button scrolls to search bar and focuses
document.querySelector(".srcs").addEventListener("click", function () {
    let searchBar = document.querySelector(".searchBar");
    if (searchBar) {
        searchBar.scrollIntoView({ behavior: "smooth" });
        searchBar.focus();
    }
});

// Initial Google Analytics tracking (already present)
// gtag("event", "page_view", {
//     page_title: "WallSort",
//     page_location: window.location.href,
//     page_path: "/index.html"
// });
// Inside your existing function searchWallpapers() { ... }

let input = document.getElementById('searchBar').value.toLowerCase();

// --- Add this line to save the search term ---
localStorage.setItem('lastSearchTerm', input);
console.log("Saved search term to localStorage:", input);
// --------------------------------------------

// ... (rest of your searchWallpapers function, filtering and calling renderGallery)
