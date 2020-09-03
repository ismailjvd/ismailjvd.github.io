import * as React from 'react';
import CourseList from './CourseList';
import { DraggableItem } from './CourseList';
import { string } from 'prop-types';
import degreeData from './DegreeData';
import { _ } from 'lodash';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type SchedulerProperties = {
    majors: Array<string>,
    minors: Array<string>,
}

type ListData = {
    lowerDivs: Array<string>,
    upperDivs: Array<string>,
    minorCourses: Array<string>,
    breadths: Array<string>
}

const getInitialState = (majors: Array<string>, minors: Array<string>) => {
    let state = {
        draggedItem: undefined,
        clickedItem: undefined,
        majors: majors,
        minors: minors,
        lists: degreeData.getOriginalLists(majors, minors),
        lowerDivList: [],
        upperDivList: [],
        breadthList: [],
        minorList: [],
        fa1List: [],
        sp1List: [],
        fa2List: [],
        sp2List: [],
        fa3List: [],
        sp3List: [],
        fa4List: [],
        sp4List: []
    }
    const cacheKey = getCacheKey(majors, minors);
    if (localStorage[cacheKey]) {
        state = getStateFromCache(cacheKey);
    } else {
        state.lowerDivList = degreeData.getSortedLowerDivs(majors)
        state.upperDivList = degreeData.getSortedUpperDivs(majors)
        state.breadthList = degreeData.getSortedBreadths(majors, minors),
        state.minorList = degreeData.getSortedMinorCourses(majors, minors),
        state.fa1List = [],
        state.sp1List = [],
        state.fa2List = [],
        state.sp2List = [],
        state.fa3List = [],
        state.sp3List = [],
        state.fa4List = [],
        state.sp4List = []
    }
    return state;
}

const removeFromCache = (key: string) => {
    delete localStorage[key];
}

const cacheState = (key, state) => {
    localStorage[key] = JSON.stringify(state);
}

const getStateFromCache = (key) => {
    return JSON.parse(localStorage[key]);
}

const getCacheKey = (majors: Array<string>, minors: Array<string>) => {
    majors = majors.sort();
    minors = minors.sort();
    const degrees = JSON.stringify(majors) + ";" + JSON.stringify(minors);
    return degrees;
}

class SchedulerContainer extends React.Component<SchedulerProperties> {

    static getDerivedStateFromProps(nextProps, prevState) {
        if(!(_.isEqual(nextProps.majors, prevState.majors) && 
            (_.isEqual(nextProps.minors, prevState.minors)))) {
            return getInitialState(nextProps.majors, nextProps.minors);
        }
        return null;
    }

    state = getInitialState(this.props.majors, this.props.minors);

    copyState() {
        return {
            draggedItem: undefined,
            clickedItem: undefined,
            majors: [...this.state.majors],
            minors: [...this.state.minors],
            lists: {...this.state.lists},
            lowerDivList: [...this.state.lowerDivList],
            upperDivList: [...this.state.upperDivList],
            breadthList: [...this.state.breadthList],
            minorList: [...this.state.minorList],
            fa1List: [...this.state.fa1List],
            sp1List: [...this.state.sp1List],
            fa2List: [...this.state.fa2List],
            sp2List: [...this.state.sp2List],
            fa3List: [...this.state.fa3List],
            sp3List: [...this.state.sp3List],
            fa4List: [...this.state.fa4List],
            sp4List: [...this.state.sp4List]
        }
    }

    updateLists = (source:string, dest:string, list1: Array<string>, list2: Array<string>) => {
        let newState = this.copyState();
        newState[source] = list1;
        newState[dest] = list2;
        cacheState(getCacheKey([...this.props.majors], [...this.props.minors]), newState);
        this.setState(newState);
    }

    setDraggedItem = (item: DraggableItem | undefined) => {
        this.setState({
            draggedItem: item
        });
    }

    getDraggedItem = (): DraggableItem | undefined => {
        return this.state.draggedItem;
    }

    setClickedItem = (item: DraggableItem | undefined) => {
        this.setState({
            clickedItem: item
        });
    }

    getClickedItem = (): DraggableItem | undefined => {
        return this.state.clickedItem;
    }

    getOriginalListId = (course: string) => {
        let listOrigin: string;
        switch(course) {
            case this.state.lists.lowerDivs[this.state.lists.lowerDivs.indexOf(course)]:
                listOrigin = "lowerDivList";
                break;
            case this.state.lists.upperDivs[this.state.lists.upperDivs.indexOf(course)]:
                listOrigin = "upperDivList";
                break;
            case this.state.lists.minorCourses[this.state.lists.minorCourses.indexOf(course)]:
                listOrigin = "minorList";
                break;
            case this.state.lists.breadths[this.state.lists.breadths.indexOf(course)]:
                listOrigin = "breadthList";
                break;
            default:
                listOrigin = "custom";
                break;
        }
        return listOrigin;
    }

    static isClassList(listId: string): boolean {
        const classLists: Array<string> = ["lowerDivList", "upperDivList", "breadthList", "minorList"];
        return classLists.indexOf(listId) !== -1;
    }

    isValidMovement = (source: string, dest: string, course: string) => {
        return (
            (!SchedulerContainer.isClassList(dest) || 
                dest === this.getOriginalListId(course))
        )
    }

    moveItemToList = (source: string, dest: string, course: string, index: number) => {
        if (source !== dest && this.isValidMovement(source, dest, course)) {
            let list1: Array<string> = this.state[source];
            let list2: Array<string> = this.state[dest];
            list1.splice(index, 1);
            if (SchedulerContainer.isClassList(dest)) {
                list2.splice(_.sortedIndex(list2, course), 0, course);
            } else {
                list2.push(course);
            }
            this.updateLists(source, dest, list1, list2);
        }
        this.setDraggedItem(undefined);
    }

    getYearContainers = () => {
        const scheduleLists = ["fa1List", "sp1List", "fa2List", "sp2List", "fa3List", "sp3List", "fa4List", "sp4List"];
        let yearContainers = [];
        for (let i=0;i<scheduleLists.length;i+=2) {
            yearContainers.push(
                <div className="year-container" key={"container-"+scheduleLists[i]+"-"+scheduleLists[i+1]}>
                    <CourseList 
                        key={scheduleLists[i]}
                        listId={scheduleLists[i]}
                        courses={this.state[scheduleLists[i]]} 
                        setDraggedItem={this.setDraggedItem}
                        getDraggedItem={this.getDraggedItem}
                        setClickedItem={this.setClickedItem}
                        getClickedItem={this.getClickedItem}
                        isValid={this.isValidMovement}
                        moveItemToList={this.moveItemToList}
                        getOriginalList={this.getOriginalListId}
                    />
                    <CourseList 
                        key={scheduleLists[i+1]}
                        listId={scheduleLists[i+1]}
                        courses={this.state[scheduleLists[i+1]]} 
                        setDraggedItem={this.setDraggedItem}
                        getDraggedItem={this.getDraggedItem}
                        setClickedItem={this.setClickedItem}
                        getClickedItem={this.getClickedItem}
                        isValid={this.isValidMovement}
                        moveItemToList={this.moveItemToList}
                        getOriginalList={this.getOriginalListId}
                    />
                </div>
            )
        }
        return yearContainers;
    }

    handleDeleteClick = () => {
        const cacheKey = getCacheKey(this.props.majors, this.props.minors);
        removeFromCache(cacheKey);
        this.setState(getInitialState(this.props.majors, this.props.minors));
    }

    render() {
        const classLists = ["lowerDivList", "upperDivList", "breadthList", "minorList"];
        const yearContainers = this.getYearContainers();
        let cn = "lists-container";
        if (this.props.minors.length > 0) {
            cn += " minor-selected"
        }
        return (
            <div id="scheduler-container">
                <div id="courses-main-container" className="main-container">
                    <div id="course-lists-title" className="lists-title">Your Classes</div>
                    <div id="course-lists-container" className={cn}>
                        {classLists.map(listId => 
                            <CourseList
                                key={listId}
                                listId={listId}
                                courses={this.state[listId]} 
                                setDraggedItem={this.setDraggedItem}
                                getDraggedItem={this.getDraggedItem}
                                setClickedItem={this.setClickedItem}
                                getClickedItem={this.getClickedItem}
                                isValid={this.isValidMovement}
                                moveItemToList={this.moveItemToList}
                                getOriginalList={this.getOriginalListId}
                            />
                        )}
                    </div>
                </div>
                <div id="scheduler-main-container" className="main-container">
                    <div id="schedule-lists-title" className="lists-title">Your Schedule</div>
                    <FontAwesomeIcon 
                        icon={faTrashAlt} 
                        className="schedule-button" 
                        id="delete-schedule"
                        onClick={this.handleDeleteClick}
                    />
                    <div id="schedule-lists-container" className="lists-container">
                        {yearContainers}
                    </div>
                </div>
            </div>
        )
    }
}

export default SchedulerContainer;
