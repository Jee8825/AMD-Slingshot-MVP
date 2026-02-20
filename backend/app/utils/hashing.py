"""
Password hashing and SHA-256 utilities.
"""
from passlib.context import CryptContext
import hashlib
import json

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def compute_ledger_hash(
    scheme_name: str,
    amount: float,
    beneficiary: str | None,
    disbursed_by: str,
    description: str | None,
    prev_hash: str,
) -> str:
    """Compute SHA-256 hash for a ledger entry (blockchain-lite)."""
    payload = json.dumps(
        {
            "scheme_name": scheme_name,
            "amount": str(amount),
            "beneficiary": beneficiary or "",
            "disbursed_by": disbursed_by,
            "description": description or "",
            "prev_hash": prev_hash,
        },
        sort_keys=True,
    )
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()

def generate_ledger_hash(transaction_data: dict, prev_hash: str) -> str:
    """Generate SHA-256 hash for a dictionary of transaction data and a previous hash."""
    payload = transaction_data.copy()
    payload["prev_hash"] = prev_hash
    payload_str = json.dumps(payload, sort_keys=True, default=str)
    return hashlib.sha256(payload_str.encode("utf-8")).hexdigest()
