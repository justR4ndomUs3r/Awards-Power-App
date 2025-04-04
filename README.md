# Awards-Power-App
## Live demo
http://pixseen.com:8181/


This example shows Custom Power App Component Framework (pcf) with React and Power Automate. 

Awards app is the pcf component for Canvas Power app that cooporate with Sharepoint Lists, Power automate and Microsoft Teams to serve the users ability to gives Teams Praise to each other and gain the company points from it to buy some awards.

### User flow
Users can give each others Prais on teams (Microsoft Teams build in functionality) with description how much points they want to give. Power Automate flows catch this praise and reads important data. Then saves it into Sharepoint Lists. User now can run Awards Power App in their Teams tab to see how much points they have, which awards they can buy now or see the history of praises from/to them or the awards that they bought. 

### Admin flow
Admin user has all of the User functionalities. If someone gives the Praise to the other user Admin gets the Workflow message in teams that he has to check the Awards App. Inside the app Admin can see the History of all requests that was made and the Pending Requests to accept or cancel them. Admin also has the information about points that the user gives to other users during the month and decide how much points should the users get from the praise. Also he can Mark the requested Awards as given.

This is just a source code not the whole pcf project to see how it works go to the live demo

## Live demo
http://pixseen.com:8181/

*This is my private website, only this port is not secure because it's not yet public. 
**In the developer mode dataset operation doesn't work so any actions can't be done properly

### Set up live demo component 
Fill the fields as provided
  username: Daniel
  userID: daniel.sz@dompany.co or mark.twin@company.co
  adminID: daniel.sz@dompany.co or mark.twin@company.co
  TriggerFlow: <just leave it, it's not needed in dev env>
  Awards: <Make sure this field is empty and app will load default awards or paste value from the awards.txt file>
  Dataset: Load the 'dataset.csv' file and Apply changes to see the results.


In the production app: 
username and user ID are loaded from function User().username and User().email
Awards are loaded from the global OnStart app: Set(myAwards, JSON(GetGratitudeAwards.Run("").output))
Dataset is loaded from the Sharepoint List
  

### Setting up the production version
<img width="1434" alt="image" src="https://github.com/user-attachments/assets/49a9ab57-115f-4ca8-948f-507a0399d07b" />

### Live screenshots
<img width="1396" alt="image" src="https://github.com/user-attachments/assets/f22ad6a4-f5d4-462a-8338-6e0be62b2209" />

### Power Automate Flows used in the production
1. Flow that get's the Awards Sharepoint List and converts data and attachments into the JSON string.
2. Flow that listen for the Group chat, reads Praise data, save it into the Sharepoint List and notify the Admins about the new Pending request.



