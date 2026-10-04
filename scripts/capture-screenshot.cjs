const { spawn } = require('child_process');
const fs = require('fs');

async function capture() {
  const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--window-size=1440,900',
    '--hide-scrollbars',
    '--enable-webgl',
    '--ignore-gpu-blocklist',
    '--use-gl=angle',
    'http://localhost:5173'
  ]);

  try {
    // Wait for Chrome to bind port
    await new Promise(r => setTimeout(r, 1500));

    const listRes = await fetch('http://127.0.0.1:9222/json');
    const tabs = await listRes.json();
    const appTab = tabs.find(t => t.url.includes('localhost:5173'));
    if (!appTab) throw new Error('App tab not found');

    const ws = new WebSocket(appTab.webSocketDebuggerUrl);
    await new Promise((resolve, reject) => {
      ws.onopen = resolve;
      ws.onerror = reject;
    });

    let msgId = 1;
    function sendCommand(method, params = {}) {
      return new Promise((resolve, reject) => {
        const id = msgId++;
        const handler = (evt) => {
          const res = JSON.parse(evt.data);
          if (res.id === id) {
            ws.removeEventListener('message', handler);
            if (res.error) reject(res.error);
            else resolve(res.result);
          }
        };
        ws.addEventListener('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    // Inspect DOM element rect
    const evalRes = await sendCommand('Runtime.evaluate', {
      expression: `(() => {
        const el = document.querySelector('.hero-badge-target-placeholder');
        const r = el ? el.getBoundingClientRect() : null;
        return {
          placeholder: r ? { width: r.width, height: r.height, top: r.top, left: r.left } : null,
          windowW: window.innerWidth,
          windowH: window.innerHeight
        };
      })()`,
      returnByValue: true
    });
    console.log('DOM Evaluation:', JSON.stringify(evalRes.result.value, null, 2));

    // Wait for WebGL render & physics settle
    await new Promise(r => setTimeout(r, 3500));

    const screenshotRes = await sendCommand('Page.captureScreenshot', {
      format: 'png',
      fromSurface: true
    });

    const targetPath = 'C:/Users/adhir/.gemini/antigravity/brain/72c5ef1f-7b71-454b-835d-aedcdc3057e9/verify_1440.png';
    fs.writeFileSync(targetPath, Buffer.from(screenshotRes.data, 'base64'));
    console.log('Saved screenshot to:', targetPath);

    ws.close();
  } finally {
    chrome.kill();
  }
}

capture().catch(console.error);
