# Encryption in InstantMock

## Overview
InstantMock uses AES-256-GCM encryption to secure sensitive data like API keys. This document explains the encryption setup and best practices.

## Setup

1. Generate an encryption key:
```

2. The script will add an `ENCRYPTION_KEY` to your `.env` file. This key is used to encrypt/decrypt sensitive data.

## Security Considerations

- Never commit the `.env` file
- The encryption key should be at least 32 bytes (64 hex characters)
- Each encrypted value uses a unique initialization vector (IV)
- Authentication tags are stored to ensure data integrity
- Keys are never stored in plain text in the database

## Implementation Details

The encryption system uses:
- Algorithm: AES-256-GCM
- Key Size: 256 bits
- IV Size: 96 bits (12 bytes)
- Authentication: GCM mode provides built-in authentication

## Database Schema

Encrypted values are stored with:
- `encryptedKey`: The encrypted data
- `iv`: Initialization vector used for encryption
- `tag`: Authentication tag from GCM mode