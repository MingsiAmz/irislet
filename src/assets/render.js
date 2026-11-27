import quikdown from "quikdown";
import { unified } from "unified";
import parseOrg from "uniorg-parse";
import uniorg2rehype from "uniorg-rehype";
import stringify from "rehype-stringify";

export function renderMarkdown(source) {
    return quikdown(source);
}

export async function renderOrg(source) {
    const porg = unified().use(parseOrg).use(uniorg2rehype).use(stringify);
    const file = await porg.process(source);
    return String(file);
}
