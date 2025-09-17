const { query } = require('./src/config/database');
const pushNotificationService = require('./src/services/pushNotificationService');

async function testPushNotifications() {
  console.log('🔍 Testing Push Notification System...\n');

  try {
    // 1. Check if mobile_devices table exists and has data
    console.log('1️⃣ Checking mobile_devices table...');
    const devicesResult = await query(`
      SELECT md.id, md.user_id, md.device_token, md.platform, md.is_active, md.created_at,
             u.username, u.display_name
      FROM mobile_devices md
      JOIN users u ON md.user_id = u.id
      ORDER BY md.created_at DESC
      LIMIT 10
    `);

    if (devicesResult.rows.length === 0) {
      console.log('❌ No devices found in mobile_devices table');
      console.log('   This means no device tokens have been registered');
      console.log('   Check if the iOS app is calling registerDeviceToken()');
    } else {
      console.log(`✅ Found ${devicesResult.rows.length} registered devices:`);
      devicesResult.rows.forEach(device => {
        console.log(`   - User: ${device.display_name} (${device.username})`);
        console.log(`     Platform: ${device.platform}`);
        console.log(`     Token: ${device.device_token.substring(0, 20)}...`);
        console.log(`     Active: ${device.is_active}`);
        console.log(`     Registered: ${device.created_at}`);
        console.log('');
      });
    }

    // 2. Check push notification service initialization
    console.log('2️⃣ Checking push notification service...');
    console.log(`   APN Provider: ${pushNotificationService.apnProvider ? '✅ Initialized' : '❌ Not initialized'}`);
    console.log(`   FCM App: ${pushNotificationService.fcmApp ? '✅ Initialized' : '❌ Not initialized'}`);

    // 3. Test sending a notification to the first active iOS device
    if (devicesResult.rows.length > 0) {
      const iosDevice = devicesResult.rows.find(d => d.platform === 'ios' && d.is_active);
      
      if (iosDevice) {
        console.log('3️⃣ Testing notification send...');
        console.log(`   Sending test notification to: ${iosDevice.display_name}`);
        
        const testResult = await pushNotificationService.sendMessageNotification(
          iosDevice.user_id,
          'Test Sender',
          'This is a test notification from the debug script'
        );

        console.log('   Test result:', testResult);
      } else {
        console.log('3️⃣ No active iOS devices found for testing');
      }
    }

    // 4. Check recent notification logs
    console.log('4️⃣ Checking recent notification logs...');
    const logsResult = await query(`
      SELECT nl.*, u.username, u.display_name
      FROM notification_logs nl
      JOIN users u ON nl.user_id = u.id
      ORDER BY nl.created_at DESC
      LIMIT 5
    `);

    if (logsResult.rows.length === 0) {
      console.log('❌ No notification logs found');
    } else {
      console.log(`✅ Found ${logsResult.rows.length} recent notification logs:`);
      logsResult.rows.forEach(log => {
        console.log(`   - To: ${log.display_name} (${log.username})`);
        console.log(`     Title: ${log.title}`);
        console.log(`     Body: ${log.body}`);
        console.log(`     Type: ${log.type}`);
        console.log(`     Sent: ${log.created_at}`);
        console.log(`     Results: ${JSON.stringify(log.results, null, 2)}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }

  process.exit(0);
}

testPushNotifications(); 