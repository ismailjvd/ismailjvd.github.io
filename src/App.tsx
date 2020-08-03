import * as React from 'react';
import { render } from 'react-dom';

import Counter from './components/Counter';
import Header from './components/Header';
import DegreeSelector from "./components/DegreeSelector";

import "../assets/style/App.css";
import "../assets/style/Header.css";
import "../assets/style/DegreeSelector.css";

console.log()

render(
    <div id="main-container">
        <Header />
        <DegreeSelector />
        <Counter />
    </div>,
    document.getElementById('main')
);