# Chatrooms

Chatrooms is a full-stack web application that enables real-time communication through multiple chat rooms. Built with a React frontend and a Node.js backend, it leverages WebSockets for seamless, bidirectional messaging.​

# Features

* Join and participate in multiple chat rooms

* Real-time messaging using WebSockets

* User-friendly interface with React

* Scalable backend powered by Node.js​

* Ephemeral messages desgined to disappear in 3 min to insure privacy and security

* Identity hiding features to ensure annonymity for all users.

# Project Structure

Chatrooms/
├── chat-backend/    # Node.js server handling WebSocket connections
└── chat-frontend/   # React application for the user interface

# Getting Started
## Prerequisites

    Node.js (version 14 or higher)

    npm (comes with Node.js)​

## Installation

    Clone the repository:

    git clone https://github.com/m7tar/Chatrooms.git
    cd Chatrooms

    Install backend dependencies:

    cd chat-backend
    npm install

    Install frontend dependencies:

    cd ../chat-frontend
    npm install

## Running the Application

    Start the backend server:

    cd chat-backend
    npm start

    Start the frontend application:

    cd ../chat-frontend
    npm start

The frontend will typically run on http://localhost:3000, and the backend server on http://localhost:5000.​
Technologies Used

    Frontend: React, HTML, CSS

    Backend: Node.js, WebSocket

    Communication: WebSockets for real-time data exchange
