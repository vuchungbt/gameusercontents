# API Documentation v3 - Mobile Game Backend

## Tổng quan
Backend API cho ứng dụng mobile game (Unity) với tính năng đăng nhập bằng Google. API sử dụng JWT token để xác thực người dùng.

**Base URL**: `https://v3.blwsmartware.net/`
**API Version**: 3.0.0
**Last Updated**: 2026-01-28

---

## Authentication Flow

### 1. Google Login Flow
```
Mobile App (Unity) → Google Sign-In SDK → Get ID Token (ưu tiên) hoặc Access Token → POST /api/auth/google → Receive JWT Token
```

### 2. Sử dụng JWT Token
Sau khi đăng nhập thành công, client sẽ nhận được JWT token. Token này phải được gửi kèm trong header của mọi request yêu cầu authentication:
```
Header: auth-token: <JWT_TOKEN>
```
**Token Expiry**: 30 days

---

## API Endpoints

### Authentication APIs

#### 1. Login với Google
Đăng nhập hoặc đăng ký user mới thông qua Google OAuth. Hỗ trợ cả `id_token` (khuyên dùng) và `access_token` (fallback).

**Endpoint**: `POST /api/auth/google`
**Authentication**: Không cần
**Request Body**:
```json
{
  "id_token": "google_id_token_from_mobile_sdk",
  "access_token": "google_access_token_from_mobile_sdk"
}
```
*Lưu ý: Chỉ cần gửi 1 trong 2 token. Ưu tiên `id_token`.*

**Response Success (200)**:
```json
{
  "status": 200,
  "user": {
    "id": "6798835e3960000000000001",
    "name": "John Doe",
    "googleId": "123456789",
    "email": "john.doe@gmail.com",
    "bestScore": 0,
    "coin": 0,
    "showAds": true,
    "hatSkin": [],
    "createdAt": "2026-01-28T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Error (400/401/500)**:
```json
{ "status": 400, "msg": "Google token is required" }
{ "status": 401, "msg": "Invalid ID Token" }
{ "status": 500, "msg": "Internal Server Error" }
```

#### 2. Lấy thông tin User hiện tại
Lấy thông tin của user đang đăng nhập.

**Endpoint**: `GET /api/auth/me`
**Authentication**: Cần (JWT Token)
**Headers**:
```
auth-token: <JWT_TOKEN>
```
**Response Success (200)**: Trả về object `user` tương tự API login.

---

### User & Game APIs

#### 3. Lấy Global Leaderboard
Lấy danh sách top 50 người chơi có điểm cao nhất toàn cầu.

**Endpoint**: `GET /api/user/leaderboard`
**Authentication**: Cần (JWT Token)
**Response Success (200)**:
```json
{
  "status": 200,
  "leaderboard": [
    {
      "rank": 1,
      "name": "Pro Gamer",
      "bestScore": 9999,
      "hatSkin": [1, 2, 5]
    },
    {
      "rank": 2,
      "name": "Noob Player",
      "bestScore": 5000,
      "hatSkin": [1]
    }
  ]
}
```

#### 4. Cập nhật Best Score
Cập nhật điểm cao nhất của user. Hệ thống chỉ cập nhật nếu điểm mới cao hơn điểm hiện tại.

**Endpoint**: `POST /api/user/updateScore`
**Authentication**: Cần (JWT Token)
**Headers**:
```
auth-token: <JWT_TOKEN>
Content-Type: application/json
```
**Request Body**:
```json
{ "bestScore": 2500 }
```
**Response Error (400)**:
```json
{ "status": 400, "msg": "bestScore is required and must be a number" }
```

#### 5. Cập nhật Coin
Cập nhật số lượng coin của user.

**Endpoint**: `POST /api/user/updateCoin`
**Authentication**: Cần (JWT Token)
**Headers**:
```
auth-token: <JWT_TOKEN>
Content-Type: application/json
```
**Request Body**:
```json
{ "coin": 1500 }
```
**Response Error (400)**:
```json
{ "status": 400, "msg": "coin is required" }
```

#### 6. Cập nhật Hat Skin (Trang phục)
Cập nhật danh sách ID các loại mũ/trang phục user đang sở hữu.

**Endpoint**: `POST /api/user/updateHatSkin`
**Authentication**: Cần (JWT Token)
**Headers**:
```
auth-token: <JWT_TOKEN>
Content-Type: application/json
```
**Request Body**:
```json
{ "hatSkin": [1, 2, 3] }
```
**Response Error (400)**:
```json
{ "status": 400, "msg": "hatSkin is required and must be an array" }
{ "status": 400, "msg": "All hatSkin items must be numbers" }
```

#### 7. Cập nhật thông tin User (tổng hợp)
Cập nhật một hoặc nhiều thông tin của user.

**Endpoint**: `POST /api/user/update`
**Authentication**: Cần (JWT Token)
**Headers**:
```
auth-token: <JWT_TOKEN>
Content-Type: application/json
```
**Request Body (optional fields)**:
```json
{
  "name": "New Name",
  "bestScore": 2000,
  "coin": 1000,
  "showAds": false,
  "hatSkin": [12, 13, 14, 15]
}
```
**Response Success (200)**: Trả về object `user` sau cập nhật.

#### 8. Toggle Show Ads
Bật/tắt hiển thị quảng cáo.

**Endpoint**: `POST /api/user/toggleAds`
**Authentication**: Cần (JWT Token)
**Headers**:
```
auth-token: <JWT_TOKEN>
```
**Response Success (200)**: Trả về object `user` với giá trị `showAds` đã được đảo.

---

## Error Handling

### HTTP Status Codes
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Internal Server Error

### Error Response Format
```json
{ "status": <HTTP_STATUS_CODE>, "msg": "<ERROR_MESSAGE>" }
```

### Common Error Messages
- "Google token is required"
- "Invalid ID Token"
- "No token, authorization denied"
- "Token is invalid"
- "User not found"
- "Update failed"

---

## Data Models

### User Object
```typescript
interface User {
  id: string;              // MongoDB ObjectId
  name: string;            // Tên người dùng
  googleId: string;        // Google User ID
  email: string;           // Email (unique)
  bestScore: number;       // Điểm cao nhất (default: 0)
  coin: number;            // Số coin (default: 0)
  showAds: boolean;        // Hiển thị quảng cáo (default: true)
  hatSkin: number[];       // Danh sách hat skin ID (default: [])
  createdAt: string;       // Ngày tạo (ISO 8601 format)
}
```

---

## Hướng dẫn tích hợp Unity (v3)

### 1. Setup Dependencies
1. **Google Sign-In Plugin**: Tải từ [GitHub](https://github.com/googlesamples/google-signin-unity).
2. **Newtonsoft.Json**: Cài đặt qua Package Manager.

### 2. API Client Full Implementation (C#)

```csharp
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Networking;
using Newtonsoft.Json;

public class APIClient : MonoBehaviour
{
    private const string BASE_URL = "https://v3.blwsmartware.net"; // Thay bằng URL thật
    private string jwtToken;
    public UserData currentUser;

    [Serializable]
    public class UserData
    {
        public string id;
        public string name;
        public string googleId;
        public string email;
        public int bestScore;
        public int coin;
        public bool showAds;
        public int[] hatSkin;
    }

    [Serializable]
    public class AuthResponse
    {
        public int status;
        public UserData user;
        public string token;
        public string msg;
    }

    // --- Authentication ---

    public void LoginWithGoogle(string idToken)
    {
        StartCoroutine(PostRequest("/api/auth/google", new { id_token = idToken }, (response) => {
            jwtToken = response.token;
            currentUser = response.user;
            PlayerPrefs.SetString("JWT_TOKEN", jwtToken);
            Debug.Log($"Login Success! Hello {currentUser.name}");
        }));
    }

    // --- Game Features ---

    public void GetLeaderboard(Action<List<UserData>> callback) 
    {
        StartCoroutine(GetRequest("/api/user/leaderboard", (json) => {
            var data = JsonConvert.DeserializeObject<Dictionary<string, object>>(json);
            var leaderboardJson = JsonConvert.SerializeObject(data["leaderboard"]);
            var leaderboard = JsonConvert.DeserializeObject<List<UserData>>(leaderboardJson);
            callback?.Invoke(leaderboard);
        }));
    }

    public void UpdateScore(int newScore)
    {
        StartCoroutine(PostRequest("/api/user/updateScore", new { bestScore = newScore }, (res) => {
            currentUser = res.user;
            Debug.Log("Score updated!");
        }));
    }

    public void UpdateCoin(int newCoin)
    {
        StartCoroutine(PostRequest("/api/user/updateCoin", new { coin = newCoin }, (res) => {
            currentUser = res.user;
            Debug.Log("Coin updated!");
        }));
    }

    // --- Helper Methods ---

    private IEnumerator PostRequest(string endpoint, object body, Action<AuthResponse> onSuccess)
    {
        string json = JsonConvert.SerializeObject(body);
        var request = new UnityWebRequest(BASE_URL + endpoint, "POST");
        byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(json);
        request.uploadHandler = new UploadHandlerRaw(bodyRaw);
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("Content-Type", "application/json");
        
        if (!string.IsNullOrEmpty(jwtToken))
            request.SetRequestHeader("auth-token", jwtToken);

        yield return request.SendWebRequest();

        if (request.result == UnityWebRequest.Result.Success)
        {
            var res = JsonConvert.DeserializeObject<AuthResponse>(request.downloadHandler.text);
            if (res.status == 200) onSuccess?.Invoke(res);
            else Debug.LogError("API Error: " + res.msg);
        }
        else Debug.LogError("Network Error: " + request.error);
    }

    private IEnumerator GetRequest(string endpoint, Action<string> onSuccess)
    {
        var request = UnityWebRequest.Get(BASE_URL + endpoint);
        if (!string.IsNullOrEmpty(jwtToken))
            request.SetRequestHeader("auth-token", jwtToken);

        yield return request.SendWebRequest();

        if (request.result == UnityWebRequest.Result.Success)
            onSuccess?.Invoke(request.downloadHandler.text);
        else Debug.LogError("Network Error: " + request.error);
    }
}
```

### 3. Cách sử dụng trong Game
```csharp
// 1. Login
string idToken = GoogleSignIn.DefaultInstance.CurrentUser.IdToken;
apiClient.LoginWithGoogle(idToken);

// 2. Cập nhật điểm khi chết
apiClient.UpdateScore(1500);

// 3. Lấy bảng xếp hạng
apiClient.GetLeaderboard((list) => {
    foreach(var user in list) {
        Debug.Log($"{user.name} - {user.bestScore}");
    }
});
```

---

## Testing (cURL)

### 1. Login với Google bằng ID Token
```bash
curl -X POST https://v3.blwsmartware.net/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"id_token": "YOUR_GOOGLE_ID_TOKEN"}'
```

### 2. Lấy thông tin User
```bash
curl -X GET https://v3.blwsmartware.net/api/auth/me \
  -H "auth-token: YOUR_JWT_TOKEN"
```

### 3. Cập nhật Score
```bash
curl -X POST https://v3.blwsmartware.net/api/user/updateScore \
  -H "auth-token: YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bestScore": 1500}'
```
