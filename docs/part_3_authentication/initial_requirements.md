# Authentication

In this stage, we will implement the user authentication logic behind the frontend

1. In the login screen, there is an email input field.
2. After entering the email, the client makes a request to the backend
3. If the email is registered, prompt the user for a password
4. - If the email is not in registered but is in beta email testing list (stored in DB), then prompt for password. After user enters password, send OTP to email with verification link.
5. If the email is not registered and not in beta testing list, print nice text saying something like "we're currently only accepting users authorized for beta access, come back soon!"
6. After the user sucessfully logins or sign ups, create a secure session for the user and redirect to the main dashboad
7. When the user clicks logout, clear the session and redirect back to login screen

Let's think about the best-practice design patterns and concepts that we would need to achieve this. Ask any clarifying questions, and provide best-practice suggestions.
