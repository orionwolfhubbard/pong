import React from 'react';
import PongBody from "./pongComponents/PongBody";

const style = {
    height : '445px',
    width : '660px',
    margin : 'auto',
    marginTop : '20px',
    border : 'black solid 1px',
    position : 'relative',
    background : 'lightgray',
    borderRadius : '5px',
};

export default class ObserverGame extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            left: 150,
            right: 150,
            x: 300,
            y: 200,
        };
        this.props.socket.on('update_game', data => {
            let {left, right, x, y} = data;
            this.setState({left, right, x, y});
        });
    }
    
    componentDidMount() {
        this.gameBody.focus();
    }
    
    handleKeyPress = e => {
        if (e.key === 'Escape')
            this.props.socket.emit('exit');
        
    };
    
    render() {
        return (
            <div ref={div => {this.gameBody = div;}} tabIndex="0" style={style} onKeyDown={this.handleKeyPress.bind(this)}>
                <div className="left">{this.props.left}</div>
                <div className="right">{this.props.right}</div>
                <PongBody left={this.state.left} right={this.state.right} x={this.state.x} y={this.state.y}/>
            </div>
        )
    }
    
    
}