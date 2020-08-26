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

    getSortedBreadths(): Array<string> {
        return this._sortedBreadths;
    }

    getSortedUpperDivs(majors): Array<string> {
        const upperDivLists = majors.map(major => data.majors[major].classes.upperDivs);
        return union.apply(_, upperDivLists).sort();
    }

    getSortedLowerDivs(majors): Array<string> {
        const lowerDivLists = majors.map(major => data.majors[major].classes.lowerDivs);
        return union.apply(_, lowerDivLists).sort();
    }

    getSortedMinorCourses(minors): Array<string> {
        const minorCoursesLists = minors.map(minor => data.minors[minor].minorCourses);
        return union.apply(_, minorCoursesLists).sort();
    }
}

const degreeData = DegreeData.getInstance();

export default degreeData;
