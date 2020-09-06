import * as React from 'react';
import { render } from 'react-dom';

import Counter from './components/Counter';
import Header from './components/Header';
import DegreeSelector from "./components/DegreeSelector";
import SchedulerContainer from "./components/SchedulerContainer";
import degreeData from "./components/DegreeData";
import Modal from './components/Modal';

import "../assets/style/App.css";
import "../assets/style/Header.css";
import "../assets/style/DegreeSelector.css";
import "../assets/style/SchedulerContainer.css";
import "../assets/style/CourseList.css";
import "../assets/style/Modal.css";

const getInitialState = (majors?: Array<string>, minors?: Array<string>) => {
    let state = {
        chosenMajors: [degreeData.getSortedMajors()[0]],
        chosenMinors: [],
        modal: undefined
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

    updateModal = (modal: JSX.Element | undefined) => {
        this.setState({
            modal: modal
        })
    }

    render() {
        let state = this.state;
        let modal = null;
        if (this.state.modal && typeof(this.state.modal) !== undefined) {
            modal = this.state.modal;
        }
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
                    setModal={this.updateModal}
                />
                <Counter />
                {modal}
            </div>
        )
    };
}

const domContainer = document.querySelector("#main");
render(<App />, domContainer)