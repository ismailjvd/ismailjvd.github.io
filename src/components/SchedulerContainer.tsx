import * as React from 'react';
import CourseList from './CourseList';
import { DraggableItem } from './CourseList';
import degreeData from './DegreeData';
import { _ } from 'lodash';
import { faTrashAlt, faEllipsisV, faLink, faFileDownload, faFileImport } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Modal from './Modal';
import { ancestorHasClass } from '../functions/helperFunctions';
import DeleteContainer from './DeleteContainer';

/* Type Declarations */

type SchedulerProperties = {
    majors: Array<string>,
    minors: Array<string>,
    setModal: (modal: JSX.Element | undefined) => void
}

type ListData = {
    lowerDivs: Array<string>,
    upperDivs: Array<string>,
    minorCourses: Array<string>,
    breadths: Array<string>
}

type SchedulerState = {
    draggedItem: undefined | DraggableItem,
    clickedItem: undefined | DraggableItem,
    isMenuOpen: boolean,
    majors: Array<string>,
    minors: Array<string>,
    courseListMap: Object,
    lowerDivList: Array<string>,
    upperDivList: Array<string>,
    breadthList: Array<string>,
    minorList: Array<string>,
    fa1List: Array<string>,
    sp1List: Array<string>,
    fa2List: Array<string>,
    sp2List: Array<string>,
    fa3List: Array<string>,
    sp3List: Array<string>,
    fa4List: Array<string>,
    sp4List: Array<string>
}

type ListId = "lowerDivList" | "upperDivList" | "breadthList" | "minorList" | 
                "fa1List" | "sp1List" | "fa2List" | "sp2List" | "fa3List" | "sp3List" | 
                "fa4List" | "sp4List" | "custom";

/* State and Cache functions */

const getInitialState = (majors: Array<string>, minors: Array<string>): SchedulerState => {
    let state: SchedulerState = {
        draggedItem: undefined,
        clickedItem: undefined,
        isMenuOpen: false,
        majors: majors,
        minors: minors,
        courseListMap: degreeData.createCourseListMap(majors, minors), 
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
    const cacheKey: string = getCacheKey(majors, minors);
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

const cacheState = (key: string, state: SchedulerState) => {
    localStorage[key] = JSON.stringify(state);
}

const getStateFromCache = (key: string): SchedulerState => {
    const state: SchedulerState = JSON.parse(localStorage[key]);
    return state;
}

const getCacheKey = (majors: Array<string>, minors: Array<string>) => {
    majors = [...majors].sort();
    minors = [...minors].sort();
    const degrees = JSON.stringify(majors) + ";" + JSON.stringify(minors);
    return degrees;
}

class SchedulerContainer extends React.Component<SchedulerProperties> {

    /* State functions */

    static getDerivedStateFromProps(nextProps, prevState) {
        if(!(_.isEqual(nextProps.majors, prevState.majors) && 
            (_.isEqual(nextProps.minors, prevState.minors)))) {
            return getInitialState(nextProps.majors, nextProps.minors);
        }
        return null;
    }

    state = getInitialState(this.props.majors, this.props.minors);

    copyState = (): SchedulerState => {
        return {
            draggedItem: undefined,
            clickedItem: undefined,
            isMenuOpen: false,
            majors: [...this.state.majors],
            minors: [...this.state.minors],
            courseListMap: {...this.state.courseListMap},
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

    updateLists = (source: ListId, dest: ListId, list1: Array<string>, list2: Array<string>) => {
        let newState: SchedulerState = this.copyState();
        newState[source] = list1;
        newState[dest] = list2;
        cacheState(getCacheKey([...this.props.majors], [...this.props.minors]), newState);
        this.setState(newState);
    }

    /* Drag and Click hooks */

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

    moveItemToList = (source: ListId, dest: ListId, course: string) => {
        if (source !== dest && this.isValidMovement(source, dest, course)) {
            let list1: Array<string> = this.state[source];
            let list2: Array<string> = this.state[dest];
            let index = list1.indexOf(course);
            if (index !== -1) {
                list1.splice(index, 1);
                if (SchedulerContainer.isClassList(dest)) {
                    list2.splice(_.sortedIndex(list2, course), 0, course);
                } else {
                    list2.push(course);
                }
                this.updateLists(source, dest, list1, list2);
            }
        }
    }

    getOriginalListId = (course: string): ListId => {
        if(course in this.state.courseListMap) {
            return this.state.courseListMap[course];
        } else {
            return "custom";
        }
    }

    isValidMovement = (source: ListId, dest: ListId, course: string): boolean => {
        return (
            (!SchedulerContainer.isClassList(dest) || 
                dest === this.getOriginalListId(course))
        )
    }

    static isClassList(listId: ListId): boolean {
        const classLists: Array<string> = ["lowerDivList", "upperDivList", "breadthList", "minorList"];
        return classLists.indexOf(listId) !== -1;
    }

    /* JSX Helpers */

    getClassLists = (): Array<JSX.Element> => {
        const classLists: Array<ListId> = ["lowerDivList", "upperDivList", "breadthList", "minorList"];
        return (
            classLists.map(listId => 
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
            )
        )
    }

    getYearContainers = (): Array<JSX.Element> => {
        const scheduleLists: Array<ListId> = ["fa1List", "sp1List", "fa2List", "sp2List", "fa3List", "sp3List", "fa4List", "sp4List"];
        let yearContainers: Array<JSX.Element> = [];
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

    createMenu = (): JSX.Element => {
        const menuClass = this.state.isMenuOpen ? "menu-container menu-open" : "menu-container";
        return (
            <div className="menu-reference" id="menu-reference">
                <div className="schedule-button" id="menu-button" onClick={this.menuToggle}>
                    <FontAwesomeIcon icon={faEllipsisV} className="fa-icon"/>
                </div>
                <div className={menuClass} id="menu-container">
                    <div className="menu-row no-select" id="link-row" onClick={this.showModal("copy-link")}>
                        <div className="menu-icon" id="link-icon">
                            <FontAwesomeIcon icon={faLink} className="fa-icon"/>
                        </div>
                        <div className="menu-text">Get Shareable Link</div>
                    </div>
                    <div className="menu-row no-select" id="export-row" onClick={this.showModal("export")}>
                        <div className="menu-icon" id="export-icon">
                            <FontAwesomeIcon icon={faFileDownload} className="fa-icon"/>
                        </div>
                        <div className="menu-text">Export Schedule</div>
                    </div>
                    <div className="menu-row no-select" id="import-row" onClick={this.showModal("import")}>
                        <div className="menu-icon" id="import-icon">
                            <FontAwesomeIcon icon={faFileImport} className="fa-icon"/>
                        </div>
                        <div className="menu-text">Import Schedule</div>
                    </div>
                </div>
            </div>
        )
    }

    getCourseContainerClass = (): string => {
        return this.props.minors.length > 0 ? "lists-container minor-selected" : "lists-container";
    }

    /* Click Handlers */

    handleMenuOutsideClick = (e) => {
        if (this.state.isMenuOpen) {
            if (!ancestorHasClass(e.target, "menu-reference")) {
                document.removeEventListener("mousedown", this.handleMenuOutsideClick);
                this.setState({
                    isMenuOpen: false,
                })
            }
        }
    }

    menuToggle = () => {
        if (!this.state.isMenuOpen) {
            this.setState({
                isMenuOpen: true,
            }, () => { 
                document.addEventListener("mousedown", this.handleMenuOutsideClick);
            })
        } else {
            document.removeEventListener("mousedown", this.handleMenuOutsideClick);
            this.setState({
                isMenuOpen: false,
            })
        }
    }

    handleDeleteClick = () => {
        const cacheKey = getCacheKey(this.props.majors, this.props.minors);
        removeFromCache(cacheKey);
        this.setState(getInitialState(this.props.majors, this.props.minors));
    }

    showModal = (modalType: string) => {
        return () => {
            let modal = null;
            switch(modalType) {
                case "delete":
                    modal = 
                        <Modal 
                            message = "This action will delete the current schedule. Proceed?"
                            posText = "Clear"
                            negText = "Cancel"
                            posAction = {this.handleDeleteClick}
                            setModal = {this.props.setModal}
                        />
                    break;
                case "copy-link":
                    this.menuToggle();
                    modal = 
                        <Modal 
                            message = "URL: "
                            posText = "Copy Link"
                            negText = "Cancel"
                            posAction = {() => {}}
                            setModal = {this.props.setModal}
                        />
                    break;
                case "export":
                        this.menuToggle();
                        modal = 
                            <Modal 
                                message = "Save your current schedule as a .sch, which can later be imported"
                                posText = "Download"
                                negText = "Cancel"
                                posAction = {() => {}}
                                setModal = {this.props.setModal}
                            />
                        break;
                case "import":
                        this.menuToggle();
                        modal = 
                            <Modal 
                                message = "Load a schedule from a .sch file"
                                posText = "Browse"
                                negText = "Cancel"
                                posAction = {() => {}}
                                setModal = {this.props.setModal}
                            />
                        break;
                default: 
                    break;
            }
            if (modal) {
                this.props.setModal(modal);
            }
        }
    }

    render() {
        return (
            <div id="scheduler-container">
                <div id="courses-main-container" className="main-container">
                    <div id="course-lists-title" className="lists-title">Your Classes</div>
                    <div id="course-lists-container" className={this.getCourseContainerClass()}>
                        {this.getClassLists()}
                    </div>
                </div>
                <div id="scheduler-main-container" className="main-container">
                    <div id="schedule-lists-title" className="lists-title">Your Schedule</div>
                    <div id="delete-schedule" className="schedule-button" onClick={this.showModal("delete")}>
                        <FontAwesomeIcon icon={faTrashAlt} />
                    </div>
                    {this.createMenu()}
                    <div id="schedule-lists-container" className="lists-container">
                        {this.getYearContainers()}
                    </div>
                </div>
                <DeleteContainer 
                    getDraggedItem={this.getDraggedItem} 
                    setDraggedItem={this.setDraggedItem}
                    getClickedItem={this.getClickedItem}
                    setClickedItem={this.setClickedItem}
                    moveItemToList={this.moveItemToList}
                />
            </div>
        )
    }
}

export default SchedulerContainer;
export { ListId, ListData };

