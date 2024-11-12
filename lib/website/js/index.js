const ioState = {
  switches: [],
  hexDisplays: [],
};

const host = window.__dtekv__.host;

const events = {
  ready: async () => {
    await fetch(`${host}/gui/events/ready`);
  },
  load: async () => {
    await fetch(`${host}/gui/events/load`);
  },
  openLinkInBrowser: async (url) => {
    const params = new URLSearchParams();
    params.append("url", url);
    await fetch(`${host}/gui/events/open-link-in-browser?${params.toString()}`);
  },
  reset: async () => {
    await fetch(`${host}/gui/events/reset`);
  },
  button: {
    pressed: async () => {
      await fetch(`${host}/gui/events/button/pressed`);
    },
    released: async () => {
      await fetch(`${host}/gui/events/button/released`);
    },
  },
  switch: {
    toggle: async (index, on) => {
      await fetch(
        `${host}/gui/events/switch/toggle?index=${index}&on=${on ? "true" : "false"
        }`,
      );
    },
  },
  vga: {
    update: async () => {
      const res = await fetch(`${host}/gui/events/vga/update`);
      const pngData = await res.blob();
      return URL.createObjectURL(pngData);
    },
  },
};

// ======================== Hex Display ========================
class HexDisplay {
  constructor() {
    this.element = document.createElement("div");
    this.element.classList.add("hex-display");
    for (let i = 0; i < 8; i++) {
      const segment = document.createElement("div");
      segment.className = "hex-segment off";
      this.element.appendChild(segment);
    }
    this.lastValue = 0xff;
    this.value = 0;
  }

  setValue(value) {
    this.value = value;
    this.render();
  }

  render() {
    const segments = this.element.children;
    for (let i = 0; i < 8; i++) {
      const lastOff = (this.lastValue >> i) & 1;
      const off = (this.value >> i) & 1;
      if (lastOff !== off) {
        if (off) {
          segments[i].classList.add("off");
          segments[i].classList.remove("on");
        } else {
          segments[i].classList.add("on");
          segments[i].classList.remove("off");
        }
      }
    }
    this.lastValue = this.value;
  }

  attach(parent) {
    parent.appendChild(this.element);
  }
}

function hexDisplayInit() {
  const hexDisplays = document.getElementById("hex-displays");
  for (let i = 0; i < 6; i++) {
    const hexDisplay = new HexDisplay();
    ioState.hexDisplays.push(hexDisplay);
    hexDisplay.attach(hexDisplays);
  }
}

// ===================== UART =====================
const textarea = document.getElementById("uart");
function printToUart(text) {
  textarea.value += text;
  if (textarea.scrollTop >= textarea.scrollHeight - textarea.clientHeight - 50)
    textarea.scrollTop = textarea.scrollHeight;
}

// ======================== Switches ========================

class Switch {
  constructor(index) {
    this.index = index;
    this.element = document.createElement("div");
    this.element.classList.add("switch");
    this.element.innerHTML = "<div><div></div></div>";
    this.on = false;

    this.down = false;
    this.element.addEventListener("mousedown", () => {
      if (!this.down) {
        this.down = true;
        this.toggle();
      }
    });
    document.addEventListener("mouseup", () => {
      if (this.down) {
        this.down = false;
      }
    });
  }

  toggle() {
    this.on = !this.on;
    events.switch.toggle(this.index, this.on);
    this.render();
  }

  render() {
    this.element.classList.toggle("on", this.on);
  }

  attach(parent) {
    parent.appendChild(this.element);
  }
}

function switchesInit() {
  const switches = document.querySelector(".switches");

  for (let i = 0; i < 10; i++) {
    const sw = new Switch(9 - i);
    sw.attach(switches);
    ioState.switches.push(sw);
  }
}

// ======================== Button ========================
function buttonInit() {
  const button = document.querySelector(".button");
  let isDown = false;
  button.addEventListener("mousedown", () => {
    if (!isDown) {
      isDown = true;
      events.button.pressed();
    }
  });
  button.addEventListener("mouseleave", () => {
    if (isDown) {
      isDown = false;
      events.button.released();
    }
  });
  button.addEventListener("mouseup", () => {
    if (isDown) {
      isDown = false;
      events.button.released();
    }
  });
}

// ======================== VGA ========================
function vgaInit() {
  const vgaOuter = document.querySelector(".vga-outer");
  const vgaInner = document.querySelector(".vga-inner");
  const img = vgaInner.querySelector("img");

  const update = () => {
    let { height, width } = vgaOuter.getBoundingClientRect();

    let newWidth = 320;
    let newHeight = 240;
    let i = 1;

    while (width > newWidth && height > newHeight) {
      i++;
      newWidth = 320 * i;
      newHeight = 240 * i;
    }
    i--;
    newWidth = 320 * i;
    newHeight = 240 * i;

    vgaInner.style.width = `${newWidth}px`;
    vgaInner.style.height = `${newHeight}px`;
  };

  update();
  window.addEventListener("resize", update);
  document.addEventListener("DOMContentLoaded", update);
  window.addEventListener("load", update);

  (async () => {
    while (1) {
      if (window.__dtekv__.vgaHasUpdate) {
        window.__dtekv__.vgaHasUpdate = false;
        const data = await events.vga.update();
        img.src = data;
      }
      await new Promise((resolve) => setTimeout(resolve, 33));
    }
  })();
}

function menuBarInit() {
  const menuBar = document.querySelector(".d");
  const loadButton = menuBar.querySelector("#load");
  const resetButton = menuBar.querySelector("#reset");
  const helpButton = menuBar.querySelector("#help");

  loadButton.addEventListener("click", async () => {
    await events.load();
  });

  resetButton.addEventListener("click", async () => {
    await events.reset();
  });

  helpButton.addEventListener("click", async () => {
    await events.openLinkInBrowser("https://google.com");
  });
}

// Init
hexDisplayInit();
switchesInit();
buttonInit();
vgaInit();
menuBarInit();

// Expose to the window
window.__dtekv__.uartWrite = (data) => {
  printToUart(data);
};
window.__dtekv__.updateHexDisplays = (hexDisplayValues) => {
  for (let i = 0; i < 6; i++) {
    ioState.hexDisplays[i].setValue(hexDisplayValues[5 - i]);
  }
};
window.__dtekv__.updateVga = () => {
  window.__dtekv__.vgaHasUpdate = true;
};

// Ready
events.ready();
