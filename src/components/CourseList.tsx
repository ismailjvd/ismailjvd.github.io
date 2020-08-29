import * as React from 'react';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import SchedulerContainer from './SchedulerContainer';

type ListProperties = {
    listId: string;
    courses: Array<string>;
    setDraggedItem: (item: DraggableItem | undefined) => void;
    getDraggedItem: () => DraggableItem | undefined;
    setClickedItem: (item: DraggableItem | undefined) => void;
    getClickedItem: () => DraggableItem | undefined;
    isValid: (source, dest, course) => boolean;
    dragItemToList: (listId) => void;
    getOriginalList: (course) => string;
}

type DraggableItemProperites = {
    name: string;
    index: number;
    currentList: string;
    originalList: string;
    itemClass: string;
    setDraggedItem: (item: DraggableItem | undefined) => void;
    getDraggedItem: () => DraggableItem | undefined;
    setClickedItem: (item: DraggableItem | undefined) => void;
    getClickedItem: () => DraggableItem | undefined;
}

type SearchBarProperties = {
    setFilter: (s:string) => void;
    value: string;
}

const listIdToTitle = {
    "lowerDivList": "Lower Division",
    "upperDivList": "Upper Division",
    "breadthList": "Breadths",
    "minorList": "Minor Courses",
    "fa1List": "Fall",
    "fa2List": "Fall",
    "fa3List": "Fall",
    "fa4List": "Fall"
}

const CourseItem = (props) => <div className = {props.className}>{props.name}</div>
const MemoCourseItem = React.memo(CourseItem);

class SearchBar extends React.Component<SearchBarProperties> {
    render() {
        return <input 
            type="text" 
            className="list-search-bar" 
            value={this.props.value} 
            placeholder="&#xf002;  Search for a class..."
            onChange={(e) => this.props.setFilter(e.target.value)}
        />
    }
}

class DraggableItem extends React.Component<DraggableItemProperites> {

    state = {
        dragging: false,
        clicked: false,
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if(!nextProps.getDraggedItem() && prevState.dragging) {
            return {dragging: false};
        }
        return null;
    }

    handleDragStart = () => {
        if (!this.props.getDraggedItem()) {
            this.props.setDraggedItem(this);
            this.setState({
                dragging: true
            })
        }
    }

    handleDragEnd = () => {
        if (this.props.getDraggedItem()) {
            this.props.setDraggedItem(undefined);
        }
    }

    render() {
        let className = this.props.itemClass;
        className += " " + this.props.originalList;
        if (this.state.dragging) {
            className += " dragging";
        } else if (this.state.clicked) {
            className += " clicked";
        }
        return (
            <div 
                className="draggable-item"
                draggable="true"
                onDragStart={this.handleDragStart}
                onDragEnd={this.handleDragEnd}
            >
                <MemoCourseItem
                    className={className}
                    name={this.props.name}
                />
            </div>
        )
    }
}

const MemoDraggableItem = React.memo(DraggableItem);

class CourseList extends React.Component<ListProperties> {

    counter = 0;

    state = {
        dragging: false,
        droppable: true,
        filter: ""
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if(!nextProps.getDraggedItem() && prevState.dragging) {
            return {dragging: false};
        }
        return null;
    }

    handleDragEnter = (e) => {
        e.preventDefault();
        this.counter += 1;
        const draggedItem = this.props.getDraggedItem();
        let isDroppable = true;
        if (draggedItem) {
            const source = draggedItem.props.currentList;
            const course = draggedItem.props.name;
            if (!this.props.isValid(source, this.props.listId, course)) {
                isDroppable = false;
            }
        }
        if (this.counter > 0 && isDroppable != this.state.droppable || 
                !this.state.dragging) {
            this.setState({
                dragging: true,
                droppable: isDroppable,
            })
        }
    }

    handleDragOver = (e) => {
        e.preventDefault();
    }

    handleDragLeave = (e) => {
        this.counter -= 1;
        if (this.state.dragging && this.counter <= 0) {
            this.counter = 0;
            this.setState({
                dragging: false
            })
        }
    }

    handleDrop = (e) => {
        this.counter = 0;
        if (this.props.getDraggedItem()) {
            this.props.dragItemToList(this.props.listId);
        }
        e.stopPropagation();
    }

    filteredList = (list: Array<string>) => {
        if (this.state.filter.length > 0) {
            const filter = this.state.filter.toUpperCase();
            return list.filter(course => course.toUpperCase().indexOf(filter) !== -1);
        }
        return list;
    }

    setFilter = (s: string) => {
        this.setState({
            filter: s
        })
    }

    render() {
        if (this.props.courses.length === 0 && this.props.listId === "minorList") {
            return <div className="empty-div"></div>
        }
        let cn = "course-list";
        let listItemClass = "course-item";
        if (this.props.getDraggedItem()) {
            listItemClass += " dragging-list";
            if (this.state.dragging) {
                cn = this.state.droppable ? cn + " can-drop" : cn + " no-drop";
            }
        }
        const courseList = this.filteredList(this.props.courses);
        const searchBar = SchedulerContainer.isClassList(this.props.listId) ?
            <SearchBar setFilter={this.setFilter} value={this.state.filter} /> : null;
        return (
            <div className="list-wrapper">
                <div className="list-title">{listIdToTitle[this.props.listId]}</div>
                <div className="search-with-list">
                    {searchBar}
                    <div 
                        id={this.props.listId} 
                        className={cn}
                        onDragEnter={this.handleDragEnter}
                        onDragOver={this.handleDragOver}
                        onDragLeave={this.handleDragLeave}
                        onDrop={this.handleDrop}
                    >
                        {courseList.map((course, index) => 
                            <MemoDraggableItem 
                                key={index} 
                                name={course} 
                                index={index} 
                                currentList={this.props.listId}
                                itemClass={listItemClass}
                                originalList={this.props.getOriginalList(course)}
                                setDraggedItem={this.props.setDraggedItem}
                                getDraggedItem={this.props.getDraggedItem}
                                setClickedItem={this.props.setClickedItem}
                                getClickedItem={this.props.getClickedItem}
                            ></MemoDraggableItem>)
                        }
                    </div>
                </div>
            </div>
        )
    }
}



export default CourseList;
export {DraggableItem};