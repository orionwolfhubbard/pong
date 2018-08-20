import React from 'react';
import {Button} from "react-bootstrap";

const GameList = props => {
    
    let list = [];
    
    for (let i in props.games) {
        list.push(
            <Button onClick={
                () => props.socket.emit('observe', props.games[i].id)
            } block>
                {props.games[i].leftPlayer} vs {props.games[i].rightPlayer}
            </Button>
        );
    }
    return (
        <div style={{
            position :'absolute',
            height : '94%',
            width : '30%',
            top : '3%',
            left : '35%',
            padding : '8px',
            border : 'black solid 1px',
            borderRadius : '5px',
            background : 'white',
            overflowY: 'scroll',
        }}>
            <strong>active games</strong>
            <p>click to watch</p>
            <div>{list}</div>
        </div>
    );
};

export default GameList;