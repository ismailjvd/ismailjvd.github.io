import { toast, ToastPosition } from 'react-toastify';

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

const copyToClipboard = (text: string) => {
    var a = document.createElement("textarea");
    document.body.appendChild(a);
    a.value = text;
    a.select();
    document.execCommand("copy");
    document.body.removeChild(a);
}

const showToast = (message: string, type: "error" | "success") => {
    const opts = {
        position: "bottom-center" as ToastPosition,
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
    }
    if (type === "error") {
        toast.error(message, opts);
    } else {
        toast.success(message, opts);
    }
}

const isPhone = (): boolean => {
    return window.matchMedia('@media only screen and (max-width: 720px)').matches;
}

const showStartingToast = () => {
    window.setTimeout(function() {
        if (!localStorage["starting-toast"]) {
            let message = "👋 Drag or click a course to get started";
            if (isPhone()) {
                message = "👋 Tap a course to get started";
            }
            toast.info(message, {
                position: "bottom-center",
                autoClose: false,
                hideProgressBar: true,
                closeOnClick: true,
                progress: undefined,
                toastId: "starting-toast"
            })
        }
    }, 16000);
}

export { ancestorHasClass, copyToClipboard, showToast, isPhone, showStartingToast };
