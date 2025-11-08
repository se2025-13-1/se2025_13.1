// index.js
import { AppRegistry } from 'react-native';
import App from './App'; // ĐÚNG: default import
// import { App } from './App'; // SAI: named import

import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);