
# 👋🏾 What is the Notion-Todoist Integration?

I made this Node JS web-service/integration, to help Todoist App users be able to sync their activity cross platform.

What does that mean?

Well Notion is great because it does many things it essentially can be used as a second brain! 

The problem arrises with more granular task, take standard daily tasks for example although you can set-up a database in Notion to take care of that the solution can feel clunky and overbearring at times and Notion's mobile app although it has made some impressive improvements, it is still nowhere near as smooth as a less "fully featured" app like: Apple notes or in my case Todoist!


Todoist is simple yet effective and when it comes to creating task and completing task quickly on the go it is much, much better than Notion.

This Integration takes Notion which people love and syncs it (a database you create for task purposes) with Todoist, this way you can use the todoist mobile app (or desktop both are supported) to jot down and create quick tasks on the go while being certain all the vital information will also be store and able to be accessed via Notion.

https://user-images.githubusercontent.com/79291357/204050623-696a8c9d-6263-47e4-91a2-e73c6075c1ee.mp4

Note: The opposite is also true you can create pages in Notion and have them show up seamlessly in Todoist.



## Currently supported features:

- 📑 Automated task Creation sync: 

    Automated task creation detection from Todoist and sync to Notion. As well as automated Page creation (in Notion database) detection from Notion and sync to Todoist


- ✅ Automated Completion and Incompletion sync:

    Whether you complete a task in Notion or in Todoist the other counterpart will sync to match. Same goes with incompletion - if you decide a task you had completed needs to be re-opened both platforms will sync to match eachother.


- 🧑‍🏭 Manual sync:

    If you've previously created a task on notion but have made changes to it you want to be reflected on the Todoist counterpart just toggle your "Sync Status" from "Updated" to "Needs Update" in your notion database.


https://user-images.githubusercontent.com/79291357/204050706-d78fc3be-d79a-4c08-94d4-3768fa68f18e.mp4


    To do the same in todoist the "Priority 3" tag has been chosen to be used as a sync button. If you update a task in Todoist you want updated in Notion, just mark the task as "Priority 3".



    *Note: In both cases after the task is updated the indicator will revert to reflect the task being up to date (in Notion the sync status will show as "Updated" after the update is made and in Todoist the "Priority 3" tag will be removed after the sync is done)


## 🏁 Get Started Using The Integration

🧑‍💻 Using Railway (Recommended)

The best way to get the integration is through Railway (https://railway.app/).

    1.  First get your notion database set up by having the properties (and those specific property types) shown below.
    
  <img width="1104" alt="Screenshot 2022-11-25 at 2 09 48 PM" src="https://user-images.githubusercontent.com/79291357/204044895-3b98dd48-12b9-41fc-8a7f-437c54271476.png">


    2. Next get the database ID for the database you just configured. (see this link for how https://developers.notion.com/docs/working-with-databases).


    3. Get your notion API/Integration key and give your integration acces to the database you just created. (see : https://developers.notion.com/docs/create-a-notion-integration)


    4. Get your Todoist API key. (see: https://developer.todoist.com/rest/v2/#getting-started)


    5. Clone this repo.


    6. Create a Railway account (free).


    7. Create a new project and chose the "Deploy from Github repo" option (see below)
  
  <img width="1440" alt="Screenshot 2022-11-25 at 2 00 57 PM" src="https://user-images.githubusercontent.com/79291357/204044965-a79065c6-a97b-42de-9fee-0d096ead7296.png">
  

    8. Lastly add your keys as variables to the project withthe names used below.

<img width="1440" alt="Screenshot 2022-11-25 at 2 03 52 PM" src="https://user-images.githubusercontent.com/79291357/204044993-5fcf28a3-468e-4e7e-ba27-3d188fe84381.png">



## 🤝 Feedback and contributions

If you have any feedback, please reach out. Here's a link to all my links 😂 : https://ryannono.github.io/github-page/

