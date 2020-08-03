import * as React from 'react';

import logo from "../../assets/img/Logo.png";

class Header extends React.Component {
    render () {
        return (
            <div id="logo">
                <img src={logo} alt="Logo"></img>
            </div>
        )
    }
}

export default Header;