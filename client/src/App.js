import React, { Component } from 'react';
import Login from "./components/Login";
import socketIOClient from 'socket.io-client'
import Lobby from "./components/Lobby";
import Game from "./components/Game";
import Signature from "./components/Signature";
import './App.css';
import ObserverGame from "./components/ObserverGame";

const style = {textAlign : 'center'};

class App extends Component {
    
    constructor() {
        super();
        this.state = {
            state : 'login',
            username : '',
            lobby : [],
            games : {},
            left : null,
            right : null,
        };
        this.socket =
            socketIOClient('http://localhost:4000');
        this.socket.on('login', data => {
            let {username, lobby, state} = data;
            this.setState({username,lobby,state});
        });
        this.socket.on('start_game', () => this.setState({state:'game'}));
        this.socket.on('lobby', data => this.setState({lobby :data.lobby, games:data.gameMap}));
        this.socket.on('observe', data => this.setState({state:'observe', left:data.left, right:data.right}))
    }
    
    display = () => {
        switch (this.state.state) {
            case 'login' :
                return <Login socket={this.socket}/>;
            case 'lobby' :
                return <Lobby socket={this.socket}
                              lobby={this.state.lobby}
                              games={this.state.games}
                              username={this.state.username}/>;
            case 'game' :
                return <Game socket={this.socket}/>;
            case 'observe' :
                return <ObserverGame socket={this.socket}
                                     right={this.state.right}
                                     left={this.state.left}/>;
        }
    };
    
    render() {
        return (
            <div style={style}>
                {this.display()}
                <Signature/>
            </div>
        );
    }
}

export default App;
