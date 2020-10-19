import * as uuid from 'uuid'

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { TodoAccess } from '../dataLayer/todoAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'

const todoAccess = new TodoAccess()

export async function getAllTodos(currentUserId: string,): Promise<TodoItem[]> {
  return todoAccess.getAllTodos(currentUserId)
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  currentUserId: string
): Promise<TodoItem> {

  const todoId = uuid.v4()

  return await todoAccess.createTodo({
    userId: currentUserId,
    todoId,
    createdAt: new Date().toISOString(),
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false,
    attachmentUrl: null
  })
}

export async function updateTodo(
    updates: TodoUpdate,
    currentUserId: string,
    todoId: string,
): Promise<any> {
    return await todoAccess.updateTodo(updates, currentUserId, todoId)
}

export async function deleteTodo(
    todoId: string,
    currentUserId: string
): Promise<any> {
    return todoAccess.deleteTodo(todoId, currentUserId)
}

export async function getUploadUrl(todoId: string, userId: string): Promise<string> {
    return await todoAccess.generateUploadUrl(todoId, userId)
}
  