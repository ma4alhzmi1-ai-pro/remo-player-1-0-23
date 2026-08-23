# مراجع تحكمات وسائط Android

- توثيق Expo Video يثبت أن `supportsBackgroundPlayback: true` ينشئ خدمة تشغيل أمامية في Android، وأن `showNowPlayingNotification` يحتاج هذا الإعداد: <https://docs.expo.dev/versions/latest/sdk/video/>.
- واجهة `expo-video` الرسمية في الإصدار المثبت توفر إشعار التشغيل والخلفية، لكنها لا تعرض حدثي JavaScript للتالي والسابق.
- قضية Expo المفتوحة #43538 توثق أن واجهات شاشة القفل في Expo Audio تدعم أزرار التقديم والتأخير فقط، وأن أوامر التالي والسابق تحتاج امتداداً أصلياً لربطها بطابور التطبيق: <https://github.com/expo/expo/issues/43538>.
- بناءً على ذلك، يستخدم REMO PLAYER تصحيح Android محدوداً لحزمة `expo-video` لإضافة أزرار التالي والسابق وإرسال حدثين `remoteNext` و`remotePrevious` إلى طابور الفيديو في JavaScript.
