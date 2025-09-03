# GameSpheres

GameSpheres is an online socal platform that allows users to share their favorite gaming moments with their friends and other members of various gaming communities

---

## Tech Stack
- React
- Next.js
- Firebase
- TypeScript
---
## Development
To get the app up and running locally, do the following:

### Clone the repository
In a directory of your choice, run
```bash
git clone https://github.com/SDProject2025/game-spheres.git
cd game-spheres
```

### Install dependencies
```bash
npm install
```

### Set Up Environment Variables
Create a `.env.local` file and add the following environment variables to it:
```env
NEXT_PUBLIC_CLIENT_API_KEY=your-api-key
NEXT_PUBLIC_CLIENT_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_CLIENT_PROJECT_ID=your-project-id
NEXT_PUBLIC_CLIENT_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_CLIENT_MESSAGE_ID=your-message-id
NEXT_PUBLIC_CLIENT_APP_ID=your-app-id
NEXT_PUBLIC_CLIENT_MEASUREMENT_ID=your-measurement-id

ADMIN_PROJECT_ID=your-project-id
CLIENT_EMAIL=your-email
ADMIN_PRIVATE_KEY=your-admin-key
```
> These values can be found in your Firebase project settings

### Running the app locally
Once you have everything set up, you can run
```bash
npm run dev
```
And then in a browser of your choice, visit http://localhost:3000

---
