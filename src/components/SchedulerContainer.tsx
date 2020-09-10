import * as React from 'react';
import CourseList from './CourseList';
import { DraggableItem } from './CourseList';
import degreeData from './DegreeData';
import { _ } from 'lodash';
import { faTrashAlt, faEllipsisV, faLink, faFileDownload, faFileImport } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Modal from './Modal';
import { ancestorHasClass, copyToClipboard } from '../functions/helperFunctions';
import DeleteContainer from './DeleteContainer';
import { toast } from 'react-toastify';

/* Type Declarations */

type SchedulerProperties = {
    majors: Array<string>,
    minors: Array<string>,
    setModal: (modal: JSX.Element | undefined) => void,
    updateDegrees: (majors: Array<string>, minors: Array<string>) => void;
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

const getInitialState = (majors: Array<string>, minors: Array<string>, prevState?: SchedulerState): SchedulerState => {
    if (window.location.search.length > 0) {
        return getStateFromURL();
    }
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
    let cacheKey: string = getCacheKey(majors, minors);
    if (localStorage[cacheKey]) {
        state = getStateFromCache(cacheKey);
        // Ensures there are no duplicates in any of the class lists
        state = constructStateFromSchedule(state);
    } else if (prevState && canUsePrevState(prevState, majors)) {
        state = copyState(prevState);
        state.majors = majors;
        state.minors = minors;
        state = constructStateFromSchedule(state);
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

// Can preserve state on adding major/minor, changing last major, or changing minor
const canUsePrevState = (prevState: SchedulerState, majors: Array<string>) => {
    return (
        (_.isEqual(prevState.majors, majors) 
            || _.isEqual([...majors].slice(0, majors.length-1), prevState.majors) 
            || (majors.length > 1
                && 
                _.isEqual([...majors].slice(0, majors.length-1), 
                    [...prevState.majors].slice(0, prevState.majors.length-1))
                )
        )
    )
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

const copyState = (state: SchedulerState): SchedulerState => {
    return {
        draggedItem: undefined,
        clickedItem: undefined,
        isMenuOpen: false,
        majors: [...state.majors],
        minors: [...state.minors],
        courseListMap: {...state.courseListMap},
        lowerDivList: [...state.lowerDivList],
        upperDivList: [...state.upperDivList],
        breadthList: [...state.breadthList],
        minorList: [...state.minorList],
        fa1List: [...state.fa1List],
        sp1List: [...state.sp1List],
        fa2List: [...state.fa2List],
        sp2List: [...state.sp2List],
        fa3List: [...state.fa3List],
        sp3List: [...state.sp3List],
        fa4List: [...state.fa4List],
        sp4List: [...state.sp4List]
    }
}

const getStateFromURL = (): SchedulerState => {
    const queryString = window.location.search;
    let u = new URLSearchParams(queryString);
    let state = {};
    let keys = ["majors", "minors", "fa1List", "sp1List", "fa2List", "sp2List", "fa3List", "sp3List", "fa4List", "sp4List"];
    keys.forEach(key => {
        if (u.has(key)) {
            let list: Array<string> = JSON.parse(u.get(key));
            state[key] = list;
        } else {
            state[key] = [];
        }
    });
    let newState = constructStateFromSchedule(state);
    cacheState(getCacheKey(newState.majors, newState.minors), newState);
    window.location.search = "";
    return newState;
}

const constructStateFromSchedule = (state: Partial<SchedulerState>): SchedulerState => {
    let newState: SchedulerState = {
        draggedItem: undefined,
        clickedItem: undefined,
        isMenuOpen: false,
        majors: state.majors,
        minors: state.minors,
        courseListMap: degreeData.createCourseListMap(state.majors, state.minors), 
        lowerDivList: degreeData.getSortedLowerDivs(state.majors),
        upperDivList: degreeData.getSortedUpperDivs(state.majors),
        breadthList: degreeData.getSortedBreadths(state.majors, state.minors),
        minorList: degreeData.getSortedMinorCourses(state.majors, state.minors),
        fa1List: state.fa1List,
        sp1List: state.sp1List,
        fa2List: state.fa2List,
        sp2List: state.sp2List,
        fa3List: state.fa3List,
        sp3List: state.sp3List,
        fa4List: state.fa4List,
        sp4List: state.sp4List
    };

    return getStateWithNoDuplicates(newState);
}

const getStateWithNoDuplicates = (state: SchedulerState): SchedulerState => {
    let newState = copyState(state);
    let scheduleCourses: Array<string> = [];
    let scheduleLists = ["fa1List", "sp1List", "fa2List", "sp2List", "fa3List", "sp3List", "fa4List", "sp4List"];
    scheduleLists.forEach(listId => {
        let list = newState[listId];
        scheduleCourses = [...scheduleCourses].concat([...list]);
    });
    scheduleCourses.forEach(course => {
        if (course in newState.courseListMap) {
            let listId: ListId = newState.courseListMap[course];
            let list: Array<string> = newState[listId];
            if (list.indexOf(course) !== -1) {
                list.splice(list.indexOf(course), 1);
                newState[listId] = [...list];
            }
        }
    })
    return newState;
}


class SchedulerContainer extends React.Component<SchedulerProperties> {

    /* State functions */

    static getDerivedStateFromProps(nextProps: SchedulerProperties, prevState: SchedulerState) {
        if(!(_.isEqual([...nextProps.majors].sort(), [...prevState.majors].sort()) && 
            (_.isEqual([...nextProps.minors].sort(), [...prevState.minors].sort())))) {
            return getInitialState(nextProps.majors, nextProps.minors, prevState);
        }
        return null;
    }

    state = getInitialState(this.props.majors, this.props.minors);

    isSchedulerState(state: any): state is SchedulerState {
        /* TODO: develop more accurate scheduler state checking system */
        let s = state as SchedulerState;
        if (s.majors && s.minors) {
            return true;
        }
        return false;
    }

    downloadStateAsJSON = () => {
        const jsonData = JSON.stringify(copyState(this.state));
        const data = "text/json;charset=utf-8," + encodeURIComponent(jsonData);
        let a = document.createElement('a');
        a.href = "data:" + data;
        a.download = "schedule.sch";
        let container = document.getElementById("main-container");
        container.appendChild(a);
        a.click();
        container.removeChild(a);
    }

    uploadJSONFile = () => {
        let fileElement = document.getElementById("file");
        fileElement.addEventListener("change", this.readScheduleFile);
        fileElement.click();
    }

    readScheduleFile = (evt) => {
        const files = evt.target.files;
        const file = files[0];           
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                let newState = JSON.parse(event.target.result as string);
                newState.draggedItem = undefined;
                newState.clickedItem = undefined;
                if (this.isSchedulerState(newState)) {
                    cacheState(getCacheKey(newState.majors, newState.minors), newState);
                    this.setState(newState);
                    this.props.updateDegrees(newState.majors, newState.minors);
                } else {
                    toast.error('Invalid file format', {
                        position: "bottom-center",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                    });
                }
            } catch (SyntaxError) {
                toast.error('Invalid file format', {
                    position: "bottom-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
            }
        }
        reader.readAsText(file);
        let fileElement: HTMLInputElement = document.getElementById("file") as HTMLInputElement;
        fileElement.removeEventListener("change", this.readScheduleFile);
        fileElement.value = "";
    }

    getStringifiedScheduleState = () => {
        const state = {
            majors: JSON.stringify(this.state.majors),
            minors: JSON.stringify(this.state.minors),
        }
        const scheduleLists: Array<ListId> = ["fa1List", "sp1List", "fa2List", "sp2List", "fa3List", "sp3List", "fa4List", "sp4List"];
        scheduleLists.forEach(listId => {
            let list = this.state[listId];
            if (list.length > 0) {
                state[listId] = JSON.stringify(list);
            }
        })
        return state;
    }

    getURLFromState = (): string => {
        const state = this.getStringifiedScheduleState();
        let u = new URLSearchParams(state);
        return "http://localhost:1234/?" + u.toString();
    }

    createURLElement = (): JSX.Element => {
        const url = this.getURLFromState();
        let displayedUrl = url;
        if (displayedUrl.length > 94) {
            displayedUrl = displayedUrl.slice(0, 90) + "...";
        }
        return <a href={url} target="_blank">{displayedUrl}</a>;
    }

    updateLists = (source: ListId, dest: ListId, list1: Array<string>, list2: Array<string>) => {
        let newState: SchedulerState = copyState(this.state);
        newState[source] = list1;
        newState[dest] = list2;
        cacheState(getCacheKey([...this.props.majors], [...this.props.minors]), newState);
        this.setState(newState);
    }

    updateList(listId: ListId, list: Array<string>) {
        let newState: SchedulerState = copyState(this.state);
        newState[listId] = list;
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
        if (dest === "custom") {
            let list: Array<string> = this.state[source];
            let index = list.indexOf(course);
            if (index !== -1) {
                list.splice(index, 1);
                this.updateList(source, list);
            }
        }
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
        const classLists: Array<ListId> = ["lowerDivList", "upperDivList", "breadthList", "minorList"];
        return classLists.indexOf(listId) !== -1;
    }

    addClass = (listId: ListId, course: string) => {
        const scheduleLists: Array<ListId> = ["fa1List", "sp1List", "fa2List", "sp2List", "fa3List", "sp3List", "fa4List", "sp4List"];
        let scheduleCourses: Array<string> = [];
        scheduleLists.forEach(listId => {
            let list = this.state[listId];
            scheduleCourses = [...scheduleCourses].concat([...list]);
        });
        if (!(course in this.state.courseListMap) && scheduleCourses.indexOf(course) === -1) {
            let list: Array<string> = this.state[listId];
            list.push(course);
            this.updateList(listId, list);
        } else {
            toast.error('Class already exists', {
                position: "bottom-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    }

    handleCopyLink = () => {
        let url = this.getURLFromState();
        copyToClipboard(url);
        toast.success('✓ Copied link to clipboard', {
            position: "bottom-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
        });
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
                    addClass={this.addClass}
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
                        addClass={this.addClass}
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
                        addClass={this.addClass}
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
                            message = {<div>This action will delete the current schedule. Proceed?</div>}
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
                            message = {<div>URL: {this.createURLElement()}</div>}
                            posText = "Copy Link"
                            negText = "Cancel"
                            posAction = {this.handleCopyLink}
                            setModal = {this.props.setModal}
                        />
                    break;
                case "export":
                        this.menuToggle();
                        modal = 
                            <Modal 
                                message = {<div>Save your current schedule as a .sch, which can later be imported</div>}
                                posText = "Download"
                                negText = "Cancel"
                                posAction = {this.downloadStateAsJSON}
                                setModal = {this.props.setModal}
                            />
                        break;
                case "import":
                        this.menuToggle();
                        modal = 
                            <Modal 
                                message = {<div>Load a schedule from a .sch file <br />(Note: this may overwrite your current schedule)</div>}
                                posText = "Browse"
                                negText = "Cancel"
                                posAction = {this.uploadJSONFile}
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
                    <div id="course-lists-title" className="lists-title no-select">Your Classes</div>
                    <div id="course-lists-container" className={this.getCourseContainerClass()}>
                        {this.getClassLists()}
                    </div>
                </div>
                <div id="scheduler-main-container" className="main-container">
                    <div id="schedule-lists-title" className="lists-title no-select">Your Schedule</div>
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
                <input type="file" id="file" name="file" />
            </div>
        )
    }
}

export default SchedulerContainer;
export { ListId, ListData };

