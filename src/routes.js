import { Database } from './database.js'
import { randomUUID } from 'node:crypto'
import { buildRoutePath } from './utils/build-route-path.js'

const database = new Database()

export const routes = [
  {
    method: 'POST',
    path: buildRoutePath('/tasks'),
    handler: (req, res) => {
      if (!req.body) {
        return res.writeHead(400).end(JSON.stringify({
          message: "Bad request"
        }))
      }

      const { title, description } = req.body

      if (!title) {
        return res.writeHead(400).end(JSON.stringify({ 
          message: 'title is required' 
        }))
      }

      if (!description) {
        return res.writeHead(400).end(JSON.stringify({
          message: 'description is required'
        }))
      }

      const task = {
        id: randomUUID(),
        title,
        description,
        completed_at: null,
        created_at: new Date(),
        updated_at: null,
      }

      database.insert('tasks', task)

      return res.writeHead(201).end()
    }
  },
  {
    method: 'GET',
    path: buildRoutePath("/tasks"),
    handler: (req, res) => {
      const { search } = req.query

      const tasks = database.select('tasks', search ? {
        title: search,
        description: search,
      } : null)

      return res.end(JSON.stringify(tasks))
    }
  },
  {
    method: 'DELETE',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params
      const [ taskToDelete ] = database.select('tasks', { id })

      if (!taskToDelete) {
        return res.writeHead(404).end(JSON.stringify({
          message: "Task not found."
        }))
      }

      database.delete('tasks', id)

      return res.writeHead(204).end()
    }
  },
  {
    method: 'PUT',
    path: buildRoutePath('/tasks/:id'),
    handler: (req, res) => {
      const { id } = req.params
      const [ taskToUpdate ] = database.select('tasks', { id })

      if (!taskToUpdate) {
        return res.writeHead(404).end(JSON.stringify({
          message: "Task not found."
        }))
      }

      if (!req.body) {
        return res.writeHead(400).end(JSON.stringify({
          message: "No body from request"
        }))
      }

      const { title, description } = req.body

      if (!title && !description) {
        return res.writeHead(400).end(JSON.stringify({
          message: "No body from request"
        }))
      }

      const dataToUpdate = {
        ...taskToUpdate,
        ...(title && { title }),
        ...(description && { description }),
        updated_at: new Date(),
      }

      database.update('tasks', id, dataToUpdate)

      return res.writeHead(204).end()
    }
  },
  {
    method: 'PATCH',
    path: buildRoutePath('/tasks/:id/complete'),
    handler: (req, res) => {
      const { id } = req.params
      const [ taskToComplete ] = database.select('tasks', { id })

      if (!taskToComplete) {
        return res.writeHead(404).end(JSON.stringify({
          message: "Task not found."
        }))
      }

      const dataToComplete = {
        ...taskToComplete,
        completed_at: new Date(),
      }

      database.update('tasks', id, dataToComplete)

      return res.writeHead(204).end()
    }
  }
]