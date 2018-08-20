import React,{Component} from 'react';
import {Button, FormControl, Well} from "react-bootstrap";

const mainStyle = {
    position :'absolute',
    height : '94%',
    width : '30%',
    top : '3%',
    right : '3%',
    padding : '8px',
    border : 'black solid 1px',
    borderRadius : '5px',
    background : 'white',
};

const wellStyle = {
    height : '310px',
    overflowY: 'scroll',
    marginBottom : '10px',
    textAlign : 'left',
    marginTop : '10px'
};

export default class Chat extends Component {

    constructor(props) {
        super(props);
        this.state = {
            chat : [],
            input : '',
        };
        this.props.socket.on('chat', text => {
            let chat = this.state.chat;
            chat.push(<p>{text}</p>);
            this.setState({chat});
        });
    }
    
    handleInputChange = event => this.setState({input:event.target.value});
    
    handleKeyPress = event => {
        if (event.key === 'Enter' && this.state.input.length > 0) {
            this.props.socket.emit('chat',this.state.input);
            this.setState({input : ''});
        }
    };
    
    scrollToBottom = () => this.messagesEnd.scrollIntoView({ behavior: "smooth" });
    
    componentDidUpdate() {
        this.scrollToBottom();
    };
    
    render() {
        return (
            <div style={mainStyle}>
                <Button bsStyle="warning" onClick={() =>this.props.socket.emit('get_scores')} block>
                    view high scores
                </Button>
                <Well style={wellStyle}>
                    <div>{this.state.chat}</div>
                    <div style={{ float:"left", clear: "both" }}
                         ref={(el) => { this.messagesEnd = el; }}/>
                </Well>
                <FormControl
                             value={this.state.input} onChange={this.handleInputChange}
                             type="text" placeholder="Type here to chat"
                             onKeyPress={this.handleKeyPress}/>
            </div>
        );
    }

}