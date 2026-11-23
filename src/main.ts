import quikdown from 'quikdown';
import { unified } from 'unified';
import parseOrg from 'uniorg-parse';
import uniorg2rehype from 'uniorg-rehype';
import stringify from 'rehype-stringify';

const org = unified().use(parseOrg).use(uniorg2rehype).use(rehypeStringify);
const app = document.querySelector<HTMLDivElement>('#app');

app.innerHTML = `
  <div style="display:flex; gap:2rem; padding:2rem;">
    <div style="flex:1;">
      <h2>Markdown</h2>
      <div id="md-preview"></div>
    </div>
    <div style="flex:1;">
      <h2>Org</h2>
      <div id="org-preview"></div>
    </div>
  </div>
`;

function renderMarkdown(source: string) :string{
  return quikdown(source);
}

async function renderOrg(source: string): Promise<string> {
  let file = await org.process(source);
  return String(file);
}

export async function renderContent(ctx, ext) {
    if (ext == 'md' || ext =='markdown') {
        return quikdown(ctx);
    }

    if (ext == 'org') {
        let file = await org.process(ctx);
        return String(file);
    }

    return '<span> error </span>';
}

