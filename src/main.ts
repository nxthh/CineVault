import {initChrome} from './ui';
import {pages} from './pages';
initChrome();
pages[document.body.dataset.page||'']?.();
