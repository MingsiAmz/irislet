import { readTextFile } from '@tauri-apps/plugin-dialog'
import { renderContent } from "./parsers";

document.getElementById('openfile').addEventListener('click', async () => {
    let filePath = await open({
        multiple: false,
        filters: [{
            name: 'Org/Markdown', extensions: ['org', 'md', 'markdown'],
        }]
    });

    if (!filePath)
        return;

    let ctx = await readTextFile(filePath);
    let ext = ctx.splie('.').pop().toLowerCase();

    
});

