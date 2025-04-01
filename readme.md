# Repo understanding

I want to generate documentation for a certain repository. I’ll apply llm because of its language understanding and tool invocation. We first need to breakdown the problem to its core which will help us understand which tools to create and the prompts we pass.

## The problem

I’m onboarding onto a new project and need to get up to speed fast. We assume that I have understanding of the programming language but our understanding of libraries varies just like in a real world scenario.

Let’s imagine a scenario where I have to do this myself and I had all the concentration in the world with incredible reading skills😅 . How would I approach the problem? I’m seeing a repo for the first time:

1. First lets look at the entry point (usually `main` or `index`). There I can get hints of how the repo is structured and build a mental model of the repos map.
2. I’ll then take a look at the file structure and build a retrieval system. Also understand the semantics of the file structure.
3. Before diving into the code, I’d first try build context of the code so that I can extract the maximum amount of information when passing the code
    1. Maybe I’d like to understand the dependencies. For node projects i’d try to see the `package.json`
    2. I’d make sure I understand the dependency’s documentation
4. Then I take a look at the code and try extract as much information as possible

With those 4 steps I’ll build to some level context of what the code does. At this point. I may or may not understand the problem the code is trying to solve

### How to pass the files

The goal of passing is to collect understanding of what the code is trying to achieve. To well document your code, you must:

1. First define how to interact with your library. What does the library expose?
2. Explain the behaviour of said code. Each invocation, how does it affect the runtime?
3. Explain the foundational concepts of each module. Each module exposes functions/classes. How do they work under the hood

## Project History
