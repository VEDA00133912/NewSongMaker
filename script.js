const canvas = document.getElementById("taikoCanvas");
const ctx = canvas.getContext("2d");

const baseImage = new Image();
baseImage.src = "images/base.png";

let fontLoaded = false;
let fontsAvailable = [];
const fontDatas = [
  ["FOT", "fonts/fot.otf"],
  ["Kukde", "fonts/Kukde.otf"]
];

Promise.all(fontDatas.map(([name, url]) =>
  new FontFace(name, `url(${url})`).load()
    .then(loaded => {
      document.fonts.add(loaded);
      return name;
    })
    .catch(() => null)
)).then(loadedFonts => {
  fontsAvailable = loadedFonts.filter(name => name !== null);
  fontLoaded = true;
}).catch(() => {
  alert("フォントの読み込みに失敗しました");
});

function createVerticalGradient(y, height, colorTop, colorBottom) {
  const gradient = ctx.createLinearGradient(0, y - height / 2, 0, y + height / 2);
  gradient.addColorStop(0, colorTop);
  gradient.addColorStop(1, colorBottom);
  return gradient;
}

function drawGradientStrokeText(text, x, y, fontSize, colorTop, colorBottom, maxWidth = 781) {
  const fontFamily = fontsAvailable.length > 0
    ? fontsAvailable.map(f => `'${f}'`).join(', ')
    : "sans-serif";

  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.lineJoin = "miter";
  ctx.miterLimit = 1;

  const lines = text.split('\n');
  const lineSpacing = fontSize + 10;

  lines.forEach((lineText, i) => {
    const textWidth = ctx.measureText(lineText).width;
    const scaleX = textWidth > maxWidth ? maxWidth / textWidth : 1;

    ctx.save();
    ctx.translate(x, y + i * lineSpacing);
    ctx.scale(scaleX, 1);

    const gradient = createVerticalGradient(0, fontSize, colorTop, colorBottom);

    ctx.shadowColor = "rgba(50, 50, 50, 0.6)";
    ctx.shadowOffsetX = 4;
    ctx.shadowOffsetY = 3;
    ctx.shadowBlur = 0;
    ctx.lineWidth = 11;
    ctx.strokeStyle = gradient;
    ctx.strokeText(lineText, 0, 0);

    ctx.shadowColor = "transparent";
    ctx.fillStyle = "white";
    ctx.fillText(lineText, 0, 0);

    ctx.restore();
  });
}

function draw(mainText, subText) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);

  drawGradientStrokeText(mainText, canvas.width / 2, canvas.height / 2 - 5, 60, "#444481", "#272859");
  drawGradientStrokeText(subText, canvas.width / 2, canvas.height / 2 + 80, 30, "#a4345d", "#6b355c");
}

function generateImage() {
  const mainText = document.getElementById("mainText").value;
  const subText = document.getElementById("subText").value;

  const downloadButton = document.getElementById("downloadButton");

  if (!mainText.trim()) {
    alert("曲名を入力してください");
    return;
  }

  if (!subText.trim()) {
    alert("アーティスト名を入力してください");
    return;
  }

  if (!fontLoaded) {
    alert("フォントを読み込み中です");
    return;
  }

  if (baseImage.complete) {
    draw(mainText, subText);
    downloadButton.disabled = false;
  } else {
    baseImage.onload = () => {
      draw(mainText, subText);
      downloadButton.disabled = false;
    };
  }
}

function downloadImage() {
  const downloadButton = document.getElementById("downloadButton");

  if (downloadButton.disabled) {
    alert("画像を生成してから保存してください");
    return;
  }

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "taiko.png";
  link.click();
}
