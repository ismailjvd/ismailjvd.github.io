function ancestorHasClass(element, className: string) {
    let ele = element;
    while (ele && typeof(ele) !== undefined && ele.id !== "main-container") {
        console.log(ele);
        if (ele.classList.contains(className)) {
            return true;
        }
        ele = ele.parentNode;
    }
    return false;
}

export { ancestorHasClass };
