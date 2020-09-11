import * as React from 'react';
import { ListId } from './SchedulerContainer';
import { ancestorHasClass } from '../functions/helperFunctions';
import { toast } from 'react-toastify';

type DraggableItemProperites = {
    name: string;
    currentList: ListId;
    originalList: ListId;
    itemClass: string;
    setDraggedItem: (item: DraggableItem | undefined) => void;
    getDraggedItem: () => DraggableItem | undefined;
    setClickedItem: (item: DraggableItem | undefined) => void;
    getClickedItem: () => DraggableItem | undefined;
}

const draggablesAreEqual = (prevProps: DraggableItemProperites, nextProps: DraggableItemProperites): boolean => {
    return (prevProps.name === nextProps.name)  &&
        (prevProps.originalList === nextProps.originalList) &&
        (prevProps.itemClass === nextProps.itemClass);
}

export default class DraggableItem extends React.PureComponent<DraggableItemProperites> {

    handleClick = () => {
        if (!this.props.getClickedItem()) {
            this.props.setClickedItem(this);
            document.addEventListener("mousedown", this.handleOutsideClick);
            if (!localStorage["starting-toast"]) {
                if (toast.isActive("starting-toast")) {
                    toast.dismiss("starting-toast");
                }
                localStorage["starting-toast"] = "false";
            }
        }
    }

    handleOutsideClick = (e) => {
        document.removeEventListener("mousedown", this.handleOutsideClick);
        if (!e.target.classList.contains("click-overlay") && !ancestorHasClass(e.target, "delete-container")) {
            this.props.setClickedItem(undefined);
        }
    }

    handleDragStart = () => {
        if (!this.props.getDraggedItem()) {
            this.props.setDraggedItem(this);
            if (!localStorage["starting-toast"]) {
                if (toast.isActive("starting-toast")) {
                    toast.dismiss("starting-toast");
                }
                localStorage["starting-toast"] = "false";
            }
        }
    }

    handleDragEnd = () => {
        if (this.props.getDraggedItem()) {
            this.props.setDraggedItem(undefined);
        }
    }

    handleTouchEnd = () => {
        if (this.props.getDraggedItem()) {
            this.props.setDraggedItem(undefined);
            this.handleClick();
        }
    }

    render() {
        let className = this.props.itemClass;
        className += " " + this.props.originalList;
        return (
            <div 
                className="draggable-item"
                draggable="true"
                onDragStart={this.handleDragStart}
                onDragEnd={this.handleDragEnd}
                onClick={this.handleClick}
                onTouchEnd={this.handleTouchEnd}
            >
                <div className={className}>
                    {this.props.name}
                </div>
            </div>
        )
    }
}

export { draggablesAreEqual };