# Quick MongoDB Setup Guide

## 🚨 Problem: MongoDB Server Not Running

You have MongoDB Compass installed, but the **MongoDB Server** is not installed or not running.

## ✅ Solution Options

### Option 1: Install MongoDB Server (Local) - Recommended for Development

#### Step 1: Download MongoDB Community Server
1. Go to: https://www.mongodb.com/try/download/community
2. Select:
   - **Version**: Latest (7.0 or 8.0)
   - **Platform**: Windows
   - **Package**: MSI
3. Click **Download**

#### Step 2: Install MongoDB
1. Run the downloaded `.msi` file
2. Choose **Complete** installation
3. **IMPORTANT**: Check ✅ **"Install MongoDB as a Service"**
4. Check ✅ **"Install MongoDB Compass"** (you already have it, but it's fine)
5. Click **Install**

#### Step 3: Start MongoDB Service
Open **PowerShell as Administrator** and run:
```powershell
net start MongoDB
```

#### Step 4: Verify Connection
1. Open MongoDB Compass
2. Use connection string: `mongodb://localhost:27017`
3. Click **Connect**

Your `.env` file should have:
```
MONGODB_URI=mongodb://localhost:27017/school_management
```

---

### Option 2: Use MongoDB Atlas (Cloud - FREE) - Easiest Option ⭐

This is the **fastest way** to get started - no installation needed!

#### Step 1: Create Free Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with Google/GitHub or email

#### Step 2: Create Cluster
1. Click **"Build a Database"**
2. Choose **FREE (M0)** tier
3. Select a cloud provider and region (closest to you)
4. Click **Create**

#### Step 3: Create Database User
1. Username: `admin` (or your choice)
2. Password: Create a strong password (save it!)
3. Click **Create Database User**

#### Step 4: Whitelist IP Address
1. Click **"Add My Current IP Address"**
2. Or use `0.0.0.0/0` for development (allows all IPs)
3. Click **Finish and Close**

#### Step 5: Get Connection String
1. Click **"Connect"** on your cluster
2. Choose **"Connect your application"**
3. Copy the connection string
   - It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
4. Replace `<password>` with your database user password
5. Add database name: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/school_management?retryWrites=true&w=majority`

#### Step 6: Update Your Files

**Update `.env` file:**
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/school_management?retryWrites=true&w=majority
```

**In MongoDB Compass:**
- Paste the same connection string
- Click **Connect**

---

## 🔧 Troubleshooting

### If MongoDB Service Won't Start:
```powershell
# Check if service exists
Get-Service MongoDB

# Start manually (if service exists)
net start MongoDB

# If service doesn't exist, start MongoDB manually:
# Navigate to: C:\Program Files\MongoDB\Server\7.0\bin
# Run: mongod.exe --dbpath "C:\data\db"
```

### Create Data Directory (if needed):
```powershell
New-Item -ItemType Directory -Path "C:\data\db" -Force
```

### Check if Port 27017 is in Use:
```powershell
netstat -ano | findstr :27017
```

---

## 📝 Quick Commands Reference

```powershell
# Start MongoDB Service
net start MongoDB

# Stop MongoDB Service
net stop MongoDB

# Check MongoDB Status
Get-Service MongoDB

# Test Connection
mongosh "mongodb://localhost:27017"
```

---

## 🎯 Recommended: Use MongoDB Atlas

For quick setup, I recommend **MongoDB Atlas** (Option 2) because:
- ✅ No installation needed
- ✅ Works immediately
- ✅ Free tier available
- ✅ Accessible from anywhere
- ✅ Easy to share with team

After setting up Atlas, just update your `.env` file and restart your Node.js server!

