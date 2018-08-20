import React from 'react';

const PongBody = props => {
    
    const style = {
        height : '422px',
        width : '638px',//613
        margin : 'auto',
        marginTop : '10px',
        border : 'black solid 1px',
        position : 'relative',
        background : 'white',
        borderRadius : '5px',
    };
    
    const ballStyle = {
        position : 'absolute',
        left : props.x + 7 + 'px',
        bottom : props.y + 'px',
        height : '20px',
        width : '20px',
        borderRadius : '10px',
        background : 'black',
    };
    
    const leftPaddleStyle = {
        position : 'absolute',
        left : 0,
        bottom : props.left - 0 + 'px',
        height : '120px',
        width : '7px',
        background : 'green',
        borderRadius: '4px',
    };
    
    const rightPaddleStyle = {
        position : 'absolute',
        right : 0,
        bottom : props.right - 0 + 'px',
        height : '120px',
        width : '7px',
        background : 'green',
        borderRadius: '4px',
    };
    
    return <div style={style}>
        <span style={ballStyle}/>
        <span style={leftPaddleStyle}/>
        <span style={rightPaddleStyle}/>
    </div>;
};

export default PongBody;