import * as React from 'react';
import degreeData from './DegreeData';
import { faMinusCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Constants for maximum number of majors / minors user can choose
const MAX_MAJORS = 2;
const MAX_MINORS = 2;

type DegreeSelectorProps = {
    majors: Array<string>,
    minors: Array<string>,
    updateParent: (majors: Array<string>, minors: Array<string>) => void
}

type DegreeFilterProps = {
    label: "Major" | "Minor",
    index: number,
    degrees: Array<string>,
    selectedDegree: string,
    changeFunction: (newDegree: string, type: "Major" | "Minor", index: number) => void,
    removeClickHandler: (type: "Major" | "Minor", index: number) => void
}

const DegreeFilter = (props: DegreeFilterProps): JSX.Element => {

    let buttonClass = "remove-filter-button";
    if (props.index === 0 && props.label === "Major") {
        buttonClass += " hidden";
    }

    return (
        <div className="filter-container" key={props.label + "-" + props.index}>
            { props.label }
            <select className="filter" value={props.selectedDegree} 
                onChange={(e)=>{props.changeFunction(e.target.value, props.label, props.index)}}>
                { props.degrees.map(degree => <option value={degree} key={degree}>{degree}</option>) }
            </select>
            <FontAwesomeIcon 
                icon={faMinusCircle} 
                className={buttonClass} 
                onClick={() => {props.removeClickHandler(props.label, props.index)}}
            />
        </div>
    )
}

class DegreeSelector extends React.Component<DegreeSelectorProps> {

    /* Event Handlers */

    handleFilterChange = (newDegree: string, type: "Major" | "Minor", index: number) => {
        if (type === "Major") {
            let majors: Array<string> = [...this.props.majors];
            let minors: Array<string> = [...this.props.minors];
            if (majors.indexOf(newDegree) !== -1) {
                majors = majors.slice(0, majors.indexOf(newDegree));
            }
            majors[index] = newDegree;
            if (minors.indexOf(newDegree) !== -1) {
                minors = minors.slice(0, minors.indexOf(newDegree));
            }
            this.props.updateParent(majors, minors);
        } else {
            let minors: Array<string> = [...this.props.minors];
            if (minors.indexOf(newDegree) !== -1) {
                minors = minors.slice(0, minors.indexOf(newDegree));
            }
            minors[index] = newDegree;
            this.props.updateParent(this.props.majors, minors); 
        }
    }

    removeFilter = (type: "Major" | "Minor", index: number) => {
        if (type === "Major" && index === 0) {
            return;
        }
        if (type === "Major") {
            const newMajors = [...this.props.majors];
            newMajors.splice(index, 1);
            this.props.updateParent(newMajors, this.props.minors);
        } else {
            const newMinors = [...this.props.minors]
            newMinors.splice(index, 1);
            this.props.updateParent(this.props.majors, newMinors);
        }
    }

    addMajor = () => {
        if (this.canAddMajor()) {
            let selectedMajor: string = degreeData.getSortedMajors()[this.getNextMajorIndex()];
            this.props.updateParent([...this.props.majors].concat([selectedMajor]), this.props.minors);
        }
    }

    addMinor = () => {
        if (this.canAddMinor()) {
            let selectedMinor: string = degreeData.getSortedMinors()[this.getNextMinorIndex()];
            this.props.updateParent(this.props.majors, [...this.props.minors].concat([selectedMinor]))
        }
    }

    /* Event handler helper functions */

    getNextMajorIndex = (): number => {
        let allMajors: Array<string> = degreeData.getSortedMajors();
        let invalidDegrees: Array<string> = this.props.majors.concat(this.props.minors);

        let nextMajor: string;
        let i = 0;
        while (i < allMajors.length) {
            nextMajor = allMajors[i];
            if (invalidDegrees.indexOf(nextMajor) === -1) {
                return i;
            }
            i += 1;
        }

        return -1;
    }

    getNextMinorIndex = (): number => {
        let allMinors: Array<string> = degreeData.getSortedMinors();
        let invalidDegrees: Array<string> = this.props.majors.concat(this.props.minors);

        let nextMinor: string;
        let i = 0;
        while (i < allMinors.length) {
            nextMinor = allMinors[i];
            if (invalidDegrees.indexOf(nextMinor) === -1) {
                return i;
            }
            i += 1;
        }

        return -1;
    }

    canAddMajor = () => {
        if (this.props.majors.length >= MAX_MAJORS) {
            return false;
        }
        return this.getNextMajorIndex() >= 0;
    }

    canAddMinor = () => {
        if (this.props.minors.length >= MAX_MINORS) {
            return false;
        }
        return this.getNextMinorIndex() >= 0;
    }

    /* JSX Helpers */

    getMajorFilters = (): Array<JSX.Element> => {
        const majorFilters = [];
        this.props.majors.forEach((major, index) => {
            let invalidDegrees: Array<string> = this.props.majors.slice(0, index);
            let selectedMajor: string = this.props.majors[index];
            let validDegrees = degreeData.getSortedMajors().filter(major => invalidDegrees.indexOf(major) === -1);
            majorFilters.push((
                <DegreeFilter
                    label="Major"
                    index={index}
                    degrees={validDegrees}
                    selectedDegree={selectedMajor}
                    changeFunction={this.handleFilterChange}
                    removeClickHandler={this.removeFilter}
                    key={"Major-"+index}
                />
            ))
        })
        return majorFilters;
    }

    getMinorFilters = (): Array<JSX.Element> => {
        const minorFilters = [];
        this.props.minors.forEach((minor, index) => {
            let invalidDegrees: Array<string> = [...this.props.majors].concat(this.props.minors.slice(0, index));
            let selectedMinor: string = this.props.minors[index];
            let validDegrees = degreeData.getSortedMinors().filter(minor => invalidDegrees.indexOf(minor) === -1);
            minorFilters.push((
                <DegreeFilter
                    label="Minor"
                    index={index}
                    degrees={validDegrees}
                    selectedDegree={selectedMinor}
                    changeFunction={this.handleFilterChange}
                    removeClickHandler={this.removeFilter}
                    key={"Minor-"+index}
                />
            ))
        })
        return minorFilters;
    }
    
    render() {
        const majorButtonClass = this.canAddMajor() ? "active" : "inactive";
        const minorButtonClass = this.canAddMinor() ? "active" : "inactive";
        return (
            <div id="degree-selector" className="all-filters">
                {this.getMajorFilters()}
                {this.getMinorFilters()}
                <div id="button-container">
                    <button id="add-major" onClick={this.addMajor} className={majorButtonClass}>+ Add Major</button>
                    <button id="add-minor" onClick={this.addMinor} className={minorButtonClass}>+ Add Minor</button>
                </div>
            </div>
        )
    }
}

export default DegreeSelector;