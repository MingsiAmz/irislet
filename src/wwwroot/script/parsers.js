import quikdown from 'quikdown';
import { unified } from 'unified';
import parseOrg from 'uniorg-parse';
import uniorg2rehype from 'uniorg-rehype';
import rehypeStringify from 'rehype-stringify';

const org = unified().use(parseOrg).use(uniorg2rehype).use(rehypeStringify);

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
