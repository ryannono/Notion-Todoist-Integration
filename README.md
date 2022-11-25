
# 👋🏾 What is the Notion-Todoist Integration?

I made this Node JS web-service/integration, to help Todoist App users be able to sync their activity cross platform.

What does that mean?

Well Notion is great because it does many things it essentially can be used as a second brain! 

The problem arrises with more granular task, take standard daily tasks for example although you can set-up a database in Notion to take care of that the solution can feel clunky and overbearring at times and Notion's mobile app although it has made some impressive improvements, it is still nowhere near as smooth as a less "fully featured" app like: Apple notes or in my case Todoist!


Todoist is simple yet effective and when it comes to creating task and completing task quickly on the go it is much, much better than Notion.

This Integration takes both Notion which people love and syncs a database you create for task purposes with Todoist, this way you can use the todoist mobile app (or desktop both are supported) to jot down and create quick tasks on the go while being certain all the vital information will also be store and able to be accessed via Notion.

Note: The opposite is also true you can create pages in Notion and have them show up seamlessly in Todoist.


Here's a list of currently supported features:
## Currently supported features:

- 📑 Automated task Creation sync: 

    Automated task creation detection from Todoist and sync to Notion. As well as automated Page creation (in Notion database) detection from Notion and sync to Todoist


- ✅ Automated Completion and Incompletion sync:

    Whether you complete a task in Notion or in Todoist the other counterpart will sync to match. Same goes with incompletion - if you decide a task you had completed needs to be re-opened both platforms will sync to match eachother.


- 🧑‍🏭 Manual sync:

    If you've previously created a task on notion but have made changes to it you want to be reflected on the Todoist counterpart just toggle your "Sync Status" from "Updated" to "Needs Update" in your notion database.

    To do the same in todoist the "Priority 3" tag has been chosen to be used as a sync button. If you update a task in Todoist you want updated in Notion, just mark the task as "Priority 3".



    *Note: In both cases after the task is updated the indicator will revert to reflect the task being up to date (in Notion the sync status will show as "Updated" after the update is made and in Todoist the "Priority 3" tag will be removed after the sync is done)


## 🏁 Get Started Using The Integration

🧑‍💻 Using Railway (Recommended)

The best way to get the integration is through Railway (https://railway.app/).

    1.  First get your notion database set up by having the properties (and those specific property types) shown below.
    
  ![App Screenshot](https://via.placeholder.com/468x300?text=App+Screenshot+Here)


    2. Next get the database ID for the database you just configured. (see this link for how https://developers.notion.com/docs/working-with-databases).


    3. Get your notion API/Integration key and give your integration acces to the database you just created. (see : https://developers.notion.com/docs/create-a-notion-integration)


    4. Get your Todoist API key. (see: https://developer.todoist.com/rest/v2/#getting-started)


    5. Clone this repo.


    6. Create a Railway account (free).


    7. Create a new project and chose the "Deploy from Github repo" option (see below)
    
  ![App Screenshot](https://via.placeholder.com/468x300?text=App+Screenshot+Here)


    8. Lastly add your keys as variables to the project withthe names used below.
  ![App Screenshot](https://via.placeholder.com/468x300?text=App+Screenshot+Here)



## 🤝 Feedback and contributions

If you have any feedback, please reach out. Here's a link to all my links 😂 : https://ryannono.github.io/github-page/

