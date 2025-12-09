package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	_ "modernc.org/sqlite"
)

type User struct {
	ID       int64  `json:"id"`
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password,omitempty"`
}

type Credentials struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type Claims struct {
	UserID int64  `json:"user_id"`
	Name   string `json:"name"`
	Email  string `json:"email"`
	jwt.RegisteredClaims
}

func main() {
	_ = godotenv.Load()
	port := getenv("PORT", "8080")
	dbPath := getenv("DATABASE_PATH", "./data/app.db")
	jwtSecret := getenv("JWT_SECRET", "dev-secret")

	if err := os.MkdirAll("data", 0755); err != nil {
		log.Fatalf("failed to create data dir: %v", err)
	}

	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		log.Fatalf("db open: %v", err)
	}
	defer db.Close()

	if err := migrate(db); err != nil {
		log.Fatalf("migrate: %v", err)
	}

	mux := http.NewServeMux()
	mux.HandleFunc("POST /register", func(w http.ResponseWriter, r *http.Request) {
		var u User
		if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
			http.Error(w, "invalid body", http.StatusBadRequest)
			return
		}
		if u.Name == "" || u.Email == "" || u.Password == "" {
			http.Error(w, "missing fields", http.StatusBadRequest)
			return
		}
		if _, err := db.Exec(`INSERT INTO users(name,email,password) VALUES(?,?,?)`, u.Name, strings.ToLower(u.Email), u.Password); err != nil {
			http.Error(w, "email exists or db error", http.StatusConflict)
			return
		}
		w.WriteHeader(http.StatusCreated)
	})

	mux.HandleFunc("POST /login", func(w http.ResponseWriter, r *http.Request) {
		var cred Credentials
		if err := json.NewDecoder(r.Body).Decode(&cred); err != nil {
			http.Error(w, "invalid body", http.StatusBadRequest)
			return
		}
		var u User
		err := db.QueryRow(`SELECT id,name,email,password FROM users WHERE email = ?`, strings.ToLower(cred.Email)).
			Scan(&u.ID, &u.Name, &u.Email, &u.Password)
		if err != nil || u.Password != cred.Password {
			http.Error(w, "invalid credentials", http.StatusUnauthorized)
			return
		}
		tokenStr, err := signToken(jwtSecret, u)
		if err != nil {
			http.Error(w, "token error", http.StatusInternalServerError)
			return
		}
		json.NewEncoder(w).Encode(map[string]string{"token": tokenStr, "name": u.Name})
	})

	mux.HandleFunc("GET /me", func(w http.ResponseWriter, r *http.Request) {
		user, ok := authenticate(r, jwtSecret)
		if !ok {
			http.Error(w, "unauthorized", http.StatusUnauthorized)
			return
		}
		json.NewEncoder(w).Encode(user)
	})

	log.Printf("listening on :%s", port)
	log.Fatal(http.ListenAndServe(":"+port, withCORS(mux)))
}

func migrate(db *sql.DB) error {
	_, err := db.Exec(`CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`)
	return err
}

func signToken(secret string, u User) (string, error) {
	claims := Claims{
		UserID: u.ID,
		Name:   u.Name,
		Email:  u.Email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func authenticate(r *http.Request, secret string) (Claims, bool) {
	auth := r.Header.Get("Authorization")
	if !strings.HasPrefix(strings.ToLower(auth), "bearer ") {
		return Claims{}, false
	}
	tokenStr := strings.TrimSpace(auth[7:])
	token, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(t *jwt.Token) (interface{}, error) {
		return []byte(secret), nil
	})
	if err != nil || !token.Valid {
		return Claims{}, false
	}
	claims, ok := token.Claims.(*Claims)
	return *claims, ok
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

// withCORS adds permissive CORS headers so the Next.js frontend can call the API.
func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
