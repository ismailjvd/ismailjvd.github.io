import * as React from 'react';
import CourseList from './CourseList';
import { ListItem } from './CourseList';
import { string } from 'prop-types';
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

class SchedulerContainer extends React.Component<SchedulerProperties> {

    draggedItem: ListItem | undefined = undefined;
    clickedItem: ListItem | undefined = undefined;

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
        this.draggedItem = item;
    }

    getDraggedItem = (): ListItem | undefined => {
        return this.draggedItem;
    }

    setClickedItem = (item: ListItem | undefined) => {
        this.clickedItem = item;
    }

    getClickedItem = (): ListItem | undefined => {
        return this.clickedItem ;
    }

    isValidMovement = (source: string, dest: string) => {
        const classLists: Array<string> = ["lowerDivList", "upperDivList", "breadthList", "minorList"];
        return (
            source !== dest && 
            (!this.isClassList(dest) || !this.isClassList(source))
        )
    }

    dragItemToList = (dest: string) => {
        const course = this.draggedItem.props.name;
        const index = this.draggedItem.props.index;
        const source = this.draggedItem.props.currentList;
        const classLists: Array<string> = ["lowerDivList", "upperDivList", "breadthList", "minorList"];
        console.log(course, source, dest);
        if (this.isValidMovement(source, dest)) {
            let list1: Array<string> = this.props[source];
            let list2: Array<string> = this.props[dest];
            list1.splice(index, 1);
            if (this.isClassList(dest)) {
                list2.splice(_.sortedIndex(list2, course), 0, course);
            } else {
                list2.push(course);
            }
            this.props.updateLists(source, dest, list1, list2);
        }
        this.setDraggedItem(undefined);
    }

    isClassList(listId: string): boolean {
        const classLists: Array<string> = ["lowerDivList", "upperDivList", "breadthList", "minorList"];
        return classLists.indexOf(listId) !== -1;
    }

    render() {
        return (
                <div id="schedule-container">
                    <div id="course-lists-container" className="lists-container">
                        <CourseList 
                            listId="lowerDivList" 
                            courses={this.props.lowerDivList} 
                            setDraggedItem={this.setDraggedItem}
                            getDraggedItem={this.getDraggedItem}
                            setClickedItem={this.setClickedItem}
                            getClickedItem={this.getClickedItem}
                            dragItemToList={this.dragItemToList}
                        />
                        <CourseList 
                            listId="upperDivList" 
                            courses={this.props.upperDivList} 
                            setDraggedItem={this.setDraggedItem}
                            getDraggedItem={this.getDraggedItem}
                            setClickedItem={this.setClickedItem}
                            getClickedItem={this.getClickedItem}
                            dragItemToList={this.dragItemToList}
                        />
                        <CourseList 
                            listId="breadthList" 
                            courses={this.props.breadthList} 
                            setDraggedItem={this.setDraggedItem}
                            getDraggedItem={this.getDraggedItem}
                            setClickedItem={this.setClickedItem}
                            getClickedItem={this.getClickedItem}
                            dragItemToList={this.dragItemToList}
                        />
                        <CourseList 
                            listId="minorList" 
                            courses={this.props.minorList} 
                            setDraggedItem={this.setDraggedItem}
                            getDraggedItem={this.getDraggedItem}
                            setClickedItem={this.setClickedItem}
                            getClickedItem={this.getClickedItem}
                            dragItemToList={this.dragItemToList}
                        />
                    </div>
                    <div id="schedule-lists-container" className="lists-container">
                        <CourseList 
                            listId="fa1List" 
                            courses={this.props.fa1List} 
                            setDraggedItem={this.setDraggedItem}
                            getDraggedItem={this.getDraggedItem}
                            setClickedItem={this.setClickedItem}
                            getClickedItem={this.getClickedItem}
                            dragItemToList={this.dragItemToList}
                        />
                    </div>
                </div>
        )
    }
}

export default SchedulerContainer;
