import base64
import hashlib
import hmac
import os

try:
    import bcrypt
except ImportError:  # pragma: no cover - optional compatibility path
    bcrypt = None

PBKDF2_ALGORITHM = "sha256"
PBKDF2_ITERATIONS = 390_000
SALT_BYTES = 16
KEY_BYTES = 32


def _b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode("ascii").rstrip("=")


def _b64decode(value: str) -> bytes:
    padding = "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode(value + padding)


def hash_password(password: str) -> str:
    salt = os.urandom(SALT_BYTES)
    digest = hashlib.pbkdf2_hmac(
        PBKDF2_ALGORITHM,
        password.encode("utf-8"),
        salt,
        PBKDF2_ITERATIONS,
        dklen=KEY_BYTES,
    )
    return f"pbkdf2_{PBKDF2_ALGORITHM}${PBKDF2_ITERATIONS}${_b64encode(salt)}${_b64encode(digest)}"


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if hashed_password.startswith("$2") and bcrypt is not None:
        try:
            return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
        except ValueError:
            return False

    try:
        scheme, iterations, salt_b64, digest_b64 = hashed_password.split("$", 3)
        if scheme != f"pbkdf2_{PBKDF2_ALGORITHM}":
            return False
        expected = _b64decode(digest_b64)
        computed = hashlib.pbkdf2_hmac(
            PBKDF2_ALGORITHM,
            plain_password.encode("utf-8"),
            _b64decode(salt_b64),
            int(iterations),
            dklen=len(expected),
        )
        return hmac.compare_digest(expected, computed)
    except (ValueError, TypeError):
        return False
