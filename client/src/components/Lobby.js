import React,{Component} from 'react';
import OnlineList from './lobbyComponents/OnlineList';
import Chat from './lobbyComponents/Chat';
import Request from './lobbyComponents/Request';
import HighScores from "./lobbyComponents/HighScores";
import {Button} from "react-bootstrap";
import GameList from "./lobbyComponents/GameList";

const style = {
    height : '445px',
    width : '660px',
    margin: 'auto',
    marginTop: '20px',
    border: 'black solid 1px',
    position: 'relative',
    background: 'lightgray',
    borderRadius: '5px',
};

const scoreStyle = {
    height: '300px',
    width: '400px',
    position: 'absolute',
    background: 'lightgreen',
    borderRadius: '10px',
    border : 'black solid 1px',
    overflowY : 'scroll',
    padding : '30px',
    top : '65px',
    left : '120px',
};

export default class Lobby extends Component {

    constructor(props) {
        super(props);
        this.state = {
            show : false,
            scores : [],
        };
        
        props.socket.on('scores',scores => this.setState({scores,show : true}));
        
    }
    
    render() {
        return (
            <div style={style}>
                <GameList socket={this.props.socket}
                          games={this.props.games}/>
                <OnlineList socket={this.props.socket}
                            lobby={this.props.lobby}
                            username={this.props.username}/>
                <Chat socket={this.props.socket}
                      username={this.props.username}/>
                <Request socket={this.props.socket}/>
                <div style={scoreStyle} className={this.state.show ? '' : 'hide'}>
                    <Button bsStyle="danger" onClick={() => this.setState({show: false})} block>close high scores</Button>
                    <br/>
                    <HighScores scores={this.state.scores}/>
                </div>
                
            </div>
        );
    }
}

