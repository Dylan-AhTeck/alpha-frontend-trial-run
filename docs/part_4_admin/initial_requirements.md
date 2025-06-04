# Creating Admin dashboard

## Goals

1. Make a protected "admin dashboard" view that is only accessible to admin account(s)
2. Dashboard shows the threads of all users and the thread history
3. Admin user is able to delete the threads (delete button next to thread)
4. Admin shouldn't be able to interact with other users' chat - should just show the messages

## Current Goal

We're now at the at ideation phase - thinking about how we want to architect an optimal solution. This whole project is an MVP to beta test our identity agent. It should be production ready, but built simply only for < 50 users. It doesn't have to be super mature or elaborate.

## Current state

We already have most of the front-end components for the admin dashboard, which we established before we had a backend. Therefore it uses a naive/hardcoded implementation. We just need to enhance it so that it now communicates with the backend and has the proper functionality instead of just being mocked out.

## Tentative Proposal (to be analyzed and evaluated)

1. We should have a table in supabase that is called "admin_users". It should only be accessible via the server (not client facing).
2. When trying to identify whether a user is a admin user or not, we should call our API endpoint and that should query admin_users
3. If the user is not in admin_users, that means it's a regular user
4. admin_users will see the "admin dashboard" button on the regular dashboard
5. Clicking on it redirects them to the admin route. The admin route pulls all the threads from a "admin" protected API endpoint and displays them
6. The thread list should have a delete icon - clicking on it deletes the thread from both assistant-ui (by calliung assistant cloud client)and langgraph server (through a delete endpoint in our backend).

INSTRUTIONS:

1. Search through the "frontend" directory codebase and update yourself on the current state of the admin front-end code
2. Evaluate the tentative proposal against our goals and provide feedback, improvements, alternative proposals if you have any which are better.
