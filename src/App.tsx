import * as React from 'react';
import { render } from 'react-dom';

import Counter from './components/Counter';
import Header from './components/Header';
import DegreeSelector from "./components/DegreeSelector";
import SchedulerContainer from "./components/SchedulerContainer";
import degreeData from "./components/DegreeData";
import Modal from './components/Modal';
import { ToastContainer } from 'react-toastify';

import "../assets/style/App.css";
import "../assets/style/Header.css";
import "../assets/style/DegreeSelector.css";
import "../assets/style/SchedulerContainer.css";
import "../assets/style/CourseList.css";
import "../assets/style/Modal.css";
import "../assets/style/DraggableItem.css";
import "../assets/style/DeleteContainer.css";
import "react-toastify/dist/ReactToastify.css";
import "../assets/style/ToastOverides.css";

const getInitialState = (majors?: Array<string>, minors?: Array<string>) => {
    if (window.location.search.length > 0) {
        return getStateFromURL();
    }
    let state = {
        majors: [degreeData.getSortedMajors()[0]],
        minors: [],
        modal: undefined
    }
    if (localStorage["currState"]) {
        state = getStateFromCache("currState")
    }
    if (majors) {
        state.majors = majors;
    }
    if (minors) {
        state.minors = minors;
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

const getStateFromURL = () => {
    const queryString = window.location.search;
    let u = new URLSearchParams(queryString);
    let state = {};
    let keys = ["majors", "minors"];
    keys.forEach(key => {
        if (u.has(key)) {
            let list: Array<string> = JSON.parse(u.get(key));
            state[key] = list;
        } else {
            state[key] = [];
        }
    });
    let newState = {
        majors: state["majors"],
        minors: state["minors"],
        modal: undefined
    }
    cacheState("currState", newState);
    return newState;
}

class App extends React.Component {
    
    state = getInitialState();

    updateChosenDegrees = (majors: Array<string>, minors: Array<string>) => {
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
                    majors={[...state.majors]} 
                    minors={[...state.minors]}
                    updateParent={this.updateChosenDegrees}
                />
                <SchedulerContainer 
                    majors={[...state.majors]} 
                    minors={[...state.minors]}
                    setModal={this.updateModal}
                    updateDegrees={this.updateChosenDegrees}
                />
                <Counter />
                {modal}
                <ToastContainer
                    position="bottom-center"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                />
            </div>
        )
    };
}

const domContainer = document.querySelector("#main");
render(<App />, domContainer)