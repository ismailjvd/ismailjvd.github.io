import * as React from 'react';
import { ancestorHasClass } from '../functions/helperFunctions';

type ModalProps = {
    message: JSX.Element,
    posText: string,
    negText: string,
    posAction: () => void,
    setModal: (modal: JSX.Element | undefined) => void
}

class Modal extends React.PureComponent<ModalProps> {

    handleOutsideClick = (e) => {
        const element = e.target;
        if (!ancestorHasClass(element, "modal-container")) {
            this.closeModal();
        }
    }

    handlePositiveAction = () => {
        this.props.posAction();
        this.closeModal();
    }

    closeModal = () => {
        this.props.setModal(undefined);
        document.removeEventListener("mousedown", this.handleOutsideClick);
    }

    render() {
        document.addEventListener("mousedown", this.handleOutsideClick);
        return (
            <div className="main-overlay">
                <div className="modal-container">
                    <div className="modal-blue-bar"></div>
                    <div className="modal-content">
                        <div className="modal-message">{this.props.message}</div>
                        <div className="modal-button-container">
                            <div className="modal-button no-select positive" onClick={this.handlePositiveAction}>{this.props.posText}</div>
                            <div className="modal-button no-select negative" onClick={this.closeModal}>{this.props.negText}</div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Modal;