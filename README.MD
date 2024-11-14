# Pumpables

## Rules
There are a few rules to adhere to when contributing to this codebase
1. Most of the code is already built using classes, all new files should use functional components and it needs to be able to integrate well with other parts of the code and follow the code structure
2. If you change/alter a rule in eslint you must make a commit with a description why you changed it
3. Don't push directly to the main branch, create pull requests to be reviewed
4. To create a pull request you should create a new branch for each new feature, the branch name should start with one of the following:
- uiux_fix (Use UI/UX label for PR)
- bug_fix (Use bug label for PR)
- feature (Use feature label for PR)
and should follow the format {kind}/{name_of_task} so fixing a bug in logs screen would be something like bug_fix/log_timer_correct_timezone
5. Add the link to the Asana task in the pull request
5. Tests will soon be created to run against all pull requests into the main branch, if the test fails you need to figure out why and fix or ask any other dev if you don't know why it's failing
6. We'll eventually need to write tests for each pull request made in order for it to be accepted, using Detox for e2e tests and Jest for unit tests so need to be familiar with both

## Using multiple firebase environments guide
We use multiple Firebase environments for dev and production env
### For Android
Put the google-services.json for each environment in android/app/src/debug or android/app/src/release and it'll automatically get picked, make sure that there's no other google-services.json file anywhere else. Need to clean build before every env change(./gradlew clean)! https://medium.com/rocket-fuel/using-multiple-firebase-environments-in-ios-12b204cfa6c0

### For IOS
Create a ios/Pumpables/Firebase/Dev and ios/Pumpables/Firebase/Prod folder, put the respective GoogleService-Info.plist file in each, I've already written a script to pick the correct one, make sure that there's no other GoogleService-Info.plist file anywhere else. May need to follow step 7 to 8 of "Separate Firebase Environments — An Alternate Approach" here if it doesn't work https://medium.com/rocket-fuel/using-multiple-firebase-environments-in-ios-12b204cfa6c0

## App structure
We use Redux, it follows the View -> Action -> Store(and repeat) pattern, Actions are in Action folder, Store is in New_Store folder.

## Installation
- Clone repo
- Yarn install
- Do Firebase env guide from above
- cd ios && pod install && cd ..
- npx react-native run-android
- Open .xcworkspace and run for IOS(ask for dev signing certificates and provisioning profiles)


### (Ignore for now, SG2 pump not yet released) Must do this for DFU upgrade to work on IOS(need this for SG2 pumps!), every time pod install is done
Will try to create a script that checks this is done
https://github.com/Pilloxa/react-native-nordic-dfu/issues/72