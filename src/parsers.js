import quikdown from 'quikdown';
import {unified} from 'unified';
import parseOrg from 'uniorg-parse';
import uniorg2rehype from 'uniorg-rehype';
import rehypeStringify from 'rehype-stringify';

const orgProcessor = unified().use(parseOrg)
