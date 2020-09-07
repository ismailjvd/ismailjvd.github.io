import data from '../../assets/data/degrees.json';
import { _, union } from 'lodash';
import { ListData } from './SchedulerContainer';

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

    getOriginalLists(majors, minors) {
        const lowerDivs = this.getSortedLowerDivs(majors);
        const upperDivs = this.getSortedUpperDivs(majors);
        const minorCourses = this.getSortedMinorCourses(majors, minors);
        const breadths = this.getSortedBreadths(majors, minors);
        const res = {
            lowerDivs: lowerDivs,
            upperDivs: upperDivs,
            minorCourses: minorCourses,
            breadths: breadths
        }
        return res;
    }

    createCourseListMap = (majors: Array<string>, minors: Array<string>): Object => {
        let lists: ListData = this.getOriginalLists(majors, minors);
        let d = {};
        lists.lowerDivs.forEach((course) => {
            d[course] = "lowerDivList";
        })
        lists.upperDivs.forEach((course) => {
            d[course] = "upperDivList";
        })
        lists.breadths.forEach((course) => {
            d[course] = "breadthList";
        })
        lists.minorCourses.forEach((course) => {
            d[course] = "minorList";
        })
        return d;
    }
}

const degreeData = DegreeData.getInstance();

export default degreeData;
