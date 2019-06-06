import React from 'react';
import logo from './logo.svg';
import './App.css';
import Axios from 'axios';
import Updater from "./Updater";

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            userID: null
        }
    }
    componentDidMount()
    {
    }
    render()
    {
        console.log(this.props);
        return (
            <Updater userID={this.props.uid}></Updater>
        );
    }
}


export default App;
