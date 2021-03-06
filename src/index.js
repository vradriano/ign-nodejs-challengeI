const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user){
    return response.status(404).json({ error: "We have a problema Houston! Try again!!"})
  }

  request.user = user

  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const checkingUser = users.find(user => user.username === username);
  
  if(checkingUser){
    return response.status(400).json({ error: "User already exists, please try again!"})
  }

  const newUsers = ({ 
    id: uuidv4(),
    name, 
    username,
    todos: []
  })

  users.push(newUsers)

  return response.status(201).json(newUsers)

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body

  const newTodos = ({ 
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  })

  user.todos.push(newTodos)

  return response.status(201).json(newTodos)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body
  const { id } = request.params

  const todos = user.todos.find(todos => todos.id === id);

  if(!todos){
    return response.status(404).json({ error: "You can't update an user that doesnt exists!!" })
  }

  todos.title = title
  todos.deadLine = new Date(deadline)

  return response.json(todos)
  
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params
  const { user } = request;

  const isDone = user.todos.find(done => done.id === id);

  if(!isDone){
    return response.status(404).json({ error: "You can't update a todo that doesnt exists!"})
  }
  
  isDone.done = true

  return response.json(isDone)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params

  const deleteTodo = user.todos.find(todo => todo.id === id)

  if(!deleteTodo){
    return response.status(404).json({ error: "Todo not found, please try again!" })
  }

  user.todos.splice(deleteTodo, 1)

  return response.status(204).json()
});

module.exports = app;