import { fileURLToPath } from 'url';
import { dirname } from 'path';

export default (url: string) => dirname(fileURLToPath(url));
