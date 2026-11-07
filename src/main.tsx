import { render } from 'preact';
import '@fontsource-variable/inter';
import '@fontsource-variable/bricolage-grotesque';
import './styles.css';
import { App } from './App';

render(<App />, document.getElementById('app')!);
