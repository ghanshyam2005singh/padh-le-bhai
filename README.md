# 📚 Notes & Assignment Sharing Platform

A platform for students to select their college, course, semester, and subject to find and upload notes and assignments — built under **Iron Industry**.

---

## 🧩 Features (In Progress)

- ✅ College dropdown form
- ⏳ Course, Semester, Subject filtering
- ⏳ Firebase Authentication (for uploading)
- ⏳ Firebase Storage + Firestore for files
- ⏳ Upload with legal disclaimer popup
- ⏳ Responsive design for desktop & mobile
- ⏳ Navbar with contact link
- ⏳ Footer with rights notice

---

## 🛠 Tech Stack

- **Framework:** [Next.js 15 (App Router)](https://nextjs.org/)
- **Styling:** Tailwind CSS
- **Auth & Storage:** Firebase Authentication, Firebase Storage, Firestore
- **Language:** TypeScript

---

## 🚀 Getting Started

1. **Clone the repo**
   ```bash
   git clone https://github.com/your-username/notes-platform.git
   cd notes-platform
````

2. **Install dependencies**

   ```bash
   npm install
   npm install firebase googleapis
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install googleapis
npm install firebase-admin
npm install formidable

npm install --save-dev @types/formidable


   ```

3. **Run the development server**

   ```bash
   npm run dev
   ```

4. **Add your college list**
   Edit `constants/collegeList.ts`:

   ```ts
   export const collegeData = [
     { name: "ABC University" },
     { name: "XYZ College" }
     // Add more...
   ];
   ```

---

## 📌 Legal

Users who upload inappropriate or copyrighted content may face legal action under the rights of **Iron Industry**.

---

## 📬 Contact

For any issues or support, please contact: `ironindustry.support@gmail.com`

---

## 🪪 License

© 2025 Iron Industry. All rights reserved.

```

---

Let me know if you want the GitHub badges, Firebase setup guide, or deployment instructions added next!
```

## Issues
1. resources are not properly filterling and already data filled
2. implement fetching from drive
3. implement toast instead of alert
4. implement upload with legal disclaimer popup while uploading files
5. in signup page if already have account then login option and in loginn page if not have account then signup option
6. implement unqiue downloads for each file
7. user can open pdf but to download they need to create account
8. add option to upload on resource page too
9. when user uploads a file it will got a form where cllg sem subject course asked then it will get uploaded there
10. after creating account user will be redirect to upload or download page with upper corner profile icon
11. save users informations in database

## works
1. account create verify login forgot drive api firebase admin api implemented
2. pending fetching resources and uploading and a dashboard to manage the uploaded data number of download earning delete etc etc
3. drive.ts pending