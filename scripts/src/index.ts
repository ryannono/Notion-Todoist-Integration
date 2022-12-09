import dotenv = require('dotenv'); // key environment
import {Task, TodoistApi} from '@doist/todoist-api-typescript'; // todoist api
import {Client} from '@notionhq/client'; // notion api
import {
  PageObjectResponse,
  QueryDatabaseResponse,
} from '@notionhq/client/build/src/api-endpoints';

// ------------------- auth keys ------------------------------//

dotenv.config();
const todoistKey = String(process.env.TODOISTKEY);
const notionKey = String(process.env.NOTIONKEY);
const databaseId = String(process.env.DATABASEID);

// ----------------- API initialisations -----------------------//

const todoistApi: TodoistApi = new TodoistApi(todoistKey);
const notionApi: Client = new Client({auth: notionKey});

// ------------ General helper function ---------------------- //

/**
 * It takes an object and returns a Map with the same keys and values
 * @param {object} object - the object to convert to a map
 * @returns A map with the keys and values of the passed object.
 */
function objectToMap(object: object): Map<string, any> {
  // start a new map
  const map = new Map();

  // get the (passed) object's keys and values
  const keys = Object.keys(object);
  const values = Object.values(object);

  // map each key to the value in the object
  for (let i = 0; i < keys.length; i++) {
    map.set(keys[i], values[i]);
  }

  return map;
}

/**
 * It takes an array of tasks, and sorts them by their creation time
 * @param taskList - Array<PageObjectResponse>
 */
function bubbleSortTaskList(taskList: Array<PageObjectResponse>): void {
  let swapCounter = -1;

  while (swapCounter !== 0) {
    swapCounter = 0;

    for (let i = 0; i + 1 < taskList.length; i++) {
      const currentTask: PageObjectResponse = taskList[i];
      const nextTask: PageObjectResponse = taskList[i + 1];
      const currentTaskCreationTime: string = currentTask.created_time;
      const nextTaskCreationTime: string = nextTask.created_time;

      if (currentTaskCreationTime > nextTaskCreationTime) {
        taskList[i] = nextTask;
        taskList[i + 1] = currentTask;

        swapCounter++;
      }
    }
  }
}

// ------------ Get Notion Property functions ----------------- //

/**
 * It takes a page object from the Notion API, and returns the description property of the page as a string
 * @param {PageObjectResponse} pageObject - This is the object that Notion returns when you make a
 * request to get a page.
 * @returns A string (notion's description prop)
 */
function getNotionDescriptionProperty(pageObject: PageObjectResponse): string {
  const propertiesObject = pageObject.properties as object;
  const map = objectToMap(propertiesObject);
  const richTextObject = map.get('Description').rich_text[0] as object;
  if (!richTextObject) {
    return '';
  }
  return objectToMap(richTextObject).get('plain_text');
}

/**
 * It takes a page object from the Notion API, and returns the due date of the page as a string
 * @param {PageObjectResponse} pageObject - This is the object that Notion returns when you query a
 * page.
 * @returns A string
 */
function getNotionDueProperty(pageObject: PageObjectResponse): string {
  const propertiesObject = pageObject.properties as object;
  const map = objectToMap(propertiesObject);
  const dateObject = map.get('Due').date as object;
  if (!dateObject) {
    return '';
  }
  return objectToMap(dateObject).get('start');
}

// getNotionStatusProperty return notions status
// property for the passed page
/**
 * It takes a page object from the Notion API, and returns the Status property (as a boolean)
 * of the page as a string and returns the value
 * @param {PageObjectResponse} pageObject - This is the object that is returned from the Notion API.
 * @returns A boolean value.
 */
function getNotionStatusProperty(pageObject: PageObjectResponse): boolean {
  const propertiesObject = pageObject.properties as object;
  const map = objectToMap(propertiesObject);
  return map.get('Status').checkbox as boolean;
}

/**
 * It takes a PageObjectResponse object and returns the TodoistID property as a string
 * @param {PageObjectResponse} pageObject - PageObjectResponse
 * @returns A string
 */
function getNotionTodoistIDProperty(pageObject: PageObjectResponse): string {
  const propertiesObject = pageObject.properties as object;
  const map = objectToMap(propertiesObject);
  const number = map.get('TodoistID').number;
  return !number ? '' : String(number);
}

/**
 * It takes a page object from the Notion API and returns the URL property of the page
 * @param {PageObjectResponse} pageObject - This is the object that is returned from the Notion API.
 * @returns A string
 */
function getNotionTodoistURLProperty(pageObject: PageObjectResponse): string {
  const propertiesObject = pageObject.properties as object;
  const map = objectToMap(propertiesObject);
  const richTextObject = map.get('URL').rich_text[0] as object;
  if (!richTextObject) {
    return '';
  }
  return objectToMap(richTextObject).get('plain_text');
}

/**
 * It takes a page object from the Notion API and returns the title of the page
 * @param {PageObjectResponse} pageObject - This is the object that is returned from the Notion API.
 * @returns A string
 */
function getNotionTitleProperty(pageObject: PageObjectResponse): string {
  const propertiesObject = pageObject.properties as object;
  const map = objectToMap(propertiesObject);
  const titleobject = map.get('Task').title[0] as object;
  return objectToMap(titleobject).get('plain_text');
}

// ----------------- API query/search functions -------------------- //

/**
 * It takes a Todoist ID and returns the Notion page that has that ID
 * @param {number} todoistID - number - The ID of the Todoist task
 * @returns A promise that resolves to a PageObjectResponse or null
 */
async function IDSearchNotion(
  todoistID: number
): Promise<PageObjectResponse | null> {
  const searchResults: QueryDatabaseResponse = await notionApi.databases.query({
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

  return searchResults.results[0] as PageObjectResponse;
}

/**
 * It queries the database for active pages (where the Status property is set to false)
 * @returns An array of PageObjectResponse objects.
 */
async function notionActivePages(): Promise<PageObjectResponse[]> {
  const queryResponse: QueryDatabaseResponse = await notionApi.databases.query({
    database_id: databaseId,
    filter: {
      property: 'Status',
      checkbox: {
        equals: false,
      },
    },
  });

  return queryResponse.results as Array<PageObjectResponse>;
}

/**
 * It queries the database for all pages that have a property called "Sync status" with a value of
 * "NeedsUpdate"
 * @returns An array of PageObjectResponse objects.
 */
async function notionNeedsUpdatePages(): Promise<PageObjectResponse[]> {
  const queryResponse: QueryDatabaseResponse = await notionApi.databases.query({
    database_id: databaseId,
    filter: {
      property: 'Sync status',
      select: {
        equals: 'NeedsUpdate',
      },
    },
  });

  return queryResponse.results as Array<PageObjectResponse>;
}

// --------------- Task/Page creation & update functions --------------//

/**
 * It creates a new Notion page with the same properties as the Todoist task
 * @param {Task} todoistTask - Task - This is the task object from Todoist.
 * @returns A promise that resolves to a PageObjectResponse
 */
async function newNotionPage(todoistTask: Task): Promise<PageObjectResponse> {
  // If a due date exists create a new page with a
  // due date if not create a page without one
  const newNotionPage = (await notionApi.pages.create({
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
  })) as PageObjectResponse;

  const pageID = newNotionPage.id;
  if (todoistTask.due) {
    await notionApi.pages.update({
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
}

/**
 * It takes a notion page ID and a todoist task and updates the notion page with the todoist task's
 * information
 * @param {string} notionPageID - The ID of the Notion page you want to update
 * @param {Task} todoistTask - Task - This is the task object from Todoist
 * @returns A promise that resolves to a PageObjectResponse
 */
async function updateNotionPage(
  notionPageID: string,
  todoistTask: Task
): Promise<PageObjectResponse> {
  // If a due date exists create a new page with a
  // due date if not create a page without one
  const updatedNotionPage = await notionApi.pages.update({
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

  const pageID: string = updatedNotionPage.id;
  if (todoistTask.due) {
    await notionApi.pages.update({
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

  return updatedNotionPage as PageObjectResponse;
}

/**
 * It takes a Notion page object, extracts the title, description, and due date, and then creates a new
 * Todoist task with that information
 * @param {PageObjectResponse} notionPageObject - This is the object that Notion returns when you make
 * a request to the API.
 * @returns A promise that resolves to a Task object.
 */
async function newTodoistTask(
  notionPageObject: PageObjectResponse
): Promise<Task> {
  const notionTitle = getNotionTitleProperty(notionPageObject);
  const notionDescription = getNotionDescriptionProperty(notionPageObject);
  const notionDue = getNotionDueProperty(notionPageObject);

  return await todoistApi.addTask({
    content: notionTitle,
    description: notionDescription,
    dueDate: notionDue,
  });
}

/**
 * It takes a task ID and a Notion page object, and updates the Todoist task matching
 * the passed ID withe the notion page information
 * @param {string} taskID - The ID of the Todoist task to update.
 * @param {PageObjectResponse} notionPageObject - This is the object that we get back from the Notion
 * API when we call getPageObject.
 * @returns A promise that resolves to a Task object.
 */
async function updateTodoistTask(
  taskID: string,
  notionPageObject: PageObjectResponse
): Promise<Task> {
  const notionTitle = getNotionTitleProperty(notionPageObject);
  const notionDescription = getNotionDescriptionProperty(notionPageObject);
  const notionDue = getNotionDueProperty(notionPageObject);

  return await todoistApi.updateTask(taskID, {
    content: notionTitle,
    description: notionDescription,
    dueDate: notionDue,
  });
}

// -------------- Structure (query/search/store) functions ------------//

/**
 * If the todoistID is in the array, return the index of the todoistID in the array. If the todoistID
 * is not in the array, add the todoistID to the array and return the index of the todoistID in the
 * array.
 * @param {string} todoistID - The ID of the task in Todoist.
 * @returns The index of the todoistID in the IDs.todoistTaskIDs array.
 */
function myTodoistIndexOf(todoistID: string): number {
  let index: number;

  if (IDs.todoistTaskIDs.includes(String(todoistID))) {
    index = IDs.todoistTaskIDs.indexOf(String(todoistID));
  } else {
    index = IDs.todoistTaskIDs.length;
    IDs.todoistTaskIDs[index] = String(todoistID);
  }

  return index;
}

/**
 * It takes a Notion page ID as a string, and returns the index of that page ID in the
 * `IDs.notionPageIDs` array. If the page ID is not in the array, it adds it to the array and returns
 * the index of the new page ID
 * @param {string} notionpageID - The ID of the Notion page you want to get the index of.
 * @returns The index of the notionpageID in the IDs.notionPageIDs array.
 */
function myNotionIndexOf(notionpageID: string): number {
  let index: number;

  if (IDs.notionPageIDs.includes(String(notionpageID))) {
    index = IDs.notionPageIDs.indexOf(String(notionpageID));
  } else {
    index = IDs.notionPageIDs.length;
    IDs.notionPageIDs[index] = String(notionpageID);
  }

  return index;
}

/**
 * It takes the list of active tasks from Todoist stores the id in "IDs.todoistTaskIDs",
 * and then searches for the corresponding Notion page for each task. If a matching page
 * exists the id of the notion page is stored in "IDs.notionPageIDs" at the same index
 * as its todoist counterpart
 */
async function storeCurrentSyncedTasks(): Promise<void> {
  const todoistTaskList = await todoistApi.getTasks();
  const len: number = todoistTaskList.length;

  for (let i = 0; i < len; i++) {
    const todoistTask: Task = todoistTaskList[i];
    const todoistID = todoistTask.id;

    IDs.todoistTaskIDs[i] = todoistID;
    const notionPage: PageObjectResponse | null = await IDSearchNotion(
      Number(todoistID)
    );

    if (notionPage) {
      IDs.notionPageIDs[i] = notionPage.id;
    }
  }
}

/**
 * It sorts the arrays of Todoist task IDs and Notion page IDs by the creation date of the Todoist
 * tasks
 */
async function bubbleSortIDs(): Promise<void> {
  let swapCounter = -1;
  const len: number = IDs.todoistTaskIDs.length;

  while (swapCounter !== 0) {
    swapCounter = 0;

    for (let i = 0; i + 1 < len; i++) {
      const todoistID = IDs.todoistTaskIDs[i];
      const nextTodoistID = IDs.todoistTaskIDs[i + 1];
      const notionPageID = IDs.notionPageIDs[i];
      const nextNotionPageID = IDs.notionPageIDs[i + 1];

      const todoistTask: Task = await todoistApi.getTask(todoistID);
      const nextTodoistTask: Task = await todoistApi.getTask(nextTodoistID);

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
}

// -------------- Notion <-> Todoist auto sync functions ----------------//

/**
 * It checks if the last checked Todoist task is the last task in the list, and if it is, it checks if
 * any of the tasks in the list have been completed since the last check. If they have, it updates the
 * corresponding Notion page
 * @param {number} lastCheckedTodoistIndex - The index of the last task that was checked for
 * completion.
 * @param taskList - Array<Task> - this is the list of tasks that we get from Notion.
 * @returns The lastCheckedTodoistIndex is being returned.
 */
async function checkTodoistCompletion(
  lastCheckedTodoistIndex: number,
  taskList: Array<Task>
): Promise<number> {
  if (
    lastCheckedTodoistIndex !== 0 &&
    taskList.length < lastCheckedTodoistIndex + 1
  ) {
    for (let i = 0; i < IDs.todoistTaskIDs.length; i++) {
      const todoistID = IDs.todoistTaskIDs[i];
      const todoistTask = await todoistApi.getTask(todoistID);

      if (todoistTask.isCompleted) {
        await updateNotionPage(IDs.notionPageIDs[i], todoistTask);
      }
    }
    lastCheckedTodoistIndex = taskList.length - 1;
  }

  return lastCheckedTodoistIndex;
}

/**
 * It takes a list of *active tasks from Todoist, and for each task, it checks if the corresponding
 * Notion page is active (status property is false). If it is not active, it updates the Notion page
 * with the latest information from Todoist to set notion page as active
 * @param taskList - Array<Task>
 */
async function checkTodoistIncompletion(taskList: Array<Task>): Promise<void> {
  const len = taskList.length;
  for (let i = 0; i < len; i++) {
    const todoistTask = taskList[i];
    const todoistTaskID = todoistTask.id;
    const notionPage: PageObjectResponse | null = await IDSearchNotion(
      Number(todoistTaskID)
    );

    if (notionPage) {
      const currentStatus = getNotionStatusProperty(notionPage);
      const index: number = myTodoistIndexOf(todoistTaskID);

      if (currentStatus) {
        await updateNotionPage(notionPage.id, todoistTask);
      }
      IDs.notionPageIDs[index] = notionPage.id;
    }
  }
}

/**
 * It checks if the last checked Notion index is greater than the length of the task list,
 * if so then something was completed, and it updates(completes/closes) the matching todoist task to match
 * @param {number} lastCheckedNotiontIndex - The index of the last Notion task that was checked for
 * completion.
 * @param taskList - Array<PageObjectResponse>
 * @returns The lastCheckedNotionIndex
 */
async function checkNotionCompletion(
  lastCheckedNotiontIndex: number,
  taskList: Array<PageObjectResponse>
): Promise<number> {
  if (
    lastCheckedNotiontIndex !== 0 &&
    taskList.length < lastCheckedNotiontIndex + 1
  ) {
    for (let i = 0; i < IDs.notionPageIDs.length; i++) {
      const notionPageID = IDs.notionPageIDs[i];
      const notionPage = (await notionApi.pages.retrieve({
        page_id: notionPageID,
      })) as PageObjectResponse;

      if (getNotionStatusProperty(notionPage)) {
        const todoistId: string = getNotionTodoistIDProperty(notionPage);
        await todoistApi.closeTask(todoistId);
      }
    }
    lastCheckedNotiontIndex = taskList.length - 1;
  }

  return lastCheckedNotiontIndex;
}

/**
 * If a task is marked as completed in Todoist, but not in Notion, then mark it as incomplete in
 * Todoist
 * @param taskList - Array<PageObjectResponse>
 */
async function checkNotionIncompletion(
  taskList: Array<PageObjectResponse>
): Promise<void> {
  const activeTodoistTasks: Array<Task> = await todoistApi.getTasks();
  const activeTodoistTaskIds: Array<string> = [];

  for (let i = 0; i < activeTodoistTasks.length; i++) {
    activeTodoistTaskIds[i] = activeTodoistTasks[i].id;
  }

  const len = taskList.length;
  for (let i = 0; i < len; i++) {
    const notionPage: PageObjectResponse = taskList[i];
    const notionPageID: string = notionPage.id;
    const todoistID: string = getNotionTodoistIDProperty(notionPage);
    const isActive: boolean = activeTodoistTaskIds.includes(todoistID);

    if (!isActive && todoistID) {
      const index: number = myNotionIndexOf(notionPageID);

      await todoistApi.reopenTask(todoistID);

      IDs.todoistTaskIDs[index] = todoistID;
    }
  }
}

/**
 * It checks if there are any new tasks in Todoist, if there are it creates a new page in Notion for
 * each new task and adds the Notion page ID to the IDs structure
 * @param {number} lastCheckedTodoistIndex - number - the index of the last checked Todoist task
 * @returns The last checked index of the todoist task list
 */
async function notionUpToDateCheck(
  lastCheckedTodoistIndex: number
): Promise<number> {
  // get list of todoist *active tasks
  const taskList: Array<Task> = await todoistApi.getTasks();

  // check if a task was completed in todoist
  lastCheckedTodoistIndex = await checkTodoistCompletion(
    lastCheckedTodoistIndex,
    taskList
  );
  const taskListLength = taskList.length;

  // check there are active tasks left
  if (taskListLength > 0) {
    for (let i: number = lastCheckedTodoistIndex + 1; i < taskListLength; i++) {
      const todoistTask: Task = taskList[i];
      const todoistID = Number(todoistTask.id);
      const notionPage: PageObjectResponse | null = await IDSearchNotion(
        todoistID
      );
      const index: number = myTodoistIndexOf(String(todoistID));

      // if element not in notion yet create the notion page
      // and add its ID to the structure at the same index as
      // it's Todoist counterpart
      if (!notionPage) {
        IDs.notionPageIDs[index] = (await newNotionPage(todoistTask)).id;
      } else if (notionPage) {
        checkTodoistIncompletion(taskList).then(bubbleSortIDs);
      }

      if (i === taskListLength - 1) {
        return i;
      }
    }
  }
  // if there is no element in the
  // task list then the last checked is 0
  return taskListLength - 1;
}

/**
 * It checks if the Notion page has been synced to Todoist yet. If it hasn't, it creates a new Todoist
 * task and updates the Notion page with the Todoist task's ID and URL
 * @param {number} lastCheckedNotionIndex - the index of the last notion task that was checked
 * @returns The index of the last checked notion page
 */
async function todoistUpToDateCheck(lastCheckedNotionIndex: number) {
  console.log(lastCheckedNotionIndex);

  // get notion active pages
  const taskList = (await notionActivePages()) as Array<PageObjectResponse>;
  lastCheckedNotionIndex = await checkNotionCompletion(
    lastCheckedNotionIndex,
    taskList
  );
  const taskListLength = taskList.length;

  bubbleSortTaskList(taskList); // notion query result isn't in order

  // if there are any active pages
  if (taskListLength > 0) {
    // iterate through all the unchecked pages
    for (let i = lastCheckedNotionIndex + 1; i < taskListLength; i++) {
      // if notion task doesn't have an associated todoist ID
      // then it hasn't been synced to TodoIst yet so add it
      // with the appropriate values to todoist
      const notionPage = taskList[i];
      const notionTodoistID = getNotionTodoistIDProperty(notionPage);

      if (!notionTodoistID) {
        // create new Todoist task
        const todoistTask: Task = await newTodoistTask(notionPage);

        // update notion task to have todoist id and url
        const notionPageId = notionPage.id;
        await updateNotionPage(notionPageId, todoistTask);

        // add newly created task id to the structure
        const index: number = myNotionIndexOf(notionPageId);
        IDs.todoistTaskIDs[index] = todoistTask.id;
      } else if (notionTodoistID) {
        checkNotionIncompletion(taskList).then(bubbleSortIDs);
      }

      // if we've reached the last element
      // return it's index
      if (i === taskListLength - 1) {
        return i;
      }
    }
  }
  // if there are no active pages
  // return 0
  return taskListLength - 1;
}

// ------------- Notion <-> Todoist manual sync functions --------------//

/**
 * It takes a Notion page ID as an argument, and then updates the "Sync status" property of that page
 * to "Updated"
 * @param {string} notionPageID - The ID of the Notion page you want to update.
 */
async function swapNotionSyncStatus(notionPageID: string): Promise<void> {
  await notionApi.pages.update({
    page_id: notionPageID,
    properties: {
      'Sync status': {
        select: {
          name: 'Updated',
        },
      },
    },
  });
}

/**
 * It searches for tasks that need to be updated, and if any are found, it updates them and then swaps
 * their update indicator
 */
async function notionManualUpdates(): Promise<void> {
  // search for tasks identified to need to be updated
  const pageList =
    (await notionNeedsUpdatePages()) as Array<PageObjectResponse>;

  // if any are present update them and amend their update indicator
  if (pageList.length !== 0) {
    for (let i = 0; i < pageList.length; i++) {
      const notionPage = pageList[i] as PageObjectResponse;

      const notionPageID: string = notionPage.id;
      const index: number = myNotionIndexOf(notionPageID);
      const todoistID: string = IDs.todoistTaskIDs[index];

      if (!todoistID) {
        await todoistUpToDateCheck(0);
      } else {
        await updateTodoistTask(todoistID, notionPage);
      }

      if (getNotionStatusProperty(notionPage)) {
        await todoistApi.closeTask(todoistID);
      }

      await swapNotionSyncStatus(notionPageID);
    }
  }
}

/**
 * It gets a list of all priority 3 tasks from Todoist, then iterates through them, finds the matching
 * Notion page, and updates it
 */
async function todoistManualUpdates(): Promise<void> {
  // get priority 3 task list from todoist
  const taskList = (await todoistApi.getTasks({filter: 'p3'})) as Array<Task>;

  // if the list has tasks
  if (taskList.length) {
    // iterate rhough them
    for (let i = 0; i < taskList.length; i++) {
      const todoistTask = taskList[i] as Task;
      const todoistID: string = todoistTask.id;

      // find matching notion page and update it
      // if page doesn't exit make sure notion is up to date
      const notionPage = await IDSearchNotion(Number(todoistID));

      if (!notionPage) {
        await notionUpToDateCheck(0);
      } else {
        await updateNotionPage(notionPage.id, todoistTask);
      }

      // update task priority bak to level 1
      await todoistApi.updateTask(todoistID, {priority: 1});
    }
  }
}

// ---------------------- Automation/Sync interval -------------------------//

/**
 * Every 10 seconds, check if the latest todoist index is the same as the previous latest todoist index, if not,
 * update notion. Then, check if the latest notion index is the same as the previous latest notion index, if
 * not, update todoist
 */
async function intervalStart() {
  let latestNotionIndex = -1;
  let latestTodoistIndex = -1;

  // min interval == 5 seconds
  setInterval(() => {
    todoistUpToDateCheck(latestTodoistIndex)
      .then(value => (latestTodoistIndex = value))
      .then(notionManualUpdates);
    notionUpToDateCheck(latestNotionIndex)
      .then(value => (latestNotionIndex = value))
      .then(todoistManualUpdates);
  }, 10000);
}

// ----------------------------- Main ---------------------------------//

/* Creating an object called IDs that has two properties: todoistTaskIDs and notionPageIDs. Each of
these properties is an array of strings. */
const IDs = {
  todoistTaskIDs: [''],
  notionPageIDs: [''],
};

/* Calling the storeCurrentSyncedTasks function and then calling the intervalStart function. */
storeCurrentSyncedTasks().then(intervalStart);
