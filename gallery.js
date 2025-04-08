document.addEventListener("DOMContentLoaded", async () => {
    const galleryContainer = document.getElementById("gallery");
    const category1Container = document.getElementById("category1");
    const category2Container = document.getElementById("category2");
    const category3Container = document.getElementById("category3");
    const searchInput = document.getElementById("searchInput");
    const searchResults = document.getElementById("searchResults");
    const clearButton = document.getElementById("clearButton");
    const downloadPopup = document.getElementById("downloadPopup");
    const popupImage = document.getElementById("popupImage");
    const popupName = document.getElementById("popupName");
    const colorPicker = document.getElementById("colorPicker");
    const searchFormat = document.getElementById("searchFormat");
    const toggleDownloadCounts = document.getElementById("toggleDownloadCounts");
    const downloadCounts = document.getElementById("downloadCounts");
    const totalDownloads = document.getElementById("totalDownloads");
    const containerCount = document.getElementById("containerCount");
    const popupLinkInput = document.getElementById("popupLinkInput");
    const toggleIconsButton = document.getElementById("toggleIcons");

    // استبدال بيانات localStorage ببيانات من data.js
    const images = Array.from(document.querySelectorAll('.gallery img, .category1 img')).map(img => ({
        imageUrl: img.src,
        name: img.alt,
        category: img.className === 'gallery' ? 'default' : img.className
    }));

    let downloadData = JSON.parse(localStorage.getItem("downloadData")) || {};
    let isFilled = false;
    const originalSources = new Map();

    // نظام تبديل الأيقونات
    if (toggleIconsButton) {
        toggleIconsButton.addEventListener('click', () => {
            isFilled = !isFilled;
            
            toggleIconsButton.innerHTML = isFilled 
                ? '<a>Outline</a><div id="ssdr"><span style="background: #298dff;"></span></div>' 
                : '<a>Fill</a><div><span></span></div>';

            updateAllImages();
        });
    }

    function updateAllImages() {
        updateGalleryImages();
        updatePopupImage();
        updateDownloadPopupImage();
    }

    function updateGalleryImages() {
        const imageContainers = document.querySelectorAll('.image-container');
        requestAnimationFrame(() => { // استخدام requestAnimationFrame لتجميع التحديثات
            imageContainers.forEach(container => {
                const img = container.querySelector('img, canvas');
                if (img) {
                    let currentSrc = img.src || img.dataset.originalImage;
    
                    if (currentSrc) {
                        if (!originalSources.has(img)) {
                            originalSources.set(img, currentSrc);
                        }
    
                        const newSrc = isFilled ?
                            currentSrc.includes('-outline.') ?
                                currentSrc.replace('-outline.', '.') :
                                currentSrc :
                            originalSources.get(img) || currentSrc;
    
                        // التحقق من الحاجة إلى التغيير قبل التحديث
                        if (newSrc !== (img.src || img.dataset.originalImage)) {
                            updateImageSource(img, newSrc);
                        }
                    }
                }
            });
        });
    }

    function updatePopupImage() {
        const popupImg = document.getElementById('popupImage');
        if (popupImg) {
            let currentSrc = popupImg.src || popupImg.dataset.originalImage;
            
            if (currentSrc) {
                if (!originalSources.has(popupImg)) {
                    originalSources.set(popupImg, currentSrc);
                }

                const newSrc = isFilled ? 
                    currentSrc.replace('-outline.', '.') : 
                    originalSources.get(popupImg);
                
                updateImageSource(popupImg, newSrc);
                updatePopupDownloadLinks(newSrc);
            }
        }
    }

    function updateDownloadPopupImage() {
        const downloadPopup = document.getElementById('downloadPopup');
        if (downloadPopup && downloadPopup.style.display !== 'none') {
            const popupImg = document.getElementById('popupImage');
            if (popupImg) {
                let currentSrc = popupImg.dataset.originalImage || popupImg.src;
                
                if (currentSrc) {
                    const newSrc = isFilled ? 
                        currentSrc.replace('-outline.', '.') : 
                        originalSources.get(popupImg) || currentSrc;
                    
                    const img = new Image();
                    img.onload = function() {
                        popupImg.src = newSrc;
                        popupImg.dataset.originalImage = newSrc;
                    };
                    img.src = newSrc;
                }
            }
        }
    }

    function updateImageSource(element, newSrc) {
        if (!element) return;
        
        if (element.tagName === 'IMG') {
            const img = new Image();
            img.onload = function() {
                element.src = newSrc;
                element.dataset.originalImage = newSrc;
            };
            img.src = newSrc;
        } else if (element.tagName === 'CANVAS') {
            const img = new Image();
            img.onload = function() {
                const ctx = element.getContext('2d');
                ctx.clearRect(0, 0, element.width, element.height);
                ctx.drawImage(img, 0, 0, element.width, element.height);
                element.dataset.originalImage = newSrc;
            };
            img.src = newSrc;
        }
    }

    function updatePopupDownloadLinks(newSrc) {
        if (popupLinkInput) {
            popupLinkInput.value = newSrc;
        }
    }

    function updateTotalDownloads() {
        const total = Object.values(downloadData).reduce((sum, count) => sum + count, 0);
        totalDownloads.textContent = total;
    }

    function saveDownloadData() {
        localStorage.setItem("downloadData", JSON.stringify(downloadData));
        updateTotalDownloads();
    }

    function displayDownloadCounts() {
        downloadCounts.innerHTML = "";
        const sortedEntries = Object.entries(downloadData).sort((a, b) => b[1] - a[1]);
        for (const [imageName, count] of sortedEntries) {
            const countDiv = document.createElement("div");
            countDiv.textContent = `${imageName}: ${count}`;
            downloadCounts.appendChild(countDiv);
        }
    }

    async function displayImages() {
        galleryContainer.innerHTML = "";
        category1Container.innerHTML = "";
        category2Container.innerHTML = "";
        category3Container.innerHTML = "";
        const searchText = searchInput.value.trim().toLowerCase();
        let filteredImages = [];
    
        // تصفية الصور أولاً
        filteredImages = images.filter(imageData => {
            return imageData.name.toLowerCase().includes(searchText);
        });
    
        containerCount.textContent = filteredImages.length;
    
        const observer = new IntersectionObserver(async (entries, observer) => {
            for (const entry of entries) {
                if (entry.isIntersecting) {
                    const imageContainer = entry.target;
                    const index = parseInt(imageContainer.dataset.index);
    
                    if (filteredImages[index]) {
                        const { imageUrl, name, category } = filteredImages[index];
    
                        // إنشاء عنصر canvas
                        const canvas = document.createElement("canvas");
                        canvas.className = "image-canvas";
                        canvas.width = 100;
                        canvas.height = 100;
    
                        const ctx = canvas.getContext("2d");
                        const img = new Image();
                        img.src = await fetchImage(imageUrl);
    
                        const rreDiv = document.createElement("div");
                        rreDiv.id = "rre";
                        rreDiv.style.display = "flex";
                        imageContainer.appendChild(rreDiv);
    
                        img.onload = function() {
                            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                            canvas.dataset.originalImage = imageUrl;
                            rreDiv.style.display = "none";
                        };
    
                        // استبدال العنصر الوهمي (إذا كان موجودًا) بالـ canvas الحقيقي
                        const placeholder = imageContainer.querySelector('.image-canvas-placeholder');
                        if (placeholder) {
                            imageContainer.replaceChild(canvas, placeholder);
                        } else {
                            imageContainer.appendChild(canvas); // في حال لم يكن هناك عنصر وهمي
                        }
    
                        observer.unobserve(imageContainer); // إيقاف مراقبة هذا العنصر
                    }
                }
            }
        }, {
            rootMargin: '0px 0px 200px 0px', // ابدأ التحميل قبل 200 بكسل من الظهور
            threshold: 0.01 // جزء صغير من العنصر مرئي لبدء التحميل
        });
    
        filteredImages.forEach((imageData, index) => {
            const { name, category } = imageData;
    
            const imageContainer = document.createElement("button");
            imageContainer.className = "image-container lazy-load"; // أضف كلاس للتحميل الكسول
            imageContainer.dataset.index = index; // تخزين فهرس الصورة
    
            // إنشاء عنصر وهمي (placeholder) لعرضه مؤقتًا
            const placeholderCanvas = document.createElement("canvas");
            placeholderCanvas.className = "image-canvas-placeholder";
            placeholderCanvas.width = 100;
            placeholderCanvas.height = 100;
            imageContainer.appendChild(placeholderCanvas);
    
            const nameElement = document.createElement("div");
            nameElement.className = "image-name";
            nameElement.textContent = name;
            nameElement.title = name;
    
            const downloadButton = document.createElement("button");
            downloadButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M240-400q-33 0-56.5-23.5T160-480q0-33 23.5-56.5T240-560q33 0 56.5 23.5T320-480q0 33-23.5 56.5T240-400Zm240 0q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm240 0q-33 0-56.5-23.5T640-480q0-33 23.5-56.5T720-560q33 0 56.5 23.5T800-480q0 33-23.5 56.5T720-400Z"/></svg>';
            downloadButton.className = "download-btn";
            downloadButton.addEventListener("click", (event) => {
                const imgElement = imageContainer.querySelector('.image-canvas');
                if (imgElement && imgElement.dataset.originalImage) {
                    showDownloadPopup(event, imgElement.dataset.originalImage, name);
                }
            });
    
            imageContainer.appendChild(nameElement);
            imageContainer.appendChild(downloadButton);
            imageContainer.addEventListener("click", () => copyImageName(nameElement));
    
            switch (category) {
                case "category1":
                    category1Container.appendChild(imageContainer);
                    break;
                case "category2":
                    category2Container.appendChild(imageContainer);
                    break;
                case "category3":
                    category3Container.appendChild(imageContainer);
                    break;
                default:
                    galleryContainer.appendChild(imageContainer);
                    break;
            }
    
            observer.observe(imageContainer); // ابدأ مراقبة الحاوية
        });
    
        // إضافة نتائج البحث (يتم إنشاؤها بشكل فوري ولا تحتاج إلى تحميل كسول)
        const resultsFragment = document.createDocumentFragment();
        filteredImages.forEach(imageData => {
            const { name } = imageData;
            const resultItem = document.createElement("button");
            resultItem.className = "result-item ripple-btn";
            resultItem.setAttribute("onmousedown", "createRipple(event)");
            resultItem.innerHTML = `
                <div class="result-item-div">
                    <div class="icon-container"><svg xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 -960 960 960" width="22px" fill="#1f1f1f"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg></div>
                    <div class="image-name">${name}</div>
                </div>
                <div>
                    <button class="result-item-button notranslate ripple-btn" onmousedown="createRipple(event)"></button>
                </div>
            `;
            resultItem.addEventListener("click", () => {
                searchInput.value = name;
                searchResults.style.display = "none";
                displayImages();
            });
            resultsFragment.appendChild(resultItem);
        });
        searchResults.innerHTML = "";
        searchResults.appendChild(resultsFragment);
    }
    
    // دالة مساعدة لإنشاء عنصر الصورة
    async function createImageElement(imageData) {
        let { imageUrl, name, category } = imageData;
        
        // تطبيق حالة التبديل الحالية
        const displayUrl = isFilled && imageUrl.includes('-outline.') 
            ? imageUrl.replace('-outline.', '.')
            : !isFilled && !imageUrl.includes('-outline.') && originalSources.has(imageUrl)
            ? imageUrl.replace(/(\.svg|\.png)/, '-outline$1')
            : imageUrl;
    
        const imageContainer = document.createElement("button");
        imageContainer.className = "image-container";
    
        // إنشاء عنصر canvas
        const canvas = document.createElement("canvas");
        canvas.className = "image-canvas";
        canvas.width = 100;
        canvas.height = 100;
        
        const ctx = canvas.getContext("2d");
        const img = new Image();
        
        // عنصر التحميل
        const rreDiv = document.createElement("div");
        rreDiv.id = "rre";
        rreDiv.style.display = "flex";
        imageContainer.appendChild(rreDiv);
    
        // تحميل الصورة
        try {
            img.src = await fetchImage(displayUrl);
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
            });
            
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            canvas.dataset.originalImage = imageUrl;
            originalSources.set(canvas, imageUrl);
            rreDiv.style.display = "none";
        } catch (error) {
            console.error("Error loading image:", error);
            return { container: null, resultItem: null };
        }
    
        // معلومات الصورة
        const nameElement = document.createElement("div");
        nameElement.className = "image-name";
        nameElement.textContent = name;
        nameElement.title = name;
        
        // زر التنزيل
        const downloadButton = document.createElement("button");
        downloadButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M240-400q-33 0-56.5-23.5T160-480q0-33 23.5-56.5T240-560q33 0 56.5 23.5T320-480q0 33-23.5 56.5T240-400Zm240 0q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm240 0q-33 0-56.5-23.5T640-480q0-33 23.5-56.5T720-560q33 0 56.5 23.5T800-480q0 33-23.5 56.5T720-400Z"/></svg>';
        downloadButton.className = "download-btn";
        downloadButton.addEventListener("click", (event) => showDownloadPopup(event, img.src, name));
        
        imageContainer.appendChild(canvas);
        imageContainer.appendChild(nameElement);
        imageContainer.appendChild(downloadButton);
        imageContainer.addEventListener("click", () => copyImageName(nameElement));
    
        // عنصر نتائج البحث
        const resultItem = document.createElement("button");
        resultItem.className = "result-item ripple-btn";
        resultItem.setAttribute("onmousedown", "createRipple(event)");
        resultItem.innerHTML = `
            <div class="result-item-div">
                <div class="icon-container"><svg xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 -960 960 960" width="22px" fill="#1f1f1f"><path d="M784-120 532-372q-30 24-69 38t-83 14q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l252 252-56 56ZM380-400q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z"/></svg></div>
                <div class="image-name">${name}</div>
            </div>
            <div>
                <button class="result-item-button notranslate ripple-btn" onmousedown="createRipple(event)"></button>
            </div>
        `;
        resultItem.addEventListener("click", () => {
            searchInput.value = name;
            searchResults.style.display = "none";
            displayImages();
        });
    
        return { container: imageContainer, resultItem };
    }
    
    // دالة مساعدة للتحقق من وجود الصورة
    async function imageExists(url) {
        try {
            const res = await fetch(url, { method: 'HEAD' });
            return res.ok;
        } catch {
            return false;
        }
    }
    

    function copyImageName(nameElement) {
        const originalName = nameElement.textContent;
        if (nameElement.dataset.copied === "true") {
            return;
        }
        nameElement.dataset.copied = "true";
        navigator.clipboard.writeText(originalName)
            .then(() => {
                nameElement.textContent = "!Copied";
                setTimeout(() => {
                    nameElement.textContent = originalName;
                    nameElement.dataset.copied = "false";
                }, 1000);
            })
            .catch(err => console.error("Error copying text: ", err));
    }

    displayImages();

    searchInput.addEventListener("input", () => {
        if (searchInput.value.trim() !== "") {
            displayImages();
            searchResults.style.display = "block";
        } else {
            searchResults.style.display = "none";
            displayImages(); // Clear the search and display all images
        }
        clearButton.style.display = searchInput.value.trim() !== "" ? "flex" : "none";
    });

    clearButton.addEventListener("click", () => {
        searchInput.value = "";
        displayImages();
        searchResults.style.display = "none";
        clearButton.style.display = "none";
    });

    async function fetchImage(url) {
        try {
            // بدلاً من تحويل الصورة إلى blob، نستخدم الرابط مباشرة
            return url;
        } catch (error) {
            console.error("Error fetching image:", error);
            return null;
        }
    }

    function showDownloadPopup(event, imageUrl, name) {
        event.stopPropagation();
    
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        const img = new Image();
        const downloadPopup = document.getElementById('downloadPopup');
        const popupImage = document.getElementById('popupImage');
        const popupName = document.getElementById('popupName');
        const popupLinkInput = document.getElementById('popupLinkInput');
        const popupPngInput = document.getElementById('popupPngInput');
        const popupSvgInput = document.getElementById('popupSvgInput');
        const colorPicker = document.getElementById('colorPicker');
        const copyLinkButton = document.getElementById('copyLinkButton');
    
        // إنشاء طبقة التغطية
        const overlay = document.createElement('div');
        overlay.id = 'overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = 0;
        overlay.style.left = 0;
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = '#00000021';
        overlay.style.zIndex = 999;
        
        // إضافة الطبقة فقط إذا كان العرض 800 بكسل أو أقل
        if (window.innerWidth <= 800) {
            document.body.appendChild(overlay);
        }
    
        img.crossOrigin = "Anonymous";
        // تطبيق حالة التبديل الحالية على الصورة
        const displayImageUrl = isFilled ? imageUrl.replace('-outline.', '.') : imageUrl;
        img.src = displayImageUrl;
    
        img.onload = function() {
            const scaleFactor = Math.min(3, 2000 / img.width);
            tempCanvas.width = img.width * scaleFactor;
            tempCanvas.height = img.height * scaleFactor;
    
            tempCtx.imageSmoothingEnabled = true;
            tempCtx.imageSmoothingQuality = 'high';
            tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
    
            // حفظ البيانات الأصلية للصورة
            popupImage.dataset.originalImage = displayImageUrl;
            popupImage.dataset.originalCanvas = tempCanvas.toDataURL();
            popupImage.src = tempCanvas.toDataURL();
            popupName.textContent = name;
            popupLinkInput.value = displayImageUrl;
            popupPngInput.value = tempCanvas.toDataURL('image/png');
    
            // إذا كانت الصورة SVG
            if (displayImageUrl.endsWith('.svg') || displayImageUrl.startsWith('data:image/svg')) {
                fetch(displayImageUrl)
                    .then(response => response.text())
                    .then(svgCode => {
                        popupSvgInput.value = svgCode;
                    });
            } else {
                popupSvgInput.value = "SVG code not available (PNG image)";
            }
    
            // إظهار البوب أب مع الأنيميشن
            downloadPopup.style.display = "block";
            downloadPopup.style.opacity = 0;
            downloadPopup.style.transform = 'translateX(100%)';
            
            // تحديد موقع البوب أب على يمين الموقع
            downloadPopup.style.position = 'fixed';
            downloadPopup.style.zIndex = 1000; // تأكد من أن البوب أب فوق طبقة التغطية
            
            setTimeout(() => {
                downloadPopup.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
                downloadPopup.style.opacity = 1;
                downloadPopup.style.transform = 'translateX(0)';
            }, 10);
    
            // تطبيق اللون المختار
            function applyColorToCanvas(canvas, color) {
                const ctx = canvas.getContext('2d');
                ctx.globalCompositeOperation = 'source-atop';
                ctx.fillStyle = color;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.globalCompositeOperation = 'source-over';
            }
    
            colorPicker.addEventListener("input", () => {
                // إعادة تحميل الصورة الأصلية قبل تطبيق اللون الجديد
                const originalImg = new Image();
                originalImg.onload = function() {
                    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                    tempCtx.drawImage(originalImg, 0, 0, tempCanvas.width, tempCanvas.height);
                    applyColorToCanvas(tempCanvas, colorPicker.value);
                    popupImage.src = tempCanvas.toDataURL();
                    popupPngInput.value = tempCanvas.toDataURL('image/png');
                };
                originalImg.src = popupImage.dataset.originalCanvas || displayImageUrl;
            });
    
            // إضافة معالجات الأحداث لحجم الصورة
            const sizeButtons = {
                'resize24': 24,
                'resize28': 28,
                'resize32': 32,
                'resize36': 36,
                'resize40': 40
            };
    
            Object.keys(sizeButtons).forEach(id => {
                const btn = document.getElementById(id);
                if (btn) {
                    btn.addEventListener('click', () => {
                        const size = sizeButtons[id];
                        popupImage.style.width = `${size}px`;
                        popupImage.style.height = `${size}px`;
                        document.getElementById('sizeDisplay').textContent = size;
                    });
                }
            });
    
            // إغلاق البوب أب عند النقر خارجها
            function closePopupHandler(e) {
                if (!downloadPopup.contains(e.target) && e.target !== event.target) {
                    downloadPopup.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
                    downloadPopup.style.opacity = 0;
                    downloadPopup.style.transform = 'translateX(100%)';
                    setTimeout(() => {
                        downloadPopup.style.display = "none";
                        
                        // التأكد من وجود العنصر overlay قبل محاولة إزالته
                        if (overlay && overlay.parentNode) {
                            document.body.removeChild(overlay);
                        }
                    }, 500);
                    document.removeEventListener('mousedown', closePopupHandler); // إزالة معالج الفأرة
                    document.removeEventListener('touchstart', closePopupHandler); // إزالة معالج لمس الأجهزة المحمولة
                }
            }            
    
            document.addEventListener('mousedown', closePopupHandler); // إضافة معالج الفأرة
            document.addEventListener('touchstart', closePopupHandler); // إضافة معالج لمس الأجهزة المحمولة
    
            // إغلاق البوب أب عند النقر على زر الإغلاق
            const closeBtn = document.querySelector('.close-popup');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    downloadPopup.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
                    downloadPopup.style.opacity = 0;
                    downloadPopup.style.transform = 'translateX(100%)';
                    setTimeout(() => {
                        downloadPopup.style.display = "none";
                        document.body.removeChild(overlay);
                    }, 500);
                });
            }
        };
    
        // دالة مساعدة للنسخ
        function copyToClipboard(textAreaId, buttonId) {
            const textArea = document.getElementById(textAreaId);
            const button = document.getElementById(buttonId);
            
            if (textArea && button) {
                navigator.clipboard.writeText(textArea.value)
                    .then(() => {
                        textArea.select();
                        // إظهار رسالة نجاح
                        showCopySuccess(button);
                        setTimeout(() => {
                            window.getSelection().removeAllRanges();
                            textArea.blur();
                        }, 1000);
                    })
                    .catch(err => console.error("Error copying text: ", err));
            }
        }
    
        function showCopySuccess(button) {
            let successMessage = document.createElement("span");
            successMessage.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 507.506 507.506" style="margin-right: 5px; fill: white;" width="12" height="12"><path d="M163.865,436.934c-14.406,0.006-28.222-5.72-38.4-15.915L9.369,304.966c-12.492-12.496-12.492-32.752,0-45.248l0,0c12.496-12.492,32.752-12.492,45.248,0l109.248,109.248L452.889,79.942c12.496-12.492,32.752-12.492,45.248,0l0,0c12.492,12.496,12.492,32.752,0,45.248L202.265,421.019C192.087,431.214,178.271,436.94,163.865,436.934z"/></svg> تم النسخ!';
            
            successMessage.style.position = "absolute";
            successMessage.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
            successMessage.style.color = "#fff";
            successMessage.style.display = "flex";
            successMessage.style.alignItems = "center";
            successMessage.style.padding = "5px 10px";
            successMessage.style.borderRadius = "5px";
            successMessage.style.top = "-5px";
            successMessage.style.left = "50%";
            successMessage.style.transform = "translateX(-50%)";
            successMessage.style.fontSize = "12px";
            successMessage.style.transition = "opacity 0.5s";
            successMessage.style.zIndex = "1001";
            
            button.parentNode.style.position = "relative";
            button.parentNode.appendChild(successMessage);
            
            setTimeout(() => {
                successMessage.style.opacity = "0";
                setTimeout(() => successMessage.remove(), 500);
            }, 1500);
        }
    
        // إعداد معالجات الأحداث لأزرار النسخ
        setupEventListeners();
    
        function setupEventListeners() {
            const buttons = {
                'copySvgButton': 'popupSvgInput',
                'copyPngButton': 'popupPngInput',
                'copyLinkButton': 'popupLinkInput'
            };
            
            Object.entries(buttons).forEach(([buttonId, textAreaId]) => {
                const button = document.getElementById(buttonId);
                if (button) {
                    button.addEventListener('click', () => copyToClipboard(textAreaId, buttonId));
                }
            });
        }
    }    
    
    // تحسين تعديل الألوان مع المحافظة على الجودة
    function applyColorToCanvas(canvas, color) {
        const ctx = canvas.getContext('2d');
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const hexColor = color.replace('#', '');
        const r = parseInt(hexColor.substr(0, 2), 16);
        const g = parseInt(hexColor.substr(2, 2), 16);
        const b = parseInt(hexColor.substr(4, 2), 16);
        
        for (let i = 0; i < data.length; i += 4) {
            // نحافظ على الشفافية (alpha channel)
            const alpha = data[i+3];
            if (alpha > 0) {
                // نطبق اللون مع الحفاظ على التدرج الشفاف
                data[i] = Math.round(r * (alpha / 255));
                data[i+1] = Math.round(g * (alpha / 255));
                data[i+2] = Math.round(b * (alpha / 255));
            }
        }
        
        ctx.putImageData(imgData, 0, 0);
    }
    

    function applyColorToSVG(canvas, color) {
        const ctx = canvas.getContext('2d');
        
        // مسح canvas الحالي
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // إنشاء صورة جديدة
        const img = new Image();
        img.src = canvas.dataset.originalImage || canvas.dataset.originalCanvas;
        
        img.onload = function() {
            // رسم خلفية ملونة
            ctx.fillStyle = color;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // رسم الصورة مع دمج الألوان
            ctx.globalCompositeOperation = 'destination-in';
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // إعادة ضبط وضع الدمج
            ctx.globalCompositeOperation = 'source-over';
        };
    }

    function downloadImage(url, name, format) {
        if (format === "svg") {
            fetch(url)
                .then(response => response.text())
                .then(svgData => {
                    // إنشاء عنصر SVG مؤقت لمعالجة المحتوى
                    const parser = new DOMParser();
                    const svgDoc = parser.parseFromString(svgData, "image/svg+xml");
                    const svgElement = svgDoc.querySelector("svg");
                    
                    // تطبيق اللون المختار على جميع العناصر داخل SVG
                    const elements = svgElement.querySelectorAll('*');
                    elements.forEach(el => {
                        if (el.hasAttribute('fill') && el.getAttribute('fill') !== 'none') {
                            el.setAttribute('fill', colorPicker.value);
                        }
                        if (el.hasAttribute('stroke') && el.getAttribute('stroke') !== 'none') {
                            el.setAttribute('stroke', colorPicker.value);
                        }
                    });
                    
                    // تحويل SVG المعدل إلى نص
                    const serializer = new XMLSerializer();
                    const coloredSVG = serializer.serializeToString(svgElement);
                    
                    // إنشاء Blob وتنزيله
                    const blob = new Blob([coloredSVG], { type: "image/svg+xml" });
                    const svgUrl = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = svgUrl;
                    a.download = `${name}.svg`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(svgUrl);
                    
                    // تحديث عدد التنزيلات
                    if (!downloadData[name]) downloadData[name] = 0;
                    downloadData[name]++;
                    saveDownloadData();
                })
                .catch(error => {
                    console.error("Error processing SVG:", error);
                    // إذا فشلت المعالجة، ننزل الملف الأصلي
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${name}.svg`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                });
        } else {
            handleDownload(format);
        }
    }

    function convertAndDownloadImage(canvas, name, format) {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        
        // تطبيق اللون المحدد
        tempCtx.fillStyle = colorPicker.value;
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        tempCtx.globalCompositeOperation = 'destination-in';
        const img = new Image();
        img.src = canvas.dataset.originalCanvas;
        tempCtx.drawImage(img, 0, 0);
        
        // تحميل الصورة الناتجة
        const dataUrl = tempCanvas.toDataURL(`image/${format}`);
        downloadImage(dataUrl, name, format);
    }

    function handleDownload(format) {
        const name = popupName.textContent;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            // تطبيق اللون المختار
            applyColorToCanvas(canvas, colorPicker.value);
            
            // تحميل الصورة
            let mimeType = `image/${format}`;
            if (format === 'jpg') mimeType = 'image/jpeg';
            
            const dataUrl = canvas.toDataURL(mimeType, 1.0);
            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = `${name}.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            // تحديث عدد التنزيلات
            if (!downloadData[name]) downloadData[name] = 0;
            downloadData[name]++;
            saveDownloadData();
        };
        
        img.src = popupImage.dataset.originalCanvas || popupImage.dataset.originalImage;
    }

    searchFormat.addEventListener("input", () => {
        const formatSearchText = searchFormat.value.trim().toLowerCase();
        const buttons = document.querySelectorAll("#downloadPopup button");
        buttons.forEach(button => {
            if (button.textContent.toLowerCase().includes(formatSearchText)) {
                button.style.display = "flex";
            } else {
                button.style.display = "none";
            }
        });
    });

    document.getElementById("downloadSVG").addEventListener("click", () => downloadImage(popupLinkInput.value, popupName.textContent, "svg"));
    document.getElementById("downloadPNG").addEventListener("click", () => handleDownload("png"));
    document.getElementById("downloadJPG").addEventListener("click", () => handleDownload("jpg"));
    document.getElementById("downloadWEBP").addEventListener("click", () => handleDownload("webp"));
    document.getElementById("downloadGIF").addEventListener("click", () => handleDownload("gif"));
    document.getElementById("downloadPDF").addEventListener("click", () => handleDownload("pdf"));
    document.getElementById("downloadMP4").addEventListener("click", () => handleDownload("mp4"));
    document.getElementById("downloadTDS").addEventListener("click", () => handleDownload("tds"));
    document.getElementById("downloadTIFF").addEventListener("click", () => handleDownload("tiff"));
    document.getElementById("downloadTGA").addEventListener("click", () => handleDownload("tga"));
    document.getElementById("downloadBMP").addEventListener("click", () => handleDownload("bmp"));
    document.getElementById("downloadICO").addEventListener("click", () => handleDownload("ico"));
    document.getElementById("downloadDXF").addEventListener("click", () => handleDownload("dxf"));
    document.getElementById("downloadRAW").addEventListener("click", () => handleDownload("raw"));
    document.getElementById("downloadEMF").addEventListener("click", () => handleDownload("emf"));
    document.getElementById("downloadPPM").addEventListener("click", () => handleDownload("ppm"));

    downloadCounts.style.display = downloadCounts.style.display || "none";

    toggleDownloadCounts.addEventListener("click", () => {
        if (downloadCounts.style.display === "none" || downloadCounts.style.display === "") {
            downloadCounts.style.display = "block";
            displayDownloadCounts();
        } else {
            downloadCounts.style.display = "none";
        }
    });

    document.addEventListener("click", (event) => {
        if (!searchInput.contains(event.target) && !searchResults.contains(event.target)) {
            searchResults.style.display = "none";
        }
    });

    searchInput.focus();
    updateTotalDownloads();
});
