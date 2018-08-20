import React from 'react';
import {Button} from "react-bootstrap";

export default class Request extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            show : false,
            from : '',
        };
        props.socket.on('request', from => this.setState({show:true,from}));
    }
    
    style = () => {
        return {
            display: this.state.show ? 'block' : 'none',
            position: 'relative',
            height: '150px',
            width: '280px',
            padding: '8px',
            margin: 'auto',
            marginTop: '150px',
            background: 'lightblue',
            border: 'black solid 1px',
            borderRadius: '5px',
        }
    };
    
    render() {
        return (
            <div style={this.style()}>
                <h3>Request from {this.state.from}</h3>
                <Button onClick={() => this.setState({show : false},() => {
                    this.props.socket.emit('accept', this.state.from);
                })}
                        bsStyle="success" block>Accept</Button>
                <Button onClick={() => this.setState({show : false},() => {
                    this.props.socket.emit('decline', this.state.from);
                })}
                        bsStyle="danger" block>Decline</Button>
            </div>
        );
    }
    
}