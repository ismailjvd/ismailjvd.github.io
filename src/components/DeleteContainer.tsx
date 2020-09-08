import * as React from "react";
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DraggableItem } from "./CourseList";
import SchedulerContainer, { ListId } from "./SchedulerContainer";

type DeleteContainerProps = {
    getDraggedItem: () => DraggableItem | undefined;
    setDraggedItem: (item: DraggableItem | undefined) => void;
    getClickedItem: () => DraggableItem | undefined;
    setClickedItem: (item: DraggableItem | undefined) => void;
    moveItemToList: (source: ListId, dest: ListId, course: string) => void;
}

type DeleteContainerState = {
    dragging: boolean;
}

export default class DeleteContainer extends React.Component<DeleteContainerProps> {

    counter = 0;

    state: DeleteContainerState = {
        dragging: false
    }

    static getDerivedStateFromProps(nextProps: DeleteContainerProps, prevState: DeleteContainerState) {
        if(!nextProps.getDraggedItem() && prevState.dragging) {
            return {dragging: false};
        }
        return null;
    }

    handleDragEnter = (e) => {
        e.preventDefault();
        this.counter += 1;
        if (!this.state.dragging) {
            this.setState({
                dragging: true
            })
        }
    }

    handleDragLeave = (e) => {
        this.counter -= 1;
        if (this.state.dragging && this.counter <= 0) {
            this.counter = 0;
            console.log("set dragging false");
            this.setState({
                dragging: false
            })
        }
    }

    handleDragOver = (e) => {
        e.preventDefault();
    }

    handleDrop = (e) => {
        this.counter = 0;
        if (this.props.getDraggedItem()) {
            const item: DraggableItem = this.props.getDraggedItem();
            const course: string = item.props.name;
            const source: ListId = item.props.currentList;
            const dest: ListId = item.props.originalList;
            this.props.moveItemToList(source, dest, course);
            this.props.setDraggedItem(undefined);
        }
        e.stopPropagation();
    }

    handleClick = () => {
        if (this.props.getClickedItem()) {
            const item: DraggableItem = this.props.getClickedItem();
            const course: string = item.props.name;
            const source: ListId = item.props.currentList;
            const dest: ListId = item.props.originalList;
            this.props.moveItemToList(source, dest, course);
            this.props.setClickedItem(undefined);
        }
    }

    getDeleteClass = () => {
        let cn = "delete-container";
        if (this.state.dragging && this.counter > 0) {
            cn += " delete-drop";
        } else if (this.props.getClickedItem()) {
            cn += " delete-clicked";
        }
        return cn;
    }

    getDeleteText = (item: DraggableItem) => {
        if (item.props.originalList === "custom") {
            return "Delete Class";
        } else {
            return "Remove From List";
        }
    }

    getDeleteContainer = () => {
        let item: DraggableItem = this.props.getDraggedItem();
        if (item) {
            if (!SchedulerContainer.isClassList(item.props.currentList)) {
                return (
                    <div 
                        className={this.getDeleteClass()} 
                        onDragEnter={this.handleDragEnter} 
                        onDragLeave={this.handleDragLeave}
                        onDragOver={this.handleDragOver}
                        onDrop={this.handleDrop}
                    >
                        <FontAwesomeIcon icon={faTrashAlt} className="delete-course"/>
                        <div className="delete-text">{this.getDeleteText(item)}</div>
                    </div>
                )
            }
        }
        item = this.props.getClickedItem();
        if (item) {
            if (!SchedulerContainer.isClassList(item.props.currentList)) {
                return (
                    <div 
                        className={this.getDeleteClass()}
                        onClick={this.handleClick} 
                    >
                        <FontAwesomeIcon icon={faTrashAlt} className="delete-course"/>
                        <div className="delete-text">{this.getDeleteText(item)}</div>
                    </div>
                )
            }
        }
        return null;
    }

    render() {
        return this.getDeleteContainer();
    }
}