import * as React from 'react';
import degreeData from './DegreeData';
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Constants for maximum number of majors / minors user can choose
const MAX_MAJORS = 2;
const MAX_MINORS = 2;

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
        allDegrees = degreeData.getSortedMajors();
    } else if (props.label === "Minor") {
        allDegrees = degreeData.getSortedMinors();
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

interface DegreeSelectorProps extends React.Props<any> {
    chosenMajors: Array<string>;
    chosenMinors: Array<string>;
    updateParent: (majors, minors) => void;
}

class DegreeSelector extends React.Component<DegreeSelectorProps> {

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
            minors: minors
        })

        this.props.updateParent(chosenMajors, chosenMinors);
    }

    // Updates all filters after a select item is changed. May remove filters.
    handleFilterChange = (newDegree: string, type: "Major" | "Minor", index: number) => {

        let majors = [...this.state.majors];
        let minors = [...this.state.minors];
        let chosenMajors = [...this.props.chosenMajors];
        let chosenMinors = [...this.props.chosenMinors];

        let resetMajors = true;
        let resetMinors = chosenMinors.length > 0;

        // Condition can only be met by the first filter. Removes all other filters if the selected major is already chosen
        if (this.props.chosenMajors.indexOf(newDegree) !== -1) {
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
        } else if (this.props.chosenMinors.indexOf(newDegree) !== -1) {
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
        let chosenMajors = [...this.props.chosenMajors];
        let chosenMinors = [...this.props.chosenMinors];

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
            newDegree = chosenMinors[index-1];
        }

        if (shouldUpdate) {
            this.updateFilters(majors, minors, chosenMajors, chosenMinors, 
                resetMajors, resetMinors, newDegree, index, type === "Minor");
        }
    }

    addMajor = () => {
        if (this.canAddMajor()) {
            let majors = [...this.state.majors];
            const index = majors.length + 1;
            const defaultMajor = degreeData.getSortedMajors()[this.getDefaultMajorIndex()]
            const props = {
                label: "Major", 
                index: index, 
                degrees: [...this.props.chosenMajors],
                newDegree: defaultMajor,
                changeFunction: this.handleFilterChange,
                caller: "add",
                removeClickHandler: this.removeFilter
            }
            majors.push(DegreeFilter(props));

            this.setState({
                majors: majors,
                minors: this.state.minors,
            })

            this.props.updateParent([...this.props.chosenMajors].concat(defaultMajor), this.props.chosenMinors);
        }
    }

    addMinor = () => {
        if (this.canAddMinor()) {
            let minors = [...this.state.minors];
            const index = minors.length + 1;
            let defaultMinor = degreeData.getSortedMinors()[this.getDefaultMinorIndex()];
            const props = {
                label: "Minor", 
                index: index,
                degrees: [...this.props.chosenMinors].concat(this.props.chosenMajors),
                newDegree: defaultMinor,
                changeFunction: this.handleFilterChange,
                caller: "add",
                removeClickHandler: this.removeFilter
            }
            minors.push(DegreeFilter(props));

            this.setState({
                majors: this.state.majors,
                minors: minors,
            })

            this.props.updateParent(this.props.chosenMajors, [...this.props.chosenMinors].concat(defaultMinor));
        }
    }

    getDefaultMajorIndex = () => {
        let majors = [...this.state.majors];
        const index = majors.length + 1;
        let i = degreeData.getSortedMajors().length;

        if (index <= MAX_MAJORS && this.props.chosenMajors.length < degreeData.getSortedMajors().length) {
            let defaultMajor = degreeData.getSortedMajors()[0]
            i = 0;
            while (i<degreeData.getSortedMajors().length) {
                if (this.props.chosenMajors.indexOf(defaultMajor) === -1 && 
                    this.props.chosenMinors.indexOf(defaultMajor) === -1) {
                    break;
                }
                defaultMajor = degreeData.getSortedMajors()[++i];
            }
        }

        return i;
    }

    getDefaultMinorIndex = () => {
        let minors = [...this.state.minors];
        const index = minors.length + 1;
        let i = degreeData.getSortedMinors().length;

        if (index <= MAX_MINORS && this.props.chosenMinors.length < degreeData.getSortedMinors().length) {
            let defaultMinor = degreeData.getSortedMinors()[0]
            i = 0;
            while (i<degreeData.getSortedMinors().length) {
                if (this.props.chosenMinors.indexOf(defaultMinor) === -1 && 
                    this.props.chosenMajors.indexOf(defaultMinor) === -1) {
                    break;
                }
                defaultMinor = degreeData.getSortedMinors()[++i];
            }
        }
        return i;
    }

    canAddMajor = () => {
        return this.getDefaultMajorIndex() < degreeData.getSortedMajors().length;
    }

    canAddMinor = () => {
        return this.getDefaultMinorIndex() < degreeData.getSortedMinors().length;
    }

    getInitialState = () => {
        let majors: Array<any> = this.props.chosenMajors.map((major, index) =>
            DegreeFilter({
                label: "Major", 
                index: index+1,
                degrees: this.props.chosenMajors.slice(0, index),
                newDegree: major,
                changeFunction: this.handleFilterChange,
                caller: "add",
                removeClickHandler: this.removeFilter
            })
        )
        let minors: Array<any> = this.props.chosenMinors.map((minor, index) =>
            DegreeFilter({
                label: "Minor", 
                index: index+1,
                degrees: this.props.chosenMajors.concat(this.props.chosenMinors.slice(0, index)),
                newDegree: minor,
                changeFunction: this.handleFilterChange,
                caller: "add",
                removeClickHandler: this.removeFilter
            })
        )
        return {
            majors: majors,
            minors: minors
        }
    }

    state = this.getInitialState()
    
    render() {
        const majorButtonClass = this.canAddMajor() ? "active" : "inactive";
        const minorButtonClass = this.canAddMinor() ? "active" : "inactive";
        const state = this.getInitialState();
        return (
            <div id="degree-selector" className="all-filters">
                {state.majors}
                {state.minors}
                <div id="button-container">
                    <button id="add-major" onClick={this.addMajor} className={majorButtonClass}>+ Add Major</button>
                    <button id="add-minor" onClick={this.addMinor} className={minorButtonClass}>+ Add Minor</button>
                </div>
            </div>
        )
    }
}

export default DegreeSelector;