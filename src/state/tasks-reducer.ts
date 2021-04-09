import {TasksStateType} from "../App";
import {v1} from "uuid";
import {AddTodolistActionType, RemoveTodolistActionType, setTodolistAC} from "./todolists-reducer";
import {
    TaskPriorities,
    TaskStatuses,
    TaskType,
    todolistsAPI,
    TodolistType,
    UpdateTaskModelType
} from "../api/todolists-api"
import {Dispatch} from "redux";
import {strict} from "assert";
import {AppRootStateType} from "./store";

export type RemoveTaskActionType = {
    type: "REMOVE-TASK",
    todolistId: string
    taskId: string
}

export type AddTaskActionType = {
    type: "ADD-TASK",
    task: TaskType
}

export type ChangeTaskStatusActionType = {
    type: "CHANGE-TASK-STATUS",
    todolistId: string
    taskId: string
    status: TaskStatuses
}

export type ChangeTaskTitleActionType = {
    type: "CHANGE-TASK-TITLE",
    todolistId: string
    taskId: string
    title: string
}
export type SetTasksActionType = {
    type: "SET-TASKS"
    tasks: Array<TaskType>
    todoId: string
}

type SetTodolistActionType = ReturnType<typeof setTodolistAC>
// type SetTasksActionType = ReturnType<typeof setTasksAC>

type ActionsType = RemoveTaskActionType | AddTaskActionType
    | ChangeTaskStatusActionType
    | ChangeTaskTitleActionType
    | AddTodolistActionType
    | RemoveTodolistActionType
    | SetTodolistActionType
    | SetTasksActionType

const initialState: TasksStateType = {
    /*"todolistId1": [
        { id: "1", title: "CSS", status: TaskStatuses.New, todoListId: "todolistId1", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "2", title: "JS", status: TaskStatuses.Completed, todoListId: "todolistId1", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "3", title: "React", status: TaskStatuses.New, todoListId: "todolistId1", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low }
    ],
    "todolistId2": [
        { id: "1", title: "bread", status: TaskStatuses.New, todoListId: "todolistId2", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "2", title: "milk", status: TaskStatuses.Completed, todoListId: "todolistId2", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low },
        { id: "3", title: "tea", status: TaskStatuses.New, todoListId: "todolistId2", description: '',
            startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low }
    ]*/

}

export const tasksReducer = (state: TasksStateType = initialState, action: ActionsType): TasksStateType => {
    switch (action.type) {
        case "SET-TODOS": {
            const stateCopy = {...state}

            action.todos.forEach((tl) => {
                stateCopy[tl.id] = []
            })
            return stateCopy
        }
        case "SET-TASKS": {
            const stateCopy = {...state}
            stateCopy[action.todoId] = action.tasks
            return stateCopy
        }
        case "REMOVE-TASK": {
            const stateCopy = {...state}
            const tasks = stateCopy[action.todolistId];
            const newTasks = tasks.filter(t => t.id !== action.taskId);
            stateCopy[action.todolistId] = newTasks;
            return stateCopy;
        }
        case "ADD-TASK": {
            const stateCopy = {...state}
            // const newTask: TaskType = {
            //     id: v1(),
            //     title: action.title,
            //     status: TaskStatuses.New,
            //     todoListId: action.todolistId, description: '',
            //     startDate: '', deadline: '', addedDate: '', order: 0, priority: TaskPriorities.Low
            // }
            // const newTask = action.task
            const tasks = stateCopy[action.task.todoListId];
            const newTasks = [action.task, ...tasks];
            stateCopy[action.task.todoListId] = newTasks;
            return stateCopy;
        }
        case "CHANGE-TASK-STATUS": {
            let todolistTasks = state[action.todolistId];
            let newTasksArray = todolistTasks
                .map(t => t.id === action.taskId ? {...t, status: action.status} : t);

            state[action.todolistId] = newTasksArray;
            return ({...state});
        }
        case "CHANGE-TASK-TITLE": {
            let todolistTasks = state[action.todolistId];
            // найдём нужную таску:
            let newTasksArray = todolistTasks
                .map(t => t.id === action.taskId ? {...t, title: action.title} : t);

            state[action.todolistId] = newTasksArray;
            return ({...state});
        }
        case "ADD-TODOLIST": {
            return {
                ...state,
                [action.todo.id]: []
            }
        }
        case "REMOVE-TODOLIST": {
            const copyState = {...state};
            delete copyState[action.id];
            return copyState;
        }
        default:
            return state;
    }
}

export const deleteTaskAC = (todolistId: string, taskId: string): RemoveTaskActionType => {
    return {type: "REMOVE-TASK", taskId: taskId, todolistId: todolistId}
}
export const addTaskAC = (task: TaskType): AddTaskActionType => {
    return {type: "ADD-TASK", task}
}
export const changeTaskStatusAC = (todolistId: string, taskId: string, status: TaskStatuses): ChangeTaskStatusActionType => {
    return {type: "CHANGE-TASK-STATUS", status, todolistId, taskId}
}
export const changeTaskTitleAC = (todolistId: string, taskId: string, title: string): ChangeTaskTitleActionType => {
    return {type: "CHANGE-TASK-TITLE", todolistId, taskId, title}
}
export const SetTodolistAC = (todos: Array<TodolistType>): SetTodolistActionType => {
    return {type: "SET-TODOS", todos}
}

export const setTasksAC = (tasks: Array<TaskType>, todoId: string): SetTasksActionType => ({
    type: "SET-TASKS",
    tasks,
    todoId
} as const)


export const fetchTasksTC = (todoId: string) => (dispatch: Dispatch) => {
    todolistsAPI.getTasks(todoId)
        .then((res) => {
            const tasks = res.data.items
            dispatch(setTasksAC(tasks, todoId))
        })
}
export const deleteTasksTC = (todoId: string, id: string) => (dispatch: Dispatch) => {
    todolistsAPI.deleteTask(todoId, id)
        .then((res) => {
            dispatch(deleteTaskAC(todoId, id))
        })
}

export const addTaskTC = (title: string, todoId: string) => (dispatch: Dispatch) => {
    todolistsAPI.createTask(title, todoId)
        .then(res => {
            const task = res.data.data.item
            dispatch(addTaskAC(task))
        })
}

export const updateTaskStatusTC = (todoId: string, taskId: string, status: TaskStatuses) => (dispatch: Dispatch, getState: () => AppRootStateType) => {
    const state = getState()
    const allAppTasks = state.tasks
    const tasksForCurrentTodo = allAppTasks[todoId]
    const currentTask = tasksForCurrentTodo.find((t) => {
        return t.id === taskId
    })
    // const model: any = {...currentTask, status: status}
    // todolistsAPI.updateTask(todoId, taskId, model)
    if (currentTask) {
        todolistsAPI.updateTask(todoId, taskId, {
            title: currentTask.title,
            startDate: currentTask.startDate,
            priority: currentTask.priority,
            description: currentTask.description,
            deadline: currentTask.deadline,
            status: status
        })
            .then(() => {
                const action = changeTaskStatusAC(todoId, taskId, status)
                dispatch(action)
            })
    }
}
export const updateTaskTitleTC = (todolistId: string, taskId: string, title: string) => (dispatch: Dispatch, getState: () => AppRootStateType ) => {
    todolistsAPI.updateTask(todolistId, taskId, model)
        .then(res => {
            // const title = res.data.data.title
            dispatch(changeTaskTitleAC(todolistId, taskId, title))
        })
}

