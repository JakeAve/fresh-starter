export default {
    "index": "/",
    "greet": {
        name: (name: string) => `/greet/${name}`
    },
    "signup": {
        "index": "/signup"
    },
    "api": {
        "validate": {
            "password": "/api/validate/password",
            "handle": "/api/validate/handle",
            "email": {
                "index": "/api/validate/email"
            }
        },
        "auth": {
            "verify-authentication": "/api/auth/verify-authentication",
            "login": "/api/auth/login",
            "generate-authentication-options": "/api/auth/generate-authentication-options",
            "logout": "/api/auth/logout"
        },
        "user": {
            "passkey": {
                "register-request": "/api/user/passkey/register-request",
                "edit": "/api/user/passkey/edit",
                "verify-registration": "/api/user/passkey/verify-registration",
                "delete": "/api/user/passkey/delete"
            },
            "index": "/api/user"
        }
    },
    "account": {
        "index": "/account"
    },
    "login": {
        "index": "/login"
    }
}