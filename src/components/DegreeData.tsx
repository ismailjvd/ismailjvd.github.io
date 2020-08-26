import data from '../../assets/data/degrees.json';
import { _, union } from 'lodash';

class DegreeData {
    private static instance: DegreeData;
    private _sortedMajors: Array<string> = Object.keys(data.majors).sort();
    private _sortedMinors: Array<string> = Object.keys(data.minors).sort();
    private _sortedBreadths: Array<string> = data.breadths.breadthCourses;

    private constructor() {
    }

    static getInstance() {
        if (!DegreeData.instance) {
            DegreeData.instance = new DegreeData();
        }
        return DegreeData.instance;
    }

    getSortedMajors(): Array<string> {
        return this._sortedMajors;
    }

    getSortedMinors(): Array<string> {
        return this._sortedMinors;
    }

    getSortedLowerDivs(majors): Array<string> {
        const lowerDivLists = majors.map(major => data.majors[major].classes.lowerDivs);
        return union.apply(_, lowerDivLists).sort();
    }

    getSortedUpperDivs(majors): Array<string> {
        const lowerDivs = this.getSortedLowerDivs(majors);
        const upperDivLists = majors.map(major => data.majors[major].classes.upperDivs);
        return union.apply(_, upperDivLists).sort().filter(course => lowerDivs.indexOf(course) === -1);
    }

    getSortedBreadths(majors, minors): Array<string> {
        const lowerDivs = this.getSortedLowerDivs(majors);
        const upperDivs = this.getSortedUpperDivs(majors);
        const minorCourses = this.getSortedMinorCourses(majors, minors);
        return this._sortedBreadths.filter(course => {
            return (lowerDivs.indexOf(course) === -1 && upperDivs.indexOf(course) === -1 &&
                minorCourses.indexOf(course) === -1);
        })
    }

    getSortedMinorCourses(majors, minors): Array<string> {
        const lowerDivs = this.getSortedLowerDivs(majors);
        const upperDivs = this.getSortedUpperDivs(majors);
        const minorCoursesLists = minors.map(minor => data.minors[minor].minorCourses);    
        return union.apply(_, minorCoursesLists).sort().filter(course => 
            (lowerDivs.indexOf(course) === -1 && upperDivs.indexOf(course) === -1)
        )
    }
}

const degreeData = DegreeData.getInstance();

export default degreeData;
