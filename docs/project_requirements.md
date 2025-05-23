# Alpha Web App Project Requirements

This describes the project requirements of Alpha Web App.

Alpha description:

Alpha is an agentic platform that represents real-life people through their conversational patterns and personality traits. The system processes podcast-style conversation audio from YouTube, transcribes it, and uses LLMs to generate rich user profiles. These profiles power an AI agent that can answer questions as if it were the actual person, with their unique personality, traits, thoughts, and opinions.

An IdentityX agent is an agent that is given the identity of a user. For instance, a user can select the name "Dylan" and create an IdentityX agent with that identity. That agent can now pull all of the context on Dylan to answer the user's question as if the agent were actually Dylan.

In this MVP:
We'll be creating a landing page, and an "Access Beta" button that simulates a user signing in. Once signed in, they will see a chatbot interface that allows them to interact with a singular Identity X Agent (i.e Dylan Identity X Agent). They should see their previous threads on the left hand side. They should see their chat on the right.

Front-end components:

1. Landing page

- The landing page of the app
- Should have a navigation bar on the top
- The logo (lowercase greek "Alpha" letter) should be on the left
- Should be a button called "Access Beta" on the right
- The center of the page should have a call to action, mention of beta,
  identity X agent ("An AI Agent with your Identity)
- Should have some kind of graphic, futuristic but still vague
- The font should be in white and the background should be dark (almost black)
- Should be modern, minimalist style

2. Unified Login

- Clicking on the "Access Beta" should redirect to a sign up page
- Should present some text like "Sign Up" or "welcome back" etc
- Should implement unified email login
  - Should present an email input field and a "continue" button under it
  - After entering the email, the client makes a request to the backend.
  - If the email is registered, prompt for password
  - If the email is not in registered but is in beta email testing list (stored in DB), then prompt for password. After user enters password, send OTP to email with verification link.
  - If the email is not registered and not in beta testing list, print nice text saying something like "we're currently only accepting users authorized for beta access, come back soon!"
  - After the user sucessfully logins or sign ups, create a secure session for the user and redirect to the main dashboad

3. Main dashboard

- The main dashboard should be a simple assistant-ui chatbot interface
- On the top left, it should say "Dylan IdentityX"
- On the left, there should be a list of previous threads that the user has created
- On the right, there should be an input box where the user can write a message.
- After sending a message, the front-end should send a request to the backend. The backend will invoke the langgraph instance and return a response.

4. Admin dashboard

- There should be a protected route where the admin (me) can view all of the threads of every user with the identity X agent.
- The threads should be listed on the left with the email address of the user as the title
- Clicking on the thread should open a assistant-ui - like interface containing the messages of the user with me
- It should show the last updated timestamp of the thread next to the email address, and the threads should be ordered by time of last update
- The right side should show the messages between the user and the identity X agent. It should have the timestamp of each message underneath the message

IMPORTANT:

- Use nextjs, shadcn, tailwind
- DON'T DO THE BACKEND, JUST CREATE THE FRONT-END COMPONENTS AND USE DUMMY DATA (i.e simulate sign in, don't implement it!!!)
- WE JUST WANT TO TEST OUT THE FRONT-END RIGHT NOW, WE DON'T WANT ANY BACKEND IMPLEMENTATION
- Make things modern and minimalistic
- Use the attached photos as a reference
- use assistant-ui as the library for implementing the chatbot interface - use "context7" MCP tool to pull the docs
