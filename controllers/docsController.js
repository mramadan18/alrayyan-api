const fs = require("fs");
const path = require("path");

async function renderDocs(req, res) {
  try {
    const mdPath = path.join(__dirname, "../API-Documentation.md");
    const markdown = fs.readFileSync(mdPath, "utf8");

    // Using simple quotes for the HTML to avoid backtick nesting confusion
    const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title> Al-Rayyan API | Playground </title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Tajawal:wght@300;400;700&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <style>
        :root {
            --primary: #10b981;
            --primary-dark: #059669;
            --bg: #0b0f1a;
            --card: #161b2e;
            --text: #f1f5f9;
            --text-muted: #94a3b8;
            --accent: #f59e0b;
            --glass: rgba(22, 27, 46, 0.8);
            --border: rgba(255, 255, 255, 0.08);
            --code-bg: #011627;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Tajawal', 'Outfit', sans-serif;
            background-color: var(--bg);
            color: var(--text);
            line-height: 1.6;
            overflow-x: hidden;
        }

        .bg-glow {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%; z-index: -1;
            background: 
                radial-gradient(circle at 10% 20%, rgba(16, 185, 129, 0.12) 0%, transparent 40%),
                radial-gradient(circle at 90% 80%, rgba(245, 158, 11, 0.08) 0%, transparent 40%);
        }

        main { max-width: 1100px; margin: 0 auto; padding: 2rem 1.5rem; }

        header {
            text-align: center; padding: 5rem 2rem; border-radius: 40px; border: 1px solid var(--border);
            margin-bottom: 4rem; position: relative; overflow: hidden;
        }

        .logo {
            font-size: 3rem; font-weight: 800;
            background: linear-gradient(135deg, #fff 30%, var(--primary) 100%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            margin-bottom: 1rem;
        }

        .playground {
            background: var(--card); border-radius: 30px; border: 1px solid var(--border);
            padding: 3rem; margin-bottom: 5rem; box-shadow: 0 30px 60px rgba(0,0,0,0.4);
        }

        .playground-title {
            font-size: 1.8rem; font-weight: 700; margin-bottom: 2rem;
            display: flex; align-items: center; gap: 15px; color: var(--primary);
        }

        .input-grid {
            display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem; margin-bottom: 2rem;
        }

        .input-group { display: flex; flex-direction: column; gap: 8px; }
        .input-group label { font-size: 0.9rem; color: var(--text-muted); font-weight: 600; }

        input, select {
            background: rgba(0,0,0,0.3); border: 1px solid var(--border);
            padding: 12px 18px; border-radius: 12px; color: white;
            transition: all 0.3s ease; outline: none;
        }

        input:focus, select:focus { border-color: var(--primary); box-shadow: 0 0 15px rgba(16, 185, 129, 0.2); }

        .btn-execute {
            background: var(--primary); color: white; border: none; padding: 16px 40px;
            border-radius: 15px; font-weight: 700; cursor: pointer; width: 100%;
            transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 10px;
        }

        .btn-execute:hover { background: var(--primary-dark); transform: scale(1.01); }

        .request-url-box {
            margin-top: 2rem; padding: 1.5rem; background: rgba(0,0,0,0.2);
            border-radius: 15px; border: 1px dashed var(--border);
        }

        .response-window {
            margin-top: 2rem; background: var(--code-bg); border-radius: 20px;
            border: 1px solid #1e293b; overflow: hidden; display: none;
            flex-direction: column; box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        }

        .response-header {
            background: #1e293b; padding: 12px 20px;
            display: flex; justify-content: space-between; align-items: center;
            font-size: 0.8rem; color: var(--text-muted);
        }

        pre#response-json {
            padding: 2rem; margin: 0; font-family: 'Fira Code', monospace;
            font-size: 0.95rem; color: #addbff; max-height: 500px;
            overflow-y: auto; direction: ltr; text-align: left;
        }

        .docs-section {
            background: var(--glass); padding: 4rem; border-radius: 30px;
            border: 1px solid var(--border); margin-top: 3rem;
        }

        .docs-content h2 { color: var(--primary); margin: 3rem 0 1rem; border-bottom: 1px solid var(--border); }
        .get-badge { background: #10b981; color: white; padding: 2px 10px; border-radius: 6px; margin-left:10px; }
        
        @media (max-width: 768px) { .playground, .docs-section { padding: 1.5rem; } }
    </style>
</head>
<body>
    <div class="bg-glow"></div>
    <main>
        <header>
            <div class="logo">الريان <span>API</span></div>
            <p style="opacity: 0.7;">أقوى محرك لمواقيت الصلاة | صُمم للمطورين</p>
        </header>

        <section class="playground">
            <div class="playground-title">تفاعلية الـ API (Live Test)</div>
            <div class="input-grid">
                <div class="input-group">
                    <label>المدينة</label>
                    <input type="text" id="p-city" placeholder="مثال: Cairo">
                </div>
                <div class="input-group">
                    <label>الدولة</label>
                    <input type="text" id="p-country" placeholder="مثال: Egypt">
                </div>
                <div class="input-group">
                    <label>خط العرض</label>
                    <input type="number" id="p-lat" placeholder="30.044">
                </div>
                <div class="input-group">
                    <label>خط الطول</label>
                    <input type="number" id="p-lon" placeholder="31.235">
                </div>
                <div class="input-group">
                    <label>طريقة الحساب</label>
                    <select id="p-method">
                        <option value="EGYPT">الهيئة المصرية</option>
                        <option value="UMM_AL_QURA">أم القرى</option>
                        <option value="MWL">رابطة العالم الإسلامي</option>
                    </select>
                </div>
                <div class="input-group">
                    <label>المذهب</label>
                    <select id="p-madhab">
                        <option value="SHAFI">الشافعي</option>
                        <option value="HANAFI">الحنفي</option>
                    </select>
                </div>
            </div>

            <button class="btn-execute" onclick="executeTest()">تشغيل الطلب</button>

            <div id="request-box" class="request-url-box" style="display: none;">
                <div style="font-size: 0.75rem; color: var(--accent); margin-bottom: 8px;">REQUESTING:</div>
                <code id="display-url" style="color: var(--text-muted); word-break: break-all;"></code>
            </div>

            <div class="response-window" id="resp-win">
                <div class="response-header">
                    <div id="status-badge" style="font-weight: 800;">READY</div>
                    <div>RESPONSE JSON</div>
                </div>
                <pre id="response-json"></pre>
            </div>
        </section>

        <section class="docs-section">
            <div id="md-content" class="docs-content"></div>
        </section>

        <footer style="text-align: center; padding: 5rem 0; opacity: 0.5;">
            <p>© 2026 Al-Rayyan Dev Team</p>
        </footer>
    </main>

    <script id="md-source" type="text/markdown">${markdown}</script>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const md = document.getElementById('md-source').textContent;
            document.getElementById('md-content').innerHTML = marked.parse(md);
            document.querySelectorAll('code').forEach(el => {
                if (el.textContent === 'GET') el.outerHTML = '<span class="get-badge">GET</span>';
            });
        });

        async function executeTest() {
            const params = new URLSearchParams();
            ['city', 'country', 'lat', 'lon', 'method', 'madhab'].forEach(id => {
                const val = document.getElementById('p-' + id).value;
                if (val) params.append(id, val);
            });

            const fullUrl = '/api/v1/prayer-times?' + params.toString();
            document.getElementById('request-box').style.display = 'block';
            document.getElementById('display-url').textContent = window.location.origin + fullUrl;
            
            const display = document.getElementById('resp-win');
            const code = document.getElementById('response-json');
            const badge = document.getElementById('status-badge');

            display.style.display = 'flex';
            code.textContent = '...Loading...';

            try {
                const start = performance.now();
                const res = await fetch(fullUrl);
                const end = performance.now();
                const data = await res.json();
                
                badge.textContent = 'STATUS: ' + res.status + ' ' + res.statusText + ' (' + Math.round(end - start) + 'ms)';
                badge.style.color = res.ok ? '#10b981' : '#ff5f56';
                code.textContent = JSON.stringify(data, null, 2);
                display.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } catch (err) {
                badge.textContent = 'CONNECTION ERROR';
                code.textContent = 'Failed to reach API server.';
            }
        }
    </script>
</body>
</html>
        `;
    res.send(html);
  } catch (error) {
    console.error("Docs error:", error.message);
    res.status(500).send("Error");
  }
}

module.exports = { renderDocs };
