Project title:
Trooper Gamers Jobs API

Description:
This is an API for Trooper Gamers Jobs. It is used to create, read, update and delete jobs, gamers and the other entities associated with them. It also provides routes for gamer to manage the jobs they created when they want to recruit or to manage the jobs they applied for when they want to be recruited.

How to install:
Clone the repository and run npm install.
Then run npm start to start the server.
Check if .env file is present in the root directory.

How to use:
List of routes and descriptions :

1. /api/jobs

   - GET : Get all jobs
   - POST : Create a job
     Fields required in body: job_name, recruiter_id (only for test, later will use the token to get the id)
     Optionnals are : short_description, description, game_id, payment_amount, duration, chosen_gamer_id, roles_id
     Example of body : {
     "job_name": "job name",
     "recruiter_id": {{id}},
     "short_description": "short description",
     "description": "description",
     "game_id": 1,
     "payment_amount": 100,
     "duration": 1,
     "chosen_gamer_id": {{id}},
     "roles_id": [1,2,3]
     }

2. /api/jobs/:id

   - GET : Get a job
   - PUT : Update a job
     Fields that can be updated are : job_name, short_description, description, game_id, duration, roles_id
     Example of body : {
     "job_name": "job name",
     "short_description": "short description",
     "description": "description",
     "game_id": 1,
     "duration": 1,
     "roles_id": [1,2,3]
     }
   - DELETE : Delete a job

3. /api/gamers

   - GET : Get all gamers
   - POST : Create a gamer
     Fields required in body: username
     Optionnals are : profile_type (default is "Gamer", other can be set to "Recruiter" or "Guild Manager" later), location, birthdate, description, name_discord, link_twitter, link_linkedin, link_facebook, min_hour_rate, hours_per_day, favorite_games_id, favorite_roles_id

4. /api/gamers/:id

   - GET : Get a gamer
   - PUT : Update a gamer
   - DELETE : Delete a gamer

5. /api/gamers/:id/jobs

   - GET : Get all jobs created by a gamer

/------------------------------------/

6. /api/gamers/:id/applications

   - GET : Get all jobs applied for by a gamer

7. /api/gamers/:id/applications/:jobId

   - POST : Apply for a job

8. /api/gamers/:id/applications/:jobId

   - DELETE : Delete an application

9. /api/gamers/:id/applications/:jobId

   - PUT : Update an application

10. /api/gamers/:id/applications/:jobId

    - GET : Get an application

11. /api/gamers/:id/applications/:jobId/accept

    - PUT : Accept an application

12. /api/gamers/:id/applications/:jobId/reject

    - PUT : Reject an application

13. /api/gamers/:id/applications/:jobId/withdraw

    - PUT : Withdraw an application

14. /api/gamers/:id/applications/:jobId/complete
    - PUT : Complete an application
