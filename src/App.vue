<script setup>
    import { open } from "@tauri-apps/plugin-dialog"
    import { readTextFile } from "@tauri-apps/plugin-fs"
    import {renderMarkdown, renderOrg} from './assets/render.js'
    import { ref, onMounted } from "vue"
    import { savePath, loadPath, getFileNameWithoutExt, removePath} from "./assets/save.js"

    const content = ref("")
    const filePath = ref("")
    const fileNames = ref([])

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
    
    onMounted(() => {
        refreshFileNames();
    })
</script>

<template>
    <div id="main">
        <div class="tags">

        </div>
        <div class="container">
            <div id="side-menu">
                <button @click="openFile">open file</button>
                <nav id="file-names" v-for="(name, i) in fileNames" @click="update(name)" :key="i">{{ name }}</nav>
            </div>
            <div id="content" v-html="content">
            </div>  
        </div>
    </div>
</template>
