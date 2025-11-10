# APK Download Directory

## Instructions

1. Build your Flutter app:
```powershell
cd "E:\aminoss photography\flutter-app"
flutter build apk --release
```

2. Find the built APK at:
```
flutter-app/build/app/outputs/flutter-apk/app-release.apk
```

3. Copy the APK to this directory and rename it:
```powershell
Copy-Item "E:\aminoss photography\flutter-app\build\app\outputs\flutter-apk\app-release.apk" -Destination "E:\aminoss photography\public\downloads\aminoss-photography.apk"
```

4. Deploy to Vercel:
```powershell
cd "E:\aminoss photography"
vercel --prod
```

5. Your app will be downloadable at:
```
https://yoursite.com/downloads/aminoss-photography.apk
```

## APK Details
- Size: ~15-20 MB
- Package: com.aminoss.photography
- Min Android: 5.0 (API 21)
- Target Android: 14 (API 34)
