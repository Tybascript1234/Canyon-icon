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
    const searchFormat = document.getElementById("searchFormat"); // إضافة عنصر البحث عن الصيغ
    const toggleDownloadCounts = document.getElementById("toggleDownloadCounts");
    const downloadCounts = document.getElementById("downloadCounts");
    const totalDownloads = document.getElementById("totalDownloads");
    const containerCount = document.getElementById("containerCount");
    const popupLinkInput = document.getElementById("popupLinkInput"); // متغير لحقل إدخال الرابط
    const images = JSON.parse(localStorage.getItem("images")) || [];

    let downloadData = JSON.parse(localStorage.getItem("downloadData")) || {};

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
        let filteredImages = [];
    
        for (const imageData of images) {
            const { imageUrl, name, category } = imageData;
            if (name.toLowerCase().includes(searchText)) {
                filteredImages.push(imageData);
    
                const imageContainer = document.createElement("div");
                imageContainer.className = "image-container";
                imageContainer.setAttribute("onclick", "createRipple(event)");
    
                // إنشاء عنصر canvas بدلاً من img
                const canvas = document.createElement("canvas");
                canvas.className = "image-canvas";
                canvas.width = 100; // يمكنك ضبط الأبعاد حسب الحاجة
                canvas.height = 100;
                
                const ctx = canvas.getContext("2d");
                const img = new Image();
                img.src = await fetchImage(imageUrl);
                
                img.onload = function() {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    
                    // تخزين البيانات الأصلية
                    canvas.dataset.originalImage = imageUrl;
                };
                
                img.onload = function() {
                    // رسم الصورة على canvas
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                };
    
                const nameElement = document.createElement("div");
                nameElement.className = "image-name";
                nameElement.textContent = name;
                nameElement.title = name;
    
                const downloadButton = document.createElement("button");
                downloadButton.innerHTML = '<ion-icon name="ellipsis-horizontal"></ion-icon>';
                downloadButton.className = "download-btn";
                downloadButton.addEventListener("click", (event) => showDownloadPopup(event, img.src, name));
    
                imageContainer.appendChild(canvas);
                imageContainer.appendChild(nameElement);
                imageContainer.appendChild(downloadButton);
    
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
    
                // بقية الكود كما هو...
                imageContainer.addEventListener("click", () => copyImageName(nameElement));
    
                const resultItem = document.createElement("button");
                resultItem.className = "result-item ripple-btn";
                resultItem.setAttribute("onmousedown", "createRipple(event)");
                resultItem.innerHTML = `
                    <div class="result-item-div">
                        <div class="icon-container"><ion-icon name="search-outline"></ion-icon></div>
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
            }
        }
    
        searchResults.innerHTML = "";
        searchResults.appendChild(resultsFragment);
        containerCount.textContent = filteredImages.length;
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
        
        img.crossOrigin = "Anonymous";
        img.src = imageUrl;
        
        img.onload = function() {
            const scaleFactor = 2;
            tempCanvas.width = img.width * scaleFactor;
            tempCanvas.height = img.height * scaleFactor;
            
            tempCtx.imageSmoothingEnabled = true;
            tempCtx.imageSmoothingQuality = 'high';
            tempCtx.drawImage(img, 0, 0, tempCanvas.width, tempCanvas.height);
            
            // حفظ البيانات الأصلية للصورة
            popupImage.dataset.originalImage = imageUrl;
            popupImage.dataset.originalCanvas = tempCanvas.toDataURL();
            popupImage.src = tempCanvas.toDataURL();
            popupName.textContent = name;
            popupLinkInput.value = imageUrl;
            
            // تطبيق اللون المختار مباشرة
            applyColorToCanvas(tempCanvas, colorPicker.value);
            popupImage.src = tempCanvas.toDataURL();
            
            downloadPopup.style.display = "block";
            
            const rect = event.target.getBoundingClientRect();
            const popupRect = downloadPopup.getBoundingClientRect();
            
            let topPosition = rect.bottom + window.scrollY;
            let leftPosition = rect.left + window.scrollX;
            
            if (leftPosition + popupRect.width > window.innerWidth) {
                leftPosition = rect.right - popupRect.width + window.scrollX;
            }
            
            if (leftPosition < 0) {
                leftPosition = (window.innerWidth - popupRect.width) / 2 + window.scrollX;
            }
            
            if (topPosition + popupRect.height > window.innerHeight + window.scrollY) {
                topPosition = rect.top - popupRect.height + window.scrollY;
            }
            
            if (topPosition < 0) {
                topPosition = (window.innerHeight - popupRect.height) / 2 + window.scrollY;
            }
            
            downloadPopup.style.top = `${topPosition}px`;
            downloadPopup.style.left = `${leftPosition}px`;
            
            colorPicker.addEventListener("input", () => {
                applyColorToCanvas(tempCanvas, colorPicker.value);
                popupImage.src = tempCanvas.toDataURL();
            });
        };
        
        document.addEventListener('click', (e) => {
            const downloadPopup = document.getElementById('downloadPopup');
            const isClickInsidePopup = downloadPopup.contains(e.target);
            const isClickOnDownloadButton = e.target.closest('.download-btn');
            
            if (!isClickInsidePopup && !isClickOnDownloadButton && downloadPopup.style.display === 'block') {
                downloadPopup.style.display = 'none';
            }
        });
    
        const copyLinkButton = document.getElementById("copyLinkButton");
        copyLinkButton.addEventListener("click", () => {
            navigator.clipboard.writeText(popupLinkInput.value)
                .then(() => {
                    // تحديد النص في حقل الإدخال
                    popupLinkInput.select();
                    
                    // إخفاء التحديد بعد ثانية
                    setTimeout(() => {
                        window.getSelection().removeAllRanges();
                        popupLinkInput.blur();
                    }, 1000);
                })
                .catch(err => console.error("Error copying link: ", err));
        });
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







