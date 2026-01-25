# API Documentation - Mobile Game Backend

## Tổng quan

Backend API cho ứng dụng mobile game với tính năng đăng nhập bằng Google. API sử dụng JWT token để xác thực người dùng.

**Base URL**: `https://api-v2.blwsmartware.net`

**API Version**: 1.0.1

---

## Authentication Flow

### 1. Google Login Flow

```
Mobile App → Google Sign-In SDK → Get Access Token → POST /api/auth/google → Receive JWT Token
```

### 2. Sử dụng JWT Token

Sau khi đăng nhập thành công, client sẽ nhận được JWT token. Token này phải được gửi kèm trong header của mọi request yêu cầu authentication:

```
Header: auth-token: <JWT_TOKEN>
```

**Token Expiry**: 100 days (8640000 seconds)

---

## API Endpoints

### Authentication APIs

#### 1. Login với Google

Đăng nhập hoặc đăng ký user mới thông qua Google OAuth.

**Endpoint**: `POST /api/auth/google`

**Authentication**: Không cần

**Request Body**:
```json
{
  "access_token": "google_access_token_from_mobile_sdk"
}
```

**Response Success (200)**:
```json
{
  "status": 200,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "googleId": "123456789",
    "email": "john.doe@gmail.com",
    "bestScore": 0,
    "coin": 0,
    "showAds": true,
    "hatSkin": [],
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response Error (400)**:
```json
{
  "status": 400,
  "msg": "Access token is required"
}
```

**Response Error (401)**:
```json
{
  "status": 401,
  "msg": "Auth failed - Invalid token"
}
```

**Lưu ý**:
- Nếu user chưa tồn tại, hệ thống sẽ tự động tạo user mới
- Nếu user đã tồn tại (theo googleId hoặc email), hệ thống sẽ cập nhật thông tin và trả về user hiện có
- Token JWT sẽ được trả về trong response, cần lưu trữ để sử dụng cho các request sau

---

#### 2. Lấy thông tin User hiện tại

Lấy thông tin của user đang đăng nhập.

**Endpoint**: `GET /api/auth/me`

**Authentication**: Cần (JWT Token)

**Headers**:
```
auth-token: <JWT_TOKEN>
```

**Response Success (200)**:
```json
{
  "status": 200,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "googleId": "123456789",
    "email": "john.doe@gmail.com",
    "bestScore": 1500,
    "coin": 500,
    "showAds": true,
    "hatSkin": [12, 13, 15],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response Error (401)**:
```json
{
  "status": 401,
  "msg": "No token, authorization denied"
}
```

**Response Error (404)**:
```json
{
  "status": 404,
  "msg": "User not found"
}
```

---

### User Management APIs

#### 3. Lấy thông tin User

Lấy thông tin đầy đủ của user (tương tự `/api/auth/me`).

**Endpoint**: `GET /api/user`

**Authentication**: Cần (JWT Token)

**Headers**:
```
auth-token: <JWT_TOKEN>
```

**Response**: Tương tự như `GET /api/auth/me`

---

#### 4. Cập nhật thông tin User

Cập nhật một hoặc nhiều thông tin của user.

**Endpoint**: `POST /api/user/update`

**Authentication**: Cần (JWT Token)

**Headers**:
```
auth-token: <JWT_TOKEN>
Content-Type: application/json
```

**Request Body** (tất cả fields đều optional):
```json
{
  "name": "New Name",
  "bestScore": 2000,
  "coin": 1000,
  "showAds": false,
  "hatSkin": [12, 13, 14, 15]
}
```

**Response Success (200)**:
```json
{
  "status": 200,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "New Name",
    "googleId": "123456789",
    "email": "john.doe@gmail.com",
    "bestScore": 2000,
    "coin": 1000,
    "showAds": false,
    "hatSkin": [12, 13, 14, 15],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response Error (400)**:
```json
{
  "status": 400,
  "msg": "Update failed"
}
```

**Lưu ý**: Chỉ các field được gửi trong request body mới được cập nhật, các field khác giữ nguyên.

---

#### 5. Cập nhật Best Score

Cập nhật điểm cao nhất của user. Chỉ cập nhật nếu điểm mới cao hơn điểm hiện tại.

**Endpoint**: `POST /api/user/updateScore`

**Authentication**: Cần (JWT Token)

**Headers**:
```
auth-token: <JWT_TOKEN>
Content-Type: application/json
```

**Request Body**:
```json
{
  "bestScore": 2500
}
```

**Response Success (200)**:
```json
{
  "status": 200,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "googleId": "123456789",
    "email": "john.doe@gmail.com",
    "bestScore": 2500,
    "coin": 500,
    "showAds": true,
    "hatSkin": [12, 13],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response Error (400)**:
```json
{
  "status": 400,
  "msg": "bestScore is required and must be a number"
}
```

**Lưu ý**: 
- Nếu điểm mới thấp hơn hoặc bằng điểm hiện tại, hệ thống sẽ không cập nhật nhưng vẫn trả về user với điểm hiện tại
- Chỉ cập nhật khi điểm mới > điểm hiện tại

---

#### 6. Cập nhật Coin

Cập nhật số coin của user.

**Endpoint**: `POST /api/user/updateCoin`

**Authentication**: Cần (JWT Token)

**Headers**:
```
auth-token: <JWT_TOKEN>
Content-Type: application/json
```

**Request Body**:
```json
{
  "coin": 1500
}
```

**Lưu ý**: Coin có thể gửi dưới dạng number hoặc string (sẽ được tự động convert sang number).

**Response Success (200)**:
```json
{
  "status": 200,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "googleId": "123456789",
    "email": "john.doe@gmail.com",
    "bestScore": 2000,
    "coin": 1500,
    "showAds": true,
    "hatSkin": [12, 13],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response Error (400)**:
```json
{
  "status": 400,
  "msg": "coin is required"
}
```

**Lưu ý**: Coin được lưu dưới dạng Number. Có thể gửi number hoặc string (sẽ được tự động convert).

---

#### 7. Cập nhật Hat Skin

Cập nhật danh sách hat skin mà user sở hữu.

**Endpoint**: `POST /api/user/updateHatSkin`

**Authentication**: Cần (JWT Token)

**Headers**:
```
auth-token: <JWT_TOKEN>
Content-Type: application/json
```

**Request Body**:
```json
{
  "hatSkin": [12, 13, 14, 15, 20]
}
```

**Response Success (200)**:
```json
{
  "status": 200,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "googleId": "123456789",
    "email": "john.doe@gmail.com",
    "bestScore": 2000,
    "coin": 500,
    "showAds": true,
    "hatSkin": [12, 13, 14, 15, 20],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Response Error (400)**:
```json
{
  "status": 400,
  "msg": "hatSkin is required and must be an array"
}
```

hoặc

```json
{
  "status": 400,
  "msg": "All hatSkin items must be numbers"
}
```

**Lưu ý**: 
- `hatSkin` phải là một mảng các số
- Có thể gửi mảng rỗng `[]` để xóa tất cả hat skin

---

#### 8. Toggle Show Ads

Bật/tắt hiển thị quảng cáo.

**Endpoint**: `POST /api/user/toggleAds`

**Authentication**: Cần (JWT Token)

**Headers**:
```
auth-token: <JWT_TOKEN>
```

**Request Body**: Không cần

**Response Success (200)**:
```json
{
  "status": 200,
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "googleId": "123456789",
    "email": "john.doe@gmail.com",
    "bestScore": 2000,
    "coin": 500,
    "showAds": false,
    "hatSkin": [12, 13],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Lưu ý**: Endpoint này sẽ đảo ngược giá trị hiện tại của `showAds` (true → false, false → true).

---

## Error Handling

### HTTP Status Codes

- **200**: Success
- **400**: Bad Request - Dữ liệu request không hợp lệ
- **401**: Unauthorized - Token không hợp lệ hoặc thiếu token
- **404**: Not Found - Không tìm thấy resource
- **500**: Internal Server Error - Lỗi server

### Error Response Format

Tất cả các lỗi đều trả về format:

```json
{
  "status": <HTTP_STATUS_CODE>,
  "msg": "<ERROR_MESSAGE>"
}
```

### Common Error Messages

- `"Access token is required"` - Thiếu access token từ Google
- `"Auth failed - Invalid token"` - Token Google không hợp lệ
- `"No token, authorization denied"` - Thiếu JWT token trong header
- `"Token is invalid"` - JWT token không hợp lệ hoặc đã hết hạn
- `"User not found"` - Không tìm thấy user
- `"Update failed"` - Cập nhật thất bại

---

## Data Models

### User Object

```typescript
interface User {
  id: string;              // MongoDB ObjectId
  name: string;            // Tên người dùng
  googleId: string;        // Google User ID
  email: string;           // Email (unique)
  bestScore: number;      // Điểm cao nhất (default: 0)
  coin: number;           // Số coin (default: 0)
  showAds: boolean;       // Hiển thị quảng cáo (default: true)
  hatSkin: number[];      // Danh sách hat skin ID (default: [])
  createdAt: string;      // Ngày tạo (ISO 8601 format)
}
```

---

## Implementation Guide cho Mobile Client

### 1. Setup Google Sign-In

#### Android (Kotlin/Java)

```kotlin
// Add dependency in build.gradle
implementation 'com.google.android.gms:play-services-auth:20.7.0'

// Configure Google Sign-In
val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
    .requestEmail()
    .requestIdToken("YOUR_WEB_CLIENT_ID")
    .build()

val googleSignInClient = GoogleSignIn.getClient(this, gso)

// Sign in
val signInIntent = googleSignInClient.signInIntent
startActivityForResult(signInIntent, RC_SIGN_IN)

// Get access token
val account = GoogleSignIn.getLastSignedInAccount(this)
val idToken = account?.idToken
```

#### iOS (Swift)

```swift
// Add GoogleSignIn pod
pod 'GoogleSignIn'

// Import
import GoogleSignIn

// Configure
GIDSignIn.sharedInstance.configuration = GIDConfiguration(clientID: "YOUR_CLIENT_ID")

// Sign in
GIDSignIn.sharedInstance.signIn(withPresenting: self) { result, error in
    guard let result = result else { return }
    let accessToken = result.user.accessToken.tokenString
    // Send to backend
}
```

#### Unity (C#)

##### Setup Google Sign-In Plugin

1. **Cài đặt Google Sign-In Plugin cho Unity**:
   - Tải [Google Sign-In Plugin](https://github.com/googlesamples/google-signin-unity) hoặc sử dụng Unity Package Manager
   - Import package vào Unity project

2. **Cấu hình Google Sign-In**:
   - Vào `Assets > Google Sign-In > Settings`
   - Nhập Web Client ID từ Google Cloud Console

##### Implementation Code

```csharp
using System;
using System.Collections;
using UnityEngine;
using UnityEngine.Networking;
using Newtonsoft.Json;

public class APIClient : MonoBehaviour
{
    private const string BASE_URL = "https://api-v2.blwsmartware.net";
    private string jwtToken;
    private UserData currentUser;

    // User Data Model
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
        public string createdAt;
    }

    // API Response Model
    [Serializable]
    public class AuthResponse
    {
        public int status;
        public UserData user;
        public string token;
        public string msg;
    }

    // Login với Google
    public void LoginWithGoogle(string googleAccessToken)
    {
        StartCoroutine(LoginWithGoogleCoroutine(googleAccessToken));
    }

    private IEnumerator LoginWithGoogleCoroutine(string accessToken)
    {
        string url = $"{BASE_URL}/api/auth/google";
        
        // Create request body
        var requestBody = new
        {
            access_token = accessToken
        };
        string jsonBody = JsonConvert.SerializeObject(requestBody);

        using (UnityWebRequest request = new UnityWebRequest(url, "POST"))
        {
            byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonBody);
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");

            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                string responseText = request.downloadHandler.text;
                AuthResponse response = JsonConvert.DeserializeObject<AuthResponse>(responseText);

                if (response.status == 200)
                {
                    jwtToken = response.token;
                    currentUser = response.user;
                    
                    // Lưu token vào PlayerPrefs
                    PlayerPrefs.SetString("jwt_token", jwtToken);
                    PlayerPrefs.SetString("user_data", JsonConvert.SerializeObject(currentUser));
                    PlayerPrefs.Save();

                    Debug.Log("Login successful!");
                    OnLoginSuccess?.Invoke(currentUser);
                }
                else
                {
                    Debug.LogError($"Login failed: {response.msg}");
                    OnLoginError?.Invoke(response.msg);
                }
            }
            else
            {
                Debug.LogError($"Network error: {request.error}");
                OnLoginError?.Invoke(request.error);
            }
        }
    }

    // Lấy thông tin User
    public void GetUserInfo()
    {
        StartCoroutine(GetUserInfoCoroutine());
    }

    private IEnumerator GetUserInfoCoroutine()
    {
        // Load token từ PlayerPrefs nếu chưa có
        if (string.IsNullOrEmpty(jwtToken))
        {
            jwtToken = PlayerPrefs.GetString("jwt_token");
        }

        if (string.IsNullOrEmpty(jwtToken))
        {
            Debug.LogError("No JWT token found. Please login first.");
            yield break;
        }

        string url = $"{BASE_URL}/api/auth/me";

        using (UnityWebRequest request = UnityWebRequest.Get(url))
        {
            request.SetRequestHeader("auth-token", jwtToken);

            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                string responseText = request.downloadHandler.text;
                AuthResponse response = JsonConvert.DeserializeObject<AuthResponse>(responseText);

                if (response.status == 200)
                {
                    currentUser = response.user;
                    OnGetUserSuccess?.Invoke(currentUser);
                }
                else
                {
                    Debug.LogError($"Get user failed: {response.msg}");
                    OnGetUserError?.Invoke(response.msg);
                }
            }
            else
            {
                Debug.LogError($"Network error: {request.error}");
                OnGetUserError?.Invoke(request.error);
            }
        }
    }

    // Cập nhật Best Score
    public void UpdateBestScore(int score)
    {
        StartCoroutine(UpdateBestScoreCoroutine(score));
    }

    private IEnumerator UpdateBestScoreCoroutine(int score)
    {
        if (string.IsNullOrEmpty(jwtToken))
        {
            jwtToken = PlayerPrefs.GetString("jwt_token");
        }

        if (string.IsNullOrEmpty(jwtToken))
        {
            Debug.LogError("No JWT token found. Please login first.");
            yield break;
        }

        string url = $"{BASE_URL}/api/user/updateScore";

        var requestBody = new
        {
            bestScore = score
        };
        string jsonBody = JsonConvert.SerializeObject(requestBody);

        using (UnityWebRequest request = new UnityWebRequest(url, "POST"))
        {
            byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonBody);
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");
            request.SetRequestHeader("auth-token", jwtToken);

            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                string responseText = request.downloadHandler.text;
                AuthResponse response = JsonConvert.DeserializeObject<AuthResponse>(responseText);

                if (response.status == 200)
                {
                    currentUser = response.user;
                    OnUpdateScoreSuccess?.Invoke(currentUser);
                }
                else
                {
                    Debug.LogError($"Update score failed: {response.msg}");
                    OnUpdateScoreError?.Invoke(response.msg);
                }
            }
            else
            {
                Debug.LogError($"Network error: {request.error}");
                OnUpdateScoreError?.Invoke(request.error);
            }
        }
    }

    // Cập nhật Coin
    public void UpdateCoin(int coin)
    {
        StartCoroutine(UpdateCoinCoroutine(coin));
    }

    private IEnumerator UpdateCoinCoroutine(int coin)
    {
        if (string.IsNullOrEmpty(jwtToken))
        {
            jwtToken = PlayerPrefs.GetString("jwt_token");
        }

        if (string.IsNullOrEmpty(jwtToken))
        {
            Debug.LogError("No JWT token found. Please login first.");
            yield break;
        }

        string url = $"{BASE_URL}/api/user/updateCoin";

        var requestBody = new
        {
            coin = coin
        };
        string jsonBody = JsonConvert.SerializeObject(requestBody);

        using (UnityWebRequest request = new UnityWebRequest(url, "POST"))
        {
            byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonBody);
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");
            request.SetRequestHeader("auth-token", jwtToken);

            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                string responseText = request.downloadHandler.text;
                AuthResponse response = JsonConvert.DeserializeObject<AuthResponse>(responseText);

                if (response.status == 200)
                {
                    currentUser = response.user;
                    OnUpdateCoinSuccess?.Invoke(currentUser);
                }
                else
                {
                    Debug.LogError($"Update coin failed: {response.msg}");
                    OnUpdateCoinError?.Invoke(response.msg);
                }
            }
            else
            {
                Debug.LogError($"Network error: {request.error}");
                OnUpdateCoinError?.Invoke(request.error);
            }
        }
    }

    // Cập nhật Hat Skin
    public void UpdateHatSkin(int[] hatSkins)
    {
        StartCoroutine(UpdateHatSkinCoroutine(hatSkins));
    }

    private IEnumerator UpdateHatSkinCoroutine(int[] hatSkins)
    {
        if (string.IsNullOrEmpty(jwtToken))
        {
            jwtToken = PlayerPrefs.GetString("jwt_token");
        }

        if (string.IsNullOrEmpty(jwtToken))
        {
            Debug.LogError("No JWT token found. Please login first.");
            yield break;
        }

        string url = $"{BASE_URL}/api/user/updateHatSkin";

        var requestBody = new
        {
            hatSkin = hatSkins
        };
        string jsonBody = JsonConvert.SerializeObject(requestBody);

        using (UnityWebRequest request = new UnityWebRequest(url, "POST"))
        {
            byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonBody);
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");
            request.SetRequestHeader("auth-token", jwtToken);

            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                string responseText = request.downloadHandler.text;
                AuthResponse response = JsonConvert.DeserializeObject<AuthResponse>(responseText);

                if (response.status == 200)
                {
                    currentUser = response.user;
                    OnUpdateHatSkinSuccess?.Invoke(currentUser);
                }
                else
                {
                    Debug.LogError($"Update hat skin failed: {response.msg}");
                    OnUpdateHatSkinError?.Invoke(response.msg);
                }
            }
            else
            {
                Debug.LogError($"Network error: {request.error}");
                OnUpdateHatSkinError?.Invoke(request.error);
            }
        }
    }

    // Toggle Show Ads
    public void ToggleAds()
    {
        StartCoroutine(ToggleAdsCoroutine());
    }

    private IEnumerator ToggleAdsCoroutine()
    {
        if (string.IsNullOrEmpty(jwtToken))
        {
            jwtToken = PlayerPrefs.GetString("jwt_token");
        }

        if (string.IsNullOrEmpty(jwtToken))
        {
            Debug.LogError("No JWT token found. Please login first.");
            yield break;
        }

        string url = $"{BASE_URL}/api/user/toggleAds";

        using (UnityWebRequest request = new UnityWebRequest(url, "POST"))
        {
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("auth-token", jwtToken);

            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                string responseText = request.downloadHandler.text;
                AuthResponse response = JsonConvert.DeserializeObject<AuthResponse>(responseText);

                if (response.status == 200)
                {
                    currentUser = response.user;
                    OnToggleAdsSuccess?.Invoke(currentUser);
                }
                else
                {
                    Debug.LogError($"Toggle ads failed: {response.msg}");
                    OnToggleAdsError?.Invoke(response.msg);
                }
            }
            else
            {
                Debug.LogError($"Network error: {request.error}");
                OnToggleAdsError?.Invoke(request.error);
            }
        }
    }

    // Cập nhật thông tin User (general update)
    public void UpdateUser(string name = null, int? bestScore = null, int? coin = null, bool? showAds = null, int[] hatSkin = null)
    {
        StartCoroutine(UpdateUserCoroutine(name, bestScore, coin, showAds, hatSkin));
    }

    private IEnumerator UpdateUserCoroutine(string name, int? bestScore, int? coin, bool? showAds, int[] hatSkin)
    {
        if (string.IsNullOrEmpty(jwtToken))
        {
            jwtToken = PlayerPrefs.GetString("jwt_token");
        }

        if (string.IsNullOrEmpty(jwtToken))
        {
            Debug.LogError("No JWT token found. Please login first.");
            yield break;
        }

        string url = $"{BASE_URL}/api/user/update";

        var requestBody = new System.Dynamic.ExpandoObject() as IDictionary<string, object>;
        if (name != null) requestBody["name"] = name;
        if (bestScore.HasValue) requestBody["bestScore"] = bestScore.Value;
        if (coin.HasValue) requestBody["coin"] = coin.Value;
        if (showAds.HasValue) requestBody["showAds"] = showAds.Value;
        if (hatSkin != null) requestBody["hatSkin"] = hatSkin;

        string jsonBody = JsonConvert.SerializeObject(requestBody);

        using (UnityWebRequest request = new UnityWebRequest(url, "POST"))
        {
            byte[] bodyRaw = System.Text.Encoding.UTF8.GetBytes(jsonBody);
            request.uploadHandler = new UploadHandlerRaw(bodyRaw);
            request.downloadHandler = new DownloadHandlerBuffer();
            request.SetRequestHeader("Content-Type", "application/json");
            request.SetRequestHeader("auth-token", jwtToken);

            yield return request.SendWebRequest();

            if (request.result == UnityWebRequest.Result.Success)
            {
                string responseText = request.downloadHandler.text;
                AuthResponse response = JsonConvert.DeserializeObject<AuthResponse>(responseText);

                if (response.status == 200)
                {
                    currentUser = response.user;
                    OnUpdateUserSuccess?.Invoke(currentUser);
                }
                else
                {
                    Debug.LogError($"Update user failed: {response.msg}");
                    OnUpdateUserError?.Invoke(response.msg);
                }
            }
            else
            {
                Debug.LogError($"Network error: {request.error}");
                OnUpdateUserError?.Invoke(request.error);
            }
        }
    }

    // Events/Callbacks
    public event Action<UserData> OnLoginSuccess;
    public event Action<string> OnLoginError;
    public event Action<UserData> OnGetUserSuccess;
    public event Action<string> OnGetUserError;
    public event Action<UserData> OnUpdateScoreSuccess;
    public event Action<string> OnUpdateScoreError;
    public event Action<UserData> OnUpdateCoinSuccess;
    public event Action<string> OnUpdateCoinError;
    public event Action<UserData> OnUpdateHatSkinSuccess;
    public event Action<string> OnUpdateHatSkinError;
    public event Action<UserData> OnToggleAdsSuccess;
    public event Action<string> OnToggleAdsError;
    public event Action<UserData> OnUpdateUserSuccess;
    public event Action<string> OnUpdateUserError;
}
```

##### Sử dụng trong Unity

```csharp
public class GameManager : MonoBehaviour
{
    public APIClient apiClient;

    void Start()
    {
        // Subscribe to events
        apiClient.OnLoginSuccess += OnLoginSuccess;
        apiClient.OnLoginError += OnLoginError;
        apiClient.OnUpdateScoreSuccess += OnScoreUpdated;
    }

    // Login với Google
    public void Login()
    {
        // Lấy Google access token từ Google Sign-In plugin
        string googleToken = GetGoogleAccessToken(); // Implement this method
        apiClient.LoginWithGoogle(googleToken);
    }

    private void OnLoginSuccess(UserData user)
    {
        Debug.Log($"Logged in as: {user.name}");
        Debug.Log($"Best Score: {user.bestScore}");
        Debug.Log($"Coins: {user.coin}");
    }

    private void OnLoginError(string error)
    {
        Debug.LogError($"Login failed: {error}");
    }

    // Cập nhật score sau khi game kết thúc
    public void GameOver(int finalScore)
    {
        apiClient.UpdateBestScore(finalScore);
    }

    private void OnScoreUpdated(UserData user)
    {
        Debug.Log($"New best score: {user.bestScore}");
    }

    // Cập nhật coin khi mua item
    public void PurchaseItem(int itemCost)
    {
        int newCoin = apiClient.currentUser.coin - itemCost;
        apiClient.UpdateCoin(newCoin);
    }
}
```

##### Dependencies cần thiết

1. **Newtonsoft.Json**: 
   - Cài đặt qua Unity Package Manager
   - Hoặc tải từ [NuGet for Unity](https://github.com/GlitchEnzo/NuGetForUnity)

2. **Google Sign-In Plugin**:
   - Tải từ [Google Sign-In Unity Plugin](https://github.com/googlesamples/google-signin-unity)

##### Lưu ý quan trọng

1. **PlayerPrefs Security**: 
   - PlayerPrefs không an toàn cho production
   - Nên sử dụng Unity Cloud Save hoặc secure storage solution

2. **Error Handling**:
   - Luôn kiểm tra network connection trước khi gọi API
   - Xử lý timeout và retry logic

3. **Threading**:
   - UnityWebRequest chạy trên main thread
   - Sử dụng coroutines để tránh block UI

4. **Token Management**:
   - Kiểm tra token expiry
   - Implement auto-logout khi token hết hạn

### 2. API Client Implementation

#### Example: Login với Google

```javascript
// JavaScript/TypeScript (React Native)
async function loginWithGoogle(accessToken) {
  try {
    const response = await fetch('https://v2.blwsmartware.net/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        access_token: accessToken
      })
    });
    
    const data = await response.json();
    
    if (data.status === 200) {
      // Lưu token và user info
      await AsyncStorage.setItem('jwt_token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } else {
      throw new Error(data.msg);
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}
```

#### Example: Lấy thông tin User

```javascript
async function getUserInfo() {
  try {
    const token = await AsyncStorage.getItem('jwt_token');
    
    const response = await fetch('https://v2.blwsmartware.net/api/auth/me', {
      method: 'GET',
      headers: {
        'auth-token': token
      }
    });
    
    const data = await response.json();
    
    if (data.status === 200) {
      return data.user;
    } else {
      throw new Error(data.msg);
    }
  } catch (error) {
    console.error('Get user error:', error);
    throw error;
  }
}
```

#### Example: Cập nhật Best Score

```javascript
async function updateBestScore(score) {
  try {
    const token = await AsyncStorage.getItem('jwt_token');
    
    const response = await fetch('https://v2.blwsmartware.net/api/user/updateScore', {
      method: 'POST',
      headers: {
        'auth-token': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bestScore: score
      })
    });
    
    const data = await response.json();
    
    if (data.status === 200) {
      return data.user;
    } else {
      throw new Error(data.msg);
    }
  } catch (error) {
    console.error('Update score error:', error);
    throw error;
  }
}
```

### 3. Token Management

- **Lưu trữ**: Lưu JWT token an toàn (Keychain trên iOS, Keystore trên Android)
- **Refresh**: Token có thời hạn 100 ngày, nếu hết hạn cần đăng nhập lại
- **Validation**: Luôn kiểm tra token trước khi gọi API
- **Error Handling**: Nếu nhận 401, xóa token và yêu cầu đăng nhập lại

### 4. Best Practices

1. **Error Handling**: Luôn xử lý các trường hợp lỗi (network, server, validation)
2. **Loading States**: Hiển thị loading indicator khi gọi API
3. **Offline Support**: Cache user data để sử dụng khi offline
4. **Token Refresh**: Kiểm tra token expiry và refresh khi cần
5. **Security**: Không log token ra console trong production
6. **Retry Logic**: Implement retry cho các request quan trọng

---

## Testing

### Test với cURL

#### 1. Login với Google
```bash
curl -X POST https://v2.blwsmartware.net/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"access_token": "YOUR_GOOGLE_ACCESS_TOKEN"}'
```

#### 2. Lấy thông tin User
```bash
curl -X GET https://v2.blwsmartware.net/api/auth/me \
  -H "auth-token: YOUR_JWT_TOKEN"
```

#### 3. Cập nhật Score
```bash
curl -X POST https://v2.blwsmartware.net/api/user/updateScore \
  -H "auth-token: YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bestScore": 1500}'
```
**Version**: 1.0.1  
**Last Updated**: Jan - 2026

