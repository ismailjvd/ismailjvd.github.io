import * as React from 'react';
import CourseList, { listIdToTitle, MAX_COURSE_LENGTH } from './CourseList';
import { DraggableItem } from './CourseList';
import degreeData from './DegreeData';
import { _ } from 'lodash';
import { faTrashAlt, faEllipsisV, faLink, faFileDownload, faFileImport } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Modal from './Modal';
import { ancestorHasClass, copyToClipboard, showToast } from '../functions/helperFunctions';
import DeleteContainer from './DeleteContainer';
import { toast } from 'react-toastify';
import { validDegrees } from '../App';


/* Constants */

const MAX_URL_LENGTH = 94;
const MAX_NUM_COURSES = 10;
const BASE_URL = "https://scheduleberkeley.com/";
const BLANK_CACHED_STATE: CachedSchedulerState = {
    fa1List: [],
    sp1List: [],
    fa2List: [],
    sp2List: [],
    fa3List: [],
    sp3List: [],
    fa4List: [],
    sp4List: []
}
const SCHEDULE_LISTS: Array<ListId> = ["fa1List", "sp1List", "fa2List", "sp2List", "fa3List", "sp3List", "fa4List", "sp4List"];

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

type CachedSchedulerState = {
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

/* Cache Functions */

const getCacheKey = (majors: Array<string>, minors: Array<string>) => {
    majors = [...majors].sort();
    minors = [...minors].sort();
    const degrees = JSON.stringify(majors) + ";" + JSON.stringify(minors);
    return degrees;
}

const existsInCache = (majors: Array<string>, minors: Array<string>): boolean => {
    return localStorage[getCacheKey([...majors], [...minors])] ? true : false;
}

// state is a valid CachedSchedulerState
const cacheState = (key: string, state: CachedSchedulerState) => {
    localStorage[key] = JSON.stringify(state);
}

const removeFromCache = (key: string) => {
    delete localStorage[key];
}

// Returns a valid SchedulerState, or null
const getStateFromCache = (majors: Array<string>, minors: Array<string>): SchedulerState | null => {
    let state: SchedulerState | null;
    try {
        const cachedState: CachedSchedulerState = JSON.parse(localStorage[getCacheKey([...majors], [...minors])]);
        state = convertFromCachedState(getValidCachedState(cachedState), majors, minors);
    } catch (err) {
        console.log("Could not load state from cache: " + err.message);
        state = null;
    }
    return state;
}

/* State and Cache Conversion functions */

// Returns a valid CachedSchedulerState
const getValidCachedState = (state: any): CachedSchedulerState => {
    let newState = {...BLANK_CACHED_STATE};
    if (typeof state === "object" && state !== null) {
        const keys: Array<ListId> = SCHEDULE_LISTS;
        keys.forEach(listId => {
            if (!(listId in state)) {
                newState[listId] = [];
            } else {
                let list: Array<string> = state[listId];
                if (!SchedulerContainer.validScheduleList(list)) {
                    if (Array.isArray(list) && list.every(course => typeof course === "string")) {
                        let length = Math.min(list.length, MAX_NUM_COURSES);
                        list = list.slice(0, length).map((course: string) => {
                            return course.length > MAX_COURSE_LENGTH ? course.slice(0, MAX_COURSE_LENGTH) : course;
                        })
                    } else {
                        list = [];
                    }
                }
                newState[listId] = list;
            }
        })
    }
    return newState;
}

// cachedState: a valid CachedSchedulerState, majors / minors must be from SchedulerProperties
const convertFromCachedState = (cachedState: CachedSchedulerState, majors: Array<string>, minors: Array<string>): SchedulerState => {
    let newState: SchedulerState = {
        draggedItem: undefined,
        clickedItem: undefined,
        isMenuOpen: false,
        majors: majors,
        minors: minors,
        courseListMap: degreeData.createCourseListMap(majors, minors), 
        lowerDivList: degreeData.getSortedLowerDivs(majors),
        upperDivList: degreeData.getSortedUpperDivs(majors),
        breadthList: degreeData.getSortedBreadths(majors, minors),
        minorList: degreeData.getSortedMinorCourses(majors, minors),
        fa1List: cachedState.fa1List,
        sp1List: cachedState.sp1List,
        fa2List: cachedState.fa2List,
        sp2List: cachedState.sp2List,
        fa3List: cachedState.fa3List,
        sp3List: cachedState.sp3List,
        fa4List: cachedState.fa4List,
        sp4List: cachedState.sp4List
    };

    return getStateWithNoDuplicates(newState);
}

// state: a valid SchedulerState
const convertToCachedState = (state: SchedulerState): CachedSchedulerState => {
    return {
        fa1List: state.fa1List,
        sp1List: state.sp1List,
        fa2List: state.fa2List,
        sp2List: state.sp2List,
        fa3List: state.fa3List,
        sp3List: state.sp3List,
        fa4List: state.fa4List,
        sp4List: state.sp4List
    }
}

/* State Functions */

const getInitialState = (majors: Array<string>, minors: Array<string>, prevState?: SchedulerState): SchedulerState => {
    let state: SchedulerState;
    if (existsInCache(majors, minors)) {
        state = getStateFromCache(majors, minors);
        if (state) {
            return state;
        }
    }
    if (prevState && canUsePrevState(prevState, majors)) {
        const partialState: CachedSchedulerState = convertToCachedState(prevState);
        state = convertFromCachedState(partialState, majors, minors);
        return state;
    }
    return {
        draggedItem: undefined,
        clickedItem: undefined,
        isMenuOpen: false,
        majors: majors,
        minors: minors,
        courseListMap: degreeData.createCourseListMap(majors, minors), 
        lowerDivList: degreeData.getSortedLowerDivs(majors),
        upperDivList: degreeData.getSortedUpperDivs(majors),
        breadthList: degreeData.getSortedBreadths(majors, minors),
        minorList: degreeData.getSortedMinorCourses(majors, minors),
        fa1List: [],
        sp1List: [],
        fa2List: [],
        sp2List: [],
        fa3List: [],
        sp3List: [],
        fa4List: [],
        sp4List: []
    }
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

// state is a valid SchedulerState.
const getStateWithNoDuplicates = (state: SchedulerState): SchedulerState => {
    let newState = {...state};
    let scheduleCourses: Array<string> = [];
    let scheduleLists = SCHEDULE_LISTS;
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
        if (window.location.search.length > 0) {
            return SchedulerContainer.getStateFromURL(nextProps);
        }
        if(!(_.isEqual([...nextProps.majors].sort(), [...prevState.majors].sort()) && 
            (_.isEqual([...nextProps.minors].sort(), [...prevState.minors].sort())))) {
            return getInitialState(nextProps.majors, nextProps.minors, prevState);
        }
        return null;
    }

    state = getInitialState(this.props.majors, this.props.minors);

    static getStateFromURL = (props: SchedulerProperties): SchedulerState => {
        const queryString = window.location.search;
        let u = new URLSearchParams(queryString);
        let keys = SCHEDULE_LISTS;
        let partialState: CachedSchedulerState = BLANK_CACHED_STATE;
        let isError = false;
        keys.forEach(key => {
            if (u.has(key)) {
                try {
                    let list: Array<string> = JSON.parse(u.get(key));
                    if (!SchedulerContainer.validScheduleList(list)) {
                        console.log("Schedule list could not be parsed", "error");
                        isError = true;
                    }
                    partialState[key] = list;
                } catch (err) {
                    console.log("URL schedule list could not be parsed", "error");
                    isError = true;
                }
            }
        });
        if (isError) {
            window.location.search = "";
            return getInitialState(props.majors, props.minors);
        }
        let newState = convertFromCachedState(partialState, props.majors, props.minors);
        cacheState(getCacheKey([...newState.majors], [...newState.minors]), partialState);
        window.location.search = "";
        return newState;
    }

    downloadStateAsJSON = () => {
        const jsonData = JSON.stringify(this.state);
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
                let state: SchedulerState = JSON.parse(event.target.result as string);
                if (!("majors" in state) || !("minors" in state) || !validDegrees(state["majors"], "Major") 
                    || !validDegrees(state["minors"], "Minor")) {
                        showToast('Majors or minors in file have invalid format', 'error');
                } else {
                    SCHEDULE_LISTS.forEach(listId => {
                        if (!(listId in state)) {
                            state[listId] = [];
                        } else {
                            let list = state[listId];
                            if (!SchedulerContainer.validScheduleList(list)) {
                                if (Array.isArray(list) && list.every(course => typeof course === "string")) {
                                    let length = Math.min(list.length, MAX_NUM_COURSES);
                                    list = list.slice(0, length).map((course: string) => {
                                        return course.length > MAX_COURSE_LENGTH ? course.slice(0, MAX_COURSE_LENGTH) : course;
                                    })
                                } else {
                                    list = [];
                                }
                            }
                            state[listId] = [...list];
                        }
                    });
                    let partialState: CachedSchedulerState = convertToCachedState(state);
                    let newState: SchedulerState = convertFromCachedState(getValidCachedState(partialState), state.majors, state.minors);
                    this.setState(newState);    // forces an update if file degrees match current state degrees
                    cacheState(getCacheKey([...state.majors], [...state.minors]), partialState);
                    this.props.updateDegrees([...state.majors], [...state.minors]);
                    showToast("Successfully loaded schedule from file", "success");
                }
            } catch (err) {
                showToast('Invalid file format', 'error');
            }
        }
        reader.readAsText(file);
        let fileElement: HTMLInputElement = document.getElementById("file") as HTMLInputElement;
        fileElement.removeEventListener("change", this.readScheduleFile);
        fileElement.value = "";
    }

    getStringifiedScheduleState = () => {
        const state = {
            majors: JSON.stringify(this.props.majors),
            minors: JSON.stringify(this.props.minors),
        }
        const scheduleLists: Array<ListId> = SCHEDULE_LISTS;
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
        return BASE_URL + "?" + u.toString();
    }

    createURLElement = (): JSX.Element => {
        const url = this.getURLFromState();
        let displayedUrl = url;
        if (displayedUrl.length > MAX_URL_LENGTH) {
            displayedUrl = displayedUrl.slice(0, MAX_URL_LENGTH - 4) + "...";
        }
        return <a href={url} target="_blank">{displayedUrl}</a>;
    }

    updateLists = (source: ListId, dest: ListId, list1: Array<string>, list2: Array<string>) => {
        let newState: SchedulerState = {...this.state};
        newState[source] = list1;
        newState[dest] = list2;
        cacheState(getCacheKey([...this.props.majors], [...this.props.minors]), convertToCachedState(newState));
        this.setState(newState);
    }

    updateList(listId: ListId, list: Array<string>) {
        let newState: SchedulerState = {...this.state};
        newState[listId] = list;
        cacheState(getCacheKey([...this.props.majors], [...this.props.minors]), convertToCachedState(newState));
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

    moveItemToList = (source: ListId, dest: ListId, course: string, courseType: ListId) => {
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
        } else {
            if (source !== dest) {
                if (!SchedulerContainer.isClassList(dest) && this.state[dest].length >= MAX_NUM_COURSES) {
                    showToast("Semester cannot have more than " + MAX_NUM_COURSES + " courses", "error");
                } else {
                    let courseListName = listIdToTitle[courseType];
                    let listName = listIdToTitle[dest];
                    showToast("Cannot move " + courseListName + " course to " + listName, "error");
                }
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
            (!SchedulerContainer.isClassList(dest) && this.state[dest] && this.state[dest].length < MAX_NUM_COURSES) || 
                dest === this.getOriginalListId(course)
        )
    }

    static isClassList(listId: ListId): boolean {
        const classLists: Array<ListId> = ["lowerDivList", "upperDivList", "breadthList", "minorList"];
        return classLists.indexOf(listId) !== -1;
    }

    static validScheduleList = (list: Array<string>) => {
        return !(!list || !Array.isArray(list) || list.length > MAX_NUM_COURSES ||
            !list.every(course => typeof course === "string" && course.length <= MAX_COURSE_LENGTH));
    }

    addClass = (listId: ListId, course: string) => {
        const scheduleLists: Array<ListId> = SCHEDULE_LISTS;
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
            showToast('Class already exists', 'error');
        }
    }

    handleCopyLink = () => {
        let url = this.getURLFromState();
        copyToClipboard(url);
        showToast('✓ Copied link to clipboard', 'success');
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
        const scheduleLists: Array<ListId> = SCHEDULE_LISTS;
        const yearTitles: Array<string> = ["Freshman", "Sophomore", "Junior", "Senior"];
        let yearContainers: Array<JSX.Element> = [];
        for (let i=0;i<scheduleLists.length;i+=2) {
            yearContainers.push(
                <div className="year-wrapper" key={"container-"+scheduleLists[i]+"-"+scheduleLists[i+1]}>
                    <div className="year-title">{yearTitles[i/2]}</div>
                    <div className="year-container">
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
                </div>
            )
        }
        return yearContainers;
    }

    createMenu = (): JSX.Element => {
        const menuClass = this.state.isMenuOpen ? "menu-container menu-open" : "menu-container";
        return (
            <div className="menu-reference" id="menu-reference">
                <div className="schedule-button menu-button" id="menu-button" onClick={this.menuToggle}>
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
            if (!ancestorHasClass(e.target, "menu-container") && !ancestorHasClass(e.target, "menu-button")) {
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
        const cacheKey = getCacheKey([...this.props.majors], [...this.props.minors]);
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
                    if (this.state.isMenuOpen) {
                        this.menuToggle();
                    }
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
                        if (this.state.isMenuOpen) {
                            this.menuToggle();
                        }
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
                        if (this.state.isMenuOpen) {
                            this.menuToggle();
                        }
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
                    <div id="copy-link-schedule" className="schedule-button" onClick={this.showModal("copy-link")}>
                        <FontAwesomeIcon icon={faLink} />
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

