function ancestorHasClass(element, className: string) {
    let ele = element;
    while (ele && typeof(ele) !== undefined && ele.id !== "main-container") {
        if (ele.classList.contains(className)) {
            return true;
        }
        ele = ele.parentNode;
    }
    return false;
}

export { ancestorHasClass };
