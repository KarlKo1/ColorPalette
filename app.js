// GLOBAL SELECTIONS AND VARIABLES
const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll("input[type=range]");
const currentHexes = document.querySelectorAll(".color h2");
const popup = document.querySelector(".copy-container");
const adjustBtns = document.querySelectorAll(".adjust");
const closeAdjustBtns = document.querySelectorAll(".close-adjustment");
const sliderContainers = document.querySelectorAll(".sliders");
const lockButtons = document.querySelectorAll(".lock");
let initialColors;

//EVENT LISTENERS
generateBtn.addEventListener("click", randomColors);

sliders.forEach((slider) => {
  slider.addEventListener("input", hslControls);
});
colorDivs.forEach((div, index) => {
  div.addEventListener("change", () => {
    updateTextUI(index);
  });
});

currentHexes.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClipboard(hex);
  });
});

popup.addEventListener("transitionend", () => {
  const popupBox = popup.children[0];
  popup.classList.remove("active");
  popupBox.classList.remove("active");
});

adjustBtns.forEach((button, index) => {
  button.addEventListener("click", () => {
    openAdjustmentPanel(index);
  });
});

closeAdjustBtns.forEach((button, index) => {
  button.addEventListener("click", () => {
    closeAdjustmentPanel(index);
  });
});

lockButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    addLock(index);
  });
});

// FUNCTIONS

//Color generator
function generateHex() {
  const hexColor = chroma.random();
  return hexColor;
}

function randomColors() {
  //Initial colors
  initialColors = [];
  colorDivs.forEach((div) => {
    const hexText = div.children[0];
    const randomColor = generateHex();
    //Add initial colors to the array
    if (div.classList.contains("lock")) {
      initialColors.push(hexText.innerText);
      return;
    } else {
      initialColors.push(chroma(randomColor).hex());
    }
    //Add color to the background
    div.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;
    //Check for contrast
    checkTextContrast(randomColor, hexText);
    //Initialize colorize sliders
    const color = chroma(randomColor);
    const sliders = div.querySelectorAll(".sliders input");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorizeAndResetSliders(color, hue, brightness, saturation);
  });
  resetSliders();
  //Check For Button Contrast
  adjustBtns.forEach((index) => {
    checkTextContrast(initialColors[index], adjustBtns[index]);
    checkTextContrast(initialColors[index], lockButtons[index]);
  });
}

function checkTextContrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}

function colorizeAndResetSliders(color, hue, brightness, saturation) {
  //Scale saturation
  const noSat = color.set("hsl.s", 0);
  const fullSat = color.set("hsl.s", 1);
  const scaleSat = chroma.scale([noSat, color, fullSat]);
  //Scale brightness
  const midBright = color.set("hsl.l", 0.5);
  const scaleBright = chroma.scale(["black", midBright, "white"]);

  //Update input colors
  saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(
    0
  )}, ${scaleSat(1)})`;
  brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(
    0
  )}, ${scaleBright(0.5)}, ${scaleBright(1)})`;
  hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75), rgb(204,204,75), rgb(75,204,75), rgb(75,204,204), rgb(75,75,204), rgb(204,75,204), rgb(204,75,75))`;

  //Reset input colors
  saturation.value = color.hsl()[1];
  brightness.value = color.hsl()[2];
  hue.value = color.hsl()[0];
}

function hslControls(e) {
  const index =
    e.target.getAttribute("data-brightness") ||
    e.target.getAttribute("data-saturation") ||
    e.target.getAttribute("data-hue");

  let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  const bgColor = initialColors[index];

  let color = chroma(bgColor)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);

  colorDivs[index].style.backgroundColor = color;
  colorizeAndResetSliders(color, hue, brightness, saturation);
}

function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const textHex = activeDiv.querySelector("h2");
  const icons = activeDiv.querySelectorAll(".controls button");
  textHex.innerText = color.hex();
  //Check contrast
  checkTextContrast(color, textHex);
  for (icon of icons) {
    checkTextContrast(color, icon);
  }
}

function resetSliders() {
  sliders.forEach((slider) => {
    const color = initialColors[slider.getAttribute(`data-${slider.name}`)],
      hueValue = chroma(color).hsl()[0].toFixed(2),
      saturationValue = chroma(color).hsl()[1].toFixed(2),
      brightnessValue = chroma(color).hsl()[2].toFixed(2);

    switch (slider.name) {
      case "hue":
        slider.value = hueValue;
        break;
      case "brightness":
        slider.value = brightnessValue;
        break;
      case "saturation":
        slider.value = saturationValue;
        break;
    }
  });
}

function copyToClipboard(hex) {
  navigator.clipboard.writeText(hex.innerText);
  const popupBox = popup.children[0];
  popup.classList.add("active");
  popupBox.classList.add("active");
}

function openAdjustmentPanel(index) {
  sliderContainers[index].classList.toggle("active");
}

function closeAdjustmentPanel(index) {
  sliderContainers[index].classList.remove("active");
}

function addLock(index) {
  colorDivs[index].classList.toggle("locked");
  lockButtons[index].children[0].classList.toggle("fa-lock");
  lockButtons[index].children[0].classList.toggle("fa-lock-open");
}

randomColors();
