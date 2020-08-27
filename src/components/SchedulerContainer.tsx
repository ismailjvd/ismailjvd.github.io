import * as React from 'react';
import CourseList from './CourseList';
import { ListItem } from './CourseList';
import { string } from 'prop-types';
import degreeData from './DegreeData';
import { _ } from 'lodash';

type SchedulerProperties = {
    majors: Array<string>,
    minors: Array<string>,
    lowerDivList: Array<string>,
    upperDivList: Array<string>,
    breadthList: Array<string>,
    minorList: Array<string>,
    fa1List: Array<string>,
    updateLists: (source:string, dest:string, list1:Array<string>, list2:Array<string>) => void,
}

type ListData = {
    lowerDivs: Array<string>,
    upperDivs: Array<string>,
    minorCourses: Array<string>,
    breadths: Array<string>
}

class SchedulerContainer extends React.Component<SchedulerProperties> {

    lists: ListData;

    constructor(props) {
        super(props);
        this.lists = degreeData.getOriginalLists(this.props.majors, this.props.minors);
    }

    state = { 
        draggedItem: undefined,
        clickedItem: undefined    
    }

    createListItems(listId, courses) {
        const courseElements = this.props[listId].map((course) => {
            const key = listId+"-"+course;
            return (
                <div key={key} className="random">
                    {course}
                </div>
            )}
        )

        return (
            <div id={listId} className="course-list">
                {courseElements}
            </div>
        )
    }

    setDraggedItem = (item: ListItem | undefined) => {
        this.setState({
            draggedItem: item
        });
    }

    getDraggedItem = (): ListItem | undefined => {
        return this.state.draggedItem;
    }

    setClickedItem = (item: ListItem | undefined) => {
        this.setState({
            clickedItem: item
        });
    }

    getClickedItem = (): ListItem | undefined => {
        return this.state.clickedItem;
    }

    getOriginalListId = (course: string) => {
        let listOrigin: string;
        switch(course) {
            case this.lists.lowerDivs[this.lists.lowerDivs.indexOf(course)]:
                listOrigin = "lowerDivList";
                break;
            case this.lists.upperDivs[this.lists.upperDivs.indexOf(course)]:
                listOrigin = "upperDivList";
                break;
            case this.lists.minorCourses[this.lists.minorCourses.indexOf(course)]:
                listOrigin = "minorList";
                break;
            case this.lists.breadths[this.lists.breadths.indexOf(course)]:
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

    dragItemToList = (dest: string) => {
        const course = this.state.draggedItem.props.name;
        const index = this.state.draggedItem.props.index;
        const source = this.state.draggedItem.props.currentList;
        if (source !== dest && this.isValidMovement(source, dest, course)) {
            let list1: Array<string> = this.props[source];
            let list2: Array<string> = this.props[dest];
            list1.splice(index, 1);
            if (SchedulerContainer.isClassList(dest)) {
                list2.splice(_.sortedIndex(list2, course), 0, course);
            } else {
                list2.push(course);
            }
            this.props.updateLists(source, dest, list1, list2);
        }
        this.setDraggedItem(undefined);
    }

    render() {
        this.lists = degreeData.getOriginalLists(this.props.majors, this.props.minors);
        const classLists = ["lowerDivList", "upperDivList", "breadthList", "minorList"];
        const scheduleLists = ["fa1List"];
        let cn = "lists-container";
        if (this.props.minors.length > 0) {
            cn += " minor-selected"
        }
        return (
            <div id="schedule-container">
                <div id="course-lists-container" className={cn}>
                    {classLists.map(listId => 
                        <CourseList
                            key={listId}
                            listId={listId}
                            courses={this.props[listId]} 
                            setDraggedItem={this.setDraggedItem}
                            getDraggedItem={this.getDraggedItem}
                            setClickedItem={this.setClickedItem}
                            getClickedItem={this.getClickedItem}
                            isValid={this.isValidMovement}
                            dragItemToList={this.dragItemToList}
                            getOriginalList={this.getOriginalListId}
                        />
                    )}
                </div>
                <div id="schedule-lists-container" className="lists-container">
                    {scheduleLists.map(listId => 
                        <CourseList 
                            key={listId}
                            listId={listId}
                            courses={this.props[listId]} 
                            setDraggedItem={this.setDraggedItem}
                            getDraggedItem={this.getDraggedItem}
                            setClickedItem={this.setClickedItem}
                            getClickedItem={this.getClickedItem}
                            isValid={this.isValidMovement}
                            dragItemToList={this.dragItemToList}
                            getOriginalList={this.getOriginalListId}
                        />
                    )}
                </div>
            </div>
        )
    }
}

export default SchedulerContainer;
