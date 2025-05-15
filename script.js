const canvas = document.getElementById('taikoCanvas');
const ctx = canvas.getContext('2d');

const baseImage = new Image();
baseImage.src = 'images/base.png';

let fontsAvailable = [];
const fontDatas = [
  ['FOT', 'fonts/fot.otf'],
  ['Kukde', 'fonts/Kukde.otf']
];

const fontLoadPromise = Promise.all(
  fontDatas.map(([name, url]) =>
    new FontFace(name, `url(${url})`).load()
      .then(loaded => {
        document.fonts.add(loaded);
        return name;
      })
      .catch(() => null)
  )
).then(loadedFonts => {
  fontsAvailable = loadedFonts.filter(name => name !== null);
}).catch(() => {
  alert('フォントの読み込みに失敗しました');
});

let baseImageLoaded = false;
baseImage.onload = () => {
  baseImageLoaded = true;
};

function createVerticalGradient(y, height, colorTop, colorBottom) {
  const gradient = ctx.createLinearGradient(0, y - height / 2, 0, y + height / 2);
  gradient.addColorStop(0, colorTop);
  gradient.addColorStop(1, colorBottom);
  return gradient;
}

function drawTextLine(text, x, y, fontSize, gradient, maxWidth) {
  const textWidth = ctx.measureText(text).width;
  const scaleX = textWidth > maxWidth ? maxWidth / textWidth : 1;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scaleX, 1);

  ctx.shadowColor = 'rgba(50, 50, 50, 0.6)';
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 4;
  ctx.shadowBlur = 1;
  ctx.lineWidth = 13;
  ctx.strokeStyle = gradient;
  ctx.strokeText(text, 0, 0);

  ctx.shadowColor = 'transparent';
  ctx.fillStyle = 'white';
  ctx.fillText(text, 0, 0);

  ctx.restore();
}

function drawGradientStrokeText(text, x, y, fontSize, colorTop, colorBottom, maxWidth = 1100) {
  const fontFamily = fontsAvailable.length > 0
    ? fontsAvailable.map(f => `'${f}'`).join(', ') + ', sans-serif, serif'
    : 'sans-serif, serif';

  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.miterLimit = 1;

  const lines = text.split('\n');
  const lineSpacing = fontSize + 12;

  const gradient = createVerticalGradient(0, fontSize, colorTop, colorBottom);

  lines.forEach((lineText, i) => {
    drawTextLine(lineText, x, y + i * lineSpacing, fontSize, gradient, maxWidth);
  });
}

function draw(mainText, subText) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

  drawGradientStrokeText(mainText, canvas.width / 2, canvas.height / 2 - 10, 80, '#444481', '#272859');
  drawGradientStrokeText(subText, canvas.width / 2, canvas.height / 2 + 100, 40, '#a4345d', '#6b355c');
}

function generateImage() {
  const mainText = document.getElementById('mainText').value;
  const subText = document.getElementById('subText').value;
  const downloadButton = document.getElementById('downloadButton');

  if (!mainText.trim()) {
    alert('曲名を入力してください');
    return;
  }

  if (!subText.trim()) {
    alert('アーティスト名を入力してください');
    return;
  }

  fontLoadPromise.then(() => {
    if (baseImage.complete && baseImageLoaded) {
      draw(mainText, subText);
      downloadButton.disabled = false;
    } else {
      baseImage.onload = () => {
        baseImageLoaded = true;
        draw(mainText, subText);
        downloadButton.disabled = false;
      };
    }
  }).catch(() => {
    alert('フォントを読み込み中にエラーが発生しました');
  });
}

function downloadImage() {
  const downloadButton = document.getElementById('downloadButton');

  if (downloadButton.disabled) {
    alert('画像を生成してから保存してください');
    return;
  }

  const mainText = document.getElementById('mainText').value;
  const sanitizedFileName = mainText.trim().replace(/\s+/g, '_').replace(/[^\w\-]/g, '');
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = `${sanitizedFileName || 'taiko'}.png`;
  link.click();
}
