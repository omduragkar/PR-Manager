# Project Title: Pull Request Approval System

## Table of Contents
1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Usage](#usage)
4. [API Endpoints](#api-endpoints)
5. [Contributing](#contributing)
6. [License](#license)

## Introduction
This project is a pull request approval system built with the MERN (MongoDB, Express.js, React, Node.js) stack. It supports parallel and sequential flows of approval and includes collections for users, roles, pull requests, reviews, and approvals.

## Installation

Before you start, make sure you have Node.js and MongoDB installed on your machine.

1. Clone the repository:
    ```
    git clone https://github.com/yourusername/your-repo-name.git
    ```
2. Navigate into the directory:
    ```
    cd your-repo-name
    ```
3. Install the dependencies:
    ```
    npm install
    ```
4. Start the MongoDB service.
5. Create a `.env` file in the root directory and add your MongoDB connection string:
    ```
    MONGODB_URI=your_mongodb_connection_string
    ```
6. Start the server:
    ```
    npm start
    ```

## Usage

To start the application, run `npm start` in the project directory. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## BACKEND API Endpoints

### Pull Requests

- `GET /pull-requests`: Get all pull requests.
- `GET /pull-requests/:id`: Get a specific pull request.
- `POST /pull-requests`: Create a new pull request.
- `PUT /pull-requests/:id`: Update a specific pull request.
- `DELETE /pull-requests/:id`: Delete a specific pull request.

### Reviews

- `GET /reviews`: Get all reviews.
- `GET /reviews/:id`: Get a specific review.
- `POST /reviews`: Create a new review.
- `PUT /reviews/:id`: Update a specific review.
- `DELETE /reviews/:id`: Delete a specific review.

### Approvals

- `GET /approvals`: Get all approvals.
- `GET /approvals/:id`: Get a specific approval.
- `POST /approvals`: Create a new approval.
- `PUT /approvals/:id`: Update a specific approval.
- `DELETE /approvals/:id`: Delete a specific approval.


## User Flow

1. **User Registration and Login:**
   Users can register for an account and log in to the system. Each user can be assigned a role that determines their permissions within the system.
   PRREQUESTER: means the user can just create a pr and ask for review
   ADMIN: Just have admin access for backend
   APPROVER:  Can Approve updaet and delete PR reviews asked

2. **Creating a Pull Request:**
   A user can create a new pull request (PR). They will need to provide necessary details like the title, description, and the approvers (either for parallel or sequential approval).

3. **Parallel Approval Flow:**
   In a parallel approval flow, the PR is sent to multiple approvers at the same time. Each approver will receive a notification and can approve or reject the PR independently.

4. **Sequential Approval Flow:**
   In a sequential approval flow, the PR is sent to the approvers one by one. The next approver in the sequence only receives the PR after the previous approver has approved it.

5. **Reviewing a Pull Request:**
   Approvers can review the PR and add comments. They can then approve or reject the PR based on their review.

6. **Viewing and Updating a Pull Request:**
   Users can view the details of a PR, including its current approval status and any comments. The creator of the PR can update the details if needed.

7. **Deleting a Pull Request:**
   The creator of a PR can delete it if it is no longer needed.

8. **Notifications:**
   Approvers receive notifications when a PR is awaiting their approval. This allows them to quickly check and approve it. In the case of a sequential approval flow, approvers will receive a notification when the PR reaches their stage in the approval chain.

   
Remember, the frontend UI is basic and primarily designed to demonstrate the functionality of the backend APIs.

## License

[MIT](https://choosealicense.com/licenses/mit/)