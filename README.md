# content-media-authencity-backend
Content Media Authencity backend 

# Instructions to run the project
<ol>
  <li>Clone the repository </li>
  <li>Run the command <code>npm i </code></li>
  <li>Create the <code>.env</code> file</li>
  <li>Install one global package <code>npm i -g nodemon</code></li>
  <li>Run the following code <code>nodemon app.js</code></li>
  <li>Check the port you have mentioned in the <code>.env</code> file and run it as <code>localhost:3000/</code></li>
</ol>

# Instructions for variables required in the .env file

<code>MONGODB_URI</code>=your_mongo_url<br>
<code>SESSION_SECRET</code>=yourSecretKey <br>
<code>JWT_SECRET</code> =your_jwt_secret_code <br>
<code>PORT</code>=your_running_port <br>
<code>EMAIL_USER</code>=email_for_sending_email_verfication_here <br>
<code>EMAIL_PASS</code>=password_of_above_email <br>
<code>GOOGLE_CLIENT_ID</code>=google_oauth_client_id <br>
<code>GOOGLE_CLIENT_SECRET</code>=google_oauth_client_secret <br>
<code>GOOGLE_CALLBACK_URL</code>=http://localhost:3000/api/auth/google/callback <br>
<code>AWS_REGION</code>=ap-southeast-2 <br>
<code>AWS_S3_BUCKET_NAME</code>=your_bucket_name <br>
<code>AWS_ACCESS_KEY_ID</code>=your_AWS_ACCESS_KEY_ID <br>
<code>AWS_SECRET_ACCESS_KEY</code>=your_AWS_SECRET_ACCESS_KEY <br>
