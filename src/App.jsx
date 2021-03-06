import React, {Component,Fragment}from 'react';
import firebase from 'firebase';
import 'firebase/firestore';
import {firestore} from './plugin/firebase';
import CssBaseLine from '@material-ui/core/CssBaseline';
import AppBar from '@material-ui/core/AppBar';
import {
  List,
  ListItem,
  ListItemText,
  Button,
  TextField,
  Toolbar,
  Typography,
  Checkbox
} from '@material-ui/core'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userId: '',
      isLogin: false,
      inputValue: '',
      tasks: []
    };
    this.getTasksData = this.getTasksData.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.getText = this.getText.bind(this);
    this.addTask = this.addTask.bind(this);
    this.removeTask = this.removeTask.bind(this);
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        console.log('is login');
        this.setState({
          userId: user.uid,
          isLogin: true
        });
        this.getTasksData();
      } else {
        console.log('is not login');
      }
    });
  };

  getTasksData() {
    firestore.collection('tasks')
      .where('user_id', '==', this.state.userId)
      .orderBy('created_at')
      .get()
      .then(snapShot => {
        let tasks = [];
        snapShot.forEach(doc => {
          tasks.push({
            id: doc.id,
            text: doc.data().text
          });
        });
        this.setState({
          tasks: tasks
        });
      });
  }

  login() {
    firebase.auth().signInAnonymously().then(e => {
      console.log(e);
      this.setState({
        isLogin: true,
        userId: firebase.auth().currentUser.uid
      });
    }).catch(error => {
      console.log(error.code);
      console.log(error.message);
    });
  };

  logout() {
    if (firebase.auth().currentUser == null) {
      return
    }

    firebase.auth().currentUser.delete()
      .then(() => {
        this.setState({
          isLogin: false,
          userId: '',
          inputValue: '',
          tasks: []
        });
      });
  };

  getText(e) {
    this.setState({
      inputValue: e.target.value
    });
  };

  addTask() {
    const inputValue = this.state.inputValue;
    if (inputValue === '') {
      return
    }
    firestore.collection('tasks').add({
      text: inputValue,
      created_at: new Date(),
      user_id: this.state.userId
    }).then(() => {
      this.getTasksData();
    });
    this.setState({
      inputValue: ''
    });
  };

  removeTask(e) {
    console.log(e.target.value);
    firestore.collection('tasks')
      .doc(e.target.value)
      .delete()
      .then(() => {
        this.getTasksData()
      });
  };

  render() {
    const setLoginOutButton = () => {
      if (this.state.isLogin) {
        return (
          <Button variant='raised' color='secondary' onClick={this.logout}>
            ログアウト
          </Button>
        );
      } else {
        return (
          <Button variant='raised' color='primary' onClick={this.login}>
            匿名ログイン
          </Button>
        );
      }
    };

    const setPlaceholder = () => {
      if (this.state.isLogin) {
        return 'Todo'
      } else {
        return '匿名ログインして下さい';
      }
    };

    return (
      <Fragment>
        <CssBaseLine/>
        <AppBar position='static'>
          <Toolbar>
            <Typography type='title' color='inherit' style={{ fontSize: '20px' }}>
              React x FirebaseでTodo
            </Typography>
          </Toolbar>
        </AppBar>

        <div style={{ padding: '16px' }}>
          <div>
            {setLoginOutButton()}
          </div>

          <div>
            <List>
              {
                this.state.tasks.map(task => {
                  return (
                    <ListItem key={task.id}>
                      <Checkbox color='secondary' onClick={this.removeTask} value={task.id}/>
                      <ListItemText primary={task.text}/>
                    </ListItem>
                  );
                })
              }
            </List>
          </div>

          <div>
            <TextField placeholder={setPlaceholder()} onChange={this.getText} value={this.state.inputValue}
                       disabled={!this.state.isLogin}/>
            <Button variant='raised' color='primary' onClick={this.addTask} disabled={!this.state.isLogin}>
              追加
            </Button>
          </div>
        </div>
      </Fragment>
    );
  };
}

export default App;