# GSI API

Stand alone API build with express.

## Initial Setup

#### Step 1: Stop docker instances if running any

#### Step 2: Clone Project

    git clone https://github.com/dnyaneshk8/gsi-api.git

#### Step 3: Go to project directory

    cd api

#### Step 4: Run MONGO

    RUN mongo

#### Step 5: Create ENV file

    Use .env.example to create env 

#### Step 6: Run application

    npm run dev


## Run with docker

   #### Step 1: Create image

    docker build -t gsi .
        
   #### Step 2: Run Image

    docker run -p 3001:3000 --name gsi_api --env MONGOOSE_CONNECTION_URL="mongodb://host.docker.internal/gsi" --env SECRET="asdhjkast1234Q^%#" gsi



