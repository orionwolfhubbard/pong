import React,{Component} from 'react';
import {Button, FormControl} from "react-bootstrap";
import Title from './loginComponents/Title'

const style = {
    height : '445px',
    width : '660px',
    margin: 'auto',
    marginTop: '20px',
    border: 'black solid 1px',
    position: 'relative',
    background: 'lightgray',
    borderRadius: '5px',
    padding: '130px',
    paddingTop: '140px',
};

export default class Login extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            msg: <br/>,
            username: '',
            password: '',
            passwordTwo : '',
            showPassTwo : false,
            registerText : 'Please re-type your password to register.',
            color: 'red',
            rColor: 'green',
        };
        this.props.socket.on('login_msg', msg => this.setState({msg: msg.msg, color:msg.color}));
        this.props.socket.on('register', bool => {
            let msg = 'registration ' + (bool ? 'success' : 'fail: username taken');
            this.setState({msg,color:bool ? 'green':'red'});
        });
    }
    
    handleUsernameInputChange = e => this.setState({username: e.target.value});
    handlePasswordInputChange = e => this.setState({password: e.target.value});
    handlePasswordTwoInputChange = e => this.setState({passwordTwo: e.target.value});

    getSecondPassword(){
        if (!(new RegExp('^[a-zA-Z]{3,10}$').test(this.state.username)))
            this.setState({msg:'invalid username, must be 3-10 letters only'});
        else
            this.setState({
                showPassTwo : true,
                registerText : 'Please re-type your password to register.',
            });
    };
    
    registerFinal(){
        if (this.state.password === this.state.passwordTwo) {
            this.setState({showPassTwo:false});
            this.props.socket.emit('register', {
                name: this.state.username,
                pass: this.state.password,
            });
        } else {
            this.setState({registerText : 'Error: Your passwords do not match.',rColor:'red'});
        }
    };
    
    cancelRegistration(){
        this.setState({
            showPassTwo:false,
            passwordTwo:'',
        });
    };
    
    login() {
        this.props.socket.emit('login', {
            name:this.state.username,
            pass:this.state.password,
        });
    };
    
    pressKey(e) {
        if (e.key === 'Enter')
            this.login();
    }
    
    render() {
        return (
            <div style={style}>
                <Title/>
                <div>
                    <FormControl onChange={this.handleUsernameInputChange}
                                 value={this.state.username} onKeyDown={this.pressKey.bind(this)}
                                 type="text" placeholder="Username"/>
                    <FormControl onChange={this.handlePasswordInputChange}
                                 value={this.state.password} onKeyDown={this.pressKey.bind(this)}
                                 type="password" placeholder="Password"/>
                    <span style={{color: this.state.color}}>{this.state.msg}</span>
                    <Button onClick={this.login.bind(this)} bsStyle="success" block>Login</Button>
                    <Button onClick={this.getSecondPassword.bind(this)} bsStyle="primary" block>Register</Button>
                    
                    <div style={{
                        display: this.state.showPassTwo ? 'block' : 'none',
                        background : 'lightblue',
                        border : 'black solid 1px',
                        borderRadius : '10px',
                        position : 'absolute',
                        top : '130px',
                        left : '130px',
                        height : '180px',
                        width : '400px',
                        padding : '15px',
                        paddingTop : '10px',
                    }}>
                        <h4 style={{color:this.state.rColor}}>{this.state.registerText}</h4>
                        <FormControl style={{marginBottom:'4px'}} onChange={this.handlePasswordTwoInputChange}
                                     value={this.state.passwordTwo}
                                     type="password" placeholder="confirm password here"/>
                        <Button onClick={this.registerFinal.bind(this)} bsStyle="success" block>Register</Button>
                        <Button onClick={this.cancelRegistration.bind(this)} bsStyle="danger" block>Cancel</Button>
                        
                    </div>
                    
                </div>
            </div>
        );
    }
    
}