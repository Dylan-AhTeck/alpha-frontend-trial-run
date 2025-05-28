# Part 2: Integrating with Assistant UI Cloud

Since Assistant UI Cloud allows for up to 200 MAU users and provides automatic thread management, history and authorization, we will be integrating with it initially.

However, we should structure our integration such that we can seamlessly transition off of it (onto our custom backend/solution) once come close to our 200 MAU limit.

Our goals of integrating with Assistant UI are:

1. Provide seamless thread management, including having timestamps on messages so that we can display that in our UI
2. Take advantage of their "automatic title generation based on the initial messages" feature
3. Maintaining of chat history
4. Integration with Supabase auth so that users can only interact with our chatbot if they're authenticated
5. Integration with langgraph platform to interact with langgraph deployment
6. Minimizing custom backend code (or eliminating it completely) for the time being

Once we move off Assistant UI, we will:

1. Be storing the threads and any necessary metadata in our own custom Supabase database
2. We will be communicating to our custom backend for every API call, and that backend will interact with our langgraph deployment as needed
3. Our front-end will interact with a custom backend through assistant-ui's "LocalRuntime" or "ExternalStoreRuntime"
4. We will only be using assistant-ui as a free UI library, and not using any Asssistant Cloud features
