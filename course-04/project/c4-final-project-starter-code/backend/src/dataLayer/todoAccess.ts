import * as AWS  from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const s3 = new AWS.S3({ signatureVersion: 'v4' })

export class TodoAccess {
  constructor(

    private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
    private readonly s3Bucket = process.env.IMAGES_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION,
    private readonly todosTable = process.env.TODO_TABLE
  ) {}

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    const result = await this.docClient.query({
      TableName: this.todosTable,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId },
      ScanIndexForward: false
    }).promise()

    return result.Items as TodoItem[]
  }

  async getTodo(todoId: string): Promise<TodoItem> {
    const result = await this.docClient.query({
      TableName: this.todosTable,
      KeyConditionExpression: 'todoId = :todoId',
      ExpressionAttributeValues: { ':todoId': todoId },
      ScanIndexForward: false
    }).promise()

    return result.Items[0] as TodoItem
  }

  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    await this.docClient.put({
      TableName: this.todosTable,
      Item: todoItem
    }).promise()

    return todoItem
  }

  async deleteTodo(todoId: string, userId: string): Promise<string> {
    const params = {
      TableName: this.todosTable,
      Key: {
        todoId: todoId,
        userId: userId
      }
    }
    const result = await this.docClient.delete(
      params
    ).promise()
    console.log(result)
    return ''
  }

  async updateTodo(updatedTodo: TodoUpdate, userId: string, todoId: string,): Promise<TodoItem> { 
    const ret = await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        todoId: todoId,
        userId: userId
      },
      UpdateExpression: 'SET #name = :name, dueDate = :dueDate, done = :done',
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':name': updatedTodo.name,
        ':dueDate': updatedTodo.dueDate,
        ':done': updatedTodo.done
      },
    }).promise()

    return ret.Attributes as TodoItem
  }

  async generateUploadUrl(todoId: string, userId: string): Promise<string> {
    await this.addUrlToTodo(todoId, userId)
    const url = s3.getSignedUrl('putObject', {
      Bucket: this.s3Bucket,
      Key: todoId,
      Expires: this.urlExpiration
    })
    return url as string
  }

  async addUrlToTodo(todoId: string, userId: string) {
    await this.docClient.update({
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      },
      UpdateExpression: 'set attachmentUrl = :attachmentUrl',
      ExpressionAttributeValues: {
        ':attachmentUrl': `https://${this.s3Bucket}.s3.amazonaws.com/${todoId}`
      }
    }).promise()
  }
}
