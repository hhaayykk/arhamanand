let fileCache = null; // Cache for storing fetched files

// Custom Modal Functions (Design-focused additions)
let confirmCallback = null;

function createModal() {
    const modal = document.createElement('div');
    modal.id = 'customModal';
    modal.setAttribute('aria-hidden', 'true');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 1100;
        backdrop-filter: blur(8px);
        animation: fadeInModal 0.4s ease-out;
    `;
    modal.innerHTML = `
        <div style="
            background: linear-gradient(135deg, rgba(20, 20, 30, 0.98), rgba(30, 30, 45, 0.98));
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6), inset 0 0 15px rgba(81, 99, 255, 0.1);
            width: 90%;
            max-width: 500px;
            border: 1px solid rgba(81, 99, 255, 0.2);
            position: relative;
            display: flex;
            flex-direction: column;
            gap: 20px;
        ">
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            ">
                <h3 id="modalTitle" style="
                    margin: 0;
                    font-size: 22px;
                    font-weight: 700;
                    color: #fff;
                    background: linear-gradient(90deg, #5163ff, #8e2de2);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                ">
                    <i class="fas fa-info-circle" style="margin-right: 10px;"></i> Notification
                </h3>
                <button id="modalCloseBtn" style="
                    background: linear-gradient(135deg, #ff4444, #ff6f61);
                    border: none;
                    color: #fff;
                    font-size: 20px;
                    cursor: pointer;
                    padding: 8px 12px;
                    border-radius: 50%;
                    transition: all 0.3s ease;
                    box-shadow: 0 5px 15px rgba(255, 111, 97, 0.4);
                    position: relative;
                    overflow: hidden;
                ">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div style="
                text-align: center;
                padding: 15px;
            ">
                <p id="modalMessage" style="
                    margin: 0;
                    font-size: 16px;
                    color: #e0e0e0;
                    line-height: 1.5;
                ">Message goes here</p>
            </div>
            <div style="
                display: flex;
                justify-content: flex-end;
                gap: 10px;
                padding-top: 15px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            ">
                <button id="modalCancel" style="
                    padding: 10px 20px;
                    border: none;
                    border-radius: 8px;
                    color: #fff;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    background: linear-gradient(135deg, #ff4444, #ff6f61);
                    box-shadow: 0 3px 10px rgba(255, 111, 97, 0.4);
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                    display: none;
                ">Cancel</button>
                <button id="modalConfirm" style="
                    padding: 10px 20px;
                    border: none;
                    border-radius: 8px;
                    color: #fff;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    background: linear-gradient(135deg, #34c759, #28a745);
                    box-shadow: 0 3px 10px rgba(52, 199, 89, 0.4);
                    transition: all 0.3s ease;
                    position: relative;
                    overflow: hidden;
                ">Confirm</button>
            </div>
        </div>
        <style>
            @keyframes fadeInModal {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            #customModal[aria-hidden="true"] {
                display: none;
            }
            #customModal[aria-hidden="false"] {
                display: flex;
            }
            #modalCloseBtn:hover {
                background: linear-gradient(135deg, #ff6f61, #ff4444);
                transform: scale(1.1) rotate(90deg);
                box-shadow: 0 8px 20px rgba(255, 111, 97, 0.6);
            }
            #modalCloseBtn::after,
            #modalConfirm::after,
            #modalCancel::after {
                content: '';
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                transition: width 0.6s ease, height 0.6s ease;
            }
            #modalCloseBtn:hover::after,
            #modalConfirm:hover::after,
            #modalCancel:hover::after {
                width: 200%;
                height: 200%;
            }
            #modalConfirm:hover,
            #modalCancel:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(81, 99, 255, 0.5);
            }
        </style>
    `;
    document.body.appendChild(modal);

    // Event listeners for modal buttons
    modal.querySelector('#modalCloseBtn').addEventListener('click', closeModal);
    modal.querySelector('#modalConfirm').addEventListener('click', confirmModalAction);
    modal.querySelector('#modalCancel').addEventListener('click', closeModal);

    // Keyboard navigation for accessibility
    modal.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeModal();
        } else if (e.key === 'Enter' && modal.querySelector('#modalConfirm').style.display !== 'none') {
            confirmModalAction();
        }
    });

    return modal;
}
document.getElementById('addCategoryBtn').addEventListener('click', () => {
    showModal('Enter new category name:', 'prompt', async (newCategory) => {
        if (!newCategory || !newCategory.trim()) {
            showModal('Category name cannot be empty.');
            return;
        }
        try {
            const response = await fetch('https://api.arhamanand.com:3003/add-category', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category: newCategory.trim() })
            });
            if (response.ok) {
                showModal('Category added successfully!', 'success');
                addCategoryToList(newCategory.trim());
            } else {
                const msg = await response.text();
                showModal('Error adding category: ' + msg);
            }
        } catch (err) {
            showModal('Server error: ' + err.message);
        }
    });
});
async function loadCustomCategories() {
    try {
        const response = await fetch('https://api.arhamanand.com:3003/categories');
        const categories = await response.json();
        categories.forEach(addCategoryToList);
    } catch (err) {
        console.error('Failed to load custom categories:', err);
    }
}
function showModal(message, type = 'alert', callback = null) {
    let modal = document.getElementById('customModal');
    if (!modal) {
        modal = createModal();
    }

    const modalTitle = modal.querySelector('#modalTitle');
    const modalMessage = modal.querySelector('#modalMessage');
    const modalCancel = modal.querySelector('#modalCancel');
    const modalConfirm = modal.querySelector('#modalConfirm');

    modalMessage.innerHTML = ''; // clear

    if (type === 'prompt') {
        modalTitle.innerHTML = '<i class="fas fa-plus-circle" style="margin-right: 10px;"></i> Add Category';
        modalCancel.style.display = 'inline-flex';
        modalConfirm.style.display = 'inline-flex';
        modalConfirm.textContent = 'Save';
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = 'Enter new category name';
        input.style = 'width:100%;padding:8px;border-radius:6px;border:1px solid #ccc;margin-top:10px;';
        modalMessage.appendChild(input);
        input.focus();
        confirmCallback = () => callback(input.value);
    } else if (type === 'confirm') {
        modalTitle.innerHTML = '<i class="fas fa-question-circle" style="margin-right: 10px;"></i> Confirm';
        modalMessage.textContent = message;
        modalCancel.style.display = 'inline-flex';
        modalConfirm.style.display = 'inline-flex';
        modalConfirm.textContent = 'Confirm';
        confirmCallback = callback;
    } else if (type === 'success') {
        modalTitle.innerHTML = '<i class="fas fa-check-circle" style="margin-right: 10px;"></i> Success';
        modalMessage.textContent = message;
        modalCancel.style.display = 'none';
        modalConfirm.style.display = 'inline-flex';
        modalConfirm.textContent = 'OK';
        confirmCallback = closeModal;
    } else {
        modalTitle.innerHTML = '<i class="fas fa-info-circle" style="margin-right: 10px;"></i> Notification';
        modalMessage.textContent = message;
        modalCancel.style.display = 'none';
        modalConfirm.style.display = 'inline-flex';
        modalConfirm.textContent = 'OK';
        confirmCallback = closeModal;
    }

    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
    modal.focus();
}
function showAddCategoryDialog() {
    showModal("Enter new category name:", 'confirm', () => {
        const newCategory = prompt("Enter new category name:").trim();
        if (newCategory) {
            addNewCategory(newCategory);
        } else {
            showModal("Category name cannot be empty.");
        }
    });
}
function addNewCategory(categoryName) {
    const categoryNav = document.getElementById('categoryNav');

    // Check if category already exists
    const exists = Array.from(categoryNav.children).some(li => 
        li.getAttribute('data-category').toLowerCase() === categoryName.toLowerCase()
    );
    if (exists) {
        showModal("Category already exists!");
        return;
    }

    const li = document.createElement('li');
    li.setAttribute('data-category', categoryName);
    li.innerHTML = `<i class="fas fa-folder-open"></i><span>${categoryName}</span>`;

    li.addEventListener('click', function() {
        document.querySelector('#categoryNav li.active')?.classList.remove('active');
        li.classList.add('active');
        document.getElementById('currentCategory').textContent = categoryName;

        const brand = document.querySelector('#brandNav li.active')?.getAttribute('data-brand') || "Cricpayz";
        loadFiles(brand, categoryName);
    });

    categoryNav.appendChild(li);
    showModal(`Category "${categoryName}" added!`, 'success');
}

function closeModal() {
    const modal = document.getElementById('customModal');
    if (modal) {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        confirmCallback = null;
    }
}

function confirmModalAction() {
    if (confirmCallback) {
        confirmCallback();
    }
    closeModal();
}

// Modified login function to use the /login endpoint
async function login(event) {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch('https://api.arhamanand.com:3003/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();
        if (result.success) {
            sessionStorage.setItem("loggedIn", "true");
            sessionStorage.setItem("username", username);
            sessionStorage.setItem("role", result.role);

            document.querySelector(".login").style.display = "none";
            document.getElementById("dashboard").style.display = "block";
            loadFiles("Cricpayz", "Banners");
        } else {
            showModal("Invalid login credentials!");
        }
    } catch (error) {
        showModal("Error logging in: " + error.message);
    }
}
async function uploadFile() {
    const fileInput = document.getElementById("fileInput");
    const uploadLabelSpan = document.querySelector('.file-input-label span:not(.file-name)');
    const uploadBtn = document.querySelector('.upload-btn');
    const originalLabelText = "Upload (Don't add duplicates !)";
    const files = fileInput.files;
    const uploader = document.getElementById("uploaderName").value.trim();

    if (!uploader) {
        showModal("Please enter your name before uploading.");
        return;
    }

    if (files.length === 0) {
        showModal("Please select a file to upload.");
        return;
    }

    uploadBtn.disabled = true;
    uploadBtn.classList.add('loading');
    uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    uploadLabelSpan.textContent = 'Uploading...';

    const brand = document.getElementById("currentBrand").textContent.trim();
    const category = document.getElementById("currentCategory").textContent.trim();
    const formData = new FormData();
    formData.append("uploaderName", uploader);
    formData.append("brand", brand);
    formData.append("category", category);
    for (let file of files) {
        formData.append("files", file);
    }

    try {
        const response = await fetch("https://api.arhamanand.com:3003/upload", {
            method: "POST",
            body: formData,
        });
        if (response.ok) {
            showModal("File uploaded successfully!", 'success');
            fileCache = null;
            listFiles();
            fileInput.value = '';
            uploadLabelSpan.textContent = originalLabelText;
        } else {
            showModal("Error uploading file.");
        }
    } catch (error) {
        console.error("Upload error:", error);
        showModal("Error uploading file: " + error.message);
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.classList.remove('loading');
        uploadBtn.innerHTML = '<i class="fas fa-upload"></i>';
        uploadLabelSpan.textContent = originalLabelText;
    }
}

// async function deleteFile(fileKey, brand, category) {
//     showModal("Are you sure you want to delete this file?", 'confirm', async () => {
//         try {
//             const response = await fetch("https://api.arhamanand.com:3003/delete-file", {
//                 method: "DELETE",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify({ fileKey, brand, category }),
//             });
//             if (response.ok) {
//                 showModal("File deleted successfully!", 'success');
//                 fileCache = null;
//                 listFiles();
//             } else {
//                 throw new Error("Failed to delete file");
//             }
//         } catch (error) {
//             console.error("Delete error:", error);
//             showModal("Error deleting file: " + error.message);
//         }
//     });
// }

async function deleteFile(fileKey, brand, category) {
    showModal("Are you sure you want to delete this file?", 'confirm', async () => {
        try {
            const username = sessionStorage.getItem("username");
            const response = await fetch("https://api.arhamanand.com:3003/delete-file", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileKey, username }),
            });
            if (response.ok) {
                showModal("File deleted successfully!", 'success');
                fileCache = null;
                listFiles();
            } else {
                const msg = await response.text();
                showModal("Error deleting file: " + msg);
            }
        } catch (error) {
            console.error("Delete error:", error);
            showModal("Error deleting file: " + error.message);
        }
    });
}
function addCategoryToList(category) {
    const categoryNav = document.getElementById('categoryNav');
    const li = document.createElement('li'); 
    li.setAttribute('data-category', category);
    li.innerHTML = `<i class="fas fa-folder-open"></i><span>${category}</span>`;
    li.addEventListener('click', function () {
        const brand = document.querySelector('#brandNav li.active')?.getAttribute('data-brand') || "Cricpayz";
        document.querySelector('#categoryNav li.active')?.classList.remove('active');
        this.classList.add('active');
        document.getElementById('currentCategory').textContent = category;
        loadFiles(brand, category);
    });
    categoryNav.appendChild(li);
}

document.addEventListener('DOMContentLoaded', function () {
    checkLoginStatus();
    setupNavigation();
    listFiles();
    loadCustomCategories(); 
    document.querySelector('.search-btn').addEventListener('click', showSearchDialog);

    // Add event listener for file input to display selected file names
    const fileInput = document.getElementById('fileInput');
    const uploadLabelSpan = document.querySelector('.file-input-label span:not(.file-name)');
    const originalLabelText = uploadLabelSpan.textContent; // Store original text

    fileInput.addEventListener('change', function () {
        if (fileInput.files.length > 0) {
            // Get the names of all selected files
            const fileNames = Array.from(fileInput.files).map(file => file.name).join(', ');
            uploadLabelSpan.textContent = fileNames; // Update label with file names
        } else {
            uploadLabelSpan.textContent = originalLabelText; // Revert to original text
        }
    });
});

function getFilePreview(fileUrl, fileName) {
    const fileExtension = fileName.split('.').pop().toLowerCase();
    console.log(fileExtension, "file extension");
    const fileTypes = {
        'jpg': 'image', 'jpeg': 'image', 'png': 'image', 'gif': 'gif', 'webp': 'image', 'svg': 'image',
        'pdf': 'pdf',
        'txt': 'text', 'json': 'text', 'csv': 'excel',
        'doc': 'word', 'docx': 'word',
        'xls': 'excel', 'xlsx': 'excel',
        'ppt': 'powerpoint', 'pptx': 'powerpoint',
        'zip': 'archive', 'rar': 'archive', '7z': 'archive', 'tar': 'archive',
        'mp4': 'video', 'avi': 'video', 'mov': 'video', 'wmv': 'video', 'mkv': 'video',
        'mp3': 'audio', 'wav': 'audio', 'flac': 'audio',
        'psd': 'design', 'ai': 'design', 'eps': 'design',
        'html': 'code', 'css': 'code', 'js': 'code', 'php': 'code', 'java': 'code', 'py': 'code', 'cpp': 'code', 'cs': 'code'
    };

    const fileIcons = {
        'image': 'far fa-file-image',
        'pdf': 'far fa-file-pdf',
        'text': 'far fa-file-alt',
        'word': 'far fa-file-word',
        'excel': 'far fa-file-excel',
        'powerpoint': 'far fa-file-powerpoint',
        'archive': 'far fa-file-archive',
        'video': 'far fa-file-video',
        'audio': 'far fa-file-audio',
        'design': 'fas fa-paint-brush',
        'code': 'far fa-file-code',
        'gif': 'far fa-file-image',
        'unknown': 'far fa-file'
    };

    const fileColors = {
        'image': '#2ecc71',
        'pdf': '#e74c3c',
        'text': '#95a5a6',
        'word': '#3498db',
        'excel': '#27ae60',
        'powerpoint': '#e67e22',
        'archive': '#9b59b6',
        'video': '#fd79a8',
        'audio': '#8e44ad',
        'design': '#f39c12',
        'code': '#34495e',
        'gif': '#f39c12',
        'unknown': '#7f8c8d'
    };

    const type = fileTypes[fileExtension] || 'unknown';
    const iconClass = fileIcons[type];
    const color = fileColors[type];

    // File types that can be previewed as images
    if (['jpg', 'jpeg', 'png', 'webp', 'svg'].includes(fileExtension)) {
        return `<div class="file-preview image-preview">
                    <img src="${fileUrl}" alt="Preview" class="file-preview-img">
                </div>`;
    } else if (fileExtension === 'gif') {
        return `<div class="file-preview image-preview">
                    <img src="${fileUrl}" alt="GIF Preview" class="file-preview-img">
                </div>`;
    } else {
        // Apply larger font-size for non-previewable files directly in the style
        return `<div class="file-preview" style="color: ${color};">
                    <i class="${iconClass} file-icon" style="color: ${color}; font-size: 70px;"></i>
                    <span class="file-type">${fileExtension.toUpperCase()}</span>
                </div>`;
    }
}

function logout() {
    sessionStorage.removeItem("loggedIn");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("role");
    fileCache = null; // Clear cache on logout

    const loginElement = document.querySelector(".login");
    const dashboardElement = document.getElementById("dashboard");

    if (loginElement) loginElement.style.display = "flex";
    if (dashboardElement) dashboardElement.style.display = "none";

    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    if (usernameInput) usernameInput.value = "";
    if (passwordInput) passwordInput.value = "";
}

function checkLoginStatus() {
    const isLoggedIn = sessionStorage.getItem("loggedIn");
    if (isLoggedIn === "true") {
        document.querySelector(".login").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
    } else {
        document.querySelector(".login").style.display = "flex";
        document.getElementById("dashboard").style.display = "none";
    }
}

function setupNavigation() {
    const brandItems = document.querySelectorAll('#brandNav li');
    brandItems.forEach(item => {
        item.addEventListener('click', function () {
            const brand = this.getAttribute('data-brand');
            const category = document.querySelector('#categoryNav li.active')?.getAttribute('data-category') || "Banners";
            document.querySelector('#brandNav li.active')?.classList.remove('active');
            this.classList.add('active');
            document.getElementById('currentBrand').textContent = brand;
            loadFiles(brand, category);
        });
    });

    const categoryItems = document.querySelectorAll('#categoryNav li');
    categoryItems.forEach(item => {
        item.addEventListener('click', function () {
            const category = this.getAttribute('data-category');
            const brand = document.querySelector('#brandNav li.active')?.getAttribute('data-brand') || "Cricpayz";
            document.querySelector('#categoryNav li.active')?.classList.remove('active');
            this.classList.add('active');
            document.getElementById('currentCategory').textContent = category;
            loadFiles(brand, category);
        });
    });
}

async function listFiles() {
    const brand = document.getElementById("currentBrand").textContent.trim();
    const category = document.getElementById("currentCategory").textContent.trim();
    const fileGallery = document.getElementById("fileGallery");
    const userRole = sessionStorage.getItem("role") || "standard";
    
    fileGallery.innerHTML = "<p>Loading files...</p>";
    try {
        const response = await fetch(`https://api.arhamanand.com:3003/list-files?brand=${encodeURIComponent(brand)}&category=${encodeURIComponent(category)}`);
        if (!response.ok) throw new Error(`Failed to fetch files: ${response.statusText}`);
        
        const files = await response.json();
        fileGallery.innerHTML = "";
        
        if (!Array.isArray(files) || files.length === 0) {
            fileGallery.innerHTML = `<p>No files uploaded yet for ${brand} - ${category}</p>`;
            return;
        }
        
        files.forEach(file => {
            const fileKey = file.key;
            const fileName = file.fileName;
            const fileUrl = file.url;
            const uploader = file.uploader || "Unknown";

            const card = document.createElement("div");
            card.className = "file-card";
            
            const previewDiv = document.createElement("div");
            previewDiv.className = "file-preview";
            previewDiv.innerHTML = getFilePreview(fileUrl, fileName);
            previewDiv.addEventListener('click', (e) => {
                if (e.target.closest('.file-actions')) return;
                viewFile(fileKey);
            });
            
            const infoDiv = document.createElement("div");
            infoDiv.className = "file-info";
            infoDiv.innerHTML = `
                <h4 title="${fileName}">${fileName}</h4>
                <p class="uploader">Uploaded by: <strong>${uploader}</strong></p>
            `;
            
            const actionsDiv = document.createElement("div");
            actionsDiv.className = "file-actions";
            
            const downloadButton = document.createElement("button");
            downloadButton.classList.add("download-btn");
            downloadButton.innerHTML = '<i class="fas fa-download"></i>';
            downloadButton.setAttribute('aria-label', 'Open file');
            downloadButton.addEventListener('click', (e) => {
                e.stopPropagation();
                viewFile(fileKey);
            });
            
            actionsDiv.appendChild(downloadButton);

            // Only add delete button for admin users
            if (userRole === "admin") {
                const deleteButton = document.createElement("button");
                deleteButton.classList.add("delete-btn");
                deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
                deleteButton.setAttribute('aria-label', 'Delete file');
                deleteButton.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteFile(fileKey, brand, category);
                });
                actionsDiv.appendChild(deleteButton);
            }
            
            card.appendChild(previewDiv);
            card.appendChild(infoDiv);
            card.appendChild(actionsDiv);
            
            fileGallery.appendChild(card);
        });
    } catch (error) {
        console.error("Error fetching files:", error);
        fileGallery.innerHTML = `<p>Error loading files: ${error.message}</p>`;
    }
}

function loadFiles(brand, category) {
    listFiles();
}

function showSearchDialog() {
    let searchModal = document.getElementById('searchModal');
    
    if (!searchModal) {
        searchModal = document.createElement('div');
        searchModal.id = 'searchModal';
        searchModal.className = 'search-modal';
        
        searchModal.innerHTML = `
            <div class="search-container">
                <div class="search-header">
                    <h3><i class="fas fa-search"></i> Search Files</h3>
                    <button class="close-search-btn"><i class="fas fa-times"></i></button>
                </div>
                <div class="search-form">
                    <input type="text" id="searchInput" placeholder="Search for files..." />
                    <button id="performSearch" class="search-submit-btn"><i class="fas fa-search"></i> Search</button>
                </div>
                <div class="search-results" id="searchResults">
                    <p class="search-prompt">Enter search terms above to find files</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(searchModal);
        
        document.querySelector('.close-search-btn').addEventListener('click', function() {
            searchModal.style.display = 'none';
        });
        
        document.getElementById('performSearch').addEventListener('click', function() {
            performSearch();
        });
        
        document.getElementById('searchInput').addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
    
    document.getElementById('searchInput').value = '';
    document.getElementById('searchResults').innerHTML = '<p class="search-prompt">Enter search terms above to find files</p>';
    searchModal.style.display = 'flex';
    document.getElementById('searchInput').focus();
}

async function performSearch() {
    const searchInput = document.getElementById("searchInput").value.trim().toLowerCase();
    const searchResultsContainer = document.getElementById("searchResults");
    const userRole = sessionStorage.getItem("role") || "standard";
    
    if (!searchInput) {
        searchResultsContainer.innerHTML = '<p class="search-prompt">Please enter a search term</p>';
        return;
    }
    
    searchResultsContainer.innerHTML = '<p class="search-loading"><i class="fas fa-spinner fa-spin"></i> Searching...</p>';
    
    try {
        const startTime = performance.now();
        const files = await getAllFiles();
        const endTime = performance.now();
        console.log(`getAllFiles took ${(endTime - startTime) / 1000} seconds`);
        console.log("Total files fetched:", files.length, files);
        const results = files.filter(file => 
            file.fileName.toLowerCase().includes(searchInput)
        );
        console.log("Search results for term '" + searchInput + "':", results.length, results);
        displaySearchResults(results);
    } catch (error) {
        console.error("Search error:", error);
        searchResultsContainer.innerHTML = `<p class="search-error"><i class="fas fa-exclamation-circle"></i> Error performing search: ${error.message}</p>`;
    }
}

async function getAllFiles() {
    if (fileCache) {
        console.log("Returning cached files:", fileCache.length);
        return fileCache;
    }

    const brands = ["Cricpayz", "Cryptozpay", "Igpay", "Cricwin", "9sec.io", "Proptrading.live", "Affwl", "Loteri.io", "Treddo","Forexbrokers.live", "Generic"];
    const categories = ["Banners", "Mailers", "Logos", "Emails", "Files", "SMS", "Links", "Generic","Infographics"];
    let allFiles = [];
    
    console.log("Fetching files for all brands and categories...");
    const fetchPromises = [];
    
    for (const brand of brands) {
        for (const category of categories) {
            const url = `https://api.arhamanand.com:3003/list-files?brand=${encodeURIComponent(brand)}&category=${encodeURIComponent(category)}`;
            fetchPromises.push(
                fetch(url)
                    .then(response => {
                        console.log(`Response for ${brand}/${category}: Status ${response.status} ${response.statusText}`);
                        if (!response.ok) {
                            console.warn(`Failed to fetch files for ${brand}/${category}: ${response.status} ${response.statusText}`);
                            return [];
                        }
                        return response.json().then(files => ({ brand, category, files }));
                    })
                    .catch(error => {
                        console.error(`Error fetching files for ${brand}/${category}:`, error.message);
                        return [];
                    })
            );
        }
    }

    const results = await Promise.all(fetchPromises);
    
    results.forEach(({ brand, category, files }) => {
        if (Array.isArray(files) && files.length > 0) {
            files.forEach(fileKey => {
                const fileName = fileKey.split('/').pop();
                allFiles.push({
                    name: fileKey,
                    fileName: fileName,
                    brand: brand,
                    category: category
                });
            });
            console.log(`Files for ${brand}/${category}:`, files);
        } else {
            console.log(`No files found for ${brand}/${category}`);
        }
    });
    
    console.log(`Total files retrieved: ${allFiles.length}`);
    if (allFiles.length === 0) {
        console.warn("No files were retrieved from any brand/category combination. Check API availability or data.");
    }
    
    fileCache = allFiles; // Cache the results
    return allFiles;
}

function displaySearchResults(results) {
    const searchResultsContainer = document.getElementById("searchResults");
    const userRole = sessionStorage.getItem("role") || "standard";
    searchResultsContainer.innerHTML = '';

    if (results.length > 0) {
        const resultList = document.createElement('div');
        resultList.className = 'search-results-list';

        results.forEach(result => {
            const { name, fileName, brand, category } = result;
            const fileUrl = `https://d20h2he2gi3v2g.cloudfront.net/${name}`;

            const card = document.createElement("div");
            card.className = "file-card";

            const previewDiv = document.createElement("div");
            previewDiv.className = "file-preview";
            previewDiv.innerHTML = getFilePreview(fileUrl, fileName);
            previewDiv.addEventListener('click', (e) => {
                if (e.target.closest('.file-actions')) return; // Ignore button clicks
                viewFile(name); // Open all files in new tab on preview click
            });

            const infoDiv = document.createElement("div");
            infoDiv.className = "file-info";
            infoDiv.innerHTML = `
                <h4 title="${fileName}">${fileName}</h4>
                <p class="file-path" title="${name}"><i class="fas fa-folder"></i> ${brand}/${category}</p>
            `;

            const actionsDiv = document.createElement("div");
            actionsDiv.className = "file-actions";

            const downloadButton = document.createElement("button");
            downloadButton.classList.add("download-btn");
            downloadButton.innerHTML = '<i class="fas fa-download"></i>';
            downloadButton.setAttribute('aria-label', 'Open file');
            downloadButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent bubbling to card
                viewFile(name); // Open file in new tab on download button click
            });

            actionsDiv.appendChild(downloadButton);

            // Only add delete button for admin users
            if (userRole === "admin") {
                const deleteButton = document.createElement("button");
                deleteButton.classList.add("delete-btn");
                deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
                deleteButton.setAttribute('aria-label', 'Delete file');
                deleteButton.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent bubbling to card
                    deleteFile(name, brand, category);
                });
                actionsDiv.appendChild(deleteButton);
            }

            card.appendChild(previewDiv);
            card.appendChild(infoDiv);
            card.appendChild(actionsDiv);

            resultList.appendChild(card);
        });

        searchResultsContainer.appendChild(resultList);
    } else {
        searchResultsContainer.innerHTML = `<p class="no-results">No results found for your search term</p>`;
    }
}

function viewFile(filePath) {
    const fileUrl = `https://d20h2he2gi3v2g.cloudfront.net/${filePath}`;
    window.open(fileUrl, '_blank');
}