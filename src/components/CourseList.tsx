import * as React from 'react';
import SchedulerContainer from './SchedulerContainer';
import DraggableItem, { draggablesAreEqual } from './DraggableItem';
import { ListId } from './SchedulerContainer';
import { faPlusSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

/* Type Declarations */

type ListProperties = {
    listId: ListId;
    courses: Array<string>;
    setDraggedItem: (item: DraggableItem | undefined) => void;
    getDraggedItem: () => DraggableItem | undefined;
    setClickedItem: (item: DraggableItem | undefined) => void;
    getClickedItem: () => DraggableItem | undefined;
    isValid: (source: ListId, dest: ListId, course: string) => boolean;
    moveItemToList: (source: ListId, dest: ListId, course: string) => void;
    getOriginalList: (course: string) => ListId;
    addClass: (listId: ListId, course:string) => void;
}

type ListState = {
    dragging: boolean,
    droppable: boolean,
    filter: string
}

type SearchBarProperties = {
    setFilter: (s:string) => void,
    value: string
}

type AddClassBarProperties = {
    listId: ListId,
    addClass: (s: string) => void
}

const listIdToTitle = {
    "lowerDivList": "Lower Division",
    "upperDivList": "Upper Division",
    "breadthList": "Breadths",
    "minorList": "Minor Courses",
    "fa1List": "Fall",
    "fa2List": "Fall",
    "fa3List": "Fall",
    "fa4List": "Fall",
    "sp1List": "Spring",
    "sp2List": "Spring",
    "sp3List": "Spring",
    "sp4List": "Spring"
}

const courseAbbreviations = {
    "CS": ["COMPSCI"],
    "EE": ["EECS", "EL ENG"]
}

/* React Declarations */

class SearchBar extends React.Component<SearchBarProperties> {
    render() {
        return <input 
            type="text" 
            className="list-search-bar no-select" 
            value={this.props.value} 
            placeholder="&#xf002;  Search for a class..."
            onChange={(e) => this.props.setFilter(e.target.value)}
            maxLength={20}
        />
    }
}

function AddClassBar(props: AddClassBarProperties) {
    return  (
        <div className="add-bar-container">
            <input 
                type="text" 
                className="add-class-bar no-select" 
                placeholder="Add new class..."
                id={props.listId + "-" + "add-bar"}
                maxLength={20}
                onKeyDown={(e) => {
                    if (e.keyCode === 13) {
                        const input: HTMLInputElement = document.getElementById(props.listId + "-" + "add-bar") as HTMLInputElement;
                        props.addClass(input.value);
                        input.value = "";
                    }
                }}
            />
            <div 
                className="add-class-button"
                onClick={(e) => {
                    const input: HTMLInputElement = document.getElementById(props.listId + "-" + "add-bar") as HTMLInputElement;
                    props.addClass(input.value);
                    input.value = "";
                }}
            >
                <FontAwesomeIcon icon={faPlusSquare}/>
            </div>
        </div>
    )
}

const MemoDraggableItem = React.memo(DraggableItem, draggablesAreEqual);

class CourseList extends React.Component<ListProperties> {

    /* To keep track of dragEnter, dragLeave */
    counter: number = 0;

    state: ListState = {
        dragging: false,
        droppable: true,
        filter: ""
    }

    static getDerivedStateFromProps(nextProps: ListProperties, prevState: ListState) {
        if(!nextProps.getDraggedItem() && prevState.dragging) {
            return {dragging: false};
        }
        return null;
    }

    /* Drag / Drop functions */

    handleDragEnter = (e) => {
        e.preventDefault();
        this.counter += 1;
        const draggedItem: DraggableItem | undefined = this.props.getDraggedItem();
        let isDroppable = true;
        if (draggedItem) {
            const source: ListId = draggedItem.props.currentList;
            const course: string = draggedItem.props.name;
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
            const item: DraggableItem = this.props.getDraggedItem();
            const course: string = item.props.name;
            const source: ListId = item.props.currentList;
            const dest: ListId = this.props.listId;
            this.props.moveItemToList(source, dest, course);
            this.props.setDraggedItem(undefined);
        }
        e.stopPropagation();
    }

    /* Click Handlers */

    handleClick = () => {
        if (this.props.getClickedItem()) {
            const item: DraggableItem = this.props.getClickedItem();
            const course: string = item.props.name;
            const source: ListId = item.props.currentList;
            const dest: ListId = this.props.listId;
            this.props.moveItemToList(source, dest, course);
            this.props.setClickedItem(undefined);
        }
    }

    /* Search Bar Functions */

    filterWhiteSpace = (s: string): string => {
        return s.trim().replace(/\s\s+/g, ' ');
    }

    getPossibleFilters = (s: string): Array<string> => {
        s = s.toUpperCase();
        let filters: Array<string> = [s];
        for (const abbr in courseAbbreviations) {
            if (s.indexOf(abbr) === 0) {
                courseAbbreviations[abbr].forEach((newS: string) =>
                    filters.push(newS + s.substring(2))
                )
            }
        }
        let copyFilters: Array<string> = [...filters];
        copyFilters.forEach((s: string) => {
            for (let i=1; i<s.length; i++) {
                if (s[i] >= '0' && s[i] <='9' && s[i-1] >= 'A' && s[i-1] <= 'Z') {
                    filters.push(s.substring(0, i) + " " + s.substring(i));
                }
            }
        })
        return filters;
    }

    filteredList = (list: Array<string>): Array<string> => {
        const filter: string = this.filterWhiteSpace(this.state.filter).toUpperCase();
        if (filter.length > 0) {
            const filters: Array<string> = this.getPossibleFilters(filter);
            return list.filter((course: string) => 
                filters.some((s: string) => course.indexOf(s) !== -1))
        }
        return list;
    }


    setFilter = (s: string) => {
        this.setState({
            filter: s
        })
    }

    addClass = (s: string) => {
        s = s.toUpperCase().trim();
        if (s.length > 0 && this.isValidClass(s)) {
            this.props.addClass(this.props.listId, s);
        } else {
            console.log("Input contains invalid characters");
        }
    }

    isValidClass = (s: string): boolean => {
        var letterNumber = /^[0-9a-zA-Z\s]+$/
        if (s.match(letterNumber)) {
            return true;
        }
        return false;
    }

    /* JSX Helpers */

    getClickOverlay = (): JSX.Element => {
        if (this.props.getClickedItem()) {
            const item: DraggableItem = this.props.getClickedItem();
            let overlayClass: string = "click-overlay";
            if (this.props.isValid(item.props.currentList, this.props.listId, item.props.name)) {
                overlayClass += " can-click";
            } else {
                overlayClass += " no-click";
            }
            return (
                <div
                    className={overlayClass}
                    onClick={this.handleClick}
                />
            )
        }
        return null;
    }

    getListClass = (): string => {
        let cn = "course-list";
        if (this.props.getDraggedItem()) {
            if (this.state.dragging) {
                cn = this.state.droppable ? cn + " can-drop" : cn + " no-drop";
            }
        }
        return cn;
    }

    getItemClass = (course: string): string => {
        let className = "course-item";
        const draggedItem = this.props.getDraggedItem();
        if (draggedItem && draggedItem.props.name === course) {
            className += " dragging";
        }
        const clickedItem = this.props.getClickedItem();
        if (clickedItem && clickedItem.props.name === course) {
            className += " clicked";
        }
        return className;
    }

    getListInputBar = (): JSX.Element => {
        return SchedulerContainer.isClassList(this.props.listId) ?
                <SearchBar setFilter={this.setFilter} value={this.state.filter} /> : 
                AddClassBar({ listId: this.props.listId, addClass: this.addClass });
    }

    render() {
        if (this.props.courses.length === 0 && this.props.listId === "minorList") {
            return null;
        }
        return (
            <div className="list-wrapper">
                <div className="list-title no-select">{listIdToTitle[this.props.listId]}</div>
                <div className="search-with-list">
                    {this.getListInputBar()}
                    <div 
                        id={this.props.listId} 
                        className={this.getListClass()}
                        onDragEnter={this.handleDragEnter}
                        onDragOver={this.handleDragOver}
                        onDragLeave={this.handleDragLeave}
                        onDrop={this.handleDrop}
                    >
                        {this.filteredList(this.props.courses).map((course, index) => 
                            <MemoDraggableItem 
                                key={index} 
                                name={course} 
                                currentList={this.props.listId}
                                itemClass={this.getItemClass(course)}
                                originalList={this.props.getOriginalList(course)}
                                setDraggedItem={this.props.setDraggedItem}
                                getDraggedItem={this.props.getDraggedItem}
                                setClickedItem={this.props.setClickedItem}
                                getClickedItem={this.props.getClickedItem}
                            ></MemoDraggableItem>)
                        }
                    </div>
                </div>
                {this.getClickOverlay()}
            </div>
        )
    }
}



export default CourseList;
export { DraggableItem };