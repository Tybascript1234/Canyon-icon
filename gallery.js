document.addEventListener("DOMContentLoaded", async () => {
    const galleryContainer = document.getElementById("gallery");
    const category1Container = document.getElementById("category1");
    const category2Container = document.getElementById("category2");
    const category3Container = document.getElementById("category3");
    const searchInput = document.getElementById("searchInput");
    const searchInput2 = document.getElementById("searchInput2");
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
    const popupShareLink = document.getElementById("popupShareLink");
    const copyShareLinkButton = document.getElementById("copyShareLinkButton");
    
    // عناصر مؤشر التحميل
    const loadingIndicator = document.getElementById("loadingIndicator");
    const loadingProgress = document.getElementById("loadingProgress");
    const loadingText = document.getElementById("loadingText");
    const loadingPercent = document.getElementById("loadingPercent");
    const currentIconTypeText = document.getElementById("currentIconType");

    // تحميل أيقونات Ionicons من CDN
    const iconsData = await fetchIoniconsData();
    
    // تصنيف الأيقونات حسب النوع
    const categorizedIcons = {
        outline: [],
        filled: [],
        sharp: []
    };

    // تصنيف الأيقونات مع تحديد أيقونات الـ logos
    iconsData.icons.forEach(icon => {
        const isLogo = icon.name.includes('logo') || icon.name.includes('brand');
        const category = isLogo ? "category1" : "default";
        
        if (icon.name.endsWith('-outline')) {
            categorizedIcons.outline.push({
                imageUrl: `https://unpkg.com/ionicons@7.1.0/dist/svg/${icon.name}.svg`,
                name: icon.name.replace('-outline', ''),
                category: category,
                isLogo: isLogo,
                type: 'outline'
            });
        } else if (icon.name.endsWith('-sharp')) {
            categorizedIcons.sharp.push({
                imageUrl: `https://unpkg.com/ionicons@7.1.0/dist/svg/${icon.name}.svg`,
                name: icon.name.replace('-sharp', ''),
                category: category,
                isLogo: isLogo,
                type: 'sharp'
            });
        } else {
            categorizedIcons.filled.push({
                imageUrl: `https://unpkg.com/ionicons@7.1.0/dist/svg/${icon.name}.svg`,
                name: icon.name,
                category: category,
                isLogo: isLogo,
                type: 'filled'
            });
        }
    });

    // دمج جميع الأيقونات في مصفوفة واحدة
    let images = [
        ...categorizedIcons.outline,
        ...categorizedIcons.filled,
        ...categorizedIcons.sharp
    ];

    let downloadData = JSON.parse(localStorage.getItem("downloadData")) || {};
    const originalSources = new Map();
    let currentIconType = 'outline'; // النوع الافتراضي للأيقونات
    let isIconLoading = false; // متغير لتتبع حالة التحميل

// في نظام تبديل الأيقونات
const iconTypeButtons = document.querySelectorAll('.icon-type-btn');
    
// تطبيق تأثير zoom على الزر الافتراضي (outline) عند التحميل
document.querySelector(`.icon-type-btn[data-type="${currentIconType}"]`).classList.add('zoom');

iconTypeButtons.forEach(button => {
    button.addEventListener('click', async () => {
        if (isIconLoading) return;
        
        isIconLoading = true;
        iconTypeButtons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
        });
        
        // إزالة تأثير zoom من جميع الأزرار وإضافته للزر المحدد
        iconTypeButtons.forEach(btn => {
            btn.classList.remove('zoom');
            btn.style.transform = '';
            btn.style.boxShadow = '';
        });
        button.classList.add('zoom');
        // button.style.transform = 'scale(1.1)';
        // button.style.boxShadow = 'rgb(0 0 0 / 10%) 0px 0px 4px, rgb(114 180 255) 0px 0px 1px';
        currentIconType = button.dataset.type;
        currentIconTypeText.textContent = currentIconType.charAt(0).toUpperCase() + currentIconType.slice(1);
        
        await displayImages();
        
        iconTypeButtons.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
        });
        isIconLoading = false;
    });
});

    // التخزين المؤقت لتحسين الأداء
    const iconCache = {
        outline: null,
        filled: null,
        sharp: null
    };

    // دالة لمزامنة البحث بين الحقلين
    function syncSearchInputs(event) {
        if (event.target === searchInput) {
            searchInput2.value = searchInput.value;
        } else {
            searchInput.value = searchInput2.value;
        }
        displayImages();
    }

    // إضافة Event listeners لكلا حقلين البحث
    searchInput.addEventListener("input", syncSearchInputs);
    searchInput2.addEventListener("input", syncSearchInputs);

    function updateAllImages() {
        updateGalleryImages();
        updatePopupImage();
        updateDownloadPopupImage();
    }

    function updateGalleryImages() {
        const imageContainers = document.querySelectorAll('.image-container');
        imageContainers.forEach(container => {
            const img = container.querySelector('img');
            if (img) {
                let currentSrc = img.dataset.originalImage || img.src;
                
                if (currentSrc) {
                    let newSrc = currentSrc;
                    
                    if (currentIconType === 'filled') {
                        newSrc = currentSrc.includes('-outline.') ? 
                            currentSrc.replace('-outline.', '.') : 
                            currentSrc.includes('-sharp.') ? 
                                currentSrc.replace('-sharp.', '.') : 
                                currentSrc;
                    } else if (currentIconType === 'outline') {
                        newSrc = currentSrc.includes('.') && !currentSrc.includes('-outline.') && !currentSrc.includes('-sharp.') ? 
                            currentSrc.replace('.', '-outline.') : 
                            currentSrc.includes('-sharp.') ? 
                                currentSrc.replace('-sharp.', '-outline.') : 
                                currentSrc;
                    } else if (currentIconType === 'sharp') {
                        newSrc = currentSrc.includes('.') && !currentSrc.includes('-sharp.') && !currentSrc.includes('-outline.') ? 
                            currentSrc.replace('.', '-sharp.') : 
                            currentSrc.includes('-outline.') ? 
                                currentSrc.replace('-outline.', '-sharp.') : 
                                currentSrc;
                    }
                    
                    updateImageSource(img, newSrc);
                }
            }
        });
    }

    function updatePopupImage() {
        const popupImg = document.getElementById('popupImage');
        if (popupImg) {
            let currentSrc = popupImg.dataset.originalImage || popupImg.src;
    
            if (currentSrc) {
                let newSrc = currentSrc;
    
                if (currentIconType === 'filled') {
                    newSrc = currentSrc.includes('-outline.')
                        ? currentSrc.replace('-outline.', '.')
                        : currentSrc.includes('-sharp.')
                        ? currentSrc.replace('-sharp.', '.')
                        : currentSrc;
                } else if (currentIconType === 'outline') {
                    newSrc =
                        currentSrc.includes('.') &&
                        !currentSrc.includes('-outline.') &&
                        !currentSrc.includes('-sharp.')
                            ? currentSrc.replace('.', '-outline.')
                            : currentSrc.includes('-sharp.')
                            ? currentSrc.replace('-sharp.', '-outline.')
                            : currentSrc;
                } else if (currentIconType === 'sharp') {
                    newSrc =
                        currentSrc.includes('.') &&
                        !currentSrc.includes('-sharp.') &&
                        !currentSrc.includes('-outline.')
                            ? currentSrc.replace('.', '-sharp.')
                            : currentSrc.includes('-outline.')
                            ? currentSrc.replace('-outline.', '-sharp.')
                            : currentSrc;
                }
    
                // تحديث المصدر
                fetch(newSrc)
                    .then((response) => response.text())
                    .then((svgContent) => {
                        // تعديل لون الـ SVG بإضافة fill
                        const parser = new DOMParser();
                        const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
                        const svgElement = svgDoc.querySelector('svg');
    
                        if (svgElement) {
                            const selectedColor = document.getElementById('colorPicker').value;
                            svgElement.setAttribute('fill', selectedColor);
    
                            const serializer = new XMLSerializer();
                            const coloredSVG = serializer.serializeToString(svgElement);
    
                            const blob = new Blob([coloredSVG], { type: 'image/svg+xml' });
                            const objectURL = URL.createObjectURL(blob);
    
                            popupImg.src = objectURL;
                            popupImg.dataset.originalImage = newSrc;
                        }
                    })
                    .catch((err) => console.error('Error fetching or processing SVG:', err));
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
                    let newSrc = currentSrc;
                    
                    if (currentIconType === 'filled') {
                        newSrc = currentSrc.includes('-outline.') ? 
                            currentSrc.replace('-outline.', '.') : 
                            currentSrc.includes('-sharp.') ? 
                                currentSrc.replace('-sharp.', '.') : 
                                currentSrc;
                    } else if (currentIconType === 'outline') {
                        newSrc = currentSrc.includes('.') && !currentSrc.includes('-outline.') && !currentSrc.includes('-sharp.') ? 
                            currentSrc.replace('.', '-outline.') : 
                            currentSrc.includes('-sharp.') ? 
                                currentSrc.replace('-sharp.', '-outline.') : 
                                currentSrc;
                    } else if (currentIconType === 'sharp') {
                        newSrc = currentSrc.includes('.') && !currentSrc.includes('-sharp.') && !currentSrc.includes('-outline.') ? 
                            currentSrc.replace('.', '-sharp.') : 
                            currentSrc.includes('-outline.') ? 
                                currentSrc.replace('-outline.', '-sharp.') : 
                                currentSrc;
                    }
                    
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
        if (!element || element.tagName !== 'IMG') return;
        
        const img = new Image();
        img.onload = function() {
            element.src = newSrc;
            element.dataset.originalImage = newSrc;
        };
        img.src = newSrc;
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
        const resultsFragment = document.createDocumentFragment();
        
        if (iconCache[currentIconType] && searchText === "") {
            await renderIcons(iconCache[currentIconType]);
            return;
        }
        
        let filteredImages = images.filter(imageData => {
            const matchesSearch = imageData.name.toLowerCase().includes(searchText);
            
            if (imageData.isLogo) {
                return matchesSearch;
            }
            
            // التأكد من عرض الأيقونات الخاصة بالنوع المحدد فقط
            const matchesType = 
                (currentIconType === 'outline' && imageData.type === 'outline') ||
                (currentIconType === 'sharp' && imageData.type === 'sharp') ||
                (currentIconType === 'filled' && imageData.type === 'filled');
            
            return matchesSearch && matchesType;
        });
    
        containerCount.textContent = filteredImages.length;
        
        if (searchText === "") {
            iconCache[currentIconType] = filteredImages;
        }
        
        await renderIcons(filteredImages);
    }

    async function renderIcons(filteredImages) {
        // إظهار مؤشر التحميل
        loadingIndicator.style.display = "block";
        currentIconTypeText.textContent = currentIconType.charAt(0).toUpperCase() + currentIconType.slice(1);
        
        let loadedCount = 0;
        const totalCount = filteredImages.length;
        
        function updateProgress() {
            loadedCount++;
            const percent = Math.round((loadedCount / totalCount) * 100);
            loadingProgress.style.width = percent + "%";
            loadingPercent.textContent = percent + "%";
            
            if (loadedCount === totalCount) {
                setTimeout(() => {
                    loadingIndicator.style.display = "none";
                }, 500);
            }
        }
        
        const batchSize = 50; // تقليل حجم الدفعة لتحسين الأداء
        const resultsFragment = document.createDocumentFragment();
        
        window.addEventListener("contextmenu", function(e) {
            if (e.target.closest('.image-container')) {
                e.preventDefault();
            }
        }, false);

        for (let i = 0; i < filteredImages.length; i += batchSize) {
            const batch = filteredImages.slice(i, i + batchSize);
            await Promise.all(batch.map(async (imageData) => {
                const { imageUrl, name, category, isLogo } = imageData;
                
                const imageContainer = document.createElement("button");
                imageContainer.className = "image-container";
                
                // استخدام img بدلاً من canvas
                const imgElement = document.createElement("img");
                imgElement.className = "svg-icon";
                imgElement.loading = "lazy"; // تحميل كسول لتحسين الأداء
                imgElement.src = imageUrl;
                imgElement.dataset.originalImage = imageUrl;
                imgElement.dataset.isLogo = isLogo;
                imgElement.alt = name;
                
                const nameElement = document.createElement("div");
                nameElement.className = "image-name";
                nameElement.textContent = name;
                nameElement.title = name;
                
                const downloadButton = document.createElement("button");
                downloadButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f"><path d="M240-400q-33 0-56.5-23.5T160-480q0-33 23.5-56.5T240-560q33 0 56.5 23.5T320-480q0 33-23.5 56.5T240-400Zm240 0q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm240 0q-33 0-56.5-23.5T640-480q0-33 23.5-56.5T720-560q33 0 56.5 23.5T800-480q0 33-23.5 56.5T720-400Z"/></svg>';
                downloadButton.className = "download-btn";
                downloadButton.addEventListener("click", (event) => {
                    const img = event.target.closest('.image-container').querySelector('img');
                    const isLogo = img.dataset.isLogo === 'true';
                    showDownloadPopup(event, img.dataset.originalImage, name, isLogo);
                });
                
                imageContainer.appendChild(imgElement);
                imageContainer.appendChild(nameElement);
                imageContainer.appendChild(downloadButton);
                imageContainer.addEventListener("click", (event) => {
                    event.stopPropagation();
                    copyImageName(nameElement);
                });

                function copyImageName(nameElement) {
                    const originalName = nameElement.textContent;
                    nameElement.textContent = "Copied!";
                    
                    navigator.clipboard.writeText(originalName)
                        .then(() => {
                            console.log("Text copied to clipboard");
                        })
                        .catch(err => {
                            console.error("Failed to copy text: ", err);
                        });
                    
                    setTimeout(() => {
                        nameElement.textContent = originalName;
                    }, 1000);
                }
                
                if (category === "category1") {
                    category1Container.appendChild(imageContainer);
                } else if (category === "category2") {
                    category2Container.appendChild(imageContainer);
                } else if (category === "category3") {
                    category3Container.appendChild(imageContainer);
                } else {
                    galleryContainer.appendChild(imageContainer);
                }
                
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
                    searchInput2.value = name;
                    searchResults.style.display = "none";
                    displayImages();
                });
                resultsFragment.appendChild(resultItem);
                
                updateProgress();
            }));
            
            // إعطاء المتصفح فرصة للرسم
            await new Promise(resolve => setTimeout(resolve, 0));
        }
        
        searchResults.innerHTML = "";
        searchResults.appendChild(resultsFragment);
    }
    
    async function fetchIoniconsData() {
        try {
            const response = await fetch('https://unpkg.com/ionicons@7.1.0/dist/ionicons.json');
            return await response.json();
        } catch (error) {
            console.error("Error fetching Ionicons data:", error);
            return { icons: [] };
        }
    }

    // دالة لإنشاء رابط مشاركة للبوب
    function generateShareableLink(imageUrl, name) {
        const baseUrl = window.location.origin + window.location.pathname;
        const encodedUrl = encodeURIComponent(imageUrl);
        const encodedName = encodeURIComponent(name);
        let category = 'all';
        
        // تحديد القسم إذا كانت الأيقونة ضمن تصنيف معين
        const iconData = images.find(img => img.imageUrl === imageUrl);
        if (iconData) {
            category = iconData.category || 'all';
        }
        
        // تضمين النوع الحالي للأيقونات في الرابط
        return `${baseUrl}?popup=1&image=${encodedUrl}&name=${encodedName}&type=${currentIconType}&category=${category}`;
    }

    // دالة لعرض رابط المشاركة في البوب
    function showShareableLink(imageUrl, name) {
        const shareLink = generateShareableLink(imageUrl, name);
        
        if (popupShareLink) {
            popupShareLink.value = shareLink;
        }
        
        if (copyShareLinkButton) {
            copyShareLinkButton.onclick = function() {
                navigator.clipboard.writeText(shareLink)
                    .then(() => {
                        alert('تم نسخ رابط المشاركة!');
                    })
                    .catch(err => {
                        console.error('فشل نسخ الرابط: ', err);
                    });
            };
        }
        
        // تحديث عنوان الصفحة ليعرض الرابط (بدون إعادة تحميل الصفحة)
        window.history.pushState({}, '', shareLink);
    }

    // دالة للتحقق من وجود معلمات البوب عند تحميل الصفحة
    function checkForPopupOnLoad() {
        const urlParams = new URLSearchParams(window.location.search);
        const popupParam = urlParams.get('popup');
        const imageParam = urlParams.get('image');
        const nameParam = urlParams.get('name');
        const typeParam = urlParams.get('type');
        const categoryParam = urlParams.get('category');
        
        if (popupParam === '1' && imageParam && nameParam) {
            const decodedImage = decodeURIComponent(imageParam);
            const decodedName = decodeURIComponent(nameParam);
            
            // تعيين نوع الأيقونة إذا كان موجودًا في الرابط
            if (typeParam && ['outline', 'filled', 'sharp'].includes(typeParam)) {
                currentIconType = typeParam;
                // تحديث زر النوع المحدد مع تأثير zoom
                document.querySelectorAll('.icon-type-btn').forEach(btn => {
                    btn.classList.remove('zoom');
                    if (btn.dataset.type === currentIconType) {
                        btn.classList.add('zoom');
                        // إضافة تأثير إضافي للتوضيح
                        // btn.style.transform = 'scale(1.1)';
                        // btn.style.boxShadow = 'rgb(0 0 0 / 10%) 0px 0px 4px, rgb(114 180 255) 0px 0px 1px';
                        btn.style.transition = 'all 0.3s ease';
                    }
                });
                // تحديث نص النوع الحالي
                currentIconTypeText.textContent = currentIconType.charAt(0).toUpperCase() + currentIconType.slice(1);
            }
            
            // إذا كان هناك قسم محدد، قم بتمييزه
            if (categoryParam) {
                document.querySelectorAll('.category-navigation button').forEach(btn => {
                    btn.classList.remove('active');
                    if (btn.dataset.category === categoryParam) {
                        btn.classList.add('active');
                    }
                });
            }
            
            // عرض البوب مباشرة عند تحميل الصفحة
            setTimeout(() => {
                showDownloadPopup({ 
                    stopPropagation: () => {},
                    target: document.querySelector('.image-container') 
                }, decodedImage, decodedName);
            }, 500);
            
            // عرض الأيقونات الخاصة بالنوع المحدد
            setTimeout(() => {
                displayImages();
            }, 300);
        }
    }

    // التهيئة الأولية
    await displayImages();
    
    searchInput.addEventListener("input", () => {
        if (searchInput.value.trim() !== "") {
            displayImages();
            searchResults.style.display = "block";
        } else {
            searchResults.style.display = "none";
            displayImages();
        }
        clearButton.style.display = searchInput.value.trim() !== "" ? "flex" : "none";
    });

    clearButton.addEventListener("click", () => {
        searchInput.value = "";
        searchInput2.value = "";
        displayImages();
        searchResults.style.display = "none";
        clearButton.style.display = "none";
    });

    function showDownloadPopup(event, imageUrl, name, isLogo = false) {
        event.stopPropagation();
    
        const downloadPopup = document.getElementById('downloadPopup');
        const popupImage = document.getElementById('popupImage');
        const popupName = document.getElementById('popupName');
        const popupLinkInput = document.getElementById('popupLinkInput');
        const popupPngInput = document.getElementById('popupPngInput');
        const popupSvgInput = document.getElementById('popupSvgInput');
        const colorPicker = document.getElementById('colorPicker');
    
        const overlay = document.createElement('div');
        overlay.id = 'overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = 0;
        overlay.style.left = 0;
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = '#00000021';
        overlay.style.zIndex = 999;
        
        document.body.appendChild(overlay);
        
        let displayImageUrl = imageUrl;
        if (!isLogo) {
            if (currentIconType === 'filled') {
                displayImageUrl = imageUrl.includes('-outline.') ? 
                    imageUrl.replace('-outline.', '.') : 
                    imageUrl.includes('-sharp.') ? 
                        imageUrl.replace('-sharp.', '.') : 
                        imageUrl;
            } else if (currentIconType === 'outline') {
                displayImageUrl = imageUrl.includes('.') && !imageUrl.includes('-outline.') && !imageUrl.includes('-sharp.') ? 
                    imageUrl.replace('.', '-outline.') : 
                    imageUrl.includes('-sharp.') ? 
                        imageUrl.replace('-sharp.', '-outline.') : 
                        imageUrl;
            } else if (currentIconType === 'sharp') {
                displayImageUrl = imageUrl.includes('.') && !imageUrl.includes('-sharp.') && !imageUrl.includes('-outline.') ? 
                    imageUrl.replace('.', '-sharp.') : 
                    imageUrl.includes('-outline.') ? 
                        imageUrl.replace('-outline.', '-sharp.') : 
                        imageUrl;
            }
        }
        
        // إنشاء canvas فقط عند الحاجة (لتحويل SVG إلى PNG)
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = displayImageUrl;
    
        img.onload = function() {
            const scaleFactor = Math.min(3, 2000 / img.width);
            tempCanvas.width = img.width * scaleFactor;
            tempCanvas.height = img.height * scaleFactor;
    
            tempCtx.imageSmoothingEnabled = true;
            tempCtx.imageSmoothingQuality = 'high';
            tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
    
            popupImage.dataset.originalImage = displayImageUrl;
            popupImage.dataset.originalCanvas = tempCanvas.toDataURL();
            popupImage.src = displayImageUrl; // عرض SVG مباشرة
            popupName.textContent = name;
            popupLinkInput.value = displayImageUrl;
            popupPngInput.value = tempCanvas.toDataURL('image/png');
    
            if (displayImageUrl.endsWith('.svg')) {
                fetch(displayImageUrl)
                    .then(response => response.text())
                    .then(svgCode => {
                        popupSvgInput.value = svgCode;
                    })
                    .catch(err => {
                        console.error("Error fetching SVG:", err);
                        popupSvgInput.value = "SVG code not available";
                    });
            } else {
                popupSvgInput.value = "SVG code not available";
            }

            // عرض رابط المشاركة في البوب
            showShareableLink(displayImageUrl, name);
    
            downloadPopup.style.display = "block";
            downloadPopup.style.opacity = 0;
            downloadPopup.style.transform = 'translateX(100%)';
            downloadPopup.style.position = 'fixed';
            downloadPopup.style.zIndex = 1000;
            
            setTimeout(() => {
                downloadPopup.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
                downloadPopup.style.opacity = 1;
                downloadPopup.style.transform = 'translateX(0)';
            }, 10);
    
            function applyColorToCanvas(canvas, color) {
                const ctx = canvas.getContext('2d');
                ctx.globalCompositeOperation = 'source-atop';
                ctx.fillStyle = color;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.globalCompositeOperation = 'source-over';
            }
    
            colorPicker.addEventListener("input", () => {
                const originalImg = new Image();
                originalImg.crossOrigin = "Anonymous"; // هذا السطر مهم
                originalImg.onload = function() {
                    tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
                    tempCtx.drawImage(originalImg, 0, 0, tempCanvas.width, tempCanvas.height);
                    applyColorToCanvas(tempCanvas, colorPicker.value);
                    popupImage.src = tempCanvas.toDataURL();
                    popupPngInput.value = tempCanvas.toDataURL('image/png');
                };
                originalImg.onerror = function() {
                    console.error("Failed to load image with CORS");
                    // يمكنك إضافة حل بديل هنا
                };
                originalImg.src = popupImage.dataset.originalImage + (popupImage.dataset.originalImage.includes('?') ? '&' : '?') + 'timestamp=' + new Date().getTime();
            });
    
            const sizeButtons = {
                'resize24': 24,
                'resize28': 28,
                'resize32': 32,
                'resize36': 36,
                'resize40': 40,
                'resize44': 44,
                'resize48': 48,
                'resize52': 52
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
    
            function closePopupHandler(e) {
                if (!downloadPopup.contains(e.target) && e.target !== event.target) {
                    downloadPopup.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
                    downloadPopup.style.opacity = 0;
                    downloadPopup.style.transform = 'translateX(100%)';
                    setTimeout(() => {
                        downloadPopup.style.display = "none";
                        
                        if (overlay && overlay.parentNode) {
                            document.body.removeChild(overlay);
                        }

                        // إعادة تعيين عنوان URL عند إغلاق البوب
                        window.history.pushState({}, '', window.location.pathname);
                    }, 500);
                    document.removeEventListener('mousedown', closePopupHandler);
                    document.removeEventListener('touchstart', closePopupHandler);
                }
            }            
    
            document.addEventListener('mousedown', closePopupHandler);
            document.addEventListener('touchstart', closePopupHandler);

            const closeBtn = document.querySelector('.close-popup');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    downloadPopup.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
                    downloadPopup.style.opacity = 0;
                    downloadPopup.style.transform = 'translateX(100%)';
                    setTimeout(() => {
                        downloadPopup.style.display = "none";
                        document.body.removeChild(overlay);
                        
                        // إعادة تعيين عنوان URL عند إغلاق البوب
                        window.history.pushState({}, '', window.location.pathname);
                    }, 500);
                });
            }
        };
    
        img.onerror = function() {
            img.onerror = function() {
    console.error("Error loading image:", displayImageUrl);
    // محاولة تحميل الصورة الأصلية كحل بديل
    const fallbackImage = new Image();
    fallbackImage.onload = function() {
        popupImage.src = imageUrl;
        popupImage.dataset.originalImage = imageUrl;
        popupName.textContent = name;
        popupLinkInput.value = imageUrl;
        
        // عرض رابط المشاركة في البوب
        showShareableLink(imageUrl, name);
        
        downloadPopup.style.display = "block";
        downloadPopup.style.opacity = 0;
        downloadPopup.style.transform = 'translateX(100%)';
        downloadPopup.style.position = 'fixed';
        downloadPopup.style.zIndex = '1000';
        
        setTimeout(() => {
            downloadPopup.style.transition = 'transform 0.5s ease, opacity 0.5s ease';
            downloadPopup.style.opacity = 1;
            downloadPopup.style.transform = 'translateX(0)';
        }, 10);
    };
    fallbackImage.onerror = function() {
        console.error("Fallback image also failed to load:", imageUrl);
        popupImage.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x="10" y="50" font-family="Arial" font-size="14" fill="red">Error loading image</text></svg>';
        popupName.textContent = name + " (Error)";
        downloadPopup.style.display = "block";
    };
    fallbackImage.src = imageUrl;
};
    
        function copyToClipboard(textAreaId, buttonId) {
            const textArea = document.getElementById(textAreaId);
            const button = document.getElementById(buttonId);
            
            if (textArea && button) {
                navigator.clipboard.writeText(textArea.value)
                    .then(() => {
                        textArea.select();
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
    
        function setupEventListeners() {
            const buttons = {
                'copySvgButton': 'popupSvgInput',
                'copyPngButton': 'popupPngInput',
                'copyLinkButton': 'popupLinkInput',
                'copyShareLinkButton': 'popupShareLink'
            };
            
            Object.entries(buttons).forEach(([buttonId, textAreaId]) => {
                const button = document.getElementById(buttonId);
                if (button) {
                    button.addEventListener('click', () => copyToClipboard(textAreaId, buttonId));
                }
            });
        }
        
        setupEventListeners();
    }    
    
    function applyColorToCanvas(canvas, color) {
        const ctx = canvas.getContext('2d');
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;
        const hexColor = color.replace('#', '');
        const r = parseInt(hexColor.substr(0, 2), 16);
        const g = parseInt(hexColor.substr(2, 2), 16);
        const b = parseInt(hexColor.substr(4, 2), 16);
        
        for (let i = 0; i < data.length; i += 4) {
            const alpha = data[i+3];
            if (alpha > 0) {
                data[i] = r;
                data[i+1] = g;
                data[i+2] = b;
                data[i+3] = alpha;
            }
        }
        
        ctx.putImageData(imgData, 0, 0);
    }

    function downloadImage(url, name, format) {
        const selectedColor = colorPicker.value;
        
        if (format === "svg") {
            fetch(url)
                .then(response => response.text())
                .then(svgData => {
                    const parser = new DOMParser();
                    const svgDoc = parser.parseFromString(svgData, "image/svg+xml");
                    const svgElement = svgDoc.querySelector("svg");
                    
                    const elements = svgElement.querySelectorAll('*');
                    elements.forEach(el => {
                        if (el.hasAttribute('fill') && el.getAttribute('fill') !== 'none') {
                            el.setAttribute('fill', selectedColor);
                        }
                        if (el.hasAttribute('stroke') && el.getAttribute('stroke') !== 'none') {
                            el.setAttribute('stroke', selectedColor);
                        }
                    });
                    
                    if (svgElement.getAttribute('fill') === null) {
                        svgElement.setAttribute('fill', selectedColor);
                    }
                    
                    const serializer = new XMLSerializer();
                    const coloredSVG = serializer.serializeToString(svgElement);
                    
                    const blob = new Blob([coloredSVG], { type: "image/svg+xml" });
                    const svgUrl = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = svgUrl;
                    a.download = `${name}.svg`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(svgUrl);
                    
                    updateDownloadCount(name);
                })
                .catch(error => {
                    console.error("Error processing SVG:", error);
                    fallbackDownload(url, name, "svg");
                });
        } else {
            handleDownload(format, name, true);
        }
    }

    function handleDownload(format, name, isLogo = false) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            if (!isLogo) {
                applyColorToCanvas(canvas, colorPicker.value);
            }
            
            let mimeType = `image/${format}`;
            if (format === 'jpg') mimeType = 'image/jpeg';
            
            const dataUrl = canvas.toDataURL(mimeType, 1.0);
            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = `${name}.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            
            updateDownloadCount(name);
        };
        
        img.src = popupImage.dataset.originalImage;
    }
    
    function updateDownloadCount(name) {
        if (!downloadData[name]) downloadData[name] = 0;
        downloadData[name]++;
        saveDownloadData();
        displayDownloadCounts();
    }
    
    function fallbackDownload(url, name, format) {
        const a = document.createElement("a");
        a.href = url;
        a.download = `${name}.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        updateDownloadCount(name);
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

    // التحقق من وجود معلمات البوب عند تحميل الصفحة
    checkForPopupOnLoad();

    searchInput.focus();
    updateTotalDownloads();
});
