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

const copyToClipboard = (text) => {
    var a = document.createElement("textarea");
    document.body.appendChild(a);
    a.value = text;
    a.select();
    document.execCommand("copy");
    document.body.removeChild(a);
}

export { ancestorHasClass, copyToClipboard };
