import * as React from 'react';

type ListProperties = {
    listId: string;
    courses: Array<string>;
    setDraggedItem: (item: ListItem | undefined) => void;
    getDraggedItem: () => ListItem | undefined;
    setClickedItem: (item: ListItem | undefined) => void;
    getClickedItem: () => ListItem | undefined;
    dragItemToList: (listId) => void;
}

type ListItemProperites = {
    name: string;
    index: number;
    courseType: string;
    currentList: string;
    setDraggedItem: (item: ListItem | undefined) => void;
    getDraggedItem: () => ListItem | undefined;
    setClickedItem: (item: ListItem | undefined) => void;
    getClickedItem: () => ListItem | undefined;
}

class ListItem extends React.Component<ListItemProperites> {

    state = {
        dragging: false,
        clicked: false,
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
        console.log(this.props.getDraggedItem());
        this.props.setDraggedItem(undefined);
        this.setState({
            dragging: false
        })
    }

    render() {
        let className = "list-item " + this.props.courseType;
        if (this.state.dragging) {
            className += " dragging";
        } else if (this.state.clicked) {
            className += " clicked";
        }
            
        return (
            <div 
                className={className} 
                draggable="true"
                onDragStart={this.handleDragStart}
                onDragEnd={this.handleDragEnd}
            >
                {this.props.name}
            </div>
        )
    }
}

const MemoListItem = React.memo(ListItem);

class CourseList extends React.Component<ListProperties> {

    handleDragEnter = (e) => {
        e.preventDefault();
    }

    handleDragOver = (e) => {
        e.preventDefault();
    }

    handleDragLeave = (e) => {

    }

    handleDrop = (e) => {
        if (this.props.getDraggedItem()) {
            this.props.dragItemToList(this.props.listId);
        }
    }

    render() {
        if (this.props.courses.length === 0 && this.props.listId === "minorList") {
            return <div className="empty-div"></div>
        }
        return (
            <div 
                id={this.props.listId} 
                className="course-list"
                onDragEnter={this.handleDragEnter}
                onDragOver={this.handleDragOver}
                onDragLeave={this.handleDragLeave}
                onDrop={this.handleDrop}
            >
                {this.props.courses.map((course, index) => 
                    <MemoListItem 
                        key={index} 
                        name={course} 
                        index={index} 
                        courseType={"lower-div"}
                        currentList={this.props.listId}
                        setDraggedItem={this.props.setDraggedItem}
                        getDraggedItem={this.props.getDraggedItem}
                        setClickedItem={this.props.setClickedItem}
                        getClickedItem={this.props.getClickedItem}
                    ></MemoListItem>)
                }
            </div>
        )
    }
}



export default CourseList;
export {ListItem};