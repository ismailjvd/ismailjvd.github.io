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

    updateChosenDegrees = (majors, minors) => {
        this.setState({
            chosenMajors: majors,
            chosenMinors: minors,
            lowerDivList: degreeData.getSortedLowerDivs(majors),
            upperDivList: degreeData.getSortedUpperDivs(majors),
            breadthList: degreeData.getSortedBreadths(),
            minorList: degreeData.getSortedMinorCourses(minors)
        })
    }

    updateLists = (source:string, dest:string, list1: Array<string>, list2: Array<string>) => {
        this.setState({
            source: list1,
            dest: list2
        })
    }

    render() {
        return (
            <div id="main-container">
                <Header />
                <DegreeSelector 
                    chosenMajors={this.state.chosenMajors} 
                    chosenMinors={this.state.chosenMinors}
                    updateParent={(majors, minors) => this.updateChosenDegrees(majors, minors)}
                />
                <SchedulerContainer 
                    majors={this.state.chosenMajors} 
                    minors={this.state.chosenMinors}
                    lowerDivList={this.state.lowerDivList}
                    upperDivList={this.state.upperDivList}
                    breadthList={this.state.breadthList}
                    minorList={this.state.minorList}
                    fa1List={this.state.fa1List}
                    updateLists={this.updateLists}
                />
                <Counter />
            </div>
        )
    };
}

const domContainer = document.querySelector("#main");
render(<App />, domContainer)