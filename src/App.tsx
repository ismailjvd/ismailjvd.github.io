import * as React from 'react';
import { render } from 'react-dom';

import Counter from './components/Counter';
import Header from './components/Header';
import DegreeSelector from "./components/DegreeSelector";
import SchedulerContainer from "./components/SchedulerContainer";
import degreeData from "./components/DegreeData";

import "../assets/style/App.css";
import "../assets/style/Header.css";
import "../assets/style/DegreeSelector.css";
import "../assets/style/SchedulerContainer.css";
import "../assets/style/CourseList.css";

const getInitialState = (majors?: Array<string>, minors?: Array<string>) => {
    let state = {
        chosenMajors: [degreeData.getSortedMajors()[0]],
        chosenMinors: [],
    }
    if (localStorage["currState"]) {
        state = getStateFromCache("currState")
    }
    if (majors) {
        state.chosenMajors = majors;
    }
    if (minors) {
        state.chosenMinors = minors;
    }
    return state;
}

const cacheState = (key, state) => {
    localStorage[key] = JSON.stringify(state);
    localStorage["currState"] = JSON.stringify(state);
}

const getStateFromCache = (key) => {
    return JSON.parse(localStorage[key]);
}

class App extends React.Component {
    
    state = getInitialState();

    updateChosenDegrees = (majors, minors) => {
        const newState = getInitialState(majors, minors);
        cacheState("currState", newState);
        this.setState(newState);
    }

    render() {
        let state = this.state;
        return (
            <div id="main-container">
                <Header />
                <DegreeSelector 
                    chosenMajors={state.chosenMajors} 
                    chosenMinors={state.chosenMinors}
                    updateParent={this.updateChosenDegrees}
                />
                <SchedulerContainer 
                    majors={state.chosenMajors} 
                    minors={state.chosenMinors}
                />
                <Counter />
            </div>
        )
    };
}

const domContainer = document.querySelector("#main");
render(<App />, domContainer)