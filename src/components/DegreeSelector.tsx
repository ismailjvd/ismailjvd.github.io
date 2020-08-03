import * as React from 'react';

const MAX_MAJORS = 2;
const MAX_MINORS = 2;

function DegreeFilter(props) {
    return (
        <div className="filter-container" key={props.index}>
            { props.label }
            <select className="filter"></select>
        </div>
    )
}

class DegreeSelector extends React.Component {

    state = {
        majors: [
            DegreeFilter({label: "Major", index: 1})
        ],
        minors: []
    }

    addMajor = () => {
        let majors = [...this.state.majors];
        const index = majors.length + 1;

        if (index <= MAX_MAJORS) {
            const props = {label: "Major", index: index}
            majors.push(DegreeFilter(props));

            this.setState({
                majors: majors,
                minors: this.state.minors
            })
        }
    }

    addMinor = () => {
        let minors = [...this.state.minors];
        const index = minors.length + 1;

        if (index <= MAX_MINORS) {
            const props = {label: "Minor", index: index}
            minors.push(DegreeFilter(props));

            this.setState({
                majors: this.state.majors,
                minors: minors
            })
        }
    }
    
    render() {
        return (
            <div id="degree-selector" className="all-filters">
                {this.state.majors}
                {this.state.minors}
                <div id="button-container">
                    <button id="add-major" onClick={this.addMajor}>Add Major</button>
                    <button id="add-minor" onClick={this.addMinor}>Add Minor</button>
                </div>
            </div>
        )
    }
}

export default DegreeSelector;