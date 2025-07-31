# CodeSM

## Overview
CodeSM is a multi-role platform that enables creators to design coding problems and users to solve them. It offers a secure, scalable environment for coding practice with features like role-based problem creation, secure code execution, engaging user profiles, and robust security measures.

## Features
- **Role-Based System**: Creators can author and store coding problems in AWS S3 buckets, with input test cases saved as text files in dedicated folders.
- **Code Execution**: Users can select and solve problems, with submissions validated securely via Docker containers, providing output feedback.
- **User Profiles**: Built with Shadcn UI, profiles display user details, profile images, and coding streaks for enhanced engagement.
- **Security**: Rate-limiting algorithms protect against denial-of-service (DoS) attacks, ensuring platform reliability and performance.

## Tech Stack
- **Backend**: Node.js
- **Frontend**: React.js
- **Database**: MongoDB
- **Storage**: AWS S3
- **Containerization**: Docker
- **UI Library**: Shadcn UI

## Installation

### Prerequisites
- Node.js (v22 or higher)
- MongoDB
- Docker
- AWS account with S3 access
- npm or yarn

### Steps
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/shivamxverma/codesm.git
   cd codeSM
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory with the following:
   ```env
   PORT=8000
   MONGODB_URI=mongodb+srv://user:pasword@cluster0.wecd3fsq.mongodb.net
   CORS_ORIGIN=*
   ACCESS_TOKEN_SECRET="Shivam-verma"
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_SECRET="Shivam_Verma"
   REFRESH_TOKEN_EXPIRY=10d
    
   CLOUDINARY_CLOUD_NAME=
   CLOUDINARY_API_KEY=
   CLOUDINARY_API_SECRET=
   ```

4. **Run MongoDB**:
   Ensure MongoDB is running locally or provide a cloud-based MongoDB URI.

5. **Start the Application**:
   ```bash
   npm start
   ```

6. **Run with Docker** (optional):
   Build and run the Docker container:
   ```bash
   docker build -t codesm .
   docker run -p 3000:3000 codesm
   ```

## Usage
- **Creators**: Log in with creator credentials, access the problem authoring dashboard, create coding problems, and upload test cases to AWS S3.
- **Users**: Sign up or log in, browse coding problems, submit solutions, and view results after secure execution in Docker containers.
- **Profile Management**: Update user details, upload profile images, and track coding streaks via the profile page.

# Building Now 
