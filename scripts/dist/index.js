"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
const todoist_api_typescript_1 = require("@doist/todoist-api-typescript");
const client_1 = require("@notionhq/client");
dotenv.config();
const todoistKey = String(process.env.TODOISTKEY);
const notionKey = String(process.env.NOTIONKEY);
const databaseId = String(process.env.DATABASEID);
const todoistApi = new todoist_api_typescript_1.TodoistApi(todoistKey);
const notionApi = new client_1.Client({ auth: notionKey });
function objectToMap(object) {
    const map = new Map();
    const keys = Object.keys(object);
    for (let i = 0; i < keys.length; i++) {
        map.set(keys[i], object[keys[i]]);
    }
    return map;
}
function bubbleSortTaskList(taskList) {
    let swapCounter = -1;
    while (swapCounter !== 0) {
        swapCounter = 0;
        for (let i = 0; i + 1 < taskList.length; i++) {
            const currentTask = taskList[i];
            const nextTask = taskList[i + 1];
            const currentTaskCreationTime = currentTask.created_time;
            const nextTaskCreationTime = nextTask.created_time;
            if (currentTaskCreationTime > nextTaskCreationTime) {
                taskList[i] = nextTask;
                taskList[i + 1] = currentTask;
                swapCounter++;
            }
        }
    }
}
function getNotionDescriptionProperty(pageObject) {
    const propertiesObject = pageObject.properties;
    const map = objectToMap(propertiesObject);
    const richTextObject = map.get('Description').rich_text[0];
    if (!richTextObject) {
        return '';
    }
    return objectToMap(richTextObject).get('plain_text');
}
function getNotionDueProperty(pageObject) {
    const propertiesObject = pageObject.properties;
    const map = objectToMap(propertiesObject);
    const dateObject = map.get('Due').date;
    if (!dateObject) {
        return '';
    }
    return objectToMap(dateObject).get('start');
}
function getNotionStatusProperty(pageObject) {
    const propertiesObject = pageObject.properties;
    const map = objectToMap(propertiesObject);
    return map.get('Status').checkbox;
}
function getNotionTodoistIDProperty(pageObject) {
    const propertiesObject = pageObject.properties;
    const map = objectToMap(propertiesObject);
    const number = map.get('TodoistID').number;
    return !number ? '' : String(number);
}
function getNotionTodoistURLProperty(pageObject) {
    const propertiesObject = pageObject.properties;
    const map = objectToMap(propertiesObject);
    const richTextObject = map.get('URL').rich_text[0];
    if (!richTextObject) {
        return '';
    }
    return objectToMap(richTextObject).get('plain_text');
}
function getNotionTitleProperty(pageObject) {
    const propertiesObject = pageObject.properties;
    const map = objectToMap(propertiesObject);
    const titleobject = map.get('Task').title[0];
    return objectToMap(titleobject).get('plain_text');
}
function IDSearchNotion(todoistID) {
    return __awaiter(this, void 0, void 0, function* () {
        const searchResults = yield notionApi.databases.query({
            database_id: databaseId,
            filter: {
                and: [
                    {
                        property: 'TodoistID',
                        number: {
                            equals: todoistID,
                        },
                    },
                ],
            },
        });
        if (searchResults.results.length === 0) {
            return null;
        }
        return searchResults.results[0];
    });
}
function notionActivePages() {
    return __awaiter(this, void 0, void 0, function* () {
        const queryResponse = yield notionApi.databases.query({
            database_id: databaseId,
            filter: {
                property: 'Status',
                checkbox: {
                    equals: false,
                },
            },
        });
        return queryResponse.results;
    });
}
function notionNeedsUpdatePages() {
    return __awaiter(this, void 0, void 0, function* () {
        const queryResponse = yield notionApi.databases.query({
            database_id: databaseId,
            filter: {
                property: 'Sync status',
                select: {
                    equals: 'NeedsUpdate',
                },
            },
        });
        return queryResponse.results;
    });
}
function newNotionPage(todoistTask) {
    return __awaiter(this, void 0, void 0, function* () {
        const newNotionPage = (yield notionApi.pages.create({
            parent: {
                type: 'database_id',
                database_id: databaseId,
            },
            properties: {
                Task: {
                    title: [
                        {
                            text: {
                                content: todoistTask.content,
                            },
                        },
                    ],
                },
                TodoistID: {
                    number: Number(todoistTask.id),
                },
                Status: {
                    checkbox: todoistTask.isCompleted,
                },
                URL: {
                    url: todoistTask.url,
                },
                Description: {
                    rich_text: [
                        {
                            type: 'text',
                            text: {
                                content: todoistTask.description,
                            },
                        },
                    ],
                },
                'Sync status': {
                    select: {
                        name: 'Updated',
                    },
                },
            },
        }));
        const pageID = newNotionPage.id;
        if (todoistTask.due) {
            yield notionApi.pages.update({
                page_id: pageID,
                properties: {
                    Due: {
                        date: {
                            start: todoistTask.due.date,
                        },
                    },
                },
            });
        }
        return newNotionPage;
    });
}
function updateNotionPage(notionPageID, todoistTask) {
    return __awaiter(this, void 0, void 0, function* () {
        const updatedNotionPage = yield notionApi.pages.update({
            page_id: notionPageID,
            properties: {
                Task: {
                    title: [
                        {
                            text: {
                                content: todoistTask.content,
                            },
                        },
                    ],
                },
                TodoistID: {
                    number: Number(todoistTask.id),
                },
                Status: {
                    checkbox: todoistTask.isCompleted,
                },
                URL: {
                    url: todoistTask.url,
                },
                Description: {
                    rich_text: [
                        {
                            type: 'text',
                            text: {
                                content: todoistTask.description,
                            },
                        },
                    ],
                },
                'Sync status': {
                    select: {
                        name: 'Updated',
                    },
                },
            },
        });
        const pageID = updatedNotionPage.id;
        if (todoistTask.due) {
            yield notionApi.pages.update({
                page_id: pageID,
                properties: {
                    Due: {
                        date: {
                            start: todoistTask.due.date,
                        },
                    },
                },
            });
        }
        return updatedNotionPage;
    });
}
function newTodoistTask(notionPageObject) {
    return __awaiter(this, void 0, void 0, function* () {
        const notionTitle = getNotionTitleProperty(notionPageObject);
        const notionDescription = getNotionDescriptionProperty(notionPageObject);
        const notionDue = getNotionDueProperty(notionPageObject);
        return yield todoistApi.addTask({
            content: notionTitle,
            description: notionDescription,
            dueDate: notionDue,
        });
    });
}
function updateTodoistTask(taskID, notionPageObject) {
    return __awaiter(this, void 0, void 0, function* () {
        const notionTitle = getNotionTitleProperty(notionPageObject);
        const notionDescription = getNotionDescriptionProperty(notionPageObject);
        const notionDue = getNotionDueProperty(notionPageObject);
        return yield todoistApi.updateTask(taskID, {
            content: notionTitle,
            description: notionDescription,
            dueDate: notionDue,
        });
    });
}
function myTodoistIndexOf(todoistID) {
    let index;
    if (IDs.todoistTaskIDs.includes(String(todoistID))) {
        index = IDs.todoistTaskIDs.indexOf(String(todoistID));
    }
    else {
        index = IDs.todoistTaskIDs.length;
        IDs.todoistTaskIDs[index] = String(todoistID);
    }
    return index;
}
function myNotionIndexOf(notionpageID) {
    let index;
    if (IDs.notionPageIDs.includes(String(notionpageID))) {
        index = IDs.notionPageIDs.indexOf(String(notionpageID));
    }
    else {
        index = IDs.notionPageIDs.length;
        IDs.notionPageIDs[index] = String(notionpageID);
    }
    return index;
}
function storeCurrentSyncedTasks() {
    return __awaiter(this, void 0, void 0, function* () {
        const todoistTaskList = yield todoistApi.getTasks();
        const len = todoistTaskList.length;
        for (let i = 0; i < len; i++) {
            const todoistTask = todoistTaskList[i];
            const todoistID = todoistTask.id;
            IDs.todoistTaskIDs[i] = todoistID;
            const notionPage = yield IDSearchNotion(Number(todoistID));
            if (notionPage) {
                IDs.notionPageIDs[i] = notionPage.id;
            }
        }
    });
}
function bubbleSortIDs() {
    return __awaiter(this, void 0, void 0, function* () {
        let swapCounter = -1;
        const len = IDs.todoistTaskIDs.length;
        while (swapCounter !== 0) {
            swapCounter = 0;
            for (let i = 0; i + 1 < len; i++) {
                const todoistID = IDs.todoistTaskIDs[i];
                const nextTodoistID = IDs.todoistTaskIDs[i + 1];
                const notionPageID = IDs.notionPageIDs[i];
                const nextNotionPageID = IDs.notionPageIDs[i + 1];
                const todoistTask = yield todoistApi.getTask(todoistID);
                const nextTodoistTask = yield todoistApi.getTask(nextTodoistID);
                const createdTime = new Date(todoistTask.createdAt);
                const nextCreatedTime = new Date(nextTodoistTask.createdAt);
                if (createdTime > nextCreatedTime) {
                    IDs.todoistTaskIDs[i] = nextTodoistID;
                    IDs.todoistTaskIDs[i + 1] = todoistID;
                    IDs.notionPageIDs[i] = nextNotionPageID;
                    IDs.notionPageIDs[i + 1] = notionPageID;
                    swapCounter++;
                }
            }
        }
    });
}
function checkTodoistCompletion(lastCheckedTodoistIndex, taskList) {
    return __awaiter(this, void 0, void 0, function* () {
        if (lastCheckedTodoistIndex !== 0 &&
            taskList.length < lastCheckedTodoistIndex + 1) {
            for (let i = 0; i < IDs.todoistTaskIDs.length; i++) {
                const todoistID = IDs.todoistTaskIDs[i];
                const todoistTask = yield todoistApi.getTask(todoistID);
                if (todoistTask.isCompleted) {
                    yield updateNotionPage(IDs.notionPageIDs[i], todoistTask);
                }
            }
            lastCheckedTodoistIndex = taskList.length - 1;
        }
        return lastCheckedTodoistIndex;
    });
}
function checkTodoistIncompletion(taskList) {
    return __awaiter(this, void 0, void 0, function* () {
        const len = taskList.length;
        for (let i = 0; i < len; i++) {
            const todoistTask = taskList[i];
            const todoistTaskID = todoistTask.id;
            const notionPage = yield IDSearchNotion(Number(todoistTaskID));
            if (notionPage) {
                const currentStatus = getNotionStatusProperty(notionPage);
                const index = myTodoistIndexOf(todoistTaskID);
                if (currentStatus) {
                    yield updateNotionPage(notionPage.id, todoistTask);
                }
                IDs.notionPageIDs[index] = notionPage.id;
            }
        }
    });
}
function checkNotionCompletion(lastCheckedNotiontIndex, taskList) {
    return __awaiter(this, void 0, void 0, function* () {
        if (lastCheckedNotiontIndex !== 0 &&
            taskList.length < lastCheckedNotiontIndex + 1) {
            for (let i = 0; i < IDs.notionPageIDs.length; i++) {
                const notionPageID = IDs.notionPageIDs[i];
                const notionPage = (yield notionApi.pages.retrieve({
                    page_id: notionPageID,
                }));
                if (getNotionStatusProperty(notionPage)) {
                    const todoistId = getNotionTodoistIDProperty(notionPage);
                    yield todoistApi.closeTask(todoistId);
                }
            }
            lastCheckedNotiontIndex = taskList.length - 1;
        }
        return lastCheckedNotiontIndex;
    });
}
function checkNotionIncompletion(taskList) {
    return __awaiter(this, void 0, void 0, function* () {
        const activeTodoistTasks = yield todoistApi.getTasks();
        const activeTodoistTaskIds = [];
        for (let i = 0; i < activeTodoistTasks.length; i++) {
            activeTodoistTaskIds[i] = activeTodoistTasks[i].id;
        }
        const len = taskList.length;
        for (let i = 0; i < len; i++) {
            const notionPage = taskList[i];
            const notionPageID = notionPage.id;
            const todoistID = getNotionTodoistIDProperty(notionPage);
            const isActive = activeTodoistTaskIds.includes(todoistID);
            if (!isActive && todoistID) {
                const index = myNotionIndexOf(notionPageID);
                yield todoistApi.reopenTask(todoistID);
                IDs.todoistTaskIDs[index] = todoistID;
            }
        }
    });
}
function notionUpToDateCheck(lastCheckedTodoistIndex) {
    return __awaiter(this, void 0, void 0, function* () {
        const taskList = yield todoistApi.getTasks();
        lastCheckedTodoistIndex = yield checkTodoistCompletion(lastCheckedTodoistIndex, taskList);
        const taskListLength = taskList.length;
        if (taskListLength > 0) {
            for (let i = lastCheckedTodoistIndex + 1; i < taskListLength; i++) {
                const todoistTask = taskList[i];
                const todoistID = Number(todoistTask.id);
                const notionPage = yield IDSearchNotion(todoistID);
                const index = myTodoistIndexOf(String(todoistID));
                if (!notionPage) {
                    IDs.notionPageIDs[index] = (yield newNotionPage(todoistTask)).id;
                }
                else if (notionPage) {
                    checkTodoistIncompletion(taskList).then(bubbleSortIDs);
                }
                if (i === taskListLength - 1) {
                    return i;
                }
            }
        }
        return taskListLength - 1;
    });
}
function todoistUpToDateCheck(lastCheckedNotionIndex) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(lastCheckedNotionIndex);
        const taskList = (yield notionActivePages());
        lastCheckedNotionIndex = yield checkNotionCompletion(lastCheckedNotionIndex, taskList);
        const taskListLength = taskList.length;
        bubbleSortTaskList(taskList);
        if (taskListLength > 0) {
            for (let i = lastCheckedNotionIndex + 1; i < taskListLength; i++) {
                const notionPage = taskList[i];
                const notionTodoistID = getNotionTodoistIDProperty(notionPage);
                if (!notionTodoistID) {
                    const todoistTask = yield newTodoistTask(notionPage);
                    const notionPageId = notionPage.id;
                    yield updateNotionPage(notionPageId, todoistTask);
                    const index = myNotionIndexOf(notionPageId);
                    IDs.todoistTaskIDs[index] = todoistTask.id;
                }
                else if (notionTodoistID) {
                    checkNotionIncompletion(taskList).then(bubbleSortIDs);
                }
                if (i === taskListLength - 1) {
                    return i;
                }
            }
        }
        return taskListLength - 1;
    });
}
function swapNotionSyncStatus(notionPageID) {
    return __awaiter(this, void 0, void 0, function* () {
        yield notionApi.pages.update({
            page_id: notionPageID,
            properties: {
                'Sync status': {
                    select: {
                        name: 'Updated',
                    },
                },
            },
        });
    });
}
function notionManualUpdates() {
    return __awaiter(this, void 0, void 0, function* () {
        const pageList = (yield notionNeedsUpdatePages());
        if (pageList.length !== 0) {
            for (let i = 0; i < pageList.length; i++) {
                const notionPage = pageList[i];
                const notionPageID = notionPage.id;
                const index = myNotionIndexOf(notionPageID);
                const todoistID = IDs.todoistTaskIDs[index];
                if (!todoistID) {
                    yield todoistUpToDateCheck(0);
                }
                else {
                    yield updateTodoistTask(todoistID, notionPage);
                }
                if (getNotionStatusProperty(notionPage)) {
                    yield todoistApi.closeTask(todoistID);
                }
                yield swapNotionSyncStatus(notionPageID);
            }
        }
    });
}
function todoistManualUpdates() {
    return __awaiter(this, void 0, void 0, function* () {
        const taskList = (yield todoistApi.getTasks({ filter: 'p3' }));
        if (taskList.length) {
            for (let i = 0; i < taskList.length; i++) {
                const todoistTask = taskList[i];
                const todoistID = todoistTask.id;
                const notionPage = yield IDSearchNotion(Number(todoistID));
                if (!notionPage) {
                    yield notionUpToDateCheck(0);
                }
                else {
                    yield updateNotionPage(notionPage.id, todoistTask);
                }
                yield todoistApi.updateTask(todoistID, { priority: 1 });
            }
        }
    });
}
function intervalStart() {
    return __awaiter(this, void 0, void 0, function* () {
        let latestNotionIndex = -1;
        let latestTodoistIndex = -1;
        setInterval(() => {
            todoistUpToDateCheck(latestTodoistIndex)
                .then(value => (latestTodoistIndex = value))
                .then(notionManualUpdates);
            notionUpToDateCheck(latestNotionIndex)
                .then(value => (latestNotionIndex = value))
                .then(todoistManualUpdates);
        }, 10000);
    });
}
const IDs = {
    todoistTaskIDs: [''],
    notionPageIDs: [''],
};
storeCurrentSyncedTasks().then(intervalStart);
