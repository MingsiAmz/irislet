import { resourceDir, join } from "@tauri-apps/api/path";
import { readTextFile, writeTextFile, exists, mkdir } from "@tauri-apps/plugin-fs";

const fileName = "path.json";

export async function getStorePath() {
    const dir = await resourceDir();
    return await join(dir, fileName);
}

export async function savePath(path) {
    const storePath = await getStorePath();

    let list = [];

    if (await exists(storePath)) {
        const raw = await readTextFile(storePath);
        try {
            list = JSON.parse(raw);
            if (!Array.isArray(list)) list = [];
        } catch {
            list = [];
        }
    }

    if (!list.includes(path)) {
        list.push(path);
        await writeTextFile(storePath, JSON.stringify(list, null, 2));
    }
}

export async function loadPath() {
    try {
        const storePath = await getStorePath();

        if (!(await exists(storePath))) return [];

        const raw = await readTextFile(storePath);
        const list = JSON.parse(raw);
        return Array.isArray(list) ? list : [];
    } catch {
        return [];
    }
}

export async function getFileNameWithoutExt() {
    let paths = await loadPath();
    let names = [];

    for (let path of paths) {
        let name = path.split(/[\\/]/).pop() || '';
        let index = name.lastIndexOf('.');
        if (index > 0) {
            names.push(name.slice(0, index));
        } else {
            names.push(name);
        }
    }
    return names;
}

export async function removePath(path) {
    let storePath = await getStorePath();
    let list = [];
    try {
        let raw = await readTextFile(storePath);
        list = JSON.parse(raw);
        if (!Array.isArray(list)) list = [];
    } catch {
        list = [];
    }
    list = list.filter(p => p !== path);
    await writeTextFile(storePath, JSON.stringify(list, null, 2));
}
