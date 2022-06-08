Project: Automatic Portrait Enhancer App

Folders:
- enhanceAPI: API source code
- enhancerNew: Mobile application source code
- Images: Some inputs and outputs of the API


-----------------------------------------------------------------------
API:
Developed on python 3.8.5

Requirements:

- opencv-python
- scipy
- numpy
- yaml
- flask

How to run API:
Install python and all the libraries mentioned above and run in enhanceAPI directory:
python enhanceAPI.py

------------------------------------------------------------------------
Mobile App:

How to run:

Step 1:
Connect android phone to system

Step 2:
Enable USB debugging in developer mode on android phone

Step 3:
Go to enhancerNew directory in command line and run:
npm install
npm start

Step 4:
To install application, run in a separate terminal:
npm android 
OR
yarn android

If build fails, retry step 3 after step 4

Step 5:
To enable the phone to access the local server, in the command line, run:
adb reverse tcp:5000 tcp:5000

If tcp 5000 does not work, check the server port and replace the PORT as:
adb reverse tcp:PORT tcp:PORT


-----------------------------------------------------------------------------
Once the API is running and the mobile app is installed, images can be enhanced.


