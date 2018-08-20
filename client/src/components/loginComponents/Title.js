import React from 'react';
import nodeLogo from './node-logo1.svg';
import reactLogo from './react-logo.svg';
import mongoLogo from './mongo-logo1.svg';
import socketLogo from './socket-logo.svg';

const style = {
    position : 'absolute',
    top : '38px',
    left: '109px',
    fontSize : '50px',
};

const textStyle = {
    position : 'absolute',
    color : 'green',
    fontFamily : 'Courier New',
};

const Title = props =>
    <div style={style}>
        <span style={textStyle} className="pong-title">Pong </span>
        <img src={reactLogo} className="react-logo" alt="reactJS" />
        <img src={nodeLogo} className="node-logo" alt="nodeJS" />
        <img src={mongoLogo} className="mongo-logo" alt="mongoDB" />
        <img src={socketLogo} className="socket-logo" alt="socket.io" />
    </div>

export default Title;