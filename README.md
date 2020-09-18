# Scheduler

https://scheduleberkeley.com/

Scheduler provides a user-friendly experience that allows students to schedule courses required for their majors(s) and minor(s). 

Currently, we support the following degrees:
* Majors
    * Business Administration
    * Computer Science
    * Data Science
    * Economics
* Minors
    * Computer Science
    * Data Science
    
Scheduler offers the following features:

* Drag and drop courses between lists
* Filter courses in any class list
* Add new courses to your schedule
* Persists schedule automatically (via cache)
* Provide helpful resouces to plan your schedule
* Share a link to your current schedule
* Import/Export schedules via files 
* Mobile-friendly

Other features we are considering:

* Add class units / information
* Add ability to save multiple schedules per major
* Provide initial template schedules

## How it Works

Scheduler is mainly powered by React and TypeScript. Currently for our initial data, we have a static JSON file that we parse. We cache session data (for every major/minor combination) using Web Storage.

We plan to make our app more scalable in the future, by moving the initial data to a database and incorporating a back-end into this web application.
