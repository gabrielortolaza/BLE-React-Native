#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTLinkingManager.h>

#import "RNNordicDfu.h"
#import "BleManager.h"
#import <Firebase.h>
#import <Bugsnag/Bugsnag.h>
#import <RNBranch/RNBranch.h>
// #import "RNFirebaseMessaging.h"
// #import "RNFirebaseNotifications.h"

#import "RNSplashScreen.h"

// TODO new architecture

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [Bugsnag start];

  if ([FIRApp defaultApp] == nil) {
    [FIRApp configure];
  }

  [FIRDatabase database].persistenceEnabled = YES;
  [[UNUserNotificationCenter currentNotificationCenter] setDelegate:self];

  // [RNBranch useTestInstance];
  [RNBranch initSessionWithLaunchOptions:launchOptions isReferrable:YES];
  NSURL *jsCodeLocation;
  
  // [RNNordicDfu setCentralManagerGetter:^() {
  //   return [BleManager getCentralManager];
  // }];

  // Reset manager delegate since the Nordic DFU lib "steals" control over it
  // [RNNordicDfu setOnDFUComplete:^() {
  //   NSLog(@"onDFUComplete");
  //   CBCentralManager * manager = [BleManager getCentralManager];
  //   manager.delegate = [BleManager getInstance];
  // }];

  // [RNNordicDfu setOnDFUError:^() {
  //   NSLog(@"onDFUError");
  //   CBCentralManager * manager = [BleManager getCentralManager];
  //   manager.delegate = [BleManager getInstance];
  // }];

  self.moduleName = @"Pumpables";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  bool didFinish=[super application:application didFinishLaunchingWithOptions:launchOptions];
  
  [RNSplashScreen show];
  return didFinish;
}

- (BOOL)application:(UIApplication *)application
            openURL:(NSURL *)url
            options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {

  // Add any custom logic here.
  [RNBranch application:application openURL:url options:options];
  return true;
}

- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity
 restorationHandler:(void (^)(NSArray * _Nullable))restorationHandler
{
  [RNBranch continueUserActivity:userActivity];
  return [RCTLinkingManager application:application
                   continueUserActivity:userActivity
                     restorationHandler:restorationHandler];
}

////////////////////////////////////////////////////
//  LOCAL NOTIFICATIONS
////////////////////////////////////////////////////

- (void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification {
  // [[RNFirebaseNotifications instance] didReceiveLocalNotification:notification];
}

////////////////////////////////////////////////////
//  REMOTE NOTIFICATIONS
////////////////////////////////////////////////////

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(nonnull NSDictionary *)userInfo
fetchCompletionHandler:(nonnull void (^)(UIBackgroundFetchResult))completionHandler{
  // [[RNFirebaseNotifications instance] didReceiveRemoteNotification:userInfo fetchCompletionHandler:completionHandler];
}

- (void)application:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings {
  // [[RNFirebaseMessaging instance] didRegisterUserNotificationSettings:notificationSettings];
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response withCompletionHandler:(void (^)(void))completionHandler {
  // [[RNFirebaseMessaging instance] didReceiveRemoteNotification:response.notification.request.content.userInfo];
  // completionHandler();
}

/*

- (void)application:(UIApplication *)application didReceiveRemoteNotification:(nonnull NSDictionary *)userInfo {
  [RNFirebaseNotifications didReceiveRemoteNotification:userInfo];
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center
       willPresentNotification:(UNNotification *)notification
         withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler {
  [RNFirebaseNotifications willPresentNotification:notification withCompletionHandler:completionHandler];
}

#if defined(__IPHONE_11_0)
- (void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response
         withCompletionHandler:(void (^)(void))completionHandler
{
  [RNFirebaseNotifications didReceiveNotificationResponse:response withCompletionHandler:completionHandler];
}
#else
- (void)userNotificationCenter:(UNUserNotificationCenter *)center didReceiveNotificationResponse:(UNNotificationResponse *)response
         withCompletionHandler:(void(^)())completionHandler
{
  [RNFirebaseNotifications didReceiveNotificationResponse:response withCompletionHandler:completionHandler];
}
#endif

*/

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}
- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
