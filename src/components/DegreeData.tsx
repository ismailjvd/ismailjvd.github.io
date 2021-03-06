import data from '.././assets/data/degrees.json';
import { _, union } from 'lodash';
import { ListData } from './SchedulerContainer';
import { ResourceProps, DegreeWithResources } from './ResourceContainer.js';

class DegreeData {
    private static instance: DegreeData;
    private _sortedMajors: Array<string> = Object.keys(data.majors).sort();
    private _sortedMinors: Array<string> = Object.keys(data.minors).sort();
    private _sortedBreadths: Array<string> = data.breadths.breadthCourses;

    static getInstance(): DegreeData {
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

    getSortedLowerDivs(majors: Array<string>): Array<string> {
        const lowerDivLists: Array<string> = majors.map(major => data.majors[major].classes.lowerDivs);
        return union.apply(_, lowerDivLists).sort();
    }

    getSortedUpperDivs(majors: Array<string>): Array<string> {
        const lowerDivs: Array<string> = this.getSortedLowerDivs(majors);
        const upperDivLists: Array<string> = majors.map(major => data.majors[major].classes.upperDivs);
        return union.apply(_, upperDivLists).sort().filter(course => lowerDivs.indexOf(course) === -1);
    }

    getSortedBreadths(majors: Array<string>, minors: Array<string>): Array<string> {
        const lowerDivs: Array<string> = this.getSortedLowerDivs(majors);
        const upperDivs: Array<string> = this.getSortedUpperDivs(majors);
        const minorCourses: Array<string> = this.getSortedMinorCourses(majors, minors);
        return this._sortedBreadths.filter(course => {
            return (lowerDivs.indexOf(course) === -1 && upperDivs.indexOf(course) === -1 &&
                minorCourses.indexOf(course) === -1);
        })
    }

    getSortedMinorCourses(majors: Array<string>, minors: Array<string>): Array<string> {
        const lowerDivs = this.getSortedLowerDivs(majors);
        const upperDivs = this.getSortedUpperDivs(majors);
        const minorCoursesLists = minors.map(minor => data.minors[minor].minorCourses);    
        return union.apply(_, minorCoursesLists).sort().filter(course => 
            (lowerDivs.indexOf(course) === -1 && upperDivs.indexOf(course) === -1)
        )
    }

    getOriginalLists(majors: Array<string>, minors: Array<string>) {
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

    getResources = (majors: Array<string>, minors: Array<string>) => {
        let resourcesList: Array<DegreeWithResources> = [];
        majors.forEach(major => {
            let resources = data.majors[major].resources;
            let list: Array<ResourceProps> = [];
            for (const resourceTitle in resources) {
                list.push({
                    title: resourceTitle,
                    link: resources[resourceTitle].link,
                    description: resources[resourceTitle].description
                })
            }
            resourcesList.push({
                degree: major,
                resources: [...list]
            })
        });
        minors.forEach(minor => {
            let resources = data.majors[minor].resources;
            let list: Array<ResourceProps> = [];
            for (const resourceTitle in resources) {
                list.push({
                    title: resourceTitle,
                    link: resources[resourceTitle].link,
                    description: resources[resourceTitle].description
                })
            }
            resourcesList.push({
                degree: minor,
                resources: [...list]
            })
        })
        return resourcesList;
    }
}

const degreeData = DegreeData.getInstance();

export default degreeData;
