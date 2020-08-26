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
import "../assets/style/CourseList.css"

class App extends React.Component {

    state = {
        chosenMajors: [degreeData.getSortedMajors()[0]],
        chosenMinors: [],
        lowerDivList: degreeData.getSortedLowerDivs([degreeData.getSortedMajors()[0]]),
        upperDivList: degreeData.getSortedUpperDivs([degreeData.getSortedMajors()[0]]),
        breadthList: degreeData.getSortedBreadths(),
        minorList: degreeData.getSortedMinorCourses([]),
        fa1List: []
    }

    getInitialState = () => {
        let state = this.state;
        if (localStorage["currState"]) {
            state = this.getStateFromCache("currState")
        }
        const cacheKey = this.getCacheKey(state.chosenMajors, state.chosenMinors);
        if (localStorage[cacheKey]) {
            state = this.getStateFromCache(cacheKey);
        } else {
            state.lowerDivList = degreeData.getSortedLowerDivs(state.chosenMajors)
            state.upperDivList = degreeData.getSortedUpperDivs(state.chosenMajors)
            state.breadthList = degreeData.getSortedBreadths(),
            state.minorList = degreeData.getSortedMinorCourses(state.chosenMinors),
            state.fa1List = []
        }
        return state;
    }

    updateChosenDegrees = (majors, minors) => {
        const newState = {
            chosenMajors: majors,
            chosenMinors: minors,
            lowerDivList: degreeData.getSortedLowerDivs(majors),
            upperDivList: degreeData.getSortedUpperDivs(majors),
            breadthList: degreeData.getSortedBreadths(),
            minorList: degreeData.getSortedMinorCourses(minors),
            fa1List: []
        }
        this.cacheState("currState", newState);
        this.setState(newState);
    }

    updateLists = (source:string, dest:string, list1: Array<string>, list2: Array<string>) => {
        let newState = {
            chosenMajors: this.state.chosenMajors,
            chosenMinors: this.state.chosenMinors,
            lowerDivList: this.state.lowerDivList,
            upperDivList: this.state.upperDivList,
            breadthList: this.state.breadthList,
            minorList: this.state.minorList,
            fa1List: this.state.fa1List
        }
        newState[source] = list1;
        newState[dest] = list2;
        this.cacheState(this.getCacheKey(newState.chosenMajors, newState.chosenMinors), newState);
        this.setState(newState);
    }

    cacheState = (key, state) => {
        localStorage[key] = JSON.stringify(state);
        localStorage["currState"] = JSON.stringify(state);
    }

    getStateFromCache = (key) => {
        return JSON.parse(localStorage[key]);
    }

    getCacheKey = (majors, minors) => {
        const degrees = JSON.stringify(majors) + ";" + JSON.stringify(minors);
        return degrees;
    }

    render() {
        let state = this.getInitialState();
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
                    lowerDivList={state.lowerDivList}
                    upperDivList={state.upperDivList}
                    breadthList={state.breadthList}
                    minorList={state.minorList}
                    fa1List={state.fa1List}
                    updateLists={this.updateLists}
                />
                <Counter />
            </div>
        )
    };
}

const domContainer = document.querySelector("#main");
render(<App />, domContainer)