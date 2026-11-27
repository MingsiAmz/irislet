<script setup>
    import { open } from "@tauri-apps/plugin-dialog"
    import { readTextFile } from "@tauri-apps/plugin-fs"
    import {renderMarkdown, renderOrg} from './assets/render.js'
    import { ref, onMounted } from "vue"
    import { savePath, loadPath, getFileNameWithoutExt, removePath} from "./assets/save.js"
    import {resolveDark, applyTheme, toggleTheme} from "./assets/theme.js"
    import { invoke } from "@tauri-apps/api/core"
    import { listen } from "@tauri-apps/api/event"

    const content = ref("")
    const filePath = ref("")
    const fileNames = ref([])
    const theme = ref("system");

    async function openFile() {
        const selected = await open({
            multiple: false,
            directory: false,
            filters: [
                {name: "Markdown / Org", extensions: ["md", "markdown", "org"]},
            ],
        });

        if (!selected) return;

        const path = selected;
        filePath.value = path;
        await savePath(path);
        await refreshFileNames();
        await filterExt(path);
   }

    async function filterExt(path) {
     const text = await readTextFile(path);
        const ext = path.split('.').pop()?.toLowerCase();

        if (ext == 'org') {
            content.value = await renderOrg(text);
        } else {
            content.value = await renderMarkdown(text);
        }
    }

    async function refreshFileNames() {
        fileNames.value = await getFileNameWithoutExt();       
    }

    async function update(displayName) {
       let list = await loadPath();
       
       let target = list.find(p => {
            let n = p.split(/[\\/]/).pop() || "";
            return n === displayName || n.replace(/\.[^.]+$/, '') === displayName;
       })

       if (!target) {
            await refreshFileNames();
            return;
       }

        try {
            await filterExt(target);
        } catch {
            await removePath(target);
            await refreshFileNames();
        }
        
    }

    function onToggleTheme() {
        toggleTheme(theme);
    }

    onMounted(async () => {
        refreshFileNames();

        const saved = localStorage.getItem("theme");
        if (saved) theme.value = saved;
        applyTheme(theme);
        
        window.matchMedia("(prefers-color-scheme: dark)")
            .addEventListener("change", 
                () => {if (theme.value == "system") applyTheme(theme);
            });

        const opened = await invoke("take_opened_file");
        if (opened) await openPath(opened);

        await listen("opened-file", (e) => openPath(e.payload));
    })

</script>

<template>
    <div id="main">
        <div class="container">
            <div id="side-menu">
                <button @click="openFile">open file</button>
                <nav id="file-names" v-for="(name, i) in fileNames" @click="update(name)" :key="i">{{ name }}</nav>
                <button id="theme-toggle" class="theme-btn" @click="onToggleTheme"> 
                    <span v-if="theme == 'system'">A</span> 
                    <span v-else-if="theme == 'light'">☀</span>
                    <span v-else>☾</span>
                </button>
            </div>
            <div id="content" v-html="content"></div>  
        </div>
    </div>
</template>


<style scope>
:root {
  --bg:            #f6f7f9;
  --bg-elevated:   #ffffff;
  --bg-hover:      #eef1f5;
  --bg-active:     #e3e8ef;
  --text:          #1f2430;
  --text-muted:    #6b7280;
  --border:        #e2e6ec;
  --accent:        #4f6ef7;
  --accent-soft:   rgba(79, 110, 247, 0.12);
  --code-bg:       #f2f4f7;
  --sidebar-w:     240px;
  --radius:        10px;
  --shadow:        0 4px 20px rgba(0, 0, 0, 0.06);
  --font:          -apple-system, "Segoe UI", "PingFang SC",
                   "Microsoft YaHei", Roboto, sans-serif;
  --font-mono:     "JetBrains Mono", "Fira Code", Consolas, monospace;
}

[data-theme="dark"] {
  --bg:            #0f1115;
  --bg-elevated:   #171a21;
  --bg-hover:      #20242d;
  --bg-active:     #2a2f3a;
  --text:          #e6e8ec;
  --text-muted:    #9aa1ac;
  --border:        #262a33;
  --accent:        #6b8afd;
  --accent-soft:   rgba(107, 138, 253, 0.16);
  --code-bg:       #1b1e26;
  --shadow:        0 4px 24px rgba(0, 0, 0, 0.4);
}

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg:            #0f1115;
    --bg-elevated:   #171a21;
    --bg-hover:      #20242d;
    --bg-active:     #2a2f3a;
    --text:          #e6e8ec;
    --text-muted:    #9aa1ac;
    --border:        #262a33;
    --accent:        #6b8afd;
    --accent-soft:   rgba(107, 138, 253, 0.16);
    --code-bg:       #1b1e26;
    --shadow:        0 4px 24px rgba(0, 0, 0, 0.4);
  }
}

* { box-sizing: border-box; }

html, body, #app {
  height: 100%;
  margin: 0;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
  transition: background .25s ease, color .25s ease;
}

#main {
  display: flex;
  flex-direction: column;
  height: 100vh;
  padding: 16px;
  gap: 12px;
}

.container {
  flex: 1;
  display: flex;
  gap: 16px;
  min-height: 0;
}

#side-menu {
  width: var(--sidebar-w);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow-y: auto;
}

#side-menu button {
  appearance: none;
  border: none;
  cursor: pointer;
  padding: 9px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  background: var(--accent);
  transition: filter .15s ease, transform .1s ease;
}
#side-menu button:hover  { filter: brightness(1.08); }
#side-menu button:active { transform: scale(.98); }

#file-names {
  cursor: pointer;
  padding: 7px 10px;
  border-radius: 7px;
  font-size: 13px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: background .15s ease, color .15s ease;
}
#file-names:hover {
  background: var(--bg-hover);
  color: var(--text);
}
#file-names:active {
  background: var(--bg-active);
}

/* ============ 内容区 ============ */
#content {
  flex: 1;
  overflow-y: auto;
  padding: 32px 40px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  line-height: 1.75;
  font-size: 15px;
}

/* ============ Markdown / Org 排版 ============ */
#content h1,
#content h2,
#content h3,
#content h4 {
  line-height: 1.3;
  font-weight: 700;
  margin: 1.6em 0 .6em;
}
#content h1 { font-size: 1.9em; border-bottom: 1px solid var(--border); padding-bottom: .3em; }
#content h2 { font-size: 1.5em; border-bottom: 1px solid var(--border); padding-bottom: .25em; }
#content h3 { font-size: 1.25em; }
#content h4 { font-size: 1.05em; }

#content p  { margin: .8em 0; }
#content a  { color: var(--accent); text-decoration: none; }
#content a:hover { text-decoration: underline; }

#content ul,
#content ol { padding-left: 1.6em; margin: .6em 0; }
#content li { margin: .25em 0; }
#content li > p { margin: .2em 0; }

#content blockquote {
  margin: 1em 0;
  padding: .4em 1em;
  border-left: 4px solid var(--accent);
  background: var(--accent-soft);
  border-radius: 0 6px 6px 0;
  color: var(--text-muted);
}

#content code {
  font-family: var(--font-mono);
  font-size: .88em;
  background: var(--code-bg);
  padding: .15em .4em;
  border-radius: 5px;
}
#content pre {
  background: var(--code-bg);
  padding: 14px 16px;
  border-radius: 8px;
  overflow-x: auto;
  border: 1px solid var(--border);
}
#content pre code {
  background: none;
  padding: 0;
  font-size: .86em;
  line-height: 1.6;
}

#content img { max-width: 100%; border-radius: 8px; }
#content hr  { border: none; border-top: 1px solid var(--border); margin: 1.8em 0; }

#content table {
  border-collapse: collapse;
  margin: 1em 0;
  width: 100%;
  font-size: .95em;
}
#content th,
#content td {
  border: 1px solid var(--border);
  padding: 8px 12px;
  text-align: left;
}
#content th { background: var(--bg-hover); font-weight: 600; }
#content tr:nth-child(even) td { background: var(--bg-hover); }

/* Org 常见结构：标题层级 / TODO 标记 */
#content .todo,
#content span.todo { color: #e5484d; font-weight: 700; }
#content .done,
#content span.done { color: #30a46c; font-weight: 700; }

/* ============ 滚动条 ============ */
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 6px;
}
::-webkit-scrollbar-thumb:hover { background: var(--text-muted); }

#side-menu #theme-toggle { margin-top: auto; }

.theme-btn {
    position: fixed;
    left: 24px;
    bottom: 24px;
    z-index: 100;

    width: 40px;
    height: 40px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    font-size: 16px;
    line-height: 1;
    cursor: pointer;

    color: var(--text);
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: 50%;                       /* 圆形的关键 */
    box-shadow: var(--shadow);

    transition: transform .15s ease,
                background .15s ease,
                box-shadow .15s ease;
}

.theme-btn:hover {
    background: var(--bg-active);
    transform: scale(1.08) rotate(-10deg);
}

.theme-btn:active {
    transform: scale(.94);
}
</style>
