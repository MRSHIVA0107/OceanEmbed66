const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');

async function captureMap() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9231',
    '--window-size=1280,1024',
    '--disable-gpu',
    'http://localhost:8080/#demo'
  ]);

  await new Promise(r => setTimeout(r, 2000));

  http.get('http://127.0.0.1:9231/json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', async () => {
      const tabs = JSON.parse(data);
      const page = tabs.find(t => t.type === 'page' && t.url.includes('localhost:8080'));
      if (!page) { chrome.kill(); return; }

      const ws = new WebSocket(page.webSocketDebuggerUrl);
      ws.onopen = () => {
        let msgId = 1;
        function send(method, params = {}) {
          ws.send(JSON.stringify({ id: msgId++, method, params }));
        }

        send('Runtime.enable');
        send('Page.enable');

        // Step 1: Select TCHP layer and scroll map into view
        setTimeout(() => {
          send('Runtime.evaluate', {
            expression: `(function() {
              const el = document.getElementById("secMap");
              if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
              const tchpBtn = document.querySelector('[data-layer="tchp"]');
              if (tchpBtn) tchpBtn.click();
              return "clicked tchp";
            })()`,
            returnByValue: true
          });
        }, 1500);

        // Capture August TCHP
        setTimeout(() => {
          send('Page.captureScreenshot', { format: 'png' });
        }, 3200);

        // Step 2: Trigger December Prediction and capture December TCHP
        setTimeout(() => {
          send('Runtime.evaluate', {
            expression: `(function() {
              if (window.setPredictionState) {
                window.setPredictionState("2026-12-08");
              } else {
                const btn = document.getElementById("btnModePrediction");
                if (btn) btn.click();
              }
              const tchpBtn = document.querySelector('[data-layer="tchp"]');
              if (tchpBtn) tchpBtn.click();
              const el = document.getElementById("secMap");
              if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
              return "triggered december";
            })()`,
            returnByValue: true
          });
        }, 4500);

        // Capture December TCHP
        setTimeout(() => {
          send('Page.captureScreenshot', { format: 'png' });
        }, 6500);
      };

      let shotCount = 0;
      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.result && msg.result.data) {
          shotCount++;
          const buf = Buffer.from(msg.result.data, 'base64');
          if (shotCount === 1) {
            fs.writeFileSync('C:/Users/DELL/.gemini/antigravity/scratch/oceanembed/map_tchp_render.png', buf);
            console.log('Saved map_tchp_render.png (' + buf.length + ' bytes)');
          } else if (shotCount === 2) {
            fs.writeFileSync('C:/Users/DELL/.gemini/antigravity/scratch/oceanembed/map_december_tchp_render.png', buf);
            console.log('Saved map_december_tchp_render.png (' + buf.length + ' bytes)');
            ws.close();
            chrome.kill();
            process.exit(0);
          }
        }
      };
    });
  });
}

captureMap();
