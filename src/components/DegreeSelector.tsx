import * as React from 'react';
import data from '../../assets/data/degrees.json';
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Constants for maximum number of majors / minors user can choose
const MAX_MAJORS = 2;
const MAX_MINORS = 2;

// Lists will contain a sorted list of majors
let sortedMajors: Array<String> = [];
let sortedMinors: Array<String> = [];
Object.keys(data["majors"]).sort().forEach((degree) => {
    sortedMajors.push(degree)
})
Object.keys(data["minors"]).sort().forEach((degree) => {
    sortedMinors.push(degree)
})

/* Creates a degree filter
    props: {
        label: "Major" | "Minor"
        index: index of Degree Filter in major list
        degrees: array of invalid degrees (except newDegree)
        changeFunction: updateFilter function for onChange
    }
 */
function DegreeFilter(props) {
    let degrees = [];
    let allDegrees = [];

    if (props.label === "Major") {
        allDegrees = sortedMajors;
    } else if (props.label === "Minor") {
        allDegrees = sortedMinors;
    } else {
        throw new Error("invalid label (should be Major or Minor)")
    }

    allDegrees.forEach((degree) => {
        if (props.degrees.indexOf(degree) < 0 || (degree === props.newDegree && props.caller === "update")) {
            degrees.push(<option value={degree} key={degree}>{degree}</option>)
        }
    })

    let fontClass = "remove-filter-button";
    if (props.index === 1 && props.label === "Major") {
        fontClass += " hidden";
    }

    return (
        <div className="filter-container" key={props.index}>
            { props.label }
            <select className="filter" value={props.newDegree} 
                onChange={(e)=>{props.changeFunction(e.target.value, props.label, props.index)}}>
                { degrees }
            </select>
            <FontAwesomeIcon icon={faMinusCircle} className={fontClass} onClick={() => {props.removeClickHandler(props.index, props.label)}}></FontAwesomeIcon>
        </div>
    )
}

class DegreeSelector extends React.Component {

    updateFilters = (majors, minors, chosenMajors, chosenMinors, updateMajors, updateMinors, newDegree, index, isMinor) => {
        // Resets major filters if they haven't been removed
        if (updateMajors) {
            const tempDegree = newDegree;
            newDegree = !isMinor ? newDegree : chosenMajors[index - 1];
            while (index <= chosenMajors.length) {
                chosenMajors[index - 1] = newDegree;
                let degrees = chosenMajors.slice(0, index);
                const props = {
                    label: "Major", 
                    index: index, 
                    degrees: degrees,
                    newDegree: newDegree,
                    changeFunction: this.handleFilterChange,
                    caller: "update",
                    removeClickHandler: this.removeFilter
                }
                majors[index - 1] = DegreeFilter(props);
                index += 1;
                newDegree = chosenMajors[index - 1];
            }
            index = 1
            newDegree = isMinor ? tempDegree : chosenMinors[0];
        } 
        // Resets minor filters if they haven't been removed
        if (updateMinors) {
            while (index <= chosenMinors.length) {
                chosenMinors[index - 1] = newDegree;
                let degrees = chosenMinors.slice(0, index).concat(chosenMajors);
                const props = {
                    label: "Minor", 
                    index: index, 
                    degrees: degrees,
                    newDegree: newDegree,
                    changeFunction: this.handleFilterChange,
                    caller: "update",
                    removeClickHandler: this.removeFilter
                }
                minors[index - 1] = DegreeFilter(props);
                index += 1;
                newDegree = chosenMinors[index - 1];
            }
        }
        this.setState({
            majors: majors,
            minors: minors,
            chosenMajors: chosenMajors,
            chosenMinors: chosenMinors
        }, () => console.log(this.state))
    }

    // Updates all filters after a select item is changed. May remove filters.
    handleFilterChange = (newDegree: String, type: "Major" | "Minor", index: number) => {

        let majors = [...this.state.majors];
        let minors = [...this.state.minors];
        let chosenMajors = [...this.state.chosenMajors];
        let chosenMinors = [...this.state.chosenMinors];

        let resetMajors = true;
        let resetMinors = chosenMinors.length > 0;

        // Condition can only be met by the first filter. Removes all other filters if the selected major is already chosen
        if (this.state.chosenMajors.indexOf(newDegree) !== -1) {
            majors = [DegreeFilter({
                label: "Major",
                index: 1,
                degrees: [],
                newDegree: newDegree,
                changeFunction: this.handleFilterChange,
                caller: "update",
                removeClickHandler: this.removeFilter
            })]
            minors = []
            chosenMajors = [newDegree]
            chosenMinors = []
            resetMajors = false;
            resetMinors = false;
        } else if (this.state.chosenMinors.indexOf(newDegree) !== -1) {
            // Major change that matches a minor will remove all minors
            if (type === "Major") {
                minors = []
                chosenMinors = []
            } else { // Condtion can only be met by the first minor filter. Removes all other minor filters.
                minors = [DegreeFilter({
                    label: "Minor",
                    index: 1,
                    degrees: chosenMajors,
                    newDegree: newDegree,
                    changeFunction: this.handleFilterChange,
                    caller: "update",
                    removeClickHandler: this.removeFilter
                })]
                chosenMinors = [newDegree];
            }
            resetMinors = false;
        }
        this.updateFilters(majors, minors, chosenMajors, chosenMinors, resetMajors, resetMinors, newDegree, index, type === "Minor");
    }

    removeFilter = (index, type) => {
        let majors = [...this.state.majors];
        let minors = [...this.state.minors];
        let chosenMajors = [...this.state.chosenMajors];
        let chosenMinors = [...this.state.chosenMinors];

        let resetMajors = false;
        let resetMinors = chosenMinors.length > 0;
        let shouldUpdate = true;

        let newDegree;
        if (type === "Major") {
            chosenMajors.splice(index - 1, 1);
            majors.splice(index - 1, 1);
            if (index === chosenMajors.length) {
                if (chosenMinors.length === 0) {
                    shouldUpdate = false;
                    resetMinors = false;
                } else {
                    newDegree = chosenMinors[0];
                    index = 1;
                    type = "Minor";
                }
            } else {
                resetMajors = true;
                newDegree = chosenMajors[index];
            }
        } else {
            chosenMinors.splice(index - 1, 1);
            minors.splice(index - 1, 1);
            if (index === chosenMinors.length) {
                shouldUpdate = false;
                resetMinors = false;
            } else {
                newDegree = chosenMinors[index];
            }
        }

        if (shouldUpdate) {
            this.updateFilters(majors, minors, chosenMajors, chosenMinors, 
                resetMajors, resetMinors, newDegree, index, type === "Minor");
        }
    }

    state = {
        majors: [
            DegreeFilter({
                label: "Major", 
                index: 1,
                degrees: [],
                newDegree: sortedMajors[0],
                changeFunction: this.handleFilterChange,
                caller: "add",
                removeClickHandler: this.removeFilter
            })
        ],
        minors: [],
        chosenMajors: [sortedMajors[0]],
        chosenMinors: []
    }


    addMajor = () => {
        if (this.canAddMajor()) {
            let majors = [...this.state.majors];
            const index = majors.length + 1;
            const defaultMajor = sortedMajors[this.getDefaultMajorIndex()]
            const props = {
                label: "Major", 
                index: index, 
                degrees: [...this.state.chosenMajors],
                newDegree: defaultMajor,
                changeFunction: this.handleFilterChange,
                caller: "add",
                removeClickHandler: this.removeFilter
            }
            majors.push(DegreeFilter(props));

            this.setState({
                majors: majors,
                minors: this.state.minors,
                chosenMajors:[...this.state.chosenMajors].concat(defaultMajor),
                chosenMinors: this.state.chosenMinors
            })
        }
    }

    addMinor = () => {
        if (this.canAddMinor()) {
            let minors = [...this.state.minors];
            const index = minors.length + 1;
            let defaultMinor = sortedMinors[this.getDefaultMinorIndex()];
            const props = {
                label: "Minor", 
                index: index,
                degrees: [...this.state.chosenMinors].concat(this.state.chosenMajors),
                newDegree: defaultMinor,
                changeFunction: this.handleFilterChange,
                caller: "add",
                removeClickHandler: this.removeFilter
            }
            minors.push(DegreeFilter(props));

            this.setState({
                majors: this.state.majors,
                minors: minors,
                chosenMajors: this.state.chosenMajors,
                chosenMinors:[...this.state.chosenMinors].concat(defaultMinor),
            })
        }
    }

    getDefaultMajorIndex = () => {
        let majors = [...this.state.majors];
        const index = majors.length + 1;
        let i = sortedMajors.length;

        if (index <= MAX_MAJORS && this.state.chosenMajors.length < sortedMajors.length) {
            let defaultMajor = sortedMajors[0]
            i = 0;
            while (i<sortedMajors.length) {
                if (this.state.chosenMajors.indexOf(defaultMajor) === -1 && 
                    this.state.chosenMinors.indexOf(defaultMajor) === -1) {
                    break;
                }
                defaultMajor = sortedMajors[++i];
            }
        }

        return i;
    }

    getDefaultMinorIndex = () => {
        let minors = [...this.state.minors];
        const index = minors.length + 1;
        let i = sortedMinors.length;

        if (index <= MAX_MINORS && this.state.chosenMinors.length < sortedMinors.length) {
            let defaultMinor = sortedMinors[0]
            i = 0;
            while (i<sortedMinors.length) {
                if (this.state.chosenMinors.indexOf(defaultMinor) === -1 && 
                    this.state.chosenMajors.indexOf(defaultMinor) === -1) {
                    break;
                }
                defaultMinor = sortedMinors[++i];
            }
        }

        return i;
    }

    canAddMajor = () => {
        return this.getDefaultMajorIndex() < sortedMajors.length;
    }

    canAddMinor = () => {
        return this.getDefaultMinorIndex() < sortedMinors.length;
    }
    
    render() {
        const majorButtonClass = this.canAddMajor() ? "active" : "inactive";
        const minorButtonClass = this.canAddMinor() ? "active" : "inactive";
        return (
            <div id="degree-selector" className="all-filters">
                {this.state.majors}
                {this.state.minors}
                <div id="button-container">
                    <button id="add-major" onClick={this.addMajor} className={majorButtonClass}>+ Add Major</button>
                    <button id="add-minor" onClick={this.addMinor} className={minorButtonClass}>+ Add Minor</button>
                </div>
            </div>
        )
    }
}

export default DegreeSelector;