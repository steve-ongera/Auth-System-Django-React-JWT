# Auth System — Django + React (JWT)

A minimal, real authentication system: signup with hashed passwords, JWT
login (access + refresh), automatic token refresh, and a protected route
on both the API and the frontend.

## Stack

- **Backend:** Django 5, Django REST Framework, `djangorestframework-simplejwt`
- **Frontend:** React 18 (Vite), React Router, Axios, Bootstrap Icons

## Project layout

```
auth-system/
├── backend/
│   ├── config/          # settings.py, urls.py, wsgi.py
│   ├── api/             # models.py, serializers.py, views.py, urls.py
│   ├── manage.py
│   └── requirements.txt
└── frontend/
    ├── index.html
    ├── src/
    │   ├── main.jsx, App.jsx
    │   ├── services/api.js       # axios instance + token refresh logic
    │   ├── context/AuthContext.jsx
    │   ├── components/           # Navbar, PrivateRoute
    │   ├── pages/                # Login, Register, Dashboard, Home
    │   └── styles/main.css
    └── package.json
```

## Backend setup

```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                                # edit SECRET_KEY etc.
python manage.py migrate
python manage.py createsuperuser                     # optional, for /admin/
python manage.py runserver
```

API runs at `http://127.0.0.1:8000`.

### Endpoints

| Method | Endpoint                      | Auth required | Description                          |
|--------|--------------------------------|:--:|---------------------------------------|
| POST   | `/api/auth/register/`         | No | Create account (hashes password)      |
| POST   | `/api/auth/login/`            | No | Returns `access`, `refresh`, `user`   |
| POST   | `/api/auth/token/refresh/`    | No | Exchange `refresh` for a new `access` |
| POST   | `/api/auth/logout/`           | Yes | Blacklists the refresh token          |
| GET    | `/api/auth/me/`               | Yes | Returns the logged-in user's profile  |
| PATCH  | `/api/auth/me/`               | Yes | Updates the logged-in user's profile  |

Protected endpoints expect `Authorization: Bearer <access_token>`.

### How password hashing works

`RegisterSerializer.create()` never stores a raw password — it calls
Django's `user.set_password()`, which runs the password through PBKDF2
(Django's default hasher) before saving. Login goes through SimpleJWT's
`TokenObtainPairSerializer`, which calls `check_password()` — a
constant-time comparison against the stored hash, so plaintext passwords
are never compared directly or logged.

### How the JWT flow works

1. `POST /login/` returns a short-lived **access** token (15 min) and a
   longer-lived **refresh** token (7 days).
2. The frontend attaches the access token to every request as
   `Authorization: Bearer <token>`.
3. `rest_framework_simplejwt.authentication.JWTAuthentication` (configured
   in `settings.py`) verifies the token's signature and expiry on every
   request to a protected view, and populates `request.user`.
4. When an access token expires, the frontend's axios interceptor
   (`services/api.js`) automatically calls `/token/refresh/` with the
   refresh token, retries the original request, and only redirects to
   `/login` if the refresh token itself is invalid or expired.
5. Logging out blacklists the refresh token server-side (via
   `rest_framework_simplejwt.token_blacklist`) so it can't be reused.

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env      # points at the API; adjust if needed
npm run dev
```

App runs at `http://localhost:5173`.

- `/` — public landing page
- `/register` — signup form
- `/login` — login form
- `/dashboard` — **protected**; `PrivateRoute` redirects to `/login` if
  there's no valid session, and sends the user back afterward.

## Notes / production checklist

- Set a real, secret `SECRET_KEY` and `DEBUG=False` in production.
- Swap SQLite for Postgres (or similar) by changing `DATABASES` in
  `config/settings.py`.
- Consider moving tokens out of `localStorage` into an `httpOnly` cookie
  if you want protection from XSS-based token theft (this demo uses
  `localStorage` for simplicity).
- Tighten `CORS_ALLOWED_ORIGINS` to your real frontend domain.
