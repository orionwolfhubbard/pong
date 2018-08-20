import React from 'react';
import {Button} from "react-bootstrap";

const OnlineList = props => {
    
    let list = [];
    
    for (let i in props.lobby) {
        if (props.username !== props.lobby[i])
            list.push(
                <Button bsStyle="primary" onClick={
                    () => props.socket.emit('request_game', props.lobby[i])
                } block>
                    {props.lobby[i]}
                </Button>
            );
    }
    
    return (
        <div style={{
            position :'absolute',
            height : '94%',
            width : '30%',
            top : '3%',
            left : '3%',
            padding : '8px',
            border : 'black solid 1px',
            borderRadius : '5px',
            background : 'white',
            overflowY: 'scroll',
        }}>
            <strong>available players</strong>
            <p>click to play</p>
            <div>{list}</div>
        </div>
    );
};

export default OnlineList;