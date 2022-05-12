/* src/App.js */
import React, { useEffect, useState } from 'react'
import Amplify, { API, graphqlOperation } from 'aws-amplify'
import { createTodo } from './graphql/mutations'
import { listTodos } from './graphql/queries'
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import swal from 'sweetalert';

import awsExports from "./aws-exports";
import { AuthErrorStrings } from '@aws-amplify/auth';
Amplify.configure(awsExports);

const initialState = { name: '', description: '' }

const App = () => {
  const [formState, setFormState] = useState(initialState)
  const [todos, setTodos] = useState([])

  useEffect(() => {
    fetchTodos()
  }, [])

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value })
  }

  async function fetchTodos() {
    try {
      const todoData = await API.graphql(graphqlOperation(listTodos))
      const todos = todoData.data.listTodos.items
      setTodos(todos)
    } catch (err) { console.log('error fetching todos') }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return
      const todo = { ...formState }
      setTodos([...todos, todo])
      setFormState(initialState)
      await API.graphql(graphqlOperation(createTodo, { input: todo }))
    } catch (err) {
      console.log('error creating todo:', err)
    }
  }

  async function updateTodo() {
    try {
      swal("Good job!", "You clicked the button!", "success");
    } catch (err) {
      console.log('error updating todo: ', err)
    }
  }

  return (
    <Authenticator>
      {({ signOut, user }) => (
        <div style={styles.container}>
          <div className='row'>
            <h2>Hello {user.username}</h2>
            <button style={styles.button} onClick={signOut}>Sign out</button>
          </div>
          <h2>Amplify Todos</h2>
          <div className='row'>
            <input type='text' onChange={event => setInput('name', event.target.value)} style={styles.input} value={formState.name} placeholder="Task Name"/>
            <input type='text' onChange={event => setInput('description', event.target.value)} style={styles.input} value={formState.description} placeholder="Task Description"/>        
            <select style={styles.select} onChange={event => setInput('state', event.target.value)}>
                <option style={styles.option}>--Select State--</option>
                <option style={styles.option} value="Pending" >Pending</option>
                <option style={styles.option} value="Processing">Processing</option>
                <option style={styles.option} value="Completed">Completed</option>
            </select>
            <button style={styles.button} onClick={addTodo}>Create Todo</button>
          </div>
          <h2>List of Todos</h2>       
          <table className="table">
            <thead>
                <tr>
                    <th>S.N</th>
                    <th>Task</th>
                    <th>Description</th>
                    <th>State</th>
                </tr>
            </thead>
            <tbody>
            {
              todos.map((todo, index) => (
                <tr key={todo.id ? todo.id : index}>
                  <th>{index + 1}</th>
                  <th>{todo.name}</th>
                  <th>{todo.description}</th>
                  <th>{todo.state}</th>
                  <th><button onClick={updateTodo}>Update</button></th>
                </tr>
              ))
            }
            </tbody>
        </table>
        </div>
      )}
    </Authenticator>
  );
}

const styles = {
  container: { width: 1000, margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 20 },
  todo: { marginBottom: 15 },
  input: { minlength: 5, border: 'none', backgroundColor: '#ddd', margin: 10, padding: 8, fontSize: 18 },
  select: { backgroundColor: '#ddd', margin: 10, padding: 8, fontSize: 18, color: 'black' },
  option: { backgroundColor: 'lightgray', color: 'black'},
  label: { marginBottom: 1 },
  button: { margin: 10, backgroundColor: 'black', color: 'white', outline: 'none', fontSize: 18}
}

export default App;