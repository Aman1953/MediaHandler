# 📄 Getting Started


Before proceeding, **copy the `MediaHandler.jsx` file** from this repository into your React Native project.
Once done, follow the steps below to start using this component in your project.

---

## 📁 MediaHandler – React Native File Picker & Preview Component

**MediaHandler** is a plug-and-play React Native component that allows users to select, preview, and manage different types of files from their device.

---

## 🧩 Supported File Types

- 📷 **Images** (JPG, PNG)
- 🎥 **Videos** (MP4, MOV)
- 📄 **PDF files**
- 📝 **Word documents** (.docx)
- 📊 **Excel files** (.xls, .xlsx)
- 📽️ **PowerPoint files** (.ppt, .pptx)

---

## ✨ Key Features

- Pick and preview **multiple files**
- Show **thumbnails** for images/videos
- Show **icons** for documents (PDF, Word, Excel, PowerPoint)
- Open documents in **native apps** (Google Docs, Office, etc.)
- Easily **remove files**
- Automatically **prevents duplicate uploads**

---

## ✅ Required Packages

Install these four packages:

```bash
npm install @react-native-documents/viewer
npm install @react-native-documents/picker
npm install react-native-image-picker
npm install react-native-video
```

Or using Yarn:

```bash
yarn add @react-native-documents/viewer
yarn add @react-native-documents/picker
yarn add react-native-image-picker
yarn add react-native-video
```

---

## ⚙️ Android Permissions

```bash
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />

<!-- For Android 13+ media access -->
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES"/>
<uses-permission android:name="android.permission.READ_MEDIA_VIDEO"/>
<uses-permission android:name="android.permission.READ_MEDIA_AUDIO"/>
```

---

## 💡 How It Works

- Users can pick media or documents from their device.
- Selected files appear in a horizontal scroll list.
- Tapping a file opens a full-screen preview or native document viewer.
- Files can be easily removed using the delete button.

---

## 📦 Example Usage (App.jsx)

```bash
import React, { useState } from 'react';
import { SafeAreaView, ScrollView } from 'react-native';
import MediaHandler from './MediaHandler';

const App = () => {
  const [mediaB, setMediaB] = useState([
    { uri: 'https://www.w3schools.com/images/w3schools_green.jpg' }, // Sample image
    { uri: 'https://www.w3schools.com/html/mov_bbb.mp4' }, // Sample video
  ]);

  return (
    <SafeAreaView>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <UpdateMediaPicker
          mediaFiles={mediaB}
          setMediaFiles={setMediaB}
          label="Upload Media"
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;

```

---

## ✅ Perfect For
**Any React Native app that needs easy, powerful, and multi-format file upload with previews!**

