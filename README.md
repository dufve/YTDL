# YTDL

This project is an ugly but open source and ad-free web application that allows users to download videos from YouTube, built with Node.js and Express.

## Prerequisites

Before you begin, ensure you have met the following requirement:

* You have installed the latest version of Node.js and npm.

## Installing the Project

To install the project, follow these steps:

1. Clone the repository:
    ```bash
    git clone https://github.com/dufve/YTDL.git
    ```

2. Navigate to the project directory:
    ```bash
    cd project
    ```

3. Install the dependencies:
    ```bash
    npm install
    ```

4. Create a `.env` file in the root directory and add the following lines:
    ```properties
    PORT=<your_port>
    CORS_ORIGIN=<your_cors_origin>
    ```
    Replace `<your_port>` with the port you want to use (if not specified, it will default to `4000`). Replace `<your_cors_origin>` with the origin that should be allowed to make cross-origin requests to your application.

## Using the Project

To use the project, follow these steps:

1. Start the server:
    ```bash
    npm start
    ```