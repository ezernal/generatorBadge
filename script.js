// Загрузка фото
document.getElementById('photoUpload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.getElementById('photo');
            img.src = e.target.result;
            img.style.display = 'block';
            const finalPhoto = document.getElementById('finalPhoto');
            finalPhoto.src = e.target.result;
            finalPhoto.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

// Изменение размера фото
document.getElementById('photoSize').addEventListener('input', function(event) {
    const size = event.target.value;
    const img = document.getElementById('photo');
    img.style.width = `${size}px`;
    img.style.height = `${size}px`;
    const finalPhoto = document.getElementById('finalPhoto');
    finalPhoto.style.width = `${size}px`;
    finalPhoto.style.height = `${size}px`;
});

// Позиция фото по горизонтали
document.getElementById('photoPositionX').addEventListener('input', function(event) {
    const positionX = event.target.value;
    const img = document.getElementById('photo');
    img.style.left = `${positionX}px`;
    const finalPhoto = document.getElementById('finalPhoto');
    finalPhoto.style.left = `${positionX}px`;
});

// Позиция фото по вертикали
document.getElementById('photoPositionY').addEventListener('input', function(event) {
    const positionY = event.target.value;
    const img = document.getElementById('photo');
    img.style.top = `${positionY}px`;
    const finalPhoto = document.getElementById('finalPhoto');
    finalPhoto.style.top = `${positionY}px`;
});

// Обновление текста
document.getElementById('lastName').addEventListener('input', function(event) {
    document.getElementById('finalLastName').textContent = event.target.value;
});

document.getElementById('firstName').addEventListener('input', function(event) {
    document.getElementById('finalFirstName').textContent = event.target.value;
});

document.getElementById('username').addEventListener('input', function(event) {
    document.getElementById('finalUsername').textContent = event.target.value;
});

// Функция для извлечения SVG из <symbol> и создания нового SVG элемента
function getSvgElementFromSymbol(symbolId, width, height) {
    const symbol = document.querySelector(`symbol#${symbolId}`);
    if (!symbol) {
        console.error(`Symbol with ID ${symbolId} not found`);
        return null;
    }

    const viewBox = symbol.getAttribute('viewBox') || '0 0 100 100';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', viewBox);

    // Копируем содержимое <symbol> в новый <svg>
    svg.innerHTML = symbol.innerHTML;
    return svg;
}

// Функция для конверсии SVG в изображение (для canvg 1.5)
function svgToImage(svgElement, width, height) {
    return new Promise((resolve) => {
        // Увеличиваем разрешение (например, 300 DPI)
        const scaleFactor = 4; // Увеличиваем в 4 раза для лучшего качества
        const canvas = document.createElement('canvas');
        canvas.width = width * scaleFactor;
        canvas.height = height * scaleFactor;

        const ctx = canvas.getContext('2d');
        ctx.scale(scaleFactor, scaleFactor);

        const svgString = new XMLSerializer().serializeToString(svgElement);
        canvg(canvas, svgString, {
            ignoreMouse: true,
            ignoreAnimation: true,
            renderCallback: () => {
                const imgData = canvas.toDataURL('image/png', 1.0); // Качество 1.0 для PNG
                resolve(imgData);
            }
        });
    });
}

// Функция ожидания загрузки изображений
function waitForImagesLoaded(img1, img2) {
    return new Promise((resolve) => {
        let loaded = 0;
        const checkLoaded = () => {
            if (loaded === 2) resolve();
        };
        img1.onload = () => { loaded++; checkLoaded(); };
        img2.onload = () => { loaded++; checkLoaded(); };
        if (img1.complete && img2.complete) {
            loaded = 2;
            resolve();
        }
    });
}

// Генерация PDF
async function generatePDF() {
    const element = document.getElementById('finalBadge');

// Извлечение SVG из <symbol>
const leftSvg = getSvgElementFromSymbol('logo-left', 55, 40);
const rightSvg = getSvgElementFromSymbol('logo-right', 40, 40);

if (!leftSvg || !rightSvg) {
    console.error('Failed to extract SVG from symbols');
    return;
}

// Конверсия SVG в изображения
const leftLogoImg = await svgToImage(leftSvg, 55, 40);
const rightLogoImg = await svgToImage(rightSvg, 40, 40);

// Временное добавление изображений в DOM
const tempLeftImg = document.createElement('img');
tempLeftImg.src = leftLogoImg;
tempLeftImg.style.width = '55px';
tempLeftImg.style.height = '40px';
const tempRightImg = document.createElement('img');
tempRightImg.src = rightLogoImg;
tempRightImg.style.width = '40px';
tempRightImg.style.height = '40px';

document.querySelector('#finalBadge .bottom-left').innerHTML = '';
document.querySelector('#finalBadge .bottom-right').innerHTML = '';
document.querySelector('#finalBadge .bottom-left').appendChild(tempLeftImg);
document.querySelector('#finalBadge .bottom-right').appendChild(tempRightImg);

// Ожидание загрузки изображений
await waitForImagesLoaded(tempLeftImg, tempRightImg);
console.log('Images loaded:', tempLeftImg.src, tempRightImg.src);

    html2canvas(element, {
        scale: 2,
        logging: true,
        useCORS: true,
        allowTaint: true
    }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [54, 85]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, 54, 85);
        pdf.save('badge.pdf');

        // Восстановление оригинальных SVG после генерации
        document.querySelector('#finalBadge .bottom-left').innerHTML = leftSvg.outerHTML;
        document.querySelector('#finalBadge .bottom-right').innerHTML = rightSvg.outerHTML;
    }).catch((error) => {
        console.error('Error generating PDF:', error);
    });
}

// Предпросмотр PDF
async function previewPDF() {
    const element = document.getElementById('finalBadge');

// Извлечение SVG из <symbol>
const leftSvg = getSvgElementFromSymbol('logo-left', 55, 40);
const rightSvg = getSvgElementFromSymbol('logo-right', 40, 40);

if (!leftSvg || !rightSvg) {
    console.error('Failed to extract SVG from symbols');
    return;
}

// Конверсия SVG в изображения
const leftLogoImg = await svgToImage(leftSvg, 55, 40);
const rightLogoImg = await svgToImage(rightSvg, 40, 40);

// Временное добавление изображений в DOM
const tempLeftImg = document.createElement('img');
tempLeftImg.src = leftLogoImg;
tempLeftImg.style.width = '55px';
tempLeftImg.style.height = '40px';
const tempRightImg = document.createElement('img');
tempRightImg.src = rightLogoImg;
tempRightImg.style.width = '40px';
tempRightImg.style.height = '40px';

document.querySelector('#finalBadge .bottom-left').innerHTML = '';
document.querySelector('#finalBadge .bottom-right').innerHTML = '';
document.querySelector('#finalBadge .bottom-left').appendChild(tempLeftImg);
document.querySelector('#finalBadge .bottom-right').appendChild(tempRightImg);

// Ожидание загрузки изображений
await waitForImagesLoaded(tempLeftImg, tempRightImg);
console.log('Images loaded:', tempLeftImg.src, tempRightImg.src);

    html2canvas(element, {
        scale: 2,
        logging: true,
        useCORS: true,
        allowTaint: true
    }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [54, 85]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, 54, 85);
        const pdfBlob = pdf.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        document.getElementById('pdfViewer').src = pdfUrl;
        document.getElementById('pdfPreview').style.display = 'block';

        // Восстановление оригинальных SVG после генерации
        document.querySelector('#finalBadge .bottom-left').innerHTML = leftSvg.outerHTML;
        document.querySelector('#finalBadge .bottom-right').innerHTML = rightSvg.outerHTML;
    }).catch((error) => {
        console.error('Error generating PDF:', error);
    });
}

// Закрыть предпросмотр
function closePreview() {
    document.getElementById('pdfPreview').style.display = 'none';
}