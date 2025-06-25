// app.js

let port, reader, inputDone, outputDone, inputStream, outputStream;
const consoleEl = document.getElementById("console");
const connectBtn = document.getElementById("connectBtn");
const clearBtn = document.getElementById("clearBtn");
const commandInput = document.getElementById("commandInput");
const inputForm = document.getElementById("inputForm");

function logToConsole(data) {
  consoleEl.textContent += data;
  consoleEl.scrollTop = consoleEl.scrollHeight;
}

connectBtn.addEventListener("click", async () => {
  try {
    port = await navigator.serial.requestPort();
    await port.open({ baudRate: 115200 });

    const encoder = new TextEncoderStream();
    outputDone = encoder.readable.pipeTo(port.writable);
    outputStream = encoder.writable;

    const decoder = new TextDecoderStream();
    inputDone = port.readable.pipeTo(decoder.writable);
    inputStream = decoder.readable;

    reader = inputStream.getReader();
    readLoop();

    logToConsole("[Connected to Flipper Zero]\n");
  } catch (err) {
    console.error("Connection failed", err);
    alert("Could not connect to device.");
  }
});

clearBtn.addEventListener("click", () => {
  consoleEl.textContent = "";
});

inputForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const command = commandInput.value + "\r\n";
  commandInput.value = "";
  logToConsole("> " + command);
  const writer = outputStream.getWriter();
  await writer.write(command);
  writer.releaseLock();
});

async function readLoop() {
  while (true) {
    const { value, done } = await reader.read();
    if (done) {
      console.log("[Reader closed]");
      break;
    }
    if (value) {
      logToConsole(value);
    }
  }
}
