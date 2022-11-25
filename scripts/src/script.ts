
import dotenv = require("dotenv"); // key environment
import { Task, TodoistApi } from "@doist/todoist-api-typescript"; // todoist api
import { Client } from "@notionhq/client"; // notion api
import { PageObjectResponse, QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";

// ------------------- auth keys ------------------------------//

dotenv.config();
const todoistKey:string = String(process.env.TODOISTKEY);
const notionKey:string = String(process.env.NOTIONKEY);
const databaseId:string = String(process.env.DATABASEID);


// ----------------- API initialisations -----------------------//

const todoistApi: TodoistApi = new TodoistApi(todoistKey);
const notionApi: Client = new Client({auth: notionKey});


// ------------ General helper function ---------------------- //

// objectToMap takes in any object and returns it in a map format
function objectToMap(object: any): Map<any,any>{

    // start a new map
    const map = new Map();

    // get the (passed) object's keys
    const keys = Object.keys(object);
    
    // map each key to the value in the object
    for (let i = 0; i < keys.length; i++) {
        
        map.set(keys[i], object[keys[i]]);
    }

    return map;
}

// bubbleSortTaskList sorts a notion page object
// array by the time tasks were created 
function bubbleSortTaskList(taskList: Array<PageObjectResponse>){

    let swapCounter:number = -1;

    while (swapCounter != 0){

        swapCounter = 0;

        for (let i = 0; i+1 < taskList.length; i++) {
            
            let currentTask:PageObjectResponse = taskList[i]
            let nextTask: PageObjectResponse = taskList[i+1]
            let currentTaskCreationTime:string = currentTask.created_time;
            let nextTaskCreationTime:string = nextTask.created_time;

            if (currentTaskCreationTime > nextTaskCreationTime) {
                
                taskList[i] = nextTask;
                taskList[i+1] = currentTask;

                swapCounter++;
            }
            
        }
    }
}


// ------------ Get Notion Property functions ----------------- //

// getNotionDescriptionProperty return notions description
// property for the passed page
function getNotionDescriptionProperty(pageObject: PageObjectResponse): string{
    let propertiesObject = pageObject.properties as object;
    let map = objectToMap(propertiesObject);
    let richTextObject = map.get("Description").rich_text as Array<any>;
    if (richTextObject.length === 0) {
        return "";
    }
    let text:string = objectToMap(objectToMap(richTextObject).get("0")).get("plain_text");
    return text;
}

// getNotionDueProperty return notions due
// property for the passed page
function getNotionDueProperty(pageObject: PageObjectResponse) : string {
    let propertiesObject = pageObject.properties as object;
    let map = objectToMap(propertiesObject);
    let dateObject = map.get("Due").date as object;
    if (dateObject === null) {
        return "";
    }
    let date = objectToMap(dateObject).get("start");
    return date;
}

// getNotionStatusProperty return notions status
// property for the passed page
function getNotionStatusProperty(pageObject: PageObjectResponse): boolean{
    let propertiesObject = pageObject.properties as object;
    let map = objectToMap(propertiesObject);
    let checkboxContent = map.get("Status").checkbox as boolean;
    return checkboxContent;
}

// getNotionTodoistIDProperty return notions TodoistID
// property for the passed page
function getNotionTodoistIDProperty(pageObject: PageObjectResponse) : string {
    let propertiesObject = pageObject.properties as object;
    let map = objectToMap(propertiesObject);
    let number = map.get("TodoistID").number;
    return (!number) ? "" : String(number);
}

// getNotionTodoistURLProperty return notions URL
// property for the passed page
function getNotionTodoistURLProperty(pageObject: PageObjectResponse) : string{
    let propertiesObject = pageObject.properties as object;
    let map = objectToMap(propertiesObject);
    let richTextObject = map.get("URL").rich_text as Array<any>;
    if (richTextObject.length === 0) {
        return "";
    }
    let url:string = objectToMap(objectToMap(richTextObject).get("0")).get("plain_text");
    return url;
}

// getNotionTitleProperty return notions title
// property for the passed page
function getNotionTitleProperty(pageObject: PageObjectResponse) : string {
    let propertiesObject = pageObject.properties as object;
    let map = objectToMap(propertiesObject);
    let titleobject = map.get("Task").title as object;
    let text = objectToMap(objectToMap(titleobject).get("0")).get("plain_text");
    return text;
}


// ----------------- API query/search functions -------------------- //

// searchNotion queries the notion database for a todoist ID and returns
// the matching page object
async function IDSearchNotion(todoistID:number): Promise<PageObjectResponse | null> {
    
    const searchResults: QueryDatabaseResponse = await notionApi.databases.query({
        database_id: databaseId,
        filter: {
            and: [{
                property: "TodoistID",
                number: {
                    equals: todoistID
                }
            }]
        }
    });

    if (searchResults.results.length === 0){
        return null;
    }

    return searchResults.results[0] as PageObjectResponse;
}

// notionActivePages returns a list of the active tasks in notion
async function notionActivePages() : Promise<PageObjectResponse[]> {
    
    const queryResponse: QueryDatabaseResponse = await notionApi.databases.query({
        database_id: databaseId,
        filter: {
                "property": "Status",
                "checkbox": {
                        "equals": false
                }
        }
    });

    return queryResponse.results as Array<PageObjectResponse>;
}

// notionNeedsUpdatePages returns a list of the tasks
// with the "needs update" sync status in notion
async function notionNeedsUpdatePages() : Promise<PageObjectResponse[]> {
    
    const queryResponse: QueryDatabaseResponse = await notionApi.databases.query({
        database_id: databaseId,
        filter: {
                "property": "Sync status",
                "select": {
                    "equals": "NeedsUpdate"
                }
        }
    });

    return queryResponse.results as Array<PageObjectResponse>;
}


// --------------- Task/Page creation & update functions --------------//

// newNotionPage creates a new page in the notion
// database matching the values in the todoist task
// and returns the new page object
async function newNotionPage(todoistTask: Task) : Promise<PageObjectResponse> {
    
    // If a due date exists create a new page with a
    // due date if not create a page without one
    const newNotionPage = await notionApi.pages.create({

        "parent": {
            "type": "database_id",
            "database_id": databaseId
        },

        "properties": {

                "Task": {
                    "title": [{
                        "text": { 
                            "content": todoistTask.content
                        }
                    }]
                },
                "TodoistID": {
                    number : Number(todoistTask.id)
                },
                "Status":{
                    "checkbox" : todoistTask.isCompleted
                },
                "URL": {
                    "url": todoistTask.url
                },
                "Description": {
                    "rich_text": [{
                        "type" : "text",
                        "text": {
                            "content" : todoistTask.description
                        }
                    }]
                },
                "Sync status" : {
                    select : {
                        "name" : "Updated"
                    }
                },
                
        }
    }) as PageObjectResponse;
    
    const pageID = newNotionPage.id;
    if (todoistTask.due) {
        notionApi.pages.update({
            page_id: pageID,
            "properties":{

                "Due":{
                    "date" : {
                        "start" : todoistTask.due.date
                    }
                },
            }
        })
    }
    
    return newNotionPage;
}

// updateNotionPage updates a page in the notion
// database to match the passed todoist task
// and returns the page object 
async function updateNotionPage(notionPageID:string, todoistTask: Task) : Promise<PageObjectResponse> {
    
    // If a due date exists create a new page with a
    // due date if not create a page without one
    const updatedNotionPage = await notionApi.pages.update({
        page_id : notionPageID,
        "properties": {

                "Task": {
                    "title": [{
                        "text": { 
                            "content": todoistTask.content
                        }
                    }]
                },
                "TodoistID": {
                    number : Number(todoistTask.id)
                },
                "Status":{
                    "checkbox" : todoistTask.isCompleted
                },
                "URL": {
                    "url": todoistTask.url
                },
                "Description": {
                    "rich_text": [{
                        "type" : "text",
                        "text": {
                            "content" : todoistTask.description
                        }
                    }]
                },
                "Sync status" : {
                    select : {
                        "name" : "Updated"
                    }
                },
                
        }

    });

    const pageID:string = updatedNotionPage.id;
    if (todoistTask.due) {
        notionApi.pages.update({
            page_id: pageID,
            "properties":{

                "Due":{
                    "date" : {
                        "start" : todoistTask.due.date
                    }
                },
            }
        })
    }

    return updatedNotionPage as PageObjectResponse;
}

// newTodoistTask creates a new todoist task with 
// all the notion values and returns the task
async function newTodoistTask(notionPageObject: PageObjectResponse): Promise<Task> {
    
    let notionTitle = getNotionTitleProperty(notionPageObject);
    let notionDescription = getNotionDescriptionProperty(notionPageObject);
    let notionDue = getNotionDueProperty(notionPageObject);

    let newTask = await todoistApi.addTask({
        content: notionTitle,
        description: notionDescription,
        dueDate: notionDue
    })

    return newTask;
}

// updateTodoistTask updates a todoist task with 
// all the notion values and returns the updated task
async function updateTodoistTask(taskID:string, notionPageObject: PageObjectResponse): Promise<Task> {
    
    let notionTitle = getNotionTitleProperty(notionPageObject);
    let notionDescription = getNotionDescriptionProperty(notionPageObject);
    let notionDue = getNotionDueProperty(notionPageObject);

    let newTask = await todoistApi.updateTask(taskID,{
        content: notionTitle,
        description: notionDescription,
        dueDate: notionDue
    })

    return newTask;
}


// -------------- Structure (query/search/store) functions ------------//

// myTodoistIndexOf returns the index of the passed
// todoist ID in the ID.todoistTaskIDs array
function myTodoistIndexOf(todoistID:string) : number {
    
    let index:number;

    if (IDs.todoistTaskIDs.includes(String(todoistID))) {
        index = IDs.todoistTaskIDs.indexOf(String(todoistID));
    }
    else{
        index = IDs.todoistTaskIDs.length;
        IDs.todoistTaskIDs[index] = String(todoistID);
    }

    return index;
}

// myNotionIndexOf returns the index of the passed
// notion page ID in the ID.notionPageIDs array
function myNotionIndexOf(notionpageID:string): number {
    
    let index:number;

    if (IDs.notionPageIDs.includes(String(notionpageID))) {
        index = IDs.notionPageIDs.indexOf(String(notionpageID));
    }
    else{
        index = IDs.notionPageIDs.length;
        IDs.notionPageIDs[index] = String(notionpageID);
    }

    return index;
}

// storeCurrentSyncedTasks stores the ids of all the currently active 
// tasks in todoIst and there notion counterparts
async function storeCurrentSyncedTasks(): Promise<void> {
    
    const todoistTaskList = await todoistApi.getTasks();
    let len:number = todoistTaskList.length;
    for (let i = 0; i < len; i++) {
        const todoistTask:Task = todoistTaskList[i];
        let todoistID = todoistTask.id;

        IDs.todoistTaskIDs[i] = todoistID;
        let notionPage: PageObjectResponse | null = await IDSearchNotion(Number(todoistID));

        if (notionPage){
            IDs.notionPageIDs[i] = notionPage.id;
        }
    }
}

// bubbleSortIDs ensures the IDS strored int eh structure are in
// the same order they were create
async function bubbleSortIDs() : Promise<void> {
    
    let swapCounter:number = -1;
    let len: number = IDs.todoistTaskIDs.length;

    while(swapCounter != 0){

        swapCounter = 0;

        for (let i = 0; i+1 < len; i++) {

            const todoistID = IDs.todoistTaskIDs[i];
            const nextTodoistID = IDs.todoistTaskIDs[i+1];
            const notionPageID = IDs.notionPageIDs[i];
            const nextNotionPageID = IDs.notionPageIDs[i+1];

            const todoistTask: Task = await todoistApi.getTask(todoistID);
            const nextTodoistTask: Task = await todoistApi.getTask(nextTodoistID);
            
            const createdTime = new Date(todoistTask.createdAt);
            const nextCreatedTime = new Date(nextTodoistTask.createdAt);

            if (createdTime > nextCreatedTime) {

                IDs.todoistTaskIDs[i] = nextTodoistID;
                IDs.todoistTaskIDs[i+1] = todoistID;

                IDs.notionPageIDs[i] = nextNotionPageID;
                IDs.notionPageIDs[i+1] = notionPageID;

                swapCounter++;
            }
        }
    }
}


// -------------- Notion <-> Todoist auto sync functions ----------------//

// checkTodoistCompletion check if any of the seen 
// todoist ids have recently been completed in todoist
// if they have then the status in notion is updated to match
// the function then returns the last index it checked/updated
async function checkTodoistCompletion(lastCheckedTodoistIndex:number, taskList:Array<Task>) : Promise<number> {
    
    if (lastCheckedTodoistIndex != 0 && taskList.length < lastCheckedTodoistIndex+1){

        for (let i = 0; i < IDs.todoistTaskIDs.length; i++) {
            const todoistID = IDs.todoistTaskIDs[i];
            let todoistTask = await todoistApi.getTask(todoistID);
            

            if (todoistTask.isCompleted){
                updateNotionPage(IDs.notionPageIDs[i],todoistTask);
            }
            
        }
        lastCheckedTodoistIndex = taskList.length-1
    }

    return lastCheckedTodoistIndex;
}

// checkTodoistCompletion check if any of the seen 
// todoist ids have recently been "un"-completed in todoist
// if they have then the status in notion is updated to match
// the function then returns the last index it checked/updated
async function checkTodoistIncompletion(taskList:Array<Task>) : Promise<void> {
    
    let len = taskList.length;
    for (let i = 0; i < len; i++) {
        
        const todoistTask = taskList[i];
        const todoistTaskID = todoistTask.id;
        let notionPage: PageObjectResponse | null = await IDSearchNotion(Number(todoistTaskID));
        
        if (notionPage) {

            let currentStatus = getNotionStatusProperty(notionPage);
            let index:number = myTodoistIndexOf(todoistTaskID);

            if (currentStatus === true) {
                updateNotionPage(notionPage.id,todoistTask);
            }
            IDs.notionPageIDs[index] = notionPage.id;

            
        }
    }
}

// checkNotionCompletion checks if any of the seen 
// todoist ids have recently been completed in notion
// if they have then the status in todoist is updated to match
// the function then returns the last index it checked/updated
async function checkNotionCompletion(lastCheckedNotiontIndex:number, taskList:Array<PageObjectResponse>) : Promise<number> {
    
    if (lastCheckedNotiontIndex != 0 && taskList.length < lastCheckedNotiontIndex+1){

        for (let i = 0; i < IDs.notionPageIDs.length; i++) {
            const notionPageID = IDs.notionPageIDs[i];
            let notionPage = await notionApi.pages.retrieve({page_id:notionPageID}) as PageObjectResponse;
            
            if (getNotionStatusProperty(notionPage)){
                
                let todoistId: string = getNotionTodoistIDProperty(notionPage);
                todoistApi.closeTask(todoistId);
            }
            
        }
        lastCheckedNotiontIndex = taskList.length-1
    }

    return lastCheckedNotiontIndex;
}

// checkNotionIncompletion check if any of the seen 
// todoist ids have recently been "un"-completed in notion
// if they have then the status in todoist is updated to match
// the function then returns the last index it checked/updated
async function checkNotionIncompletion(taskList:Array<PageObjectResponse>) : Promise<void> {
    
    

    let activeTodoistTaks: Array<Task> = await todoistApi.getTasks();
    let activeTodoistTaskIds: Array<string> = [];

    for (let i = 0; i < activeTodoistTaks.length; i++) {
        const todoistIds: string = activeTodoistTaks[i].id;
        activeTodoistTaskIds[i] = todoistIds;
    }

    let len = taskList.length;
    for (let i = 0; i < len; i++) {
        
        const notionPage: PageObjectResponse = taskList[i];
        const notionPageID: string = notionPage.id;
        let todoistID: string = getNotionTodoistIDProperty(notionPage);
        let isActive: boolean = activeTodoistTaskIds.includes(todoistID);

        if (!isActive && todoistID) {

            let index:number = myNotionIndexOf(notionPageID);

            todoistApi.reopenTask(todoistID);
            
            IDs.todoistTaskIDs[index] = todoistID;
        }
    }
}

// notionUpToDateCheck checks if notion has the latest
// todoist tasks in its database. If it doesnt they are added.
// the function returns the index of the last element it checked
async function notionUpToDateCheck(lastCheckedTodoistIndex: number) : Promise<number> {

    //console.log(lastCheckedTodoistIndex);

    // get list of todoist *active tasks
    const taskList:Array<Task> = await todoistApi.getTasks();

    // check if a task was completed in todoist
    lastCheckedTodoistIndex = await checkTodoistCompletion(lastCheckedTodoistIndex,taskList);
    let taskListLength = taskList.length;

    // check there are active tasks left
    if (taskListLength > 0) {

        for (let i:number = lastCheckedTodoistIndex + 1; i < taskListLength; i++) {
            
            const todoistTask: Task = taskList[i];
            const todoistID:number = Number(todoistTask.id);
            const notionPage: PageObjectResponse | null = await IDSearchNotion(todoistID);
            let index:number = myTodoistIndexOf(String(todoistID));
            
            // if element not in notion yet create the notion page
            // and add its ID to the structure at the same index as 
            // it's Todoist counterpart
            if (!notionPage) {
                
                let newNotionPageID:string = (await newNotionPage(todoistTask)).id;
                IDs.notionPageIDs[index] = newNotionPageID;
            }
            else if (notionPage){
                
                checkTodoistIncompletion(taskList)
                    .then(bubbleSortIDs);
            }

            if (i === taskListLength-1) {
                return i;
            }
        }
    }
    // if there is no element in the
    // task list then the last checked is 0
    return taskListLength-1;
}

// notionUpToDateCheck checks if notion has the latest
// todoist tasks in its database. If it doesnt they are added.
// The funtion also adds todoist's ID information on to the 
// notion database once the new task is created.
// the function returns the index of the last element it checked
async function todoistUpToDateCheck(lastCheckedNotionIndex: number){

    console.log(lastCheckedNotionIndex);

    
    // get notion active pages 
    let taskList = await notionActivePages() as Array<PageObjectResponse>;
    lastCheckedNotionIndex = await checkNotionCompletion(lastCheckedNotionIndex,taskList);
    let taskListLength = taskList.length;

    bubbleSortTaskList(taskList);// notion query result isn't in order

    // if there are any active pages
    if (taskListLength > 0) {
        
        // iterate through all the unchecked pages
        for (let i = lastCheckedNotionIndex + 1; i < taskListLength; i++) {

            // if notion task doesn't have an associated todoist ID
            // then it hasn't been synced to TodoIst yet so add it
            // with the appropriate values to todoist
            const notionPage = taskList[i];
            let notionTodoistID = getNotionTodoistIDProperty(notionPage);

            if (!notionTodoistID) {

                // create new Todoist task
                let todoistTask: Task = await newTodoistTask(notionPage)
                    
                // update notion task to have todoist id and url
                let notionPageId = notionPage.id;
                updateNotionPage(notionPageId,todoistTask);

                // add newly created task id to the structure
                let index:number = myNotionIndexOf(notionPageId);
                IDs.todoistTaskIDs[index] = todoistTask.id;
            }
            else if (notionTodoistID){

                checkNotionIncompletion(taskList)
                    .then(bubbleSortIDs);
            }

            // if we've reached the last element
            // return it's index
            if (i === taskListLength-1) {
                return i;
            }
        }
    }
    // if there are no active pages
    // return 0
    return taskListLength-1;
}


// ------------- Notion <-> Todoist manual sync functions --------------//

// swapNotionSyncStatus swap the sync status from the passed page 
async function swapNotionSyncStatus(notionPageID:string) : Promise<void> {
    notionApi.pages.update({
        page_id : notionPageID,
        properties : {
            "Sync status" : {
                select : {
                    "name" : "Updated"
                }
            }
        }
    })
}

// notionManualUpdates updates all the pages that were manually
// queued (by setting them to "Needs update") for update from within notion
async function notionManualUpdates() : Promise<void> {
    
    // search for tasks identified to need to be updated
    const pageList = await notionNeedsUpdatePages() as Array<PageObjectResponse>;

    // if any are present update them and amend their update indicator
    if (pageList.length != 0) {
        
        for (let i = 0; i < pageList.length; i++) {

            const notionPage = pageList[i] as PageObjectResponse;

            let notionPageID: string = notionPage.id;
            let index:number = myNotionIndexOf(notionPageID);
            let todoistID: string = IDs.todoistTaskIDs[index];

            if (!todoistID) {
                todoistUpToDateCheck(0);
            }
            else{
                updateTodoistTask(todoistID,notionPage);
            }

            if (getNotionStatusProperty(notionPage)){
                todoistApi.closeTask(todoistID);
            }

            swapNotionSyncStatus(notionPageID);
        }
    }
}

// notionManualUpdates updates all the pages that were manually
// queued (by setting them to "Priority 3") for update from within todoist
async function todoistManualUpdates() : Promise<void> {
    
    // get priority 3 task list from todoist
    const taskList = await todoistApi.getTasks({filter : "p3"}) as Array<Task>;

    // if the list has tasks
    if (taskList.length) {

        // iterate rhough them
        for (let i = 0; i < taskList.length; i++) {

            const todoistTask = taskList[i] as Task;
            let todoistID:string = todoistTask.id;

            // find matching notion page and update it
            // if page doesn't exit make sure notion is up to date
            const notionPage = await IDSearchNotion(Number(todoistID));

            if (!notionPage) {
                notionUpToDateCheck(0);
            }
            else{
                updateNotionPage(notionPage.id,todoistTask);
            }
            
            // update task priority bak to level 1
            todoistApi.updateTask(todoistID,{priority : 1}) 
        }
    }
}


// ---------------------- Automation/Sync interval -------------------------//

// intervalStart Starts am interval at which notion and todoist
// will be checked and synced
async function intervalStart(){

    let minute:number = 60 * 1000;
    let latestNotionIndex: number = -1;
    let latestTodoistIndex: number = -1;

    // min interval == 5 seconds
    setInterval(() => {
        todoistUpToDateCheck(latestTodoistIndex)
            .then((value) => latestTodoistIndex = value)
            .then(notionManualUpdates);
        notionUpToDateCheck(latestNotionIndex)
            .then((value) => latestNotionIndex = value)
            .then(todoistManualUpdates);
    }, 10000);
}

// ----------------------------- Main ---------------------------------//


const IDs = {
    todoistTaskIDs : [] as Array<string>,
    notionPageIDs : [] as Array<string>
}

storeCurrentSyncedTasks()
    .then(intervalStart);



