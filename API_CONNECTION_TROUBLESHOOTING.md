# API Connection Troubleshooting Guide

## ✅ API Server Status

**Current Status**: ✅ Running
- **Port**: 3001
- **Process ID**: 25996
- **Health Check**: http://localhost:3001/api/health

---

## 🧪 Quick Tests

### 1. Test API Health
```bash
curl http://localhost:3001/api/health
```

**Expected Response**:
```json
{"status":"ok","timestamp":"2025-11-12T...","environment":"dev"}
```

### 2. Test Root Endpoint
```bash
curl http://localhost:3001/
```

**Expected Response**: API documentation with available endpoints

### 3. Test News Endpoint
```bash
curl http://localhost:3001/api/news
```

**Expected Response**: Array of news articles

---

## 🔍 If Getting "Connection Refused"

### Check 1: Is API Server Running?
```bash
# Windows
netstat -ano | findstr :3001

# Expected: Should show LISTENING on port 3001
```

If not running:
```bash
cd api
node server.js
```

### Check 2: Frontend API URL Configuration

**File**: `src/config/api.js`

```javascript
baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api'
```

✅ This is correct for local development

### Check 3: CORS Configuration

**File**: `api/.env`

```env
CORS_ORIGIN=http://localhost:3036
```

✅ This allows your frontend on port 3036 to access the API

### Check 4: Firewall/Antivirus

Sometimes Windows Firewall or antivirus blocks localhost connections:

1. Check Windows Firewall settings
2. Temporarily disable antivirus to test
3. Add Node.js to firewall exceptions

---

## 🔄 Restart Both Servers

### Stop Everything
```bash
# Kill all node processes (Windows)
taskkill /F /IM node.exe

# Or find specific process
netstat -ano | findstr :3001
taskkill /F /PID <process_id>
```

### Start API Server
```bash
cd api
node server.js
```

**Wait for**:
```
✅ Secrets loaded successfully
🚀 Server running on http://localhost:3001
```

### Start Frontend
```bash
# In separate terminal
npm start
```

**Wait for**:
```
Compiled successfully!
You can now view anmc-digital in the browser.
Local: http://localhost:3036
```

---

## 🌐 Test from Browser

### 1. Open Browser Developer Tools (F12)

### 2. Go to Network Tab

### 3. Navigate to your app at http://localhost:3036

### 4. Check for API calls:
- Look for calls to `localhost:3001`
- Check status codes (should be 200)
- Look for any errors

### Common Issues:

**CORS Error**:
```
Access to fetch at 'http://localhost:3001/api/news' from origin
'http://localhost:3036' has been blocked by CORS policy
```

**Solution**: Check `api/.env` has correct `CORS_ORIGIN`

**Connection Refused**:
```
net::ERR_CONNECTION_REFUSED
```

**Solution**: API server not running, start it

**404 Not Found**:
```
GET http://localhost:3001/api/news 404
```

**Solution**: Check API endpoint exists

---

## 📊 Current Configuration

### API Server
- **URL**: http://localhost:3001
- **Port**: 3001
- **CORS**: Allows http://localhost:3036
- **Secrets**: Loaded from AWS Secrets Manager ✅
- **Environment**: development

### Frontend
- **URL**: http://localhost:3036
- **Port**: 3036
- **API URL**: http://localhost:3001/api
- **Environment**: development

---

## 🐛 Debug Mode

### Enable Verbose Logging

**API Server** (`api/server.js`):
```javascript
// Already has morgan logging in development
```

**Frontend**: Open browser console (F12)

### Check API Logs
```bash
cd api
# If running in background, check log file
cat server.log | tail -n 50

# Or run in foreground to see live logs
node server.js
```

---

## ✅ Success Indicators

When everything is working:

1. **API Server Console**:
   ```
   ✅ Secrets loaded successfully
   🚀 Server running on http://localhost:3001
   ```

2. **API Health Check**:
   ```bash
   curl http://localhost:3001/api/health
   # Returns: {"status":"ok",...}
   ```

3. **Frontend Console**: No CORS or connection errors

4. **Network Tab**: API calls return 200 status

---

## 🆘 Still Having Issues?

### Detailed Diagnostics

```bash
# Check what's using port 3001
netstat -ano | findstr :3001

# Check what's using port 3036
netstat -ano | findstr :3036

# Test API from command line
curl -v http://localhost:3001/api/health

# Check if secrets are loaded
curl http://localhost:3001/api/health
# Should show environment: "dev"
```

### Common Solutions

1. **Restart both servers**
2. **Clear browser cache** (Ctrl+Shift+Delete)
3. **Try incognito/private mode**
4. **Check no VPN is blocking localhost**
5. **Verify Node.js version** (should be 14+)

---

## 📝 Quick Reference

### Start API
```bash
cd api
node server.js
```

### Start Frontend
```bash
npm start
```

### Test API
```bash
curl http://localhost:3001/api/health
```

### Check Logs
```bash
cd api
cat server.log
```

---

**Last Updated**: January 12, 2025
**API Status**: ✅ Running on port 3001
**Frontend Port**: 3036
